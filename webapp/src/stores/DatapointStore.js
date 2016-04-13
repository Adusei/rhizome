import _ from 'lodash'
import Reflux from 'reflux'
import StateMixin from'reflux-state-mixin'

import IndicatorStore from 'stores/IndicatorStore'
import LocationStore from 'stores/LocationStore'

import DatapointActions from 'actions/DatapointActions'

var DatapointStore = Reflux.createStore({

  mixins: [StateMixin.store],

  listenables: DatapointActions,

  datapoints: {
    meta: null,
    raw: null,
    flattened: null,
    melted: null
  },

  init () {
    this.joinTrailing(LocationStore, IndicatorStore, this.onGetInintialStores)
  },

  onGetInintialStores (locations, indicators) {
    this.indicators = indicators[0]
    this.locations = locations[0]
  },

  getInitialState () {
    return this.datapoints
  },

  // =========================================================================== //
  //                              API CALL HANDLERS                              //
  // =========================================================================== //

  // ============================  Fetch  Datapoints  ========================== //
  onFetchDatapoints () {
    this.setState({ raw: null })
  },
  onFetchDatapointsCompleted (response) {
    this.setState({
      meta: response.meta,
      raw: response.objects,
      flattened: this.flatten(response.objects),
      melted: this.melt(response.objects, response.meta.indicator_ids)
    })
  },

  onFetchDatapointsFailed (error) {
    this.setState({ error: error })
  },

  // =========================================================================== //
  //                            REGULAR ACTION HANDLERS                          //
  // =========================================================================== //
  onClearDatapoints () {
    this.setState({ meta: null, melted: null, raw: null })
  },

  // =========================================================================== //
  //                                  UTILITIES                                  //
  // =========================================================================== //
  flatten (datapoints) {
    return _(datapoints)
      .flatten()
      .sortBy(_.method('campaign.start_date.getTime'))
      .map(datapoint => {
        var base = _.omit(datapoint, 'indicators')
        return datapoint.indicators.map(indicator => {
          return _.assign({
            computed: indicator.computed,
            indicator: indicator.indicator,
            value: indicator.value
          }, base)
        })
      })
      .flatten()
      .value()
  },

  melt (datapoints, indicator_ids) {
    const selected_indicator_ids = indicator_ids.split(',')
    const baseIndicators = selected_indicator_ids.map(id => ({ indicator: parseInt(id, 0), value: 0 }))
    const melted_datapoints = _(datapoints).map(datapoint => {
      const base = _.omit(datapoint, 'indicators')
      const indicatorFullList = _.assign(_.cloneDeep(baseIndicators), datapoint.indicators)
      return indicatorFullList.map(indicator => _.assign({}, base, indicator))
    })
      .flatten()
      .value()
    melted_datapoints.forEach(melted_datapoint => {
      melted_datapoint.indicator = this.indicators.index[melted_datapoint.indicator]
      melted_datapoint.location = this.locations.index[melted_datapoint.location]
    })
    return melted_datapoints
  }

})

export default DatapointStore