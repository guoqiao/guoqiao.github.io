APP := long-screenshot

run:
	python3 -m http.server 8003

restart:
	sudo supervisorctl $@ ${APP}

tail:
	sudo supervisorctl tail -f ${APP}

