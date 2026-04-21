interface Props {
  type: 'ideas' | 'pillars'
  current: number
  max: number
}

export function FreeTierBanner({ type, current, max }: Props) {
  if (current < max) return null
  return (
    <div className="flex items-center gap-2.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-4 py-3 mb-6">
      <svg viewBox="0 0 20 20" fill="#D97706" className="w-4 h-4 flex-shrink-0">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <p className="text-[13px] text-[#92400E]">
        You&apos;ve reached the free tier limit ({current}/{max} {type}).{' '}
        <span className="font-semibold">Upgrade to Pro</span> for unlimited {type}.
      </p>
    </div>
  )
}
