import { useMemo, useState, useEffect, useRef } from 'react'
import { PortfolioData } from '../../types/portfolio'
import { Sparkles, MessageCircle, Send, X } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  displayContent?: string
  streaming?: boolean
}

const QUICK_PROMPTS = [
  'What is their primary tech stack?',
  'Summarize their biggest technical impact.',
  'What kind of AI tools do they work with?',
  'Which projects best represent their strengths?',
]

const AI_KEYWORDS = [
  'ai', 'ml', 'deep learning', 'llm', 'gpt', 'openai',
  'langchain', 'rag', 'vector', 'embedding', 'pytorch', 'tensorflow',
]

function normalizeList(items: (string | null | undefined)[]) {
  const cleaned = items
    .map((item) => (item || '').trim())
    .filter(Boolean)
  return Array.from(new Set(cleaned))
}

function includesAny(text: string, terms: string[]) {
  const lower = text.toLowerCase()
  return terms.some((term) => lower.includes(term))
}

function sanitizeText(text: string) {
  let out = text
  out = out.replace(/machine learning/gi, 'working with AI')
  out = out.replace(/generative ai solutions/gi, 'working on AI')
  return out
}

function sentenceList(items: string[]) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function toBulletList(items: string[]) {
  if (items.length === 0) return ''
  return items.map((item) => `- ${item}`).join('\n')
}

function wantsList(question: string) {
  const q = question.toLowerCase()
  return /\b(list|bullet|bullets|show|give|provide|all)\b/.test(q)
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>
    }
    return <span key={idx}>{part}</span>
  })
}

function Markdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const blocks: JSX.Element[] = []
  let listBuffer: string[] = []

  const flushList = () => {
    if (listBuffer.length === 0) return
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc pl-5 space-y-1">
        {listBuffer.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-700 leading-relaxed">
            {renderInlineBold(item)}
          </li>
        ))}
      </ul>
    )
    listBuffer = []
  }

  lines.forEach((line, i) => {
    if (line.startsWith('- ')) {
      listBuffer.push(line.slice(2))
      return
    }

    flushList()

    if (!line.trim()) return
    blocks.push(
      <p key={`p-${i}`} className="text-sm text-slate-700 leading-relaxed">
        {renderInlineBold(line)}
      </p>
    )
  })

  flushList()

  return <div className="space-y-3">{blocks}</div>
}

function buildAnswer(question: string, data: PortfolioData) {
  const q = question.toLowerCase()
  const listMode = wantsList(question)
  const pi = data.personal_info

  const skills = normalizeList(data.skills.flatMap((group) => group.items || []))
  const projectTech = normalizeList(data.projects.flatMap((project) => project.tech_stack || []))
  const combinedTech = normalizeList([...skills, ...projectTech]).map(sanitizeText)

  const experienceHighlights = normalizeList(
    data.experience.flatMap((item) => item.description || [])
  ).map(sanitizeText)

  const achievementHighlights = normalizeList(data.achievements || []).map(sanitizeText)

  const aiTools = combinedTech.filter((tech) => includesAny(tech, AI_KEYWORDS))

  const notFound = "That detail isn’t in the portfolio."

  if (q.includes('name') && !q.includes('project')) {
    return pi.full_name ? sanitizeText(pi.full_name) : notFound
  }

  if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('phone')) {
    if (pi.email) return `You can reach them at ${pi.email}.`
    if (pi.phone) return `You can reach them at ${pi.phone}.`
    return notFound
  }

  if (q.includes('tech stack') || q.includes('skills') || q.includes('tools') || q.includes('stack')) {
    const primary = combinedTech.slice(0, 10)
    if (primary.length === 0) return notFound
    if (listMode) return `**Primary tech stack**\n${toBulletList(primary)}`
    return `Their primary tech stack includes ${sentenceList(primary)}.`
  }

  if (q.includes('impact') || q.includes('achievement') || q.includes('biggest')) {
    const highlights = normalizeList([
      ...achievementHighlights,
      ...experienceHighlights,
    ]).slice(0, 4)

    if (highlights.length === 0) return notFound

    if (listMode) return `**Largest technical impact**\n${toBulletList(highlights)}`
    return `Their biggest technical impact includes ${sentenceList(highlights)}.`
  }

  if (q.includes('ai')) {
    if (aiTools.length === 0) return notFound
    if (listMode) return `**AI tools**\n${toBulletList(aiTools)}`
    return `They are working with AI using ${sentenceList(aiTools)}.`
  }

  if (q.includes('project')) {
    if (data.projects.length === 0) return notFound
    const projectLines = data.projects.map((project) => {
      const title = project.title || 'Project'
      const role = project.role ? ` (${project.role})` : ''
      return sanitizeText(`${title}${role}`)
    })

    if (listMode) return `**Projects**\n${toBulletList(projectLines)}`
    return `Their key projects include ${sentenceList(projectLines.slice(0, 4))}.`
  }

  if (q.includes('experience') || q.includes('work') || q.includes('role')) {
    if (data.experience.length === 0) return notFound
    const experienceLines = data.experience.map((item) => {
      const role = item.role || 'Role'
      const company = item.company_name ? ` at ${item.company_name}` : ''
      return sanitizeText(`${role}${company}`)
    })
    if (listMode) return `**Experience**\n${toBulletList(experienceLines)}`
    return `They have experience as ${sentenceList(experienceLines.slice(0, 3))}.`
  }

  if (q.includes('education') || q.includes('degree') || q.includes('university') || q.includes('college')) {
    if (data.education.length === 0) return notFound
    const educationLines = data.education.map((item) => {
      const degree = item.degree || 'Education'
      const inst = item.institution ? ` at ${item.institution}` : ''
      return sanitizeText(`${degree}${inst}`)
    })
    if (listMode) return `**Education**\n${toBulletList(educationLines)}`
    return `They studied ${sentenceList(educationLines.slice(0, 2))}.`
  }

  if (q.includes('certification')) {
    if (data.certifications.length === 0) return notFound
    const certLines = data.certifications.map((item) => sanitizeText(item.name || 'Certification'))
    if (listMode) return `**Certifications**\n${toBulletList(certLines)}`
    return `Their certifications include ${sentenceList(certLines.slice(0, 3))}.`
  }

  if (q.includes('language')) {
    if (data.languages.length === 0) return notFound
    const langLines = data.languages.map((lang) => {
      return lang.proficiency ? `${lang.language} (${lang.proficiency})` : lang.language
    })
    if (listMode) return `**Languages**\n${toBulletList(langLines)}`
    return `They speak ${sentenceList(langLines.slice(0, 4))}.`
  }

  if (q.includes('summary') || q.includes('headline')) {
    if (pi.headline) return sanitizeText(pi.headline)
    return notFound
  }

  if (q.includes('location') || q.includes('based')) {
    if (pi.location) return sanitizeText(pi.location)
    return notFound
  }

  return notFound
}

export default function AssistantChat({ data }: { data: PortfolioData }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const typingRef = useRef<number | null>(null)

  const contactLink = useMemo(() => {
    if (data.personal_info.email) return `mailto:${data.personal_info.email}`
    if (data.personal_info.links.linkedin) return data.personal_info.links.linkedin
    if (data.personal_info.links.portfolio) return data.personal_info.links.portfolio
    return null
  }, [data])

  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant' || !last.streaming) return

    if (typingRef.current) {
      window.clearInterval(typingRef.current)
    }

    typingRef.current = window.setInterval(() => {
      setMessages((prev) => {
        const next = [...prev]
        const target = next[next.length - 1]
        if (!target || target.role !== 'assistant' || !target.streaming) return prev

        const current = target.displayContent || ''
        if (current.length >= target.content.length) {
          target.streaming = false
          target.displayContent = target.content
          if (typingRef.current) window.clearInterval(typingRef.current)
          return next
        }

        const step = target.content.slice(0, current.length + 1)
        target.displayContent = step
        return next
      })
    }, 36)

    return () => {
      if (typingRef.current) window.clearInterval(typingRef.current)
    }
  }, [messages])

  const finalizeStreaming = () => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      const next = [...prev]
      const last = next[next.length - 1]
      if (last?.role === 'assistant' && last.streaming) {
        last.streaming = false
        last.displayContent = last.content
      }
      return next
    })
  }

  const handleSend = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    finalizeStreaming()

    const userMessage: Message = { role: 'user', content: trimmed }
    const assistantMessage: Message = {
      role: 'assistant',
      content: buildAnswer(trimmed, data),
      displayContent: '',
      streaming: true,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput('')
  }

  const renderAssistantText = (message: Message) => {
    const text = message.displayContent ?? message.content
    return <Markdown text={text} />
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="w-[320px] sm:w-[380px] md:w-[420px] max-h-[80vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Candidate AI Assistant</p>
              <p className="text-xs text-slate-500">Ask about my experience</p>
            </div>
            <div className="flex items-center gap-2">
              {contactLink ? (
                <a
                  href={contactLink}
                  target={contactLink.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="text-xs font-semibold bg-slate-900 text-white px-3 py-2 rounded-lg"
                >
                  Contact Candidate
                </a>
              ) : (
                <button
                  className="text-xs font-semibold bg-slate-200 text-slate-500 px-3 py-2 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Contact Candidate
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Hello. I can answer questions about this candidate's background, skills, and projects.
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-xs font-semibold px-3 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === 'user' ? 'text-right' : 'text-left'}
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'inline-block bg-slate-900 text-white px-3 py-2 rounded-2xl text-sm'
                        : 'inline-block bg-slate-50 border border-slate-100 px-3 py-2 rounded-2xl text-sm w-full'
                    }
                  >
                    {message.role === 'assistant' ? (
                      renderAssistantText(message)
                    ) : (
                      <span>{message.content}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(input)
                }}
                placeholder="Ask about skills, projects, impact..."
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <button
                onClick={() => handleSend(input)}
                className="bg-slate-900 text-white w-9 h-9 rounded-xl flex items-center justify-center"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-slate-800"
        aria-label="Open assistant"
      >
        {open ? <MessageCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </button>
    </div>
  )
}
