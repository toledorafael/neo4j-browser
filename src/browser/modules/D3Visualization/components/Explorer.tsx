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

import React, { Component } from 'react'
import { log } from '../../Logging/Log'
import deepmerge from 'deepmerge'
import { connect, ConnectedComponent } from 'react-redux'
import { debounce } from 'lodash'

import Node from '../lib/visualization/components/node'
import Relationship from '../lib/visualization/components/relationship'
import neoGraphStyle from '../graphStyle'
import { GlobalState } from 'shared/globalState'
import { GraphComponent } from './Graph'
import { GraphStats } from '../mapper'
import { GraphStyle } from './OverviewPane'
import { VizItem } from './types'
import { deepEquals } from 'services/utils'
import { defaultPanelWidth, NodeInspectorPanel } from './NodeInspectorPanel'
import { panelMinWidth, StyledFullSizeContainer } from './styled'
import {
  getNodePropertiesExpandedByDefault,
  setNodePropertiesExpandedByDefault
} from 'shared/modules/frames/framesDuck'
import { Action, Dispatch } from 'redux'
import { PaletteState } from 'shared/modules/palette/palette'

const deduplicateNodes = (nodes: any) => {
  return nodes.reduce(
    (all: any, curr: any) => {
      if (all.taken.indexOf(curr.id) > -1) {
        return all
      } else {
        all.nodes.push(curr)
        all.taken.push(curr.id)
        return all
      }
    },
    { nodes: [], taken: [] }
  ).nodes
}

type ExplorerComponentProps = {
  relationships: Relationship[]
  nodes: Node[]
  initialNodeDisplay: any
  maxNeighbours: number
  graphStyleData: any
  getNeighbours: any
  getVarWriteNeighbours: any
  getEdgeTypeNeighbours: any
  getHiddenEdgesTypes: any
  updateStyle: any
  frameHeight: number
  fullscreen: boolean
  assignVisElement: any
  getAutoCompleteCallback: any
  setGraph: any
  hasTruncatedFields: boolean
}
type ExporerReduxProps = {
  nodePropertiesExpandedByDefault: boolean
  setNodePropertiesExpandedByDefault: (expandedByDefault: boolean) => void
  palette: PaletteState
}

type ExplorerComponentState = {
  graphStyle: GraphStyle
  hoveredItem: VizItem
  nodes: Node[]
  relationships: Relationship[]
  selectedItem: VizItem
  stats: GraphStats
  styleVersion: number
  freezeLegend: boolean
  width: number
  nodePropertiesExpanded: boolean
  hiddenNodeLabels: string[]
  hiddenRelationshipTypes: string[]
  patternSelectorVisible: boolean
}
type FullExplorerProps = ExplorerComponentProps & ExporerReduxProps

export class ExplorerLocal extends Component<
  FullExplorerProps,
  ExplorerComponentState
> {
  defaultStyle: any

  constructor(props: FullExplorerProps) {
    super(props)
    const graphStyle = neoGraphStyle()
    this.defaultStyle = graphStyle.toSheet()
    let relationships = this.props.relationships
    let nodes = deduplicateNodes(this.props.nodes)
    let selectedItem: VizItem = {
      type: 'canvas',
      item: {
        nodeCount: Math.min(this.props.initialNodeDisplay, nodes.length),
        relationshipCount: relationships.length
      }
    }
    if (nodes.length > parseInt(this.props.initialNodeDisplay)) {
      nodes = nodes.slice(0, this.props.initialNodeDisplay)
      relationships = this.props.relationships.filter((item: any) => {
        return nodes.filter((node: any) => node.id === item.startNodeId) > 0
      })
      selectedItem = {
        type: 'status-item',
        item: `Not all return nodes are being displayed due to Initial Node Display setting. Only ${this.props.initialNodeDisplay} of ${nodes.length} nodes are being displayed`
      }
    }
    if (this.props.graphStyleData) {
      const rebasedStyle = deepmerge(
        this.defaultStyle,
        this.props.graphStyleData
      )
      // const rebasedStyle = this.defaultStyle
      graphStyle.loadRules(rebasedStyle)
    }
    this.state = {
      stats: {
        labels: {},
        relTypes: {}
      },
      graphStyle,
      styleVersion: 0,
      nodes,
      relationships,
      selectedItem,
      hoveredItem: selectedItem,
      freezeLegend: false,
      width: defaultPanelWidth(),
      nodePropertiesExpanded: this.props.nodePropertiesExpandedByDefault,
      hiddenNodeLabels: [],
      hiddenRelationshipTypes: [],
      patternSelectorVisible: false
    }
  }

  setNodeLabelVisibility(label: string, value: boolean): void {
    if (!value) {
      if (!this.state.hiddenNodeLabels.includes(label)) {
        this.setState({
          hiddenNodeLabels: [...this.state.hiddenNodeLabels, label]
        })
        log('hide ' + label)
      }
    } else {
      const index = this.state.hiddenNodeLabels.indexOf(label)
      if (index >= 0) {
        this.setState({
          hiddenNodeLabels: [
            ...this.state.hiddenNodeLabels.slice(0, index),
            ...this.state.hiddenNodeLabels.slice(index + 1)
          ]
        })
        log('show ' + label)
      }
    }
  }

  setRelTypeVisibility(relType: string, value: boolean): void {
    if (!value) {
      if (!this.state.hiddenRelationshipTypes.includes(relType)) {
        this.setState({
          hiddenRelationshipTypes: [
            ...this.state.hiddenRelationshipTypes,
            relType
          ]
        })
        log('hide ' + relType)
      }
    } else {
      const index = this.state.hiddenRelationshipTypes.indexOf(relType)
      if (index >= 0) {
        this.setState({
          hiddenRelationshipTypes: [
            ...this.state.hiddenRelationshipTypes.slice(0, index),
            ...this.state.hiddenRelationshipTypes.slice(index + 1)
          ]
        })
      }
      log('show ' + relType)
    }
  }

  getNodeNeighbours(node: any, currentNeighbours: any, callback: any) {
    if (currentNeighbours.length > this.props.maxNeighbours) {
      callback(null, { nodes: [], relationships: [] })
    }
    this.props.getNeighbours(node.id, currentNeighbours).then(
      (result: any) => {
        const nodes = result.nodes
        if (
          result.count >
          this.props.maxNeighbours - currentNeighbours.length
        ) {
          this.setState({
            selectedItem: {
              type: 'status-item',
              item: `Rendering was limited to ${
                this.props.maxNeighbours
              } of the node's total ${result.count +
                currentNeighbours.length} neighbours due to browser config maxNeighbours.`
            }
          })
        }
        callback(null, { nodes: nodes, relationships: result.relationships })
      },
      () => {
        callback(null, { nodes: [], relationships: [] })
      }
    )
  }

  getVarWriteNeighbours(node: any, currentNeighbours: any, callback: any) {
    if (currentNeighbours.length > this.props.maxNeighbours) {
      callback(null, { nodes: [], relationships: [] })
    }
    this.props.getVarWriteNeighbours(node.id, currentNeighbours).then(
      (result: any) => {
        const nodes = result.nodes
        if (
          result.count >
          this.props.maxNeighbours - currentNeighbours.length
        ) {
          this.setState({
            selectedItem: {
              type: 'status-item',
              item: `Rendering was limited to ${
                this.props.maxNeighbours
              } of the node's total ${result.count +
                currentNeighbours.length} neighbours due to browser config maxNeighbours.`
            }
          })
        }
        callback(null, { nodes: nodes, relationships: result.relationships })
      },
      () => {
        callback(null, { nodes: [], relationships: [] })
      }
    )
  }

  getEdgeTypeNeighbours(
    node: any,
    edgeType: any,
    currentNeighbours: any,
    callback: any
  ) {
    if (currentNeighbours.length > this.props.maxNeighbours) {
      callback(null, { nodes: [], relationships: [] })
    }
    this.props.getEdgeTypeNeighbours(node.id, edgeType, currentNeighbours).then(
      (result: any) => {
        const nodes = result.nodes
        if (
          result.count >
          this.props.maxNeighbours - currentNeighbours.length
        ) {
          this.setState({
            selectedItem: {
              type: 'status-item',
              item: `Rendering was limited to ${
                this.props.maxNeighbours
              } of the node's total ${result.count +
                currentNeighbours.length} neighbours due to browser config maxNeighbours.`
            }
          })
        }
        callback(null, { nodes: nodes, relationships: result.relationships })
      },
      () => {
        callback(null, { nodes: [], relationships: [] })
      }
    )
  }

  getHiddenEdgeTypes(node: any, currentNeighbours: any, callback: any) {
    if (currentNeighbours.length > this.props.maxNeighbours) {
      callback(null, { nodes: [], relationships: [] })
    }
    this.props.getHiddenEdgesTypes(node.id, currentNeighbours).then(
      (result: any) => {
        node.hiddenEdgeTypes = result
        // if (
        //   result.count >
        //   this.props.maxNeighbours - currentNeighbours.length
        // ) {
        //   this.setState({
        //     selectedItem: {
        //       type: 'status-item',
        //       item: `Rendering was limited to ${
        //         this.props.maxNeighbours
        //       } of the node's total ${result.count +
        //         currentNeighbours.length} neighbours due to browser config maxNeighbours.`
        //     }
        //   })
        // }
        callback(null)
      },
      () => {
        callback(null)
      }
    )
  }

  onItemMouseOver(item: VizItem): void {
    this.setHoveredItem(item)
  }

  mounted = true
  setHoveredItem = debounce((hoveredItem: VizItem) => {
    if (this.mounted) {
      this.setState({ hoveredItem })
    }
  }, 200)

  onItemSelect(selectedItem: VizItem): void {
    this.setState({ selectedItem })
  }

  onGraphModelChange(stats: GraphStats) {
    this.setState({ stats })
    this.props.updateStyle(this.state.graphStyle.toSheet())
  }

  componentDidUpdate(prevProps: any) {
    if (!deepEquals(prevProps.graphStyleData, this.props.graphStyleData)) {
      if (this.props.graphStyleData) {
        const rebasedStyle = deepmerge(
          this.defaultStyle,
          this.props.graphStyleData
        )
        this.state.graphStyle.loadRules(rebasedStyle)
        this.setState({
          graphStyle: this.state.graphStyle,
          styleVersion: this.state.styleVersion + 1
        })
      } else {
        this.state.graphStyle.resetToDefault()
        this.setState(
          { graphStyle: this.state.graphStyle, freezeLegend: true },
          () => {
            this.setState({ freezeLegend: false })
            this.props.updateStyle(this.state.graphStyle.toSheet())
          }
        )
      }
    }
  }

  render() {
    // This is a workaround to make the style reset to the same colors as when starting the browser with an empty style
    // If the legend component has the style it will ask the neoGraphStyle object for styling before the graph component,
    // and also doing this in a different order from the graph. This leads to different default colors being assigned to different labels.
    const graphStyle = this.state.freezeLegend
      ? neoGraphStyle()
      : this.state.graphStyle

    const style: { [key: string]: string } = {}
    this.props.palette.colors.forEach((color, i) => {
      style[`--graph-color${i}`] = color
    })
    this.props.palette.borderColors.forEach((color, i) => {
      style[`--border-color${i}`] = color
    })
    this.props.palette.conditionColors.forEach((color, i) => {
      style[`--condition-color${i}`] = color
    })
    style['--graph-internal-text-color'] = this.props.palette.textColor
    style['--graph-condition-text-color'] = this.props.palette.condColor

    return (
      <StyledFullSizeContainer id="svg-vis" style={style}>
        <GraphComponent
          stats={this.state.stats}
          fullscreen={this.props.fullscreen}
          frameHeight={this.props.frameHeight}
          relationships={this.state.relationships}
          nodes={this.state.nodes}
          getNodeNeighbours={this.getNodeNeighbours.bind(this)}
          getVarWriteNeighbours={this.getVarWriteNeighbours.bind(this)}
          getEdgeTypeNeighbours={this.getEdgeTypeNeighbours.bind(this)}
          getHiddenEdgeTypes={this.getHiddenEdgeTypes.bind(this)}
          onItemMouseOver={this.onItemMouseOver.bind(this)}
          onItemSelect={this.onItemSelect.bind(this)}
          graphStyle={graphStyle}
          styleVersion={this.state.styleVersion} // cheap way for child to check style updates
          onGraphModelChange={this.onGraphModelChange.bind(this)}
          assignVisElement={this.props.assignVisElement}
          getAutoCompleteCallback={this.props.getAutoCompleteCallback}
          setGraph={this.props.setGraph}
          offset={
            (this.state.nodePropertiesExpanded ? this.state.width : 0) + 4
          }
          hiddenNodeLabels={this.state.hiddenNodeLabels}
          hiddenRelTypes={this.state.hiddenRelationshipTypes}
          setPatternSelectorVisible={(value: boolean) => {
            this.setState({ patternSelectorVisible: value })
          }}
          updateStyle={this.props.updateStyle}
        />
        <NodeInspectorPanel
          frameHeight={this.props.frameHeight}
          graphStyle={graphStyle}
          hasTruncatedFields={this.props.hasTruncatedFields}
          hoveredItem={this.state.hoveredItem}
          selectedItem={this.state.selectedItem}
          stats={this.state.stats}
          width={this.state.width}
          setWidth={(width: number) =>
            this.setState({ width: Math.max(panelMinWidth, width) })
          }
          expanded={this.state.nodePropertiesExpanded}
          toggleExpanded={() => {
            const { nodePropertiesExpanded } = this.state
            this.props.setNodePropertiesExpandedByDefault(
              !nodePropertiesExpanded
            )
            this.setState({ nodePropertiesExpanded: !nodePropertiesExpanded })
          }}
          hiddenNodeLabels={this.state.hiddenNodeLabels}
          hiddenRelationshipTypes={this.state.hiddenRelationshipTypes}
          setNodeLabelVisibility={this.setNodeLabelVisibility.bind(this)}
          setRelTypeVisibility={this.setRelTypeVisibility.bind(this)}
          patternSelectorVisible={this.state.patternSelectorVisible}
          updateStyle={this.props.updateStyle}
        />
      </StyledFullSizeContainer>
    )
  }

  componentWillUnmount(): void {
    this.mounted = false
  }
}

export const ExplorerComponent: ConnectedComponent<any, any> = connect(
  (state: any) => ({
    palette: state.palette
  })
)(ExplorerLocal)

export const Explorer: ConnectedComponent<
  typeof ExplorerComponent,
  ExplorerComponentProps
> = connect(
  (state: GlobalState) => ({
    nodePropertiesExpandedByDefault: getNodePropertiesExpandedByDefault(state)
  }),
  (dispatch: Dispatch<Action>) => ({
    setNodePropertiesExpandedByDefault: (expandedByDefault: boolean) =>
      dispatch(setNodePropertiesExpandedByDefault(expandedByDefault))
  })
)(ExplorerComponent)

export default Explorer
