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

import { mapNodes, mapRelationships, getGraphStats } from './mapper'

export class GraphEventHandler {
  getNodeNeighbours: any
  getVarWriteNeighbours: any
  getEdgeTypeNeighbours: any
  getHiddenEdgeTypes: any
  getWhoCanCallThis: any
  getWhatAreTheArgs: any
  getInWhichClassIsItDefined: any
  getWhereIsMethodCalled: any
  getAreAllCallsComingFromSameClass: any
  getWhatCanUpdatethis: any
  getWhereIsItDeclared: any
  getWhereIsItAccessed: any
  getWhereAreInstancesCreated: any
  getWhatDataCanWeAccess: any
  graph: any
  graphView: any
  onGraphModelChange: any
  onItemMouseOver: any
  onItemSelected: any
  selectedItem: any
  constructor(
    graph: any,
    graphView: any,
    getNodeNeighbours: any,
    getVarWriteNeighbours: any,
    getEdgeTypeNeighbours: any,
    getHiddenEdgeTypes: any,
    getWhoCanCallThis: any,
    getWhatAreTheArgs: any,
    getInWhichClassIsItDefined: any,
    getWhereIsMethodCalled: any,
    getAreAllCallsComingFromSameClass: any,
    getWhatCanUpdatethis: any,
    getWhereIsItDeclared: any,
    getWhereIsItAccessed: any,
    getWhereAreInstancesCreated: any,
    getWhatDataCanWeAccess: any,
    onItemMouseOver: any,
    onItemSelected: any,
    onGraphModelChange: any
  ) {
    this.graph = graph
    this.graphView = graphView
    this.getNodeNeighbours = getNodeNeighbours
    this.getVarWriteNeighbours = getVarWriteNeighbours
    this.getEdgeTypeNeighbours = getEdgeTypeNeighbours
    this.getHiddenEdgeTypes = getHiddenEdgeTypes
    this.getWhoCanCallThis = getWhoCanCallThis
    this.getWhatAreTheArgs = getWhatAreTheArgs
    this.getInWhichClassIsItDefined = getInWhichClassIsItDefined
    this.getWhereIsMethodCalled = getWhereIsMethodCalled
    this.getAreAllCallsComingFromSameClass = getAreAllCallsComingFromSameClass
    this.getWhatCanUpdatethis = getWhatCanUpdatethis
    this.getWhereIsItDeclared = getWhereIsItDeclared
    this.getWhereIsItAccessed = getWhereIsItAccessed
    this.getWhereAreInstancesCreated = getWhereAreInstancesCreated
    this.getWhatDataCanWeAccess = getWhatDataCanWeAccess
    this.selectedItem = null
    this.onItemMouseOver = onItemMouseOver
    this.onItemSelected = onItemSelected
    this.onGraphModelChange = onGraphModelChange
  }

  graphModelChanged() {
    this.onGraphModelChange(getGraphStats(this.graph))
  }

  selectItem(item: any) {
    if (this.selectedItem) {
      this.selectedItem.selected = false
    }
    this.selectedItem = item
    item.selected = true
    this.graphView.update()
  }

  deselectItem() {
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
    this.graphView.update()
  }

  nodeClose(d: any) {
    this.graph.removeConnectedRelationships(d)
    this.graph.removeNode(d)
    this.deselectItem()
    this.graphView.update()
    this.graphModelChanged()
  }

  nodeClicked(d: any) {
    if (!d || typeof d == 'string') {
      return
    }
    this.getEdgeTypes(d)

    d.fixed = true
    if (!d.selected) {
      this.selectItem(d)
      this.onItemSelected({
        type: 'node',
        item: { id: d.id, labels: d.labels, properties: d.propertyList }
      })
    } else {
      this.deselectItem()
    }
  }

  nodeUnlock(d: any) {
    if (!d) {
      return
    }
    d.fixed = false
    this.deselectItem()
  }

  nodeDblClicked(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      return
    }
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getNodeNeighbours(
      d,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        graph.addExpandedNodes(d, mapNodes(nodes))
        graph.addRelationships(mapRelationships(relationships, graph))
        graphView.update()
        graphModelChanged()
      }
    )
  }

  expandVarWrite(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      return
    }
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getVarWriteNeighbours(
      d,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        graph.addExpandedNodes(d, mapNodes(nodes))
        graph.addRelationships(mapRelationships(relationships, graph))
        graphView.update()
        graphModelChanged()
      }
    )
  }

  expandEdgeType(d: any, edgeType: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      return
    }
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getEdgeTypeNeighbours(
      d,
      edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandWhoCanCallThis(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtWhoCanCallThis == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtWhoCanCallThis = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getWhoCanCallThis(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandWhatAreTheArgs(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtWhatAreTheArgs == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtWhatAreTheArgs = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getWhatAreTheArgs(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandInWhichClassIsItDefined(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtInWhichClassIsItDefined == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtInWhichClassIsItDefined = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getInWhichClassIsItDefined(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandWhereIsMethodCalled(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtWhereIsMethodCalled == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtWhereIsMethodCalled = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getWhereIsMethodCalled(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandAreAllCallsComingFromSameClass(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtAreAllCallsComingFromSameClass == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtAreAllCallsComingFromSameClass = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getAreAllCallsComingFromSameClass(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandWhatCanUpdatethis(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtWhatCanUpdatethis == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtWhatCanUpdatethis = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getWhatCanUpdatethis(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandWhereIsItDeclared(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtWhereIsItDeclared == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtWhereIsItDeclared = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getWhereIsItDeclared(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandWhereIsItAccessed(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtWhereIsItAccessed == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtWhereIsItAccessed = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getWhereIsItAccessed(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandWhereAreInstancesCreated(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtWhereAreInstancesCreated == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtWhereAreInstancesCreated = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getWhereAreInstancesCreated(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  expandWhatDataCanWeAccess(d: any) {
    if (d.expanded) {
      this.nodeCollapse(d)
      if (d.expandedAtWhatDataCanWeAccess == true) {
        this.resetExpansionFlags(d)
        return
      } else {
        this.resetExpansionFlags(d)
      }
    }
    d.expandedAtWhatDataCanWeAccess = true
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getWhatDataCanWeAccess(
      d,
      // edgeType,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        if (nodes.length > 0 || relationships.length > 0) {
          graph.addExpandedNodes(d, mapNodes(nodes))
          graph.addRelationships(mapRelationships(relationships, graph))
          graphView.update()
          graphModelChanged()
        } else {
          d.expanded = false
          graphView.update()
          graphModelChanged()
          return
        }
      }
    )
  }

  getEdgeTypes(d: any) {
    // d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getHiddenEdgeTypes(
      d,
      this.graph.findNodeNeighbourIds(d.id),
      (err: any) => {
        if (err) return
        // Replace this
        // graph.addExpandedNodes(d, mapNodes(nodes))
        // graph.addRelationships(mapRelationships(relationships, graph))
        graphView.update()
        graphModelChanged()
      }
    )
  }

  nodeCollapse(d: any) {
    d.expanded = false
    this.graph.collapseNode(d)
    this.graphView.update()
    this.graphModelChanged()
  }

  resetExpansionFlags(d: any) {
    d.expandedAtWhoCanCallThis = false
    d.expandedAtWhatAreTheArgs = false
    d.expandedAtInWhichClassIsItDefined = false
    d.expandedAtWhereIsMethodCalled = false
    d.expandedAtAreAllCallsComingFromSameClass = false
    d.expandedAtWhatCanUpdatethis = false
    d.expandedAtWhereIsItDeclared = false
    d.expandedAtWhereIsItAccessed = false
    d.expandedAtWhatDataCanWeAccess = false
    d.expandedAtWhereAreInstancesCreated = false
  }

  onNodeMouseOver(node: any) {
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

  onMenuMouseOver(itemWithMenu: any) {
    console.log(itemWithMenu)
    this.onItemMouseOver({
      type: 'context-menu-item'
      // item: {
      //   // label: itemWithMenu.contextMenu.label,
      //   content: itemWithMenu.contextMenu.menuContent,
      //   selection: itemWithMenu.contextMenu.menuSelection
      // }
    })
  }

  onRelationshipMouseOver(relationship: any) {
    this.onItemMouseOver({
      type: 'relationship',
      item: {
        id: relationship.id,
        type: relationship.type,
        properties: relationship.propertyList
      }
    })
  }

  onRelationshipClicked(relationship: any) {
    if (!relationship.selected) {
      this.selectItem(relationship)
      this.onItemSelected({
        type: 'relationship',
        item: {
          id: relationship.id,
          type: relationship.type,
          properties: relationship.propertyList
        }
      })
    } else {
      this.deselectItem()
    }
  }

  onCanvasClicked() {
    this.deselectItem()
  }

  onItemMouseOut() {
    this.onItemMouseOver({
      type: 'canvas',
      item: {
        nodeCount: this.graph.nodes().length,
        relationshipCount: this.graph.relationships().length
      }
    })
  }

  bindEventHandlers() {
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
      .on('expandVarWrite', this.expandVarWrite.bind(this))
      .on('expandEdgeType', this.expandEdgeType.bind(this))
      .on('expandWhoCanCallThis', this.expandWhoCanCallThis.bind(this))
      .on('expandWhatAreTheArgs', this.expandWhatAreTheArgs.bind(this))
      .on(
        'expandInWhichClassIsItDefined',
        this.expandInWhichClassIsItDefined.bind(this)
      )
      .on(
        'expandWhereIsMethodCalled',
        this.expandWhereIsMethodCalled.bind(this)
      )
      .on(
        'expandAreAllCallsComingFromSameClass',
        this.expandAreAllCallsComingFromSameClass.bind(this)
      )
      .on('expandWhatCanUpdatethis', this.expandWhatCanUpdatethis.bind(this))
      .on('expandWhereIsItDeclared', this.expandWhereIsItDeclared.bind(this))
      .on('expandWhereIsItAccessed', this.expandWhereIsItAccessed.bind(this))
      .on(
        'expandWhereAreInstancesCreated',
        this.expandWhereAreInstancesCreated.bind(this)
      )
      .on(
        'expandWhatDataCanWeAccess',
        this.expandWhatDataCanWeAccess.bind(this)
      )
      .on('nodeUnlock', this.nodeUnlock.bind(this))
    this.onItemMouseOut()
  }
}
