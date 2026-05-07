import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const show = useCallback((msg, type = 'default', dur = 2500) => {
    setToast({ msg, type, id: Date.now() })
    setTimeout(() => setToast(null), dur)
  }, [])

  return { toast, show }
}
