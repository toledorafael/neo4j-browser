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
import Renderer from '../components/renderer'
import Logic from 'logic-solver'
const noop = function () {}

const nodeRingStrokeSize = 8

const nodeOutline = new Renderer({
  onGraphChange (selection, viz) {
    const circles = selection.selectAll('circle.outline').data(node => [node])

    circles
      .enter()
      .append('circle')
      .classed('outline', true)
      .attr({
        cx: 0,
        cy: 0
      })

    circles.attr({
      r (node) {
        return node.radius
      },
      fill (node) {
        return viz.style.forNode(node).get('color')
      },
      stroke (node) {
        return viz.style.forNode(node).get('border-color')
      },
      'stroke-width' (node) {
        return viz.style.forNode(node).get('border-width')
      }
    })

    return circles.exit().remove()
  },
  onTick: noop
})

const nodeCaption = new Renderer({
  onGraphChange (selection, viz) {
    const text = selection.selectAll('text.caption').data(node => node.caption)

    text
      .enter()
      .append('text')
      // .classed('caption', true)
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    text
      .text(line => line.text)
      .attr('y', line => line.baseline)
      .attr('font-size', line => viz.style.forNode(line.node).get('font-size'))
      .attr({
        fill (line) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })

    return text.exit().remove()
  },

  onTick: noop
})

const nodeIcon = new Renderer({
  onGraphChange (selection, viz) {
    const text = selection.selectAll('text').data(node => node.caption)

    text
      .enter()
      .append('text')
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })
      .attr({ 'font-family': 'streamline' })

    text
      .text(line => viz.style.forNode(line.node).get('icon-code'))
      .attr('dy', line => line.node.radius / 16)
      .attr('font-size', line => line.node.radius)
      .attr({
        fill (line) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })

    return text.exit().remove()
  },

  onTick: noop
})

const nodeRing = new Renderer({
  onGraphChange (selection) {
    const circles = selection.selectAll('circle.ring').data(node => [node])
    circles
      .enter()
      .insert('circle', '.outline')
      .classed('ring', true)
      .attr({
        cx: 0,
        cy: 0,
        'stroke-width': nodeRingStrokeSize + 'px'
      })

    circles.attr({
      r (node) {
        return node.radius + 4
      }
    })

    return circles.exit().remove()
  },

  onTick: noop
})

// split expression by operator considering parentheses
const split = (expression, operator) => {
  const result = []
  let braces = 0
  let currentChunk = ''
  for (let i = 0; i < expression.length; ++i) {
    const curCh = expression[i]
    if (curCh === '(') {
      braces++
    } else if (curCh === ')') {
      braces--
    }
    if (braces === 0 && operator === curCh) {
      result.push(currentChunk)
      currentChunk = ''
    } else currentChunk += curCh
  }
  if (currentChunk !== '') {
    result.push(currentChunk)
  }
  return result
}
// this will only take strings containing * operator [ no + ]
const parseDisjunctionSeparatedExpression = (expression) => {
  const operandsString = split(expression, '+')
  const operands = operandsString.map(noStr => {
    if (noStr[0] === '(') {
      const expr = noStr.substr(1, noStr.length - 2)
      // recursive call to the main function
      return parseConjunctionSeparatedExpression(expr)
    }
    return noStr
  })
  // const initialValue = 1.0
  // const result = operands.reduce((acc, no) => acc * no, initialValue)
  if (operands.length > 1) {
    return Logic.or(operands)
  } else {
    return operands[0]
  }
}
// both * -
const parseConjunctionSeparatedExpression = (expression) => {
  const operandsString = split(expression, '*')
  const operands = operandsString.map(operandStr => parseDisjunctionSeparatedExpression(operandStr))
  // const initialValue = numbers[0]
  // const result = numbers.slice(1).reduce((acc, no) => acc - no, initialValue)
  if (operands.length > 1) {
    return Logic.and(operands)
  } else {
    return operands[0]
  }
}

const parse = (featureExpression) => {
  var newFeatureExpression = featureExpression.replaceAll('!', '-')
  if (newFeatureExpression.includes('/\\') || newFeatureExpression.includes('\\/')) {
    newFeatureExpression = newFeatureExpression.replaceAll('/\\', '*')
    newFeatureExpression = newFeatureExpression.replaceAll('\\/', '+')
    return parseConjunctionSeparatedExpression(newFeatureExpression)
  } else {
    return newFeatureExpression
  }
}

const evaluateUnderAllSolutions = (solutions, presenceCondition) => {
  var newPresenceCondition = parse(presenceCondition)
  for (let solutionId = 0; solutionId < solutions.length; solutionId++) {
    const solution = solutions[solutionId]
    if (solution.evaluate(newPresenceCondition)) {
      return true
    }
  }
  return false
}

const arrowPath = new Renderer({
  name: 'arrowPath',
  onGraphChange (selection, viz, featureExpression) {
    const paths = selection.selectAll('path.outline').data(rel => [rel])
    paths
      .enter()
      .append('path')
      .classed('outline', true)

    if (featureExpression !== '') {
      var formula = parse(featureExpression)
      var solver = new Logic.Solver()
      solver.require(formula)
      var solutions = []
      var curSol
      while ((curSol = solver.solve())) {
        curSol.ignoreUnknownVariables()
        solutions.push(curSol)
        solver.forbid(curSol.getFormula())
      }
    }

    paths
      .attr('fill', rel => viz.style.forRelationship(rel).get('color'))
      .attr('stroke-width', '3px')
      .attr('stroke', function (rel) {
        if (featureExpression !== '') {
          var presenceCondition = ''
          for (let index = 0; index < rel.propertyList.length; index++) {
            const element = rel.propertyList[index]
            if (element.key === 'condition') {
              presenceCondition = rel.propertyList[index].value
            }
          }
          if (evaluateUnderAllSolutions(solutions, presenceCondition)) {
            return 'red'
          }
          return 'none'
        }
        return 'none'
      })

    return paths.exit().remove()
  },

  onTick (selection) {
    return selection
      .selectAll('path')
      .attr('d', d => d.arrow.outline(d.shortCaptionLength))
  }
})

const relationshipType = new Renderer({
  name: 'relationshipType',
  onGraphChange (selection, viz) {
    const texts = selection.selectAll('text').data(rel => [rel])

    texts
      .enter()
      .append('text')
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    texts
      .attr('font-size', rel => viz.style.forRelationship(rel).get('font-size'))
      .attr('fill', rel =>
        viz.style.forRelationship(rel).get(`text-color-${rel.captionLayout}`)
      )

    return texts.exit().remove()
  },

  onTick (selection, viz) {
    return selection
      .selectAll('text')
      .attr('x', rel => rel.arrow.midShaftPoint.x)
      .attr(
        'y',
        rel =>
          rel.arrow.midShaftPoint.y +
          parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
          1
      )
      .attr('transform', function (rel) {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return `rotate(180 ${rel.arrow.midShaftPoint.x} ${
            rel.arrow.midShaftPoint.y
          })`
        } else {
          return null
        }
      })
      .text(rel => rel.shortCaption)
  }
})

const relationshipOverlay = new Renderer({
  name: 'relationshipOverlay',
  onGraphChange (selection) {
    const rects = selection.selectAll('path.overlay').data(rel => [rel])

    rects
      .enter()
      .append('path')
      .classed('overlay', true)

    return rects.exit().remove()
  },

  onTick (selection) {
    const band = 16

    return selection
      .selectAll('path.overlay')
      .attr('d', d => d.arrow.overlay(band))
  }
})

const groupCountour = new Renderer({
  name: 'groupCountor',
  onGraphChange (selection) {
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
relationship.push(relationshipType)
relationship.push(relationshipOverlay)

const fileGroup = []
fileGroup.push(groupCountour)
// fileGroup.push(fileLabel)

export { node, relationship, fileGroup } // Add countour
