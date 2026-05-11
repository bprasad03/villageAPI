import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:3000/v1'
const DEMO_KEY = 'ak_273361acbaa620ee54a9d9fa13d94a45'

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

// ─── Navbar ───────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white border-b border-gray-100 shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-gray-900 text-lg">VillageAPI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="/demo" className="hover:text-gray-900 transition-colors">Live demo</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#docs" className="hover:text-gray-900 transition-colors">Docs</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </a>
          <a href="/register" className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
            Get started free
          </a>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ──────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          403,496 villages across all 29 Indian states
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          India's complete
          <span className="text-green-600"> village data</span>
          <br />API platform
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Plug standardized Indian village address data directly into your app.
          Hierarchical autocomplete from village to state — ready in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/register" className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-lg">
            Start for free →
          </a>
          <a href="#demo" className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-lg border border-gray-200">
            See live demo
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          No credit card required · Free tier includes 5,000 requests/day
        </p>
      </div>
    </section>
  )
}

// ─── Stats Bar ─────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: '403,496', label: 'Villages' },
    { value: '29',      label: 'States' },
    { value: '600+',    label: 'Districts' },
    { value: '<50ms',   label: 'Avg response' },
    { value: '99.9%',   label: 'Uptime SLA' },
    { value: '1M+',     label: 'Daily capacity' },
  ]
  return (
    <section className="bg-gray-900 py-10">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 md:grid-cols-6 gap-6 text-center">
        {stats.map(s => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-green-400">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Live Demo ─────────────────────────────────────────────
function LiveDemo() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(false)
  const timerRef = useRef(null)

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    setSelected(null)
    clearTimeout(timerRef.current)
    if (val.length < 2) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API}/autocomplete`, {
          params: { q: val },
          headers: { 'x-api-key': DEMO_KEY }
        })
        setResults(res.data.data || [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }

  function selectVillage(item) {
    setQuery(item.label)
    setSelected(item)
    setResults([])
  }

  return (
    <section id="demo" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Live demo
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
            See it work in real time
          </h2>
          <p className="text-gray-500 text-lg">
            Start typing any village, town, or area name in India
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-gray-400 text-xs ml-3 font-mono">
              GET /v1/autocomplete?q={query || '...'}
            </span>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Input form */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  Address form
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <label className="text-xs text-gray-500 block mb-1">Village / Area</label>
                    <input
                      type="text"
                      value={query}
                      onChange={handleInput}
                      placeholder="Type village name..."
                      className="w-full px-4 py-3 border-2 border-green-500 rounded-xl focus:outline-none text-gray-800 bg-green-50"
                      autoComplete="off"
                    />
                    {loading && (
                      <div className="absolute right-3 top-9">
                        <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {results.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 mt-1 overflow-hidden">
                        {results.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => selectVillage(r)}
                            className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm text-gray-700 border-b border-gray-50 last:border-0 transition-colors"
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {['Sub-district', 'District', 'State', 'Country'].map(field => (
                    <div key={field}>
                      <label className="text-xs text-gray-500 block mb-1">{field}</label>
                      <input
                        type="text"
                        readOnly
                        value={
                          selected?.value
                            ? field === 'Sub-district' ? selected.hierarchy?.subDistrict || ''
                            : field === 'District'    ? selected.hierarchy?.district     || ''
                            : field === 'State'       ? selected.hierarchy?.state        || ''
                            : 'India'
                            : ''
                        }
                        placeholder="Auto-filled after selection"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: JSON response */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  API response
                </h3>
                <div className="bg-gray-900 rounded-xl p-5 h-full font-mono text-xs text-green-400 overflow-auto min-h-64">
                  {selected ? (
                    <pre>{JSON.stringify({
                      success: true,
                      data: {
                        value: selected.value,
                        label: selected.label,
                        hierarchy: selected.hierarchy
                      }
                    }, null, 2)}</pre>
                  ) : (
                    <div className="text-gray-500">
                      <p>// Start typing to see</p>
                      <p>// live API response here</p>
                      <br/>
                      <p>{'{'}</p>
                      <p>  "success": true,</p>
                      <p>  "data": {'{'}</p>
                      <p>    "value": "village_...",</p>
                      <p>    "label": "...",</p>
                      <p>    "hierarchy": {'{'}</p>
                      <p>      "village": "...",</p>
                      <p>      "district": "...",</p>
                      <p>      "state": "..."</p>
                      <p>    {'}'}</p>
                      <p>  {'}'}</p>
                      <p>{'}'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* See full demo link */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-3">
            Want to see the full interactive experience?
          </p>

          <a
            href="/demo"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <span>🚀</span>
            See complete demo
            <span className="text-gray-400">→</span>
          </a>
          <p className="text-xs text-gray-400 mt-3">
            Includes live API activity viewer and integration code examples
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Features ──────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: '⚡',
      title: 'Sub-50ms responses',
      desc: 'Optimized PostgreSQL with full-text indexes. Your users get instant results even on slow connections.'
    },
    {
      icon: '🗺️',
      title: 'Complete India coverage',
      desc: '403,496 villages across all 29 states. Every district, sub-district, and village from the 2011 census.'
    },
    {
      icon: '🔗',
      title: 'Hierarchical data',
      desc: 'Every village comes with its full address tree — sub-district, district, state — ready for dropdowns.'
    },
    {
      icon: '🔑',
      title: 'Secure API keys',
      desc: 'API key + secret authentication. Revoke keys instantly, set expiry dates, create up to 5 keys per account.'
    },
    {
      icon: '📊',
      title: 'Usage analytics',
      desc: 'Track your daily request count, see which endpoints are most used, monitor your rate limits in real time.'
    },
    {
      icon: '🚀',
      title: 'Easy integration',
      desc: 'REST API with JSON responses. Works with any language — cURL, Python, JavaScript, PHP, you name it.'
    },
  ]

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Why VillageAPI
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
            Everything you need, nothing you don't
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Built specifically for Indian address data. No more maintaining
            your own database or dealing with inconsistent formats.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map(f => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Code snippet ──────────────────────────────────────────
function CodeExample() {
  const [tab, setTab] = useState('curl')

  const examples = {
    curl: `curl https://api.villageapi.com/v1/search?q=Manibeli \\
  -H "X-API-Key: ak_your_key_here"`,
    js: `const response = await fetch(
  'https://api.villageapi.com/v1/search?q=Manibeli',
  { headers: { 'X-API-Key': 'ak_your_key_here' } }
)
const data = await response.json()
console.log(data.data[0].fullAddress)
// "Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India"`,
    python: `import requests

res = requests.get(
    'https://api.villageapi.com/v1/search',
    params={'q': 'Manibeli'},
    headers={'X-API-Key': 'ak_your_key_here'}
)
print(res.json()['data'][0]['fullAddress'])
# Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India`,
  }

  return (
    <section id="docs" className="py-24 px-6 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Integrate in minutes
          </h2>
          <p className="text-gray-400 text-lg">
            Three lines of code and you're live
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-700">
            {Object.keys(examples).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-mono transition-colors ${
                  tab === t
                    ? 'bg-gray-900 text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <pre className="p-6 text-sm font-mono text-green-400 overflow-x-auto leading-relaxed">
            {examples[tab]}
          </pre>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { endpoint: 'GET /v1/search',       desc: 'Search by village name'      },
            { endpoint: 'GET /v1/autocomplete',  desc: 'Typeahead suggestions'       },
            { endpoint: 'GET /v1/states',        desc: 'List all states'             },
          ].map(e => (
            <div key={e.endpoint} className="bg-gray-800 rounded-xl p-4">
              <p className="text-green-400 font-mono text-xs">{e.endpoint}</p>
              <p className="text-gray-400 text-xs mt-1">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ───────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      desc: 'Perfect for testing and development',
      color: 'border-gray-200',
      btn: 'bg-gray-900 hover:bg-gray-800',
      features: [
        '5,000 requests / day',
        '1 API key',
        'Search & autocomplete',
        'Single state access',
        'Community support',
      ],
      highlight: false,
    },
    {
      name: 'Premium',
      price: '₹3,999',
      period: '/month',
      desc: 'For small businesses and startups',
      color: 'border-green-500',
      btn: 'bg-green-600 hover:bg-green-700',
      features: [
        '50,000 requests / day',
        '3 API keys',
        'All endpoints',
        'Up to 5 states',
        'Email support',
        'Usage analytics',
      ],
      highlight: true,
    },
    {
      name: 'Pro',
      price: '₹16,499',
      period: '/month',
      desc: 'For growing companies',
      color: 'border-purple-400',
      btn: 'bg-purple-600 hover:bg-purple-700',
      features: [
        '300,000 requests / day',
        '5 API keys',
        'All endpoints',
        'All 29 states',
        'Priority support',
        'SLA guarantee',
        'Usage analytics',
      ],
      highlight: false,
    },
    {
      name: 'Unlimited',
      price: '₹41,499',
      period: '/month',
      desc: 'For large enterprises',
      color: 'border-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-700',
      features: [
        '1,000,000 requests / day',
        'Unlimited API keys',
        'All endpoints',
        'All 29 states',
        'Dedicated support',
        '99.9% SLA',
        'Custom integration help',
        'Invoice billing',
      ],
      highlight: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Pricing
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-lg">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-6 flex flex-col ${plan.color} ${
                plan.highlight ? 'shadow-xl shadow-green-100' : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className={`w-full py-3 text-white rounded-xl font-medium text-center text-sm transition-colors ${plan.btn}`}
              >
                Get started
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          All prices in INR. GST applicable. Annual billing available at 20% discount.
        </p>
      </div>
    </section>
  )
}

// ─── Use cases ─────────────────────────────────────────────
function UseCases() {
  const cases = [
    { icon: '🏦', title: 'Fintech & Banking',   desc: 'KYC address verification, loan applications, account opening forms' },
    { icon: '📦', title: 'E-commerce',          desc: 'Delivery address selection, pin code validation, last-mile routing' },
    { icon: '🏥', title: 'Healthcare',          desc: 'Patient registration, home delivery, rural health data collection' },
    { icon: '🚚', title: 'Logistics',           desc: 'Route planning, service area mapping, delivery zone management'    },
    { icon: '🏛️', title: 'Government portals', desc: 'Citizen registration, scheme enrollment, census data collection'  },
    { icon: '📱', title: 'Mobile apps',         desc: 'Location-based services, regional content targeting, user onboarding' },
  ]

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built for every industry
          </h2>
          <p className="text-gray-500 text-lg">
            Any product serving rural or semi-urban India needs village data
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cases.map(c => (
            <div key={c.title} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{c.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ───────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 px-6 bg-green-600">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to build with village data?
        </h2>
        <p className="text-green-100 text-lg mb-8">
          Join developers and companies already using VillageAPI.
          Free tier available — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/register" className="px-8 py-4 bg-white text-green-700 rounded-xl font-bold hover:bg-green-50 transition-colors text-lg">
            Create free account →
          </a>
          <a href="#demo" className="px-8 py-4 border-2 border-green-400 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-lg">
            See live demo
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🌍</span>
              <span className="font-bold text-white">VillageAPI</span>
            </div>
            <p className="text-sm leading-relaxed">
              India's most complete village-level geographical data API platform.
            </p>
          </div>
          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Live demo', 'API docs']
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers', 'Contact']
            },
            {
              title: 'Legal',
              links: ['Privacy policy', 'Terms of service', 'SLA', 'Data sources']
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2026 VillageAPI. All rights reserved.</p>
          <p className="text-sm">
            Data source: Census of India 2011 · Powered by NeonDB + Vercel
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Main export ───────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <StatsBar />
      <LiveDemo />
      <Features />
      <CodeExample />
      <Pricing />
      <UseCases />
      <CTA />
      <Footer />
    </div>
  )
}