APP := mini-dash

run:
	python3 -m http.server 8002

restart:
	sudo supervisorctl $@ ${APP}

tail:
	sudo supervisorctl tail -f ${APP}

