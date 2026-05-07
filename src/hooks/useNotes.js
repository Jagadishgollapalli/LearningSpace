import { useState, useEffect, useCallback } from 'react'
import { sb, BUCKET } from '../lib/supabase'

export function useNotes() {
  const [folders, setFolders] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [{ data: f }, { data: n }] = await Promise.all([
      sb.from('folders').select('*').order('created_at'),
      sb.from('notes').select('id,title,folder_id,created_at,updated_at').order('updated_at', { ascending: false }),
    ])
    setFolders((f || []).map(x => ({ ...x, open: false })))
    setNotes(n || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const createFolder = async (name, color) => {
    const { data, error } = await sb.from('folders').insert({ name, color }).select().single()
    if (error) throw error
    setFolders(prev => [...prev, { ...data, open: true }])
    return data
  }

  const deleteFolder = async (id) => {
    await sb.from('folders').delete().eq('id', id)
    setFolders(prev => prev.filter(f => f.id !== id))
  }

  const toggleFolder = (id) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, open: !f.open } : f))
  }

  const loadNoteContent = async (id) => {
    const { data, error } = await sb.from('notes').select('*').eq('id', id).single()
    if (error) throw error
    return data
  }

  const loadNoteFiles = async (noteId) => {
    const { data } = await sb.from('note_files').select('*').eq('note_id', noteId).order('created_at')
    return data || []
  }

  const saveNote = async ({ id, title, content, folder_id, stagedFiles = [] }) => {
    const now = new Date().toISOString()
    let noteId = id

    if (!id) {
      const { data, error } = await sb.from('notes')
        .insert({ title, content, folder_id: folder_id || null, created_at: now, updated_at: now })
        .select().single()
      if (error) throw error
      noteId = data.id
      setNotes(prev => [{ id: data.id, title, folder_id: folder_id || null, created_at: now, updated_at: now }, ...prev])
    } else {
      const { error } = await sb.from('notes')
        .update({ title, content, folder_id: folder_id || null, updated_at: now })
        .eq('id', id)
      if (error) throw error
      setNotes(prev => prev.map(n => n.id === id
        ? { ...n, title, folder_id: folder_id || null, updated_at: now }
        : n
      ))
    }

    // Upload staged files
    const uploadedFiles = []
    for (const file of stagedFiles) {
      const path = `${noteId}/${Date.now()}_${file.name}`
      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, file)
      if (upErr) continue
      const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(path)
      const { data: fileRow } = await sb.from('note_files')
        .insert({ note_id: noteId, name: file.name, path, url: urlData.publicUrl, size: file.size, mime: file.type })
        .select().single()
      if (fileRow) uploadedFiles.push(fileRow)
    }

    return { noteId, uploadedFiles }
  }

  const deleteNote = async (id) => {
    const files = await loadNoteFiles(id)
    for (const f of files) {
      await sb.storage.from(BUCKET).remove([f.path])
      await sb.from('note_files').delete().eq('id', f.id)
    }
    await sb.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const deleteFile = async (file) => {
    await sb.storage.from(BUCKET).remove([file.path])
    await sb.from('note_files').delete().eq('id', file.id)
  }

  const searchNotes = async (query) => {
    const { data } = await sb.from('notes')
      .select('id,title,folder_id,updated_at,content')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(20)
    return data || []
  }

  return {
    folders, notes, loading,
    toggleFolder, createFolder, deleteFolder,
    loadNoteContent, loadNoteFiles, saveNote, deleteNote, deleteFile,
    searchNotes, reload: loadAll,
  }
}
