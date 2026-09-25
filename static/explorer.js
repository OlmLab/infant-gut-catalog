// Sample explorer: DuckDB-WASM over sample_metadata_wide.parquet, fully client-side.
import * as duckdb from 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm';

const CFG = window.EXPLORER_CFG;
const FIELDS = CFG.fields; // metadata fields having __confidence/__route companions
const PAGE = 100;
const SHOW_COLS = ['sample_key','study_accession','cohort_name','body_site_class','role','age_at_collection_days','delivery_mode','feeding_mode','preterm_status','antibiotic_exposure','sex','country','subject_key','t_index','n_runs'];
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/'/g, "''");
const h = s => String(s === null || s === undefined ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtV = v => (v === null || v === undefined) ? '' : (typeof v === 'bigint' ? v.toString() : (typeof v === 'number' && !Number.isInteger(v) ? (Math.round(v*1000)/1000).toString() : String(v)));

let db, conn, detReady = false, page = 0, total = 0, sortCol = 'sample_key', sortDir = 'ASC';

function setBoot(msg){ $('boot-msg').textContent = msg; }

async function init(){
  try {
    setBoot('selecting bundle…');
    const bundles = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(bundles);
    const workerUrl = URL.createObjectURL(new Blob([`importScripts("${bundle.mainWorker}");`], {type:'text/javascript'}));
    const worker = new Worker(workerUrl);
    db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING), worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);
    setBoot('fetching sample table…');
    const resp = await fetch(CFG.parquet);
    if(!resp.ok) throw new Error('fetch of parquet failed: HTTP '+resp.status);
    const buf = new Uint8Array(await resp.arrayBuffer());
    await db.registerFileBuffer('samples.parquet', buf);
    conn = await db.connect();
    await conn.query(`CREATE VIEW samples AS SELECT * FROM read_parquet('samples.parquet')`);
    $('boot').style.display = 'none'; $('exp').style.display = '';
    readUrl();
    await run();
    const sk = new URLSearchParams(location.search).get('sample');
    if (sk) showDetail(sk);
  } catch (e) {
    $('boot').innerHTML = '<b>The explorer could not start.</b> ' + h(e.message || e) + '<br>This usually means the browser blocks WebAssembly/Workers or the CDN (cdn.jsdelivr.net) is unreachable. You can still download the full table: <a href="../data/sample_metadata_wide.parquet">parquet</a> · <a href="../data/package/sample_metadata_wide.csv.gz">CSV.gz</a>.';
    console.error(e);
  }
}

function selectedStudies(){ return [...$('f-study').selectedOptions].map(o => o.value); }
function routes(){ return [...document.querySelectorAll('.rt:checked')].map(c => c.value); }

function whereClause(){
  const w = [];
  const conf = parseFloat($('f-conf').value); const rts = routes();
  const guard = f => { // apply confidence/route constraints to field f
    if (!isNaN(conf)) w.push(`"${f}__confidence" >= ${conf}`);
    if (rts.length < 4) w.push(rts.length ? `"${f}__route" IN (${rts.map(r=>`'${r}'`).join(',')})` : `FALSE`);
  };
  const q = $('f-q').value.trim().toUpperCase();
  if (q) w.push(`(sample_key = '${esc(q)}' OR secondary_sample = '${esc(q)}' OR run_accessions LIKE '%${esc(q)}%')`);
  const st = selectedStudies(); if (st.length) w.push(`study_accession IN (${st.map(s=>`'${esc(s)}'`).join(',')})`);
  if ($('f-cohort').value) w.push(`cohort_id = '${esc($('f-cohort').value)}'`);
  for (const sel of document.querySelectorAll('select[data-field]')){
    const f = sel.dataset.field, v = sel.value; if (!v) continue;
    if (v === '__has__') w.push(`"${f}" IS NOT NULL`); else w.push(`"${f}" = '${esc(v)}'`);
    if (FIELDS.includes(f)) guard(f);
  }
  const amin = $('f-age_min').value, amax = $('f-age_max').value;
  if (amin !== '') w.push(`age_at_collection_days >= ${parseFloat(amin)}`);
  if (amax !== '') w.push(`age_at_collection_days <= ${parseFloat(amax)}`);
  if ($('f-has_age').checked) w.push(`age_at_collection_days IS NOT NULL`);
  if (amin !== '' || amax !== '' || $('f-has_age').checked) guard('age_at_collection_days');
  if ($('f-no_adult').checked) w.push(`(adult_age_flag IS NULL OR adult_age_flag = FALSE)`);
  return w.length ? 'WHERE ' + w.join(' AND ') : '';
}

function writeUrl(){
  const p = new URLSearchParams();
  if ($('f-q').value.trim()) p.set('q', $('f-q').value.trim());
  const st = selectedStudies(); if (st.length) p.set('study', st.join(','));
  if ($('f-cohort').value) p.set('cohort', $('f-cohort').value);
  for (const sel of document.querySelectorAll('select[data-field]')) if (sel.value) p.set(sel.dataset.field, sel.value);
  if ($('f-age_min').value !== '') p.set('age_min', $('f-age_min').value);
  if ($('f-age_max').value !== '') p.set('age_max', $('f-age_max').value);
  if ($('f-has_age').checked) p.set('has_age', '1');
  if ($('f-no_adult').checked) p.set('no_adult', '1');
  if ($('f-conf').value !== '') p.set('conf', $('f-conf').value);
  const r = routes(); if (r.length < 4) p.set('routes', r.join(','));
  if (page) p.set('page', page+1);
  if (sortCol !== 'sample_key' || sortDir !== 'ASC') p.set('sort', sortCol + ':' + sortDir);
  const keep = new URLSearchParams(location.search).get('sample'); if (keep && $('detail').classList.contains('open')) p.set('sample', keep);
  history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p.toString() : ''));
}

function readUrl(){
  const p = new URLSearchParams(location.search);
  if (p.get('q')) $('f-q').value = p.get('q');
  if (p.get('study')) { const set = new Set(p.get('study').split(',')); for (const o of $('f-study').options) o.selected = set.has(o.value); }
  if (p.get('cohort')) $('f-cohort').value = p.get('cohort');
  for (const sel of document.querySelectorAll('select[data-field]')) { const v = p.get(sel.dataset.field); if (v) sel.value = v; }
  if (p.get('age_min')) $('f-age_min').value = p.get('age_min');
  if (p.get('age_max')) $('f-age_max').value = p.get('age_max');
  if (p.get('has_age')) $('f-has_age').checked = true;
  if (p.get('no_adult')) $('f-no_adult').checked = true;
  if (p.get('conf')) $('f-conf').value = p.get('conf');
  if (p.get('routes')) { const set = new Set(p.get('routes').split(',')); for (const c of document.querySelectorAll('.rt')) c.checked = set.has(c.value); }
  if (p.get('page')) page = Math.max(0, parseInt(p.get('page')) - 1);
  if (p.get('sort')) { const [c,d] = p.get('sort').split(':'); if (SHOW_COLS.includes(c)) { sortCol = c; sortDir = d === 'DESC' ? 'DESC' : 'ASC'; } }
}

async function run(){
  const where = whereClause();
  $('count').textContent = 'counting…';
  const c = await conn.query(`SELECT COUNT(*) AS n FROM samples ${where}`);
  total = Number(c.toArray()[0].n);
  const maxPage = Math.max(0, Math.ceil(total / PAGE) - 1); if (page > maxPage) page = maxPage;
  const r = await conn.query(`SELECT ${SHOW_COLS.map(c=>`"${c}"`).join(',')} FROM samples ${where} ORDER BY "${sortCol}" ${sortDir} NULLS LAST, sample_key LIMIT ${PAGE} OFFSET ${page*PAGE}`);
  const rows = r.toArray().map(x => x.toJSON());
  const thead = $('result-table').querySelector('thead'), tbody = $('result-table').querySelector('tbody');
  thead.innerHTML = '<tr>' + SHOW_COLS.map(c => `<th data-col="${c}" style="cursor:pointer">${c}${c===sortCol ? (sortDir==='ASC'?' ▲':' ▼') : ''}</th>`).join('') + '</tr>';
  tbody.innerHTML = rows.map(row => `<tr data-key="${h(row.sample_key)}">` + SHOW_COLS.map(c => {
    let v = fmtV(row[c]);
    if (c === 'study_accession' && v) v = `<a href="${CFG.studiesUrl}${h(v)}.html">${h(v)}</a>`; else v = h(v);
    return `<td title="${h(fmtV(row[c]))}">${v}</td>`; }).join('') + '</tr>').join('');
  $('count').textContent = total.toLocaleString() + ' samples match';
  $('pageinfo').textContent = total ? `page ${page+1} / ${maxPage+1}` : '';
  $('prev').disabled = page <= 0; $('next').disabled = page >= maxPage;
  writeUrl();
}

async function download(kind){
  const where = whereClause();
  const fname = kind === 'csv' ? 'samples_slice.csv' : 'samples_slice.parquet';
  $('dl-status').textContent = `preparing ${fname} (${total.toLocaleString()} rows)…`;
  try {
    const opts = kind === 'csv' ? `(HEADER, DELIMITER ',')` : `(FORMAT PARQUET)`;
    await conn.query(`COPY (SELECT * FROM samples ${where} ORDER BY study_accession, sample_key) TO '${fname}' ${opts}`);
    const buf = await db.copyFileToBuffer(fname);
    await db.dropFile(fname);
    const blob = new Blob([buf], {type: kind === 'csv' ? 'text/csv' : 'application/octet-stream'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    $('dl-status').textContent = `${fname}: ${(buf.length/1e6).toFixed(1)} MB`;
  } catch (e) { $('dl-status').textContent = 'download failed: ' + (e.message || e); console.error(e); }
}

async function ensureDet(){
  if (detReady) return true;
  const resp = await fetch(CFG.det); if (!resp.ok) throw new Error('HTTP ' + resp.status);
  await db.registerFileBuffer('det.parquet', new Uint8Array(await resp.arrayBuffer()));
  await conn.query(`CREATE VIEW det AS SELECT * FROM read_parquet('det.parquet')`);
  detReady = true; return true;
}

async function showDetail(key){
  const box = $('detail'), body = $('detail-body');
  box.classList.add('open'); body.innerHTML = '<p class="status">loading…</p>';
  const r = await conn.query(`SELECT * FROM samples WHERE sample_key = '${esc(key)}'`);
  const rows = r.toArray(); if (!rows.length) { body.innerHTML = `<p>No sample <b>${h(key)}</b> in the catalog.</p>`; return; }
  const s = rows[0].toJSON();
  const p = new URLSearchParams(location.search); p.set('sample', key); history.replaceState(null, '', location.pathname + '?' + p.toString());
  const runs = (s.run_accessions || '').split(';').filter(Boolean);
  let html = `<h2 style="margin-top:0">${h(s.sample_key)}</h2>
  <p class="small"><a href="${h(s.ena_sample_url)}">ENA sample</a> · study <a href="${CFG.studiesUrl}${h(s.study_accession)}.html">${h(s.study_accession)}</a> (<a href="${h(s.ena_study_url)}">ENA</a>)${s.cohort_id ? ` · cohort <a href="${CFG.cohortsUrl}${h(s.cohort_id)}.html">${h(s.cohort_name)}</a>` : ''}</p>
  <table class="tbl kv">
  <tr><td>Sample title</td><td>${h(s.sample_title)}</td></tr>
  <tr><td>Secondary accession</td><td>${h(s.secondary_sample)}</td></tr>
  <tr><td>Body-site class / role</td><td>${h(s.body_site_class)} / ${h(s.role)}${s.adult_age_flag ? ' <span class="tag">adult_age_flag</span>' : ''}${s.is_gold_heldout ? ' <span class="tag">gold held-out</span>' : ''}</td></tr>
  <tr><td>Subject / timepoint</td><td>${h(s.subject_key)} ${s.t_index != null ? `· t=${fmtV(s.t_index)} of ${fmtV(s.n_timepoints_subject)}` : ''}${s.linked_infant_subject_key ? ` · linked infant ${h(s.linked_infant_subject_key)}` : ''}</td></tr>
  <tr><td>Collection date (archive)</td><td>${h(s.collection_date)}</td></tr>
  <tr><td>Runs (${runs.length})</td><td>${runs.slice(0,40).map(x => `<a href="https://www.ebi.ac.uk/ena/browser/view/${h(x)}">${h(x)}</a>`).join(', ')}${runs.length>40 ? ` … +${runs.length-40}` : ''}</td></tr>
  <tr><td>Instrument / layout / reads</td><td>${h(s.instrument_model)} / ${h(s.library_layout)} / ${fmtV(s.read_count_total)}</td></tr>
  </table>
  <h3>Metadata fields</h3><table class="tbl"><thead><tr><th>field</th><th>value</th><th>conf.</th><th>route</th></tr></thead><tbody>`;
  for (const f of FIELDS) {
    const v = s[f]; if (v === null || v === undefined) continue;
    html += `<tr><td class="mono"><a href="../fields/index.html#${f}">${f}</a></td><td>${h(fmtV(v))}</td><td class="conf">${fmtV(s[f+'__confidence'])}</td><td><span class="tag ${h(s[f+'__route'])}">${h(s[f+'__route'])}</span></td></tr>`;
  }
  html += `</tbody></table><h3>Evidence</h3><div id="evidence" class="status">loading determinations…</div>`;
  body.innerHTML = html;
  try {
    await ensureDet();
    const d = await conn.query(`SELECT field_name, value_normalized, field_value, confidence, route, scope, evidence_source, evidence_locator, evidence_quote, parse_note, determined_by FROM det WHERE sample_key = '${esc(key)}' ORDER BY field_name`);
    const ev = d.toArray().map(x => x.toJSON());
    $('evidence').className = '';
    $('evidence').innerHTML = ev.length ? '<table class="tbl"><thead><tr><th>field</th><th>value (raw)</th><th>route/scope</th><th>source · locator</th><th>quote</th></tr></thead><tbody>' +
      ev.map(e => `<tr><td class="mono">${h(e.field_name)}</td><td>${h(fmtV(e.value_normalized))}<br><span class="small">${h(fmtV(e.field_value))}</span></td><td><span class="tag ${h(e.route)}">${h(e.route)}</span> ${h(e.scope)}<br><span class="conf">${fmtV(e.confidence)}</span></td><td class="small">${h(e.evidence_source)}<br>${h(e.evidence_locator)}${e.parse_note ? '<br><i>'+h(e.parse_note)+'</i>' : ''}</td><td class="quote">“${h(e.evidence_quote)}”</td></tr>`).join('') + '</tbody></table>'
      : '<p class="small">No determinations recorded for this sample.</p>';
  } catch (e) { $('evidence').textContent = 'could not load evidence: ' + (e.message || e); }
}

// wiring
$('apply').addEventListener('click', () => { page = 0; run(); });
$('reset').addEventListener('click', () => { history.replaceState(null, '', location.pathname); for (const el of document.querySelectorAll('.filters select, .filters input')) { if (el.type === 'checkbox') el.checked = el.classList.contains('rt'); else if (el.tagName === 'SELECT') { for (const o of el.options) o.selected = false; el.value = ''; } else el.value = ''; } page = 0; sortCol = 'sample_key'; sortDir = 'ASC'; run(); });
$('prev').addEventListener('click', () => { page = Math.max(0, page-1); run(); });
$('next').addEventListener('click', () => { page++; run(); });
$('dl-csv').addEventListener('click', () => download('csv'));
$('dl-parquet').addEventListener('click', () => download('parquet'));
$('detail-close').addEventListener('click', () => { $('detail').classList.remove('open'); const p = new URLSearchParams(location.search); p.delete('sample'); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '')); });
$('result-table').addEventListener('click', e => {
  const th = e.target.closest('th[data-col]'); if (th) { const c = th.dataset.col; if (sortCol === c) sortDir = sortDir === 'ASC' ? 'DESC' : 'ASC'; else { sortCol = c; sortDir = 'ASC'; } page = 0; run(); return; }
  if (e.target.closest('a')) return;
  const tr = e.target.closest('tr[data-key]'); if (tr) showDetail(tr.dataset.key);
});
$('f-study-filter').addEventListener('input', e => { const s = e.target.value.toLowerCase(); for (const o of $('f-study').options) o.hidden = s && !o.textContent.toLowerCase().includes(s); });
for (const el of document.querySelectorAll('.filters input[type=text], .filters input[type=number], .filters input:not([type])')) el.addEventListener('keydown', e => { if (e.key === 'Enter') { page = 0; run(); } });

init();
