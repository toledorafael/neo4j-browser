import {
  FeatureItem,
  featureItems
} from 'browser/modules/D3Visualization/components/Graph'

const UPDATE_LAYOUT = 'layout/UPDATE'

interface UpdateLayoutAction {
  type: typeof UPDATE_LAYOUT
  layout: LayoutState
}

export type LayoutState = FeatureItem

export function updateLayoutAction(layout: LayoutState): UpdateLayoutAction {
  return { type: UPDATE_LAYOUT, layout }
}

export default function layoutReducer(
  state: LayoutState = featureItems[0],
  action: UpdateLayoutAction
): LayoutState {
  if (action.type === UPDATE_LAYOUT) {
    return action.layout
  }

  return state
}
