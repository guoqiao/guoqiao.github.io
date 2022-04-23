---
date: "2022-04-23"
title: "Heroku"
description: "How to use Heroku to deploy docker app"
tags:
  - "heroku"
  - "docker"
---

## Dynos

app containers, all Heroku applications run in a collection of lightweight Linux containers called dynos.

Dyno Types are similar to machine flavor in openstack.

## Stacks

operating system images:

- Heroku-20: Ubuntu 20.04
- Heroku-18: Ubuntu 18.04
- Heroku-16: Ubuntu 16.04
- Container: Docker


## Addon

TODO

## Buildpack

TODO

## CLI

```
# install
brew tap heroku/brew && brew install heroku

heroku --version
heroku commands  # list all cmds

heroku login  # -i for 2FA, save creds to `~/.netrc`
heroku auth:logout
heroku logout  # alias
heroku auth:whoami
heroku whoami
heroku auth:token

heroku access -a $app  # list who has access to app
heroku access:add $EMAIL -a $app  #  add new user to app
heroku access:remove $EMAIL -a $app  #  add new user to app
heroku access:update $EMAIL -a $app  #  add new user to app

heroku apps --all  # list all apps
heroku apps:favorites  # list favorited apps
heroku apps:favorites:add  # favorite app
heroku apps:favorites:remove  # remove favorite app

cd mydir
heroku create  # will create app with random name
heroku apps:create [$app]

heroku apps:destroy $app
heroku apps:info -a $app
heroku apps:rename -a $app NEWNAME
heroku apps:errors -a $app  # show app errors, $app required

heroku apps:open -a $app [PATH]  # open app in browser, PATH is expected url path, e.g.: /foo

# show all available and current stack for app
heroku apps:stacks -a $app
heroku apps:stacks:set -a $app STACK  # migrate/change to new stack

# use containers to build and deploy Heroku apps ?
heroku container

# login to Heroku Container Registry
heroku container:login
heroku container:logout

heroku container:push web  # push Dockerfile to web process type ?
heroku container:push web  --arg ENV=live,HTTPS=on  # build-time vars

heroku container:run web bash  # build and run the docker image locally

heroku container:release web  # release previously pushed web process type

# pull an image from an app's process type ?
heroku container:pull web  # pull the web image from the app
heroku container:pull web:latest  # pull the web image from the app
heroku container:pull web worker  # pull both web and worker image from the app

heroku container:rm web  # destroy the web container

heroku logs --tail

heroku restart

# clone a heroku app to your local machine
heroku git:clone -a $app [DIR]
heroku git:remote -a $app  # set git remote heroku to https://git.heroku.com/$app.git
```

Example error:

```

> $ heroku apps:errors -a $app                                                                          [±main ●]
=== Errors on ⬢ phoebe-portfolio in the last 24 hours
source  name  level     desc                  count
──────  ────  ────────  ────────────────────  ─────
router  H14   critical  No web dynos running  12
```

## PORT

You can not bind your app to a fixed port.
Heroku will assign a random port to your app and expose it as envvar $PORT.
Your app need to read this port and bind to it.


Log file:

- mac: `~/Library/Caches/heroku/error.log`
- Linux: `~/.cache/heroku/error.log`

Env vars:

- `HEROKU_DEBUG=1`: show debug info
- `HEROKU_DEBUG_HEADERS=1`:  show http headers

Uninstall on Linux:

```
rm /usr/local/bin/heroku
rm -rf /usr/local/lib/heroku /usr/local/heroku
rm -rf ~/.local/share/heroku ~/.cache/heroku
```
