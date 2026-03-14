import { Trophy } from 'lucide-react'

interface Props {
  achievements: string[]
}

export default function AchievementsSection({ achievements }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {achievements.map((item, i) => (
        <div key={i} className="portfolio-card flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Trophy className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0 flex items-center min-h-[32px]">
            <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
