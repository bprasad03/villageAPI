const { PrismaClient } = require('@prisma/client')

// We create ONE prisma instance and reuse it everywhere
// Creating a new instance per request would be very slow
const prisma = new PrismaClient({
  log: ['error']
})

module.exports = prisma