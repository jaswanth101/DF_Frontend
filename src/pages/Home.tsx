import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PortfolioData } from '../types/portfolio'
import { Upload, FileText, Zap, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

export default function Home() {
  const navigate = useNavigate()
  const [state, setState] = useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')

  const processFile = useCallback(async (file: File) => {
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
  }, [navigate])

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
            AI-Powered · Instant · Beautiful
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight text-balance mb-5">
            Your resume,<br />
            <span className="text-blue-600">transformed.</span>
          </h1>

          <p className="text-slate-500 text-lg mb-10 text-balance">
            Drop your PDF résumé and get a stunning, shareable portfolio page — powered by GPT-4o. No editing required.
          </p>

          {/* Upload Zone */}
          <div
            className={`upload-zone p-10 mb-6 ${state === 'dragging' ? 'drag-over' : ''} ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isUploading && document.getElementById('file-input')?.click()}
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
                      Extracting text from PDF…
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse animation-delay-200" />
                      Structuring data with GPT-4o…
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse animation-delay-300" />
                      Building your portfolio…
                    </div>
                  </div>
                </>
              ) : state === 'success' ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-semibold text-green-700">Done! Redirecting…</p>
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
                  <p className="text-xs text-slate-400">PDF only · Max 20MB</p>
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
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl px-8 py-3.5 text-sm transition-all duration-150 shadow-sm hover:shadow-md"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Upload Resume PDF
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
          Built with React · FastAPI · GPT-4o
        </p>
      </footer>
    </div>
  )
}
