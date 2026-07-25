import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  function validateStep1() {
    if (!form.businessName.trim()) return 'Business name is required'
    if (!form.email.trim()) return 'Email is required'
    if (!form.email.includes('@')) return 'Enter a valid email address'
    const freeProviders = ['gmail.com','yahoo.com','hotmail.com','outlook.com']
    const domain = form.email.split('@')[1]
    if (freeProviders.includes(domain)) return 'Please use a business email address'
    return null
  }

  function validateStep2() {
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter'
    if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  function handleNext() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')
    try {
      await axios.post(`${API}/auth/register`, {
        email: form.email,
        businessName: form.businessName,
        password: form.password,
        phone: form.phone,
      })
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const p = form.password
    if (!p) return { score: 0, label: '', color: '' }
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    const map = {
      1: { label: 'Weak',   color: 'bg-red-500'    },
      2: { label: 'Fair',   color: 'bg-yellow-500' },
      3: { label: 'Good',   color: 'bg-blue-500'   },
      4: { label: 'Strong', color: 'bg-green-500'  },
    }
    return { score, ...map[score] }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-white text-xl">VillageAPI</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Power your app with
            <span className="text-green-400"> complete India</span>
            <br />address data
          </h2>
          <div className="space-y-4">
            {[
              { icon: '✓', text: '403,496 villages across all 29 states' },
              { icon: '✓', text: 'Sub-50ms API response times'           },
              { icon: '✓', text: 'Free tier — 5,000 requests/day'        },
              { icon: '✓', text: 'No credit card required'               },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {item.icon}
                </span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-500 text-sm">
          © 2026 VillageAPI · Trusted by businesses across India
        </p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Step 3: Success */}
          {step === 3 ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Application submitted!
              </h2>
              <p className="text-gray-500 mb-2">
                Your account is under review.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                We'll email <strong>{form.email}</strong> once approved.
                This usually takes 1–2 business days.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
                <h4 className="font-semibold text-amber-800 text-sm mb-2">
                  What happens next?
                </h4>
                <ol className="text-amber-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Admin reviews your business details</li>
                  <li>You receive an approval email</li>
                  <li>Login and generate your API key</li>
                  <li>Start making API calls!</li>
                </ol>
              </div>
              <Link
                to="/login"
                className="w-full block py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors text-center"
              >
                Go to login →
              </Link>
            </div>
          ) : (
            <>
              {/* Progress steps */}
              <div className="flex items-center gap-3 mb-8">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= s
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step > s ? '✓' : s}
                    </div>
                    <span className={`text-sm ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                      {s === 1 ? 'Business info' : 'Set password'}
                    </span>
                    {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`}/>}
                  </div>
                ))}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {step === 1 ? 'Create your account' : 'Secure your account'}
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                {step === 1
                  ? 'Tell us about your business'
                  : 'Choose a strong password'}
              </p>

              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Business name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={e => update('businessName', e.target.value)}
                      placeholder="Acme Technologies Pvt Ltd"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Business email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="you@yourcompany.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Personal email addresses (Gmail, Yahoo) not accepted
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    Continue →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                    />
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= strength.score ? strength.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Strength: <span className="font-medium">{strength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    By creating an account you agree to our{' '}
                    <a href="#" className="text-green-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>.
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Creating account...' : 'Create account'}
                    </button>
                  </div>
                </form>
              )}

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}