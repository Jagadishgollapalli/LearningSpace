import { fmtDate, COLOR_MAP } from '../lib/utils'

function highlight(text, query) {
  if (!query || !text) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx < 0) return text
  const start = Math.max(0, idx - 60)
  const end = Math.min(text.length, idx + query.length + 100)
  let snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
  const safe = snippet.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi')
  return safe.replace(re, m => `<mark style="background:rgba(74,222,128,0.15);color:var(--accent);border-radius:2px;padding:0 2px">${m}</mark>`)
}

export default function SearchResults({ results, query, folders, onOpenNote }) {
  return (
    <div style={wrap}>
      <div style={heading}>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</div>
      {results.length === 0 && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>nothing found</div>
      )}
      {results.map(note => {
        const folder = folders.find(f => f.id === note.folder_id)
        const col = folder ? COLOR_MAP[folder.color] || COLOR_MAP.green : null
        const snip = highlight(note.content || '', query)
        return (
          <div key={note.id} onClick={() => onOpenNote(note.id)} style={item}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.background = 'var(--surface2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
          >
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{note.title || 'untitled'}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', marginBottom: snip ? 6 : 0, display: 'flex', gap: 8, alignItems: 'center' }}>
              {folder && <span style={{ color: col.text }}>{folder.name}</span>}
              <span>{fmtDate(note.updated_at)}</span>
            </div>
            {snip && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: snip }} />}
          </div>
        )
      })}
    </div>
  )
}

const wrap = { flex: 1, overflowY: 'auto', padding: '32px 60px', width: '100%' }
const heading = { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 16 }
const item = { padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 8, cursor: 'pointer', background: 'var(--surface)', transition: 'all 0.15s' }
