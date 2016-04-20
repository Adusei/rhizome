import React from 'react'
import Reflux from 'reflux'

import IndicatorTagDropdown from 'components/molecules/menus/IndicatorTagDropdown'
import DropdownMenu from 'components/molecules/menus/DropdownMenu'
import CampaignDropdown from 'components/molecules/menus/CampaignDropdown'
import DatabrowserTable from 'components/molecules/DatabrowserTable'

import LocationStore from 'stores/LocationStore'
import IndicatorStore from 'stores/IndicatorStore'
import CampaignStore from 'stores/CampaignStore'
import DataEntryStore from 'stores/DataEntryStore'

import DataEntryActions from 'actions/DataEntryActions'

const DataEntry = React.createClass({

  mixins: [
    Reflux.connect(DataEntryStore),
    Reflux.connect(CampaignStore, 'campaigns'),
    Reflux.connect(IndicatorStore, 'indicators'),
    Reflux.connect(LocationStore, 'locations')
  ],

  componentWillMount: function () {
    CampaignStore.listen(campaigns => DataEntryActions.setCampaign(campaigns.raw[0]))
    IndicatorStore.listen(indicators => DataEntryActions.setIndicatorsByTag(indicators.tags[1], indicators.index))
  },

  render: function () {
    const state = this.state
    return (
      <div>
        <header className='row page-header'>
          <div className='medium-5 columns medium-text-left small-text-center'>
            <h1>Enter Data</h1>
          </div>
          <div className='medium-7 columns medium-text-right small-text-center dashboard-actions'>
            <div className='page-header-filters'>
              <CampaignDropdown
                campaigns={state.campaigns.raw || []}
                selected={state.selected_campaign}
                sendValue={id => DataEntryActions.setCampaign(state.campaigns.index[id])}
              />
              <IndicatorTagDropdown
                indicator_tags={state.indicators.tags || []}
                selected={state.selected_indicator_tag}
                sendValue={id => {
                  const indicator_tag = state.indicators.tags.filter(tag => tag.id === id)[0]
                  DataEntryActions.setIndicatorsByTag(indicator_tag, state.indicators.index)
                }}
              />
              <DropdownMenu
                items={state.locations.list}
                sendValue={id => DataEntryActions.addLocation(state.locations.index[id])}
                item_plural_name='Locations'
                text='Add Locations'
                style='button'
                uniqueOnly/>
            </div>
          </div>
        </header>
        <div className='row'>
          <div className='medium-12 columns'>
            <DatabrowserTable
              data={state.table_data}
              selected_locations={state.selected_locations}
              selected_indicators={state.selected_indicators}
              rowAction={DataEntryActions.removeLocation}
              hideCampaigns
              editable />
          </div>
        </div>
      </div>
    )
  }
})

export default DataEntry