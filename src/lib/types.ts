export interface Pillar {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export type IdeaStage = 'Idea' | 'Scripted' | 'Filmed' | 'Posted'

export interface Idea {
  id: string
  user_id: string
  pillar_id: string | null
  title: string
  stage: IdeaStage
  script: string | null
  scheduled_date: string | null
  created_at: string
}

export interface IdeaWithPillar extends Idea {
  pillar: Pillar | null
}

export interface Shot {
  id: string
  idea_id: string
  content: string
  order: number
  completed: boolean
}

export const FREE_TIER_LIMITS = {
  MAX_IDEAS: 50,
  MAX_PILLARS: 5,
} as const

export const STAGES: IdeaStage[] = ['Idea', 'Scripted', 'Filmed', 'Posted']

export const STAGE_COLORS: Record<IdeaStage, string> = {
  Idea:     '#2563EB',
  Scripted: '#8B5CF6',
  Filmed:   '#F59E0B',
  Posted:   '#10B981',
}

export const PILLAR_COLORS = [
  '#2563EB', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
] as const
