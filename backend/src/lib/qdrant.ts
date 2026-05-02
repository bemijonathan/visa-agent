import { QdrantClient } from '@qdrant/js-client-rest'

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333'
const COLLECTION_NAME = 'visa_documents'

export const qdrantClient = new QdrantClient({ url: QDRANT_URL })

export async function ensureCollection() {
  const collections = await qdrantClient.getCollections()
  const exists = collections.collections.some(c => c.name === COLLECTION_NAME)

  if (!exists) {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 768, // Google text-embedding-004 dimension
        distance: 'Cosine',
      },
    })
  }

  return COLLECTION_NAME
}

export async function upsertVectors(
  points: Array<{
    id: string
    vector: number[]
    payload: Record<string, unknown>
  }>
) {
  await qdrantClient.upsert(COLLECTION_NAME, {
    points: points.map(p => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload,
    })),
  })
}

export async function searchVectors(
  vector: number[],
  limit: number = 5,
  filter?: Record<string, unknown>
) {
  const results = await qdrantClient.search(COLLECTION_NAME, {
    vector,
    limit,
    filter: filter as any,
    with_payload: true,
  })

  return results
}

export async function deleteVectors(ids: string[]) {
  await qdrantClient.delete(COLLECTION_NAME, {
    points: ids,
  })
}
