const express = require('express')
const router = express.Router()
const prisma = require('../db')

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

// GET /v1/search?q=Manibeli&limit=10
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_QUERY',
        message: 'Search query must be at least 2 characters'
      })
    }

    const searchTerm = q.trim()
    const resultLimit = Math.min(parseInt(limit) || 10, 50)

    const villages = await prisma.village.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      include: {
        subDistrict: {
          include: {
            district: {
              include: { state: true }
            }
          }
        }
      },
      take: resultLimit,
      orderBy: { name: 'asc' }
    })

    const data = villages.map(village => ({
      value: `village_${village.code}`,
      label: village.name,
      fullAddress: `${village.name}, ${village.subDistrict.name}, ${village.subDistrict.district.name}, ${toTitleCase(village.subDistrict.district.state.name)}, India`,
      hierarchy: {
        village:         village.name,
        villageCode:     village.code,
        subDistrict:     village.subDistrict.name,
        subDistrictCode: village.subDistrict.code,
        district:        village.subDistrict.district.name,
        districtCode:    village.subDistrict.district.code,
        state:           toTitleCase(village.subDistrict.district.state.name),
        stateCode:       village.subDistrict.district.state.code,
        country:         'India'
      }
    }))

    res.json({
      success: true,
      count: data.length,
      query: searchTerm,
      data
    })

  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Search failed'
    })
  }
})

// GET /v1/autocomplete?q=Man
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_QUERY',
        message: 'Query must be at least 2 characters'
      })
    }

    const villages = await prisma.village.findMany({
      where: {
        name: {
          startsWith: q.trim(),
          mode: 'insensitive'
        }
      },
      include: {
        subDistrict: {
          include: {
            district: {
              include: { state: true }
            }
          }
        }
      },
      take: 10,
      orderBy: { name: 'asc' }
    })

    const data = villages.map(village => ({
      value: `village_${village.code}`,
      label: `${village.name} (${village.subDistrict.name}, ${village.subDistrict.district.name}, ${toTitleCase(village.subDistrict.district.state.name)})`,
      hierarchy: {
        village:         village.name,
        villageCode:     village.code,
        subDistrict:     village.subDistrict.name,
        subDistrictCode: village.subDistrict.code,
        district:        village.subDistrict.district.name,
        districtCode:    village.subDistrict.district.code,
        state:           toTitleCase(village.subDistrict.district.state.name),
        stateCode:       village.subDistrict.district.state.code,
        country:         'India'
      }
    }))

    res.json({
      success: true,
      count: data.length,
      data
    })

  } catch (error) {
    console.error('Autocomplete error:', error)
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Autocomplete failed'
    })
  }
})

module.exports = router