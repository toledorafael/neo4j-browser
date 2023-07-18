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
import { createGraph, mapRelationships, getGraphStats } from '../mapper'
import { GraphEventHandler } from '../GraphEventHandler'
import '../lib/visualization/index'
import { dim } from 'browser-styles/constants'
import { StyledZoomHolder, StyledSvgWrapper, StyledZoomButton } from './styled'
import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'
import graphView from '../lib/visualization/components/graphView'

type State = any

import { connect } from 'react-redux'
import { GlobalState } from 'shared/globalState'
import { LayoutState } from 'shared/modules/layout/layout'

interface RelationshipLayout {
  arrowLayout: 'stripes' | 'segments' | 'separate'
  globalShape?: boolean
  globalPattern?: boolean
  globalText?: boolean
  textAbove?: boolean
  localPattern?: boolean
}

export const relationshipLayouts: Record<string, RelationshipLayout> = {
  stripes: {
    arrowLayout: 'stripes',
    globalShape: true
  },
  'stripes-text': {
    arrowLayout: 'stripes',
    globalText: true
  },
  'segments-shape': {
    arrowLayout: 'segments',
    globalShape: true,
    textAbove: true
  },
  'segments-text': {
    arrowLayout: 'segments',
    textAbove: true,
    globalText: true
  },
  'segments-pattern': {
    arrowLayout: 'segments',
    globalPattern: true,
    textAbove: true
  },
  separate: {
    arrowLayout: 'separate',
    globalShape: true,
    textAbove: true
  },
  'separate-text': {
    arrowLayout: 'separate',
    textAbove: true,
    globalText: true
  },
  'segments-local-pattern': {
    arrowLayout: 'segments',
    globalShape: true,
    localPattern: true,
    textAbove: true
  },
  'segments-local-pattern-text': {
    arrowLayout: 'segments',
    localPattern: true,
    textAbove: true,
    globalText: true
  }
}

export interface FeatureItem {
  display: string
  items: {
    display: string
    id: keyof typeof relationshipLayouts
  }[]
  example: string
}

export const featureItems: FeatureItem[] = [
  {
    display: 'Colour segments',
    items: [
      {
        id: 'segments-text',
        display: 'Text'
      },
      {
        id: 'segments-shape',
        display: 'Symbols'
      }
      // {
      //   id: 'segments-pattern',
      //   display: 'Pattern'
      // }
    ],
    example: './assets/images/layout-examples/segments.png'
  },
  {
    display: 'Colour stripes',
    items: [
      {
        id: 'stripes-text',
        display: 'Text'
      },
      {
        id: 'stripes',
        display: 'Symbols'
      }
    ],
    example: './assets/images/layout-examples/stripes.png'
  },
  {
    display: 'Individual links',
    items: [
      {
        id: 'separate-text',
        display: 'Text'
      },
      {
        id: 'separate',
        display: 'Symbols'
      }
    ],
    example: './assets/images/layout-examples/links.png'
  },
  {
    display: 'Colour+Shape',
    items: [
      {
        id: 'segments-local-pattern-text',
        display: 'Text'
      },
      {
        id: 'segments-local-pattern',
        display: 'Symbols'
      }
    ],
    example: ''
  }
]

export class Graph extends Component<any, State, { layout: LayoutState }> {
  graph: any
  graphEH: any
  graphView: any
  svgElement: any
  state = {
    start: Date.now(),
    zoomInLimitReached: false,
    zoomOutLimitReached: false,
    shouldResize: false,
    scaleFactor: 1,
    newConditionType: '',
    showLoadingOverlay: false,
    showFilters: true
  }

  graphInit(el: any) {
    this.svgElement = el
    if (this.svgElement && !this.svgElement.__graphStyle) {
      this.svgElement.__graphStyle =
        relationshipLayouts[featureItems[0].items[0].id]
    }
    if (this.svgElement && !this.svgElement.__uid) {
      this.svgElement.__uid = Math.floor(Math.random() * Math.pow(2, 52))
    }
  }

  zoomInClicked(el: any) {
    const limits = this.graphView.zoomIn(el)
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  zoomOutClicked(el: any) {
    const limits = this.graphView.zoomOut(el)
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  getVisualAreaHeight() {
    return this.props.frameHeight && this.props.fullscreen
      ? this.props.frameHeight -
          (dim.frameStatusbarHeight + dim.frameTitlebarHeight * 2)
      : this.props.frameHeight - dim.frameStatusbarHeight ||
          this.svgElement.parentNode.offsetHeight
  }

  componentDidMount() {
    if (this.svgElement != null) {
      this.initGraphView()
      this.graph && this.props.setGraph && this.props.setGraph(this.graph)
      if (this.svgElement.__data__) {
        this.svgElement.__data__.uid = this.graph.uid
      } else {
        this.svgElement.__data__ = { uid: this.graph.uid }
      }
      this.props.getAutoCompleteCallback &&
        this.props.getAutoCompleteCallback(this.addInternalRelationships)
      this.props.assignVisElement &&
        this.props.assignVisElement(this.svgElement, this.graphView)
      if (Object.keys(this.graph.nodeMap).length > 50) {
        this.setState({
          showLoadingOverlay: true
        })
      }
    }
  }

  initGraphView() {
    if (!this.graphView) {
      const NeoConstructor = graphView
      const measureSize = () => {
        return {
          width: this.svgElement.offsetWidth,
          height: this.getVisualAreaHeight()
        }
      }
      this.graph = createGraph(this.props.nodes, this.props.relationships)
      this.graphView = new NeoConstructor(
        this.svgElement,
        measureSize,
        this.graph,
        this.props.graphStyle,
        this.props.hiddenNodeLabels,
        this.props.hiddenRelTypes
      )
      this.graphEH = new GraphEventHandler(
        this.graph,
        this.graphView,
        this.props.getNodeNeighbours,
        this.props.onItemMouseOver,
        this.props.onItemSelect,
        this.props.onGraphModelChange
      )
      this.graphEH.bindEventHandlers()
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.on('initialLayoutFinished', () =>
        this.setState({ showLoadingOverlay: false })
      )
      this.graphView.resize()
      this.graphView.update()
    }
  }

  addInternalRelationships = (internalRelationships: any) => {
    if (this.graph) {
      this.graph.addInternalRelationships(
        mapRelationships(internalRelationships, this.graph)
      )
      const stats = getGraphStats(this.graph)
      const newstats = {
        labels: stats.labels,
        relTypes: stats.relTypes
      }

      this.props.onGraphModelChange(newstats)
      this.graphView.update()
      this.graphEH.onItemMouseOut()
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.styleVersion !== this.props.styleVersion) {
      this.graphView.update()
    }
    if (
      this.props.fullscreen !== prevProps.fullscreen ||
      this.props.frameHeight !== prevProps.frameHeight
    ) {
      this.graphView.resize()
    }
    if (prevProps.hiddenNodeLabels !== this.props.hiddenNodeLabels) {
      this.graphView.localStyle.hiddenLabels = this.props.hiddenNodeLabels
      this.graphView.update()
    }
    if (prevProps.hiddenRelTypes !== this.props.hiddenRelTypes) {
      this.graphView.localStyle.hiddenRelTypes = this.props.hiddenRelTypes
      this.graphView.update()
    }

    // Update the layout type
    if (prevProps.layout.items[0].id !== this.props.layout.items[0].id) {
      this.svgElement.__graphStyle =
        relationshipLayouts[this.props.layout.items[0].id]
      this.graphView.update()
    }
  }

  zoomButtons() {
    return (
      <StyledZoomHolder
        offset={this.props.offset}
        fullscreen={this.props.fullscreen}
      >
        <StyledZoomButton
          className={
            this.state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'
          }
          onClick={this.zoomInClicked.bind(this)}
        >
          <ZoomInIcon regulateSize={this.props.fullscreen ? 2 : 1} />
        </StyledZoomButton>
        <StyledZoomButton
          className={
            this.state.zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'
          }
          onClick={this.zoomOutClicked.bind(this)}
        >
          <ZoomOutIcon regulateSize={this.props.fullscreen ? 2 : 1} />
        </StyledZoomButton>
      </StyledZoomHolder>
    )
  }

  /*
  handleToggleStripes() {
    if (this.svgElement) {
      this.svgElement.__graphStyle.toggleStripes = !this.svgElement.__graphStyle
        .toggleStripes
    }
    this.graphView.update()
  }

  checkPropertyList(propertyList: any[], propertyName: string) {
    if (propertyList.length > 0) {
      for (let index = 0; index < propertyList.length; index++) {
        const element = propertyList[index]
        if (element.key === propertyName) return true
      }
      return false
    }
    return false
  }

  inputFeatureExpression() {
    if (this.props.fullscreen && this.state.showFilters) {
      // TODO: Add condition to only show PC form if the user is interested in learn about that
      // TODO: Change the property name to the property name of the PC's in the graph Ramy has submitted
    }
    return null
  }
  */

  render() {
    return (
      <StyledSvgWrapper>
        {this.state.showLoadingOverlay && (
          <div
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F9FCFF',
              lineHeight: '2em'
            }}
          >
            <div>Loading layout</div>
            <div>Animations have been turned off for large graphs</div>
          </div>
        )}
        <svg className="neod3viz" ref={this.graphInit.bind(this)} />
        {/* {this.inputSlider()} */}
        {this.zoomButtons()}
        {/* {this.inputToggle()} */}
        {/* this.inputFeatureExpression() */}
        {/* this.inputToggleStripes() */}
        {/* this.legend() */}
      </StyledSvgWrapper>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  conditionTypes: state.filters,
  layout: state.layout
})

export const GraphComponent = connect(mapStateToProps)(Graph)
