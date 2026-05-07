import { md2html, COLOR_MAP, fmtDate, fileIcon, fileSize } from '../lib/utils'

export default function ReadView({ title, content, folderId, folders, updatedAt, attachments }) {
  const folder = folders.find(f => f.id === folderId)
  const col = folder ? COLOR_MAP[folder.color] || COLOR_MAP.green : null
  const html = md2html(content)

  return (
    <div style={wrap}>
      <h1 style={titleStyle}>{title || 'untitled'}</h1>

      <div style={meta}>
        {folder && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 999, border: `1px solid ${col.border}`, background: col.bg, color: col.text, letterSpacing: '0.3px' }}>
            {folder.name}
          </span>
        )}
        {updatedAt && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)' }}>
            updated {fmtDate(updatedAt)}
          </span>
        )}
      </div>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      {attachments && attachments.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>attachments</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {attachments.map(f => (
              <a key={f.id} href={f.url} target="_blank" rel="noopener" style={chipStyle}>
                <span style={{ fontSize: 14 }}>{fileIcon(f.name)}</span>
                <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ fontSize: 9, color: 'var(--text-faint)' }}>{fileSize(f.size)}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const wrap = { flex: 1, overflowY: 'auto', padding: '48px 60px 80px', maxWidth: 760, width: '100%' }
const titleStyle = { fontFamily: 'var(--font-ui)', fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.5px', lineHeight: 1.2 }
const meta = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, flexWrap: 'wrap' }
const chipStyle = { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: '1px solid var(--border-md)', borderRadius: 'var(--radius)', background: 'var(--surface2)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.15s' }
