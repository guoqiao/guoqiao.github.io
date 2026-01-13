#!/bin/bash

APP=mini-dash

sudo tee /etc/supervisor/conf.d/${APP}.conf <<EOF
[program:${APP}]
directory=$(pwd)
command=$(pwd)/run.sh
user=$USER
environment=HOME="$HOME",USER="$USER"
autostart=true
autorestart=true
redirect_stderr=true
EOF

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart ${APP}
sleep 5
sudo supervisorctl status
sudo supervisorctl tail ${APP}
