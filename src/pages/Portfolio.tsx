import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PortfolioData } from '../types/portfolio'
import LeftColumn from '../components/portfolio/LeftColumn'
import RightColumn from '../components/portfolio/RightColumn'
import AssistantChat from '../components/portfolio/AssistantChat'
import { Zap, ArrowLeft } from 'lucide-react'

export default function Portfolio() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!username) { setNotFound(true); return }

    const normalized = username.toLowerCase()
    const stored = sessionStorage.getItem(`portfolio_${normalized}`)
    if (stored) {
      try {
        setData(JSON.parse(stored) as PortfolioData)
      } catch {
        sessionStorage.removeItem(`portfolio_${normalized}`)
      }
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(normalized)}`)
        if (res.status === 404) {
          if (!stored && !cancelled) setNotFound(true)
          return
        }
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.detail || 'Failed to load profile.')
        }
        if (!cancelled) {
          setData(json.data as PortfolioData)
          sessionStorage.setItem(`portfolio_${normalized}`, JSON.stringify(json.data))
        }
      } catch {
        if (!stored && !cancelled) setNotFound(true)
      }
    }

    loadProfile()
    return () => { cancelled = true }
  }, [username])

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Portfolio not found</h1>
          <p className="text-slate-500 text-sm mb-6">
            No portfolio found for <span className="font-mono text-slate-700">/{username}</span>.
            Portfolio data is stored in your browser — try uploading a resume first.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-colors"
          >
            Upload a Resume
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in relative selection:bg-slate-900 selection:text-white">
      {/* Top nav - Minimal */}
      <header className="absolute top-0 w-full z-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">DropFolio</span>
          </Link>
          <span className="font-mono text-sm text-slate-400">/{username}</span>
          <button
            onClick={() => navigate('/')}
            className="bg-black hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 transition-colors rounded-none"
          >
            + New
          </button>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-24 pt-32 sm:pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 lg:gap-24 xl:gap-32 items-start">
          {/* Left — sticky on desktop */}
          <div className="lg:sticky lg:top-32 lg:self-start z-10 lg:pr-8">
            <LeftColumn data={data} />
          </div>

          {/* Right — scrollable */}
          <RightColumn data={data} />
        </div>
      </div>

      <AssistantChat data={data} />
    </div>
  )
}
