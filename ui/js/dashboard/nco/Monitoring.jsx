'use strict';

var _     = require('lodash');
var React = require('react');
var d3    = require('d3');

var DonutChart = require('component/DonutChart.jsx');
var Chart      = require('component/Chart.jsx')

function donutLabel(data, labelText) {
  var value = _.get(data, '[0].value');

  if (!_.isFinite(value)) {
    return;
  }

  var fmt   = d3.format('%');
  var label;

  if (labelText) {
    label = (<span><br /><label>{labelText}</label></span>);
  }

  return (<span>{fmt(value)}{label}</span>)
}
var Monitoring = React.createClass({
  propTypes : {
    data    : React.PropTypes.object.isRequired,
    loading : React.PropTypes.bool
  },

  getDefaultProps : function () {
    return {
      loading : false
    };
  },

  render : function () {
    var loading = this.props.loading;
    var data    = this.props.data;

    var options = {
      innerRadius : 0.6,
      domain      : _.constant([0, 1]),
      labelStyle  : {
        lineHeight : 1
      }
    };

    var inside = _(data.insideMonitoring)
      .groupBy('region.name')
      .map(values => _.transform(values, (result, d) => {
        _.defaults(result, _.omit(d, 'indicator', 'value'));
        result[d.indicator.id === 276 ? 'x' : 'y'] = d.value;
      }, {}))
      .omit('indicator', 'value')
      .filter(d => _.isFinite(d.x) && _.isFinite(d.y))
      .value();

    var outside = _(data.outsideMonitoring)
      .groupBy('region.name')
      .map(values => _.transform(values, (result, d) => {
        _.defaults(result, _.omit(d, 'indicator', 'value'));
        result[d.indicator.id === 276 ? 'x' : 'y'] = d.value;
      }, {}))
      .omit('indicator', 'value')
      .filter(d => _.isFinite(d.x) && _.isFinite(d.y))
      .value();

    var union = _(data.insideMonitoring.concat(data.outsideMonitoring));
    var domain = d3.extent(union
      .filter(d => d.indicator.id === 276)
      .pluck('value')
      .value());

    var range = d3.extent(union
      .filter(d => _.includes([274,272], d.indicator.id))
      .pluck('value')
      .value());

    var scatter = {
      aspect  : 1.7,
      domain  : _.constant(domain),
      range   : _.constant(range),
      xFormat : d3.format('%'),
      xLabel  : 'Caregiver Awareness',
      yFormat : d3.format('%'),
      yLabel  : 'Missed Children'
    };

    // Match the scatter plot's left margin for nicer header alignment
    var headerStyle = {
      marginLeft: '24px'
    };
    console.log('johns logger')
    console.log(data.caregiverAwareness)
    return (
      <div className='row'>

        <div className='medium-6 columns'>
          <div className='row'>
            <div className='small-12 columns'>
              <h4 style={{ textAlign: 'center' }}>Missed Children</h4>
            </div>

            <div className='medium-6 columns'>
              <DonutChart
                loading={loading}
                data={data.inside}
                label={_.partial(donutLabel, _, 'Inside')}
                labelStyle={{ lineHeight : 1 }}
                options={options} />
            </div>

            <div className='medium-6 columns'>
              <DonutChart
                loading={loading}
                data={data.outside}
                label={_.partial(donutLabel, _, 'Outside')}
                labelStyle={{ lineHeight : 1 }}
                options={options} />
            </div>
          </div>
        </div>

        <div className='medium-6 columns'>
          <div className='row'>
            <div className='small-12 columns'>
              <h4 style={{ textAlign : 'center' }}>Caregiver Awareness</h4>
            </div>

            <div className='medium-6 push-3 end columns'>
              <DonutChart
                loading={loading}
                data={data.caregiverAwareness}
                label={donutLabel}
                options={options} />
            </div>

          </div>
        </div>

        <div className='row'>
          <div className='medium-6 columns'>
            <h4 style={headerStyle}>Inside Monitoring</h4>
            <Chart type='ScatterChart' data={inside} loading={loading} options={scatter} />
          </div>

          <div className='medium-6 columns'>
            <h4 style={headerStyle}>Outside Monitoring</h4>
            <Chart type='ScatterChart' data={outside} loading={loading} options={scatter} />
          </div>
        </div>

      </div>
    );
  }

});

module.exports = Monitoring;
