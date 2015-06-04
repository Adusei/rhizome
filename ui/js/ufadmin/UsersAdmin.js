const React = require('react/addons');
const _ = require('lodash');
const {
	Datascope, LocalDatascope,
	SimpleDataTable, SimpleDataTableColumn,
	Paginator,
	SearchBar,
	FilterPanel, FilterDateRange, FilterInputRadio
} = require('react-datascope');

const AdminPage = require('./AdminPage');

const API = require('../data/api');

// display rules for datascope fields
const yesNoRenderer = (val) => val ? "Yes" : "No";
const checkmarkRenderer = (val) => val ? "✓" : "";
const fields = {
	edit_link: {
		title: 'Edit',
		key: 'id',
		renderer: (id) => <a href={`/datapoints/users/update/${id}`}>Edit User</a>
	},
	is_active: { title: "active?", renderer: checkmarkRenderer },
	is_staff: { title: "staff?", renderer: checkmarkRenderer },
	is_superuser: { title: "superuser?", renderer: checkmarkRenderer },
	date_joined: { format: 'MMM D YYYY' },
	last_login: { format: 'MMM D YYYY, h:mm a' }
};

const fieldNamesOnTable = ['id', 'username', 'first_name', 'last_name', 'email', 'last_login'];

const UsersAdmin = React.createClass({
	getInitialState() {
		return {areFiltersVisible: false};
	},
	onToggleFilterContainer() {
		this.setState((prevState) => ({areFiltersVisible: !prevState.areFiltersVisible}));
	},

	render() {
		var datascopeFilters =
			<div>
				<SearchBar
					fieldNames={['username', 'first_name', 'last_name', 'id']}
					placeholder="search users"
					/>
				<FilterPanel>
					<FilterDateRange name="date_joined"/>
					<FilterDateRange name="last_login"/>
					<FilterInputRadio name="is_superuser"/>
					<FilterInputRadio name="is_staff"/>
					<FilterInputRadio name="is_active"/>
				</FilterPanel>
			</div>;

		return <AdminPage
			title="Users"
			getMetadata={API.admin.usersMetadata}
			getData={API.admin.users}
			datascopeFilters={datascopeFilters}
			fields={fields}
			>
				<Paginator />
				<SimpleDataTable>
					{fieldNamesOnTable.map(fieldName => {
						return <SimpleDataTableColumn name={fieldName} />
					})}

				</SimpleDataTable>
		</AdminPage>
	}
});

module.exports = UsersAdmin;
