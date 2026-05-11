import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import useAuthStore from '../../store/authStore'

const API = 'http://localhost:3000/v1'

const planLimits = {
  FREE: 5000, PREMIUM: 50000, PRO: 300000, UNLIMITED: 1000000
}

function StatCard({ icon, label, value, sub, color = 'text-gray-900' }) {
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

export default function Dashboard() {
  const { user, apiKey } = useAuthStore()
  const [states, setStates]   = useState([])
  const [loading, setLoading] = useState(true)

  const limit = planLimits[user?.plan || 'FREE']

  const requestData = [
    { day: 'Mon', requests: 0  },
    { day: 'Tue', requests: 0  },
    { day: 'Wed', requests: 0  },
    { day: 'Thu', requests: 0  },
    { day: 'Fri', requests: 0  },
    { day: 'Sat', requests: 0  },
    { day: 'Sun', requests: 0  },
  ]

  useEffect(() => {
    if (!apiKey) return
    axios.get(`${API}/states`, { headers: { 'x-api-key': apiKey } })
      .then(res => setStates(res.data.data || []))
      .finally(() => setLoading(false))
  }, [apiKey])

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.businessName?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your VillageAPI account
        </p>
      </div>

      {/* No API key warning */}
      {!apiKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-800">No API key yet</h3>
            <p className="text-amber-700 text-sm mt-1">
              Generate your first API key to start making requests.
            </p>
            <Link
              to="/portal/keys"
              className="inline-block mt-3 text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Generate API key →
            </Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="⚡"
          label="Today's requests"
          value="0"
          sub={`of ${limit.toLocaleString()} limit`}
          color="text-green-600"
        />
        <StatCard
          icon="📅"
          label="This month"
          value="0"
          sub="total requests"
          color="text-blue-600"
        />
        <StatCard
          icon="🗺️"
          label="Villages available"
          value="403,496"
          sub="across 29 states"
          color="text-purple-600"
        />
        <StatCard
          icon="🔑"
          label="Active API keys"
          value={user?.apiKeys?.length || 0}
          sub="of 5 maximum"
          color="text-gray-900"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Request chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">API requests</h2>
          <p className="text-xs text-gray-400 mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={requestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} />
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
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: '#16a34a', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Your plan</h2>

          <div className="space-y-3">
            {[
              { label: 'Plan',           value: user?.plan || 'FREE'             },
              { label: 'Daily limit',    value: limit.toLocaleString() + ' req'  },
              { label: 'API keys',       value: '5 max'                          },
              { label: 'State access',   value: user?.plan === 'FREE' ? '1 state' : 'All states' },
              { label: 'Support',        value: user?.plan === 'FREE' ? 'Community' : 'Email'    },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>

          <Link
            to="/#pricing"
            className="mt-4 w-full block text-center py-2.5 border border-green-600 text-green-600 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Upgrade plan →
          </Link>
        </div>
      </div>

      {/* Quick start */}
      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">Quick start</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { step: '1', title: 'Get your API key',   desc: 'Go to API Keys and generate your first key',   link: '/portal/keys', cta: 'Generate key' },
            { step: '2', title: 'Make your first call', desc: 'Search any village name to test the API',     link: '/portal/docs', cta: 'View docs'    },
            { step: '3', title: 'Integrate',           desc: 'Add the API to your app with our code examples', link: '/portal/docs', cta: 'See examples' },
          ].map(item => (
            <div key={item.step} className="bg-gray-800 rounded-xl p-4">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold mb-3">
                {item.step}
              </div>
              <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs mb-3 leading-relaxed">{item.desc}</p>
              <Link
                to={item.link}
                className="text-green-400 text-xs hover:text-green-300 transition-colors"
              >
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}