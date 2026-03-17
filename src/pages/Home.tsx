import { useState, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PortfolioData } from '../types/portfolio'
import { Upload, FileText, Zap, Sparkles, AlertCircle, CheckCircle, Search, AtSign } from 'lucide-react'

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'

type SearchResult = {
  username: string
  full_name: string | null
  headline: string | null
  location: string | null
  profile_image_url: string | null
}

export default function Home() {
  const navigate = useNavigate()
  const [state, setState] = useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [usernameInput, setUsernameInput] = useState<string>('')
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [usernameError, setUsernameError] = useState<string>('')
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [claimedUsername, setClaimedUsername] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string>('')

  const processFile = useCallback(async (file: File) => {
    if (!claimedUsername) {
      setErrorMsg('Please claim a unique username before uploading.')
      setState('error')
      return
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file.')
      setState('error')
      return
    }

    setFileName(file.name)
    setState('uploading')
    setErrorMsg('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('username', claimedUsername)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.detail || 'Upload failed. Please try again.')
      }

      const data: PortfolioData = json.data
      sessionStorage.setItem(`portfolio_${data.username}`, JSON.stringify(data))
      setState('success')
      setTimeout(() => navigate(`/${data.username}`), 600)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setErrorMsg(message)
      setState('error')
    }
  }, [navigate, claimedUsername])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('idle')
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('dragging')
  }, [])

  const handleDragLeave = useCallback(() => {
    setState('idle')
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const isUploading = state === 'uploading'
  const canUpload = !!claimedUsername && !isUploading

  useEffect(() => {
    if (claimedUsername) {
      setUsernameStatus('available')
      return
    }

    const raw = usernameInput.trim().toLowerCase()
    if (!raw) {
      setUsernameStatus('idle')
      setUsernameError('')
      setAlternatives([])
      return
    }

    setUsernameStatus('checking')
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/usernames/check?username=${encodeURIComponent(raw)}`)
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.detail || 'Unable to check username.')
        }

        if (raw !== usernameInput.trim().toLowerCase()) return

        if (json.available) {
          setUsernameStatus('available')
          setUsernameError('')
          setAlternatives([])
        } else {
          setUsernameStatus('taken')
          setUsernameError('That username is taken.')
          setAlternatives(json.alternatives || [])
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to check username.'
        setUsernameStatus('invalid')
        setUsernameError(message)
        setAlternatives([])
      }
    }, 400)

    return () => clearTimeout(handle)
  }, [usernameInput, claimedUsername])

  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchResults([])
      setSearchError('')
      return
    }

    setSearchLoading(true)
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.detail || 'Search failed.')
        }
        setSearchResults(json.results || [])
        setSearchError('')
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Search failed.'
        setSearchError(message)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 350)

    return () => clearTimeout(handle)
  }, [searchQuery])

  const handleClaim = useCallback(() => {
    if (usernameStatus !== 'available') return
    const normalized = usernameInput.trim().toLowerCase()
    if (!normalized) return
    setClaimedUsername(normalized)
  }, [usernameInput, usernameStatus])

  const resetClaim = useCallback(() => {
    setClaimedUsername(null)
    setUsernameInput('')
    setUsernameStatus('idle')
    setUsernameError('')
    setAlternatives([])
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">DropFolio</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered - Instant - Beautiful
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight text-balance mb-5">
            Your resume,<br />
            <span className="text-blue-600">transformed.</span>
          </h1>

          <p className="text-slate-500 text-lg mb-10 text-balance">
            Drop your PDF resume and get a stunning, shareable portfolio page - powered by GPT-4o. No editing required.
          </p>

          {/* Search */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-10 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Search profiles</p>
                <p className="text-sm text-slate-500">Find portfolios by username or name.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or full name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {searchLoading && <p className="text-xs text-slate-400">Searching...</p>}
              {searchError && <p className="text-xs text-red-600">{searchError}</p>}
              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {searchResults.map((item) => (
                    <Link
                      key={item.username}
                      to={`/${item.username}`}
                      className="border border-slate-100 rounded-xl p-4 bg-slate-50 hover:bg-white transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold">
                        {(item.full_name || item.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {item.full_name || item.username}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          /{item.username} {item.location ? `- ${item.location}` : ''}
                        </p>
                        {item.headline && (
                          <p className="text-xs text-slate-400 truncate">{item.headline}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {!searchLoading && !searchError && searchQuery.trim() && searchResults.length === 0 && (
                <p className="text-xs text-slate-400">No profiles found.</p>
              )}
            </div>
          </div>

          {/* Claim Username */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <AtSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Claim your username</p>
                <p className="text-sm text-slate-500">Pick a unique username to create your public URL.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={claimedUsername ? claimedUsername : usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="yourname"
                disabled={!!claimedUsername}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:bg-slate-50"
              />
              {!claimedUsername ? (
                <button
                  onClick={handleClaim}
                  disabled={usernameStatus !== 'available'}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl px-5 py-3 text-sm transition-colors"
                >
                  Claim
                </button>
              ) : (
                <button
                  onClick={resetClaim}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl px-5 py-3 text-sm transition-colors"
                >
                  Change
                </button>
              )}
            </div>

            <div className="mt-3 text-xs">
              {usernameStatus === 'checking' && <p className="text-slate-400">Checking availability...</p>}
              {usernameStatus === 'available' && !claimedUsername && (
                <p className="text-green-600">Username is available.</p>
              )}
              {claimedUsername && (
                <p className="text-green-700">
                  Claimed: <span className="font-mono">/{claimedUsername}</span>
                </p>
              )}
              {usernameError && !claimedUsername && (
                <p className="text-red-600">{usernameError}</p>
              )}
            </div>

            {!claimedUsername && alternatives.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {alternatives.map((alt) => (
                    <button
                      key={alt}
                      onClick={() => {
                        setUsernameInput(alt)
                        setUsernameStatus('available')
                        setUsernameError('')
                        setAlternatives([])
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Zone */}
          <div
            className={`upload-zone p-10 mb-6 ${state === 'dragging' ? 'drag-over' : ''} ${!canUpload ? 'opacity-60 pointer-events-none' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => canUpload && document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileInput}
            />

            <div className="flex flex-col items-center gap-4">
              {isUploading ? (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-spin border-t-transparent" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Analyzing your resume...</p>
                    <p className="text-sm text-slate-400 mt-1">{fileName}</p>
                  </div>
                  {/* Progress steps */}
                  <div className="flex flex-col gap-1.5 text-sm text-slate-500 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Extracting text from PDF...
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse animation-delay-200" />
                      Structuring data with GPT-4o...
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse animation-delay-300" />
                      Building your portfolio...
                    </div>
                  </div>
                </>
              ) : state === 'success' ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-semibold text-green-700">Done! Redirecting...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">
                      Drag & drop your PDF here
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      or <span className="text-blue-600 underline underline-offset-2">click to browse</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">PDF only - Max 20MB</p>
                </>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {state === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-left animate-fade-in mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Upload failed</p>
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {!isUploading && state !== 'success' && (
            <button
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white font-semibold rounded-xl px-8 py-3.5 text-sm transition-all duration-150 shadow-sm hover:shadow-md"
              onClick={() => canUpload && document.getElementById('file-input')?.click()}
              disabled={!canUpload}
            >
              {claimedUsername ? 'Upload Resume PDF' : 'Claim a Username to Continue'}
            </button>
          )}
        </div>

        {/* Features row */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full animate-slide-up">
          {[
            { icon: FileText, title: 'Smart Extraction', desc: 'Handles multi-column layouts, tables, and complex formatting.' },
            { icon: Sparkles, title: 'GPT-4o Powered', desc: 'Every field is intelligently categorized and structured.' },
            { icon: Zap, title: 'Instant Portfolio', desc: 'Get a shareable `/username` page in under 30 seconds.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-slate-100 rounded-2xl p-6 text-left shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center">
        <p className="text-sm text-slate-400">
          Built with React - FastAPI - GPT-4o
        </p>
      </footer>
    </div>
  )
}
