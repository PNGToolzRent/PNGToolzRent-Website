import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getDocs, collection, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { formatDate } from '../../utils/dates'
import './Admin.css'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocs(query(collection(db, 'users'), where('role', '==', 'client'), orderBy('createdAt', 'desc')))
      .then(snap => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      })
  }, [])

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Helmet><title>Users — Admin — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <h1>Users</h1>
          <p>All registered clients.</p>
        </div>
        <div className="admin-toolbar">
          <input className="admin-search" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <p className="admin-loading">Loading users...</p> : filtered.length === 0 ? (
          <div className="admin-empty">No users found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="user-avatar">
                        {u.profilePhoto ? <img src={u.profilePhoto} alt="" /> : <span>{u.name?.[0]?.toUpperCase()}</span>}
                      </div>
                      {u.name}
                    </td>
                    <td className="td-mono">{u.email}</td>
                    <td><span className="badge badge--confirmed">{u.role}</span></td>
                    <td className="td-mono td-muted">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminUsers
