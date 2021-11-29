/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
// import { ecsapeCypherMetaItem } from 'services/utils'
import classNames from 'classnames'
import styles from './style_meta.css'
import {
  DrawerSubHeader,
  DrawerSection,
  DrawerSectionBody
} from 'browser-components/drawer/drawer-styled'
import {
  StyledLabel
  // StyledRelationship,
  // StyledProperty,
  // StyledShowMoreContainer,
  // StyledShowMoreLink
} from './styled'

const createVizItems = (
  originalList: any[],
  onItemClick: any,
  RenderType: any,
  editorCommandTemplate: any
) => {
  const items = [...originalList]
  return items.map((text, index) => {
    const getNodesCypher = editorCommandTemplate(text, index)
    return (
      <RenderType.component
        data-testid="sidebarMetaItem"
        key={index}
        onClick={() => onItemClick(getNodesCypher)}
      >
        {text}
      </RenderType.component>
    )
  })
}

const VisualAnalysisItems = ({ onItemClick }: any) => {
  const itemsList = ['DatabaseSchema', 'ComponentsInteraction']
  // TODO: set the editorCommandTemplate that will be used to get the needed data
  let vizItems = <p>No visualization templates</p>
  if (itemsList.length) {
    const editorCommandTemplate = (text: any) => {
      switch (text) {
        case 'DatabaseSchema':
          return 'CALL db.schema()'

        case 'ComponentsInteraction':
          return '!MATCH (n:cFile) RETURN n' // Change this query to query requiring filenames or rings and their interactions

        default:
          return ''
      }
    }

    vizItems = createVizItems(
      itemsList,
      onItemClick,
      { component: StyledLabel },
      editorCommandTemplate
    ) as any
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Visualization Templates</DrawerSubHeader>
      <DrawerSectionBody
        className={classNames({
          [styles['wrapper']]: true
        })}
      >
        {vizItems}
      </DrawerSectionBody>
    </DrawerSection>
  )
}

export { VisualAnalysisItems }
