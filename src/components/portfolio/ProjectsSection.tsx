import { ProjectItem } from '../../types/portfolio'
import { Github, ExternalLink, Calendar, Briefcase } from 'lucide-react'

interface Props {
  projects: ProjectItem[]
}

export default function ProjectsSection({ projects }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
      {projects.map((project, i) => (
        <div key={i} className="group flex flex-col gap-3">
          {/* Timeline & Context badges */}
          {(project.start_date || project.end_date || project.context) && (
            <div className="flex flex-wrap gap-2 -mb-1">
              {(project.start_date || project.end_date) && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-widest uppercase text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {[project.start_date, project.end_date].filter(Boolean).join(' – ')}
                </span>
              )}
              {project.context && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Briefcase className="w-3 h-3" />
                  {project.context}
                </span>
              )}
            </div>
          )}

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-[17px] tracking-tight leading-tight group-hover:text-black transition-colors">
              {project.title || 'Project'}
            </h3>
            <div className="flex gap-2 flex-shrink-0">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on GitHub"
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Live Demo"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>

          {/* Role Subtitle */}
          {project.role && (
            <p className="text-sm font-semibold text-slate-900 -mt-1.5">{project.role}</p>
          )}

          {/* Description */}
          {project.description && (
            <p className="text-[14px] text-slate-500 leading-relaxed flex-1 font-light group-hover:text-slate-700 transition-colors">{project.description}</p>
          )}
          {!project.description && <div className="flex-1" />}

          {/* Tech stack */}
          {project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="tech-pill">{tech}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
