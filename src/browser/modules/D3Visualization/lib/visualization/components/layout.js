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
import collision from './collision'
import circularLayout from '../utils/circularLayout'
import cloneArray from '../utils/arrays'

const layout = {
  force: () => {
    return {
      init: render => {
        const forceLayout = {}

        const linkDistance = 20
        // const linkDistance = 50

        const d3force = d3.layout
          .force()
          .linkDistance(relationship => {
            const sourceFilename = relationship.source.propertyMap.filename
            const targetFilename = relationship.target.propertyMap.filename
            if (sourceFilename === targetFilename) {
              return (
                relationship.source.radius +
                relationship.target.radius +
                linkDistance
              )
            } else {
              return (
                relationship.source.radius +
                relationship.target.radius +
                4 * linkDistance
              )
            }
            // return relationship.source.radius +
            // relationship.target.radius +
            // linkDistance
          })
          .charge(-1000)
          // .charge(-10)
          // .chargeDistance(30)
          // .gravity(0.07)
          // .linkStrength(0.5)
          .linkStrength(relationship => {
            const sourceFilename = relationship.source.propertyMap.filename
            const targetFilename = relationship.target.propertyMap.filename
            if (sourceFilename === targetFilename) {
              return 0.2
            } else {
              return 1
            }
          })

        const newStatsBucket = function () {
          const bucket = {
            layoutTime: 0,
            layoutSteps: 0
          }
          return bucket
        }

        let currentStats = newStatsBucket()

        forceLayout.collectStats = function () {
          const latestStats = currentStats
          currentStats = newStatsBucket()
          return latestStats
        }

        const accelerateLayout = function () {
          let maxStepsPerTick = 100
          const maxAnimationFramesPerSecond = 60
          const maxComputeTime = 1000 / maxAnimationFramesPerSecond
          const now =
            window.performance && window.performance.now
              ? () => window.performance.now()
              : () => Date.now()

          const d3Tick = d3force.tick
          return (d3force.tick = function () {
            const startTick = now()
            let step = maxStepsPerTick
            while (step-- && now() - startTick < maxComputeTime) {
              const startCalcs = now()
              currentStats.layoutSteps++

              collision.avoidOverlap(d3force.nodes())

              if (d3Tick()) {
                maxStepsPerTick = 2
                return true
              }
              currentStats.layoutTime += now() - startCalcs
            }
            render()
            return false
          })
        }

        accelerateLayout()

        const oneRelationshipPerPairOfNodes = graph =>
          Array.from(graph.groupedRelationships()).map(
            pair => pair.relationships[0]
          )

        forceLayout.update = function (graph, size) {
          const nodes = cloneArray(graph.nodes())
          const relationships = oneRelationshipPerPairOfNodes(graph)

          const radius = (nodes.length * linkDistance) / (Math.PI * 2)
          const center = {
            x: size[0] / 2,
            y: size[1] / 2
          }
          circularLayout(nodes, center, radius)

          return d3force
            .nodes(nodes)
            .links(relationships)
            .size(size)
            .start()
        }

        forceLayout.drag = d3force.drag
        forceLayout.alpha = d3force.alpha
        forceLayout.start = d3force.start
        return forceLayout
      }
    }
  }
}

export default layout
