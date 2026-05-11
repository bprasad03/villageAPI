require('dotenv').config()
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient({ log: ['error'] })

async function withRetry(fn, retries = 5, delay = 4000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      const isConnectionError =
        error.message.includes('Server has closed the connection') ||
        error.message.includes("Can't reach database") ||
        error.message.includes('Connection refused') ||
        error.message.includes('Connection reset') ||
        error.message.includes('Timed out fetching') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('forcibly closed')

      if (isConnectionError && i < retries - 1) {
        console.log(`   ⚠ Connection dropped. Waiting ${delay/1000}s then retrying... (${i + 2}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
}

async function importFile(filePath) {
  console.log(`\n📂 Reading: ${path.basename(filePath)}`)

  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1)

  const validRows = rows.filter(row => {
    const stateCode   = String(row[0] || '').trim()
    const stateName   = String(row[1] || '').trim()
    const villageCode = String(row[6] || '').trim()
    const villageName = String(row[7] || '').trim()
    if (!stateCode || !stateName) return false
    if (villageCode === '000000' || villageCode === '0') return false
    if (!villageName || villageName === stateName) return false
    return true
  })

  console.log(`   Valid rows: ${validRows.length}`)
  if (validRows.length === 0) return 0

  const stateCode = String(validRows[0][0]).trim()
  const stateName = String(validRows[0][1]).trim()

  // Skip already imported states
  const existing = await withRetry(() => prisma.state.findUnique({
    where: { code: stateCode },
    include: { _count: { select: { districts: true } } }
  }))

  if (existing && existing._count.districts > 0) {
    console.log(`   ⏭  ${stateName} already done — skipping!`)
    return 0
  }

  // Insert State
  const state = await withRetry(() => prisma.state.upsert({
    where: { code: stateCode },
    update: {},
    create: { code: stateCode, name: stateName }
  }))
  console.log(`   ✓ State: ${stateName}`)

  // Collect unique districts
  const districtMap = {}
  for (const row of validRows) {
    const code = String(row[2]).trim()
    const name = String(row[3]).trim()
    if (!districtMap[code]) districtMap[code] = name
  }

  // Insert districts one by one (stable on free tier)
  for (const [code, name] of Object.entries(districtMap)) {
    const d = await withRetry(() => prisma.district.upsert({
      where: { code_stateId: { code, stateId: state.id } },
      update: {},
      create: { code, name, stateId: state.id }
    }))
    districtMap[code] = { id: d.id, name }
  }
  console.log(`   ✓ Districts: ${Object.keys(districtMap).length}`)

  // Collect unique sub-districts
  const subDistrictMap = {}
  for (const row of validRows) {
    const distCode   = String(row[2]).trim()
    const code       = String(row[4]).trim()
    const name       = String(row[5]).trim()
    const districtId = districtMap[distCode].id
    const key        = `${code}_${districtId}`
    if (!subDistrictMap[key]) subDistrictMap[key] = { code, name, districtId }
  }

  // Insert sub-districts one by one (stable on free tier)
  for (const [key, val] of Object.entries(subDistrictMap)) {
    const sd = await withRetry(() => prisma.subDistrict.upsert({
      where: { code_districtId: { code: val.code, districtId: val.districtId } },
      update: {},
      create: { code: val.code, name: val.name, districtId: val.districtId }
    }))
    subDistrictMap[key] = { ...val, id: sd.id }
  }
  console.log(`   ✓ Sub-districts: ${Object.keys(subDistrictMap).length}`)

  // Villages in batches of 1000
  const BATCH_SIZE = 1000
  let villageCount = 0

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE)

    const villageData = batch.map(row => {
      const distCode      = String(row[2]).trim()
      const subDistCode   = String(row[4]).trim()
      const districtId    = districtMap[distCode].id
      const key           = `${subDistCode}_${districtId}`
      const subDistrictId = subDistrictMap[key].id
      return {
        code: String(row[6]).trim(),
        name: String(row[7]).trim(),
        subDistrictId
      }
    })

    await withRetry(() => prisma.village.createMany({
      data: villageData,
      skipDuplicates: true
    }))

    villageCount += batch.length
    console.log(`   ✓ ${villageCount}/${validRows.length} villages...`)
  }

  console.log(`   ✅ Done! ${villageCount} villages imported.`)
  return villageCount
}

async function main() {
  console.log('🚀 Starting Village API import...\n')

  const datasetFolder = path.join(__dirname, '..', 'dataset')
  const files = fs.readdirSync(datasetFolder)
    .filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'))
    .sort()

  console.log(`📁 Found ${files.length} state files\n`)

  let totalVillages = 0
  let skipped = 0

  for (const file of files) {
    const count = await importFile(path.join(datasetFolder, file))
    if (count === 0) skipped++
    else totalVillages += count
  }

  console.log(`\n🎉 Import complete!`)
  console.log(`📊 Total villages imported: ${totalVillages}`)
  console.log(`⏭  States skipped: ${skipped}`)

  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error('❌ Import failed:', error.message)
  await prisma.$disconnect()
  process.exit(1)
})