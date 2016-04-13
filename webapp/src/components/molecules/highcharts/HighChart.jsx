import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import format from 'utilities/format'

import Highcharts from 'highcharts'
import Exporting from 'highcharts/modules/exporting'
import Map from 'highcharts/modules/map'
import themes from 'components/molecules/highcharts/themes'
import palettes from 'utilities/palettes'

Exporting(Highcharts)
Map(Highcharts)

class HighChart extends Component {

  constructor (props) {
    super(props)
    Highcharts.setOptions(themes.standard)
  }

  static propTypes = {
    config: React.PropTypes.object.isRequired,
    map: React.PropTypes.bool,
    isPureConfig: React.PropTypes.bool,
    neverReflow: React.PropTypes.bool
  }

  static defaultProps = {
    isPureConfig: true
  }

  componentDidMount () { console.info('HighChart - componentDidMount')
    this.renderChart()
  }

  componentWillUnmount() { console.info('HighChart - componentWillUnmount')
    this.chart.destroy()
  }

  shouldComponentUpdate(nextProps) { console.info('HighChart - shouldComponentUpdate')
    if ((this.props.neverReflow || (this.props.isPureConfig)) && (nextProps.editMode === this.props.editMode))  {
      return true
    }
    this.renderChart()
    return false
  }

  setConfig () {
    this.config = {}
  }

  getChart () { console.info('HighChart - getChart')
    if (!this.chart) {
      throw new Error('getChart() should not be called before the component is mounted')
    }
    return this.chart
  }

  renderChart () { console.info('HighChart - renderChart')
    this.setConfig()
    this.config.colors = palettes[this.props.palette]
    let chartConfig = this.config.chart
    const chartType = this.props.type === 'MapChart' ? 'Map' : 'Chart'
    this.chart = new Highcharts[chartType]({
      ...this.config,
      chart: {
        ...chartConfig,
        renderTo: this.refs.chart.getDOMNode()
      }
    })

    global.requestAnimationFrame && requestAnimationFrame(()=>{
      this.chart && this.chart.options && this.chart.reflow()
    })
  }

  render () { console.info('HighChart - renderChart')
    let props = this.props
    props = {
      ...props,
      ref: 'chart'
    }
    return <div {...props} />
  }
}

export default HighChart
