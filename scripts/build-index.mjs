#!/usr/bin/env node
/**
 * Fetches all 10,000 Normie pixels + traits from api.normies.art
 * and writes compact index files to public/data/
 *
 * Usage:
 *   node scripts/build-index.mjs          # full 10k (~3h at 55 req/min)
 *   node scripts/build-index.mjs --stub   # first 200 for dev
 *   node scripts/build-index.mjs --from 500 --to 999
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'data')
const BASE_URL = 'https://api.normies.art'
const PIXEL_BYTES = 200
const REQUESTS_PER_MINUTE = 55
const DELAY_MS = Math.ceil(60000 / REQUESTS_PER_MINUTE)

const args = process.argv.slice(2)
const isStub = args.includes('--stub')
const fromIdx = isStub ? 0 : parseInt(getArg('--from', '0'), 10)
const toIdx = isStub ? 199 : parseInt(getArg('--to', '9999'), 10)

function getArg(flag, fallback) {
  const i = args.indexOf(flag)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function pixelsStringToBytes(str) {
  const bytes = new Uint8Array(PIXEL_BYTES)
  for (let i = 0; i < 1600; i++) {
    if (str[i] === '1') {
      const byteIdx = Math.floor(i / 8)
      const bitIdx = 7 - (i % 8)
      bytes[byteIdx] |= 1 << bitIdx
    }
  }
  return bytes
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url)
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '60', 10)
      console.log(`  Rate limited, waiting ${retryAfter}s...`)
      await sleep(retryAfter * 1000)
      continue
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return res
  }
  throw new Error(`Failed after ${retries} retries: ${url}`)
}

async function loadExisting() {
  const pixelsPath = join(OUT_DIR, 'normies-pixels.bin')
  const traitsPath = join(OUT_DIR, 'normies-traits.json')

  const totalSize = 10000 * PIXEL_BYTES
  let pixels
  let traits = []

  if (existsSync(pixelsPath)) {
    const buf = await readFile(pixelsPath)
    pixels = new Uint8Array(totalSize)
    pixels.set(buf)
    console.log(`Resuming pixels: ${buf.length} bytes loaded`)
  } else {
    pixels = new Uint8Array(totalSize)
  }

  if (existsSync(traitsPath)) {
    const parsed = JSON.parse(await readFile(traitsPath, 'utf8'))
    traits = new Array(10000).fill(null)
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (entry && typeof entry.id === 'number') {
          traits[entry.id] = entry
        }
      }
      for (let i = 0; i < parsed.length; i++) {
        if (parsed[i]?.attributes && traits[i] === null) {
          traits[i] = parsed[i]
        }
      }
    }
    console.log(`Resuming traits: ${traits.filter(Boolean).length} entries`)
  } else {
    traits = new Array(10000).fill(null)
  }

  return { pixels, traits }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const { pixels, traits } = await loadExisting()
  const start = Math.max(0, fromIdx)
  const end = Math.min(9999, toIdx)
  const total = end - start + 1

  console.log(`Building index for IDs ${start}–${end} (${total} normies)`)
  console.log(`Rate: ~${REQUESTS_PER_MINUTE} req/min, delay ${DELAY_MS}ms`)

  let fetched = 0
  const t0 = Date.now()

  for (let id = start; id <= end; id++) {
    if (traits[id]?.attributes?.length > 0) {
      continue
    }

    try {
      const [pixelsRes, traitsRes] = await Promise.all([
        fetchWithRetry(`${BASE_URL}/normie/${id}/pixels`),
        fetchWithRetry(`${BASE_URL}/normie/${id}/traits`),
      ])

      const pixelStr = await pixelsRes.text()
      const traitsData = await traitsRes.json()

      if (pixelStr.length !== 1600) {
        console.warn(`  ID ${id}: unexpected pixel length ${pixelStr.length}`)
      }

      const bytes = pixelsStringToBytes(pixelStr)
      pixels.set(bytes, id * PIXEL_BYTES)
      traits[id] = { id, attributes: traitsData.attributes }

      fetched++
      if (fetched % 10 === 0 || id === end) {
        const elapsed = (Date.now() - t0) / 1000
        const rate = fetched / (elapsed / 60)
        console.log(`  [${id}/${end}] ${fetched} fetched (${rate.toFixed(1)}/min)`)
      }

      if (fetched % 50 === 0) {
        await save(pixels, traits)
      }
    } catch (err) {
      console.error(`  Error at ID ${id}:`, err.message)
      await save(pixels, traits)
      throw err
    }

    await sleep(DELAY_MS)
  }

  await save(pixels, traits)
  console.log('Done!')
}

async function save(pixels, traits) {
  const pixelsPath = join(OUT_DIR, 'normies-pixels.bin')
  const traitsPath = join(OUT_DIR, 'normies-traits.json')

  await writeFile(pixelsPath, Buffer.from(pixels))
  await writeFile(traitsPath, JSON.stringify(traits))
  console.log(`  Saved ${traits.filter(Boolean).length} traits, ${pixels.length} bytes`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
