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
import Renderer from '../components/renderer'
import d3 from 'd3'
import { getPatternDashes } from '../utils/pattern'
import { getShapeDef } from '../utils/shapes'
const noop = function() {}

const nodeRingStrokeSize = 8

const nodeOutline = new Renderer({
  onGraphChange(selection: any, viz: any) {
    const circles = selection
      .selectAll('circle.outline')
      .data((node: any) => [node])

    circles
      .enter()
      .append('circle')
      .classed('outline', true)
      .attr({
        cx: 0,
        cy: 0
      })

    circles.attr({
      r(node: any) {
        return node.radius
      },
      fill(node: any) {
        return viz.style.forNode(node).get('color')
      },
      stroke(node: any) {
        return viz.style.forNode(node).get('border-color')
      },
      'stroke-width'(node: any) {
        return viz.style.forNode(node).get('border-width')
      }
    })

    return circles.exit().remove()
  },
  onTick: noop
})

const nodeCaption = new Renderer({
  onGraphChange(selection: any, viz: any) {
    const text = selection
      .selectAll('text.caption')
      .data((node: any) => node.caption)

    text
      .enter()
      .append('text')
      // .classed('caption', true)
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    text
      .text((line: any) => line.text)
      .attr('x', 0)
      .attr('y', (line: any) => line.baseline)
      .attr('font-size', (line: any) =>
        viz.style.forNode(line.node).get('font-size')
      )
      .attr({
        fill(line: any) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })

    return text.exit().remove()
  },

  onTick: noop
})

const nodeIcon = new Renderer({
  onGraphChange(selection: any, viz: any) {
    const text = selection.selectAll('text').data((node: any) => node.caption)

    text
      .enter()
      .append('text')
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })
      .attr({ 'font-family': 'streamline' })

    text
      .text((line: any) => viz.style.forNode(line.node).get('icon-code'))
      .attr('dy', (line: any) => line.node.radius / 16)
      .attr('font-size', (line: any) => line.node.radius)
      .attr({
        fill(line: any) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })

    return text.exit().remove()
  },

  onTick: noop
})

const nodeRing = new Renderer({
  onGraphChange(selection: any) {
    const circles = selection
      .selectAll('circle.ring')
      .data((node: any) => [node])
    circles
      .enter()
      .insert('circle', '.outline')
      .classed('ring', true)
      .attr({
        cx: 0,
        cy: 0,
        'stroke-width': `${nodeRingStrokeSize}px`
      })

    circles.attr({
      r(node: any) {
        return node.radius + 4
      }
    })

    return circles.exit().remove()
  },

  onTick: noop
})

const checkPropertyList = (propertyList: any[], propertyName: string) => {
  if (propertyList.length > 0) {
    for (let index = 0; index < propertyList.length; index++) {
      const element = propertyList[index]
      if (element.key === propertyName) return true
    }
    return false
  }
  return false
}

function setupGradient(svgEl: any, id: any, g: any, colors: any) {
  const svg = d3.select(svgEl)
  let el = svg.select(`#${id.replace(/\./g, '\\.')}`)
  if (el.empty()) {
    el = svg.append('defs').append(g.type)
    el.attr('id', id)
    el.attr('gradientUnits', 'userSpaceOnUse')

    for (const attr in g.attrs) {
      el.attr(attr, g.attrs[attr])
    }

    // extract into function
    const offsetPercent = Math.trunc(100 / colors.length)
    for (let colorId = 0; colorId < colors.length; colorId++) {
      if (colorId > 0) {
        el.append('stop')
          .attr('stop-color', colors[colorId - 1])
          .attr('offset', (offsetPercent * colorId).toString() + '% ')
          .attr('stop-opacity', 1)
        el.append('stop')
          .attr('stop-color', colors[colorId])
          .attr('offset', (offsetPercent * colorId).toString() + '%')
          .attr('stop-opacity', 1)
      }
    }
  }
}

function getRelationshipStyle(rel: any, viz: any) {
  if (checkPropertyList(rel.propertyList, 'condition')) {
    const styles = viz.style.forCondRel(rel)
    const colors = styles.get('color')
    const patterns = styles.get('pattern')
    return {
      colors: Array.isArray(colors) ? colors : [colors],
      patterns: Array.isArray(patterns) ? patterns : [patterns]
    }
  } else {
    return { colors: ['#A5ABB6'] }
  }
}

function updateArrow(pathGroups: any, viz: any) {
  const layout =
    pathGroups.node() && pathGroups.node().closest('.neod3viz').__graphStyle
  const paths = pathGroups.selectAll('path').data((rel: any) => {
    if (rel.arrow) {
      const { colors, patterns } = getRelationshipStyle(rel, viz)
      return rel.arrow
        .outline(rel.shortCaptionLength, colors.length, layout.arrowLayout)
        .map((a: any) => ({ pathDef: a, colors, patterns, rel }))
    } else {
      return []
    }
  })
  paths.enter().append('path')
  paths.exit().remove()

  const svgEl = pathGroups.node() && pathGroups.node().closest('.neod3viz')

  pathGroups
    .selectAll('path')
    .attr('d', (d: any) => d.pathDef.path)
    .attr('fill', ({ pathDef, colors }: any, i: any) => {
      if (pathDef.useStroke) return 'none'
      if (pathDef.gradient && colors.length > 1) {
        const id =
          'gradient' +
          svgEl.__uid +
          colors.map((x: string) => x.replace(/[^a-zA-Z0-9]/g, '')).join('') +
          pathDef.gradient.id
        setupGradient(svgEl, id, pathDef.gradient, colors)
        return 'url(#' + id + ')'
      } else {
        return colors[Math.min(i, colors.length - 1)] || '#888888'
      }
    })
    .attr('stroke', ({ pathDef, colors }: any, i: number) => {
      if (pathDef.useStroke) {
        return colors[Math.min(i, colors.length - 1)] || '#888888'
      }
      return 'none'
    })
    .attr('stroke-width', ({ pathDef }: any) => pathDef.strokeWidth)

  if (layout && layout.localPattern) {
    pathGroups
      .selectAll('path')
      .filter(({ pathDef }: any) => pathDef.useStroke)
      .attr('stroke-dasharray', ({ pathDef, patterns }: any, i: number) => {
        const pattern = patterns && patterns[Math.min(i, patterns.length - 1)]
        return pattern && getPatternDashes(pattern, pathDef.strokeWidth)
      })
      .attr('stroke-dashoffset', null)
  } else if (layout && layout.globalPattern) {
    pathGroups
      .selectAll('path')
      .filter(({ pathDef }: any) => pathDef.useStroke)
      .attr('stroke-dasharray', ({ pathDef, rel }: any) => {
        const pattern = viz.style.forRelationship(rel).get('pattern')
        return pattern && getPatternDashes(pattern, pathDef.strokeWidth)
      })
      .attr('stroke-dashoffset', ({ pathDef }: any) => {
        return pathDef.pathOffset
      })
  } else {
    pathGroups
      .selectAll('path')
      .attr('stroke-dasharray', null)
      .attr('stroke-dashoffset', null)
  }

  return pathGroups
}

const arrowPath = new Renderer({
  name: 'arrowPath',
  onGraphChange(selection: any, viz: any) {
    const paths = selection.selectAll('g.outline').data((rel: any) => [rel])
    // paths
    //   .enter()
    //   .append('path')
    //   .classed('outline', true)
    paths
      .enter()
      .append('g')
      .classed('outline', true)

    updateArrow(paths, viz)
    // updateGradient(paths, viz)
    // this feature needs to be redone
    // .attr('stroke-width', '3px')
    // .attr('stroke', function (rel) {
    //   if (featureExpression !== '') {
    //     var presenceCondition = ''
    //     if (checkPropertyList(rel.propertyList, 'condition')) {
    //       for (let index = 0; index < rel.propertyList.length; index++) {
    //         const element = rel.propertyList[index]
    //         if (element.key === 'condition') {
    //           presenceCondition = rel.propertyList[index].value
    //         }
    //       }
    //       if (presenceCondition !== 'true') {
    //         if (evaluateUnderAllSolutions(solutions, presenceCondition)) {
    //           return 'red'
    //         }
    //       } else {
    //         return 'red'
    //       }
    //       return 'none'
    //     }
    //     // return 'red'
    //   }
    //   return 'none'
    // })

    return paths.exit().remove()
  },

  onTick(selection: any, viz: any) {
    // selection.selectAll('path').filter(d => (d.arrow instanceof LoopArrow)).style('opacity', 0.5)
    return updateArrow(selection.selectAll('g.outline'), viz)
  }
})

const relationshipShape = new Renderer({
  name: 'relationshipShape',
  onGraphChange(selection: any, _viz: any) {
    const shapes = selection.selectAll('path.shape').data((rel: any) => [rel])
    shapes
      .enter()
      .append('path')
      .classed('shape', true)
      .attr('stroke', 'black')
      .attr('strokeWidth', '1')
      .attr('fill', '#ffffff77')

    return shapes.exit().remove()
  },
  onTick(selection: any, viz: any) {
    const svgEl = selection.node() && selection.node().closest('.neod3viz')
    return selection
      .selectAll('path.shape')
      .each(function(this: any, rel: any) {
        const center = rel.arrow.getEndCenter()
        const rotation = rel.arrow.getEndRotation()
        const shape = viz.style.forRelationship(rel).get('shape')
        const d = getShapeDef(shape, center, 6 + rel.arrow.width)

        d3.select(this).attr('d', d as any)
        d3.select(this).attr(
          'transform',
          `rotate(${rotation},${center.x},${center.y})`
        )
        d3.select(this).style(
          'opacity',
          svgEl.__graphStyle && svgEl.__graphStyle.globalShape ? 1 : 0
        )
      })
  }
})

// This is the primary caption which actually defaults to condition
const relationshipType = new Renderer({
  name: 'relationshipType',
  onGraphChange(selection: any, viz: any) {
    const texts = selection
      .selectAll('text.primary-caption')
      .data((rel: any) => [rel])

    texts
      .enter()
      .append('text')
      .classed('primary-caption', true)
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    const layout =
      texts.node() && texts.node().closest('.neod3viz').__graphStyle
    texts
      .attr('font-size', (rel: any) =>
        viz.style.forRelationship(rel).get('font-size')
      )
      .attr('fill', (rel: any) => {
        return viz.style
          .forRelationship(rel)
          .get(
            `text-color-${
              checkPropertyList(rel.propertyList, 'condition') &&
              layout.textAbove
                ? 'external'
                : rel.captionLayout
            }`
          )
      })

    return texts.exit().remove()
  },

  onTick(selection: any, viz: any) {
    const layout =
      selection.node() && selection.node().closest('.neod3viz').__graphStyle
    return selection
      .selectAll('text.primary-caption')
      .attr(
        'x',
        (rel: any) =>
          rel.arrow.midShaftPoint(layout.textAbove, layout.arrowLayout).x
      )
      .attr(
        'y',
        (rel: any) =>
          rel.arrow.midShaftPoint(layout.textAbove, layout.arrowLayout).y +
          parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
          1
      )
      .attr('transform', function(rel: any) {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return `rotate(180 ${
            rel.arrow.midShaftPoint(layout.textAbove, layout.arrowLayout).x
          } ${rel.arrow.midShaftPoint(layout.textAbove, layout.arrowLayout).y})`
        } else {
          return null
        }
      })
      .text((rel: any) => rel.shortCaption)
  }
})

// This is the secondary caption which defaults to rel type
const relationshipSecondaryCaption = new Renderer({
  name: 'relationshipSecondaryCaption',
  onGraphChange(selection: any, viz: any) {
    const texts = selection
      .selectAll('text.secondary-caption')
      .data((rel: any) => [rel])

    texts
      .enter()
      .append('text')
      .classed('secondary-caption', true)
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')

    texts
      .attr('font-size', (rel: any) =>
        viz.style.forRelationship(rel).get('font-size')
      )
      .attr('fill', (rel: any) =>
        viz.style.forRelationship(rel).get('text-color-external')
      )

    return texts.exit().remove()
  },

  onTick(selection: any, viz: any) {
    const layout =
      selection.node() && selection.node().closest('.neod3viz').__graphStyle
    return selection
      .selectAll('text.secondary-caption')
      .attr(
        'x',
        (rel: any) =>
          rel.arrow.secondaryMidShaftPoint(layout.textAbove, layout.arrowLayout)
            .x
      )
      .attr(
        'y',
        (rel: any) =>
          rel.arrow.secondaryMidShaftPoint(layout.arrowLayout).y +
          parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
          1
      )
      .attr('transform', (rel: any) => {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return `rotate(180 ${
            rel.arrow.secondaryMidShaftPoint(layout.arrowLayout).x
          } ${rel.arrow.secondaryMidShaftPoint(layout.arrowLayout).y})`
        } else {
          return null
        }
      })
      .style('font-weight', 'bold')
      .text((rel: any) => (layout.globalText ? rel.type : ''))
  }
})

const relationshipOverlay = new Renderer({
  name: 'relationshipOverlay',
  onGraphChange(selection: any) {
    const rects = selection.selectAll('path.overlay').data((rel: any) => [rel])

    rects
      .enter()
      .append('path')
      .classed('overlay', true)

    return rects.exit().remove()
  },

  onTick(selection: any) {
    const band = 16

    return selection
      .selectAll('path.overlay')
      .attr('d', (d: any) => d.arrow.overlay(band))
  }
})

const groupCountour = new Renderer({
  name: 'groupCountor',
  onGraphChange(selection: any) {
    // var polygon, centroid
    // // select nodes of the group, retrieve its positions
    // // and return the convex hull of the specified points
    // // (3 points as minimum, otherwise returns null)
    // var polygonGenerator = function (groupId, selection) {
    //   var nodeCoords = selection
    //     .filter(function (d) { if (d.propertyMap.hasOwnProperty('filename')) { return groupId.localeCompare(d.propertyMap.filename) } })
    //     .data()
    //     .map(function (d) { return [d.x, d.y] })

    //   return d3.geom.polygon(d3.geom.hull(nodeCoords))
    //   // return d3.geom.polygon(nodeCoords)
    //   // return d3.polygonHull(nodeCoords)
    // }

    // var scaleFactor = 1.2

    // var valueline = d3.svg.line()
    //   .x(function (d) { return d[0] })
    //   .y(function (d) { return d[1] })
    //   .interpolate('basis')
    //   // .curve(d3.curveCatmullRomClosed)

    // groupIds.forEach(function (groupId) {
    //   var path = fileGroups.filter(function (d) { if (d.propertyMap.hasOwnProperty('filename')) { return groupId.localeCompare(d.propertyMap.filename) } })
    //     .attr('transform', 'scale(1) translate(0,0)')
    //     .attr('d', function (d) {
    //       polygon = polygonGenerator(d)
    //       centroid = polygon.centroid()
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
    //   d3.select(path.node().parentNode).attr('transform', 'translate(' + centroid[0] + ',' + (centroid[1]) + ') scale(' + scaleFactor + ')')
    // })
    return selection
  },

  onTick: noop
})

const node = []
node.push(nodeOutline)
node.push(nodeIcon)
node.push(nodeCaption)
node.push(nodeRing)

const relationship = []
relationship.push(arrowPath)
relationship.push(relationshipShape)
relationship.push(relationshipType)
relationship.push(relationshipSecondaryCaption)
relationship.push(relationshipOverlay)

const fileGroup = []
fileGroup.push(groupCountour)
// fileGroup.push(fileLabel)

export { node, relationship, fileGroup } // Add countour
