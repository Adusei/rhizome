'use strict';

var _     = require('lodash');
var React = require('react');
var api = require('../data/api.js')
var moment = require('moment');
var page = require('page');

var AppActions          = require('actions/AppActions');
var Overview   = require('dashboard/nco/Overview.jsx');
var Breakdown  = require('dashboard/nco/Breakdown.jsx');
var ReviewPage = require('../doc-review/ReviewPage');
var TitleMenu  = require('component/TitleMenu.jsx');
var CampaignTitleMenu   = require('component/CampaignTitleMenu.jsx');
var MenuItem            = require('component/MenuItem.jsx');
var NavigationStore     = require('stores/NavigationStore');

var {
	Datascope, LocalDatascope,
	SimpleDataTable, SimpleDataTableColumn,
	Paginator, SearchBar,
	FilterPanel, FilterDateRange
	} = require('react-datascope');

var SourceDataDashboard = React.createClass({
  propTypes : {
    dashboard : React.PropTypes.object.isRequired,
    data      : React.PropTypes.object.isRequired,
    region    : React.PropTypes.object.isRequired,
    doc_id    : React.PropTypes.number.isRequired,

    loading   : React.PropTypes.bool
  },

	componentWillMount : function () {
		page('/datapoints/:dashboard/:region/:year/:month', this._show);
		page('/datapoints/:dashboard', this._showDefault);
		AppActions.init();
	},

	componentWillUpdate : function (nextProps, nextState) {
		if (!(nextState.campaign && nextState.region && nextState.dashboard)) {
      return;
    }

    var campaign = moment(nextState.campaign.start_date).format('MM/YYYY')
    var title = [
      nextState.dashboard.title,
      [nextState.region.name, campaign].join(' '),
      'RhizomeDB'
    ].join(' - ');

    if (document.title !== title) {
      document.title = title;
    }
  },
	// console.log(this.parent)
  _navigate : function (params) {
    var slug     = _.get(params, 'dashboard', _.kebabCase(this.props.dashboard.title));
    var region   = _.get(params, 'region', this.props.region.name);
    var campaign = _.get(params, 'campaign', moment(this.props.campaign.start_date, 'YYYY-MM-DD').format('YYYY/MM'));
		var doc_id = _.get(params, 'doc_id', this.state.doc_id);
		var doc_tool = _.get(params, 'doc_tool', this.state.doc_tool);

		console.log(this.state.doc_id)
		console.log(this.state.doc_tool)

    page('/datapoints/' + [slug, region, campaign].join('/') + '#' + doc_id + '/' + doc_tool);
  },
	_showDefault : function (ctx) {
	},

	_show : function (ctx) {
	},


	getInitialState : function () {
    return {
      regions      : [],
      campaigns    : [],
      region       : null,
      campaign     : null,
      dashboard    : null,
			doc_id			 : null,
			doc_tool 		 : 'overview'
    };
  },


	_setDocId : function (doc_id) {
		console.log('loading_new_document_id')
		this._navigate({ doc_id : doc_id });
		this.state.doc_id = doc_id
		return {}
	},

	_setDocTool : function (doc_tool) {
		this._navigate({ doc_tool : doc_tool });
		this.state.doc_tool = doc_tool
	},

  getDefaultProps : function () {
    return {
      loading : false
    };
  },

  render : function () {
    var loading = this.props.loading;
    const fields = {
    	map_link: {
    		title: 'Master Object Name',
    		key: 'id',
    		renderer: (id) => {
    				return MapButtonFunction(id)
    			}
    	},
    };

		try {
			var doc_id = this.state.doc_id
		}
		catch(err) {
			var doc_id = -1
		}

		const fieldNamesOnTable = ['id','region_id','campaign_id','indicator_id','value'];

    var data_fn = function(){

			return api.admin.docResults({document:doc_id})
    };

		var meta_fn = function(){
				return api.admin.DataPointMetaData()
		};

		var docItems = MenuItem.fromArray(
			_.map(NavigationStore.documents, d => {
				return {
					title : d.docfile,
					value : d.id
				};
			}),
			this._setDocId);

		var doc_tools = MenuItem.fromArray(
			_.map(['overview','mapping','validate','results','dashboard'], d => {
				return {
					title : d,
					value : d
				};
			}),
			this._setDocTool);

		var doc_tool = this.state.doc_tool

		var docName = doc_id

		var review_header =
		<div className="admin-container">
      <h1 className="admin-header"></h1>
			<div className="row">
				document_id: <TitleMenu text={docName}>
					{docItems}
				</TitleMenu>
			</div>
			<div className="row">
			<TitleMenu text={doc_tool}>
				{doc_tools}
			</TitleMenu>
			</div>
	  </div>;

		var refreshMasterUrl = '/source_data/refresh_master/' + doc_id
		var refreshMasterButton = refreshMasterUrl ?
			<div className="ufadmin-create-button">
				<a className="button" href={refreshMasterUrl}>Refresh Master</a>
			</div> : null;

		return (<div className="row">
					<div className="medium-9 columns">
			    <ReviewPage
	  			title="ToMap"
	  			getMetadata={meta_fn}
	  			getData={data_fn}
	  			fields={fields}
	  			>
	  				<Paginator />
						<SimpleDataTable>
	  					{fieldNamesOnTable.map(fieldName => {
	  						return <SimpleDataTableColumn name={fieldName} />
	  					})}
	  				</SimpleDataTable>
	  		</ReviewPage>
    	</div>
			<div className="medium-3 columns">
			{review_header}
			<h2> Document ID : {doc_id} </h2>
			{refreshMasterButton}
			</div>
		</div>);;
  }
});





module.exports = SourceDataDashboard;
