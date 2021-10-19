const lightPalette = {
  colors: [
    '#a5abb6',
    '#ffe081',
    '#c990c0',
    '#f79767',
    '#57c7e3',
    '#f16667',
    '#d9c8ae',
    '#8dcc93',
    '#ecb5c9',
    '#4c8eda',
    '#ffc454',
    '#da7194',
    '#569480'
  ],
  borderColors: [
    '#9aa1ac',
    '#9aa1ac',
    '#b261a5',
    '#f36924',
    '#23b3d7',
    '#eb2728',
    '#c0a378',
    '#5db665',
    '#da7298',
    '#2870c2',
    '#d7a013',
    '#cc3c6c',
    '#447666'
  ],
  textColor: '#000000'
}

const darkPalette = {
  colors: [
    '#9aa1ac',
    '#423204',
    '#b261a5',
    '#f36924',
    '#23b3d7',
    '#eb2728',
    '#c0a378',
    '#5db665',
    '#da7298',
    '#2870c2',
    '#d7a013',
    '#cc3c6c',
    '#447666'
  ],
  borderColors: [
    '#a5abb6',
    '#604a0e',
    '#c990c0',
    '#f79767',
    '#57c7e3',
    '#f16667',
    '#d9c8ae',
    '#8dcc93',
    '#ecb5c9',
    '#4c8eda',
    '#ffc454',
    '#da7194',
    '#569480'
  ],
  textColor: '#ffffff'
}

const lightCustomPalette = {
  colors: [
    '#a9a9a9',
    '#e6194b',
    '#f58231',
    '#3cb44b',
    '#42d4f4',
    '#f032e6',

    '#fabed4',
    '#ffd8b1',
    '#fffac8',
    '#aaffc3',
    '#dcbeff',

    '#ffe119',
    '#bfef45'
  ],
  borderColors: [
    '#a9a9a9',
    '#e6194b',
    '#f58231',
    '#3cb44b',
    '#42d4f4',
    '#f032e6',

    '#fabed4',
    '#ffd8b1',
    '#fffac8',
    '#aaffc3',
    '#dcbeff',

    '#ffe119',
    '#bfef45'
  ],
  textColor: '#000000'
}

const darkCustomPalette = {
  colors: [
    '#a9a9a9',
    '#e6194b',
    '#f58231',
    '#3cb44b',
    '#42d4f4',
    '#f032e6',

    '#800000',
    '#9a6324',
    '#808000',
    '#469990',
    '#000075',

    '#4363d8',
    '#911eb4'
  ],
  borderColors: [
    '#a9a9a9',
    '#e6194b',
    '#f58231',
    '#3cb44b',
    '#42d4f4',
    '#f032e6',

    '#800000',
    '#9a6324',
    '#808000',
    '#469990',
    '#000075',

    '#4363d8',
    '#911eb4'
  ],
  textColor: '#ffffff'
}

const initialState = darkPalette

export function resetPaletteAction () {
  return {
    type: 'palette/RESET'
  }
}

export function presetPaletteAction (name) {
  return {
    type: 'palette/PRESET',
    name
  }
}

export function paletteReducer (state = initialState, action) {
  if (action.type === 'palette/RESET') {
    return initialState
  }
  if (action.type === 'palette/PRESET') {
    if (action.name === 'dark') return darkPalette
    if (action.name === 'light') return lightPalette
    if (action.name === 'lightCustom') return lightCustomPalette
    if (action.name === 'darkCustom') return darkCustomPalette
    return initialState
  }
  return state
}
