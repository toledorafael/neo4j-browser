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

import d3 from 'd3'
import NeoD3Geometry from './graphGeometry'
import * as vizRenderers from '../renders/init'
import { menu as menuRenderer } from '../renders/menu'
import vizClickHandler from '../utils/clickHandler'

const vizFn = function (el, measureSize, graph, layout, style) {
  const viz = { style }

  const root = d3.select(el)
  const baseGroup = root.append('g').attr('transform', 'translate(0,0)')
  const rect = baseGroup
    .append('rect')
    .style('fill', 'none')
    .style('pointer-events', 'all')
    // Make the rect cover the whole surface
    .attr('x', '-2500')
    .attr('y', '-2500')
    .attr('width', '5000')
    .attr('height', '5000')
    .attr('transform', 'scale(1)')

  const container = baseGroup.append('g')
  const geometry = new NeoD3Geometry(style)

  // This flags that a panning is ongoing and won't trigger
  // 'canvasClick' event when panning ends.
  let draw = false

  // Arbitrary dimension used to keep force layout aligned with
  // the centre of the svg view-port.
  const layoutDimension = 200

  let updateViz = true
  var color = d3.scale.category20()
  const groupIds = getGroupIDs(graph.nodes())

  // To be overridden
  viz.trigger = function (event, ...args) {}

  const onNodeClick = node => {
    updateViz = false
    return viz.trigger('nodeClicked', node)
  }

  const onNodeDblClick = node => viz.trigger('nodeDblClicked', node)

  const onNodeDragToggle = (node, groupIds) => {
    if (groupIds) {
      const groupPaths = container
        .selectAll('g.fileGroup')
      const nodeGroups = container
        .selectAll('g.node')
      updateGroups(groupIds, groupPaths, nodeGroups)
    }
    viz.trigger('nodeDragToggle', node)
  }
  const onRelationshipClick = relationship => {
    d3.event.stopPropagation()
    updateViz = false
    return viz.trigger('relationshipClicked', relationship)
  }

  const onNodeMouseOver = node => viz.trigger('nodeMouseOver', node)
  const onNodeMouseOut = node => viz.trigger('nodeMouseOut', node)

  const onRelMouseOver = rel => viz.trigger('relMouseOver', rel)
  const onRelMouseOut = rel => viz.trigger('relMouseOut', rel)

  let zoomLevel = null

  const zoomed = function () {
    draw = true
    return container.attr(
      'transform',
      `translate(${zoomBehavior.translate()})scale(${zoomBehavior.scale()})`
    )
  }

  var zoomBehavior = d3.behavior
    .zoom()
    .scaleExtent([0.2, 1])
    .on('zoom', zoomed)

  const interpolateZoom = (translate, scale) =>
    d3
      .transition()
      .duration(500)
      .tween('zoom', function () {
        const t = d3.interpolate(zoomBehavior.translate(), translate)
        const s = d3.interpolate(zoomBehavior.scale(), scale)
        return function (a) {
          zoomBehavior.scale(s(a)).translate(t(a))
          return zoomed()
        }
      })

  let isZoomingIn = true

  viz.zoomInClick = function () {
    isZoomingIn = true
    return zoomClick(this)
  }

  viz.zoomOutClick = function () {
    isZoomingIn = false
    return zoomClick(this)
  }

  var zoomClick = function (element) {
    draw = true
    const limitsReached = { zoomInLimit: false, zoomOutLimit: false }

    if (isZoomingIn) {
      zoomLevel = Number((zoomBehavior.scale() * (1 + 0.2 * 1)).toFixed(2))
      if (zoomLevel >= zoomBehavior.scaleExtent()[1]) {
        limitsReached.zoomInLimit = true
        interpolateZoom(zoomBehavior.translate(), zoomBehavior.scaleExtent()[1])
      } else {
        interpolateZoom(zoomBehavior.translate(), zoomLevel)
      }
    } else {
      zoomLevel = Number((zoomBehavior.scale() * (1 + 0.2 * -1)).toFixed(2))
      if (zoomLevel <= zoomBehavior.scaleExtent()[0]) {
        limitsReached.zoomOutLimit = true
        interpolateZoom(zoomBehavior.translate(), zoomBehavior.scaleExtent()[0])
      } else {
        interpolateZoom(zoomBehavior.translate(), zoomLevel)
      }
    }
    return limitsReached
  }
  // Background click event
  // Check if panning is ongoing
  rect.on('click', function () {
    if (!draw) {
      return viz.trigger('canvasClicked', el)
    }
  })

  // rect.on(wheel, function(d) {
  //   var direction = d3.event.wheelDelta < 0 ? 'down' : 'up'
  //   isZoomingIn = direction === 'up' ? d : d.parent
  //   return zoomClick(this)
  // })

  baseGroup
    .call(zoomBehavior)
    .on('dblclick.zoom', null)
    // Single click is not panning
    .on('click.zoom', () => (draw = false))
    .on('DOMMouseScroll.zoom', null)
    .on('wheel.zoom', null)
    .on('mousewheel.zoom', null)

  const newStatsBucket = function () {
    const bucket = {
      frameCount: 0,
      geometry: 0,
      relationshipRenderers: (function () {
        const timings = {}
        vizRenderers.relationship.forEach(r => (timings[r.name] = 0))
        return timings
      })()
    }
    bucket.duration = () => bucket.lastFrame - bucket.firstFrame
    bucket.fps = () =>
      ((1000 * bucket.frameCount) / bucket.duration()).toFixed(1)
    bucket.lps = () =>
      ((1000 * bucket.layout.layoutSteps) / bucket.duration()).toFixed(1)
    bucket.top = function () {
      let time
      const renderers = []
      for (let name in bucket.relationshipRenderers) {
        time = bucket.relationshipRenderers[name]
        renderers.push({
          name,
          time
        })
      }
      renderers.push({
        name: 'forceLayout',
        time: bucket.layout.layoutTime
      })
      renderers.sort((a, b) => b.time - a.time)
      const totalRenderTime = renderers.reduce(
        (prev, current) => prev + current.time,
        0
      )
      return renderers
        .map(
          d => `${d.name}: ${((100 * d.time) / totalRenderTime).toFixed(1)}%`
        )
        .join(', ')
    }
    return bucket
  }

  let currentStats = newStatsBucket()

  const now =
    window.performance && window.performance.now
      ? () => window.performance.now()
      : () => Date.now()

  const render = function () {
    if (!currentStats.firstFrame) {
      currentStats.firstFrame = now()
    }
    currentStats.frameCount++
    const startRender = now()
    geometry.onTick(graph)
    currentStats.geometry += now() - startRender

    const nodeGroups = container
      .selectAll('g.node')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    for (var renderer of Array.from(vizRenderers.node)) {
      nodeGroups.call(renderer.onTick, viz)
    }

    // it might be called when it does not exist yet
    const groupPaths = container
      .selectAll('g.fileGroup') // path_placeholder
      // .select('path')
      // .attr('transform', d => `translate(0,0)`)
      // .attr('stroke', function (d) { return color(d) })
      // .attr('fill', function (d) { return color(d) })
      // .attr('opacity', 1)
    //   .data(groupIds, function (d) { return d })

    // groupPaths // Update to path
    //   // .append('g')
    //   // .attr('class', 'fileGroup')
    //   .append('path')
    //   .attr('transform', `translate(0,0)`)
    //   .attr('stroke', function (d) { return color(d) })
    //   .attr('fill', function (d) { return color(d) })
    //   .attr('opacity', 0.2)

    // const groupPaths = container
    //   .select('g.layer.fileGroups')
    //   .selectAll('fileGroup')
    //   .data(groupIds, function (d) { return d })

    // groupPaths
    //   .enter() // Update to path
    //   .append('g')
    //   .attr('class', 'fileGroup')
    //   .append('path')
    //   // .attr('transform', `translate(0,0)`)
    //   .attr('stroke', function (d) { return color(d) })
    //   .attr('fill', function (d) { return color(d) })
    //   .attr('opacity', 1)

    // groupPaths
    //   .transition()
    //   .duration(2000)
    //   .attr('opacity', 0.2)

    // groupPaths.exit().remove()

    // groupPaths are empty because container just have node and relationship layers
    updateGroups(groupIds, groupPaths, nodeGroups)

    // for (renderer of Array.from(vizRenderers.fileGroup)) {
    //   groupPaths.call(renderer.onTick, viz)
    // }

    const relationshipGroups = container
      .selectAll('g.relationship')
      .attr(
        'transform',
        d =>
          `translate(${d.source.x} ${d.source.y}) rotate(${d.naturalAngle +
            180})`
      )

    for (renderer of Array.from(vizRenderers.relationship)) {
      const startRenderer = now()
      relationshipGroups.call(renderer.onTick, viz)
      currentStats.relationshipRenderers[renderer.name] += now() - startRenderer
    }

    return (currentStats.lastFrame = now())
  }

  const force = layout.init(render)

  // Add custom drag event listeners
  force
    .drag()
    .on('dragstart.node', d => onNodeDragToggle(d, groupIds))
    .on('dragend.node', () => onNodeDragToggle())

  /// ///////////////////////////////////////// Initiate polygons
  // const groupPaths = container
  //   .selectAll('g.fileGroup') // path_placeholder
  //   .append('path')
  //   .attr('transform', `translate(0,0)`)
  //   .attr('stroke', function (d) { return color(d) })
  //   .attr('fill', function (d) { return color(d) })
  //   .attr('opacity', 1)

  // const groupPaths = container
  //   .select('g.layer.fileGroups')
  //   .selectAll('fileGroup')
  //   .data(groupIds, function (d) { return d })

  // groupPaths.enter() // Update to path
  //   .append('g')
  //   .attr('class', 'fileGroup')
  //   .append('path')
  //   // .attr('transform', `translate(0,0)`)
  //   .attr('stroke', function (d) { return color(d) })
  //   .attr('fill', function (d) { return color(d) })
  //   .attr('opacity', 1)

  // // groupPaths
  // //   .transition()
  // //   .duration(2000)
  // //   .attr('opacity', 0.6)
  // groupPaths.exit().remove()

  viz.collectStats = function () {
    const latestStats = currentStats
    latestStats.layout = force.collectStats()
    currentStats = newStatsBucket()
    return latestStats
  }

  // viz.initGroupMarks() {
  //   const groupIds = getGroupIDs(nodes)
  // ....
  // }

  viz.update = function () {
    if (!graph) {
      return
    }

    const layers = container
      .selectAll('g.layer')
      .data(['relationships', 'nodes', 'fileGroups'])
    layers
      .enter()
      .append('g')
      .attr('class', d => `layer ${d}`)

    const nodes = graph.nodes()
    const relationships = graph.relationships()

    const groupIds = getGroupIDs(nodes) // update groupIds with current states of nodes set

    const relationshipGroups = container
      .select('g.layer.relationships')
      .selectAll('g.relationship')
      .data(relationships, d => d.id)

    relationshipGroups
      .enter()
      .append('g')
      .attr('class', 'relationship')
      .on('mousedown', onRelationshipClick)
      .on('mouseover', onRelMouseOver)
      .on('mouseout', onRelMouseOut)

    relationshipGroups.classed(
      'selected',
      relationship => relationship.selected
    )

    geometry.onGraphChange(graph)

    for (var renderer of Array.from(vizRenderers.relationship)) {
      relationshipGroups.call(renderer.onGraphChange, viz)
    }

    relationshipGroups.exit().remove()

    const nodeGroups = container
      .select('g.layer.nodes')
      .selectAll('g.node')
      .data(nodes, d => d.id)

    nodeGroups
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(force.drag)
      .call(clickHandler)
      .on('mouseover', onNodeMouseOver)
      .on('mouseout', onNodeMouseOut)

    nodeGroups.classed('selected', node => node.selected)

    for (renderer of Array.from(vizRenderers.node)) {
      nodeGroups.call(renderer.onGraphChange, viz)
    }

    for (renderer of Array.from(menuRenderer)) {
      nodeGroups.call(renderer.onGraphChange, viz)
    }

    nodeGroups.exit().remove()

    // var polygon, centroid
    // select nodes of the group, retrieve its positions
    // and return the convex hull of the specified points
    // (3 points as minimum, otherwise returns null)

    // var scaleFactor = 1.2

    // var polygonGenerator = function (groupId) {
    //   var nodeCoords = nodeGroups
    //     .filter(function (d) { if (d.propertyMap.hasOwnProperty('filename')) { return groupId.localeCompare(d.propertyMap.filename) } })
    //     .data()
    //     .map(function (d) { return [d.x, d.y] })

    //   return d3.geom.polygon(d3.geom.hull(nodeCoords))
    //   // return d3.geom.polygon(nodeCoords)
    //   // return d3.polygonHull(nodeCoords)
    // }

    const groupPaths = container
      .select('g.layer.fileGroups')
      .selectAll('g.fileGroup')
      .data(groupIds, function (d) { return d })

    groupPaths
      .enter() // Update to path
      .append('g')
      .attr('class', 'fileGroup')
      .append('path')
      .attr('transform', `translate(0,0)`)
      .attr('stroke', function (d) { return color(d) })
      .attr('fill', function (d) { return color(d) })
      .attr('opacity', 1)

    // // groupPaths
    // //   .transition()
    // //   .duration(2000)
    // //   .attr('opacity', 0.6)

    // // groupPaths
    // //   .transition()
    // //   .duration(2000)
    // //   .attr('opacity', 0.2)

    // // for (renderer of Array.from(vizRenderers.fileGroup)) {
    // //   groupPaths.call(renderer.onGraphChange, viz)
    // // }

    // Learn about the exit function ************************** Right now it removes the whole layer
    groupPaths.exit().remove()

    /// /////////////// Should select the g initialized
    // const groupPaths = container.select('g.fileGroups')

    // console.log(fileGroups.node())
    // console.log(fileGroups.node().parentNode)
    // console.log(nodeGroups.node())
    // console.log(nodeGroups.node().parentNode)
    // console.log(relationshipGroups.node())
    // console.log(relationshipGroups.node().parentNode)
    if (updateViz) {
      force.update(graph, [layoutDimension, layoutDimension])
      updateGroups(groupIds, groupPaths, nodeGroups)

      // // update group paths
      // groupIds.forEach(function (groupId) {
      //   var path = groupPaths.filter(function (d) { return groupId.localeCompare(d) })
      //     .attr('transform', `scale(1) translate(0,0)`)
      //     .attr('d', function (d) {
      //       polygon = polygonGenerator(d)
      //       centroid = polygon.centroid()
      //       // console.log(centroid)
      //       // to scale the shape properly around its points:
      //       // move the 'g' element to the centroid point, translate
      //       // all the path around the center of the 'g' and then
      //       // we can scale the 'g' element properly
      //       return valueline(
      //         polygon.map(function (point) {
      //           return [ point[0] - centroid[0], point[1] - centroid[1] ]
      //         })
      //       )
      //     })
      //   // console.log(centroid)
      //   // console.log(path.node().parentNode)
      //   d3.select(path.node().parentNode).attr('transform', `translate(${centroid[0]},${centroid[1]}) scale(${scaleFactor})`)
      // })

      viz.resize()
      viz.trigger('updated')
    }

    return (updateViz = true)
  }

  viz.resize = function () {
    const size = measureSize()
    return root.attr(
      'viewBox',
      [
        0,
        (layoutDimension - size.height) / 2,
        layoutDimension,
        size.height
      ].join(' ')
    )
  }

  viz.boundingBox = () => container.node().getBBox()

  var clickHandler = vizClickHandler()
  clickHandler.on('click', onNodeClick)
  clickHandler.on('dblclick', onNodeDblClick)

  return viz
}

// var scaleFactor = 1.2

var polygonGenerator = function (groupId, nodeGroups) {
  // console.log(groupId)
  // console.log(nodeGroups)

  var nodeCoords = nodeGroups
    .filter(function (d) {
      if (d.propertyMap.hasOwnProperty('filename')) {
        return groupId === d.propertyMap.filename
      }
    })
    .data()
    .map(function (d) {
      return [d.px, d.py]
      // console.log(d.caption.node.x)
    })
  return d3.geom.polygon(d3.geom.hull(nodeCoords))
  // return d3.geom.polygon(nodeCoords)
  // return d3.geom.hull(nodeCoords)
}

var valueline = d3.svg.line()
  .x(function (d) { return d[0] })
  .y(function (d) { return d[1] })
  .interpolate('linear-closed')

function updateGroups (groupIds, fileGroups, nodeGroups) {
  if (fileGroups[0].length > 0) {
    var polygon
    var centroid = null
    groupIds.forEach(function (groupId) {
      var path = fileGroups.filter(function (d) { return groupId === d })
        .select('path')
        .attr('transform', 'translate(0,0)')
        .attr('d', function (d) {
          polygon = polygonGenerator(d, nodeGroups)
          centroid = polygon.centroid()

          return valueline(
            polygon.map(function (point) {
              return [ point[0] - centroid[0], point[1] - centroid[1] ]
            })
          ) + 'Z'
        })
      d3.select(path.node().parentNode).attr('transform', `translate(${+centroid[0]},${+centroid[1]}) scale(1.5)`)
    })
  }
}

function getGroupIDs (nodes) {
  return d3.set(nodes.map(function (n) {
    if (n.propertyMap.hasOwnProperty('filename')) {
      return n.propertyMap.filename
    }
  }))
    .values()
    .map(function (groupId) {
      return {
        groupId: groupId,
        count: nodes.filter(function (n) { return groupId === n.propertyMap.filename }).length
      }
    })
    .filter(function (group) { return group.count > 2 })
    .map(function (group) { return group.groupId })
}

export default vizFn

// create groups
// groups = svg.append('g').attr('class', 'groups');

// link = svg.append('g')
//     .attr('class', 'links')
//   .selectAll('line')
//   .data(graph.links)
//   .enter().append('line')
//     .attr('stroke-width', function(d) { return Math.sqrt(d.value); });

// node = svg.append('g')
//     .attr('class', 'nodes')
//   .selectAll('circle')
//   .data(graph.nodes)
//   .enter().append('circle')
//     .attr('r', 5)
//     .attr('fill', function(d) { return color(d.group); })
//     .call(d3.drag()
//         .on('start', dragstarted)
//         .on('drag', dragged)
//         .on('end', dragended));

// count members of each group. Groups with less
// than 3 member will not be considered (creating
// a convex hull need 3 points at least)
// groupIds = d3.set(graph.nodes.map(function(n) { return +n.group; }))
//   .values()
//   .map( function(groupId) {
//     return {
//       groupId : groupId,
//       count : graph.nodes.filter(function(n) { return +n.group == groupId; }).length
//     };
//   })
//   .filter( function(group) { return group.count > 2;})
//   .map( function(group) { return group.groupId; });

// paths = groups.selectAll('.path_placeholder')
//   .data(groupIds, function(d) { return +d; })
//   .enter()
//   .append('g')
//   .attr('class', 'path_placeholder')
//   .append('path')
//   .attr('stroke', function(d) { return color(d); })
//   .attr('fill', function(d) { return color(d); })
//   .attr('opacity', 0);

// paths
//   .transition()
//   .duration(2000)
//   .attr('opacity', 1);

// // add interaction to the groups
// // groups.selectAll('.path_placeholder')
// //   .call(d3.drag()
// //     .on('start', group_dragstarted)
// //     .on('drag', group_dragged)
// //     .on('end', group_dragended)
// //     );

// // select nodes of the group, retrieve its positions
// // and return the convex hull of the specified points
// // (3 points as minimum, otherwise returns null)
// var polygonGenerator = function(groupId) {
//   var node_coords = node
//     .filter(function(d) { return d.group == groupId; })
//     .data()
//     .map(function(d) { return [d.x, d.y]; });

//   return d3.polygonHull(node_coords);
// };

// function updateGroups() {
//   groupIds.forEach(function(groupId) {
//     var path = paths.filter(function(d) { return d == groupId;})
//       .attr('transform', 'scale(1) translate(0,0)')
//       .attr('d', function(d) {
//         polygon = polygonGenerator(d);
//         centroid = d3.polygonCentroid(polygon);

//         // to scale the shape properly around its points:
//         // move the 'g' element to the centroid point, translate
//         // all the path around the center of the 'g' and then
//         // we can scale the 'g' element properly
//         return valueline(
//           polygon.map(function(point) {
//             return [  point[0] - centroid[0], point[1] - centroid[1] ];
//           })
//         );
//       });

//     d3.select(path.node().parentNode).attr('transform', 'translate('  + centroid[0] + ',' + (centroid[1]) + ') scale(' + scaleFactor + ')');
//   });
// }
