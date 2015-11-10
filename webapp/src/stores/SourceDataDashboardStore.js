'use strict'

var _ = require('lodash')
var api = require('data/api')
var Reflux = require('reflux')

var SourceDataDashboardStore = Reflux.createStore({

    listenables: [require('actions/SourceDataDashboardActions')],

    init: function () {
        this.data = {
            doc_obj: null
        }
    },

    onGetDocObj: function (doc_id) {
        var self = this
        api.source_doc({id: doc_id}).then(function (response) {
            self.data.doc_obj = response.objects[0]
            self.trigger(self.data)
        })
    }
})

module.exports = SourceDataDashboardStore
