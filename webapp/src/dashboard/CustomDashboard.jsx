'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react');
var moment = require('moment');

var Chart = require('component/Chart.jsx');

function getOptions(chart, campaign, data) {
  var opts = {};

  if (chart.hasOwnProperty('yFormat')) {
    opts.yFormat = _.isString(chart.yFormat) ? d3.format(chart.yFormat) : chart.xFormat;
  }

  switch (chart.type) {
    case 'ScatterChart':
      opts.x = _.property('[' + chart.indicators[0] + ']');
      opts.y = _.property('[' + chart.indicators[1] + ']');

      // Only scatter charts should be providing custom formatting for
      // the x-axis
      if (chart.hasOwnProperty('xFormat')) {
        opts.xFormat = _.isString(chart.xFormat) ? d3.format(chart.xFormat) : chart.xFormat;
      }

      break;

    case 'ChoroplethMap':
      opts.value = _.property('.properties[' + chart.indicators[0] + ']');
      break;

    case 'BarChart':
      opts.y = _.property((chart.groupBy === 'indicator') ?
        'location.name' :
        'indicator.short_name'
      );

      opts.xFormat = opts.yFormat;
      opts.yFormat = String;
      break;

    case 'ColumnChart':
      var upper = moment(campaign.start_date);
      var lower = upper.clone().subtract(chart.timeRange);

      opts.domain = _.constant(_.map(d3.time.scale()
            .domain([lower.valueOf(), upper.valueOf()])
            .ticks(d3.time.month, 1),
          _.method('getTime')
        ));

      opts.x = d => moment(d.campaign.start_date).valueOf();
      opts.xFormat = d => moment(d).format('MMM YY');
      break;

    case 'PieChart':
      opts.margin = {
        top    : 0,
        right  : 80,
        bottom : 0,
        left   : 0
      };

      break;

    default:
      break;
  }

  return opts;
}

var CustomDashboard = React.createClass({
  propTypes : {
    editable      : React.PropTypes.bool,
    onAddChart    : React.PropTypes.func,
    onDeleteChart : React.PropTypes.func,
    onEditChart   : React.PropTypes.func,
    onMoveForward : React.PropTypes.func,
    onMoveBackward: React.PropTypes.func
  },

  getDefaultProps : function () {
    return {
      editable      : false,
      onAddChart    : _.noop,
      onDeleteChart : _.noop,
      onEditChart   : _.noop,
      onMoveForward : _.noop,
      onMoveBackward: _.noop
    };
  },

  render : function () {
    var numCharts = this.props.dashboard.charts.length;

    var data     = this.props.data;
    var loading  = this.props.loading;
    var campaign = this.props.campaign;
    var editable = this.props.editable;

    var charts = _.map(this.props.dashboard.charts, (chart, i) => {
      var title  = chart.title;
      var key    = _.get(chart, 'id', _.kebabCase(title));
      var id     = _.get(chart, 'id', _.camelCase(title));
      var series = data[id];
      var cols   = chart.type === 'BarChart' ?
        'small-10 end columns' :
        'medium-4 columns end cd-chart-size';

      var options = getOptions(chart, campaign, data);

      var controls;
      if (editable) {
        controls = (
          <div className='button-bar' style={{float : 'right'}}>
            <a role='button' onClick={this.props.onMoveBackward.bind(null, i)}>
              <i className='fa fa-icon fa-arrow-left fa-fw'></i>
            </a>
            <a role='button' onClick={this.props.onMoveForward.bind(null, i)}>
              <i className='fa fa-icon fa-arrow-right fa-fw'></i>
            </a>
            <a role='button' onClick={this.props.onDeleteChart.bind(null, i)}>
              <i className='fa fa-icon fa-trash fa-fw'></i>
            </a>
            <a role='button' onClick={this.props.onEditChart.bind(null, i)}>
              <i className='fa fa-icon fa-pencil fa-fw'></i>
            </a>
          </div>
        );
      }

      return (
        <div key={key} className={cols} style={{ paddingBottom: '1.5rem' }}>
          <h4>{title} {controls}</h4>
          <Chart type={chart.type} data={series} options={options}
            loading={loading} />
        </div>
      );
    });

    var addChart;

    return (
      <div className='row cd-charts'>{charts} {addChart}</div>
    );
  },
});

module.exports = CustomDashboard;
