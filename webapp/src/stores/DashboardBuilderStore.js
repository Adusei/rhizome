'use strict'

var _ = require('lodash')
var Reflux = require('reflux/src')
var api = require('data/api')

var DashboardActions = require('actions/DashboardActions')
var LayoutDefaultSettings = require('dashboard/builtin/layout-options.js')

var DashboardBuilderStore = Reflux.createStore({
  listenables: [require('actions/DashboardBuilderActions')],

  getInitialState: function () {
    return this.data
  },

  data: {
    loaded: false,
    newDashboard: false,
    layout: LayoutDefaultSettings.defaultValue
  },

  onInitialize: function (id) {
    this.dashboardId = id
    if (_.isNull(id)) {
      this.data.newDashboard = true
      this.data.loaded = true
      this.trigger(this.data)
    } else {
      api.get_dashboard({ id: id }, null, { 'cache-control': 'no-cache' }).then(dashboard => {
        this.data.dashboard = dashboard.objects[0]
        this.data.layout = dashboard.objects[0].layout
        this.data.loaded = true

        api.get_chart({ dashboard_id: id }, null, { 'cache-control': 'no-cache' }).then(res => {
          this.data.dashboard.charts = res.objects.map(chart => {
            let result = chart.chart_json
            result.id = chart.id
            return result
          })
          DashboardActions.setDashboard({ dashboard: this.data.dashboard })
          this.trigger(this.data)
        }, function (err) {
          console.log(err)
          this.data.dashboard.charts = []
          this.trigger(this.data)
        })
      })
    }
  },

  onAddChart: function (chartDef) {
    // in this api do not need set the chart id.
    // chartDef.id = chartDef.title + (new Date()).valueOf()

    this.data.dashboard.charts.push(chartDef)
    DashboardActions.setDashboard({ dashboard: this.data.dashboard })

    // do not save the whole dashboard.
    // this.saveDashboard()

    // just save the chart.
    var data = {
      dashboard_id: this.dashboardId,
      chart_json: JSON.stringify(chartDef)
    }

    api.post_chart(data).then(res => {
      chartDef.id = res.objects.id
      this.trigger(this.data)
    }, res => {
      console.log('add chart error,', res)
      this.trigger(this.data)
    })
  },
  onRemoveChart: function (index) {
    var chart = this.data.dashboard.charts.splice(index, 1)[0]
    DashboardActions.setDashboard({ dashboard: this.data.dashboard })

    // do not save the whole dashboard.
    // this.saveDashboard()
    var data = {
      id: chart.id
    }

    api.delete_chart(data).then(res => {
      this.trigger(this.data)
    }, res => {
      console.log('remove chart error,', res)
      this.trigger(this.data)
    })
  },
  onMoveForward: function (index) {
    var newIndex
    if (index === this.data.dashboard.charts.length - 1) {
      newIndex = 0
    } else {
      newIndex = index + 1
    }
    var temp = this.data.dashboard.charts[index]
    this.data.dashboard.charts[index] = this.data.dashboard.charts[newIndex]
    this.data.dashboard.charts[newIndex] = temp
    this.saveDashboard()
    this.trigger(this.data)
  },
  onMoveBackward: function (index) {
    var newIndex
    if (index === 0) {
      newIndex = this.data.dashboard.charts.length - 1
    } else {
      newIndex = index - 1
    }
    var temp = this.data.dashboard.charts[index]
    this.data.dashboard.charts[index] = this.data.dashboard.charts[newIndex]
    this.data.dashboard.charts[newIndex] = temp
    this.saveDashboard()
    this.trigger(this.data)
  },
  onDeleteDashboard: function () {
    delete this.data.dashboard.charts
    this.data.dashboard.id = ''

    api.save_dashboard({ id: '', title: this.data.dashboard.title }).then(function (response) {
      window.location = '/'
    })
  },
  onAddDashboard: function () {
    var data = {
      title: this.data.dashboardTitle,
      default_office_id: null,
      dashboard_json: '[]',
      layout: this.data.layout
    }
    api.save_dashboard(data).then(function (response) {
      if (response.objects.id) {
        window.location = '/datapoints/dashboards/edit/' + response.objects.id
      } else {
        window.alert('There was an error saving your chart')
      }
    }, function (response) {
      window.alert(response.msg)
    })
  },
  saveDashboard: function () {
    var data = {
      id: this.data.dashboard.id,
      description: this.data.dashboardDescription,
      title: this.data.dashboardTitle,
      default_office_id: null,
      layout: this.data.layout,
      dashboard_json: JSON.stringify(this.data.dashboard.charts)
    }
    api.save_dashboard(data).then(function (response) {
    })
  },
  onUpdateChart: function (chartDef, index) {
    this.data.dashboard.charts[index] = chartDef
    DashboardActions.setDashboard({ dashboard: this.data.dashboard })

    // this api do no need to save the dashboard.
    // this.saveDashboard()

    var data = {
      id: chartDef.id,
      chart_json: JSON.stringify(chartDef)
    }

    api.post_chart(data).then(res => {
      this.trigger(this.data)
    }, res => {
      console.log('update chart error,', res)
      this.trigger(this.data)
    })
  },
  onUpdateTitle: function (title) {
    this.data.dashboardTitle = title
    // this.trigger(this.data)
    clearTimeout(this.timer)
    if (this.data.dashboard) {
      this.timer = setTimeout(function () {
        this.saveDashboard()
      }.bind(this), 1000)
    }
  },
  onUpdateDescription: function (description) {
    this.data.dashboardDescription = description
    // this.trigger(this.data)

    clearTimeout(this.timer)
    this.timer = setTimeout(function () {
      this.saveDashboard()
    }.bind(this), 1000)
  },
  onChangeLayout: function (value) {
    this.data.layout = value
    this.trigger(this.data)
  }
})

module.exports = DashboardBuilderStore
