import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ImageSelector } from './ImageSelector'

const DEFAULT_IMAGE = { url: 'http://localhost:8080/defaults/bg.jpg', filename: 'bg.jpg', isDefault: true }
const UPLOADED_IMAGE = { url: 'http://localhost:8080/uploads/photo.jpg', filename: 'photo.jpg', isDefault: false }

function stubFetch(images = [DEFAULT_IMAGE, UPLOADED_IMAGE]) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(images),
  }))
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('ImageSelector', () => {
  test('fetches and renders thumbnails from GET /api/images', async () => {
    stubFetch()
    render(<ImageSelector value="" onChange={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2)
    })
  })

  test('clicking a thumbnail calls onChange with its URL', async () => {
    stubFetch()
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ImageSelector value="" onChange={onChange} />)
    await waitFor(() => screen.getAllByRole('img'))
    await user.click(screen.getAllByRole('img')[0])
    expect(onChange).toHaveBeenCalledWith(DEFAULT_IMAGE.url)
  })

  test('delete button is not shown for default images', async () => {
    stubFetch([DEFAULT_IMAGE])
    render(<ImageSelector value="" onChange={vi.fn()} />)
    await waitFor(() => screen.getAllByRole('img'))
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  test('delete button is shown for uploaded images', async () => {
    stubFetch([UPLOADED_IMAGE])
    render(<ImageSelector value="" onChange={vi.fn()} />)
    await waitFor(() => screen.getAllByRole('img'))
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  test('clicking delete calls DELETE /api/images/{filename} and removes thumbnail', async () => {
    const deleteFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([UPLOADED_IMAGE]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
    )
    const user = userEvent.setup()
    render(<ImageSelector value="" onChange={vi.fn()} />)
    await waitFor(() => screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('/images/photo.jpg'),
      expect.objectContaining({ method: 'DELETE' })
    )
    await waitFor(() => expect(screen.queryAllByRole('img')).toHaveLength(0))
  })

  test('selected thumbnail is visually highlighted', async () => {
    stubFetch([DEFAULT_IMAGE])
    render(<ImageSelector value={DEFAULT_IMAGE.url} onChange={vi.fn()} />)
    await waitFor(() => screen.getAllByRole('img'))
    const thumb = screen.getAllByRole('img')[0].closest('[data-selected]')
    expect(thumb).toHaveAttribute('data-selected', 'true')
  })

  test('renders URL input and Upload button', async () => {
    stubFetch()
    render(<ImageSelector value="" onChange={vi.fn()} />)
    await waitFor(() => screen.getAllByRole('img'))
    expect(screen.getByPlaceholderText(/image url/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument()
  })

  test('typing URL and pressing Enter calls onChange', async () => {
    stubFetch([])
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ImageSelector value="" onChange={onChange} />)
    await waitFor(() => {})
    const input = screen.getByPlaceholderText(/image url/i)
    await user.type(input, 'https://example.com/img.jpg')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('https://example.com/img.jpg')
  })
})
