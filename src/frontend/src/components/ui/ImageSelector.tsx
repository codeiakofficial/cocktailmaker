import * as React from 'react'
import { Button } from './button'
import { API_BASE } from '../../config'

interface ImageItem {
  url: string
  filename: string
  isDefault: boolean
}

interface ImageSelectorProps {
  value: string
  onChange: (url: string) => void
}

export function ImageSelector({ value, onChange }: ImageSelectorProps) {
  const [images, setImages] = React.useState<ImageItem[]>([])
  const [urlInput, setUrlInput] = React.useState('')
  const uploadRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    fetch(`${API_BASE}/images`)
      .then(r => r.json())
      .then(setImages)
      .catch(() => {})
  }, [])

  const handleDelete = async (img: ImageItem) => {
    await fetch(`${API_BASE}/images/${img.filename}`, { method: 'DELETE' })
    setImages(prev => prev.filter(i => i.filename !== img.filename))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/images`, { method: 'POST', body: form })
    if (!res.ok) return
    const { url, filename } = await res.json()
    const newItem: ImageItem = { url, filename, isDefault: false }
    setImages(prev => [...prev, newItem])
    onChange(url)
  }

  const handleUrlKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && urlInput.trim()) {
      onChange(urlInput.trim())
    }
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map(img => (
            <div
              key={img.url}
              data-selected={value === img.url ? 'true' : 'false'}
              className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${value === img.url ? 'border-primary' : 'border-transparent'}`}
              onClick={() => onChange(img.url)}
            >
              <img src={img.url} alt={img.filename} className="w-full h-16 object-cover" />
              {!img.isDefault && (
                <button
                  aria-label="Delete"
                  className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-xs leading-none"
                  onClick={e => { e.stopPropagation(); handleDelete(img) }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Image URL"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={handleUrlKey}
        />
        <Button variant="outline" onClick={() => uploadRef.current?.click()}>Upload</Button>
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  )
}
