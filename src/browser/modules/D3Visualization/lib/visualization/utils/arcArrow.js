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
    this.width = arrowWidth
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
    this.midShaftPoint = layout => ({
      x: cx + arcRadius * Math.sin(midShaftAngle),
      y:
        cy -
        arcRadius * Math.cos(midShaftAngle) -
        (layout === 'separate'
          ? captionHeight * 0.625 +
            (this.separateArrowWidth || Math.min(startRadius, endRadius)) / 2
          : layout === 'stripes'
            ? 0
            : captionHeight * 0.625 + shaftRadius)
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

    this.getEndCenter = () => startTangent(0)
    this.getEndRotation = () => (startAngle * 180) / Math.PI

    const tipInstructions = function (colorCount, index) {
      const instructions = []
      const inner = -shaftRadius + (index / colorCount) * arrowWidth
      const outer = -shaftRadius + ((index + 1) / colorCount) * arrowWidth
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
      if (colorCount === 2 * index + 1) {
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

      if (index === colorCount - 1) {
        instructions.push('L')
        instructions.push(coord(endTangent(headRadius)))
      }
      return instructions.join(' ')
    }

    const separateOutline = (colorCount, index) => {
      const distance = Math.min(
        6,
        Math.min(startRadius, endRadius) / colorCount
      )
      this.separateArrowWidth = distance * colorCount
      const sRadius = distance * 0.25
      const hRadius = distance * 0.4

      const offset = (index - (colorCount - 1) / 2) * distance

      const inner = -sRadius + offset
      const outer = sRadius + offset
      const extraLength =
        endRadius - Math.sqrt(endRadius * endRadius - offset * offset)

      const sAngle = -Math.atan(Math.abs(cx / cy))
      // const r4 = Math.sqrt(r1 * r1 - offset * offset)
      return [
        'M',
        coord(angleTangent(sAngle, outer)),
        'L',
        coord(angleTangent(sAngle, inner)),
        'A',
        arcRadius + inner,
        arcRadius + inner,
        0,
        0,
        positiveSweep,
        coord(endTangent(inner)),
        'L',
        coord(endTangent(offset - hRadius)),
        'L',
        coord(endOverlayCorner(offset, headLength + extraLength)),
        'L',
        coord(endTangent(offset + hRadius)),
        'L',
        coord(endTangent(outer)),
        'A',
        arcRadius + outer,
        arcRadius + outer,
        0,
        0,
        negativeSweep,
        coord(angleTangent(sAngle, outer))
      ].join(' ')
    }

    this.outline = function (shortCaptionLength, colorCount, layout) {
      if (layout === 'separate') {
        return Array(colorCount)
          .fill()
          .map((_, i) => ({
            path: separateOutline(colorCount, i)
          }))
      }

      if (layout === 'segments-pattern') {
        const segmentAngle = (endAngle - startAngle) / colorCount
        return Array(colorCount + 1)
          .fill()
          .map((_, i) => {
            if (i === colorCount) {
              return {
                path: [
                  'M',
                  coord(endTangent(-headRadius)),
                  'L',
                  coord(endNormal(headLength)),
                  'L',
                  coord(endTangent(headRadius)),
                  'Z'
                ].join(' ')
              }
            }
            return {
              path:
                `M ${coord(angleTangent(startAngle + segmentAngle * i, 0))} ` +
                `A ${arcRadius} ${arcRadius} 0 0 1 ${coord(
                  angleTangent(startAngle + segmentAngle * (i + 1), 0)
                )}`,
              useStroke: true,
              strokeWidth: arrowWidth
            }
          })
      }

      let paths = []
      if (startAngle > endAngle || shaftRadius >= arcRadius) {
        if (layout === 'stripes') {
          paths = Array(colorCount)
            .fill()
            .map((_, i) => {
              const inner = -shaftRadius + (i / colorCount) * arrowWidth
              const outer = -shaftRadius + ((i + 1) / colorCount) * arrowWidth

              return [
                'M',
                coord(endTangent(inner)),
                tipInstructions(colorCount, i),
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

      if (captionLayout === 'external' && layout === 'stripes') {
        let captionSweep = shortCaptionLength / arcRadius
        if (this.deflection > 0) {
          captionSweep *= -1
        }

        const startBreak = midShaftAngle - captionSweep / 2
        const endBreak = midShaftAngle + captionSweep / 2

        if (layout === 'stripes') {
          paths = Array(colorCount)
            .fill()
            .map((_, i) => {
              const inner = -shaftRadius + (i / colorCount) * arrowWidth
              const outer = -shaftRadius + ((i + 1) / colorCount) * arrowWidth

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
                tipInstructions(colorCount, i),
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
        if (layout === 'stripes') {
          paths = Array(colorCount)
            .fill()
            .map((_, i) => {
              const inner = -shaftRadius + (i / colorCount) * arrowWidth
              const outer = -shaftRadius + ((i + 1) / colorCount) * arrowWidth

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
                tipInstructions(colorCount, i),
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

      const attrs = {}
      if (layout === 'stripes') {
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
            gradient: { type: 'linearGradient', id: 'arc', attrs }
          }
        ]
      }
    }

    this.overlay = function (minWidth) {
      const radius = Math.max(
        minWidth / 2,
        shaftRadius,
        (this.separateArrowWidth || 0) / 2
      )

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
