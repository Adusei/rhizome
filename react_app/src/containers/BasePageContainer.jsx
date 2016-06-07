import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import BasePage from 'components/pages/BasePage'
import { fetchAllMeta } from 'actions/global_actions'

const mapStateToProps = (state) => ({
	superuser: state.superuser,
	dashboards: state.dashboards,
	charts: state.charts
})

const mapDispatchToProps = (dispatch) => bindActionCreators({fetchAllMeta}, dispatch)

const BasePageContainer = connect(mapStateToProps, mapDispatchToProps)(BasePage)

export default BasePageContainer