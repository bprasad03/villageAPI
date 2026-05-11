import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API     = 'http://localhost:3000/v1'
const API_KEY = 'ak_273361acbaa620ee54a9d9fa13d94a45'

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

// ── Autocomplete input component ──────────────────────────
function VillageAutocomplete({ value, onChange, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]         = useState(false)
  const [open, setOpen]               = useState(false)
  const timerRef = useRef(null)

  async function handleChange(e) {
    const val = e.target.value
    onChange(val)
    clearTimeout(timerRef.current)

    if (val.length < 2) { setSuggestions([]); setOpen(false); return }

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API}/autocomplete`, {
          params: { q: val },
          headers: { 'x-api-key': API_KEY }
        })
        setSuggestions(res.data.data || [])
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  function handleSelect(item) {
    onChange(item.label.split(' (')[0])
    setSuggestions([])
    setOpen(false)
    onSelect(item)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border-2 border-green-400 rounded-xl focus:outline-none focus:border-green-600 text-gray-800 bg-white pr-10"
          autoComplete="off"
        />
        {loading ? (
          <div className="absolute right-3 top-3.5">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : value ? (
          <span className="absolute right-3 top-3.5 text-green-500 text-sm">✓</span>
        ) : (
          <span className="absolute right-3 top-3.5 text-gray-300 text-sm">🔍</span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-56 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm text-gray-700 border-b border-gray-50 last:border-0 transition-colors flex items-center gap-2"
            >
              <span className="text-green-500 text-xs">📍</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Form field ─────────────────────────────────────────────
function Field({ label, value, placeholder, readOnly, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none ${
          readOnly
            ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-default'
            : 'border-gray-200 text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100'
        }`}
      />
    </div>
  )
}

// ── Main demo page ─────────────────────────────────────────
export default function Demo() {
  const [form, setForm] = useState({
    fullName:    '',
    email:       '',
    phone:       '',
    message:     '',
    village:     '',
    subDistrict: '',
    district:    '',
    state:       '',
    country:     'India',
  })

  const [hierarchy, setHierarchy] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [apiCalls, setApiCalls]   = useState([])
  const [activeTab, setActiveTab] = useState('form')

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleVillageSelect(item) {
    const h = item.hierarchy || {}
    setHierarchy(h)
    setForm(f => ({
      ...f,
      village:     h.village     || '',
      subDistrict: h.subDistrict || '',
      district:    h.district    || '',
      state:       toTitleCase(h.state || ''),
      country:     'India',
    }))

    // Log API call
    setApiCalls(prev => [{
      time:     new Date().toLocaleTimeString(),
      endpoint: `/v1/autocomplete?q=${form.village}`,
      status:   200,
      response: item.label,
    }, ...prev].slice(0, 5))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.village) return
    setSubmitted(true)
  }

  function reset() {
    setForm({
      fullName: '', email: '', phone: '', message: '',
      village: '', subDistrict: '', district: '', state: '', country: 'India',
    })
    setHierarchy(null)
    setSubmitted(false)
    setApiCalls([])
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="font-bold text-gray-900">VillageAPI</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
            Live Demo
          </span>
          <Link
            to="/register"
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Get API access →
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            Interactive demo — powered by real VillageAPI data
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            See VillageAPI in action
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            This is a real contact form integrated with VillageAPI.
            Start typing any village name and watch the address fields fill automatically.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {[
            { id: 'form', label: '📋 Demo form'     },
            { id: 'api',  label: '⚡ API activity'  },
            { id: 'code', label: '💻 Integration code' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Left: Form */}
          <div>
            {submitted ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Form submitted!
                </h2>
                <p className="text-gray-500 mb-2">
                  This is how VillageAPI powers your address forms.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left mt-6 mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Submitted data
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Name',         value: form.fullName    },
                      { label: 'Email',        value: form.email       },
                      { label: 'Village',      value: form.village     },
                      { label: 'Sub-district', value: form.subDistrict },
                      { label: 'District',     value: form.district    },
                      { label: 'State',        value: form.state       },
                      { label: 'Country',      value: form.country     },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="font-medium text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Try again →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg mb-1">Contact form</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Powered by VillageAPI autocomplete
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Personal info */}
                  <div className="pb-4 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Personal information
                    </p>
                    <div className="space-y-3">
                      <Field
                        label="Full name" required
                        value={form.fullName}
                        onChange={v => update('fullName', v)}
                        placeholder="Amit Kumar"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Email" required type="email"
                          value={form.email}
                          onChange={v => update('email', v)}
                          placeholder="amit@company.com"
                        />
                        <Field
                          label="Phone"
                          value={form.phone}
                          onChange={v => update('phone', v)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address — powered by API */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Address
                      <span className="ml-2 normal-case text-green-600 font-normal">
                        ← powered by VillageAPI
                      </span>
                    </p>
                    <div className="space-y-3">

                      {/* Village autocomplete */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Village / Area <span className="text-red-400">*</span>
                        </label>
                        <VillageAutocomplete
                          value={form.village}
                          onChange={v => update('village', v)}
                          onSelect={handleVillageSelect}
                          placeholder="Start typing village name..."
                        />
                        {!form.village && (
                          <p className="text-xs text-gray-400 mt-1">
                            Try: Manibeli, Akkalkuwa, Pune, Mumbai
                          </p>
                        )}
                      </div>

                      {/* Auto-filled fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Sub-district"
                          value={form.subDistrict}
                          placeholder="Auto-filled"
                          readOnly
                        />
                        <Field
                          label="District"
                          value={form.district}
                          placeholder="Auto-filled"
                          readOnly
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="State"
                          value={form.state}
                          placeholder="Auto-filled"
                          readOnly
                        />
                        <Field
                          label="Country"
                          value={form.country}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => update('message', e.target.value)}
                      placeholder="Your message..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-gray-800 text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-base"
                  >
                    Submit form →
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right panel — changes by tab */}
          <div>
            {activeTab === 'form' && (
              <div className="space-y-4">

                {/* How it works */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">How it works</h3>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: 'User types village name',    desc: 'Minimum 2 characters triggers the API call', active: form.village.length >= 2 },
                      { step: '2', title: 'API returns suggestions',     desc: 'Results include full address hierarchy',    active: !!hierarchy              },
                      { step: '3', title: 'User selects a village',      desc: 'All address fields auto-populate instantly', active: !!hierarchy             },
                      { step: '4', title: 'Form submits clean data',     desc: 'Standardized address sent to your backend', active: submitted               },
                    ].map(item => (
                      <div key={item.step} className="flex gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                          item.active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {item.active ? '✓' : item.step}
                        </div>
                        <div>
                          <p className={`text-sm font-medium transition-colors ${item.active ? 'text-gray-900' : 'text-gray-400'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live hierarchy */}
                {hierarchy && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <h3 className="font-semibold text-green-800 mb-3 text-sm">
                      ✅ Address hierarchy received
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Village',      value: hierarchy.village,     code: hierarchy.villageCode     },
                        { label: 'Sub-district', value: hierarchy.subDistrict, code: hierarchy.subDistrictCode },
                        { label: 'District',     value: hierarchy.district,    code: hierarchy.districtCode    },
                        { label: 'State',        value: toTitleCase(hierarchy.state || ''), code: hierarchy.stateCode },
                        { label: 'Country',      value: 'India',               code: null                      },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs">
                          <span className="text-green-600 font-medium">{item.label}</span>
                          <div className="text-right">
                            <span className="text-green-800 font-semibold">{item.value}</span>
                            {item.code && (
                              <span className="text-green-400 ml-2 font-mono">({item.code})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gray-900 rounded-2xl p-5 text-center">
                  <p className="text-white font-semibold mb-1">
                    Add this to your app
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Get API access and integrate in minutes
                  </p>
                  <Link
                    to="/register"
                    className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Start for free →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="font-semibold text-gray-900 text-sm">Live API activity</h3>
                </div>

                {apiCalls.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-300 text-4xl mb-3">⚡</p>
                    <p className="text-gray-400 text-sm">
                      Start typing in the village field to see live API calls here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {apiCalls.map((call, i) => (
                      <div key={i} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-700 font-mono font-bold px-2 py-0.5 rounded">
                              GET
                            </span>
                            <code className="text-xs text-gray-600 font-mono">{call.endpoint}</code>
                          </div>
                          <span className="text-xs text-green-600 font-bold">{call.status}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {call.time} · Response: <span className="text-gray-600">{call.response}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Each keystroke (after 2 chars) triggers a debounced API call with 300ms delay
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">Integration code</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Copy this into your project</p>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">1. Call the autocomplete endpoint</p>
                    <pre className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto leading-relaxed">
{`const res = await fetch(
  '/v1/autocomplete?q=' + query,
  { headers: { 'X-API-Key': YOUR_KEY } }
)
const { data } = await res.json()`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">2. Auto-fill address fields</p>
                    <pre className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto leading-relaxed">
{`// When user selects a village:
const { hierarchy } = selectedVillage

setForm({
  village:     hierarchy.village,
  subDistrict: hierarchy.subDistrict,
  district:    hierarchy.district,
  state:       hierarchy.state,
  country:     'India'
})`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">3. Response structure</p>
                    <pre className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto leading-relaxed">
{`{
  "value": "village_525002",
  "label": "Manibeli (...)",
  "hierarchy": {
    "village":     "Manibeli",
    "subDistrict": "Akkalkuwa",
    "district":    "Nandurbar",
    "state":       "MAHARASHTRA"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '403,496', label: 'Villages in database' },
              { value: '29',      label: 'States covered'       },
              { value: '<50ms',   label: 'Avg API response'     },
              { value: 'Free',    label: 'To get started'       },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-green-600">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}