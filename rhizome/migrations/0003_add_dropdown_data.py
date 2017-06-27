# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os
import urllib2

from django.db.models import get_app, get_models
from django.db import models, migrations, IntegrityError, transaction

def cache_meta(apps, schema_editor):
    '''
    Here, we take an excel file that has the same schema as the database
    we lookup the approriate model and bulk insert.
    We need to ingest the data itself in the same order as the excel
    sheet otherwise we will have foreign key constraint issues.
    '''

    from rhizome.cache_meta import IndicatorCache
    ic = IndicatorCache()
    ic.main()

class Migration(migrations.Migration):

    dependencies = [
        ('rhizome', '0002_add_dummy_user'),
    ]

    operations = [
        migrations.RunPython(cache_meta),
        migrations.RunSQL(
        """
        INSERT INTO indicator_tag
        (tag_name)
        SELECT 'Entities' UNION ALL
        SELECT 'Relationships';

        INSERT INTO indicator_tag
        (tag_name, parent_tag_id)
        SELECT x.t as tag_name, t.id as parent_tag_id FROM (
          SELECT 'Person' as t, 'Entities' as parent_t UNION ALL
          SELECT 'Organization' as t, 'Entities' as parent_t UNION ALL
          SELECT 'Works For' as t, 'Relationships' as parent_t
        )x
        INNER JOIN indicator_tag t
        on x.parent_t = t.tag_name;

        INSERT INTO indicator
        (name, short_name, description, is_reported, data_format, created_at, bound_json, tag_json, source_name, resource_name)

        SELECT n,n,n,CAST(0 as bool),'string', now(),'[]','[]','',''
        FROM (
          SELECT 'First Name' as n UNION ALL
          SELECT 'Last Name' UNION ALL
          SELECT 'Social Sec No' UNION ALL
          SELECT 'EIN' UNION ALL
          SELECT 'Org Name' UNION ALL
          SELECT 'Employment Start' UNION ALL
          SELECT 'Employment Is Active'
        )x;


        INSERT INTO indicator_to_tag
        (indicator_id, indicator_tag_id)
        SELECT ind.id, tag.id
        FROM (

          SELECT 'First Name' as ind_name, 'Person' as tag_name UNION ALL
          SELECT 'Last Name', 'Person' UNION ALL
          SELECT 'Social Sec No', 'Person' UNION ALL
          SELECT 'EIN','Organization' UNION ALL
          SELECT 'Org Name' ,'Organization' UNION ALL
          SELECT 'Employment Start', 'Works For' UNION ALL
          SELECT 'Employment Is Active', 'Works For'
        ) x
        INNER JOIN indicator ind
          ON ind.name = x.ind_name
        INNER JOIN indicator_tag tag
          ON tag.tag_name = x.tag_name;
        """)
    ]
