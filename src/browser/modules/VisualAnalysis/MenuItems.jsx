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
} from 'browser-components/drawer'
import {
  StyledLabel
  // StyledRelationship,
  // StyledProperty,
  // StyledShowMoreContainer,
  // StyledShowMoreLink
} from './styled'
import Render from 'browser-components/Render'

// const ShowMore = ({ total, shown, moreStep, onMore }) => {
//   const numMore = total - shown > moreStep ? moreStep : total - shown
//   return (
//     <Render if={shown < total}>
//       <StyledShowMoreContainer>
//         <StyledShowMoreLink onClick={() => onMore(numMore)}>
//           Show {numMore} more
//         </StyledShowMoreLink>
//         &nbsp;|&nbsp;
//         <StyledShowMoreLink onClick={() => onMore(total)}>
//           Show all
//         </StyledShowMoreLink>
//       </StyledShowMoreContainer>
//     </Render>
//   )
// }

// const createItems = (
//   originalList,
//   onItemClick,
//   RenderType,
//   editorCommandTemplate,
//   showStar = true,
//   count
// ) => {
//   let items = [...originalList]
//   if (showStar) {
//     let str = '*'
//     if (count) {
//       str = `${str}(${count})`
//     }
//     items.unshift(str)
//   }
//   return items.map((text, index) => {
//     const getNodesCypher = editorCommandTemplate(text, index) // Change this function!!!
//     return (
//       <RenderType.component
//         data-testid='sidebarMetaItem'
//         key={index}
//         onClick={() => onItemClick(getNodesCypher)}
//       >
//         {text}
//       </RenderType.component>
//     )
//   })
// }
// const LabelItems = ({
//   labels = [],
//   totalNumItems,
//   onItemClick,
//   moreStep,
//   onMoreClick,
//   count
// }) => {
//   let labelItems = <p>There are no labels in database</p>
//   if (labels.length) {
//     const editorCommandTemplate = (text, i) => { // CYPHER QUERY DEFINED FOR EACH BUTTON
//       if (i === 0) {
//         return 'MATCH (n) RETURN n LIMIT 25'
//       }
//       return `MATCH (n:${ecsapeCypherMetaItem(text)}) RETURN n LIMIT 25`
//     }
//     labelItems = createItems(
//       labels,
//       onItemClick,
//       { component: StyledLabel },
//       editorCommandTemplate,
//       true,
//       count
//     )
//   }
//   return (
//     <DrawerSection>
//       <DrawerSubHeader>Node Labels</DrawerSubHeader>
//       <DrawerSectionBody
//         className={classNames({
//           [styles['wrapper']]: true
//         })}
//       >
//         {labelItems}
//       </DrawerSectionBody>
//       <ShowMore
//         total={totalNumItems}
//         shown={labels.length}
//         moreStep={moreStep}
//         onMore={onMoreClick}
//       />
//     </DrawerSection>
//   )
// }

const createVizItems = (
  originalList,
  onItemClick,
  RenderType,
  editorCommandTemplate
) => {
  let items = [...originalList]
  return items.map((text, index) => {
    const getNodesCypher = editorCommandTemplate(text, index)
    return (
      <RenderType.component
        data-testid='sidebarMetaItem'
        key={index}
        onClick={() => onItemClick(getNodesCypher)}
      >
        {text}
      </RenderType.component>
    )
  })
}

const VisualAnalysisItems = ({
  onItemClick
}) => {
  let itemsList = ['Component interactions']
  // TODO: set the editorCommandTemplate that will be used to get the needed data
  let vizItems = <p>No visualization templates</p>
  if (itemsList.length) {
    const editorCommandTemplate = (text, i) => {
      return 'CALL db.schema()'
    }

    vizItems = createVizItems(
      itemsList,
      onItemClick,
      { component: StyledLabel },
      editorCommandTemplate
    )
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
