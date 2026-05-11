const prisma = require('../db')

// This function runs BEFORE every protected route
// It checks if the API key is valid
async function requireApiKey(req, res, next) {
  try {
    // Step 1: Get the API key from request headers
    const apiKey = req.headers['x-api-key']

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_KEY',
        message: 'Missing X-API-Key header'
      })
    }

    // Step 2: Find the key in database
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })

    // Step 3: Check if key exists
    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_KEY',
        message: 'API key not found'
      })
    }

    // Step 4: Check if key is active
    if (!keyRecord.isActive) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_KEY',
        message: 'API key has been revoked'
      })
    }

    // Step 5: Check if user account is approved
    if (keyRecord.user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'Your account is pending approval'
      })
    }

    // Step 6: Check daily rate limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const requestsToday = await prisma.requestLog.count({
      where: {
        apiKeyId: keyRecord.id,
        createdAt: { gte: today }
      }
    })

    if (requestsToday >= keyRecord.dailyLimit) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMITED',
        message: 'Daily request limit exceeded',
        limit: keyRecord.dailyLimit,
        reset: 'Resets at midnight'
      })
    }

    // Step 7: Log this request
    await prisma.requestLog.create({
      data: {
        apiKeyId: keyRecord.id,
        userId: keyRecord.userId,
        endpoint: req.path,
        method: req.method,
        statusCode: 200
      }
    })

    // Step 8: Update last used time
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() }
    })

    // Step 9: Attach user info to request for use in routes
    req.user = keyRecord.user
    req.apiKey = keyRecord

    // Step 10: Add rate limit headers to response
    res.setHeader('X-RateLimit-Limit', keyRecord.dailyLimit)
    res.setHeader('X-RateLimit-Remaining', keyRecord.dailyLimit - requestsToday - 1)

    // Continue to the actual route
    next()

  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Authentication failed'
    })
  }
}

module.exports = { requireApiKey }