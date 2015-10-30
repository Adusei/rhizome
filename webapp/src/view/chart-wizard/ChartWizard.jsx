import React from 'react'
import Reflux from 'reflux'
import _ from 'lodash'
import moment from 'moment'

import ChartWizardStep from './ChartWizardStep.jsx'
import ChartWizardStepList from './ChartWizardStepList.jsx'
import PreviewScreen from './PreviewScreen.jsx'
import MenuItem from 'component/MenuItem.jsx'
import DropdownMenu from 'component/DropdownMenu.jsx'
import IndicatorDropdownMenu from 'component/IndicatorDropdownMenu.jsx'
import CampaignDropdownMenu from 'component/CampaignDropdownMenu.jsx'
import List from 'component/list/List.jsx'
import TitleInput from 'component/TitleInput.jsx'
import Chart from 'component/Chart.jsx'
import RadioGroup from 'component/radio-group/RadioGroup.jsx'
import ChartSelect from '../chart-builder/ChartSelect.jsx'

import ChartWizardActions from 'actions/ChartWizardActions'
import ChartWizardStore from 'stores/ChartWizardStore'
import chartDefinitions from 'stores/chartBuilder/chartDefinitions'

const defaultChartDef = {
  title: '',
  type: 'LineChart',
  indicators: [],
  groupBy: 'indicator',
  timeRange: null,
  x: 0,
  xFormat: ',.0f',
  y: 0,
  yFormat: ',.0f'
}

function filterMenu(items, pattern) {
  if (!pattern || pattern.length < 3) {
    return items
  }

  let match = _.partial(findMatches, _, new RegExp(pattern, 'gi'))

  return _(items).map(match).flatten().value()
}

function findMatches(item, re) {
  let matches = []

  if (re.test(_.get(item, 'title'))) {
    matches.push(_.assign({}, item, {filtered: true}))
  }

  if (!_.isEmpty(_.get(item, 'children'))) {
    _.each(item.children, function (child) {
      matches = matches.concat(findMatches(child, re))
    })
  }

  return matches
}

function findChartType(type) {
  return chartDefinitions.charts[_.findIndex(chartDefinitions.charts, {name: type})] || {}
}

let ChartWizard = React.createClass({
  mixins: [Reflux.connect(ChartWizardStore, 'data')],

  propTypes: {
    save: React.PropTypes.func,
    cancel: React.PropTypes.func
  },

  getInitialState() {
    return {
      refer: 'location',
    }
  },

  componentDidMount() {
    this.chartDef = this.props.chartDef || defaultChartDef
    ChartWizardActions.initialize(this.chartDef, this.props.location, this.props.campaign)
  },

  saveChart() {
    ChartWizardActions.saveChart(this.props.save)
  },

  toggleStep(refer) {
    this.setState({
      refer: refer
    })
  },

  setLocationSearch(pattern) {
    this.setState({
      locationSearch: pattern
    })
  },

  render() {
    let locations = MenuItem.fromArray(filterMenu(this.state.data.locationList, this.state.locationSearch), ChartWizardActions.addLocation)

    let locationStep = (
      <div>
        <DropdownMenu
          icon='fa-globe'
          text={this.state.data.location && this.state.data.location.name || 'Select Location'}
          searchable={true}
          onSearch={this.setLocationSearch} >
          {locations}
        </DropdownMenu>
      </div>
    )

    let indicatorStep = (
      <div>
        <IndicatorDropdownMenu
          text='Add Indicators'
          icon='fa-plus'
          indicators={this.state.data.indicatorList}
          sendValue={ChartWizardActions.addIndicator}>
        </IndicatorDropdownMenu>
        <List items={this.state.data.indicatorSelected} removeItem={ChartWizardActions.removeIndicator} />
      </div>
    )

    let campaignDisplay = (this.state.data.location && this.state.data.location.name) + ' ' +
      (this.state.data.campaign && moment(this.state.data.campaign.start_date).format('MMM YYYY'))
    let campaignStep = (
      <div>
        <CampaignDropdownMenu
          text={this.state.data.campaign && campaignDisplay || 'Select Campaign'}
          campaigns={this.state.data.campaignFilteredList}
          sendValue={ChartWizardActions.addCampaign}>
        </CampaignDropdownMenu>
      </div>
    )

    let chartTypeStep = (
      <div>
        <ChartSelect charts={chartDefinitions.charts} value={this.state.data.chartDef.type}
          onChange={ChartWizardActions.changeChart}/>
      </div>
    )

    let groupBy = (
      <div>
        <label>Group By: </label>
        <RadioGroup name="groupby" horizontal={true} value={this.state.data.groupByValue}
          values={chartDefinitions.groups} onChange={ChartWizardActions.changeGroupRadio} />
      </div>
    )
    let styleStep = (
      <div>
        {findChartType(this.state.data.chartDef.type).groupBy ? groupBy : null}
        <label>Time Span: </label>
        <RadioGroup name="time" horizontal={true} value={this.state.data.timeValue}
          values={this.state.data.timeRangeFilteredList} onChange={ChartWizardActions.changeTimeRadio} />
        <label>Format: </label>
        <RadioGroup name="format" horizontal={true} value={this.state.data.yFormatValue}
          values={chartDefinitions.formats} onChange={ChartWizardActions.changeYFormatRadio}/>
      </div>
    )

    let previewStep = (
      <div>
        <label>Title</label>
        <TitleInput initialText={this.state.data.chartDef.title} save={ChartWizardActions.editTitle} />
        <a href="#" className="button success" onClick={this.saveChart}>
          {this.props.chartDef ? "Update Chart" : "Create Chart"}
        </a>
      </div>
    )

    let chart = (
      <Chart id="custom-chart" type={this.state.data.chartDef.type} data={this.state.data.chartData} options={this.state.data.chartOptions}/>
    )

    return (
      <div className='chart-wizard'>
        <ChartWizardStepList onToggle={this.toggleStep} active={this.state.refer}>
          <ChartWizardStep title='Select Location' refer='location'>
            {locationStep}
          </ChartWizardStep>
          <ChartWizardStep title='Select Indicator' refer='indicator'>
            {indicatorStep}
          </ChartWizardStep>
          <ChartWizardStep title='Select Campaign' refer='campaign'>
            {campaignStep}
          </ChartWizardStep>
          <ChartWizardStep title='Select Chart Type' refer='chart-type'>
            {chartTypeStep}
          </ChartWizardStep>
          <ChartWizardStep title='Customise Styles' refer='style'>
            {styleStep}
          </ChartWizardStep>
          <ChartWizardStep title='Preview' refer='preview'>
            {previewStep}
          </ChartWizardStep>
        </ChartWizardStepList>
        <PreviewScreen>
          {this.state.data.canDisplayChart ? chart : null}
        </PreviewScreen>
        <a className='chart-wizard__cancel' href="#" onClick={this.props.cancel}>Cancel without saving chart</a>
      </div>
    )
  }
})

export default ChartWizard