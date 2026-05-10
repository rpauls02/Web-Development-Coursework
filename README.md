# Web Development Coursework

A website developed for the Web Development module using the docker-compose-lamp repository.

A LAMP stack environment built using Docker Compose, with the following dependencies:

- PHP
- Apache
- MySQL
- phpMyAdmin
- Redis

## Installation

- Clone this repository on your local computer
- Configure `.env` as needed
- Run `docker compose up -d`

```shell
git clone https://github.com/YOUR_USERNAME/Web-Development-CW.git
cd Web-Development-CW/
cp sample.env .env
# modify .env as needed
docker compose up -d
# visit localhost
```

Your LAMP stack is now ready. You can access it via `http://localhost`.

## Configuration and Usage

### Configuration

This package comes with default configuration options. You can modify them by creating a `.env` file in your root directory.
To make it easy, just copy the content from `sample.env` and update the environment variable values as per your need.

### Configuration Variables

---

#### PHP

---

_**PHPVERSION**_
Is used to specify which PHP version you want to use. Defaults to the latest PHP version.

_**PHP_INI**_
Define your custom `php.ini` modifications to meet your requirements.

---

#### Apache

---

_**DOCUMENT_ROOT**_
Document root for the Apache server. The default value is `./www`. All your sites will go here and will be synced automatically.

_**APACHE_DOCUMENT_ROOT**_
Apache config file value. The default value is `/var/www/html`.

_**VHOSTS_DIR**_
For virtual hosts. The default value is `./config/vhosts`. You can place your virtual hosts conf files here.

> Make sure you add an entry to your system's `hosts` file for each virtual host.

_**APACHE_LOG_DIR**_
Used to store Apache logs. The default value is `./logs/apache2`.

---

#### Database

---

> For Apple Silicon users: please select MariaDB as the database. Oracle doesn't build MySQL containers for the ARM architecture.

_**DATABASE**_
Define which MySQL or MariaDB version you would like to use.

_**MYSQL_INITDB_DIR**_
When a container is started for the first time, files in this directory with the extensions `.sh`, `.sql`, `.sql.gz` and `.sql.xz` will be executed in alphabetical order. The default value is `./config/initdb`.

_**MYSQL_DATA_DIR**_
MySQL data directory. The default value is `./data/mysql`.

_**MYSQL_LOG_DIR**_
Used to store MySQL logs. The default value is `./logs/mysql`.

_**MYSQL_CNF**_
Define your custom `my.cnf` modifications to meet your database requirements.

**Note:** When providing a host value to your application, use `database` instead of `localhost`.

## Web Server

Apache is configured to run on port 80, accessible via `http://localhost`.

#### Apache Modules

By default the following modules are enabled:

- rewrite
- headers

#### Connect via SSH

You can connect to the web server using `docker compose exec` to perform various operations on it.

```shell
docker compose exec webserver bash
```

## PHP

The installed version of PHP depends on your `.env` file.

#### Extensions

By default the following extensions are installed (may differ for PHP versions below 7.x):

- mysqli
- pdo_sqlite
- pdo_mysql
- mbstring
- zip
- intl
- mcrypt
- curl
- json
- iconv
- xml
- xmlrpc
- gd

## phpMyAdmin

phpMyAdmin is configured to run on port 8080. Use the following default credentials:

http://localhost:8080/  
username: root  
password: tiger

## Redis

Redis runs on the default port `6379`.
