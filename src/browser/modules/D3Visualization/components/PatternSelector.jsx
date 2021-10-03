import React, { useState } from 'react'
import { getPatternDashes } from '../lib/visualization/utils/pattern'
import {
  StyledPatternSelectorItem,
  StyledPatternSelectorBody,
  StyledPatternSelectorBackdrop
} from './styled'

export default function ({ patterns, selectPattern = console.log }) {
  const [show, setShow] = useState(false)
  return (
    <React.Fragment>
      <button onClick={() => setShow(true)}>Select Dashes</button>
      {show && (
        <StyledPatternSelectorBackdrop
          onclick={() => {
            setShow(false)
          }}
        >
          <StyledPatternSelectorBody>
            {patterns.map((pattern, i) => (
              <StyledPatternSelectorItem
                key={i}
                onClick={() => {
                  selectPattern(pattern)
                  setShow(false)
                }}
              >
                <svg width='200' height='8' viewBox='0 0 200 8'>
                  <line
                    x1='0'
                    x2='200'
                    y1='4'
                    y2='4'
                    strokeWidth='8'
                    stroke='black'
                    strokeDasharray={getPatternDashes(pattern, 8)}
                  />
                </svg>
              </StyledPatternSelectorItem>
            ))}
          </StyledPatternSelectorBody>
        </StyledPatternSelectorBackdrop>
      )}
    </React.Fragment>
  )
}
