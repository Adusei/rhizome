'use strict';

var _     = require('lodash');
var React = require('react');

var Chart = require('component/Chart.jsx');

var ToggleableStackedBar = React.createClass({
  propTypes : {
    data  : React.PropTypes.array.isRequired,
    title : React.PropTypes.string.isRequired
  },

  getInitialState : function () {
    return {
      offset : 'zero'
    };
  },

  render : function () {
    var name    = _.kebabCase(this.props.title)
    var props   = _.omit(this.props, 'title');
    var options = {
      offset  : this.state.offset,
      xFormat : d3.format(this.state.offset === 'expand' ? '%' : 'n')
    };

    return (
      <div>
        <h4>
          <a name={name}>{this.props.title}</a>&ensp;
          <div className='medium inline'>
            <label>
              <input
                type='radio'
                name={name + '-offset'}
                value='zero'
                checked={this.state.offset === 'zero'}
                onChange={this.onOffsetChange} />
              &ensp;count
            </label>
            <label>
              <input
                type='radio'
                name={name + '-offset'}
                value='expand'
                checked={this.state.offset === 'expand'}
                onChange={this.onOffsetChange} />
              &ensp;percentage
            </label>
          </div>
        </h4>
        <Chart type='BarChart' options={options} {...props} />
      </div>
    );
  },

  onOffsetChange : function (evt) {
    this.setState({ offset : evt.currentTarget.value });
  }
});

module.exports = ToggleableStackedBar;
