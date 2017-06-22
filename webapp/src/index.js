// require('./utilities/polyfill.js')

import React from 'react'
import Reflux from 'reflux'
import RefluxPromise from 'reflux-promise'
import AdminApp from 'containers/AdminApp'
// import SourceDataApp from 'containers/SourceDataApp'

Reflux.use(RefluxPromise(window.Promise))

// React.render(React.createElement(require('components/nav/DashboardNav')), document.getElementById('dashboards-nav'))

const Rhizome = window.Rhizome = {
  SourceData: function (el) {
    React.render(React.createElement(require('containers/SourceDataContainer')), el)
    // SourceDataApp.render(document.getElementById('main'))
  },
  ManageSystem: function (el) {
    AdminApp.render(document.getElementById('main'))
  }
}

if ('ActiveXObject' in window) {
  var body = document.getElementsByTagName('body')[0]
  body.classList.add('ie')
}

export default Rhizome
