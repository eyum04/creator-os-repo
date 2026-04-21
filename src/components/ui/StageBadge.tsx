import { STAGE_COLORS, type IdeaStage } from '@/lib/types'

export function StageBadge({ stage }: { stage: IdeaStage }) {
  const color = STAGE_COLORS[stage]
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {stage}
    </span>
  )
}
