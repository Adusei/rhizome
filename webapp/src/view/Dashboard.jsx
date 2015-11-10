'use strict';

var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');
var page = require('page');
var moment = require('moment');

var api = require('data/api');
var dashboardInit = require('data/dashboardInit');
var builtins = require('dashboard/builtin');

var TitleMenu = require('component/TitleMenu.jsx');
var RegionTitleMenu = require('component/RegionTitleMenu');
var CampaignTitleMenu = require('component/CampaignTitleMenu.jsx');
var MenuItem = require('component/MenuItem.jsx');

var CustomDashboard = require('dashboard/CustomDashboard.jsx');

var DashboardStore = require('stores/DashboardStore');
var DataStore = require('stores/DataStore');
var GeoStore = require('stores/GeoStore');
var IndicatorStore = require('stores/IndicatorStore');
var NavigationStore = require('stores/NavigationStore');

var AppActions = require('actions/AppActions');
var DashboardActions = require('actions/DashboardActions');
var DataActions = require('actions/DataActions');
var GeoActions = require('actions/GeoActions');

var LAYOUT = {
  'Management Dashboard': require('dashboard/ManagementDashboard.jsx'),
  'NGA Campaign Monitoring': require('dashboard/NCODashboard.jsx'),
  'District Dashboard': require('dashboard/District.jsx'),
  'Source Data': require('dashboard/SourceDataDashboard.jsx'),
  'ODK Dashboard': require('dashboard/ODKDashboard.jsx'),
};

var Dashboard = React.createClass({
  mixins: [
    Reflux.ListenerMixin,
    Reflux.connect(DataStore)
  ],

  getInitialState: function () {
    return {
      locations: [],
      campaigns: [],
      allCampaigns: [],
      location: null,
      campaign: null,
      dashboard: null,
      allDashboards: []
    };
  },

  getallDashboards: function () {
    var self = this;
    api.get_dashboard().then(function (response) {
      var customDashboards = _(response.objects).sortBy('title').value();
      var allDashboards = builtins.concat(customDashboards);
      self.setState({allDashboards: allDashboards});
    });
  },

  componentWillMount: function () {
    this.getallDashboards();
    page('/datapoints/:dashboard/:location/:year/:month/:doc_tab/:doc_id', this._showSourceData);
    page('/datapoints/:dashboard/:location/:year/:month', this._show);
    page('/datapoints/:dashboard', this._showDefault);
    AppActions.init();
  },

  componentWillUpdate: function (nextProps, nextState) {
    if (!(nextState.campaign && nextState.location && nextState.dashboard)) {
      return;
    }

    var campaign = moment(nextState.campaign.start_date).format('MM/YYYY')
    var title = [
      nextState.dashboard.title,
      [nextState.location.name, campaign].join(' '),
      'RhizomeDB'
    ].join(' - ');

    if (document.title !== title) {
      document.title = title;
    }
  },

  componentDidMount: function () {
    // Reflux.ListenerMixin will unmount listeners
    this.listenTo(DashboardStore, this._onDashboardChange);
    this.listenTo(NavigationStore, this._onNavigationChange);

    this.listenTo(DashboardActions.navigate, this._navigate);

    this.listenTo(IndicatorStore, () => this.forceUpdate());
    this.listenTo(GeoStore, () => this.forceUpdate());
  },

  _onDashboardChange: function (state) {
    var fetchData = this.state.loaded;

    this.setState(state);

    if (fetchData) {
      var q = DashboardStore.getQueries();
      if (_.isEmpty(q)) {
        DataActions.clear();
      } else {
        if(state.dashboard.builtin)
          DataActions.fetch(this.state.campaign, this.state.location, q);
        else{
          DataActions.fetchForChart(this.state.campaign, this.state.location,
            this.state.allCampaigns, this.state.locations, this.state.dashboard);
        }
      }

      if (this.state.hasMap) {
        GeoActions.fetch(this.state.location);
      }
    } else if (NavigationStore.loaded) {
      page({
        click: false
      });
    }
  },

  _onNavigationChange: function (nav) {
    if (NavigationStore.loaded) {
      page({
        click: false
      });
    }
  },

  _setCampaign: function (id) {
    var campaign = _.find(this.state.campaigns, c => c.id === id);

    if (!campaign) {
      return;
    }

    this._navigate({
      campaign: moment(campaign.start_date, 'YYYY-MM-DD').format('YYYY/MM')
    });
  },

  _setlocation: function (id) {
    var location = _.find(this.state.locations, r => r.id === id)
    // console.log("_setlocation:", id, location);

    if (!location) {
      return;
    }

    this._navigate({
      location: location.name
    });
  },

  _setDashboard: function (slug) {
    this._navigate({
      dashboard: slug
    });
  },

  _getDashboard: function (slug) {
    var dashboard = _.find(this.state.allDashboards, d => _.kebabCase(d.title) === slug);

    if (dashboard.id <= 0) {
      return new Promise(resolve => {
        resolve(dashboard)
      })
    } else {
      return api.get_chart({dashboard_id: dashboard.id}, null, {'cache-control': 'no-cache'}).then(res => {
        dashboard.charts = res.objects.map(chart => {
          var result = chart.chart_json;
          result.id = chart.id;
          return result;
        })
        return dashboard
      }, function (err) {
        console.log(err);
        dashboard.charts = [];
      });
    }
  },

  _navigate: function (params) {
    var slug = _.get(params, 'dashboard', _.kebabCase(this.state.dashboard.title));
    var location = _.get(params, 'location', this.state.location.name);
    var campaign = _.get(params, 'campaign', moment(this.state.campaign.start_date, 'YYYY-MM-DD').format('YYYY/MM'));
    if (_.isNumber(location)) {
      location = _.find(this.state.locations, r => r.id === location).name;
    }

    page('/datapoints/' + [slug, location, campaign].join('/'));
  },

  _showDefault: function (ctx) {
    var self = this;

    api.get_dashboard().then(function (response) {
      var customDashboards = _(response.objects).sortBy('title').value();
      var allDashboards = builtins.concat(customDashboards);
      self.setState({allDashboards: allDashboards});
      self._getDashboard(ctx.params.dashboard).then(dashboard => {
        DashboardActions.setDashboard({
          dashboard
        });
      });
    });
  },

  _show: function (ctx) {
    NavigationStore.getDashboard(ctx.params.dashboard).then(dashboard => {
      DashboardActions.setDashboard({
        dashboard,
        location: ctx.params.location,
        date: [ctx.params.year, ctx.params.month].join('-')
      });
    })
  },

  _showSourceData: function (ctx) {
    NavigationStore.getDashboard(ctx.params.dashboard).then(dashboard => {
      var doc_tab = ctx.params.doc_tab;

      this.setState({
        doc_id: ctx.params.doc_id,
        doc_tab: doc_tab
      });

      DashboardActions.setDashboard({
        dashboard,
        location: ctx.params.location,
        date: [ctx.params.year, ctx.params.month].join('-')
      });
    })

  },

  render: function () {
    // console.log("RENDER", this.state.location);
    if (!(this.state.loaded && this.state.dashboard)) {
      var style = {
        fontSize: '2rem',
        zIndex: 9999
      };

      return (
        <div style={style} className='overlay'>
          <div>
            <div><i className='fa fa-spinner fa-spin'></i>&ensp;Loading</div>
          </div>
        </div>
      );
    }

    var {campaign, loading, location, doc_id, doc_tab} = this.state;

    var dashboardDef = this.state.dashboard;
    var dashboardName = _.get(dashboardDef, 'title', '');

    var indicators = IndicatorStore.getById.apply(
      IndicatorStore,
      _(_.get(dashboardDef, 'charts', []))
        .pluck('indicators')
        .flatten()
        .uniq()
        .value()
    );

    var data = dashboardInit(
      dashboardDef,
      this.state.data,
      location,
      campaign,
      this.state.locations,
      indicators,
      GeoStore.features
    );

    var dashboardProps = {
      campaign: campaign,
      dashboard: dashboardDef,
      data: data,
      indicators: indicators,
      loading: loading,
      location: location,
      doc_tab: doc_tab,
      doc_id: doc_id
    };

    var dashboard = React.createElement(
      _.get(LAYOUT, dashboardName, CustomDashboard),
      dashboardProps);

    var campaigns = _(this.state.campaigns)
      .filter(c => c.office_id === location.office_id)
      .map(campaign => {
        return _.assign({}, campaign, {
          slug: moment(campaign.start_date).format('MMMM YYYY')
        })
      })
      .sortBy('start_date')
      .reverse()
      .value();

    if (campaign.office_id !== location.office_id) {
      campaign = campaigns[0];
    }

    var dashboardItems = MenuItem.fromArray(
      _.map(this.state.allDashboards, d => {
        return {
          title: d.title,
          value: _.kebabCase(d.title)
        };
      }),
      this._setDashboard);

    var edit;
    if (dashboardDef.owned_by_current_user) {
      edit = (
        <span>
          <a className='menu-button fa-stack'
             href={'/datapoints/dashboards/edit/' + dashboardDef.id + '/'}>
            <i className='fa fa-stack-2x fa-circle'></i>
            <i className='fa fa-stack-1x fa-pencil'></i>
          </a>
          &emsp;
        </span>
      );
    }

    var settingFilter = '';
    if (dashboardDef.builtin === true){
      settingFilter = (<div className="row">
        <div className="medium-4 columns">
          <CampaignTitleMenu
            campaigns={campaigns}
            selected={campaign}
            sendValue={this._setCampaign}/>
        </div>
        <div className="medium-4 columns">
          <RegionTitleMenu
            locations={this.state.locations}
            selected={location}
            sendValue={this._setlocation}/>
        </div>
      </div>);
    }

    return (
      <div>
        <div classNameName='clearfix'></div>
        <form className='inline no-print search-criteria'>
          <div className='row'>
            <div className='medium-4 columns'>
              {settingFilter}
            </div>
            <div className='medium-2 columns'>
              <div>
                {edit}
                <TitleMenu text={dashboardName} icon='fa-chevron-down'>
                  {dashboardItems}
                </TitleMenu>
              </div>
            </div>
          </div>
        </form>
        {dashboard}
      </div>
    );
  }
});

module.exports = Dashboard;
