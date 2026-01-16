const SELECTION = 'selection/UPDATE'

interface SelectionAction {
  type: typeof SELECTION
  selection: SelectionState
}

export type SelectionType = 'Node' | 'Relationship' | 'None'

export interface SelectionState {
  type: SelectionType
  id: number
}

export function selectionAction(selection: SelectionState): SelectionAction {
  return { type: SELECTION, selection }
}

export default function selectionReducer(
  state: SelectionState = { type: 'None', id: -1 },
  action: SelectionAction
): SelectionState {
  if (action.type === SELECTION) {
    return action.selection
  }

  return state
}
