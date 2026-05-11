require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { requireApiKey } = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Public routes (no API key needed)
app.use('/v1', require('./routes/auth'))
app.use('/v1', require('./routes/admin'))

// Protected routes (API key required)
app.use('/v1', requireApiKey, require('./routes/search'))
app.use('/v1', requireApiKey, require('./routes/states'))

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VillageAPI is running!',
    version: '1.0.0'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} does not exist`
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Something went wrong'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 VillageAPI running at http://localhost:${PORT}`)
})