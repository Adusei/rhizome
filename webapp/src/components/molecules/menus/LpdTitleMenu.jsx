import React from 'react'

import TitleMenu from 'components/molecules/menus/TitleMenu'
import TitleMenuItem from 'components/molecules/menus/TitleMenuItem'

var LpdTitleMenu = React.createClass({
  propTypes: {
    selected: React.PropTypes.object.isRequired,
    sendValue: React.PropTypes.func.isRequired,
    idsToRender: React.PropTypes.array
  },

  getDefaultProps () {
    return {
      statuses: [],
      idsToRender: [],
      selected: {'name':'Loading ...'}
    }
  },

  render () {
    const filters = [
      { id: 1, value: 0, name: 'All', type: 'lpd_status' },
      { id: 2, value: 1, name: 'LPD 1', type: 'lpd_status' },
      { id: 3, value: 2, name: 'LPD 2', type: 'lpd_status' },
      { id: 4, value: 3, name: 'LPD 3', type: 'lpd_status' }
    ]

    const selected_text = !this.props.selected ? 'LPD Status' : this.props.selected.name

    const indicator_menu_items = filters.map(filter =>
      <TitleMenuItem
        key={'filter-' + filter.id}
        text={filter.name}
        onClick={() => this.props.sendValue(filter)}
        classes='filter'
      />
    )

    return (
      <TitleMenu
        className='font-weight-600 cd-titlebar-margin'
        icon='fa-chevron-down'
        searchable={false}
        text={selected_text}>
        {indicator_menu_items}
      </TitleMenu>
    )
  }
})

export default LpdTitleMenu
