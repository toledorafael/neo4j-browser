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
import d3 from 'd3'
import Renderer from '../components/renderer'
import icons from './d3Icons'
import { tooltip } from '../styles.css'
import { divide } from 'lodash-es'
import { number } from 'prop-types'
import { argsToArgsConfig } from 'graphql/type/definition'

const noop = function() {}

const numberOfItemsInContextMenu = 3

const lastMenuOptions: any = {}

const labelCoord: any = {}

const arc = function(radius?: any, itemNumber?: any, width?: any) {
  const localWidth = width == null ? 30 : width
  const startAngle =
    ((2 * Math.PI) / numberOfItemsInContextMenu) * (itemNumber - 1)
  const endAngle = startAngle + (2 * Math.PI) / numberOfItemsInContextMenu
  const innerRadius = Math.max(radius + 8, 20)
  return d3.svg
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + localWidth)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .padAngle(0.03)
}

const newArc = function(
  numberOfItems: any,
  radius?: any,
  itemNumber?: any,
  width?: any
) {
  const localWidth = width == null ? 30 : width
  const startAngle = ((2 * Math.PI) / numberOfItems) * (itemNumber - 1)
  const endAngle = startAngle + (2 * Math.PI) / numberOfItems
  const innerRadius = Math.max(radius + 8, 20)
  const arcInfo = {
    itemNumber: itemNumber,
    radius: radius,
    width: width,
    localWidth: localWidth,
    numberOfItems: numberOfItems,
    startAngle: startAngle * 57,
    endAngle: endAngle * 57,
    innerRadius: innerRadius
  }
  return d3.svg
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + localWidth)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .padAngle(0.03)

  // return d3.select("svg").append("g").arc()
  // .innerRadius(innerRadius)
  // .outerRadius(innerRadius + localWidth)
  // .startAngle(startAngle)
  // .endAngle(endAngle)
  // .padAngle(0.03)
}

const getSelectedNode = function(node: any) {
  if (node.selected && node.hiddenEdgeTypes) {
    // if (node.selected) {
    return [node]
  } else {
    return []
  }
}

const attachContextEvent = (
  event: any,
  elems: any[],
  viz: any,
  menuItemLabel: any[]
) =>
  (() => {
    const result = []
    for (const elem of Array.from(elems)) {
      elem.on('mousedown.drag', () => {
        ;(d3.event as Event).stopPropagation()
        return null
      })
      // If event expandX => event = expand and X = trigger argument
      elem.on('mouseup', (node: any) => {
        for (const labelElem of Array.from(menuItemLabel)) {
          if (labelElem.style('opacity') == 1) {
            labelElem
              // .transition()
              // .duration(50)
              .style('opacity', 0)
          }
        }
        // if (event.includes('expand')) {
        //   const edgeType = event.slice(6)
        //   viz.trigger('expandEdgeType', node, edgeType)
        // } else {
        //   viz.trigger(event, node)
        // }
        viz.trigger(event, node)
      })
      elem.on('mouseover', (node: any) => {
        node.contextMenu = {
          menuSelection: event
          // menuContent: content,
          // label
        }

        for (const labelElem of Array.from(menuItemLabel)) {
          if (labelElem.style('opacity') == 0) {
            labelElem
              // .transition()
              // .duration(50)
              .style('opacity', 1)
          }
        }

        return viz.trigger('menuMouseOver', node)
      })
      result.push(
        elem.on('mouseout', (node: any) => {
          for (const labelElem of Array.from(menuItemLabel)) {
            if (labelElem.style('opacity') == 1) {
              labelElem
                // .transition()
                // .duration(200)
                .style('opacity', 0)
            }
          }
          delete node.contextMenu
          return viz.trigger('menuMouseOut', node)
        })
      )
    }
    return result
  })()

const createMenuListItem = function(
  selection: any,
  viz: any,
  buttonProps: any,
  numberOfItems: any,
  queryResults: any
) {
  // const menuItemsArr = selection.selectAll(`.context-menu-item`)
  //If there is something being shown find path, labelPathn and tab for that instead of
  // buttonProps.className

  let arcCentroid: any
  const path = selection
    .selectAll(`path.${buttonProps.className}`)
    .data(getSelectedNode)

  const labelPath = selection
    .selectAll(`.label.${buttonProps.className}`)
    .data(getSelectedNode)

  const tab = path
    .enter()
    .append('path')
    .classed(buttonProps.className, true)
    .classed('context-menu-item', true)
    .attr({
      d(node: any) {
        arcCentroid = newArc(
          numberOfItems,
          node.radius,
          buttonProps.itemNumber
        ).centroid(node)
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return newArc(numberOfItems, node.radius, buttonProps.itemNumber, 1)()
      }
    })

  // const rawSvgIcon = icons[buttonProps.textValue]

  if (arcCentroid != undefined) {
    labelCoord[buttonProps.itemNumber] = arcCentroid
  }

  if (labelCoord != undefined && Object.keys(labelCoord).length != 0) {
    const rect = labelPath
      .enter()
      .append('rect')
      .attr('class', 'context-menu-item-rect')
      .attr('x', labelCoord[buttonProps.itemNumber][0] - 5)
      .attr('y', labelCoord[buttonProps.itemNumber][1] - 15)
      .attr('height', 20)
      .attr('width', 8.5 * buttonProps.textValue.length)
      .attr('rx', 5)
      .attr('ry', 5)
      .style('fill', () => {
        if (queryResults[buttonProps.className.slice(7)] == false) {
          return '#ff5050'
        } else {
          return '#fae08b'
        }
      })
      .style('opacity', 0)

    const menuItemLabel = labelPath
      .enter()
      // .data(buttonProps.className)
      .append('text')
      .attr('class', 'context-menu-item-label')
      .attr(
        'transform',
        `translate(${labelCoord[buttonProps.itemNumber][0]},${
          labelCoord[buttonProps.itemNumber][1]
        })`
      )
      .text(buttonProps.textValue)
      .style('opacity', 0)

    // Removing to stop the dragging of the background
    attachContextEvent(buttonProps.eventName, [tab, path, rect], viz, [
      rect,
      menuItemLabel
    ])
  }

  tab
    // .transition()
    // .duration(200)
    .attr({
      d(node: any) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return newArc(numberOfItems, node.radius, buttonProps.itemNumber)()
      }
    })

  path
    .exit()
    // .transition()
    // .duration(200)
    .attr({
      d(node: any) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return newArc(numberOfItems, node.radius, buttonProps.itemNumber, 1)()
      }
    })
    .remove()

  return labelPath.exit().remove()
}

const functionQuestions = [
  'WhoCanCallThis',
  'WhatAreTheArgs',
  'InWhichClassIsItDefined',
  // 'WhereIsMethodCalled',
  'AreAllCallsComingFromSameClass',
  // 'IncomingVarInfFunc',
  'OutgoingCall',
  'OutgoingWrite',
  'OutgoingContainFunction'
]

const variableQuestions = [
  'WhatCanUpdatethis',
  'WhereIsItDeclared',
  // 'WhereIsItAccessed',
  'WhatDataCanWeAccess',
  'IncomingParWrite',
  'IncomingVarWrite',
  // 'IncomingContainVariable',
  // 'OutgoingVarInfFunc',
  'OutgoingVarWrite',
  'OutgoingParWrite',
  'OutgoingInstanceOf'
]

const classQuestions = ['WhereAreInstancesCreated', 'OutgoingContain']

const questionLabels = {
  WhoCanCallThis: 'Who can call this?',
  WhatAreTheArgs: 'What are the args of this?',
  InWhichClassIsItDefined: 'In which class is this defined?',
  WhereIsMethodCalled: 'Where is this called?',
  AreAllCallsComingFromSameClass:
    'From which class are the calls to this coming from?',
  WhatCanUpdatethis: 'Which function writes to this?',
  WhereIsItDeclared: 'Where is this declared?',
  WhereIsItAccessed: 'Where is this accessed?',
  WhatDataCanWeAccess: 'What data is contained in this object?',
  WhereAreInstancesCreated: 'What are instances of this class?',
  IncomingVarInfFunc: 'Which variables may influence this function?',
  OutgoingCall: 'Who can be called by this?',
  OutgoingWrite: 'What variable does this function write to?',
  OutgoingContainFunction: 'Which variable does this function contain?',
  IncomingParWrite: 'Which variable is passed as this argument?',
  IncomingVarWrite: 'Which variable writes to this variable?',
  IncomingContainVariable: 'Which entity contains this variable?',
  OutgoingVarInfFunc: 'Which function is influenced by this variable?',
  OutgoingVarWrite: 'Which variable does this variable write to?',
  OutgoingParWrite:
    "Which function argument is assigned this variable's value?",
  OutgoingInstanceOf: 'Which class does this variable instantiate?',
  OutgoingContain: 'Which entities does this class contain?'
}

const createMenuList = function(selection: any, viz: any) {
  // Get node data (edge type for now, specific queries later)
  // const hiddenEdgeTypes = selection.data()[0].hiddenEdgeTypes

  const selectedNode = selection.data().filter((node: any) => node.selected)

  let queryResults: any = {}

  let menuOptions: string[] = []
  // let menuOptionsQuestions: any[] = []
  if (selectedNode != undefined) {
    if (selectedNode.length > 0) {
      //Get menu options from hiddenEdgeTypes property in the node
      // for (const key in selectedNode[0].hiddenEdgeTypes) {
      //   menuOptions.push(selectedNode[0].hiddenEdgeTypes[key].edgeType)
      // }
      queryResults = {
        WhoCanCallThis: selectedNode[0].WhoCanCallThis,
        WhatAreTheArgs: selectedNode[0].WhatAreTheArgs,
        InWhichClassIsItDefined: selectedNode[0].InWhichClassIsItDefined,
        WhereIsMethodCalled: selectedNode[0].WhereIsMethodCalled,
        AreAllCallsComingFromSameClass:
          selectedNode[0].AreAllCallsComingFromSameClass,
        WhatCanUpdatethis: selectedNode[0].WhatCanUpdatethis,
        WhereIsItDeclared: selectedNode[0].WhereIsItDeclared,
        WhereIsItAccessed: selectedNode[0].WhereIsItAccessed,
        WhatDataCanWeAccess: selectedNode[0].WhatDataCanWeAccess,
        WhereAreInstancesCreated: selectedNode[0].WhereAreInstancesCreated,
        IncomingVarInfFunc: selectedNode[0].IncomingVarInfFunc,
        OutgoingCall: selectedNode[0].OutgoingCall,
        OutgoingWrite: selectedNode[0].OutgoingWrite,
        OutgoingContainFunction: selectedNode[0].OutgoingContainFunction,
        IncomingParWrite: selectedNode[0].IncomingParWrite,
        IncomingVarWrite: selectedNode[0].IncomingVarWrite,
        IncomingContainVariable: selectedNode[0].IncomingContainVariable,
        OutgoingVarInfFunc: selectedNode[0].OutgoingVarInfFunc,
        OutgoingVarWrite: selectedNode[0].OutgoingVarWrite,
        OutgoingParWrite: selectedNode[0].OutgoingParWrite,
        OutgoingInstanceOf: selectedNode[0].OutgoingInstanceOf,
        OutgoingContain: selectedNode[0].OutgoingContain
      }
      //TODO: Get menu options from the type of the node
      switch (selectedNode[0].labels[0]) {
        case 'cFunction':
          for (const key in functionQuestions) {
            menuOptions.push(functionQuestions[key])
          }
          break
        case 'cVariable':
          menuOptions = variableQuestions
          break
        case 'cClass':
          menuOptions = classQuestions
          break
      }
    }
  }

  const menuItemsArr = selection.selectAll(`.context-menu-item`)
  const shownButtonsLabels: any[] = []

  if (menuItemsArr.some((e: any) => e.length != 0)) {
    for (const menuItems of menuItemsArr) {
      if (menuItems.length > 0) {
        for (const item of menuItems) {
          shownButtonsLabels.push(item.classList[0].slice(7))
        }
        break
      }
    }
  }

  // if (menuOptions != undefined) {
  //   if (menuOptions.length == 0 && menuItemsArr.length != 0) {
  //     for (const menuItems of menuItemsArr) {
  //       if (menuItems.length > 0) {
  //         for (const item of menuItems) {
  //           shownButtonsLabels.push(item.classList[0].slice(7))
  //         }
  //         break
  //       }
  //     }
  //   }
  // }

  const selectionWithoutSelected = selection.filter((d: any) => {
    return !d.selected
  })
  if (shownButtonsLabels.length > 0) {
    if (menuOptions.length == 0) {
      menuOptions = shownButtonsLabels
    } else {
      if (JSON.stringify(menuOptions) !== JSON.stringify(shownButtonsLabels)) {
        // run createMenuListItem with showLabels array and selection without the selectedNode
        menuOptions = shownButtonsLabels
        selection = selectionWithoutSelected
      }
    }
  }

  const buttonsProps: any = []

  for (const key in menuOptions) {
    buttonsProps.push({
      eventName: 'expand' + menuOptions[key],
      itemNumber: Number(key) + 1,
      className: 'expand_' + menuOptions[key],
      position: [-8, 0],
      textValue:
        questionLabels[menuOptions[key] as keyof typeof questionLabels],
      helpValue: 'Expand ' + menuOptions[key] + ' relationships'
    })
  }

  buttonsProps.forEach((button: any) => {
    createMenuListItem(
      selection,
      viz,
      button,
      buttonsProps.length,
      queryResults
    )
  })
  // }
}

const listEdgeTypes = new Renderer({
  onGraphChange(selection: any, viz: any) {
    return createMenuList(selection, viz)
  },

  onTick: noop
})

const menu: any[] = []

menu.push(listEdgeTypes)

export { menu }
