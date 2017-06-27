from tastypie import fields

from rhizome.api.resources.base_non_model import BaseNonModelResource
from rhizome.models.indicator_models import Indicator, IndicatorTag, \
    IndicatorToTag

class AllMetaResult(object):
    indicators = list()
    indicator_tags = list()
    indicators_to_tags = list()


class AllMetaResource(BaseNonModelResource):
    '''
    **GET Request** Returns all camapaigns, charts, dashboards, indicators,indicator_tags, locations and offices in the database.
        - *Required Parameters:*
            none
    '''
    indicators = fields.ListField(attribute='indicators')
    indicator_tags = fields.ListField(attribute='indicator_tags')
    indicators_to_tags = fields.ListField(attribute='indicators_to_tags')

    class Meta(BaseNonModelResource.Meta):
        object_class = AllMetaResult
        resource_name = 'all_meta'

    def get_object_list(self, request):
        print '=====\n'  * 5
        qs = []
        am_result = AllMetaResult()
        am_result.indicators = \
            list(Indicator.objects.all().values())
        am_result.indicator_tags = \
            list(IndicatorTag.objects.all().values())
        am_result.indicators_to_tags =\
            list(IndicatorToTag.objects.all().values())

        qs.append(am_result)
        return [x.__dict__ for x in qs]
