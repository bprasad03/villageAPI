import { useState, useEffect } from 'react'
import axios from 'axios'

const ADMIN_KEY = 'admin123'
const API = 'http://localhost:3000/v1'

const statusColors = {
  PENDING:   'bg-amber-100 text-amber-700',
  ACTIVE:    'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
}

const planColors = {
  FREE:      'bg-gray-100 text-gray-600',
  PREMIUM:   'bg-blue-100 text-blue-700',
  PRO:       'bg-purple-100 text-purple-700',
  UNLIMITED: 'bg-green-100 text-green-700',
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [toast, setToast]       = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/admin/users`, {
        headers: { 'x-admin-key': ADMIN_KEY }
      })
      setUsers(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function approve(id) {
    await axios.post(`${API}/admin/users/${id}/approve`, {}, {
      headers: { 'x-admin-key': ADMIN_KEY }
    })
    showToast('✅ User approved successfully')
    fetchUsers()
    setSelected(null)
  }

  async function suspend(id) {
    await axios.post(`${API}/admin/users/${id}/suspend`, {}, {
      headers: { 'x-admin-key': ADMIN_KEY }
    })
    showToast('⏸ User suspended')
    fetchUsers()
    setSelected(null)
  }

  async function changePlan(id, plan) {
    await axios.post(`${API}/admin/users/${id}/plan`, { plan }, {
      headers: { 'x-admin-key': ADMIN_KEY }
    })
    showToast(`📦 Plan updated to ${plan}`)
    fetchUsers()
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage B2B user accounts and access</p>
        </div>
        <div className="text-sm text-gray-500 bg-white border border-gray-100 px-4 py-2 rounded-xl">
          {filtered.length} of {users.length} users
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50 animate-pulse">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or business name..."
          className="flex-1 min-w-64 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800"
        />
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-8 text-gray-400 text-center animate-pulse">Loading users...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-gray-400 text-center">No users found</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Business', 'Email', 'Status', 'Plan', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelected(user)}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 text-sm">{user.businessName}</p>
                    <p className="text-gray-400 text-xs mt-0.5">ID: {user.id}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <select
                      value={user.plan}
                      onChange={e => changePlan(user.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${planColors[user.plan]}`}
                    >
                      {['FREE', 'PREMIUM', 'PRO', 'UNLIMITED'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {user.status !== 'ACTIVE' && (
                        <button
                          onClick={() => approve(user.id)}
                          className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          Approve
                        </button>
                      )}
                      {user.status === 'ACTIVE' && (
                        <button
                          onClick={() => suspend(user.id)}
                          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{selected.businessName}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{selected.email}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'User ID',    value: selected.id                                    },
                { label: 'Status',     value: selected.status                                },
                { label: 'Plan',       value: selected.plan                                  },
                { label: 'API keys',   value: selected._count?.apiKeys || 0                  },
                { label: 'Registered', value: new Date(selected.createdAt).toLocaleDateString() },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {selected.status !== 'ACTIVE' && (
                <button
                  onClick={() => approve(selected.id)}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  ✅ Approve
                </button>
              )}
              {selected.status === 'ACTIVE' && (
                <button
                  onClick={() => suspend(selected.id)}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  ⏸ Suspend
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}