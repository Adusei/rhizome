'use strict';

var _      = require('lodash');
var React  = require('react');
var moment = require('moment');

var DropdownMenu     = require('component/DropdownMenu.jsx');
var MenuItem         = require('component/MenuItem.jsx');

function findMatches(item, re) {
  var matches = [];

  if (re.test(_.get(item, 'title'))) {
    matches.push(_.assign({}, item, { filtered : true }));
  }

  if (!_.isEmpty(_.get(item, 'children'))) {
    _.each(item.children, function (child) {
      matches = matches.concat(findMatches(child, re));
    })
  }

  return matches;
};

function filterMenu(items, pattern) {
  if (_.size(pattern) < 3) {
    return items;
  }

  var match = _.partial(findMatches, _, new RegExp(pattern, 'gi'));

  return _(items).map(match).flatten().value();
}

var IndicatorDropdownMenu = React.createClass({

  propTypes : {
    indicators : React.PropTypes.array.isRequired,
    sendValue : React.PropTypes.func.isRequired
  },

  getInitialState : function () {
    return {
      pattern : ''
    };
  },
/*  shouldComponentUpdate: function(nextProps, nextState) {
      return (nextProps.indicators.length !== this.props.indicators.length || nextProps.text !==this.props.text);
  }, */
  render : function () {
    var self = this;
    if (this.props.indicators.length === 0) {
      return (<button className="button"><i className="fa fa-spinner fa-spin"></i> Loading Indicators...</button>);
    }

    var indicators = MenuItem.fromArray(filterMenu(this.props.indicators, this.state.pattern), self.props.sendValue);

    var props = _.omit(this.props, 'indicators', 'sendValue');

    return (
      <DropdownMenu
        searchable={true}
        onSearch={this._setPattern}
        {...props}>
        {indicators}
      </DropdownMenu>
    );
  },

  _setPattern : function (value) {
    this.setState({ pattern : value })
  }
});

module.exports = IndicatorDropdownMenu;
