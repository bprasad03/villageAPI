import { useState } from 'react'
import useAuthStore from '../../store/authStore'

export default function Docs() {
  const { apiKey } = useAuthStore()
  const [tab, setTab] = useState('curl')
  const [copied, setCopied] = useState('')

  const key = apiKey || 'ak_your_key_here'

  const examples = {
    curl: {
      search: `curl "https://api.villageapi.com/v1/search?q=Manibeli" \\
  -H "X-API-Key: ${key}"`,
      autocomplete: `curl "https://api.villageapi.com/v1/autocomplete?q=Man" \\
  -H "X-API-Key: ${key}"`,
      states: `curl "https://api.villageapi.com/v1/states" \\
  -H "X-API-Key: ${key}"`,
    },
    javascript: {
      search: `const res = await fetch(
  'https://api.villageapi.com/v1/search?q=Manibeli',
  { headers: { 'X-API-Key': '${key}' } }
)
const { data } = await res.json()
console.log(data[0].fullAddress)
// "Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India"`,
      autocomplete: `const res = await fetch(
  'https://api.villageapi.com/v1/autocomplete?q=Man',
  { headers: { 'X-API-Key': '${key}' } }
)
const { data } = await res.json()
// data = [{ value: 'village_...', label: 'Manibeli (...)' }]`,
      states: `const res = await fetch(
  'https://api.villageapi.com/v1/states',
  { headers: { 'X-API-Key': '${key}' } }
)
const { data } = await res.json()
// data = [{ id, code, name, districtCount }]`,
    },
    python: {
      search: `import requests

r = requests.get(
    'https://api.villageapi.com/v1/search',
    params={'q': 'Manibeli'},
    headers={'X-API-Key': '${key}'}
)
print(r.json()['data'][0]['fullAddress'])
# Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India`,
      autocomplete: `import requests

r = requests.get(
    'https://api.villageapi.com/v1/autocomplete',
    params={'q': 'Man'},
    headers={'X-API-Key': '${key}'}
)
print(r.json()['data'])`,
      states: `import requests

r = requests.get(
    'https://api.villageapi.com/v1/states',
    headers={'X-API-Key': '${key}'}
)
for state in r.json()['data']:
    print(state['name'], state['districtCount'])`,
    },
  }

  function copy(text, id) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const endpoints = [
    { method: 'GET', path: '/v1/search',                    desc: 'Search villages by name',         params: 'q (required), limit (default 10)'   },
    { method: 'GET', path: '/v1/autocomplete',              desc: 'Typeahead suggestions',            params: 'q (required, min 2 chars)'          },
    { method: 'GET', path: '/v1/states',                    desc: 'List all states',                  params: 'none'                               },
    { method: 'GET', path: '/v1/states/:id/districts',      desc: 'Get districts by state',           params: 'id (state ID)'                      },
    { method: 'GET', path: '/v1/districts/:id/subdistricts',desc: 'Get sub-districts by district',    params: 'id (district ID)'                   },
    { method: 'GET', path: '/v1/subdistricts/:id/villages', desc: 'Get villages by sub-district',     params: 'page, limit'                        },
  ]

  return (
    <div className="space-y-8 max-w-4xl">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
        <p className="text-gray-500 mt-1">Everything you need to integrate VillageAPI</p>
      </div>

      {/* Base URL */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-3">Base URL</h2>
        <div className="bg-gray-900 rounded-xl px-5 py-3 flex justify-between items-center">
          <code className="text-green-400 font-mono text-sm">
            https://api.villageapi.com/v1
          </code>
          <button
            onClick={() => copy('https://api.villageapi.com/v1', 'base')}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {copied === 'base' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-3">Authentication</h2>
        <p className="text-gray-500 text-sm mb-4">
          All requests must include your API key in the request header:
        </p>
        <div className="bg-gray-900 rounded-xl px-5 py-3">
          <code className="text-green-400 font-mono text-sm">
            X-API-Key: {key}
          </code>
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Endpoints</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {endpoints.map(ep => (
            <div key={ep.path} className="px-6 py-4 flex items-start gap-4">
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded font-mono mt-0.5 flex-shrink-0">
                {ep.method}
              </span>
              <div className="flex-1 min-w-0">
                <code className="text-gray-800 font-mono text-sm">{ep.path}</code>
                <p className="text-gray-500 text-xs mt-1">{ep.desc}</p>
                <p className="text-gray-400 text-xs mt-0.5">Params: {ep.params}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code examples */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Code examples</h2>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-gray-100">
          {Object.keys(examples).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {Object.entries(examples[tab]).map(([name, code]) => (
            <div key={name}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 capitalize">{name}</h3>
                <button
                  onClick={() => copy(code, name)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copied === name ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto leading-relaxed">
                {code}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Response format */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-3">Response format</h2>
        <pre className="bg-gray-900 rounded-xl p-5 text-xs font-mono text-green-400 overflow-x-auto">
{`{
  "success": true,
  "count": 1,
  "data": [
    {
      "value": "village_525002",
      "label": "Manibeli",
      "fullAddress": "Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India",
      "hierarchy": {
        "village": "Manibeli",
        "villageCode": "525002",
        "subDistrict": "Akkalkuwa",
        "district": "Nandurbar",
        "state": "Maharashtra",
        "country": "India"
      }
    }
  ]
}`}
        </pre>
      </div>

      {/* Error codes */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Error codes</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { code: '400', error: 'INVALID_QUERY',   desc: 'Search query too short or missing'    },
            { code: '401', error: 'INVALID_API_KEY', desc: 'API key missing or invalid'           },
            { code: '403', error: 'ACCESS_DENIED',   desc: 'Account not approved or suspended'   },
            { code: '429', error: 'RATE_LIMITED',    desc: 'Daily request quota exceeded'         },
            { code: '500', error: 'INTERNAL_ERROR',  desc: 'Server error — contact support'      },
          ].map(e => (
            <div key={e.code} className="px-6 py-3 flex items-center gap-4">
              <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${
                e.code.startsWith('4') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {e.code}
              </span>
              <code className="text-gray-700 text-xs font-mono w-36">{e.error}</code>
              <span className="text-gray-500 text-xs">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}