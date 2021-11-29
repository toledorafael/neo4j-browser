const ADD_FILTER = 'filters/ADD'
const REMOVE_FILTER = 'filters/REMOVE'

interface AddFilterAction {
  type: typeof ADD_FILTER
  filter: string
}

interface RemoveFilterAction {
  type: typeof REMOVE_FILTER
  filter: string
}

type FilterAction = AddFilterAction | RemoveFilterAction

export type FilterState = string[]

export function addFilterAction(filter: string): AddFilterAction {
  return { type: ADD_FILTER, filter }
}

export function removeFilterAction(filter: string): RemoveFilterAction {
  return { type: REMOVE_FILTER, filter }
}

export default function(
  state: FilterState = [],
  action: FilterAction
): FilterState {
  if (action.type === ADD_FILTER) {
    if (state.includes(action.filter)) return state
    return [...state, action.filter]
  }
  if (action.type === REMOVE_FILTER) {
    const index = state.indexOf(action.filter)
    if (index < 0) return state
    const newState = [...state]
    newState.splice(index, 1)
    return newState
  }
  return state
}
