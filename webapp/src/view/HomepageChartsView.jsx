'use strict';

var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var HomepageChartsSection = require('view/HomepageChartsSection.jsx');
var HomepageDashboardsStore = require('stores/HomepageDashboardsStore');
var HomepageDashboardsActions = require('actions/HomepageDashboardsActions');

var HomepageChartsView = React.createClass({
    mixins: [
        Reflux.ListenerMixin,
        Reflux.connect(HomepageDashboardsStore, 'dashboards')
    ],

    getInitialState: function() {
      return {
        dashboards: []
      }
    },

    render: function () {
      if (this.state.dashboards.length === 0) {
          var style = {
              fontSize: '2rem'
          };

          return (
              <div style={style} className='overlay'>
                  <div>
                      <div><i className='fa fa-spinner fa-spin'></i>&ensp;Loading</div>
                  </div>
              </div>
          );
      }

      var list = [];
      this.state.dashboards.dashboards.forEach(function(item) {

        var dashboardProps = {
            campaign: item.campaign,
            data: item.data,
            indicators: item.indicators,
            location: item.location
        };

	      list.push(<HomepageChartsSection location={item.location} date={item.date} data={dashboardProps} />);
	    });

      return (
          <div>
            {list}
          </div>
      );
    }
});

module.exports = HomepageChartsView;