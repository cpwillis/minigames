import { GAME_IDS } from '@/features/games/game-ids'
import GameClient from './GameClient'

export const dynamicParams = false

export function generateStaticParams() {
  return GAME_IDS.map(id => ({ id }))
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GameClient id={id} />
}
