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
  posted_at: string | null
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

export type TrophyLevel = 'Bronze' | 'Silver' | 'Gold' | 'Legend'

export interface TrophyConfig {
  emoji: string
  label: string
  color: string
  glowColor: string
  minPostsPerWeek: number
  streakWeeksRequired: number
  message: string
}

export const TROPHY_CONFIG: Record<TrophyLevel, TrophyConfig> = {
  Bronze: {
    emoji: '🥉',
    label: 'Bronze',
    color: '#CD7F32',
    glowColor: '#CD7F3255',
    minPostsPerWeek: 1,
    streakWeeksRequired: 1,
    message: 'You earned Bronze! Stay consistent.',
  },
  Silver: {
    emoji: '🥈',
    label: 'Silver',
    color: '#94A3B8',
    glowColor: '#94A3B855',
    minPostsPerWeek: 2,
    streakWeeksRequired: 2,
    message: 'Silver unlocked. Two weeks strong.',
  },
  Gold: {
    emoji: '🏆',
    label: 'Gold',
    color: '#FBBF24',
    glowColor: '#FBBF2455',
    minPostsPerWeek: 3,
    streakWeeksRequired: 2,
    message: "Gold! You're on a roll.",
  },
  Legend: {
    emoji: '👑',
    label: 'Legend',
    color: '#A855F7',
    glowColor: '#A855F755',
    minPostsPerWeek: 3,
    streakWeeksRequired: 4,
    message: 'LEGEND. Unstoppable.',
  },
}
