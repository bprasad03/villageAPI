require('dotenv').config()
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const prisma = require('../db')

// Helper — generate a random API key
function generateApiKey() {
  return 'ak_' + crypto.randomBytes(16).toString('hex')
}

// Helper — generate a random API secret
function generateApiSecret() {
  return 'as_' + crypto.randomBytes(16).toString('hex')
}

// POST /v1/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { email, businessName, password, phone } = req.body

    // Validate required fields
    if (!email || !businessName || !password) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'email, businessName and password are required'
      })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'An account with this email already exists'
      })
    }

    // Hash the password — never store plain text passwords!
    // bcrypt turns "mypassword123" into "$2a$10$xyz..." 
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        businessName,
        password: hashedPassword,
        status: 'PENDING'
      }
    })

    res.status(201).json({
      success: true,
      message: 'Account created! Waiting for admin approval.',
      data: {
        id: user.id,
        email: user.email,
        businessName: user.businessName,
        status: user.status
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

// POST /v1/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'email and password are required'
      })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      })
    }

    // Get their API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id, isActive: true },
      select: {
        id: true,
        name: true,
        key: true,
        dailyLimit: true,
        lastUsed: true,
        createdAt: true
      }
    })

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        businessName: user.businessName,
        status: user.status,
        plan: user.plan,
        apiKeys
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

// POST /v1/auth/create-key — create a new API key
router.post('/auth/create-key', async (req, res) => {
  try {
    const { email, password, keyName } = req.body

    // Verify user first
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS' })
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'Account not yet approved by admin'
      })
    }

    // Check key limit (max 5 per user)
    const keyCount = await prisma.apiKey.count({
      where: { userId: user.id, isActive: true }
    })

    if (keyCount >= 5) {
      return res.status(400).json({
        success: false,
        error: 'KEY_LIMIT',
        message: 'Maximum 5 active API keys allowed'
      })
    }

    // Generate key and secret
    const key    = generateApiKey()
    const secret = generateApiSecret()
    const hashedSecret = await bcrypt.hash(secret, 10)

    // Set daily limit based on plan
    const planLimits = {
      FREE: 5000,
      PREMIUM: 50000,
      PRO: 300000,
      UNLIMITED: 1000000
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        name: keyName || 'My API Key',
        key,
        secret: hashedSecret,
        userId: user.id,
        dailyLimit: planLimits[user.plan] || 5000
      }
    })

    res.status(201).json({
      success: true,
      message: 'API key created. Save your secret — it will not be shown again!',
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        secret: secret, // shown ONCE only
        dailyLimit: apiKey.dailyLimit
      }
    })

  } catch (error) {
    console.error('Create key error:', error)
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' })
  }
})

module.exports = router