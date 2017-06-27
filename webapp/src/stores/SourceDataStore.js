import api from 'utilities/api'
import Reflux from 'reflux'

var SourceDataStore = Reflux.createStore({
  listenables: [require('actions/SourceDataActions')],

  init: function () {
    var self = this
    self.data = {}

    let currentPath = window.location.pathname
    let cleanPath = currentPath.replace('/source-data/', '')
    let urlParams = cleanPath.split('/')
    let doc_tab = 'doc_index'
    let doc_id = null


    if (urlParams.length === 2) {
      doc_tab = urlParams[0],
      doc_id = urlParams[1],
      this.getDocObj(doc_id)
    }
    self.trigger(self.data)
  },

  getInitialState () {
    return {
      tableDef: this.getTableDef()
    }
    return initialState
  },

  getDocObj: function (doc_id) {
    var self = this
      api.source_doc({id: doc_id}).then(function (response) {
      self.data.doc_obj = response.objects[0]
      self.data.file_type = response.objects[0].file_type
      self.trigger(self.data)
    })
  },

  getTableDef: function () {
    var self = this

    return {
      'doc_index': {
        'data_fn': api.source_doc,
        'fields': ['id', 'doc_title','file_type', 'created_at', 'edit_link'],
        'header': ['id', 'doc_title','file_type', 'created_at', 'edit_link'],
        'search_fields': ['id', 'doc_title']
      },
      'viewraw': {
        'data_fn': api.submission,
        'fields': ['id', 'row_number','document_batch', 'data_date', 'edit_link'],
        'header': ['id', 'row_number','document_batch', 'data_date', 'edit_link'],
        'search_fields': ['id', 'row_number','document_batch', 'data_date']
      },
      'map-columns': {
        'display_name': 'Map Columns',
        'data_fn': api.docToMap,
        'fields': ['id', 'source_object_code', 'master_object_name', 'edit_link'],
        'header': ['id', 'source_object_code', 'master_object_name', 'edit_link'],
        'search_fields': [ 'source_object_code', 'master_object_name']
      },
      'link-entities': {
        'display_name': 'Link Entities',
        'data_fn': api.docLink,
        'fields': ['content_type', 'source_object_code', 'master_object_name', 'edit_link'],
        'header': ['content_type', 'source_object_code', 'master_object_name', 'edit_link'],
        'search_fields': ['content_type', 'source_object_code', 'master_object_name']
      },
      'errors': {
        'data_fn': api.docError,
        'fields': ['row_number', 'file_header', 'cell_value', 'error_msg', 'edit_link'],
        'header': ['row_number', 'file_header', 'cell_value', 'error_msg', 'edit_link'],
        'search_fields': ['row_number', 'cell_value', 'error_msg']
      },
      'facts': {
        'data_fn': api.dateDocResults,
        'fields': ['indicator__id', 'indicator__short_name', 'location__name', 'data_date', 'value'],
        'fields': ['indicator__id', 'indicator__short_name', 'location__name', 'data_date', 'value'],
        'search_fields': ['indicator_id', 'indicator__short_name', 'location__name', 'campaign__name']
      },
    }
  }
})

export default SourceDataStore
