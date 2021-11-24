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

import { mapNodes, mapRelationships, getGraphStats } from './mapper'

export class GraphEventHandler {
  constructor (
    graph,
    graphView,
    getNodeNeighbours,
    onItemMouseOver,
    onItemSelected,
    onGraphModelChange
  ) {
    this.graph = graph
    this.graphView = graphView
    this.getNodeNeighbours = getNodeNeighbours
    this.selectedItem = null
    this.onItemMouseOver = onItemMouseOver
    this.onItemSelected = onItemSelected
    this.onGraphModelChange = onGraphModelChange
  }

  graphModelChanged () {
    this.onGraphModelChange(getGraphStats(this.graph))
  }

  selectItem (item, drawGroupMarks) {
    if (this.selectedItem) {
      this.selectedItem.selected = false
    }
    this.selectedItem = item
    item.selected = true
    this.graphView.update(drawGroupMarks) // update and show groupmarks
  }

  deselectItem (drawGroupMarks) {
    if (this.selectedItem) {
      this.selectedItem.selected = false
      this.selectedItem = null
    }
    this.onItemSelected({
      type: 'canvas',
      item: {
        nodeCount: this.graph.nodes().length,
        relationshipCount: this.graph.relationships().length
      }
    })
    this.graphView.update(drawGroupMarks)
  }

  nodeClose (d) {
    this.graph.removeConnectedRelationships(d)
    this.graph.removeNode(d)
    this.deselectItem()
    this.graphView.update()
    this.graphModelChanged()
  }

  nodeClicked (d, drawGroupMarks) {
    if (!d) {
      return
    }
    d.fixed = true
    if (!d.selected) {
      this.selectItem(d, drawGroupMarks)
      this.onItemSelected({
        type: 'node',
        item: { id: d.id, labels: d.labels, properties: d.propertyList }
      })
    } else {
      this.deselectItem(drawGroupMarks)
    }
  }

  nodeUnlock (d) {
    if (!d) {
      return
    }
    d.fixed = false
    this.deselectItem()
  }

  nodeDblClicked (d, drawGroupMarks) {
    if (d.expanded) {
      this.nodeCollapse(d)
      return
    }
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getNodeNeighbours(d, this.graph.findNodeNeighbourIds(d.id), function (
      err,
      { nodes, relationships }
    ) {
      if (err) return
      graph.addExpandedNodes(d, mapNodes(nodes))
      graph.addRelationships(mapRelationships(relationships, graph))
      graphView.update(drawGroupMarks)
      graphModelChanged()
    })
  }

  nodeCollapse (d) {
    d.expanded = false
    this.graph.collapseNode(d)
    this.graphView.update()
    this.graphModelChanged()
  }

  onNodeMouseOver (node) {
    if (!node.contextMenu) {
      this.onItemMouseOver({
        type: 'node',
        item: {
          id: node.id,
          labels: node.labels,
          properties: node.propertyList
        }
      })
    }
  }
  onMenuMouseOver (itemWithMenu) {
    this.onItemMouseOver({
      type: 'context-menu-item',
      item: {
        label: itemWithMenu.contextMenu.label,
        content: itemWithMenu.contextMenu.menuContent,
        selection: itemWithMenu.contextMenu.menuSelection
      }
    })
  }
  onRelationshipMouseOver (relationship) {
    this.onItemMouseOver({
      type: 'relationship',
      item: {
        id: relationship.id,
        type: relationship.type,
        properties: relationship.propertyList
      }
    })
  }

  onRelationshipClicked (relationship, drawGroupMarks) {
    if (!relationship.selected) {
      this.selectItem(relationship, drawGroupMarks)
      this.onItemSelected({
        type: 'relationship',
        item: {
          id: relationship.id,
          type: relationship.type,
          properties: relationship.propertyList
        }
      })
    } else {
      this.deselectItem(drawGroupMarks)
    }
  }

  onCanvasClicked () {
    this.deselectItem()
  }

  onItemMouseOut (item) {
    this.onItemMouseOver({
      type: 'canvas',
      item: {
        nodeCount: this.graph.nodes().length,
        relationshipCount: this.graph.relationships().length
      }
    })
  }

  bindEventHandlers () {
    this.graphView
      .on('nodeMouseOver', this.onNodeMouseOver.bind(this))
      .on('nodeMouseOut', this.onItemMouseOut.bind(this))
      .on('menuMouseOver', this.onMenuMouseOver.bind(this))
      .on('menuMouseOut', this.onItemMouseOut.bind(this))
      .on('relMouseOver', this.onRelationshipMouseOver.bind(this))
      .on('relMouseOut', this.onItemMouseOut.bind(this))
      .on('relationshipClicked', this.onRelationshipClicked.bind(this))
      .on('canvasClicked', this.onCanvasClicked.bind(this))
      .on('nodeClose', this.nodeClose.bind(this))
      .on('nodeClicked', this.nodeClicked.bind(this))
      .on('nodeDblClicked', this.nodeDblClicked.bind(this))
      .on('nodeUnlock', this.nodeUnlock.bind(this))
    this.onItemMouseOut()
  }
}
