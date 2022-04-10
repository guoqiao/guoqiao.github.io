# guoqiao personal website

## TLDR

run site on :1313: `hugo server`

build static files: `huge -D`

## how is site built

when push to `main` branch, `.github/workflows/gh-pages.yml` will be triggered.
It will build `main`, output to `docs` dir, and push `docs` content on `gh-pages` branch.

In GitHub -> repo -> settings, you need to specify the branch and dir.

Also, you need to disbale the default workflow in `Actions`.
