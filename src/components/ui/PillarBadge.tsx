import type { Pillar } from '@/lib/types'

interface Props {
  pillar: Pillar | null
  size?: 'sm' | 'md'
}

export function PillarBadge({ pillar, size = 'sm' }: Props) {
  const dotSize = size === 'md' ? 'w-3 h-3' : 'w-2 h-2'
  const textSize = size === 'md' ? 'text-[13px]' : 'text-[12px]'
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${dotSize} rounded-full flex-shrink-0`}
        style={{ backgroundColor: pillar?.color ?? '#CBD5E1' }}
      />
      <span className={`${textSize} text-[#64748B]`}>
        {pillar?.name ?? 'No pillar'}
      </span>
    </div>
  )
}
