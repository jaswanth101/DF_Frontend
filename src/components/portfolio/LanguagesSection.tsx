import { LanguageItem } from '../../types/portfolio'
import { Languages } from 'lucide-react'

interface Props {
  languages: LanguageItem[]
}

export default function LanguagesSection({ languages }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {languages.map((lang, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2"
        >
          <Languages className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-800 text-sm">{lang.language}</span>
          {lang.proficiency && (
            <span className="text-slate-400 text-xs">· {lang.proficiency}</span>
          )}
        </div>
      ))}
    </div>
  )
}
