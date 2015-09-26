'use strict';
var _      = require('lodash');
var moment = require('moment');
var React  = require('react');
var Reflux = require('reflux');
var ReactJson = require('react-json')
var ReactRouter = require('react-router')
var { Route, Router} = ReactRouter;

var SimpleFormStore = require('stores/SimpleFormStore');
var SimpleFormActions = require('actions/SimpleFormActions');
var SimpleFormComponent = require('./SimpleFormComponent');


var SimpleForm = React.createClass({
  mixins: [
    Reflux.connect(SimpleFormStore, 'store'),
  ],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState : function () {
    return {};
  },

  componentWillMount: function() {
    SimpleFormActions.initialize(this.props.params.id)
	},

  getTagForIndicator : function() {
    SimpleFormActions.getTagForIndicator(this.props.params.id)
  },

  addTagToIndicator : function(e) {
    var tag_id = e
    SimpleFormActions.addTagToIndicator(this.props.params.id, e)
  },

  getTagTree  : function() {
    SimpleFormActions.getTagTree()
  },

  addIndicatorCalc : function() {
    SimpleFormActions.addIndicatorCalc(this.props.params.id)
    // component makes query as ooposed to passing the data via props //
  },

  render : function () {
    var tag_form_data, calc_form_data = {};

    // console.log('this dot props: ', this.props)
    // console.log('this dot state : ', this.state)

    var indicatorId  = this.props.params.id
    var indicatorObject  = this.state.store.indicatorObject


    // CASE 1 ->  There is an id in the url but the request is still pending //
    if (indicatorId && !indicatorObject){
      return <div>'LOADING'</div>
    }

    // CASE 2 -> no object_id: load only the base form for this model
    // render a create form with none of the additional components //
    if (!indicatorId){
        var form_welcome_text = 'Create a New Indicator Below'
        var base_form_data = {
            name: "",
            short_name: ''
        };
    }

    // CASE 3 -> He have the object - render the component forms for indicator
    else {
        var form_welcome_text = 'Update Indicator: ' + indicatorObject.short_name
        var base_form_data = {name: indicatorObject.name, short_name: indicatorObject.short_name}
        var calc_form_data = {};
    };

    var base_form_settings = {form: true}
    var base_form = <div>
        <p className="pageWelcome"> {form_welcome_text} </p>
        <ReactJson value={ base_form_data } settings={base_form_settings}/>,
      </div>;

    return (
      <div className="row">
        <div className="small-8 columns">
          {base_form}
        </div>
        <div className="small-4 columns">
          <SimpleFormComponent
              objectId={indicatorId}
              contentType='indicator_tag'
              componentTitle="Tags and Dashboards"
              onClick={this.addTagToIndicator}
            >
          </SimpleFormComponent>
          <br></br>
          <SimpleFormComponent
              objectId={indicatorId}
              contentType='indicator_calc'
              componentTitle="Component Indicators"
              onClick={this.addTagToIndicator}
            >
          </SimpleFormComponent>
          <br></br>
          </div>
      </div>
    );
  }
});

module.exports = SimpleForm;
