export default function Toolbar({ title, folderId, folders, isEditMode, isDirty, isSaving, onTitleChange, onFolderChange, onToggleMode, onSave, onExport, onDelete }) {
  return (
    <div style={toolbar}>
      <input
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder="untitled note..."
        style={titleInput}
      />

      <select value={folderId || ''} onChange={e => onFolderChange(e.target.value)} style={folderSel}>
        <option value="">— no folder —</option>
        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>

      <div style={divider} />

      <TBtn onClick={onToggleMode} accent={isEditMode}>{isEditMode ? 'preview' : 'edit'}</TBtn>
      <TBtn onClick={onSave} accent={!isEditMode} disabled={isSaving}>{isSaving ? 'saving…' : 'save'}</TBtn>
      <TBtn onClick={onExport}>export .md</TBtn>
      <TBtn onClick={onDelete} danger>delete</TBtn>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isDirty ? 'var(--amber)' : 'var(--text-faint)', minWidth: 60, textAlign: 'right', letterSpacing: '0.3px' }}>
        {isSaving ? 'saving…' : isDirty ? '● unsaved' : ''}
      </span>
    </div>
  )
}

function TBtn({ children, onClick, accent, danger, disabled }) {
  const style = {
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
    padding: '5px 12px', borderRadius: 'var(--radius)',
    border: `1px solid ${accent ? 'var(--accent)' : danger ? 'var(--border-md)' : 'var(--border-md)'}`,
    background: accent ? 'var(--accent-dim)' : 'var(--surface2)',
    color: accent ? 'var(--accent)' : 'var(--text-muted)',
    cursor: disabled ? 'default' : 'pointer',
    letterSpacing: '0.3px', whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s',
  }
  return (
    <button onClick={!disabled ? onClick : undefined} style={style}
      onMouseEnter={e => {
        if (disabled) return
        if (danger) { e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)' }
        else if (!accent) { e.currentTarget.style.color = 'var(--text)' }
      }}
      onMouseLeave={e => {
        if (disabled) return
        if (danger) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-md)' }
        else if (!accent) { e.currentTarget.style.color = 'var(--text-muted)' }
      }}
    >
      {children}
    </button>
  )
}

const toolbar = { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--border)', minHeight: 50, flexShrink: 0, background: 'var(--bg)' }
const titleInput = { flex: 1, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, border: 'none', background: 'transparent', color: 'var(--text)', outline: 'none' }
const folderSel = { fontFamily: 'var(--font-mono)', fontSize: 10, padding: '5px 8px', border: '1px solid var(--border-md)', borderRadius: 'var(--radius)', background: 'var(--surface2)', color: 'var(--text-muted)', outline: 'none', cursor: 'pointer' }
const divider = { width: 1, height: 18, background: 'var(--border-md)', flexShrink: 0 }
