const DB_NAME = 'turtleiq-images'
const DB_VERSION = 1
const STORE_NAME = 'images'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

async function compressImage(blob) {
  // GIFs: skip compression (would lose animation)
  if (blob.type === 'image/gif') return blob

  const MAX_PX = 1200
  const bitmap = await createImageBitmap(blob)
  const { width, height } = bitmap

  let w = width
  let h = height
  if (w > MAX_PX || h > MAX_PX) {
    const ratio = Math.min(MAX_PX / w, MAX_PX / h)
    w = Math.round(w * ratio)
    h = Math.round(h * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82))
}

export async function saveImage(blob, fileName) {
  const compressed = await compressImage(blob)
  const id = crypto.randomUUID()
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).add({ id, blob: compressed, fileName })
    tx.oncomplete = () => resolve(id)
    tx.onerror = e => reject(e.target.error)
  })
}

export async function getImageUrl(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(id)
    req.onsuccess = e => {
      const record = e.target.result
      if (!record) { resolve(null); return }
      resolve(URL.createObjectURL(record.blob))
    }
    req.onerror = e => reject(e.target.error)
  })
}

export async function deleteImage(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = e => reject(e.target.error)
  })
}

export const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif'])
export const ALLOWED_EXTENSIONS = '.png,.jpg,.jpeg,.gif'
