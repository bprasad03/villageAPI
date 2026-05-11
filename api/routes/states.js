const express = require('express')
const router = express.Router()
const prisma = require('../db')

// GET /v1/states — list all states
router.get('/states', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        _count: { select: { districts: true } }
      }
    })

    res.json({
      success: true,
      count: states.length,
      data: states.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        districtCount: s._count.districts
      }))
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

// GET /v1/states/:id/districts
router.get('/states/:id/districts', async (req, res) => {
  try {
    const stateId = parseInt(req.params.id)

    const districts = await prisma.district.findMany({
      where: { stateId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        _count: { select: { subDistricts: true } }
      }
    })

    if (districts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'State not found or has no districts'
      })
    }

    res.json({
      success: true,
      count: districts.length,
      data: districts.map(d => ({
        id: d.id,
        code: d.code,
        name: d.name,
        subDistrictCount: d._count.subDistricts
      }))
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

// GET /v1/districts/:id/subdistricts
router.get('/districts/:id/subdistricts', async (req, res) => {
  try {
    const districtId = parseInt(req.params.id)

    const subDistricts = await prisma.subDistrict.findMany({
      where: { districtId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        _count: { select: { villages: true } }
      }
    })

    if (subDistricts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'District not found or has no sub-districts'
      })
    }

    res.json({
      success: true,
      count: subDistricts.length,
      data: subDistricts.map(sd => ({
        id: sd.id,
        code: sd.code,
        name: sd.name,
        villageCount: sd._count.villages
      }))
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

// GET /v1/subdistricts/:id/villages
router.get('/subdistricts/:id/villages', async (req, res) => {
  try {
    const subDistrictId = parseInt(req.params.id)
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 50
    const skip  = (page - 1) * limit

    const [villages, total] = await Promise.all([
      prisma.village.findMany({
        where: { subDistrictId },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        select: { id: true, code: true, name: true }
      }),
      prisma.village.count({ where: { subDistrictId } })
    ])

    res.json({
      success: true,
      count: villages.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: villages
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

module.exports = router