'use strict';

var _     = require('lodash');
var React = require('react');

var Overview  = require('dashboard/nco/Overview.jsx');
var Breakdown = require('dashboard/nco/Breakdown.jsx');

var NCODashboard = React.createClass({
  propTypes : {
    dashboard : React.PropTypes.object.isRequired,
    data      : React.PropTypes.object.isRequired,
    location    : React.PropTypes.object.isRequired,

    loading   : React.PropTypes.bool
  },

  getDefaultProps : function () {
    return {
      loading : false
    };
  },

  render : function () {
    var data    = this.props.data;
    var loading = this.props.loading;

    return (
      <div id='nco-dashboard'>
        <section>
          <div className='row'>
            <div className='small-12 columns'>
              <h3>Overview for {this.props.location.name}</h3>
            </div>
          </div>

          <Overview data={data.overview} loading={loading} />
        </section>

        <section>
          <div className='row'>
            <div className='small-12 columns'>
              <h3>Breakdown by Sub-locations</h3>
            </div>
          </div>

          <Breakdown data={data.breakdown} loading={loading} />
        </section>
      </div>
    );
  }
});

module.exports = NCODashboard;
