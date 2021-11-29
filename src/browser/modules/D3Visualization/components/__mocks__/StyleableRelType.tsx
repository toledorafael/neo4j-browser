import React from 'react'
import { StyleableRelTypeProps } from '../StyleableRelType'

export function StyleableRelType({
  selectedRelType
}: StyleableRelTypeProps): JSX.Element {
  return <div>{selectedRelType && selectedRelType.relType}</div>
}
