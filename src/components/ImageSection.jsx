import { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { saveImage, deleteImage, ALLOWED_TYPES, ALLOWED_EXTENSIONS } from '../store/imageStore'

export default function ImageSection({ conceptId, images = [] }) {
  const addConceptImage    = useStore(s => s.addConceptImage)
  const removeConceptImage = useStore(s => s.removeConceptImage)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState('')
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Only PNG, JPG, JPEG, and GIF files are supported.')
      return
    }
    setError('')
    setUploading(true)
    try {
      const imageId = await saveImage(file, file.name)
      addConceptImage(conceptId, imageId, file.name)
    } catch (err) {
      setError('Failed to save image. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(imageId) {
    removeConceptImage(conceptId, imageId)
    try { await deleteImage(imageId) } catch (_) { /* best effort */ }
  }

  function copyRef(imageId, fileName) {
    const ref = `![${fileName}](tiq-img://${imageId})`
    navigator.clipboard.writeText(ref)
    setCopied(imageId)
    setTimeout(() => setCopied(''), 1800)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-400 italic">
          {images.length === 0 ? 'Add images for referencing in the Markdown editors' : `${images.length} image${images.length !== 1 ? 's' : ''}`}
        </span>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading…' : '+ Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS}
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 px-4 py-2 border-b border-gray-100">{error}</p>
      )}

      {images.length > 0 && (
        <div className="divide-y divide-gray-50">
          {images.map(({ imageId, fileName }) => (
            <div key={imageId} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex-1 text-xs text-gray-700 truncate" title={fileName}>{fileName}</span>
              <code className="text-xs text-gray-400 font-mono truncate max-w-[160px]" title={`tiq-img://${imageId}`}>
                tiq-img://{imageId.slice(0, 8)}…
              </code>
              <button
                onClick={() => copyRef(imageId, fileName)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex-shrink-0 transition-colors"
                title="Copy markdown reference"
              >
                {copied === imageId ? 'Copied!' : 'Copy ref'}
              </button>
              <button
                onClick={() => handleDelete(imageId)}
                className="text-gray-300 hover:text-red-500 transition-colors text-sm leading-none flex-shrink-0"
                title="Remove image"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
