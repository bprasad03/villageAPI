import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/admin/users`, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_KEY }
    })
    .then(res => setUsers(res.data.data || []))
    .finally(() => setLoading(false))
  }, [])

  const pending   = users.filter(u => u.status === 'PENDING').length
  const active    = users.filter(u => u.status === 'ACTIVE').length
  const suspended = users.filter(u => u.status === 'SUSPENDED').length

  const planData = [
    { name: 'Free',      value: users.filter(u => u.plan === 'FREE').length,      color: '#6b7280' },
    { name: 'Premium',   value: users.filter(u => u.plan === 'PREMIUM').length,   color: '#3b82f6' },
    { name: 'Pro',       value: users.filter(u => u.plan === 'PRO').length,       color: '#8b5cf6' },
    { name: 'Unlimited', value: users.filter(u => u.plan === 'UNLIMITED').length, color: '#10b981' },
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'Active',    value: active,    color: '#10b981' },
    { name: 'Pending',   value: pending,   color: '#f59e0b' },
    { name: 'Suspended', value: suspended, color: '#ef4444' },
  ].filter(d => d.value > 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 animate-pulse">Loading admin data...</p>
    </div>
  )

  return (
    <div className="space-y-8 max-w-5xl">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and user statistics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total users"    value={users.length} sub="registered accounts"  color="text-gray-900"   />
        <StatCard icon="✅" label="Active users"   value={active}       sub="approved accounts"    color="text-green-600"  />
        <StatCard icon="⏳" label="Pending review" value={pending}      sub="awaiting approval"    color="text-amber-600"  />
        <StatCard icon="🌍" label="Total villages" value="403,496"      sub="across 29 states"     color="text-purple-600" />
      </div>

      {/* Pending alert */}
      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-amber-800">
                {pending} user{pending > 1 ? 's' : ''} waiting for approval
              </h3>
              <p className="text-amber-600 text-sm mt-0.5">
                Review and approve new business registrations
              </p>
            </div>
          </div>
          <a
            href="/admin/users"
            className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Review now →
          </a>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* User status pie */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Users by status</h2>
          <p className="text-xs text-gray-400 mb-4">Account approval breakdown</p>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  formatter={value => (
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No users yet</p>
          )}
        </div>

        {/* Plan distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Users by plan</h2>
          <p className="text-xs text-gray-400 mb-4">Revenue tier distribution</p>
          {planData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={planData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {planData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No users yet</p>
          )}
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Recent registrations</h2>
          <a href="/admin/users" className="text-sm text-purple-600 hover:underline">
            View all →
          </a>
        </div>
        {users.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No users yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user.businessName}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.status === 'ACTIVE'    ? 'bg-green-100 text-green-700'  :
                    user.status === 'PENDING'   ? 'bg-amber-100 text-amber-700'  :
                    'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                  <span className="text-xs text-gray-400">{user.plan}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}