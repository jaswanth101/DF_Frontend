import { Info } from 'lucide-react'

interface Props {
  items: string[]
}

export default function AdditionalInfoSection({ items }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 text-[14px] text-slate-600 leading-relaxed">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}
