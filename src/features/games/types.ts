import type { GameId } from './game-ids'

export interface GameMeta {
  id: GameId
  title: string
  description: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxPoints: number
  order?: number
  component: React.ComponentType<{ onComplete: () => void }>
}

export interface GameRecord {
  bestTime: number
  bestPoints: number
}
