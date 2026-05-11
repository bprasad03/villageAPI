import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../../store/authStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

export default function Login() {
  const navigate  = useNavigate()
  const { loginAsAdmin, loginAsUser } = useAuthStore()

  const [tab, setTab]           = useState('user')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleUserLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password })
      const userData = res.data.data
      if (userData.status === 'PENDING') {
        setError('Your account is pending admin approval. You\'ll receive an email once approved.')
        return
      }
      if (userData.status === 'SUSPENDED') {
        setError('Your account has been suspended. Please contact support.')
        return
      }
      const apiKey = userData.apiKeys?.[0]?.key || ''
      loginAsUser({ ...userData, _password: password }, apiKey)
      navigate('/portal/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  function handleAdminLogin(e) {
    e.preventDefault()
    setError('')
    const ok = loginAsAdmin(adminPass)
    if (ok) {
      navigate('/admin')
    } else {
      setError('Incorrect admin password')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-white text-xl">VillageAPI</span>
        </Link>

        <div>
          <blockquote className="text-2xl text-white font-medium leading-relaxed mb-6">
            "VillageAPI saved us weeks of development time. The data is clean,
            the API is fast, and the support is excellent."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              R
            </div>
            <div>
              <p className="text-white font-medium text-sm">Rahul Sharma</p>
              <p className="text-gray-400 text-xs">CTO, LogisticsFirst India</p>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm">© 2024 VillageAPI</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🌍</span>
            <span className="font-bold text-gray-900 text-xl">VillageAPI</span>
          </Link>

          {/* Tab toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setTab('user'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'user'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              B2B Portal
            </button>
            <button
              onClick={() => { setTab('admin'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'admin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin
            </button>
          </div>

          {tab === 'user' ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-gray-500 text-sm mb-8">Sign in to your VillageAPI account</p>

              <form onSubmit={handleUserLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Business email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="#" className="text-sm text-green-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors text-base"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-green-600 font-medium hover:underline">
                    Register your business →
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin access</h1>
              <p className="text-gray-500 text-sm mb-8">Platform administration only</p>

              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Admin password
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors"
                >
                  Access admin panel
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}