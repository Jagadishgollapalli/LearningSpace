import { useState, useEffect, useCallback, useRef } from 'react'
import '../styles/global.css'

import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import Editor from './Editor'
import ReadView from './ReadView'
import SearchResults from './SearchResults'
import FolderModal from './FolderModal'
import Toast from './Toast'

import { useNotes } from '../hooks/useNotes'
import { useToast } from '../hooks/useToast'

const VIEW = { WELCOME: 'welcome', READ: 'read', EDIT: 'edit', SEARCH: 'search' }

export default function App() {
  const { folders, notes, loading, toggleFolder, createFolder, loadNoteContent, loadNoteFiles, saveNote, deleteNote, deleteFile, searchNotes } = useNotes()
  const { toast, show: showToast } = useToast()

  const [view, setView] = useState(VIEW.WELCOME)
  const [currentNote, setCurrentNote] = useState(null) // full note object
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [folderId, setFolderId] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [existingFiles, setExistingFiles] = useState([])
  const [stagedFiles, setStagedFiles] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [folderModalOpen, setFolderModalOpen] = useState(false)

  const searchTimeout = useRef(null)

  // Guard: unsaved changes
  const guardDirty = () => {
    if (isDirty) return window.confirm('You have unsaved changes. Discard?')
    return true
  }

  const resetEditor = () => {
    setTitle(''); setContent(''); setFolderId(''); setCurrentNote(null)
    setIsDirty(false); setStagedFiles([]); setExistingFiles([])
  }

  // New note
  const handleNewNote = () => {
    if (!guardDirty()) return
    resetEditor()
    setView(VIEW.EDIT)
  }

  // Open note
  const handleOpenNote = useCallback(async (id) => {
    if (currentNote?.id === id) return
    if (!guardDirty()) return
    try {
      const note = await loadNoteContent(id)
      const files = await loadNoteFiles(id)
      setCurrentNote(note)
      setTitle(note.title || '')
      setContent(note.content || '')
      setFolderId(note.folder_id || '')
      setExistingFiles(files)
      setStagedFiles([])
      setIsDirty(false)
      setView(VIEW.READ)
    } catch (e) {
      showToast('Failed to load note', 'err')
    }
  }, [currentNote, loadNoteContent, loadNoteFiles]) // eslint-disable-line

  // Save
  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const { noteId, uploadedFiles } = await saveNote({
        id: currentNote?.id,
        title: title.trim() || 'untitled',
        content,
        folder_id: folderId || null,
        stagedFiles,
      })
      if (!currentNote) {
        const note = await loadNoteContent(noteId)
        setCurrentNote(note)
      } else {
        setCurrentNote(prev => ({ ...prev, title: title.trim() || 'untitled', content, folder_id: folderId || null, updated_at: new Date().toISOString() }))
      }
      setExistingFiles(prev => [...prev, ...uploadedFiles])
      setStagedFiles([])
      setIsDirty(false)
      showToast('saved ✓', 'ok')
    } catch (e) {
      showToast('Save failed: ' + e.message, 'err')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete note
  const handleDelete = async () => {
    if (!currentNote) return
    if (!window.confirm(`Delete "${title || 'untitled'}"? This cannot be undone.`)) return
    try {
      await deleteNote(currentNote.id)
      resetEditor()
      setView(VIEW.WELCOME)
      showToast('note deleted')
    } catch (e) {
      showToast('Delete failed', 'err')
    }
  }

  // Delete existing file
  const handleDeleteFile = async (file) => {
    if (!window.confirm('Remove this attachment?')) return
    try {
      await deleteFile(file)
      setExistingFiles(prev => prev.filter(f => f.id !== file.id))
      showToast('file removed')
    } catch (e) {
      showToast('Failed to remove file', 'err')
    }
  }

  // Export
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.md'
    a.click()
  }

  // Toggle mode
  const handleToggleMode = () => {
    setView(v => v === VIEW.EDIT ? VIEW.READ : VIEW.EDIT)
  }

  // Search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
    clearTimeout(searchTimeout.current)
    if (!query.trim()) {
      setView(v => v === VIEW.SEARCH ? VIEW.WELCOME : v)
      return
    }
    searchTimeout.current = setTimeout(async () => {
      const results = await searchNotes(query)
      setSearchResults(results)
      setView(VIEW.SEARCH)
    }, 350)
  }, [searchNotes])

  // Create folder
  const handleCreateFolder = async (name, color) => {
    try {
      await createFolder(name, color)
      showToast(`folder "${name}" created`, 'ok')
    } catch (e) {
      showToast('Failed: ' + e.message, 'err')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); if (view !== VIEW.WELCOME) handleToggleMode() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleNewNote() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [view, title, content, folderId, isDirty, isSaving]) // eslint-disable-line

  const markDirty = () => setIsDirty(true)

  const toolbarVisible = view !== VIEW.WELCOME

  const welcomeStyle = { 
  flex: 1, display: 'flex', flexDirection: 'column', 
  alignItems: 'center', justifyContent: 'center', 
  padding: 60, textAlign: 'center', gap: 8 
}

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        folders={folders}
        notes={notes}
        currentNoteId={currentNote?.id}
        onToggleFolder={toggleFolder}
        onNewNote={handleNewNote}
        onNewFolder={() => setFolderModalOpen(true)}
        onOpenNote={handleOpenNote}
        onSearch={handleSearch}
        onHome={() => { if (!guardDirty()) return; resetEditor(); setView(VIEW.WELCOME) }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar — always mounted, hidden on welcome */}
        <div style={{ opacity: toolbarVisible ? 1 : 0.3, pointerEvents: toolbarVisible ? 'all' : 'none' }}>
          <Toolbar
            title={title}
            folderId={folderId}
            folders={folders}
            isEditMode={view === VIEW.EDIT}
            isDirty={isDirty}
            isSaving={isSaving}
            onTitleChange={v => { setTitle(v); markDirty() }}
            onFolderChange={v => { setFolderId(v); markDirty() }}
            onToggleMode={handleToggleMode}
            onSave={handleSave}
            onExport={handleExport}
            onDelete={handleDelete}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

          {/* Welcome */}
          {view === VIEW.WELCOME && (
            <div style={welcomeStyle}>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.4, marginBottom: 20 }}>
{`  _     ___
 | |   / __|
 | |__  \\__ \\
 |____| |___/`}
              </pre>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 400, color: 'var(--text-muted)', marginBottom: 10 }}>
                Jagadish's Learning Space
              </h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-faint)', maxWidth: 320, lineHeight: 1.7, textAlign: 'center' }}>
                Pick a note from the sidebar, or create a new one.<br />
                Everything is stored in Supabase — accessible anywhere.
              </p>
              {loading && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', marginTop: 20 }}>loading...</div>}
            </div>
          )}

          {/* Search */}
          {view === VIEW.SEARCH && (
            <SearchResults
              results={searchResults}
              query={searchQuery}
              folders={folders}
              onOpenNote={handleOpenNote}
            />
          )}

          {/* Read view */}
          {view === VIEW.READ && (
            <ReadView
              title={title}
              content={content}
              folderId={folderId}
              folders={folders}
              updatedAt={currentNote?.updated_at}
              attachments={existingFiles}
            />
          )}

          {/* Edit view */}
          {view === VIEW.EDIT && (
            <Editor
              value={content}
              onChange={v => { setContent(v); markDirty() }}
              existingFiles={existingFiles}
              stagedFiles={stagedFiles}
              onStagedFilesChange={setStagedFiles}
              onDeleteExistingFile={handleDeleteFile}
            />
          )}
        </div>
      </div>

      <FolderModal
        open={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onConfirm={handleCreateFolder}
      />

      <Toast toast={toast} />
    </div>
  )
}
