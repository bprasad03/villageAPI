require('dotenv').config()
const express = require('express')
const router = express.Router()
const prisma = require('../db')

// Simple admin check middleware
function requireAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  next()
}

// GET /v1/admin/users — list all users
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        businessName: true,
        status: true,
        plan: true,
        createdAt: true,
        _count: { select: { apiKeys: true } }
      }
    })
    res.json({ success: true, count: users.length, data: users })
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

// POST /v1/admin/users/:id/approve
router.post('/admin/users/:id/approve', requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'ACTIVE' }
    })
    res.json({
      success: true,
      message: `${user.email} approved!`,
      data: { id: user.id, email: user.email, status: user.status }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

// POST /v1/admin/users/:id/suspend
router.post('/admin/users/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'SUSPENDED' }
    })
    res.json({ success: true, message: `${user.email} suspended.` })
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

// POST /v1/admin/users/:id/plan
router.post('/admin/users/:id/plan', requireAdmin, async (req, res) => {
  try {
    const { plan } = req.body
    const validPlans = ['FREE', 'PREMIUM', 'PRO', 'UNLIMITED']
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' })
    }
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { plan }
    })
    res.json({ success: true, message: `${user.email} upgraded to ${plan}` })
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

module.exports = router