import { EducationItem } from '../../types/portfolio'

interface Props {
  education: EducationItem[]
}

export default function EducationSection({ education }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {education.map((item, i) => (
        <div key={i} className="group flex flex-col items-start gap-1 pb-10 border-b border-slate-100 last:border-0 last:pb-0">
          {(item.start_date || item.end_date) && (
            <div className="mb-2">
              <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                {[item.start_date, item.end_date].filter(Boolean).join(' – ')}
              </p>
            </div>
          )}
          <h3 className="font-bold text-slate-900 text-[17px] leading-snug tracking-tight group-hover:text-black transition-colors">{item.degree || 'Education'}</h3>
          {item.institution && <p className="text-slate-600 font-semibold text-[15px] mt-1">{item.institution}</p>}
          {item.cgpa && (
            <div className="mt-3 text-slate-500 text-sm font-medium">
              CGPA: {item.cgpa}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
