var React = require('react');
var _ = require('lodash');

var {
	Datascope, LocalDatascope,
	SimpleDataTable, SimpleDataTableColumn,
	Paginator,
	SearchBar,
	FilterPanel, FilterDateRange, FilterInputRadio
} = require('react-datascope');

var api = require('../data/api');

var AdminPage = require('./AdminPage');

// display rules for datascope fields
const checkmarkRenderer = (val) => val ? "✓" : "";
const fields = {
	edit_link: {
		title: 'Edit',
		key: 'id',
		renderer: (id) => {
			return <a href={`/datapoints/groups/update/${id}`}>Edit Role</a>;
		}
	}
};

const fieldNamesOnTable = ['name', 'edit_link'];

var GroupsAdmin = React.createClass({
	render() {
		var datascopeFilters =
			<div>
				<SearchBar
					fieldNames={['name']}
					placeholder="Search roles ..."
					/>
			</div>;

		return <AdminPage
			title="Roles"
			getData={api.groups}
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

module.exports = GroupsAdmin;
