---
title: "Access Synology NAS builtin PostgreSQL from Docker Containers"
description: "Access Synology NAS builtin PostgreSQL from Docker Containers"
date: "2022-02-06"
draft: false
---

Synology NAS has builtin PostgreSQL database.

Steps:

- Edit config file to allow access from Docker Network CIDR.
- In docker-compose.yaml, add `host.docker.internal`
