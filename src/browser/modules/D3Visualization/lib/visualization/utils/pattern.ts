export function getPatternDashes(pattern: string, size: number): string {
  const splits = pattern.split(' ')
  if (splits.length && splits[0] === 'dashes') {
    return splits
      .slice(1)
      .map(x => +x * size)
      .join(' ')
  }
  return ''
}
