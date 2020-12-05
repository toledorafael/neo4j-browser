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

import React, { Component } from 'react'
import { createGraph, mapRelationships, getGraphStats } from '../mapper'
import { GraphEventHandler } from '../GraphEventHandler'
import '../lib/visualization/index'
import { dim } from 'browser-styles/constants'
import {
  StyledZoomHolder,
  StyledSvgWrapper,
  StyledZoomButton,
  StyledSliderHolder,
  StyleToggleGroupMarksButton,
  StyleInputDiv,
  StyleSubmitButton,
  StyleTextArea
} from './styled'
import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'
import graphView from '../lib/visualization/components/graphView'

export class GraphComponent extends Component {
  state = {
    zoomInLimitReached: true,
    zoomOutLimitReached: false,
    shouldResize: false,
    showGroupMarks: false,
    scaleFactor: 1,
    featureExpression: 'Enter feature expression...'
  }

  graphInit (el) {
    this.svgElement = el
  }

  zoomInClicked (el) {
    let limits = this.graphView.zoomIn(el)
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  zoomOutClicked (el) {
    let limits = this.graphView.zoomOut(el)
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  getVisualAreaHeight () {
    return this.props.frameHeight && this.props.fullscreen
      ? this.props.frameHeight -
          (dim.frameStatusbarHeight + dim.frameTitlebarHeight * 2)
      : this.props.frameHeight - dim.frameStatusbarHeight ||
          this.svgElement.parentNode.offsetHeight
  }

  componentDidMount () {
    if (this.svgElement != null) {
      this.initGraphView()
      this.graph && this.props.setGraph && this.props.setGraph(this.graph)
      this.props.getAutoCompleteCallback &&
        this.props.getAutoCompleteCallback(this.addInternalRelationships)
      this.props.assignVisElement &&
        this.props.assignVisElement(this.svgElement, this.graphView)
    }
  }

  initGraphView () {
    if (!this.graphView) {
      let NeoConstructor = graphView
      let measureSize = () => {
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
        this.props.graphStyle
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
      this.graphView.resize()
      this.graphView.update(this.state.showGroupMarks)
    }
  }

  addInternalRelationships = internalRelationships => {
    if (this.graph) {
      this.graph.addInternalRelationships(
        mapRelationships(internalRelationships, this.graph)
      )
      let stats = getGraphStats(this.graph)
      let conditionTypes
      if (this.state.conditionTypes) {
        conditionTypes = this.state.conditionTypes
      } else {
        conditionTypes = []
      }
      let newstats = {
        labels: stats.labels,
        relTypes: stats.relTypes,
        conditionTypes: conditionTypes
      }
      // this.props.onGraphModelChange(getGraphStats(this.graph))
      this.props.onGraphModelChange(newstats)
      this.graphView.update(this.state.showGroupMarks)
      this.graphEH.onItemMouseOut()
    }
  }

  componentWillReceiveProps (props) {
    if (props.styleVersion !== this.props.styleVersion) {
      this.graphView.update(this.state.showGroupMarks)
    }
    if (
      this.props.fullscreen !== props.fullscreen ||
      this.props.frameHeight !== props.frameHeight
    ) {
      this.setState({ shouldResize: true })
    } else {
      this.setState({ shouldResize: false })
    }
  }

  componentDidUpdate () {
    if (this.state.shouldResize) {
      this.graphView.resize()
    }
  }

  zoomButtons () {
    if (this.props.fullscreen) {
      return (
        <StyledZoomHolder>
          <StyledZoomButton
            className={
              this.state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'
            }
            onClick={this.zoomInClicked.bind(this)}
          >
            <ZoomInIcon />
          </StyledZoomButton>
          <StyledZoomButton
            className={
              this.state.zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'
            }
            onClick={this.zoomOutClicked.bind(this)}
          >
            <ZoomOutIcon />
          </StyledZoomButton>
        </StyledZoomHolder>
      )
    }
    return null
  }

  adjustGroupsScale (event) {
    this.setState({ scaleFactor: event.target.value })
    this.graphView.updateScaleFactor(event.target.value)
  }

  toggleGroupMarks (event) {
    const toggleGroupMarks = !this.state.showGroupMarks
    this.setState({ showGroupMarks: toggleGroupMarks })
    this.graphView.displayGroupMarks(toggleGroupMarks)
  }

  inputSlider () {
    if (this.props.fullscreen) {
      return (
        <StyledSliderHolder>
          <input
            type='range'
            id='scaleFactorLabel'
            min='1'
            max='3'
            value={this.state.scaleFactor}
            step='.1'
            onChange={this.adjustGroupsScale.bind(this)}
          />
        </StyledSliderHolder>
      )
    }
  }

  inputToggle () {
    if (this.props.fullscreen) {
      return (
        <StyleToggleGroupMarksButton onClick={this.toggleGroupMarks.bind(this)}>
          Toggle File Marks
        </StyleToggleGroupMarksButton>
      )
    }
  }

  updateFeatureExpressionState (event) {
    /* if(this.state.conditionTypes) {
      this.setState(prevState => ({
        conditionTypes: [...prevState.conditionTypes, event.target.value]
      }))
    } else {
      this.setState({conditionTypes: [event.target.value]})
    } */
    this.setState({ newConditionType: event.target.value })
    this.setState({ featureExpression: event.target.value })
  }

  handleSubmit (event) {
    if (this.state.conditionTypes) {
      if (
        this.state.conditionTypes.indexOf(this.state.newConditionType) == -1
      ) {
        this.setState(prevState => ({
          conditionTypes: [
            ...prevState.conditionTypes,
            this.state.newConditionType
          ]
        }))
      }
    } else {
      this.setState({ conditionTypes: [this.state.newConditionType] })
    }
    let stats = getGraphStats(this.graph)
    let conditionTypes
    if (this.state.conditionTypes) {
      conditionTypes = this.state.conditionTypes
    } else {
      conditionTypes = []
    }
    let newstats = {
      labels: stats.labels,
      relTypes: stats.relTypes,
      conditionTypes: conditionTypes
    }
    // this.props.onGraphModelChange(getGraphStats(this.graph))
    this.props.onGraphModelChange(newstats)

    // This command triggers the highlighting of edges based on a feature expression
    // submitted by the user. Since we are using the button for a different purpose
    // and the highlighting will be done in a different way, this feature should be refactored.
    // this.graphView.highlightPresenceConditions(this.state.featureExpression)
  }

  checkPropertyList (propertyList, propertyName) {
    if (propertyList.length > 0) {
      for (let index = 0; index < propertyList.length; index++) {
        const element = propertyList[index]
        if (element.key === propertyName) return true
      }
      return false
    }
  }

  inputFeatureExpression () {
    if (this.props.fullscreen) {
      if (
        this.checkPropertyList(
          this.graph._relationships[0].propertyList,
          'condition'
        )
      ) {
        // TODO: Change the property name to the property name of the PC's in the graph Ramy has submitted
        return (
          // <StyleInputForm onSubmit={this.handleSubmit.bind(this)}>
          <StyleInputDiv>
            <StyleTextArea
              value={this.state.value}
              placeholder='Feature expression'
              onChange={this.updateFeatureExpressionState.bind(this)}
            />
            <StyleSubmitButton onClick={this.handleSubmit.bind(this)}>
              Filter
            </StyleSubmitButton>
          </StyleInputDiv>
        )
      }
    }
  }

  render () {
    return (
      <StyledSvgWrapper>
        <svg className='neod3viz' ref={this.graphInit.bind(this)} />
        {this.inputSlider()}
        {this.zoomButtons()}
        {/* {this.inputToggle()} */}
        {this.inputFeatureExpression()}
      </StyledSvgWrapper>
    )
  }
}
