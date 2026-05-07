import { useRef, useState } from 'react'
import { fileIcon, fileSize } from '../lib/utils'

const FORMAT_ACTIONS = [
  { label: 'H1', before: '# ', after: '' },
  { label: 'H2', before: '## ', after: '' },
  { label: 'H3', before: '### ', after: '' },
  null,
  { label: 'B', before: '**', after: '**', bold: true },
  { label: 'I', before: '*', after: '*', italic: true },
  { label: 'code', before: '`', after: '`', mono: true },
  { label: 'block', before: '\n```\n', after: '\n```' },
  null,
  { label: '— list', before: '- ', after: '' },
  { label: '☐ task', before: '- [ ] ', after: '' },
  { label: 'quote', before: '> ', after: '' },
  { label: 'hr', before: '---\n', after: '' },
  { label: 'link', before: '[text](url)', after: '' },
  { label: 'table', before: '| col1 | col2 |\n|------|------|\n| val  | val  |\n', after: '' },
]

export default function Editor({ value, onChange, existingFiles, stagedFiles, onStagedFilesChange, onDeleteExistingFile }) {
  const taRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const insertFormat = (before, after) => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    const selected = ta.value.slice(s, e)
    const newVal = ta.value.slice(0, s) + before + selected + after + ta.value.slice(e)
    onChange(newVal)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(s + before.length, s + before.length + selected.length)
    }, 0)
  }

  const handleFiles = (files) => {
    const arr = Array.from(files)
    onStagedFilesChange(prev => [...prev, ...arr])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeStaged = (idx) => {
    onStagedFilesChange(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Format bar */}
      <div style={fmtBar}>
        <span style={fmtLabel}>fmt:</span>
        {FORMAT_ACTIONS.map((action, idx) =>
          action === null
            ? <span key={idx} style={sep} />
            : (
              <button
                key={action.label}
                onClick={() => insertFormat(action.before, action.after)}
                style={{
                  ...fmtBtn,
                  fontWeight: action.bold ? 700 : action.italic ? 400 : 400,
                  fontStyle: action.italic ? 'italic' : 'normal',
                  fontFamily: action.mono ? 'var(--font-mono)' : 'var(--font-mono)',
                }}
              >
                {action.label}
              </button>
            )
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        placeholder={`write in markdown...\n\n# heading\n**bold**  *italic*  \`code\`\n\n- list item\n- [ ] task\n\n> blockquote\n\ndrag files here to attach`}
        style={textarea}
      />

      {/* Drop overlay */}
      {dragging && (
        <div style={dropOverlay}>drop files to attach</div>
      )}

      {/* File panel */}
      <div style={filePanel}>
        <label style={uploadBtn}>
          📎 attach file
          <input type="file" multiple onChange={e => { handleFiles(e.target.files); e.target.value = '' }} style={{ display: 'none' }} />
        </label>

        {existingFiles.map(f => (
          <FileChip key={f.id} name={f.name} size={f.size} onRemove={() => onDeleteExistingFile(f)} />
        ))}

        {stagedFiles.map((f, i) => (
          <FileChip key={i} name={f.name} size={f.size} staged onRemove={() => removeStaged(i)} />
        ))}
      </div>
    </div>
  )
}

function FileChip({ name, size, staged, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      border: `1px solid ${staged ? 'var(--accent)' : 'var(--border-md)'}`,
      borderRadius: 'var(--radius)',
      background: 'var(--surface2)',
      fontFamily: 'var(--font-mono)', fontSize: 10,
      color: staged ? 'var(--accent)' : 'var(--text-muted)',
    }}>
      {fileIcon(name)}
      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ fontSize: 9, color: 'var(--text-faint)' }}>{fileSize(size)}</span>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '0 0 0 2px' }}>×</button>
    </div>
  )
}

const fmtBar = { display: 'flex', alignItems: 'center', gap: 3, padding: '6px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', flexShrink: 0 }
const fmtLabel = { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.5px', textTransform: 'uppercase', paddingRight: 4 }
const fmtBtn = { fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 7px', borderRadius: 4, border: '1px solid transparent', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.1s', letterSpacing: '0.2px' }
const sep = { width: 1, height: 14, background: 'var(--border)', margin: '0 3px', flexShrink: 0, display: 'inline-block' }
const textarea = { flex: 1, width: '100%', fontFamily: 'var(--font-mono)', fontSize: '13.5px', lineHeight: 1.75, color: 'var(--text)', background: 'var(--bg)', border: 'none', outline: 'none', resize: 'none', padding: '32px 60px', tabSize: 2, caretColor: 'var(--accent)' }
const dropOverlay = { position: 'absolute', inset: 0, background: 'rgba(74,222,128,0.06)', border: '2px dashed var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', letterSpacing: '0.5px', pointerEvents: 'none', zIndex: 10 }
const filePanel = { borderTop: '1px solid var(--border)', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0, minHeight: 44 }
const uploadBtn = { fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 10px', border: '1px dashed var(--border-md)', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer', letterSpacing: '0.3px', transition: 'all 0.15s' }
