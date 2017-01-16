# Rhizome
Designed for data visualization to help eradicate polio!

Built with Python, Django, JavaScript, React, Reflux, HighCharts, and many other libraries.

## Setting up the development environment with Docker #

Download  : ["Docker for Mac"](https://docs.docker.com/engine/installation/mac/)

```
$ docker-compose build && docker-compose up
```

Or, with Docker Machine:

1. [VirtualBox](http://download.virtualbox.org/virtualbox/5.0.26/VirtualBox-5.0.26-108824-OSX.dmg)


2. Docker

Install Docker Machine and docker-compose In Mac OS X you could install via `brew` or using [Docker Toolbox](https://www.docker.com/products/docker-toolbox)

3. Node v4.3.2+ and NPM v3.10.5+

```
$ brew install docker-machine docker-compose
```
Initialize Docker environment

```
$ docker-machine create -d virtualbox dev
$ docker-machine start dev
```
Add `eval "$(docker-machine env dev)"` into .bash_profile

In Mac OS X, forward the port to host

```
$ VBoxManage controlvm dev natpf1 "django,tcp,127.0.0.1,8000,,8000"
```
<!-- Navigate to repository directory, de-comment Line.8 `ENV CHINESE_LOCAL_PIP_CONFIG="--index-url http://pypi.douban.com/simple --trusted-host pypi.douban.com"` to use Chinese pip mirror. -->

Run

```
$ docker-compose build && docker-compose up
```

Now that the app is running, find the IP of the docker machine with:

```
$ docker-machine ip dev
-> 192.168.99.100
```

and visit: http://192.168.99.100:8000/ to use the app.

## Helpful Commands


To Enter Docker Web Server Container running Django

```
$ docker exec -it rhizome_rhizome_1 bash
```

While inside the docker web instance, migrate the database and create a superuser in order to login

```
root@4d3814881439:/rhizome# ./manage.py migrate

root@4d3814881439:/rhizome# ./manage.py createsuperuser
```

While inside the docker web instance, to run the Python Tests:

```
root@4d3814881439:/rhizome# ./manage.py test --settings=rhizome.settings.test
```

To Enter Docker DB Container running Postgres

```
$ docker exec -it rhizome_db_1 psql -U postgres
```

To enter into the gulp watcher..

```
$ docker exec -it rhizome_fe_1 bash
```



If either of these commands do not work, then please ensure you have the proper `node` and `npm` versions installed.

# Serving the Django Application with Apache.

Make sure that Apache is configured to use the
[prefork MPM](https://httpd.apache.org/docs/2.4/mpm.html); the worker and event
MPMs result in incorrect responses returned for requests when multiple requests
are made to the server.

```
sudo apt-get install apache2-mpm-prefork
```

See more [here](http://codebucket.co.in/apache-prefork-mpm-configuration/)

For more information on deploying [Django][] applications, see the
[Django documentation](https://docs.djangoproject.com/en/1.8/howto/deployment/wsgi/).


# Documentation
Start here by checking out our [documentation](http://unicef.github.io/rhizome/).

# Style
For python style guide and instructions on how to configure your editor in alignment with our linter config see the [plylintrc file](https://github.com/unicef/rhizome/blob/dev/rhizome/pylintrc)


# To Do

- Put the webapp front end into the docker compose
- Get the Env stuff working
- make build faster -- use an image with pandas installed
