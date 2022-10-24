export function log(action: string) {
  const startPoint = localStorage.getItem('start-tutorial')
  const curHistory = localStorage.getItem('history')
  if (startPoint) {
    if (curHistory) {
      localStorage.setItem(
        'history',
        curHistory +
          '; ' +
          String(((Date.now() - +startPoint) / 1000).toFixed()) +
          ', ' +
          action
      )
    } else {
      localStorage.setItem(
        'history',
        String(((Date.now() - +startPoint) / 1000).toFixed()) + ', ' + action
      )
    }
  }
}
