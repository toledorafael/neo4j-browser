const UPDATE_LAYOUT = 'layout/UPDATE'

interface UpdateLayoutAction {
  type: typeof UPDATE_LAYOUT
  layout: string
}

export type LayoutState = string

export function updateLayoutAction(layout: string): UpdateLayoutAction {
  return { type: UPDATE_LAYOUT, layout }
}

export default function layoutReducer(
  state: LayoutState = 'stripes',
  action: UpdateLayoutAction
): LayoutState {
  if (action.type === UPDATE_LAYOUT) {
    return action.layout
  }

  return state
}
