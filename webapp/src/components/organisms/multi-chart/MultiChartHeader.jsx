import _ from 'lodash'
import React, {PropTypes} from 'react'

import IconButton from 'components/button/IconButton'
import ExportIcon from 'components/ExportIcon'
import TitleInput from 'components/TitleInput'

const MultiChartHeader = React.createClass({

  propTypes: {
    chart: PropTypes.object,
    setTitle: PropTypes.func,
    toggleEditMode: PropTypes.func,
    toggleSelectTypeMode: PropTypes.func,
    duplicateChart: PropTypes.func,
    saveChart: PropTypes.func,
    removeChart: PropTypes.func
  },

  getInitialState () {
    return {
      titleEditMode: false
    }
  },

  _toggleTitleEdit (title) {
    if (_.isString(title)) {
      this.props.setTitle(title)
    }
    this.setState({titleEditMode: !this.state.titleEditMode})
  },

  render () {
    const props = this.props
    const chart = props.chart

    const remove_button = props.removeChart ? (
      <IconButton onClick={() => props.removeChart(chart.uuid)} icon='fa-trash' text='Remove' />
    ) : null

    const duplicate_button = props.duplicateChart ? (
      <IconButton onClick={() => props.duplicateChart(chart.uuid)} icon='fa-copy' text='Duplicate' />
    ) : null

    const show_options_button = (
      <IconButton
        onClick={props.toggleEditMode}
        icon='fa-angle-double-left'
        text='Show Options'
        className={'chart-options-button ' + (chart.editMode ? 'hidden' : null) } />
    )

    const chart_actions = !props.readOnlyMode ? (
      <span className='animated fadeInRight'>
        <IconButton onClick={props.toggleSelectTypeMode} icon='fa-bar-chart' text='Change chart type' />
        <ExportIcon exportPath={'/charts/' + chart.id}/>
        <IconButton isBusy={chart.saving} onClick={() => props.saveChart(chart.uuid)} icon='fa-save' text='Save' alt_text='Saving ...'/>
        { /* duplicate_button */ }
        { remove_button }
      </span>
    ) : null

    const editable_title = this.state.titleEditMode ? (
      <TitleInput initialText={chart.title} save={this._toggleTitleEdit}/>
    ) : (
      <h2>
        <a onClick={this._toggleTitleEdit} style={{cursor: 'text'}}>{chart.title || 'yyyyy'}</a>
      </h2>
    )

    return (
      <header className='row chart-header'>
        <div className='medium-12 columns'>
          { props.readOnlyMode ? <h2>{chart.title || 'zzzzz'}</h2> : editable_title }
         <div className='chart-actions'>
            { chart_actions }
            { props.readOnlyMode ? null : show_options_button }
          </div>
        </div>
      </header>
    )
  }
})

export default MultiChartHeader
