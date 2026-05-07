export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const fmtDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const fmtDateShort = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const fileIcon = (name = '') => {
  const ext = name.split('.').pop().toLowerCase()
  const map = {
    pdf: '📄', png: '🖼', jpg: '🖼', jpeg: '🖼', gif: '🖼', webp: '🖼',
    mp4: '🎬', mp3: '🎵', zip: '📦', doc: '📝', docx: '📝',
    xls: '📊', xlsx: '📊', ppt: '📊', pptx: '📊', svg: '🎨', txt: '📃',
  }
  return map[ext] || '📎'
}

export const fileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

export const COLOR_MAP = {
  green:  { dot: '#4ade80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.25)',  text: '#4ade80' },
  blue:   { dot: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.25)',  text: '#60a5fa' },
  purple: { dot: '#a78bfa', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.25)', text: '#a78bfa' },
  amber:  { dot: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.25)',  text: '#fbbf24' },
  red:    { dot: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)', text: '#f87171' },
  teal:   { dot: '#2dd4bf', bg: 'rgba(45,212,191,0.10)',  border: 'rgba(45,212,191,0.25)',  text: '#2dd4bf' },
  pink:   { dot: '#f472b6', bg: 'rgba(244,114,182,0.10)', border: 'rgba(244,114,182,0.25)', text: '#f472b6' },
  orange: { dot: '#fb923c', bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.25)',  text: '#fb923c' },
}

export const md2html = (md = '') => {
  if (!md) return ''
  let s = md

  const codeBlocks = []
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const i = codeBlocks.length
    const escaped = code.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    codeBlocks.push(`<pre><code class="lang-${lang}">${escaped}</code></pre>`)
    return `\x00CB${i}\x00`
  })

  const inlineCodes = []
  s = s.replace(/`([^`\n]+)`/g, (_, c) => {
    const i = inlineCodes.length
    const escaped = c.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    inlineCodes.push(`<code>${escaped}</code>`)
    return `\x00IC${i}\x00`
  })

  s = s.replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/gm, (_, hdr, body) => {
    const ths = hdr.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('')
    const rows = body.trim().split('\n').map(r =>
      `<tr>${r.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('')}</tr>`
    ).join('')
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>\n`
  })

  s = s.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
  s = s.replace(/^##### (.+)$/gm, '<h5>$1</h5>')
  s = s.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  s = s.replace(/^---$/gm, '<hr>')
  s = s.replace(/^> (.+)/gm, '<blockquote>$1</blockquote>')
  s = s.replace(/<\/blockquote>\n<blockquote>/g, '\n')
  s = s.replace(/^- \[x\] (.+)/gm, '<li style="list-style:none">✅ $1</li>')
  s = s.replace(/^- \[ \] (.+)/gm, '<li style="list-style:none">☐ $1</li>')
  s = s.replace(/^[-*] (.+)/gm, '<li>$1</li>')
  s = s.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
  s = s.replace(/^\d+\. (.+)/gm, '<li>$1</li>')
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  s = s.replace(/_([^_\n]+)_/g, '<em>$1</em>')
  s = s.replace(/\x00IC(\d+)\x00/g, (_, i) => inlineCodes[i])

  s = s.split('\n').map(line => {
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td|img)/.test(line.trim())) return line
    if (line.startsWith('\x00CB')) return line
    if (line.trim() === '') return '<br>'
    return `<p>${line}</p>`
  }).join('\n')

  s = s.replace(/\x00CB(\d+)\x00/g, (_, i) => codeBlocks[i])
  s = s.replace(/<p><br><\/p>/g, '').replace(/<p><\/p>/g, '')
  return s
}
