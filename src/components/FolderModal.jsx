import { useState, useEffect } from 'react'

const COLORS = [
  { value: 'green',  dot: '#4ade80' },
  { value: 'blue',   dot: '#60a5fa' },
  { value: 'purple', dot: '#a78bfa' },
  { value: 'amber',  dot: '#fbbf24' },
  { value: 'red',    dot: '#f87171' },
  { value: 'teal',   dot: '#2dd4bf' },
  { value: 'pink',   dot: '#f472b6' },
  { value: 'orange', dot: '#fb923c' },
]

export default function FolderModal({ open, onClose, onConfirm }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('green')

  useEffect(() => { if (!open) { setName(''); setColor('green') } }, [open])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  if (!open) return null

  const submit = () => {
    if (!name.trim()) return
    onConfirm(name.trim(), color)
    onClose()
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={overlay}>
      <div style={box}>
        <p style={heading}>// new folder</p>

        <span style={fieldLabel}>name</span>
        <input
          autoFocus value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="e.g. Backend, DB, Ideas..."
          maxLength={40}
          style={inputStyle}
        />

        <span style={{ ...fieldLabel, display: 'block', marginTop: 12 }}>color</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6, marginBottom: 20 }}>
          {COLORS.map(c => (
            <label key={c.value} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: color === c.value ? c.dot : 'var(--text-muted)' }}>
              <input type="radio" name="fc_modal" checked={color === c.value} onChange={() => setColor(c.value)} style={{ display: 'none' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, display: 'inline-block', outline: color === c.value ? `2px solid ${c.dot}` : '2px solid transparent', outlineOffset: 2 }} />
              {c.value}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtn}>cancel</button>
          <button onClick={submit} style={confirmBtn}>create</button>
        </div>
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }
const box = { background: 'var(--surface)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: 24, width: 420, maxWidth: '92vw' }
const heading = { fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 16, letterSpacing: '0.3px' }
const fieldLabel = { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 5, display: 'block' }
const inputStyle = { width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 12px', border: '1px solid var(--border-md)', borderRadius: 'var(--radius)', background: 'var(--surface2)', color: 'var(--text)', outline: 'none' }
const baseBtn = { fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, padding: '5px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border-md)', cursor: 'pointer', letterSpacing: '0.3px' }
const cancelBtn = { ...baseBtn, background: 'var(--surface2)', color: 'var(--text-muted)' }
const confirmBtn = { ...baseBtn, background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent)' }
