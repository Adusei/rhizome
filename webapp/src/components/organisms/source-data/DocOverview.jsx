import Reflux from 'reflux'
import React from 'react'
import api from 'utilities/api'

import DocOverviewActions from 'actions/DocOverviewActions'
import DocFormActions from 'actions/DocFormActions'
import DocOverviewStore from 'stores/DocOverviewStore'
import DownloadButton from 'components/button/DownloadButton'

var DocOverview = React.createClass({
  mixins: [
    Reflux.connect(DocOverviewStore)
  ],

  propTypes: {
    doc_id: React.PropTypes.number.isRequired,
    doc_tab: React.PropTypes.string.isRequired,
    loading: React.PropTypes.bool,
    doc_title: React.PropTypes.string
  },

  getDefaultProps () {
    return {
      loading: false
    }
  },

  getInitialState () {
    return {
      doc_id: null,
      doc_title: null,
      doc_detail_types: null,
      doc_deets: null,
      isRefreshing: false,
      isProcessing: false
    }
  },

  componentWillMount (nextProps, nextState) {
    this.pullDocDetails()
  },

  componentWillUpdate (nextProps, nextState) {
    if (nextProps.doc_id !== this.props.doc_id) {
      return
    }
  },

  pullDocDetails () {
    var self = this
    DocOverviewActions.getDocDetails(self.props.doc_id)
  },

  refreshMaster () {
    var self = this
    DocOverviewActions.refreshMaster({document_id: self.props.doc_id})
  },

  syncOdk () {
    var self = this
    DocOverviewActions.syncOdk({document_id: self.props.doc_id})
  },

  queueReprocess () {
    var self = this
    DocOverviewActions.queueReprocess({document_id: self.props.doc_id})
  },

  renderLoading () {
    return <div className='admin-loading'> Doc Details Loading...</div>
  },

  _download: function () {
    return api.submission.toString({'format': 'csv', 'document_id': this.props.doc_id})
  },
  _sync_data: function () {
    return api.submission.toString({'format': 'csv', 'document_id': this.props.doc_id})
  },

  render () {
    var button_row = (
      <div className='row'>
      <div className='medium-3 columns'>
      <a disabled={this.state.isRefreshing} className='button button-refresh'
       onClick={this.refreshMaster}> <i className='fa fa-refresh'></i>{ this.state.isRefreshing ? 'Refreshing' : ' Sync Data'}
      </a>
      </div>
        <div className='medium-3 columns'>
          <DownloadButton
            onClick={this._download}
            enable='true'
          text='Download Raw File'
          working='Downloading'
          cookieName='dataBrowserCsvDownload' />
        </div>
      </div>
    )

    return (
      <div className='row csv-upload__message'>
        <div className='clearfix'></div>
        {button_row}
      </div>
    )
  }
})

export default DocOverview
