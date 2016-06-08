import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import EnterDataPage from 'components/pages/EnterDataPage'
import { selectGlobalCampaign, selectGlobalLocation, setGlobalIndicators, setGlobalIndicatorTag } from 'actions/global_actions'
import { fetchDatapoints } from 'actions/datapoint_actions'

const mapStateToProps = (state) => ({
	campaigns: state.campaigns,
	indicators: state.indicators,
	locations: state.locations,
	datapoints: state.data_entry.datapoints,
	selected_campaign: state.data_entry.selected_campaign,
	selected_locations: state.data_entry.selected_locations,
	selected_indicators: state.data_entry.selected_indicators,
	selected_indicator_tag: state.data_entry.selected_indicator_tag
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
	selectGlobalCampaign,
	selectGlobalLocation,
	setGlobalIndicators,
	setGlobalIndicatorTag,
	fetchDatapoints
}, dispatch)

const EnterDataPageContainer = connect(mapStateToProps, mapDispatchToProps)(EnterDataPage)

export default EnterDataPageContainer
