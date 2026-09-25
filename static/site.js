// Shared behaviour: external links open in a new tab; nothing else is required for the static pages.
document.addEventListener('DOMContentLoaded', () => {
  for (const a of document.querySelectorAll('a[href^="http"]')) { a.target = '_blank'; a.rel = 'noopener'; }
});
