# csv-uploader


Document Tabs
 - view raw screen
    -> Row Number
    -> Document Batch ID
    -> view raw modal
 - Mapping Columns
    -> Select from a tree view
        - Entities
            -> Person
            -> Org
        - Attributes
            -> Entity Attributes
                - Birthday
                - Employment Start
                - Employment End

 - Entities
   Columns: [source string, entity type, master entity, synced ]
     - Page with "source" and "master"
     - If "master entity" is null, then the "link now" shows up
     -

- Errors
  Columns: [ Row Number, Value, Error Message]

 - Facts ( proto Schema )
    Columns: [string] [attr-type] [old-value] [new-value]  [synced]
             [ John ] | bday | null | 11/12/87 | not-synced  
             | John @ Nytimes | start date | null | 12/11/1987 | not-synced

      -> Only show new Facts
      ->

How to get this done:
 - Mock out all of the API calls
 - render the FE how you want it
 - start to fill in the mocks with real stuff



What i need to do :
 - Create all that stuff above
 - Prepare a Demo
 - Deploy
     -> template out a yaml with secrets in the build
     -> connect to cloud sql


Demo
 - Upload Fresh File
 - Upload File with another birth day
 -


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
