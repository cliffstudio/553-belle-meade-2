#!/usr/bin/env node

/**
 * Deletes Sanity image assets that are not referenced by any document.
 *
 * Usage:
 *   SANITY_API_TOKEN=... npm run sanity:images:unused
 *   SANITY_API_TOKEN=... npm run sanity:images:unused:delete
 *
 * Optional env vars:
 *   SANITY_PROJECT_ID
 *   SANITY_DATASET
 *   SANITY_API_VERSION
 */

import fs from "node:fs"
import path from "node:path"

function loadEnvLocal(filePath) {
  if (!fs.existsSync(filePath)) return

  const raw = fs.readFileSync(filePath, "utf8")
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eqIndex = trimmed.indexOf("=")
    if (eqIndex < 0) continue

    const key = trimmed.slice(0, eqIndex).trim()
    if (!key || process.env[key] !== undefined) continue

    let value = trimmed.slice(eqIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

loadEnvLocal(path.resolve(process.cwd(), ".env.local"))

const projectId =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || "production"
const apiVersion = process.env.SANITY_API_VERSION || "2025-05-08"
const token = process.env.SANITY_API_TOKEN

const shouldDelete = process.argv.includes("--confirm")

if (!projectId) {
  console.error(
    "Missing project ID. Set SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID."
  )
  process.exit(1)
}

if (!token) {
  console.error("Missing SANITY_API_TOKEN (token must have write access).")
  process.exit(1)
}

const apiBase = `https://${projectId}.api.sanity.io/v${apiVersion}`

const query =
  '*[_type == "sanity.imageAsset" && count(*[references(^._id)]) == 0]{_id, originalFilename, url}'

async function sanityFetch(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  })

  const text = await response.text()
  let body = null

  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!response.ok) {
    const details =
      typeof body === "string" ? body : JSON.stringify(body, null, 2)
    throw new Error(`HTTP ${response.status} ${response.statusText}\n${details}`)
  }

  return body
}

function chunkArray(items, size) {
  const chunks = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

async function listUnusedImageAssets() {
  const params = new URLSearchParams({
    query,
    perspective: "raw",
  })
  const url = `${apiBase}/data/query/${dataset}?${params.toString()}`
  const data = await sanityFetch(url)
  return data.result || []
}

async function deleteAssets(assetIds) {
  const chunks = chunkArray(assetIds, 100)
  let deleted = 0

  for (const [index, ids] of chunks.entries()) {
    const mutations = ids.map((id) => ({ delete: { id } }))

    await sanityFetch(`${apiBase}/data/mutate/${dataset}`, {
      method: "POST",
      body: JSON.stringify({
        mutations,
        visibility: "sync",
      }),
    })

    deleted += ids.length
    console.log(`Deleted batch ${index + 1}/${chunks.length} (${deleted} total)`)
  }
}

async function main() {
  const assets = await listUnusedImageAssets()
  console.log(`Found ${assets.length} unused image asset(s).`)

  if (assets.length > 0) {
    const preview = assets.slice(0, 20)
    console.log("\nPreview (up to 20):")
    for (const asset of preview) {
      const name = asset.originalFilename || "(no filename)"
      console.log(`- ${asset._id}  ${name}`)
    }
  }

  if (!shouldDelete) {
    console.log(
      "\nDry run only. Re-run with --confirm to delete these assets."
    )
    return
  }

  if (assets.length === 0) {
    console.log("Nothing to delete.")
    return
  }

  await deleteAssets(assets.map((asset) => asset._id))
  console.log("Done.")
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
