import { useEffect, useState } from 'react'

const styles = {
  base: {
    position: 'fixed', bottom: 20, right: 20,
    background: 'var(--surface2)',
    border: '1px solid var(--border-md)',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    zIndex: 9000,
    letterSpacing: '0.3px',
    transition: 'all 0.2s',
    pointerEvents: 'none',
  },
  ok: { borderColor: 'var(--accent)', color: 'var(--accent)' },
  err: { borderColor: 'var(--red)', color: 'var(--red)' },
  hidden: { opacity: 0, transform: 'translateY(6px)' },
  visible: { opacity: 1, transform: 'translateY(0)' },
}

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setVisible(false)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
    }
  }, [toast])

  if (!toast) return null

  return (
    <div style={{
      ...styles.base,
      ...(toast.type === 'ok' ? styles.ok : toast.type === 'err' ? styles.err : {}),
      ...(visible ? styles.visible : styles.hidden),
    }}>
      {toast.msg}
    </div>
  )
}
