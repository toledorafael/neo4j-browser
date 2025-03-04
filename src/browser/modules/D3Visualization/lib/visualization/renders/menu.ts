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
  console.log(arcInfo)
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
  menuItemLabel: any
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
        if (event.includes('expand')) {
          const edgeType = event.slice(6)
          viz.trigger('expandEdgeType', node, edgeType)
        } else {
          viz.trigger(event, node)
        }
      })
      elem.on('mouseover', (node: any) => {
        node.contextMenu = {
          menuSelection: event
          // menuContent: content,
          // label
        }

        if (menuItemLabel.style('opacity') == 0) {
          menuItemLabel
            // .transition()
            // .duration(200)
            .style('opacity', 1)
        }

        return viz.trigger('menuMouseOver', node)
      })
      result.push(
        elem.on('mouseout', (node: any) => {
          if (menuItemLabel.style('opacity') == 1) {
            menuItemLabel
              // .transition()
              // .duration(200)
              .style('opacity', 0)
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
  numberOfItems: any
) {
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

  const rawSvgIcon = icons[buttonProps.textValue]

  if (arcCentroid != undefined) {
    labelCoord[buttonProps.itemNumber] = arcCentroid
  }

  const menuItemLabel = labelPath
    .enter()
    // .data(buttonProps.className)
    .append('text')
    .attr('class', 'context-menu-item-label')
    // .attr('transform', `translate(${Math.floor(arcCentroid[0] + (buttonProps.position[0] * 100) / 100)},${Math.floor(arcCentroid[1]  + (buttonProps.position[1] * 100) / 100)}) scale(0.7)`)
    .attr(
      'transform',
      `translate(${labelCoord[buttonProps.itemNumber][0]},${
        labelCoord[buttonProps.itemNumber][1]
      })`
    )
    .text(buttonProps.className)
    .style('opacity', 0)

  // Removing to stop the dragging of the background
  attachContextEvent(buttonProps.eventName, [tab, path], viz, menuItemLabel)

  tab
    .transition()
    .duration(200)
    .attr({
      d(node: any) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return newArc(numberOfItems, node.radius, buttonProps.itemNumber)()
      }
    })

  path
    .exit()
    .transition()
    .duration(200)
    .attr({
      d(node: any) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return newArc(numberOfItems, node.radius, buttonProps.itemNumber, 1)()
      }
    })
    .remove()

  return labelPath.exit().remove()
}

const createMenuList = function(selection: any, viz: any) {
  // Get node data (edge type for now, specific queries later)
  const hiddenEdgeTypes = selection.data()[0].hiddenEdgeTypes

  if (hiddenEdgeTypes) {
    const buttonsProps: any = []

    for (const key in hiddenEdgeTypes) {
      buttonsProps.push({
        eventName: 'expand' + hiddenEdgeTypes[key].edgeType,
        itemNumber: Number(key) + 1,
        className: 'expand_' + hiddenEdgeTypes[key].edgeType,
        position: [-8, 0],
        textValue:
          hiddenEdgeTypes[key].edgeType +
          '(' +
          hiddenEdgeTypes[key].total +
          ')',
        helpValue: 'Expand ' + hiddenEdgeTypes[key].edgeType + ' relationships'
      })
    }

    buttonsProps.forEach((button: any) => {
      createMenuListItem(selection, viz, button, buttonsProps.length)
    })
  }
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
