/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import { GrassEditor } from './GrassEditor'
import { Popup } from 'semantic-ui-react'
import { GraphStyle } from './OverviewPane'
import { StyledRelationship } from 'browser/modules/DBMSInfo/styled'

export type StyleableRelTypeProps = {
  graphStyle: GraphStyle
  frameHeight: number
  selectedRelType?: { relType: string; propertyKeys: string[]; count?: number }
  selectedFilter?: { condition: string }
  visible?: boolean
  setVisibility?: (value: boolean) => void
}
export function StyleableRelType({
  selectedRelType,
  selectedFilter,
  graphStyle,
  frameHeight,
  visible,
  setVisibility
}: StyleableRelTypeProps): JSX.Element {
  if (!selectedRelType && !selectedFilter) {
    throw new TypeError(
      'At least one of selectedRelType or selectedFilter is required'
    )
  }

  const styleForRelType = selectedRelType
    ? graphStyle.forRelationship({
        type: selectedRelType.relType
      })
    : selectedFilter
    ? graphStyle.forCondition(selectedFilter.condition)
    : null
  return (
    <Popup
      on="click"
      basic
      pinned
      key={
        (selectedRelType && selectedRelType.relType) ||
        (selectedFilter && selectedFilter.condition)
      }
      trigger={
        <StyledRelationship
          style={{
            backgroundColor: styleForRelType.get('color'),
            color: styleForRelType.get('text-color-internal'),
            textDecoration: visible === false ? 'line-through' : 'none'
          }}
        >
          {selectedRelType
            ? selectedRelType.count !== undefined
              ? `${selectedRelType.relType} (${selectedRelType.count})`
              : `${selectedRelType.relType}`
            : selectedFilter && selectedFilter.condition}
        </StyledRelationship>
      }
      wide
    >
      <GrassEditor
        selectedRelType={selectedRelType}
        selectedCondition={selectedFilter}
        frameHeight={frameHeight}
        setVisibility={setVisibility}
        visible={visible}
      />
    </Popup>
  )
}
