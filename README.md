# csv-uploader


--- TO DO --

Add Models:
  - Entity
  
  - Attribute
     [ entity-type | attribute-name | defined-entity ]


 - Link Entities
   Columns: [source string, entity type, master entity, synced ]
     - Page with "source" and "master"
     - If "master entity" is null, then the "link now" shows up

- Errors
  Columns: [ Row Number, Value, Error Message]

 - Facts ( proto Schema )
    Columns: [string] [attr-type] [old-value] [new-value]  [synced]
             [ John ] | bday | null | 11/12/87 | not-synced  
             | John @ Nytimes | start date | null | 12/11/1987 | not-synced

      -> Only show new Facts
      ->


What I need to do :
 - Prepare Demo
 - Deploy
     -> template out a yaml with secrets in the build
     -> connect to cloud sql
 - Fix Download CSV button


Demo
 - Upload Fresh File
 - Upload File with another birth day


## Manage System
  - Entities
      {entity-name | entity-type | entity-uid}
  - Attributes
      {attribute-name | entity-type | data-type}
  - Linking
      {source-string | entity-id | entity-name}
  - Column Mapping
      {source-string | entity-or-attribute | object-id}

## indicator tag insert


---
8:17 - ...




## Setting up the development environment with Docker #

Copy the base config to your .env and adjust any necessary passwords and keys
`$ cp .env-example .env`

Build and run the project
`$ docker-compose build && docker-compose up`

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
$ docker exec -it rhizome_fe_1 sh
```
