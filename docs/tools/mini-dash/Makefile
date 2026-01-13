APP := mini-dash

run:
	bash run.sh

restart:
	sudo supervisorctl $@ ${APP}

tail:
	sudo supervisorctl tail -f ${APP}

