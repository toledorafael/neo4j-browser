export function getPatternDashes (pattern, size) {
  const splits = pattern.split(' ')
  console.log(splits)
  if (splits.length && splits[0] === 'dashes') {
    return splits
      .slice(1)
      .map(x => +x * size)
      .join(' ')
  }
}
