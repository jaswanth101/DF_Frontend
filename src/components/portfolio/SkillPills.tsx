import { SkillGroup } from '../../types/portfolio'

interface Props {
  skills: SkillGroup[]
}

export default function SkillPills({ skills }: Props) {
  // Gracefully handle older cached data where skills is just a string[]
  if (skills.length > 0 && typeof skills[0] === 'string') {
    return (
      <div className="flex flex-wrap gap-2">
        {(skills as unknown as string[]).map((skill) => (
          <span key={skill} className="skill-pill">
            {skill}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {skills.map((group, i) => (
        <div key={i} className="flex flex-col items-start gap-3">
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-400">{group.category}</h3>
          <div className="flex flex-wrap gap-2.5">
            {group.items?.map((skill) => (
              <span key={skill} className="skill-pill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
