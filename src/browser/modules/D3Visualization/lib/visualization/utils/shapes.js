export function getShapeDef (shapeName, { x, y }, size) {
  if (shapeName === 'square') {
    return `M ${x + 2} ${y - size / 2} l ${size} 0 l 0 ${size} l ${-size} 0 Z`
  } else if (shapeName === 'rectangle') {
    return `M ${x + 2} ${y - size / 2} l ${size * 2} 0 l 0 ${size} l ${-size *
      2} 0 Z`
  } else if (shapeName === 'thinRectangle') {
    return `M ${x + 2} ${y - size / 2} l ${size / 2} 0 l 0 ${size} l ${-size /
      2} 0 Z`
  } else if (shapeName === 'triangle') {
    return `M ${x + 2} ${y - size / 2} l ${size} ${size / 2} l ${-size} ${size /
      2} Z`
  } else if (shapeName === 'circle') {
    return (
      `M ${x + 2} ${y} a ${size / 2} ${size / 2} 0 0 0 ${size / 2} ${size /
        2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${size / 2} ${-size / 2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${-size / 2} ${-size / 2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${-size / 2} ${size / 2}`
    )
  } else if (shapeName === 'ellipse') {
    return (
      `M ${x + 2} ${y} a ${size} ${size / 2} 0 0 0 ${size} ${size / 2}` +
      `a ${size} ${size / 2} 0 0 0 ${size} ${-size / 2}` +
      `a ${size} ${size / 2} 0 0 0 ${-size} ${-size / 2}` +
      `a ${size} ${size / 2} 0 0 0 ${-size} ${size / 2}`
    )
  } else if (shapeName === 'halfCircle') {
    return (
      `M ${x - size / 2} ${y} a ${size / 2} ${size / 2} 0 0 0 ${size /
        2} ${size / 2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${size / 2} ${-size / 2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${-size / 2} ${-size / 2}` +
      `a ${size / 2} ${size / 2} 0 0 0 ${-size / 2} ${size / 2}`
    )
  }
}
