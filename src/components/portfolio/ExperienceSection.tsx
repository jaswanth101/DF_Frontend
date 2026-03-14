import { ExperienceItem } from '../../types/portfolio'

interface Props {
  experience: ExperienceItem[]
}

export default function ExperienceSection({ experience }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {experience.map((item, i) => (
        <div key={i} className="group flex flex-col items-start gap-1 pb-10 border-b border-slate-100 last:border-0 last:pb-0">
          {/* Date range badge */}
          {(item.start_date || item.end_date) && (
            <div className="mb-2">
              <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                {[item.start_date, item.end_date].filter(Boolean).join(' – ')}
              </p>
            </div>
          )}

          {/* Role + Company + Location */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-2.5 mb-3">
            <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-none group-hover:text-slate-600 transition-colors">
              {item.role || (item.company_name ? '' : 'Experience')}
            </h3>
            {item.company_name && (
              <>
                {item.role && <span className="hidden sm:inline text-slate-300">·</span>}
                <span className="text-slate-900 text-[15px] font-semibold">{item.company_name}</span>
              </>
            )}
            {item.location && (
              <>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span className="text-slate-500 text-sm">{item.location}</span>
              </>
            )}
          </div>

          {/* Bullet points */}
          {item.description.length > 0 && (
            <ul className="flex flex-col gap-2.5 ml-0 mt-1">
              {item.description.map((bullet, bi) => (
                <li key={bi} className="flex gap-3 text-[15px] text-slate-500 leading-relaxed font-light">
                  <span className="text-slate-300 mt-1.5 flex-shrink-0 text-[10px]">■</span>
                  <span className="group-hover:text-slate-700 transition-colors">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
