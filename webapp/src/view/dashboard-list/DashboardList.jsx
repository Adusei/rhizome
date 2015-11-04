'use strict';

var _      = require('lodash');
var React  = require('react');
var Reflux = require('reflux');

var api = require('data/api');

var _tableRow = function(row) {
  var path = '/datapoints/' + _.kebabCase(row.title) + '/';
  var editPath = '/datapoints/dashboards/edit/'+row.id+'/';
  var editLink = <span>(<a href={editPath}>edit</a>)</span>;
  return (
      <tr>
        <td><a href={path}>{row.title}</a> {editLink}</td>
        <td>{row.description}</td>
        <td>{row.owner_username}</td>
      </tr>
    );
};

var NavigationStore = require('stores/NavigationStore');

module.exports = React.createClass({

  mixins: [
    Reflux.connect(NavigationStore, 'store')
  ],

  getInitialState: function() {
    return {
      customDashboards: []
    }
  },

  getCustomDashboards: function() {
    var self = this;
    api.get_dashboard().then(function(response) {
      var customDashboards = _(response.objects).sortBy('title').value();
      self.setState({customDashboards: customDashboards});
    });
  },

  componentWillMount: function() {
    this.getCustomDashboards();
  },

  render : function () {
    var self = this;
    var rows = self.state.customDashboards;
    if (_.isNull(rows)) {
      rows = <tr><td><i className="fa fa-spinner fa-spin"></i> Loading&hellip;</td></tr>;
    } else if (rows.length > 0) {
      rows = rows.map(_tableRow);
    } else {
      rows = <tr><td>No custom dashboards created yet.</td></tr>;
    }

    return (
      <div className="row">
        <div className="medium-12 columns">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

});
