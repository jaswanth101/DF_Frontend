import { PortfolioData } from '../../types/portfolio'
import { Mail, Phone, MapPin, Github, Linkedin, Globe, ExternalLink } from 'lucide-react'

interface Props {
  data: PortfolioData
}

export default function LeftColumn({ data }: Props) {
  const { personal_info: pi } = data

  return (
    <aside className="flex flex-col gap-6">
      {/* Avatar + Name */}
      <div className="flex flex-col gap-4">
        {pi.profile_image_url && (
          <div className="self-start">
            <img
              src={pi.profile_image_url}
              alt={pi.full_name}
              className="w-24 h-24 rounded-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{pi.full_name}</h1>
          <p className="text-slate-500 font-medium text-[16px] leading-snug">{pi.headline}</p>
        </div>
      </div>

      {/* Summary */}
      {pi.summary && (
        <p className="text-slate-600/90 text-[15px] leading-relaxed border-t border-slate-200/60 pt-6">
          {pi.summary}
        </p>
      )}

      {/* Contact */}
      <div className="flex flex-col gap-3.5 border-t border-slate-100 pt-6">
        {pi.email && (
          <a
            href={`mailto:${pi.email}`}
            className="flex items-center gap-3 text-[14px] text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <Mail className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
            <span className="truncate max-w-[200px]">{pi.email}</span>
          </a>
        )}
        {pi.phone && (
          <a
            href={`tel:${pi.phone}`}
            className="flex items-center gap-3 text-[14px] text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>{pi.phone}</span>
          </a>
        )}
        {pi.location && (
          <div className="flex items-center gap-3 text-[14px] text-slate-500">
            <MapPin className="w-4 h-4" />
            <span>{pi.location}</span>
          </div>
        )}
      </div>

      {/* Social Links Minimum Text Links */}
      {(pi.links.github || pi.links.linkedin || pi.links.portfolio) && (
        <div className="flex gap-6 border-t border-slate-100 pt-6">
          {pi.links.github && (
            <a
              href={pi.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all group"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>
          )}
          {pi.links.linkedin && (
            <a
              href={pi.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all group"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>
          )}
          {pi.links.portfolio && (
            <a
              href={pi.links.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all group"
            >
              <span>Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>
          )}
        </div>
      )}
    </aside>
  )
}
