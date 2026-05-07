import { useState } from 'react'
import { COLOR_MAP, fmtDateShort } from '../lib/utils'

export default function Sidebar({ folders, notes, currentNoteId, onToggleFolder, onNewNote, onNewFolder, onOpenNote, onSearch, onHome }) {
  const [search, setSearch] = useState('')

  const handleSearch = (val) => {
    setSearch(val)
    onSearch(val)
  }

  return (
    <aside style={aside}>
      {/* Brand */}
      <div onClick={onHome} style={brand}>
        <div style={brandName}>&gt; Jagadish's LS</div>
        <div style={brandSub}>learning space</div>
      </div>

      {/* Actions */}
      <div style={actionsRow}>
        <button onClick={onNewNote} style={primaryBtn}>+ note</button>
        <button onClick={onNewFolder} style={secondaryBtn}>+ folder</button>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="search notes..."
          style={searchInput}
        />
      </div>

      {/* Tree */}
      <div style={tree}>
        {folders.map(folder => {
          const folderNotes = notes.filter(n =>
            n.folder_id === folder.id &&
            (!search || n.title?.toLowerCase().includes(search.toLowerCase()))
          )
          if (search && folderNotes.length === 0) return null
          const col = COLOR_MAP[folder.color] || COLOR_MAP.green

          return (
            <div key={folder.id}>
              <div onClick={() => onToggleFolder(folder.id)} style={folderHd}>
                <span style={{ fontSize: 8, color: 'var(--text-faint)', transition: 'transform 0.2s', transform: folder.open ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.dot, display: 'inline-block', flexShrink: 0 }} />
                <span style={folderName}>{folder.name}</span>
                <span style={folderCount}>{folderNotes.length}</span>
              </div>

              {(folder.open || search) && (
                <div>
                  {folderNotes.map(note => (
                    <NoteRow
                      key={note.id}
                      note={note}
                      active={note.id === currentNoteId}
                      onClick={() => onOpenNote(note.id)}
                    />
                  ))}
                  {folderNotes.length === 0 && !search && (
                    <div style={{ padding: '4px 14px 4px 30px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)' }}>empty</div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Unfiled */}
        {(() => {
          const unfiledNotes = notes.filter(n => !n.folder_id && (!search || n.title?.toLowerCase().includes(search.toLowerCase())))
          if (unfiledNotes.length === 0) return null
          return (
            <div>
              <div style={{ ...folderHd, cursor: 'default' }}>
                <span style={{ width: 8, opacity: 0 }}>▶</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-faint)', display: 'inline-block' }} />
                <span style={folderName}>unfiled</span>
                <span style={folderCount}>{unfiledNotes.length}</span>
              </div>
              {unfiledNotes.map(note => (
                <NoteRow key={note.id} note={note} active={note.id === currentNoteId} onClick={() => onOpenNote(note.id)} />
              ))}
            </div>
          )
        })()}

        {notes.length === 0 && !search && (
          <div style={{ padding: '24px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center' }}>no notes yet</div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
        <button onClick={onNewFolder} style={addFolderBtn}>+ new folder</button>
      </div>
    </aside>
  )
}

function NoteRow({ note, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '5px 14px 5px 30px',
      cursor: 'pointer',
      borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
      background: active ? 'var(--accent-dim)' : 'transparent',
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--surface2)')}
      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: 11, color: active ? 'var(--accent)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: active ? 500 : 400 }}>
        {note.title || 'untitled'}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-faint)', flexShrink: 0 }}>
        {fmtDateShort(note.updated_at)}
      </span>
    </div>
  )
}

const aside = { width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }
const brand = { padding: '18px 16px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', userSelect: 'none' }
const brandName = { fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--accent)', letterSpacing: '-0.3px' }
const brandSub = { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', marginTop: 3, paddingLeft: 14 }
const actionsRow = { display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid var(--border)' }
const baseBtn = { flex: 1, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, padding: '6px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border-md)', cursor: 'pointer', letterSpacing: '0.3px', transition: 'all 0.15s' }
const primaryBtn = { ...baseBtn, background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent)' }
const secondaryBtn = { ...baseBtn, background: 'var(--surface2)', color: 'var(--text-muted)' }
const searchInput = { width: '100%', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '6px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border-md)', background: 'var(--surface2)', color: 'var(--text)', outline: 'none' }
const tree = { flex: 1, overflowY: 'auto', padding: '6px 0' }
const folderHd = { display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', cursor: 'pointer', userSelect: 'none', transition: 'background 0.1s' }
const folderName = { fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const folderCount = { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-faint)' }
const addFolderBtn = { width: '100%', fontFamily: 'var(--font-mono)', fontSize: 10, padding: 6, border: '1px dashed var(--border-md)', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer', letterSpacing: '0.3px' }
