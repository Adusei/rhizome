const React = require('react')
const {
  SimpleDataTable, SimpleDataTableColumn,
  Paginator,
  SearchBar
} = require('react-datascope')

const AdminPage = require('./AdminPage')

const api = require('../data/api')

// display rules for datascope fields
const checkmarkRenderer = (val) => val ? '✓' : ''
const fields = {
  edit_link: {
    title: 'Edit',
    key: 'id',
    renderer: (id) => <a href={`/datapoints/users/update/${id}`}>Edit User</a>
  },
  is_active: { title: 'active?', renderer: checkmarkRenderer },
  is_staff: { title: 'staff?', renderer: checkmarkRenderer },
  is_superuser: { title: 'superuser?', renderer: checkmarkRenderer },
  date_joined: { format: 'MMM D YYYY' },
  id: { title: 'ID', name: 'id' },
  username: { title: 'User Name', name: 'username' },
  first_name: { title: 'First Name', name: 'first_name' },
  last_name: { title: 'Last Name', name: 'last_name' },
  email: { title: 'Email', name: 'email' }
}

const schema = {
  last_login: { type: 'string', format: 'date-time' }
}

const fieldNamesOnTable = ['id', 'username', 'first_name', 'last_name', 'email', 'edit_link']

const UsersAdmin = React.createClass({
  getInitialState () {
    return { areFiltersVisible: true }
  },

  render () {
    var datascopeFilters = (
      <div>
        <SearchBar
          fieldNames={['id', 'username', 'first_name', 'last_name', 'email', 'edit_link']}
          placeholder='Search users ...'
        />
      </div>
    )

    return (
      <AdminPage
        title='Users'
        getData={api.users}
        fields={fields}
        schema={schema}
        datascopeFilters={datascopeFilters} >
        <Paginator />
        <SimpleDataTable>
          {fieldNamesOnTable.map(fieldName => {
            return <SimpleDataTableColumn name={fieldName}/>
          })}
        </SimpleDataTable>
      </AdminPage>
    )
  }
})

export default UsersAdmin
