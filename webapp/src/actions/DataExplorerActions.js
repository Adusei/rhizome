import Reflux from 'reflux'
import ChartAPI from 'data/requests/ChartAPI'
import api from 'data/api'

const DataExplorerActions = Reflux.createActions({
  'fetchChart': { children: ['completed', 'failed'] },
  'fetchMapFeatures': { children: ['completed', 'failed'] },
  'getChart': 'getChart',
  'saveChart': 'saveChart',
  'setPalette': 'setPalette',
  'setType': 'setType',
  'setTitle': 'setTitle',
  'setDateRange': 'setDateRange',
  'setIndicatorIds': 'setIndicatorIds',
  'setCampaignIds': 'setCampaignIds',
  'setLocationIds': 'setLocationIds'
})

// API CALLS
// ---------------------------------------------------------------------------
DataExplorerActions.fetchChart.listenAndPromise(chart_id => ChartAPI.getChart(chart_id))

DataExplorerActions.fetchMapFeatures.listen(location_ids => {
  DataExplorerActions.fetchMapFeatures.promise(
    api.geo({parent_location_id__in: location_ids}, null, {'cache-control': 'max-age=604800, public'})
  )
})

export default DataExplorerActions
