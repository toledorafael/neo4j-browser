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

export default class ArcArrow {
  constructor (
    startRadius,
    endRadius,
    endCentre,
    deflection,
    arrowWidth,
    headWidth,
    headLength,
    captionLayout,
    captionHeight
  ) {
    this.deflection = deflection
    const square = l => l * l

    const deflectionRadians = (this.deflection * Math.PI) / 180
    const startAttach = {
      x: Math.cos(deflectionRadians) * startRadius,
      y: Math.sin(deflectionRadians) * startRadius
    }

    const radiusRatio = startRadius / (endRadius + headLength)
    const homotheticCenter = (-endCentre * radiusRatio) / (1 - radiusRatio)

    const intersectWithOtherCircle = function (
      fixedPoint,
      radius,
      xCenter,
      polarity
    ) {
      const gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter)
      const hc = fixedPoint.y - gradient * fixedPoint.x

      const A = 1 + square(gradient)
      const B = 2 * (gradient * hc - xCenter)
      const C = square(hc) + square(xCenter) - square(radius)

      const intersection = {
        x: (-B + polarity * Math.sqrt(square(B) - 4 * A * C)) / (2 * A)
      }
      intersection.y = (intersection.x - homotheticCenter) * gradient

      return intersection
    }

    const endAttach = intersectWithOtherCircle(
      startAttach,
      endRadius + headLength,
      endCentre,
      -1
    )

    const g1 = -startAttach.x / startAttach.y
    const c1 = startAttach.y + square(startAttach.x) / startAttach.y
    const g2 = -(endAttach.x - endCentre) / endAttach.y
    const c2 =
      endAttach.y + ((endAttach.x - endCentre) * endAttach.x) / endAttach.y

    const cx = (c1 - c2) / (g2 - g1)
    const cy = g1 * cx + c1

    const arcRadius = Math.sqrt(
      square(cx - startAttach.x) + square(cy - startAttach.y)
    )
    const startAngle = Math.atan2(startAttach.x - cx, cy - startAttach.y)
    const endAngle = Math.atan2(endAttach.x - cx, cy - endAttach.y)
    let sweepAngle = endAngle - startAngle
    if (this.deflection > 0) {
      sweepAngle = 2 * Math.PI - sweepAngle
    }

    this.shaftLength = sweepAngle * arcRadius
    if (startAngle > endAngle) {
      this.shaftLength = 0
    }

    let midShaftAngle = (startAngle + endAngle) / 2
    if (this.deflection > 0) {
      midShaftAngle += Math.PI
    }
    this.midShaftPoint = captionsAbove => ({
      x: cx + arcRadius * Math.sin(midShaftAngle),
      y:
        cy -
        arcRadius * Math.cos(midShaftAngle) -
        (captionsAbove ? captionHeight * 0.625 + shaftRadius : 0)
    })

    const startTangent = function (dr) {
      const dx = (dr < 0 ? 1 : -1) * Math.sqrt(square(dr) / (1 + square(g1)))
      const dy = g1 * dx
      return {
        x: startAttach.x + dx,
        y: startAttach.y + dy
      }
    }

    const endTangent = function (dr) {
      const dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2)))
      const dy = g2 * dx
      return {
        x: endAttach.x + dx,
        y: endAttach.y + dy
      }
    }

    const angleTangent = (angle, dr) => ({
      x: cx + (arcRadius + dr) * Math.sin(angle),
      y: cy - (arcRadius + dr) * Math.cos(angle)
    })

    const endNormal = function (dc) {
      const dx =
        (dc < 0 ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2)))
      const dy = dx / g2
      return {
        x: endAttach.x + dx,
        y: endAttach.y - dy
      }
    }

    const endOverlayCorner = function (dr, dc) {
      const shoulder = endTangent(dr)
      const arrowTip = endNormal(dc)
      return {
        x: shoulder.x + arrowTip.x - endAttach.x,
        y: shoulder.y + arrowTip.y - endAttach.y
      }
    }

    const coord = point => `${point.x},${point.y}`

    const shaftRadius = arrowWidth / 2
    const headRadius = headWidth / 2
    const positiveSweep = startAttach.y > 0 ? 0 : 1
    const negativeSweep = startAttach.y < 0 ? 0 : 1

    const tipInstructions = function (segmentCount, index) {
      const instructions = []
      const inner = -shaftRadius + (index / segmentCount) * arrowWidth
      const outer = -shaftRadius + ((index + 1) / segmentCount) * arrowWidth
      if (index === 0) {
        instructions.push('L')
        instructions.push(coord(endTangent(-headRadius)))
      }

      // inner instruction
      instructions.push('L')
      instructions.push(
        coord(
          endOverlayCorner(
            inner,
            headLength * (1 - Math.abs(inner) / headRadius)
          )
        )
      )

      // tip point
      if (segmentCount === 2 * index + 1) {
        instructions.push('L')
        instructions.push(coord(endNormal(headLength)))
      }

      // outer instruction
      instructions.push('L')
      instructions.push(
        coord(
          endOverlayCorner(
            outer,
            headLength * (1 - Math.abs(outer) / headRadius)
          )
        )
      )

      if (index === segmentCount - 1) {
        instructions.push('L')
        instructions.push(coord(endTangent(headRadius)))
      }
      return instructions.join(' ')
    }

    this.outline = function (
      shortCaptionLength,
      segmentCount,
      toggleStripes,
      captionsAbove
    ) {
      let paths = []
      if (startAngle > endAngle || shaftRadius >= arcRadius) {
        if (toggleStripes) {
          paths = Array(segmentCount)
            .fill()
            .map((_, i) => {
              const inner = -shaftRadius + (i / segmentCount) * arrowWidth
              const outer = -shaftRadius + ((i + 1) / segmentCount) * arrowWidth

              return [
                'M',
                coord(endTangent(inner)),
                tipInstructions(segmentCount, i),
                'L',
                coord(endTangent(outer)),
                'Z'
              ].join(' ')
            })
        } else {
          // prettier-ignore
          paths = [
            [
              'M', coord(endTangent(-headRadius)),
              'L', coord(endNormal(headLength)),
              'L', coord(endTangent(headRadius)),
              'Z'
            ].join(' ')
          ]
        }
      }

      if (captionLayout === 'external' && !captionsAbove) {
        let captionSweep = shortCaptionLength / arcRadius
        if (this.deflection > 0) {
          captionSweep *= -1
        }

        const startBreak = midShaftAngle - captionSweep / 2
        const endBreak = midShaftAngle + captionSweep / 2

        if (toggleStripes) {
          paths = Array(segmentCount)
            .fill()
            .map((_, i) => {
              const inner = -shaftRadius + (i / segmentCount) * arrowWidth
              const outer = -shaftRadius + ((i + 1) / segmentCount) * arrowWidth

              return [
                'M',
                coord(startTangent(outer)),
                'L',
                coord(startTangent(inner)),
                'A',
                arcRadius + inner,
                arcRadius + inner,
                0,
                0,
                positiveSweep,
                coord(angleTangent(startBreak, inner)),
                'L',
                coord(angleTangent(startBreak, shaftRadius)),
                'A',
                arcRadius + outer,
                arcRadius + outer,
                0,
                0,
                negativeSweep,
                coord(startTangent(outer)),
                'Z',
                'M',
                coord(angleTangent(endBreak, outer)),
                'L',
                coord(angleTangent(endBreak, inner)),
                'A',
                arcRadius + inner,
                arcRadius + inner,
                0,
                0,
                positiveSweep,
                coord(endTangent(inner)),
                tipInstructions(segmentCount, i),
                'L',
                coord(endTangent(outer)),
                'A',
                arcRadius + outer,
                arcRadius + outer,
                0,
                0,
                negativeSweep,
                coord(angleTangent(endBreak, outer)),
                'Z'
              ].join(' ')
            })
        } else {
          // prettier-ignore
          paths = [
            [
              'M', coord(startTangent(shaftRadius)),
              'L', coord(startTangent(-shaftRadius)),
              'A', arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(angleTangent(startBreak, -shaftRadius)),
              'L', coord(angleTangent(startBreak, shaftRadius)),
              'A', arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius)),
              'Z',
              'M', coord(angleTangent(endBreak, shaftRadius)),
              'L', coord(angleTangent(endBreak, -shaftRadius)),
              'A', arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)),
              'L', coord(endTangent(-headRadius)),
              'L', coord(endNormal(headLength)),
              'L', coord(endTangent(headRadius)),
              'L', coord(endTangent(shaftRadius)),
              'A', arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(angleTangent(endBreak, shaftRadius))
            ].join(' ')
          ]
        }
      } else {
        if (toggleStripes) {
          paths = Array(segmentCount)
            .fill()
            .map((_, i) => {
              const inner = -shaftRadius + (i / segmentCount) * arrowWidth
              const outer = -shaftRadius + ((i + 1) / segmentCount) * arrowWidth

              return [
                'M',
                coord(startTangent(inner)),
                'A',
                arcRadius + inner,
                arcRadius + inner,
                0,
                0,
                positiveSweep,
                coord(endTangent(inner)),
                tipInstructions(segmentCount, i),
                'L',
                coord(endTangent(outer)),
                'A',
                arcRadius + outer,
                arcRadius + outer,
                0,
                0,
                negativeSweep,
                coord(startTangent(outer)),
                'Z'
              ].join(' ')
            })
        } else {
          // prettier-ignore
          paths = [
            [
              'M', coord(startTangent(shaftRadius)),
              'L', coord(startTangent(-shaftRadius)),
              'A', arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)),
              'L', coord(endTangent(-headRadius)),
              'L', coord(endNormal(headLength)),
              'L', coord(endTangent(headRadius)),
              'L', coord(endTangent(shaftRadius)),
              'A', arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius))
            ].join(' ')
          ]
        }
      }

      const type = toggleStripes ? 'radialGradient' : 'linearGradient'
      const attrs = {}
      if (toggleStripes) {
        // attrs.cx = cx
        // attrs.cy = cy
        // attrs.fr = arcRadius - shaftRadius
        // attrs.r = arcRadius + shaftRadius
        return paths.map(path => ({ path }))
      } else {
        attrs.x1 = '0%'
        attrs.y1 = '0%'
        attrs.x2 = '100%'
        attrs.y2 = '0%'
        attrs.gradientUnits = 'objectBoundingBox'

        return [
          {
            path: paths[0],
            gradient: { type, id: 'arc', attrs }
          }
        ]
      }
    }

    this.overlay = function (minWidth) {
      const radius = Math.max(minWidth / 2, shaftRadius)

      return [
        'M',
        coord(startTangent(radius)),
        'L',
        coord(startTangent(-radius)),
        'A',
        arcRadius - radius,
        arcRadius - radius,
        0,
        0,
        positiveSweep,
        coord(endTangent(-radius)),
        'L',
        coord(endOverlayCorner(-radius, headLength)),
        'L',
        coord(endOverlayCorner(radius, headLength)),
        'L',
        coord(endTangent(radius)),
        'A',
        arcRadius + radius,
        arcRadius + radius,
        0,
        0,
        negativeSweep,
        coord(startTangent(radius))
      ].join(' ')
    }
  }
}
