# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os
import urllib2
import json

from django.db.models import get_app, get_models
from django.db import models, migrations, IntegrityError, transaction
import pandas as pd

from rhizome.models.location_models import Location, LocationPolygon,\
    LocationType
from rhizome.models.document_models import Document
from rhizome.cache_meta import minify_geo_json, LocationTreeCache

from django.conf import settings

from pprint import pprint


def add_user(apps, schema_editor):
    '''
    Here, we take an excel file that has the same schema as the database
    we lookup the approriate model and bulk insert.
    We need to ingest the data itself in the same order as the excel
    sheet otherwise we will have foreign key constraint issues.
    '''

    from django.contrib.auth.models import User
    user=User.objects.create_user('demo', password='user')
    user.is_superuser=True
    user.is_staff=True
    user.save()

class Migration(migrations.Migration):

    dependencies = [
        ('rhizome', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_user),
    ]
