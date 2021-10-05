export function getShapeDef (shapeName, { x, y }, size) {
  if (shapeName === 'square') {
    return `M ${x + 2} ${y - size / 2} l ${size} 0 l 0 ${size} l ${-size} 0 Z`
  } else if (shapeName === 'triangle') {
    return `M ${x + 2} ${y - size / 2} l ${size} ${size / 2} l ${-size} ${size /
      2} Z`
  } else if (shapeName === 'paren') {
    return `M ${x + 2} ${y - size / 2} a ${size * 0.6} ${size *
      0.6} 0 0 1 0 ${size}`
  } else if (shapeName === 'circle') {
    return (
      `M ${x + 1} ${y} a ${size / 2} ${size / 2} 0 0 0 ${size / 2} ${size /
        2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${size / 2} ${-size / 2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${-size / 2} ${-size / 2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${-size / 2} ${size / 2}`
    )
  }
}
