import { useState, useEffect } from 'react'
import axios from 'axios'

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'admin123'

export default function AdminLogs() {
  const [logs, setLogs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')

  useEffect(() => {
    setTimeout(() => {
      setLogs([
        { id: 1, endpoint: '/v1/search',       method: 'GET', status: 200, time: 45,  user: 'My Company',      key: 'ak_••••abcd', ts: new Date() },
        { id: 2, endpoint: '/v1/autocomplete',  method: 'GET', status: 200, time: 23,  user: 'My Company',      key: 'ak_••••abcd', ts: new Date() },
        { id: 3, endpoint: '/v1/states',        method: 'GET', status: 200, time: 12,  user: 'My Company',      key: 'ak_••••abcd', ts: new Date() },
        { id: 4, endpoint: '/v1/search',        method: 'GET', status: 401, time: 5,   user: 'Unknown',         key: 'ak_••••????', ts: new Date() },
        { id: 5, endpoint: '/v1/autocomplete',  method: 'GET', status: 429, time: 2,   user: 'My Company',      key: 'ak_••••abcd', ts: new Date() },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const filtered = logs.filter(l => {
    if (filter === 'ALL')  return true
    if (filter === '2xx')  return l.status >= 200 && l.status < 300
    if (filter === '4xx')  return l.status >= 400 && l.status < 500
    if (filter === '5xx')  return l.status >= 500
    return true
  })

  function statusColor(code) {
    if (code >= 500) return 'bg-red-100 text-red-700'
    if (code >= 400) return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  function timeColor(ms) {
    if (ms > 200) return 'text-red-600'
    if (ms > 100) return 'text-amber-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6 max-w-6xl">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Logs</h1>
          <p className="text-gray-500 mt-1">Monitor all API requests across your platform</p>
        </div>
        <button className="text-sm bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors">
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total requests', value: logs.length,                                         color: 'text-gray-900'  },
          { label: 'Successful',     value: logs.filter(l => l.status < 400).length,             color: 'text-green-600' },
          { label: 'Client errors',  value: logs.filter(l => l.status >= 400 && l.status < 500).length, color: 'text-amber-600' },
          { label: 'Avg response',   value: logs.length ? Math.round(logs.reduce((s,l) => s + l.time, 0) / logs.length) + 'ms' : '0ms', color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['ALL', '2xx', '4xx', '5xx'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Logs table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Time', 'User', 'API Key', 'Endpoint', 'Status', 'Response time'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400 animate-pulse">
                  Loading logs...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                  No logs found
                </td>
              </tr>
            ) : filtered.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-400 text-xs font-mono">
                  {log.ts.toLocaleTimeString()}
                </td>
                <td className="px-5 py-3 text-gray-700 text-xs">{log.user}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{log.key}</td>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs text-gray-700">{log.endpoint}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-mono font-bold ${timeColor(log.time)}`}>
                    {log.time}ms
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Showing sample data — real logs will populate as users make API calls
      </p>
    </div>
  )
}