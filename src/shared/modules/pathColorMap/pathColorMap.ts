const UPDATE_COLOR_MAP = 'colorMap/UPDATE'
const RERENDER_COLOR_MAP = 'colorMap/RERENDER'
const DEFAULT_COLOR_MAP = {
  pathColorMap: new Map<string, string[]>(),
  shouldRerender: true
}

interface UpdatePathColorMapAction {
  type: typeof UPDATE_COLOR_MAP
  colorMap: ColorMapState
}

interface RerenderPathColorMapAction {
  type: typeof RERENDER_COLOR_MAP
  shouldRerender: boolean
}

type PathColorMapAction = UpdatePathColorMapAction | RerenderPathColorMapAction

export interface PathColorMapState {
  pathColorMap: ColorMapState
  shouldRerender: boolean
}

export type ColorMapState = Map<string, string[]>

export function updatePathColorMapAction(
  colorMap: ColorMapState
): UpdatePathColorMapAction {
  return { type: UPDATE_COLOR_MAP, colorMap }
}

export function rerenderPathColorMapAction(
  shouldRerender: boolean
): RerenderPathColorMapAction {
  return { type: RERENDER_COLOR_MAP, shouldRerender }
}

export default function pathColorMapReducer(
  state: PathColorMapState = DEFAULT_COLOR_MAP,
  action: PathColorMapAction
): PathColorMapState {
  if (action.type === UPDATE_COLOR_MAP) {
    return { ...state, pathColorMap: action.colorMap }
  }
  if (action.type === RERENDER_COLOR_MAP) {
    return { ...state, shouldRerender: action.shouldRerender }
  }

  return state
}
