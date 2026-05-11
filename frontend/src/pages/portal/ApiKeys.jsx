import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../../store/authStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

export default function ApiKeys() {
  const { user } = useAuthStore()
  const [keyName, setKeyName]   = useState('')
  const [newKey, setNewKey]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState('')
  const [keys, setKeys]         = useState(user?.apiKeys || [])

  async function createKey() {
    if (!keyName.trim()) { setError('Please enter a name for this key'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/auth/create-key`, {
        email:    user.email,
        password: user._password,
        keyName:  keyName.trim()
      })
      setNewKey(res.data.data)
      setKeyName('')
      setKeys(prev => [...prev, res.data.data])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create key')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  function maskKey(key) {
    return key.slice(0, 8) + '••••••••••••••••' + key.slice(-4)
  }

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <p className="text-gray-500 mt-1">
          Manage your API keys — up to 5 active keys per account
        </p>
      </div>

      {/* New key revealed */}
      {newKey && (
        <div className="bg-gray-900 rounded-2xl p-6 border-2 border-green-500">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">🔑</span>
            <div>
              <h3 className="font-bold text-white">Key created successfully!</h3>
              <p className="text-yellow-400 text-sm mt-1">
                ⚠️ Copy your secret now — it will NEVER be shown again
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'API Key',    value: newKey.key,    id: 'key'    },
              { label: 'API Secret', value: newKey.secret, id: 'secret' },
            ].map(item => (
              <div key={item.id} className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">{item.label}</p>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-green-400 font-mono text-sm break-all">
                    {item.value}
                  </code>
                  <button
                    onClick={() => copyToClipboard(item.value, item.id)}
                    className="text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied === item.id ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Daily limit</p>
            <p className="text-white font-medium">
              {newKey.dailyLimit?.toLocaleString()} requests / day
            </p>
          </div>

          <button
            onClick={() => setNewKey(null)}
            className="mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            I've saved my secret — dismiss this
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Create new API key</h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={keyName}
            onChange={e => setKeyName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createKey()}
            placeholder="e.g. Production Server, Staging, Mobile App"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 text-sm"
          />
          <button
            onClick={createKey}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            {loading ? 'Creating...' : '+ Generate Key'}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}
      </div>

      {/* Existing keys */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Active keys</h2>
          <span className="text-sm text-gray-400">{keys.length} / 5</span>
        </div>

        {keys.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-4xl mb-3">🔑</p>
            <p className="text-gray-500 text-sm">No API keys yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Create your first key above to start making API calls
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {keys.map((key, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {key.name || 'API Key'}
                  </p>
                  <p className="text-gray-400 font-mono text-xs mt-1 truncate">
                    {maskKey(key.key)}
                  </p>
                  {key.createdAt && (
                    <p className="text-gray-300 text-xs mt-0.5">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Active
                  </span>
                  <button
                    onClick={() => copyToClipboard(key.key, `key-${i}`)}
                    className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied === `key-${i}` ? '✓ Copied' : 'Copy key'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-900 text-sm mb-3">🔒 Security best practices</h3>
        <ul className="space-y-1.5 text-blue-800 text-xs">
          <li>• Never expose your API key in client-side code or public repositories</li>
          <li>• Store keys in environment variables (e.g. .env files)</li>
          <li>• Use separate keys for production, staging and development</li>
          <li>• Revoke and regenerate keys if you suspect any compromise</li>
        </ul>
      </div>
    </div>
  )
}