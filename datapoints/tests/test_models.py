from django.test import TestCase
from datapoints.models import *
from source_data.models import *


class MasterModelTestCase(TestCase):

    def __init__(self, *args, **kwargs):

        super(MasterModelTestCase, self).__init__(*args, **kwargs)

    def set_up(self):

        print 'pass'


class IndicatorTest(MasterModelTestCase):

    def test_datapoint_indicator_creation(self):

        self.set_up()

        dpi = Indicator.objects.create(
            name = 'test',
            description = 'test',
            is_reported = 0)

        self.assertTrue(isinstance,(dpi,Indicator))
        self.assertEqual(dpi.__unicode__(),dpi.name)

        print '...Done Testing Indicator Model...'


class LocationTest(MasterModelTestCase):

    def set_up(self):

        self.location_type_id = LocationType.objects.create(name='test',admin_level=0).id

    def create_location(self, name = "test", office_id=1):

        self.set_up()

        location = Location.objects.create(name = name\
            ,office_id = office_id
            ,location_type_id = self.location_type_id)

        return location

    def test_location_creation(self):

        r = self.create_location()
        self.assertTrue(isinstance,(r,Location))
        self.assertEqual(r.__unicode__(),r.name)

        print '...Done Testing location Model...'

class DataPointTest(MasterModelTestCase):

    def set_up(self):

        self.status = ProcessStatus.objects.create(
            status_text = 'test',
            status_description = 'test')

        self.user = User.objects.create(
            username='john')

        self.document = Document.objects.create(
            doc_title = 'test',
            created_by_id = self.user.id,
            guid = 'test')

    def create_datapoint(self, note="test", indicator_id=99, location_id = 99,
        campaign_id=99, value=100.01, changed_by_id = 1):

        self.set_up()

        source_submission = SourceSubmission.objects.create(
            document_id = self.document.id,
            submission_json = '',
            row_number = 1
        )

        dp = DataPoint.objects.create(
            indicator_id=indicator_id,
            location_id = location_id,
            campaign_id=campaign_id,
            value = value,
            changed_by_id=changed_by_id,
            source_submission_id = source_submission.id
            )

        return dp

    def test_datapoint_creation(self):

        dp = self.create_datapoint()
        self.assertTrue(isinstance,(dp,DataPoint))
        print '....Done Testing DataPoint Model...'

        # self.assertEqual(dp.__unicode__(),dp.value)
