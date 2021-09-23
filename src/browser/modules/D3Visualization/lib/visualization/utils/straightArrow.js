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

export default class StraightArrow {
  deflection = 0

  constructor (
    startRadius,
    endRadius,
    centreDistance,
    shaftWidth,
    headWidth,
    headHeight,
    captionLayout,
    captionHeight
  ) {
    this.length = centreDistance - (startRadius + endRadius)

    this.shaftLength = this.length - headHeight
    this.separateArrowWidth = 0
    const startArrow = startRadius
    const endShaft = startArrow + this.shaftLength
    const endArrow = startArrow + this.length
    const shaftRadius = shaftWidth / 2
    const headRadius = headWidth / 2

    const separateOutline = (colorCount, index) => {
      const hLength = 6
      const distance = Math.min(6, startRadius / colorCount)
      this.separateArrowWidth = distance * colorCount
      const sRadius = distance * 0.25
      const hRadius = distance * 0.4

      const halfWidthOffset = Math.floor(colorCount / 2)
      var offset
      
      if (index === 0 && colorCount > 1) {
        offset = -halfWidthOffset * distance
      } else if (index < halfWidthOffset) {
        offset = -((halfWidthOffset - index) * distance)
      } else if (index === halfWidthOffset || (index === 0 && colorCount <= 1)) {
        offset = 0
      } else if (index > halfWidthOffset) {
        offset = (index - halfWidthOffset) * distance
      }

      return [
        'M', startArrow, sRadius + offset,
        'L', endShaft + hLength, sRadius + offset,
        'L', endShaft + hLength, hRadius + offset,
        'L', endArrow, offset,
        'L', endShaft + hLength, -hRadius + offset,
        'L', endShaft + hLength, -sRadius + offset,
        'L', startArrow, -sRadius + offset,
        'Z'
      ].join(' ')
    }

    this.midShaftPoint = layout => ({
      x: startArrow + this.shaftLength / 2,
      y: layout !== 'stripes' ? -captionHeight * 0.625 - Math.max(shaftRadius, this.separateArrowWidth / 2) : 0
    })

    this.outline = function (shortCaptionLength, colorCount, layout) {
      let path
      if (captionLayout === 'external' && layout !== 'segments') {
        const startBreak =
          startArrow + (this.shaftLength - shortCaptionLength) / 2
        const endBreak = endShaft - (this.shaftLength - shortCaptionLength) / 2

        // prettier-ignore
        path = [
          'M', startArrow, shaftRadius,
          'L', startBreak, shaftRadius,
          'L', startBreak, -shaftRadius,
          'L', startArrow, -shaftRadius,
          'Z',
          'M', endBreak, shaftRadius,
          'L', endShaft, shaftRadius,
          'L', endShaft, headRadius,
          'L', endArrow, 0,
          'L', endShaft, -headRadius,
          'L', endShaft, -shaftRadius,
          'L', endBreak, -shaftRadius,
          'Z'
        ].join(' ')
      } else {
        // prettier-ignore
        path = [
          'M', startArrow, shaftRadius,
          'L', endShaft, shaftRadius,
          'L', endShaft, headRadius,
          'L', endArrow, 0,
          'L', endShaft, -headRadius,
          'L', endShaft, -shaftRadius,
          'L', startArrow, -shaftRadius,
          'Z'
        ].join(' ')
      }
      const attrs = {}

      if (layout === 'separate') {
        return Array(colorCount)
          .fill()
          .map((_, i) => ({
            path: separateOutline(colorCount, i)
          }))
      }

      if (layout === 'stripes') {
        attrs.x1 = 0
        attrs.y1 = shaftRadius
        attrs.x2 = 0
        attrs.y2 = -shaftRadius
      } else {
        attrs.x1 = '0%'
        attrs.y1 = '0%'
        attrs.x2 = '100%'
        attrs.y2 = '0%'
        attrs.gradientUnits = 'objectBoundingBox'
      }
      const id = `straight-${layout}-${shaftWidth}`
      return [
        {
          path,
          gradient: {
            type: 'linearGradient',
            id,
            attrs
          }
        }
      ]
    }

    this.overlay = function (minWidth) {
      const radius = Math.max(minWidth / 2, shaftRadius)
      return [
        'M',
        startArrow,
        radius,
        'L',
        endArrow,
        radius,
        'L',
        endArrow,
        -radius,
        'L',
        startArrow,
        -radius,
        'Z'
      ].join(' ')
    }
  }
}
