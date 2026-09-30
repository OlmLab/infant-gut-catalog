# Microbiome Repo — site repository

The published site is https://olmlab.github.io/microbiome_repo/ . It is deployed **from GitHub Actions** (`deploy-pages.yml`) on
`site-v<package_version>` tags pushed by the pipeline (OlmLab/microbiome_repo-pipeline, `make publish-branch`); each tag's HTML
lives on its `release/<package_version>` branch. `main` holds only the workflows and the Issue templates — it carries no site
content, so a push here never changes what is published. Rollback: Actions → deploy-pages → Run workflow → ref = a previous
`site-v*` tag.
