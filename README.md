# guoqiao personal website

## TLDR

run site on :1313: `hugo server`

build static files: `huge -D`

## how is site built

when push to `main` branch, `.github/workflows/gh-pages.yml` will be triggered.
It will build `main`, output to `public` dir, and push content of `public/` to `gh-pages` branch.

In GitHub -> repo -> settings, you need to specify the branch to `gh-pages` and dir to `/`.

For the dir, there are only 2 options: `/` and `docs`. They are referring to path in `gh-pages` branch, which has all built content at `/`.
So you should `/`, not `docs`, or change your pushlishDir from `public` to `docs`.

Also, you need to disbale the default workflow in `Actions`.
