---
draft: false
date: "2022-02-06"
title: "Access Host PostgreSQL from Docker Containers"
description: "Access Host PostgreSQL from Docker Containers"
tags:
  - "Docker"
  - "Docker-Compose"
  - "PostgreSQL"
---

We can run Docker containers on Synology NAS with the "docker" package.
It's common that service in docker container needs a database, such as PostgreSQL.

You can also run database in another docker container and link them together. However, there are reasons not to do that in some senarios.:

- cpu/ram resources are limited, e.g on NAS, so you may perfer to re-use the database service.
- normally 1 database container can only connect to 1 service, you will need extra effort to allow multiple docker services to connect same database container.
- database is important, putting it in docker container will add extra knowledage requirements to manage it properly, such as backup, migration, optimizing, etc.
- although docker container is fast and light-weight, there will still be performance loss.

Here we show how you can make multiple docker containers connect to the same external PostgreSQL database on docker host machine.

## Config PostgreSQL to allow access from Docker containers

ssh to nas, make following change:

```
# sudo vim /etc/postgresql/postgresql.conf

# listen_address = "127.0.0.1"
listen_address = "0.0.0.0"
```
This will allow PostgreSQL to listen on any IP address, other than localhost only.

Now you still need to allow access from docker containers:
```
# sudo vim /etc/postgresql/pg_hba.conf

# allow connections from docker containers without checking password
host    all             postgres             172.16.0.0/12           trust
# or require password
host    all             postgres             172.16.0.0/12           md5
```

Each docker container will use a gateway IP to communicate with host machine. You can get geteway IP with:

```
docker inspect <contrainer> | grep Gateway
```

If you have multiple docker containers, you may noticed that the gateway IP varies. However, they are all in CIDR `172.16.0.0/12`, which is reserved private IP range.

Here, to simplify things for demo purpose, I just use `trust` method to allow all connections from this CIDR, with the builtin `postgres` user. Which means, on my NAS, any docker containers can connect to PostgreSQL without password. Obvious this is not secure.

To make above changes take effect, you need to restart PostgreSQL service:

```
# on NAS:
sudo su - postgres
pg_ctl -m fast restart
# or on Ubuntu:
# sudo systemctl restart postgresql
```

## Config Docker container to connect to PostgreSQL on docker host machine

Here is an example `docker-compose.yml` file for `Nextcloud`(on Ubuntu, not for NAS):

```
───────┬──────────────────────────────────────────────────────────────────────────────
       │ File: docker-compose.yaml
───────┼──────────────────────────────────────────────────────────────────────────────
   1   │ version: "3"
   2   │
   3   │ # https://github.com/nextcloud/docker#running-this-image-with-docker-compose
   4   │
   5   │ volumes:
   6   │   nextcloud:
   7   │
   8   │ services:
   9   │   nextcloud:
  10   │     image: nextcloud
  11   │     restart: always
  12   │     ports:
  13   │       - "8090:80"
  14   │     volumes:
  15   │       - nextcloud:/var/www/html
  16   │     extra_hosts:
  17   │       - "host.docker.internal:host-gateway"
  18   │     environment:
  19   │       # must provide all 4 postgres envvars
  20   │       - POSTGRES_HOST=host.docker.internal
  21   │       - POSTGRES_DB=${POSTGRES_DB}
  22   │       - POSTGRES_USER=${POSTGRES_USER}
  23   │       - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
  24   │       # redis
  25   │       - REDIS_HOST=host.docker.internal
  26   │       - REDIS_HOST_PORT=6379
  27   │       # admin user
  28   │       - NEXTCLOUD_ADMIN_USER=${ADMIN_USERNAME}
  29   │       - NEXTCLOUD_ADMIN_PASSWORD=${ADMIN_PASSWORD}
  30   │       - NEXTCLOUD_TRUSTED_DOMAINS=${NEXTCLOUD_TRUSTED_DOMAINS}
───────┴──────────────────────────────────────────────────────────────────────────────
```

Please note:

- Not only PostgreSQL, I also connect to Redis Server on docker host.
- docker-compose can read envvars form `./.env` file.

The key here is to add `host.docker.internal:host-gateway` as `extra_hosts`, and use `host.docker.internal` as domain name for docker host.

## Issue on NAS


## Summary

With this setup, you can run multiple docker containers with shared services on docker host.
This is useful for personal server, or home/office network.