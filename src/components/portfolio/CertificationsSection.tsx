import { CertificationItem } from '../../types/portfolio'
import { Award, ExternalLink } from 'lucide-react'

interface Props {
  certifications: CertificationItem[]
}

export default function CertificationsSection({ certifications }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
      {certifications.map((cert, i) => (
        <div key={i} className="group flex items-start gap-4">
          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Award className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 justify-between">
              <h3 className="font-bold text-slate-900 text-[15px] leading-snug tracking-tight group-hover:text-black transition-colors">{cert.name || 'Certification'}</h3>
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Certificate"
                  className="text-slate-400 hover:text-slate-900 transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
            {cert.issuer && <p className="text-slate-500 font-medium text-[13px] mt-1">{cert.issuer}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
