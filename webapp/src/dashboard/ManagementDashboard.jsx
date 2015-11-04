'use strict';

var _      = require('lodash');
var React  = require('react');
var moment = require('moment');

var Impact             = require('dashboard/management/Impact.jsx');
var Performance        = require('dashboard/management/Performance.jsx');
var Access             = require('dashboard/management/Access.jsx');
var SocialData         = require('dashboard/management/SocialData.jsx');
var BulletChartSection = require('./BulletChartSection.jsx');
var DonutChart   = require('component/DonutChart.jsx');

var ManagementDashboard = React.createClass({
  propTypes : {
    dashboard  : React.PropTypes.object.isRequired,
    indicators : React.PropTypes.object.isRequired,

    campaign   : React.PropTypes.object,
    data       : React.PropTypes.object,
    loading    : React.PropTypes.bool,
    location     : React.PropTypes.object,
  },

  getDefaultProps : function () {
    return {
      data    : [],
      loading : true
    };
  },

  render : function () {
    var campaign   = this.props.campaign;
    var printDate  = moment(campaign.start_date).format('MMM YYYY');
    var data       = this.props.data;
    var indicators = _.indexBy(this.props.indicators, 'id');
    var loading    = this.props.loading;
    var location     = _.get(this.props, 'location.name', '');

    var sections = _(this.props.dashboard.charts)
      .groupBy('section')
      .transform(function (result, charts, sectionName) {
        var section = {};
        _.each(charts, (c, i) => {
          section[_.camelCase(_.get(c, 'title', i))] = _.map(c.indicators, ind => indicators[ind]);
        });
        result[sectionName] = section;
      })
      .value();

    if (data.__none__.supply.length != 0) {
      _.filter(data.__none__.supply, d => {
        if (_.isEqual(d.indicator.id, 194)) {
          d.indicator.short_name = 'On-Time OPV Supply';
          if (!_.isNull(d.value)) {
            d.value = 1 - d.value;
          }
        }
      });
    }

    return (
      <div id='management-dashboard'>
        <div className='row print-only'>
          <div className='small-12 columns'>
            <h1>
              <span className='campaign'>{ printDate }</span>
              <span className='location'>{ location }</span>
            </h1>
            <h2>
              Polio<br />
              Performance<br />
              Dashboard
            </h2>
            <img src='/static/img/UNICEF.svg' className='logo'/>
          </div>
        </div>

        <div className='row'>
          <Impact data={data.impact} campaign={this.props.campaign} loading={loading} />
          <Performance data={data.performance} campaign={this.props.campaign} loading={loading} location={location}/>
        </div>

        <div className='row'>
          <div className='medium-1 columns'>
            <h3>Soc. Mob.</h3>
            <BulletChartSection data={data.__none__.flwSCapacityToPerform} campaign={campaign} indicators={sections.undefined.flwSCapacityToPerform} loading={loading} cols={1} />
          </div>

          <div className='medium-1 columns'>
            <h3>Vaccinators</h3>
            <BulletChartSection data={data.__none__.vaccinators} campaign={campaign} indicators={sections.undefined.vaccinators} loading={loading} cols={1} />
          </div>

          <div className='medium-1 columns'>
            <h3>Supply</h3>
            <BulletChartSection data={data.__none__.supply} campaign={campaign} indicators={sections.undefined.supply} loading={loading} cols={1} />
          </div>

          <div className='medium-1 columns'>
            <h3>Polio+</h3>
            <BulletChartSection data={data.__none__.polio} campaign={campaign} indicators={sections.undefined.polio} loading={loading} cols={1} />
            <h3>Resources</h3>
            <BulletChartSection data={data.__none__.resources} campaign={campaign} indicators={sections.undefined.resources} loading={loading} cols={1} />
          </div>

          <div className="medium-4 columns">
            <h3>Inaccessible Children</h3>
            <Access data={data.access} campaign={campaign} indicators={indicators} loading={loading} />
            <div className="row">
              <div className="medium-4 columns right">
                <h3>Microplan Social Data Usage</h3>
                <SocialData data={data.__none__.microplans} campaign={campaign} loading={loading} />
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
});

module.exports = ManagementDashboard;
