import hashlib
import random
import json
import locale
import re
from collections import defaultdict
import math
from dateutil.parser import parse

from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

from pandas import read_csv
from pandas import notnull
from pandas import DataFrame
from pandas import to_datetime

from bulk_update.helper import bulk_update
from jsonfield import JSONField

from rhizome.models.location_models import Location
from rhizome.models.indicator_models import Indicator

import logging

class Document(models.Model):
    '''
    '''
    docfile = models.FileField(upload_to='documents/%Y/%m/%d', null=True)
    file_type = models.CharField(max_length=10)
    doc_title = models.TextField(unique=True)
    file_header = JSONField(null=True)
    created_by = models.ForeignKey(User, null=True)
    guid = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'source_doc'
        ordering = ('-created_at',)

    def save(self, *args, **kwargs):
        if not self.guid:
            self.guid = hashlib.sha1(str(random.random())).hexdigest()

        super(Document, self).save(*args, **kwargs)

    ###############################
    ###### TRANSFORM UPLOAD #######
    ###############################

    def transform_upload(self):

        from rhizome.models.datapoint_models import DocDataPoint, DataPoint

        self.build_csv_df()
        self.process_file()
        self.upsert_source_object_map()

    def build_csv_df(self):

        ## FIXME - pull these from document detail as the user should be
        ## allowed to set these column configurations
        # self.location_column, self.uq_id_column, self.date_column, \
        # self.lat_column, self.lon_column = \
        #     ['city', 'unique_key', 'data_date', 'latitude', 'longitude']

        raw_csv_df = read_csv(settings.MEDIA_ROOT + str(self.docfile))

        csv_df = raw_csv_df.where((notnull(raw_csv_df)), None)
        # if there is no uq id column -- make one #
        # if self.uq_id_column not in raw_csv_df.columns:
        #
        #     try:
        #         csv_df[self.uq_id_column] = csv_df[self.location_column].map(
        #             str)
        #     except Exception as err: ## FIXME # clean this
        #         if self.date_column not in csv_df.columns:
        #             error_message = '%s is a required column.' % err.message
        #             raise Exception(error_message)

        self.csv_df = csv_df
        self.file_header = csv_df.columns

        # self.meta_lookup = {
        #     'location': {},
        #     'indicator': {}
        # }
        # self.indicator_ids_to_exclude = set([-1])
        # self.existing_submission_keys = SourceSubmission.objects.filter(
        #     document_id=self.id).values_list('instance_guid', flat=True)

    def process_file(self):
        '''
        Takes a file and dumps the data into the source submission table.
        Returns a list of source_submission_ids
        '''

        # transform the raw data based on the documents configurations #
        # doc_df = self.apply_doc_config_to_csv_df(self.csv_df)
        # doc_df = self.process_date_column(doc_df)

        # doc_obj = Document.objects.get(id=self.document.id)
        # doc_obj.file_header = list(doc_df.columns.values)
        # doc_obj.save()

        batch = {}

        for i, (submission) in enumerate(self.csv_df.itertuples()):

            try:
                ss, instance_guid = self.process_raw_source_submission(submission, i)
            except Exception as err:
                raise
                # logging.warning(err.args)

            # if ss is not None and instance_guid is not None:
            ss['instance_guid'] = instance_guid
            batch[instance_guid] = ss

        object_list = [SourceSubmission(**v) for k, v in batch.iteritems()]
        ss = SourceSubmission.objects.bulk_create(object_list)
        return [x.id for x in ss]

    def upsert_source_object_map(self):
        '''
        TODO: save the source_strings so i dont have to iterate through
        the source_submission json.
        endpoint: api/v2/doc_mapping/?document=66
        '''

        if DocumentSourceObjectMap.objects\
            .filter(document_id=self.id):

            return

        source_dp_json = SourceSubmission.objects.filter(
            document_id=self.id).values_list('submission_json')

        if len(source_dp_json) == 0:
            return

        all_codes = [('indicator', k)
                     for k, v in json.loads(source_dp_json[0][0]).iteritems()]
        rg_codes, cp_codes = [], []

        for row in source_dp_json:
            row_dict = json.loads(row[0])
            # rg_codes.append(row_dict[self.location_column])

        for r in list(set(rg_codes)):
            all_codes.append(('location', r))

        doc_som_df = DataFrame(all_codes, columns=[
                               'content_type', 'source_object_code'])

        som_columns = ['id', 'source_object_code', 'master_object_id',
                       'content_type']

        existing_som_df = DataFrame(list(SourceObjectMap.objects.all()
                                         .values_list(*som_columns)), columns=som_columns)

        merged_df = doc_som_df.merge(existing_som_df, on=['content_type',
                                                          'source_object_code'], how='left')

        to_insert_df = merged_df[merged_df.isnull().any(axis=1)]

        to_insert_dict = to_insert_df.transpose().to_dict()

        to_insert_batch = [SourceObjectMap(** {
            'source_object_code': data['source_object_code'],
            'master_object_id': -1,
            'content_type': data['content_type']
        }) for ix, data in to_insert_dict.iteritems()]

        batch_result = SourceObjectMap.objects.bulk_create(to_insert_batch)

        all_som_df = DataFrame(list(SourceObjectMap.objects.all()
                                    .values_list(*som_columns)), columns=som_columns)

        # TODO some exception if number of rows not equal to rows in submission
        # #
        post_insert_som_df = doc_som_df.merge(all_som_df, on=['content_type',
                                                              'source_object_code'], how='inner')

        som_ids_for_doc = list(post_insert_som_df['id'].unique())

        dsom_to_insert = [DocumentSourceObjectMap(** {
            'document_id': self.id,
            'source_object_map_id': som_id,
        }) for som_id in som_ids_for_doc]

        dsom_batch_result = DocumentSourceObjectMap.objects.bulk_create(
            dsom_to_insert)


    def process_raw_source_submission(self, submission, row_num):

        submission_ix, submission_data = submission[0], submission[1:]

        submission_data = dict(zip(self.file_header, submission_data))
        # instance_guid = submission_data[self.uq_id_column]

        # if instance_guid == '' or instance_guid in self.existing_submission_keys:
        #     return None, None

        submission_dict = {
            'submission_json': submission_data,
            'document_id': self.id,
            'data_date': '2017-01-01', ##parse(submission_data[self.date_column]),
            'row_number': row_num,
            'instance_guid': row_num,
            'process_status': 'TO_PROCESS',
            'document_batch': 1
        }

        return submission_dict, submission_ix


    #############################
    ###### REFRESH MASTER #######
    #############################

    def refresh_master(self):

        self.db_doc_deets = self.get_document_config()

        self.sync_entity_data()


    ### BEGIN ENTITY TRANSFORM ####

    def sync_entity_data(self):
        """
        All this does, is queues up entities for linking.

        Linking is done in the source_object_map table.

        from rhizome.models.document_models import *
        d = Document.objects.get(id=3)
        d.sync_entity_data()

        """
        import logging

        ## these are the attribuets that define an entity 1-1 ...
        ## should be done in the DB and or use human intervention
        identity_map = {
            'Social Sec No': 'Person',
            'EIN': 'Organization'
        }

        # find the columns that are mapped, and their corresponding attribute IDs
        doc_map = self.get_document_meta_mappings() # {(u'indicator', u'soc-sec-no'): 3}

        header_list = self.file_header.replace('\n','').split(",")

        entity_column_lookup = {}

        # out of those columns, find those that represent the identity of an entity
        for tup, indicator_id in doc_map.iteritems():

            content_type, column_header = tup[0], tup[1]
            if content_type == 'indicator':
                mapped_ind_name = Indicator.objects.get(id=indicator_id).name
                entity_type = identity_map.get(mapped_ind_name)
                if entity_type:
                    entity_column_lookup[column_header] = entity_type


        # for each row, for the "identity" fieds, create a row in source_object_map
        # where source_object_code == cell_value, content_type = 'entity' and
        # master id is null.  Make sure not to duplicate

        submission_qs = SourceSubmission.objects.filter(document_id=self.id)

        som_entity_ids = []
        for submission in submission_qs:

            for column, entity_type in entity_column_lookup.iteritems():
                proto_entity_string = submission.submission_json[column]
                if proto_entity_string:
                    som, created = SourceObjectMap.objects.get_or_create(
                        content_type='entity',
                        source_object_code = proto_entity_string,
                        defaults={'master_object_id':-1}
                    )

                    logging.warning('CREATED: %s', created)
                    logging.warning('SOM: %s', som)
                    som_entity_ids.append(som.id)

        for som_id in som_entity_ids:
            d_som, created = DocumentSourceObjectMap.objects.get_or_create(
                document_id=self.id
                ,source_object_map_id=som_id
            )

    ### END ENTITY TRANSFORM ####

    def get_document_config(self):
        '''
        When ingesting a file the user must set the following configurtions:
            - unique_id_column
            - location_code_column
            - data_date
        The user can in addition add a number of optional configurations in order to both
        set up ingestion ( ex. odk_form_name, odk_host ) as well as enhance reporting
        of the data ( photo_column, uploaded_by_column, lat_column, lon_column )
        When the MasterRefresh object is intialized this method is called which queries
        the table containing these configurations and makes it available for use within
        this module.
        '''

        detail_types, document_details = {}, {}
        ddt_qs = DocDetailType.objects.all().values()

        for row in ddt_qs:
            detail_types[row['id']] = row['name']

        dd_qs = DocumentDetail.objects\
            .filter(document_id=self.id)\
            .values()

        for row in dd_qs:
            document_details[detail_types[row['doc_detail_type_id']]] =\
                row['doc_detail_value']

        return document_details

    def get_document_meta_mappings(self):
        '''
        Depending on the configuration of the required location and campagin column,
        query the source object map table and find the equivelant master_object_id_ids
        needed to go through the remainder of the ETL process.
        '''

        # during the DocTransform process we associate new AND existing mappings between
        # the metadata assoicated with this doucment.

        # sm_ids = DocumentSourceObjectMap.objects.filter(document_id =\
        #     self.document_id).values_list('source_object_map_id',flat=True)

        # create a tuple dict ex: {('location': "PAK") : 3 , ('location':
        # "PAK") : 3}
        source_map_dict = DataFrame(list(SourceObjectMap.objects
                         .filter(
                             master_object_id__gt=0)\
                         # id__in = sm_ids)\
                         .values_list(*['master_object_id']))
                    , columns=['master_object_id']\
                    , index=SourceObjectMap.objects.filter(master_object_id__gt=0)
                    # ,id__in = sm_ids)\
                    .values_list(*['content_type', 'source_object_code']))\


        source_map_dict = source_map_dict.to_dict()['master_object_id']

        return source_map_dict


    def process_source_submission(self, row):
        from rhizome.models.datapoint_models import DocDataPoint

        doc_dp_batch = []
        submission = row.submission_json

        for k, v in submission.iteritems():
            doc_dp = self.source_submission_cell_to_doc_datapoint(row, k, v,
                                                                  row.data_date)
            if doc_dp:
                doc_dp_batch.append(doc_dp)
        DocDataPoint.objects.filter(source_submission_id=row.id).delete()
        DocDataPoint.objects.bulk_create(doc_dp_batch)

    # helper function to sync_datapoints
    def add_unique_index(self, x):

        x['unique_index'] = str(x['location_id']) + '_' + str(
            x['indicator_id']) + '_' + str(to_datetime(x['data_date'], utc=True))

        return x


class SourceObjectMap(models.Model):
    # FIXME -> need to check what would be foreign keys
    # so region_maps are valid

    master_object_id = models.IntegerField()  # need to think about to FK this.
    master_object_name = models.CharField(max_length=255, null=True)
    source_object_code = models.CharField(max_length=255)
    content_type = models.CharField(max_length=20)
    mapped_by = models.ForeignKey(User, null=True)
    # mapped_by is only null so that i can initialize the database with #
    # mappings without a user_id created #

    class Meta:
        db_table = 'source_object_map'
        unique_together = (('content_type', 'source_object_code'))

    def save(self, **kwargs):

        if self.master_object_id == -1:
            return super(SourceObjectMap, self).save(**kwargs)


        if self.content_type == 'indicator':
            self.master_object_name = Indicator.objects\
                .get(id=self.master_object_id).short_name

        if self.content_type == 'location':
            self.master_object_name = Location.objects\
                .get(id=self.master_object_id).name

        return super(SourceObjectMap, self).save(**kwargs)

class DocumentSourceObjectMap(models.Model):

    document = models.ForeignKey(Document)
    source_object_map = models.ForeignKey(SourceObjectMap)

    class Meta:

        unique_together = (('document', 'source_object_map'))
        db_table = 'doc_object_map'


class DocDetailType(models.Model):
    '''
    '''
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'doc_detail_type'

class DocumentDetail(models.Model):
    '''
    '''

    document = models.ForeignKey(Document)
    doc_detail_type = models.ForeignKey(DocDetailType)
    doc_detail_value = models.CharField(max_length=255)

    class Meta:
        db_table = 'doc_detail'
        unique_together = (('document', 'doc_detail_type'))

class SourceSubmission(models.Model):

    document = models.ForeignKey(Document)
    document_batch = models.IntegerField()
    instance_guid = models.CharField(max_length=255)
    row_number = models.IntegerField()
    data_date = models.DateTimeField(null=True)
    submission_json = JSONField()
    created_at = models.DateTimeField(auto_now=True)
    process_status = models.CharField(max_length=25)  # should be a FK

    class Meta:
        db_table = 'source_submission'
        unique_together = (('document', 'instance_guid'))

# Exceptions #
class BadFileHeaderException(Exception):
    '''
    If a user uploads a file, and one of the column headers has a comma in it
    it makes it impossible for us to parse the data.  So when we find out that
    the length of header.split(',') is greater than first_line.split(',')
    we throw this exception
    '''
    defaultMessage = "Your Header Has Commas in it, please fix and re-upload"
    defaultCode = -2
