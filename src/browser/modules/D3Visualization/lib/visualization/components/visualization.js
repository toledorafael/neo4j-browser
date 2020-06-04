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

  //
  var expandableNetworkData = {}
  var expandableNetwork
  expandableNetworkData.nodes = graph.nodes()
  expandableNetworkData.links = graph.relationships()
  expandableNetworkData.helpers = {left: {}, right: {}}
  expandableNetwork = buildNetwork(expandableNetworkData, expandableNetwork)
  console.log(expandableNetwork)

  // This flags that a panning is ongoing and won't trigger
  // 'canvasClick' event when panning ends.
  let draw = false
  var drawGroupMarks = false

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
    if (groupIds && drawGroupMarks) {
      const groupPaths = container
        .selectAll('g.fileGroup')
      const nodeGroups = container
        .selectAll('g.node')
      updateGroups(groupIds, groupPaths, nodeGroups, scaleFactor)
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

    if (drawGroupMarks) {
      const groupPaths = container
        .selectAll('g.fileGroup')

      updateGroups(groupIds, groupPaths, nodeGroups, scaleFactor)
    }

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

  viz.collectStats = function () {
    const latestStats = currentStats
    latestStats.layout = force.collectStats()
    currentStats = newStatsBucket()
    return latestStats
  }

  viz.update = function (showGroupMarks) {
    if (!graph) {
      return
    }

    drawGroupMarks = showGroupMarks

    const layers = container
      .selectAll('g.layer')
      .data(['relationships', 'nodes', 'fileGroups'])
    layers
      .enter()
      .append('g')
      .attr('class', d => `layer ${d}`)

    const nodes = graph.nodes()
    const relationships = graph.relationships()

    var groupIds

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

    if (drawGroupMarks) {
      groupIds = getGroupIDs(nodes)

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
        .attr('fill-opacity', 0.2)
        .attr('stroke-opacity', 1)

      groupPaths.exit().remove()
      updateGroups(groupIds, groupPaths, nodeGroups, scaleFactor)
    } else {
      container
        .select('g.layer.fileGroups')
        .selectAll('g.fileGroup')
        .data({})
        .exit().remove()
    }

    if (updateViz) {
      force.update(graph, [layoutDimension, layoutDimension])
      viz.resize()
      viz.trigger('updated')
    }

    // // drag groups
    // function groupDragStarted (groupId) {
    //   if (!d3.event.active) force.alpha(0.3).resume()
    //   d3.select(this).select('path').style('stroke-width', 3)
    // }

    // function groupDragged (groupId) {
    //   nodeGroups
    //     .filter(function (d) {
    //       return d.propertyMap.filename === groupId
    //     })
    //     .each(function (d) {
    //       d.x += d3.event.dx
    //       d.y += d3.event.dy
    //     })
    // }

    // function groupDragEnded (groupId) {
    //   if (!d3.event.active) force.alpha(0.3).resume()
    //   d3.select(this).select('path').style('stroke-width', 1)
    // }

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

  viz.updateScaleFactor = function (newScaleFactor) {
    scaleFactor = newScaleFactor
    const nodeGroups = container.selectAll('g.node')
    const fileGroups = container.selectAll('g.fileGroup')
    updateGroups(groupIds, fileGroups, nodeGroups, scaleFactor)
  }

  viz.boundingBox = () => container.node().getBBox()

  var clickHandler = vizClickHandler()
  clickHandler.on('click', onNodeClick)
  clickHandler.on('dblclick', onNodeDblClick)

  return viz
}

/// Helper functions to generate groupMarks(polygons)

var scaleFactor = 1

var polygonGenerator = function (groupId, nodeGroups) {
  var nodeCoords = nodeGroups
    .filter(function (d) {
      if (d.propertyMap.hasOwnProperty('filename')) {
        return groupId === d.propertyMap.filename
      }
    })
    .data()
    .map(function (d) {
      return [d.px, d.py]
    })
  return d3.geom.polygon(d3.geom.hull(nodeCoords))
}

var valueline = d3.svg.line()
  .x(function (d) { return d[0] })
  .y(function (d) { return d[1] })
  .interpolate('linear-closed')

function updateGroups (groupIds, fileGroups, nodeGroups, scaleFactor) {
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
      d3.select(path.node().parentNode).attr('transform', `translate(${+centroid[0]},${+centroid[1]}) scale(${scaleFactor})`)
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

/// Helper functions to generate collapse/expand groups

function nodeId (n) {
  return n.size > 0 ? '_g_' + n.group + '_' + n.expansion : n.id
}

function initExpandableNetworkData (expandableNetworkData, graph) {
  expandableNetworkData.nodes = graph.nodes
  expandableNetworkData.links = graph.relationships
  expandableNetworkData.helpers = {left: {}, right: {}}
}

var expand = {}

// constructs the network to visualize
function buildNetwork (data, prev) {
  expand = expand || {} // map indicating which group should be expanded
  console.log(expand)
  var groupMap = {} // group map
  var nodeMap = {} // nm
  var nodeMapLeft = {} // nml
  var nodeMapRight = {} // nmr
  var nodeMapClone = {} // nmimg
  var linkMap = {} // lm link maps - lm ~ lml-lmm-lmr linkMap ~ linkMapLeft-linkMapMiddel-linkMapRight
  var linkMapLeft = {} // lml
  var linkMapMiddle = {} // lmm
  var linkMapRight = {} // lmr
  var previousGroupNodes = {} // gn
  var previousGroupCentroid = {} // gc
  var outputNodes = [] // nodes
  var outputLinks = [] // links
  // eslint-disable-next-line camelcase
  var helper_nodes = [] // helper force graph nodes
  // eslint-disable-next-line camelcase
  var helper_links = [] // helper force graph links
  // eslint-disable-next-line camelcase
  var helper_render_links = [] // helper force graph links
  var k

  // console.log(prev)

  // process previous nodes for reuse or centroid calculation
  if (prev) {
    prev.nodes.forEach(function (n) {
      var i = n.group // filename
      var o
      if (n.size > 0) {
        previousGroupNodes[i] = n
        n.size = 0
        n.ig_link_count = 0
        n.link_count = 0
        n.first_link = null
        n.first_link_target = null
      } else {
        o = previousGroupCentroid[i] || (previousGroupCentroid[i] = {x: 0, y: 0, count: 0})
        o.x += n.x
        o.y += n.y
        o.count += 1 // we count regular nodes here, so .count is a measure for the number of nodes in the group
      }
    })
  }

  // determine nodes
  for (k = 0; k < data.nodes.length; ++k) {
    var currentNode = data.nodes[k]
    var currentFile = currentNode.propertyMap.filename
    var expansion = expand[currentFile] || 0
    var currentGroup = groupMap[currentFile] ||
            (groupMap[currentFile] = previousGroupNodes[currentFile]) ||
            (groupMap[currentFile] = {group: currentFile, size: 0, nodes: [], ig_link_count: 0, link_count: 0, expansion: expansion})
    var img

    // we need to create a NEW object when expansion changes from 0->1 for a group node
    // in order to break the references from the d3 selections, so that the next time
    // this group node will indeed land in the 'enter()' set
    if (currentGroup.expansion !== expansion) {
      currentGroup = previousGroupNodes[currentFile] = groupMap[currentFile] = {group: currentGroup.group, x: currentGroup.x, y: currentGroup.y, size: currentGroup.size, nodes: currentGroup.nodes, ig_link_count: currentGroup.ig_link_count, link_count: currentGroup.link_count, expansion: expansion}
    }

    if (expansion === 2) {
      // the node should be directly visible
      nodeMap[nodeId(currentNode)] = currentNode
      img = {ref: currentNode, x: currentNode.x, y: currentNode.y, size: currentNode.size || 0, fixed: 1, id: nodeId(currentNode)}
      nodeMapClone[nodeId(currentNode)] = img
      outputNodes.push(currentNode)
      helper_nodes.push(img)
      if (previousGroupNodes[currentFile]) {
        // place new nodes at cluster location (plus jitter)
        currentNode.x = previousGroupNodes[currentFile].x + Math.random()
        currentNode.y = previousGroupNodes[currentFile].y + Math.random()
      }
    } else {
      // the node is part of a collapsed cluster
      if (currentGroup.size === 0) {
        // if new cluster, add to set and position at centroid of leaf nodes
        nodeMap[nodeId(currentNode)] = currentGroup
        currentGroup.size = 1 // hack to make nodeid() work correctly for the new group node
        nodeMap[nodeId(currentGroup)] = currentGroup
        img = {ref: currentGroup, x: currentGroup.x, y: currentGroup.y, size: currentGroup.size || 0, fixed: 1, id: nodeId(currentGroup)}
        nodeMapClone[nodeId(currentGroup)] = img
        currentGroup.size = 0 // undo hack
        nodeMapClone[nodeId(currentNode)] = img
        outputNodes.push(currentGroup)
        helper_nodes.push(img)
        if (previousGroupCentroid[currentFile]) {
          currentGroup.x = previousGroupCentroid[currentFile].x / previousGroupCentroid[currentFile].count
          currentGroup.y = previousGroupCentroid[currentFile].y / previousGroupCentroid[currentFile].count
        }
      } else {
        // have element node point to group node:
        nodeMap[nodeId(currentNode)] = currentGroup // l = shortcut for: nm[nodeId(currentGroup)];
        nodeMapClone[nodeId(currentNode)] = nodeMapClone[nodeId(currentGroup)]
      }
      currentGroup.nodes.push(currentNode)
    }
    // always count group size as we also use it to tweak the force graph strengths/distances
    currentGroup.size += 1
    currentNode.group_data = currentGroup
    currentNode.link_count = 0
    currentNode.first_link = null
    currentNode.first_link_target = null
  }

  // determine links
  for (k = 0; k < data.links.length; ++k) { // TODO: Check if it should be relationships instead of links
    var link = data.links[k] // e
    var source = link.source.propertyMap.filename // u
    var target = link.target.propertyMap.filename // v
    var rui
    var rvi
    var sourceId // ui
    var targetId // vi
    var lu
    var rv
    var sourceState // ustate
    var targetState // vstate
    var uimg
    var vimg
    var i
    var ix
    var l
    var ll
    var l_
    var lr
    if (source !== target) {
      groupMap[source].ig_link_count++
      groupMap[target].ig_link_count++
    }
    sourceState = expand[source] || 0
    targetState = expand[target] || 0

    // while d3.layout.force does convert link.source and link.target NUMERIC values to direct node references,
    // it doesn't for other attributes, such as .real_source, so we do not use indexes in nm[] but direct node
    // references to skip the d3.layout.force implicit links conversion later on and ensure that both .source/.target
    // and .real_source/.real_target are of the same type and pointing at valid nodes.
    rui = nodeId(link.source)
    rvi = nodeId(link.target)
    source = nodeMap[rui]
    target = nodeMap[rvi]
    if (source === target) {
      // skip links from node to same (A-A); they are rendered as 0-length lines anyhow. Less links in array = faster animation.
      continue
    }
    // 'links' are produced as 3 links+2 helper nodes; this is a generalized approach so we
    // can support multiple links between element nodes and/or groups, always, as each
    // 'original link' gets its own set of 2 helper nodes and thanks to the force layout
    // those helpers will all be in different places, hence the link 'path' for each
    // parallel link will be different.
    sourceId = nodeId(source)
    targetId = nodeId(target)
    i = (sourceId < targetId ? sourceId + '|' + targetId : targetId + '|' + sourceId)
    l = linkMap[i] || (linkMap[i] = {source: source, target: target, size: 0, distance: 0})
    if (sourceState === 1) {
      sourceId = rui
    }
    if (targetState === 1) {
      targetId = rvi
    }
    ix = (sourceId < targetId ? sourceId + '|' + targetId + '|' + sourceState + '|' + targetState : targetId + '|' + sourceId + '|' + targetState + '|' + sourceState)
    ix = (sourceId < targetId ? sourceId + '|' + targetId : targetId + '|' + sourceId)
    // link(u,v) ==> u -> lu -> rv -> v
    lu = nodeMapLeft[ix] || (nodeMapLeft[ix] = data.helpers.left[ix] || (data.helpers.left[ix] = {ref: source, id: '_lh_' + ix, size: -1, link_ref: l}))
    rv = nodeMapRight[ix] || (nodeMapRight[ix] = data.helpers.right[ix] || (data.helpers.right[ix] = {ref: target, id: '_rh_' + ix, size: -1, link_ref: l}))
    uimg = nodeMapClone[sourceId]
    vimg = nodeMapClone[targetId]
    ll = linkMapLeft[ix] || (linkMapLeft[ix] = {g_ref: l, ref: link, id: 'l' + ix, source: uimg, target: lu, real_source: source, real_target: target, size: 0, distance: 0, left_seg: true})
    l_ = linkMapMiddle[ix] || (linkMapMiddle[ix] = {g_ref: l, ref: link, id: 'm' + ix, source: lu, target: rv, real_source: source, real_target: target, size: 0, distance: 0, middle_seg: true})
    lr = linkMapRight[ix] || (linkMapRight[ix] = {g_ref: l, ref: link, id: 'r' + ix, source: rv, target: vimg, real_source: source, real_target: target, size: 0, distance: 0, right_seg: true})
    l.size += 1
    ll.size += 1
    l_.size += 1
    lr.size += 1

    // these are only useful for single-linked nodes, but we don't care; here we have everything we need at minimum cost.
    if (l.size === 1) {
      source.link_count++
      target.link_count++
      source.first_link = l
      target.first_link = l
      source.first_link_target = target
      target.first_link_target = source
    }
  }

  for (k in linkMap) { outputLinks.push(linkMap[k]) }
  for (k in linkMapLeft) { helper_links.push(linkMapLeft[k]) }
  for (k in linkMapMiddle) { helper_links.push(linkMapMiddle[k]); helper_render_links.push(linkMapMiddle[k]) }
  for (k in linkMapRight) { helper_links.push(linkMapRight[k]) }
  for (k in nodeMapLeft) { helper_nodes.push(nodeMapLeft[k]) }
  for (k in nodeMapRight) { helper_nodes.push(nodeMapRight[k]) }

  // console.log("Nodes")
  // console.log(nodes)

  // console.log("Links")
  // console.log(links)

  // console.log("helper_nodes")
  // console.log(helper_nodes)

  // console.log("helper_links")
  // console.log(helper_links)

  // console.log("helper_render_links")
  // console.log(helper_render_links)

  return {nodes: outputNodes, links: outputLinks, helper_nodes: helper_nodes, helper_links: helper_links, helper_render_links: helper_render_links}
}

export default vizFn
