'use strict';
var _      = require('lodash');
var moment = require('moment');
var React  = require('react');
var Reflux = require('reflux');
var ReactJson = require('react-json')
var ReactRouter = require('react-router')
var { Route, Router} = ReactRouter;

var SimpleFormModal = require('./SimpleFormModal');

var SimpleFormComponent = React.createClass({
  propTypes: {
    objectId : React.PropTypes.number.isRequired,
    contentType : React.PropTypes.string.isRequired,
    componentTitle : React.PropTypes.string.isRequired,
    onClick : React.PropTypes.isRequired,
    rowData : React.PropTypes.array,
    },

  getDefaultProps : function () {
    return {
      onClick    : _.noop,
    };
  },

  getInitialState : function(){
    return {
        modalIsOpen: false,
      }
  },

  componentWillMount: function () {
    console.log('=== MOUNTING ==')
    // SimpleFormActions.initialize();
  },

  render : function(){

    var rowData = this.props.rowData;
    if (!rowData){
      return <div>Loading Form Component </div>
    }

    var contentType = this.props.contentType;
    var componentTitle = this.props.componentTitle;
    var formComponentStyle = {
      border: '1px dashed #000000',
      width: '90%',
      padding: '10px',
    };

    var rowLi = []
    _.forEach(rowData, function(row) {
        rowLi.push(<li>{row.display} ({row.id}) </li>)
    });

    var modalForm = <div>
      <ReactJson value={ {'hello':'','world':''} } settings={{form: true}}/>,
    </div>;

    return <div style={formComponentStyle}>
      <h4> {componentTitle} </h4>
        <br></br>
        <ul>
          {rowLi}
        </ul>
      <SimpleFormModal
        modalForm={modalForm}
        onClick={this.props.onClick}
        contentType={contentType}
        >
      </SimpleFormModal>

    </div>;
  }
})

module.exports = SimpleFormComponent;
