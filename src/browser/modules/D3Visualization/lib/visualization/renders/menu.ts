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
  content: any,
  label: any
) =>
  (() => {
    const result = []
    for (const elem of Array.from(elems)) {
      elem.on('mousedown.drag', () => {
        ;(d3.event as Event).stopPropagation()
        return null
      })
      // TODO: add extra argument specifying the type if event = expand
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
          menuSelection: event,
          menuContent: content,
          label
        }
        // Set visibility of question to 'visible'
        return viz.trigger('menuMouseOver', node)
      })
      result.push(
        elem.on('mouseout', (node: any) => {
          delete node.contextMenu
          // Set visibility of question to 'hidden'
          return viz.trigger('menuMouseOut', node)
        })
      )
    }
    return result
  })()

const createMenuItem = function(
  selection: any,
  viz: any,
  eventName: any,
  itemNumber: any,
  className: any,
  position: any,
  textValue: any,
  helpValue: any
) {
  const path = selection.selectAll(`path.${className}`).data(getSelectedNode)
  const iconPath = selection
    .selectAll(`.icon.${className}`)
    .data(getSelectedNode)

  const tab = path
    .enter()
    .append('path')
    .classed(className, true)
    .classed('context-menu-item', true)
    .attr({
      d(node: any) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return arc(node.radius, itemNumber, 1)()
      }
    })

  const rawSvgIcon = icons[textValue]
  const icon = iconPath
    .enter()
    .appendSVG(rawSvgIcon)
    .classed(className, true)
    .classed('context-menu-item', true)
    .attr({
      transform(node: any) {
        return `translate(${Math.floor(
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
          arc(node.radius, itemNumber).centroid()[0] + (position[0] * 100) / 100
        )},${Math.floor(
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
          arc(node.radius, itemNumber).centroid()[1] + (position[1] * 100) / 100
        )}) scale(0.7)`
      },
      color(node: any) {
        return viz.style.forNode(node).get('text-color-internal')
      }
    })
  // Removing to stop the dragging of the background
  attachContextEvent(eventName, [tab, icon], viz, helpValue, rawSvgIcon)

  tab
    .transition()
    .duration(200)
    .attr({
      d(node: any) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return arc(node.radius, itemNumber)()
      }
    })

  path
    .exit()
    .transition()
    .duration(200)
    .attr({
      d(node: any) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return arc(node.radius, itemNumber, 1)()
      }
    })
    .remove()

  return iconPath.exit().remove()
}

const createMenuListItem = function(
  selection: any,
  viz: any,
  buttonProps: any,
  numberOfItems: any
) {
  // const node = selection.selectAll(`.icon.${buttonProps.className}`).data(getSelectedNode)[0]
  const path = selection
    .selectAll(`path.${buttonProps.className}`)
    .data(getSelectedNode)
  const iconPath = selection
    .selectAll(`.icon.${buttonProps.className}`)
    .data(getSelectedNode)
  // node[0].hiddenEdgeTypes = buttonProps.edgeType
  // TODO: find a wat to get update hidden edge type to keep only the type being expanded
  // so when expandEdgeType is called, it looks in the property of the node and expands correctly

  const tab = path
    .enter()
    .append('path')
    .classed(buttonProps.className, true)
    .classed('context-menu-item', true)
    .attr({
      d(node: any) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return newArc(numberOfItems, node.radius, buttonProps.itemNumber, 1)()
      }
    })
  // .append("text")
  // // .attr("dy", ".35em")
  // // .attr("text-anchor", "middle")
  // .text("This is a text!");
  // // .attr("transform", `translate(${arc.centroid()})`)
  // .on('mouseover', function (d:any, i:any) {
  //   console.log("Hovering")
  //   console.log(d)
  //   console.log(i)

  //   //Makes div appear
  //   div.transition()
  //     .duration(100)
  //     .style("opacity", 1)

  //   div.html("$" + d3.format(".2f")(10000))
  //     .style("left", ((<any>d3.event).pageX + 10) + "px")
  //     .style("top", ((<any>d3.event).pageX - 15) + "px")
  // })
  // .on('mouseout', function (d:any, i:any) {
  //   console.log("Unhovering")
  //   console.log(d)
  //   console.log(i)

  //   //makes div disappear
  //  div.transition()
  //     .duration(200)
  //     .style("opacity", 0)

  // })

  const rawSvgIcon = icons[buttonProps.textValue]

  // const div = d3.select("neod3viz").append("div")
  const div = tab
    .append('text')
    .classed(buttonProps.className, true)
    .classed('tooltip', true)
    .text('$' + d3.format('.2f')(10000))
    .style('opacity', 1)
    .style('left', '10px')
    .style('top', '10px')

  const icon = iconPath
    .enter()
    .appendSVG(rawSvgIcon)
    .classed(buttonProps.className, true)
    .classed('context-menu-item', true)
    .attr({
      transform(node: any) {
        return `translate(${Math.floor(
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
          newArc(
            numberOfItems,
            node.radius,
            buttonProps.itemNumber
          ).centroid()[0] +
            (buttonProps.position[0] * 100) / 100
        )},${Math.floor(
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
          newArc(
            numberOfItems,
            node.radius,
            buttonProps.itemNumber
          ).centroid()[1] +
            (buttonProps.position[1] * 100) / 100
        )}) scale(0.7)`
      },
      color(node: any) {
        return viz.style.forNode(node).get('text-color-internal')
      }
    })
    .append('text')
    // .attr("dy", ".35em")
    // .attr("text-anchor", "middle")
    .text('This is a text!')
  // .attr("transform", `translate(${arc.centroid()})`)

  // Removing to stop the dragging of the background
  attachContextEvent(
    buttonProps.eventName,
    [tab, icon],
    viz,
    buttonProps.helpValue,
    rawSvgIcon
  )

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

  return iconPath.exit().remove()
}

const createMenuList = function(selection: any, viz: any) {
  // Get node data (edge type for now, specific queries later)
  const hiddenEdgeTypes = selection.data()[0].hiddenEdgeTypes

  //TODO: for each edgeType create a menuitem
  if (hiddenEdgeTypes) {
    // const buttonsProps:any = hiddenEdgeTypes.map((edgeTypeItem:any) => {
    //   return {
    //     eventName: 'expand'+edgeTypeItem.edgeType,
    //     itemNumber: 1,
    //     className: 'expand_'+edgeTypeItem.edgeType,
    //     position: [-8, 0],
    //     textValue: edgeTypeItem.edgeType+"("+edgeTypeItem.total+")",
    //     helpValue:'Expand '+edgeTypeItem.edgeType+' relationships'
    //   }
    // })

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

    // const buttonsProps:any = [
    //   {eventName: 'expand'+hiddenEdgeTypes[0].edgeType,
    //     itemNumber: 1,
    //     className: 'expand_'+hiddenEdgeTypes[0].edgeType,
    //    position: [-8, 0],
    //    textValue: hiddenEdgeTypes[0].edgeType+"("+hiddenEdgeTypes[0].total+")",
    //     helpValue:'Expand '+hiddenEdgeTypes[0].edgeType+' relationships'},
    //   {eventName: 'expand'+hiddenEdgeTypes[1].edgeType,
    //     itemNumber: 2,
    //     className: 'expand_'+hiddenEdgeTypes[1].edgeType,
    //     position: [-8, -10],
    //     textValue: hiddenEdgeTypes[1].edgeType+"("+hiddenEdgeTypes[1].total+")",
    //     helpValue:'Expand '+hiddenEdgeTypes[1].edgeType+' relationships'},
    //   // {eventName: 'nodeDblClicked',
    //   //   itemNumber:2,
    //   //   className:'expand_node',
    //   //   position: [-8, -10],
    //   //   textValue: hiddenEdgeTypes[1].edgeType+"("+hiddenEdgeTypes[1].total+")",
    //   //   helpValue:'Expand / Collapse child relationships'},
    //   {eventName: 'expand'+hiddenEdgeTypes[2].edgeType,
    //     itemNumber: 3,
    //     className: 'expand_'+hiddenEdgeTypes[2].edgeType,
    //     position:[-10, -6],
    //     textValue: hiddenEdgeTypes[2].edgeType+"("+hiddenEdgeTypes[2].total+")",
    //     helpValue:'Expand '+hiddenEdgeTypes[2].edgeType+' relationships'},
    // ]

    buttonsProps.forEach((button: any) => {
      createMenuListItem(selection, viz, button, buttonsProps.length)
    })
  }
}

const donutVarWriteNode = new Renderer({
  onGraphChange(selection: any, viz: any) {
    return createMenuItem(
      selection,
      viz,
      'expandVarWrite',
      1,
      'expand_varWrite',
      [-8, 0],
      'Expand / Collapse',
      'Expand varWrite relationships'
    )
  },

  onTick: noop
})

const donutExpandNode = new Renderer({
  onGraphChange(selection: any, viz: any) {
    return createMenuItem(
      selection,
      viz,
      'nodeDblClicked',
      2,
      'expand_node',
      [-8, -10],
      'Expand / Collapse',
      'Expand / Collapse child relationships'
    )
  },

  onTick: noop
})

const donutUnlockNode = new Renderer({
  onGraphChange(selection: any, viz: any) {
    return createMenuItem(
      selection,
      viz,
      'nodeUnlock',
      3,
      'unlock_node',
      [-10, -6],
      'Unlock',
      'Unlock the node to re-layout the graph'
    )
  },

  onTick: noop
})

const listEdgeTypes = new Renderer({
  onGraphChange(selection: any, viz: any) {
    return createMenuList(selection, viz)
  },

  onTick: noop
})

const menu: any[] = []

// menu.push(donutExpandNode)
// menu.push(donutVarWriteNode)
// menu.push(donutUnlockNode)

menu.push(listEdgeTypes)

export { menu }
