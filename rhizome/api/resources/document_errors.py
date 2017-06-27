from rhizome.api.resources.base_non_model import BaseNonModelResource

class DocErrorResource(BaseNonModelResource):
    '''
    '''

    class Meta(BaseNonModelResource.Meta):
        '''
        '''
        resource_name = 'document_error'
        GET_params_required = ['document_id']

    def get_object_list(self, request):
        # right now, this is hard coded, soon will
        # be dynamic based on the document's errors.

        return [{
            'row_number': 2,
            'document_id': 2,
            'file_header': 'is_active',
            'cell_value': 'n/a',
            'error_msg': 'Unable to Cast n/a to Boolean (t/f) value'
        }]
