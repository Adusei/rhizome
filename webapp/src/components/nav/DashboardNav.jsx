import _ from 'lodash'
import React from 'react'
import Reflux from 'reflux'

import NavMenuItem from 'components/nav/NavMenuItem'
import RootStore from 'stores/RootStore'

let DashboardNav = React.createClass({

  mixins: [
    Reflux.connectFilter(RootStore, 'superuser', store => store.superuser)
  ],

  getInitialState () {
    return {
      charts: [],
      dashboards: []
    }
  },

  componentDidMount () {
    console.log('DASHBOARD NAV');
  },

  render: function () {

    return (
      <ul className='dashboards-nav'>
        <li>
          <a href='/dashboards'>Dashboards</a>
          <ul className='dashboard-menu'>
          </ul>
        </li>
        <li className='log-out'>
          <a href='/accounts/logout?next=/' title='logout'>
            Log Out &nbsp;
            <i className='fa fa-lg fa-sign-out'/>
          </a>
        </li>
      </ul>
    )
  }
})

export default DashboardNav
