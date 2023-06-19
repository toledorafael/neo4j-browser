const UPDATE_LAYOUT = 'layout/UPDATE'

interface UpdateLayoutAction {
  type: typeof UPDATE_LAYOUT
  layout: LayoutState
}

export type LayoutState = Record<string, any>

export function updateLayoutAction(layout: LayoutState): UpdateLayoutAction {
  return { type: UPDATE_LAYOUT, layout }
}

export default function layoutReducer(
  state: LayoutState = {
    arrowLayout: 'segments',
    textAbove: true,
    globalText: true
  },
  action: UpdateLayoutAction
): LayoutState {
  if (action.type === UPDATE_LAYOUT) {
    return action.layout
  }

  return state
}
