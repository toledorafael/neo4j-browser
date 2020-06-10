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

  const vizMode = 'expandable' // original or expandable

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
  // rect.on('click', function () {
  //   if (!draw) {
  //     return viz.trigger('canvasClicked', el)
  //   }
  // })
  // TODO: fix the bug on clickling the canvas

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

  if (vizMode === 'original') {
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
  } else if (vizMode === 'expandable') {
    var force
    var force2
    var net
    var hullg
    var hull
    // var linkg
    var helperLinkg
    // var link
    var hlink
    var nodeg
    // var helper_nodeg
    var node
    // var hnode
    var dr = 4 // default point radius
    //
    var expandableNetworkData = {}
    var expandableNetwork

    // const render = function () {
    //   node = nodeg.selectAll('circle.node')
    //   hlink = helperLinkg.selectAll('path.hlink')
    //   hullg.selectAll('path.hull')
    // }
    viz.update = function () {
      /*
  We're kinda lazy with maintaining the anti-coll grid here: only when we hit a 'occupied' node,
  do we go and check if the occupier is still there, updating his quant grid location.

  This works because it 'evens out over time': a tested node hitting an 'unoccupied slot' takes that
  slot, so at the start, everybody might think they've got a free slot for themselves, then on the
  next 'tick', the slot may be suddenly found occupied by someone else also sitting in the same slot,
  causing double occupations to be resolved as the marked owner will stay, while all the others will
  be pushed out.

  As we'll have a lot of 'ticks' before the shows stops, we'll have plenty of time to get everybody
  to an actually really empty grid slot.

  Note that the feature set lists this as 'first come, first serve', but when you read this, I'm sure
  you realize that's a bit of a lie. After all, it's only really 'first come, first serve in nodes[]
  order' on the INITIAL ROUND, isn't it?
  */
      // var anticollision_grid = [], xquant = 1, yquant = 1, xqthresh, yqthresh

      expandableNetworkData.nodes = graph.nodes()
      expandableNetworkData.links = graph.relationships()
      expandableNetworkData.helpers = {left: {}, right: {}}
      expandableNetwork = buildNetwork(expandableNetworkData, expandableNetwork)
      // console.log(expandableNetwork)

      if (force) force.stop()

      // net = buildNetwork(data, net)
      console.log(net)

      force = d3.layout.force()
        .nodes(expandableNetwork.nodes)
        .links(expandableNetwork.links)
        .size([layoutDimension, layoutDimension])
        .linkDistance(function (l, i) {
        // return 300;
          var n1 = l.source
          var n2 = l.target
          var g1 = n1.group_data || n1
          var g2 = n2.group_data || n2
          var n1IsGroup = n1.size || 0
          var n2IsGroup = n2.size || 0
          var rv = 300
          // larger distance for bigger groups:
          // both between single nodes and _other_ groups (where size of own node group still counts),
          // and between two group nodes.
          //
          // reduce distance for groups with very few outer links,
          // again both in expanded and grouped form, i.e. between individual nodes of a group and
          // nodes of another group or other group node or between two group nodes.
          //
          // The latter was done to keep the single-link groups close.
          if (n1.group === n2.group) {
            if ((n1.link_count < 2 && !n1IsGroup) || (n2.link_count < 2 && !n2IsGroup)) {
            // 'real node' singles: these don't need a big distance to make the distance, if you whumsayin' ;-)
              rv = 2
            } else if (!n1IsGroup && !n2IsGroup) {
              rv = 2
            } else if (g1.link_count < 4 || g2.link_count < 4) {
              rv = 100
            }
          } else {
            if (!n1IsGroup && !n2IsGroup) {
              rv = 50
            } else if ((n1IsGroup && n2IsGroup) && (g1.link_count < 4 || g2.link_count < 4)) {
            // 'real node' singles: these don't need a big distance to make the ditance, if you whumsayin' ;-)
              rv = 100
            } else if ((n1IsGroup && g1.link_count < 2) || (n2IsGroup && g2.link_count < 2)) {
            // 'real node' singles: these don't need a big distance to make the ditance, if you whumsayin' ;-)
              rv = 30
            } else if (!n1IsGroup || !n2IsGroup) {
              rv = 100
            }
          }

          return (l.distance = rv)
        })
        .gravity(1.0) // gravity+charge tweaked to ensure good 'grouped' view (e.g. green group not smack between blue&orange, ...
        .charge(function (d, i) { // ... charge is important to turn single-linked groups to the outside
          if (d.size > 0) {
            return -5000 // group node
          } else {
          // 'regular node'
            return -1000
          }
        })
        .friction(0.7) // friction adjusted to get dampened display: less bouncy bouncy ball [Swedish Chef, anyone?]
        .start()

      /*
  And here's the crazy idea for allowing AND rendering multiple links between 2 nodes, etc., as the initial attempt
  to include the 'helper' nodes in the basic 'force' failed dramatically from a visual PoV: we 'overlay' the basic
  nodes+links force with a SECOND force layout which 'augments' the original force layout by having it 'layout' all
  the helper nodes (with their links) between the 'fixed' REAL nodes, which are laid out by the original force.

  This way, we also have the freedom to apply a completely different force field setup to the helpers (no gravity
  as it doesn't make sense for helpers, different charge values, etc.).
  */
      force2 = d3.layout.force()
        .nodes(net.helper_nodes)
        .links(net.helper_links)
        .size([layoutDimension, layoutDimension])
        .linkDistance(function (l, i) {
          // var n1 = l.real_source
          // var n2 = l.real_target
          // var rv
          var lr = l.g_ref
          // var n1r
          // var n2r
          // var dx
          // var dy
          if (lr.source.size > 0 || lr.target.size > 0) { return 20 }
          return 1
        })
        .gravity(0.0) // just a tad of gravidy to help keep those curvy buttocks decent
        .charge(function (d, i) {
        // helper nodes have a medium-to-high charge, depending on the number of links the related force link represents.
        // Hence bundles of links fro A->B will have helper nodes with huge charges: better spreading of the link paths.
        //
        // Unless we're looking at helpers for links between 'real nodes', NOT GROUPS: in that case we want to keep
        // the lines are straight as posssible as there would only be one relation for A->B anyway, so we lower the charge
        // for such nodes and helpers.
          if (d.fixed) { return -10 }
          var l = d.link_ref
          // var c = l.link_count || 1
          if (l.source.size > 0 || l.target.size > 0) { return -30 }
          return -1
        })
        .friction(0.95)
        .start()
        .stop() // and immediately stop! force.tick will drive this one every tick!

      hullg = container.selectAll('path.hull').remove()
      hull = hullg.selectAll('path.hull')
        .data(convexHulls(net.nodes, off))
        .enter().append('path')
        .attr('class', 'hull')
        .attr('d', drawCluster)
        .style('fill', function (d) { return color(d.group) })
        .on('click', onHullClick)

      // if (debug == 1) {
      //   link = linkg.selectAll('line.link').data(net.links, linkid)
      //   link.exit().remove()
      //   link.enter().append('line')
      //     .attr('class', 'link')
      //     .attr('x1', function (d) { return d.source.x })
      //     .attr('y1', function (d) { return d.source.y })
      //     .attr('x2', function (d) { return d.target.x })
      //     .attr('y2', function (d) { return d.target.y })
      //   // both existing and enter()ed links may have changed stroke width due to expand state change somewhere:
      //   link.style('stroke-width', function (d) { return d.size || 1 })
      // }
      hlink = container.selectAll('path.hlink').data(net.helper_render_links, function (d) {
        return d.id
      })
      hlink.exit().remove()
      hlink.enter().append('path')
        .attr('class', 'hlink')
      // both existing and enter()ed links may have changed stroke width due to expand state change somewhere:
      hlink.style('stroke-width', function (d) { return d.size || 1 })

      // if (debug) {
      //   hnode = helper_nodeg.selectAll('circle.node').data(net.helper_nodes, function (d) {
      //     return d.id
      //   })
      //   hnode.exit().remove()
      //   hnode.enter().append('circle')
      //   // if (d.size) -- d.size > 0 when d is a group node.
      //   // d.size < 0 when d is a 'path helper node'.
      //     .attr('class', function (d) {
      //       return 'node' + (d.size > 0 ? '' : d.size < 0 ? ' helper' : ' leaf')
      //     })
      //     .attr('r', function (d) {
      //       return d.size > 0 ? d.size + dr : d.size < 0 ? 2 : dr + 1
      //     })
      //     .attr('cx', function (d) { return d.x })
      //     .attr('cy', function (d) { return d.y })
      //     .style('fill', function (d) { return color(d.group) })
      // }

      node = container.selectAll('circle.node').data(net.nodes, nodeId)
      node.exit().remove()
      node.enter().append('circle')
      // if (d.size) -- d.size > 0 when d is a group node.
      // d.size < 0 when d is a 'path helper node'.
        .attr('class', function (d) {
          return 'node' + (d.size > 0 ? d.expansion ? ' link-expanded' : '' : ' leaf')
        })
        .attr('r', function (d) {
          return d.size > 0 ? d.size + dr : dr + 1
        })
        .attr('cx', function (d) { return d.x })
        .attr('cy', function (d) { return d.y })
        .style('fill', function (d) { return color(d.group) })
        .on('click', onNodeClickExpandable)

      node.call(force.drag)

      var dragInProgress = false
      var changeSquared

      // CPU load redux for the fix, part 3: jumpstart the annealing process again when the user moves the mouse outside the node,
      // when we believe the drag is still going on; even when it isn't anymore, but D3 doesn't inform us about that!
      node
        .on('mouseout.ger_fix', function (d) {
          // if (debug == 1) console.log('mouseout.ger_fix', this, arguments, d.fixed, dragInProgress)
          if (dragInProgress) {
            force.resume()
          }
        })

      var resumeThreshold = 0.05

      force.on('tick', function (e) {
        /*
    Force all nodes with only one link to point outwards.

    To do this, we first calculate the center mass (okay, we wing it, we fake node 'weight'),
    then see whether the target node for links from single-link nodes is closer to the
    center-of-mass than us, and if it isn't, we push the node outwards.
    */
        var center = {x: 0, y: 0, weight: 0}
        var singles = []
        var size
        // var c
        // var k
        var mx
        var my
        var dx
        var dy
        var alpha

        dragInProgress = false
        net.nodes.forEach(function (n) {
          var w = Math.max(1, n.size || 0, n.weight || 0)

          center.x += w * n.x
          center.y += w * n.y
          center.weight += w

          if (n.fixed & 2) {
            dragInProgress = true
          }

          if (n.size > 0 ? n.link_count < 4 : n.group_data.link_count < 3) { singles.push(n) }
        })

        size = force.size()

        mx = size[0] / 2
        my = size[1] / 2

        singles.forEach(function (n) {
          var l = n.first_link
          // var n2 = n.first_link_target
          // var proj
          // var ax
          // var bx
          // var ay
          // var by
          var k
          // var x
          // var y
          var alpha
          // var rej
          var power
          var dx
          var dy
          var nIsGroup = n.size || 0
          // var ng = n.group_data || n
          // var c2
          var w = Math.max(1, n.size || 0, n.weight || 0)

          // haven't decided what to do for unconnected nodes, yet...
          if (!l) { return }

          // apply amplification of the 'original' alpha:
          // 1.0 for singles and double-connected nodes, close to 0 for highly connected nodes, rapidly decreasing.
          // Use this as we want to give those 'non-singles' a little bit of the same 'push out' treatment.
          // Reduce effect for 'real nodes' which are singles: they need much less encouragement!
          power = Math.max(2, nIsGroup ? n.link_count : n.group_data.link_count)
          power = 2 / power

          alpha = e.alpha * power

          // undo/revert gravity forces (or as near as we can get, here)
          //
          // revert for truely single nodes, revert just a wee little bit for dual linked nodes,
          // only reduce ever so slighty for nodes with few links (~ 3) that made it into this
          // 'singles' selection
          if ((k = alpha * force.gravity() * (0.8 + power))) {
            dx = (mx - n.x) * k
            dy = (my - n.y) * k
            n.x -= dx
            n.y -= dy

            center.x -= dx * w
            center.y -= dy * w
          }
        })

        // move the entire graph so that its center of mass sits at the center, period.
        center.x /= center.weight
        center.y /= center.weight

        // if (debug == 1) {
        //   c = vis.selectAll('circle.center-of-mass')
        //     .attr('cx', center.x)
        //     .attr('cy', center.y)
        // }

        dx = mx - center.x
        dy = my - center.y

        alpha = e.alpha * 5
        dx *= alpha
        dy *= alpha

        net.nodes.forEach(function (n) {
          n.x += dx
          n.y += dy
        })

        changeSquared = 0

        // fixup .px/.py so drag behaviour and annealing get the correct values, as
        // force.tick() would expect .px and .py to be the .x and .y of yesterday.
        net.nodes.forEach(function (n) {
          // restrain all nodes to window area
          var k
          var dx
          var dy
          var r = (n.size > 0 ? n.size + dr : dr + 1) + 2 /* styled border outer thickness and a bit */

          dx = 0
          if (n.x < r) { dx = r - n.x } else if (n.x > size[0] - r) { dx = size[0] - r - n.x }

          dy = 0
          if (n.y < r) { dy = r - n.y } else if (n.y > size[1] - r) { dy = size[1] - r - n.y }

          k = 1.2

          n.x += dx * k
          n.y += dy * k
          // restraining completed.......................

          // fixes 'elusive' node behaviour when hovering with the mouse (related to force.drag)
          if (n.fixed) {
            // 'elusive behaviour' ~ move mouse near node and node would take off, i.e. act as an elusive creature.
            n.x = n.px
            n.y = n.py
          }
          n.px = n.x
          n.py = n.y

          // plus copy for faster stop check
          changeSquared += (n.qx - n.x) * (n.qx - n.x)
          changeSquared += (n.qy - n.y) * (n.qy - n.y)
          n.qx = n.x
          n.qy = n.y
        })

        // kick the force2 to also do a bit of annealing alongside:
        // to make it do something, we need to surround it alpha-tweaking stuff, though.
        force2.resume()
        force2.tick()
        force2.stop()

        // fast stop + the drag fix, part 2:
        if (changeSquared < 0.005) {
          // if (debug == 1) console.log('fast stop: CPU load redux')
          force.stop()
          // fix part 4: monitor D3 resetting the drag marker:
          if (dragInProgress) {
            // if (debug == 1) console.log('START monitor drag in progress', dragInProgress)
            d3.timer(function () {
              dragInProgress = false
              net.nodes.forEach(function (n) {
                if (n.fixed & 2) {
                  dragInProgress = true
                }
              })
              force.resume()
              // if (debug == 1) console.log('monitor drag in progress: drag ENDED', dragInProgress)
              // Quit monitoring as soon as we noticed the drag ENDED.
              // Note: we continue to monitor at +500ms intervals beyond the last tick
              //       as this timer function ALWAYS kickstarts the force layout again
              //       through force.resume().
              //       d3.timer() API only accepts an initial delay; we can't set this
              //       thing to scan, say, every 500msecs until the drag is done,
              //       so we do it that way, via the revived force.tick process.
              return true
            }, 500)
          }
        } else if (changeSquared > net.nodes.length * 5 && e.alpha < resumeThreshold) {
          // jolt the alpha (and the visual) when there's still a lot of change when we hit the alpha threshold.
          force.alpha(Math.min(0.1, e.alpha *= 2)) // force.resume(), but now with decreasing alpha starting value so the jolts don't get so big.

          // And 'dampen out' the trigger point, so it becomes harder and harder to trigger the threshold.
          // This is done to cope with those instable (forever rotating, etc.) layouts...
          resumeThreshold *= 0.9
        }

        // --------------------------------------------------------------------

        if (!hull.empty()) {
          hull.data(convexHulls(net.nodes, off))
            .attr('d', drawCluster)
        }

        // if (debug == 1) {
        //   link.attr('x1', function (d) { return d.source.x })
        //     .attr('y1', function (d) { return d.source.y })
        //     .attr('x2', function (d) { return d.target.x })
        //     .attr('y2', function (d) { return d.target.y })
        // }

        node.attr('cx', function (d) { return d.x })
          .attr('cy', function (d) { return d.y })
      })

      force2.on('tick', function (e) {
        /*
      Update all 'real'=fixed nodes.
    */
        net.helper_nodes.forEach(function (n) {
          var o
          if (n.fixed) {
            o = n.ref
            n.px = n.x = o.x
            n.py = n.y = o.y
          }
        })
        net.helper_links.forEach(function (l) {
          var o = l.g_ref
          l.distance = o.distance
        })

        // NOTE: force2 is fully driven by force(1), but still there's need for 'fast stop' handling in here
        //       as our force2 may be more 'joyous' in animating the links that force is animating the nodes
        //       themselves. Hence we also take the delta movement of the helper nodes into account!
        net.helper_nodes.forEach(function (n) {
          // skip the 'fixed' buggers: those are already accounted for in force.tick!
          if (n.fixed) { return }

          // plus copy for faster stop check
          changeSquared += (n.qx - n.x) * (n.qx - n.x)
          changeSquared += (n.qy - n.y) * (n.qy - n.y)
          n.qx = n.x
          n.qy = n.y
        })

        // --------------------------------------------------------------------

        hlink.attr('d', function (d) {
          var linedata = [
            [d.real_source.x, d.real_source.y],
            [d.source.x, d.source.y],
            [d.target.x, d.target.y],
            [d.real_target.x, d.real_target.y]
          ]
          return pathgen(linedata)
        })

        // if (debug) {
        //   hnode.attr('cx', function (d) { return d.x })
        //     .attr('cy', function (d) { return d.y })
        // }
      })
    }
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

function convexHulls (nodes, offset) {
  var hulls = {}

  // create point sets
  for (var k = 0; k < nodes.length; ++k) {
    var n = nodes[k]
    if (n.size) continue
    var i = getGroup(n)
    var l = hulls[i] || (hulls[i] = [])
    l.push([n.x - offset, n.y - offset])
    l.push([n.x - offset, n.y + offset])
    l.push([n.x + offset, n.y - offset])
    l.push([n.x + offset, n.y + offset])
  }

  // create convex hulls
  var hullset = []
  for (i in hulls) {
    hullset.push({group: i, path: d3.geom.hull(hulls[i])})
  }

  return hullset
}

function drawCluster (d) {
  return curve(d.path) // 0.8
}

var expand = {}
var curve = d3.svg.line()
  .interpolate('cardinal-closed')
  .tension(0.85)

var off = 15

// these functions call init(); by declaring them here,
// they don't have the old init() as a closure any more.
// This should save us some memory and cycles when using
// this in a long-running setting.

function onHullClick (d) {
  // if (debug == 1) console.log("node click", d, arguments, this, expand[d.group]);
  // clicking on 'path helper nodes' shouln't expand/collapse the group node:
  if (d.size < 0) { return }
  cycleState(d)
  vizFn.update() // Maybe create an init function to hold this and call it here and in the viz.update()
}

function onNodeClickExpandable (d) {
  // if (debug == 1) console.log("node click", d, arguments, this, expand[d.group]);
  // clicking on 'path helper nodes' shouln't expand/collapse the group node:
  if (d.size < 0) { return }
  cycleState(d)
  vizFn.update() // Maybe create an init function to hold this and call it here and in the viz.update()
}

function cycleState (d) {
  var g = d.group
  var s = expand[g] || 0
  // it's no use 'expanding the intergroup links only' for nodes which only have 1 outside link for real:
  if (d.ig_link_count < 2) { s = (s ? 0 : 2) } else {
    s++; s %= 3
  }
  return (expand[g] = s)
}

function getGroup (n) { return n.group }

var pathgen = d3.svg.line().interpolate('basis')

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
