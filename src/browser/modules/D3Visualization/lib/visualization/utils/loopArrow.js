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

export default class LoopArrow {
  constructor (
    nodeRadius,
    straightLength,
    spreadDegrees,
    shaftWidth,
    headWidth,
    headLength,
    captionHeight
  ) {
    const spread = (spreadDegrees * Math.PI) / 180
    const r1 = nodeRadius
    const r2 = nodeRadius + headLength
    const r3 = nodeRadius + straightLength
    const loopRadius = r3 * Math.tan(spread / 2)
    const shaftRadius = shaftWidth / 2
    this.shaftLength = loopRadius * 3 + shaftWidth

    class Point {
      constructor (x, y) {
        this.x = x
        this.y = y
      }
      toString () {
        return `${this.x} ${this.y}`
      }
    }

    const normalPoint = function (sweep, radius, displacement) {
      const localLoopRadius = radius * Math.tan(spread / 2)
      const cy = radius / Math.cos(spread / 2)
      return new Point(
        (localLoopRadius + displacement) * Math.sin(sweep),
        cy + (localLoopRadius + displacement) * Math.cos(sweep)
      )
    }
    this.midShaftPoint = normalPoint(0, r3, shaftRadius + captionHeight / 2 + 2)
    const startPoint = (radius, displacement) =>
      normalPoint((Math.PI + spread) / 2, radius, displacement)
    const endPoint = (radius, displacement) =>
      normalPoint(-(Math.PI + spread) / 2, radius, displacement)

    this.gradient = function (id, colors, toggleStrips, segment) {
      const type = segment === 1 ? 'radialGradient' : 'linearGradient'
      const attrs = {}
      if (segment === 1) {
        attrs.cx = 0
        attrs.cy = r3 / Math.cos(spread / 2)
        attrs.fr = loopRadius - shaftRadius
        attrs.r = loopRadius + shaftRadius
      } else {
        const p1 = (segment ? endPoint : startPoint)(r1, -shaftRadius)
        const p2 = (segment ? endPoint : startPoint)(r1, shaftRadius)
        attrs.x1 = p1.x
        attrs.y1 = p1.y
        attrs.x2 = p2.x
        attrs.y2 = p2.y
      }
      const gradientId = `${id}-loop-${segment}-${
        toggleStrips ? 1 : 0
      }-${shaftWidth}`
      return { type, attrs, gradientId }
    }

    const arcPoint = (radius, angle) => {
      const cy = r3 / Math.cos(spread / 2)
      return new Point(-Math.sin(angle) * radius, Math.cos(angle) * radius + cy)
    }

    this.outline = function (_, colorCount, toggleStripes) {
      const inner = loopRadius - shaftRadius
      const outer = loopRadius + shaftRadius

      const startLength = r3 - r1
      const endLength = r3 - r2
      const arcLength = loopRadius * (Math.PI + spread)
      const totalLength = startLength + endLength + arcLength

      const sections = []

      if (toggleStripes) {
        const section1 = [
          'M',
          startPoint(r1, shaftRadius),
          'L',
          startPoint(r3, shaftRadius),
          'L',
          startPoint(r3, -shaftRadius),
          'L',
          startPoint(r1, -shaftRadius),
          'Z'
        ].join(' ')
        const section2 = [
          'M',
          startPoint(r3, shaftRadius),
          'A',
          outer,
          outer,
          0,
          1,
          1,
          endPoint(r3, shaftRadius),
          'L',
          endPoint(r3, -shaftRadius),
          'A',
          inner,
          inner,
          0,
          1,
          0,
          startPoint(r3, -shaftRadius),
          'Z'
        ].join(' ')
        const section3 = [
          'M',
          endPoint(r3, shaftRadius),
          'L',
          endPoint(r2, shaftRadius),
          'L',
          endPoint(r2, -headWidth / 2),
          'L',
          endPoint(r1, 0),
          'L',
          endPoint(r2, headWidth / 2),
          'L',
          endPoint(r2, -shaftRadius),
          'L',
          endPoint(r3, -shaftRadius),
          'Z'
        ].join(' ')
        const p1 = startPoint(r1, -shaftRadius)
        const p2 = startPoint(r1, shaftRadius)
        const p3 = endPoint(r1, -shaftRadius)
        const p4 = endPoint(r1, shaftRadius)
        return [
          {
            path: section1,
            gradient: {
              type: 'linearGradient',
              id: `loop-1-${r3}-${spread}-${shaftWidth}`,
              attrs: {
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y
              }
            }
          },
          {
            path: section2,
            gradient: {
              type: 'radialGradient',
              id: `loop-2-${r3}-${spread}-${shaftWidth}`,
              attrs: {
                cx: 0,
                cy: r3 / Math.cos(spread / 2),
                fr: inner,
                r: outer
              }
            }
          },
          {
            path: section3,
            gradient: {
              type: 'linearGradient',
              id: `loop-3-${r3}-${spread}-${shaftWidth}`,
              attrs: {
                x1: p3.x,
                y1: p3.y,
                x2: p4.x,
                y2: p4.y
              }
            }
          }
        ]
      }

      for (let i = 0; i < colorCount; ++i) {
        let start = (i * totalLength) / colorCount
        let end = ((i + 1) * totalLength) / colorCount

        let section

        if (end < startLength) {
          section = [
            'M',
            startPoint(r1 + start, shaftRadius),
            'L',
            startPoint(r1 + end, shaftRadius),
            'L',
            startPoint(r1 + end, -shaftRadius),
            'L',
            startPoint(r1 + start, -shaftRadius),
            'Z'
          ].join(' ')
        } else if (start < startLength && end < startLength + arcLength) {
          let endR = (end - startLength) / loopRadius - (Math.PI + spread) / 2
          if (Math.abs(endR - (Math.PI - spread) / 2) < 0.0001) {
            endR += 0.001 // prevent being too close to semicircle
          }
          let isLargeArc = endR > (Math.PI - spread) / 2
          section = [
            'M',
            startPoint(r1 + start, shaftRadius),
            'L',
            startPoint(r3, shaftRadius),
            'A',
            outer,
            outer,
            0,
            isLargeArc ? 1 : 0,
            1,
            arcPoint(outer, endR),
            'L',
            arcPoint(inner, endR),
            'A',
            inner,
            inner,
            0,
            isLargeArc ? 1 : 0,
            0,
            startPoint(r3, -shaftRadius),
            'L',
            startPoint(r1 + start, -shaftRadius),
            'Z'
          ].join(' ')
        } else if (start < startLength) {
          end = end - startLength - arcLength
          section = [
            'M',
            startPoint(r1 + start, shaftRadius),
            'L',
            startPoint(r3, shaftRadius),
            'A',
            outer,
            outer,
            0,
            1,
            1,
            endPoint(r3, shaftRadius),
            'L',
            endPoint(r3 - end, shaftRadius),
            'L',
            endPoint(r3 - end, -shaftRadius),
            'L',
            endPoint(r3, -shaftRadius),
            'A',
            inner,
            inner,
            0,
            1,
            0,
            startPoint(r3, -shaftRadius),
            'L',
            startPoint(r1 + start, -shaftRadius),
            'Z'
          ].join(' ')
        } else if (end < startLength + arcLength) {
          let startR =
            (start - startLength) / loopRadius - (Math.PI + spread) / 2
          let endR = (end - startLength) / loopRadius - (Math.PI + spread) / 2
          if (Math.abs(endR - startR - Math.PI / 2) < 0.0001) {
            endR += 0.001
          }
          let isLargeArc = endR - startR > Math.PI
          section = [
            'M',
            arcPoint(outer, startR),
            'A',
            outer,
            outer,
            0,
            isLargeArc ? 1 : 0,
            1,
            arcPoint(outer, endR),
            'L',
            arcPoint(inner, endR),
            'A',
            inner,
            inner,
            0,
            isLargeArc ? 1 : 0,
            0,
            arcPoint(inner, startR),
            'Z'
          ].join(' ')
        } else if (start < startLength + arcLength) {
          let startR =
            (start - startLength) / loopRadius - (Math.PI + spread) / 2
          end = end - startLength - arcLength
          if (Math.abs(startR + (Math.PI - spread) / 2) < 0.0001) {
            startR -= 0.001 // prevent being too close to semicircle
          }
          let isLargeArc = startR < -(Math.PI - spread) / 2
          console.log(startR)

          section = [
            'M',
            arcPoint(outer, startR),
            'A',
            outer,
            outer,
            0,
            isLargeArc ? 1 : 0,
            1,
            endPoint(r3, shaftRadius),
            'L',
            endPoint(r3 - end, shaftRadius),
            'L',
            endPoint(r3 - end, -shaftRadius),
            'L',
            endPoint(r3, -shaftRadius),
            'A',
            inner,
            inner,
            0,
            isLargeArc ? 1 : 0,
            0,
            arcPoint(inner, startR),
            'Z'
          ].join(' ')
        } else {
          start = start - startLength - arcLength
          end = end - startLength - arcLength

          section = [
            'M',
            endPoint(r3 - start, shaftRadius),
            'L',
            endPoint(r3 - end, shaftRadius),
            'L',
            endPoint(r3 - end, -shaftRadius),
            'L',
            endPoint(r3 - start, -shaftRadius),
            'Z'
          ].join(' ')
        }

        sections.push({ path: section })
      }
      const arrowTip = [
        'M',
        endPoint(r2, -headWidth / 2),
        'L',
        endPoint(r1, 0),
        'L',
        endPoint(r2, headWidth / 2),
        'Z'
      ].join(' ')
      sections.push({ path: arrowTip })
      return sections

      // TODO make arrow tips circular to fix a visual glitch
    }

    this.overlay = function (minWidth) {
      const displacement = Math.max(minWidth / 2, shaftRadius)
      const inner = loopRadius - displacement
      const outer = loopRadius + displacement
      return [
        'M',
        startPoint(r1, displacement),
        'L',
        startPoint(r3, displacement),
        'A',
        outer,
        outer,
        0,
        1,
        1,
        endPoint(r3, displacement),
        'L',
        endPoint(r2, displacement),
        'L',
        endPoint(r2, -displacement),
        'L',
        endPoint(r3, -displacement),
        'A',
        inner,
        inner,
        0,
        1,
        0,
        startPoint(r3, -displacement),
        'L',
        startPoint(r1, -displacement),
        'Z'
      ].join(' ')
    }
  }
}
