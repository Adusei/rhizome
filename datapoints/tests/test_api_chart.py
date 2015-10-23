from django.test import TestCase
from tastypie.test import ResourceTestCase
from tastypie.models import ApiKey
from django.contrib.auth.models import User
from datapoints.models import CustomDashboard, CustomChart
from source_data.models import Document
from tastypie.test import TestApiClient

import json

class ChartResourceTest(ResourceTestCase):
    def setUp(self):
        super(ChartResourceTest, self).setUp()

        # Create a user.
        self.username = 'john'
        self.password = 'pass'
        self.user = User.objects.create_user(self.username,
                                             'john@john.com', self.password)

        self.get_credentials()

        # create their api_key

    def get_credentials(self):
        result = self.api_client.client.login(username=self.username,
                                              password=self.password)
        return result

    def test_chart_create(self):
        dash = CustomDashboard.objects.create(title='test', owner_id=self.user.id)

        post_data = {'dashboard_id': dash.id, 'chart_json': json.dumps({'foo': 'bar'})}

        resp = self.api_client.post('/api/v1/custom_chart/', format='json', \
                                    data=post_data, authentication=self.get_credentials())

        response_data = self.deserialize(resp)

        self.assertHttpCreated(resp)
        self.assertEqual(post_data['dashboard_id'], response_data['dashboard_id'])
        self.assertEqual(post_data['chart_json'], response_data['chart_json'])

    def test_chart_delete(self):
        d = CustomDashboard.objects.create(owner_id=self.user.id, title='test')
        c1 = CustomChart.objects.create(dashboard_id=d.id, chart_json={'hello': 'world'})
        c2 = CustomChart.objects.create(dashboard_id=d.id, chart_json={'goodnight': 'moon'})

        delete_url = '/api/v1/custom_chart/?id=' + str(c1.id)

        self.api_client.delete(delete_url, format='json', data={},
                               authentication=self.get_credentials())

        self.assertEqual(CustomChart.objects.count(), 1)
