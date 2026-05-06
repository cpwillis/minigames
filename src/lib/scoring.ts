export function calcPoints(maxPoints: number, elapsedSeconds: number): number {
  const minPoints = Math.round(maxPoints * 0.1)
  const decayRate = maxPoints / 120
  return Math.max(minPoints, Math.round(maxPoints - elapsedSeconds * decayRate))
}
