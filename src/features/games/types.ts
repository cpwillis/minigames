export interface GameMeta {
  id: string
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
