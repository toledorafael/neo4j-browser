import React from 'react'
import { getPatternDashes } from '../lib/visualization/utils/pattern'
import { StyledPatternSelectorItem, StyledPatternSelectorBody } from './styled'

interface PatternSelectorProps {
  patterns: string[]
  selectPattern: (value: string) => void
}

export default function PatternSelector({
  patterns,
  selectPattern = console.log
}: PatternSelectorProps): JSX.Element {
  return (
    <>
      Patterns:
      <StyledPatternSelectorBody>
        {patterns.map((pattern, i) => (
          <StyledPatternSelectorItem
            key={i}
            onClick={() => {
              selectPattern(pattern)
            }}
          >
            <svg width="100" height="4" viewBox="0 0 200 8">
              <line
                x1="0"
                x2="200"
                y1="4"
                y2="4"
                strokeWidth="8"
                stroke="#777"
                strokeDasharray={getPatternDashes(pattern, 8)}
              />
            </svg>
          </StyledPatternSelectorItem>
        ))}
      </StyledPatternSelectorBody>
    </>
  )
}
