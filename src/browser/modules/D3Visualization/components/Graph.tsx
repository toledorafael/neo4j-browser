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
  StyleTextArea,
  StyleRelationshipLayoutButton,
  StyleRelationshipLayoutButtonGroup,
  StyledGraphLegend,
  StyledLayoutPicker,
  StyledRelationshipLayoutHeader
} from './styled'
import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'
import graphView from '../lib/visualization/components/graphView'

import { getShapeDef } from '../lib/visualization/utils/shapes'
import { getPatternDashes } from '../lib/visualization/utils/pattern'
import { connect } from 'react-redux'
import { presetPaletteAction } from 'shared/modules/palette/palette'
import { addFilterAction } from 'shared/modules/filters/filters'

const relationshipLayouts = {
  stripes: {
    id: 'stripes',
    display: 'Stripes',
    arrowLayout: 'stripes',
    globalShape: true
  },
  'stripes-text': {
    arrowLayout: 'stripes',
    globalText: true
  },
  'segments-shape': {
    id: 'segments-shape',
    display: 'Segments (symbols)',
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
    id: 'segments-pattern',
    display: 'Segments (patterns)',
    arrowLayout: 'segments',
    globalPattern: true,
    textAbove: true
  },
  separate: {
    id: 'separate',
    display: 'Separate Links',
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
    id: 'segments-local-pattern',
    display: 'Patterns',
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

const featureItems = [
  {
    display: 'Segments',
    items: [
      {
        id: 'segments-text',
        display: 'Text'
      },
      {
        id: 'segments-shape',
        display: 'Symbols'
      },
      {
        id: 'segments-pattern',
        display: 'Pattern'
      }
    ]
  },
  {
    display: 'Stripes',
    items: [
      {
        id: 'stripes-text',
        display: 'Text'
      },
      {
        id: 'stripes',
        display: 'Symbols'
      }
    ]
  },
  {
    display: 'Separate Links',
    items: [
      {
        id: 'separate-text',
        display: 'Text'
      },
      {
        id: 'separate',
        display: 'Symbols'
      }
    ]
  },
  {
    display: 'Patterns',
    items: [
      {
        id: 'segments-local-pattern-text',
        display: 'Text'
      },
      {
        id: 'segments-local-pattern',
        display: 'Symbols'
      }
    ]
  }
]

export class Graph extends Component {
  state = {
    zoomInLimitReached: false,
    zoomOutLimitReached: false,
    shouldResize: false,
    showGroupMarks: false,
    featureExpressionLayout: featureItems[0],
    currentLayout: relationshipLayouts[featureItems[0].items[0].id],
    scaleFactor: 1,
    featureExpression: 'Enter feature expression...'
  }

  graphInit (el) {
    this.svgElement = el
    if (this.svgElement && !this.svgElement.__graphStyle) {
      this.svgElement.__graphStyle = this.state.currentLayout
      console.log(this.svgElement.__graphStyle)
    }
    if (this.svgElement && !this.svgElement.__uid) {
      this.svgElement.__uid = Math.floor(Math.random() * Math.pow(2, 52))
    }
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
      if (this.svgElement.__data__) {
        this.svgElement.__data__.uid = this.graph.uid
      } else {
        this.svgElement.__data__ = { uid: this.graph.uid }
      }
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
      this.graphView.resize()
      this.graphView.update(this.state.toggleStripes)
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
      this.graphView.update(this.state.toggleStripes)
      this.graphEH.onItemMouseOut()
    }
  }

  componentWillReceiveProps (props) {
    if (props.styleVersion !== this.props.styleVersion) {
      this.graphView.update(this.state.toggleStripes)
    }
    if (
      this.props.fullscreen !== props.fullscreen ||
      this.props.frameHeight !== props.frameHeight
    ) {
      this.setState({ shouldResize: true })
    } else {
      this.setState({ shouldResize: false })
    }
    if (props.hiddenNodeLabels !== this.props.hiddenNodeLabels) {
      this.graphView.localStyle.hiddenLabels = props.hiddenNodeLabels
      this.graphView.update(this.state.showGroupMarks)
    }
    if (props.hiddenRelTypes !== this.props.hiddenRelTypes) {
      this.graphView.localStyle.hiddenRelTypes = props.hiddenRelTypes
      this.graphView.update(this.state.showGroupMarks)
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

  // toggleGroupMarks (event) {
  //   const toggleGroupMarks = !this.state.toggleGroupMarks
  //   this.setState({ showGroupMarks: toggleGroupMarks })
  //   this.graphView.displayGroupMarks(toggleGroupMarks)
  // }

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

    // this.setState({ featureExpression: event.target.value })
  }

  handleSubmit (event) {
    if (this.state.newConditionType) {
      this.props.addFilterAction(this.state.newConditionType)
      let conditionTypes
      if (this.state.conditionTypes) {
        if (
          this.state.conditionTypes.indexOf(this.state.newConditionType) === -1
        ) {
          this.setState(prevState => ({
            conditionTypes: [
              ...prevState.conditionTypes,
              this.state.newConditionType
            ]
          }))
          conditionTypes = [
            ...this.state.conditionTypes,
            this.state.newConditionType
          ]
        } else {
          conditionTypes = [...this.state.conditionTypes]
        }
      } else {
        this.setState({ conditionTypes: [this.state.newConditionType] })
        conditionTypes = [this.state.newConditionType]
      }
      let stats = getGraphStats(this.graph)
      Array.from(document.querySelectorAll('textArea')).forEach(
        input => (input.value = '')
      )
      // if (!this.state.conditionTypes) {
      // conditionTypes = this.state.conditionTypes
      // } else {
      //   conditionTypes = []
      // }
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
  }

  handleToggleStripes (event) {
    // const newToggleStripes = !this.state.toggleStripes
    // this.setState({ toggleStripes: newToggleStripes })
    if (this.svgElement) {
      this.svgElement.__graphStyle.toggleStripes = !this.svgElement.__graphStyle
        .toggleStripes
    }
    // this.graphView.displayGroupMarks(toggleGroupMarks)
    // this.graphView.update(newToggleStripes)
    this.graphView.update()
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
      // TODO: Add condition to only show PC form if the user is interested in learn about that
      if (
        // this.checkPropertyList(
        //   this.graph._relationships[0].propertyList,
        //   'condition'
        // )
        true
      ) {
        // TODO: Change the property name to the property name of the PC's in the graph Ramy has submitted
        return (
          // <StyleInputForm onSubmit={this.handleSubmit.bind(this)}></StyleInputForm>
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

  inputToggleStripes () {
    if (this.props.fullscreen) {
      return (
        <StyledLayoutPicker>
          <StyleRelationshipLayoutButtonGroup>
            <StyledRelationshipLayoutHeader>
              Rel Type
            </StyledRelationshipLayoutHeader>
            {this.state.featureExpressionLayout.items.map(layout => (
              <StyleRelationshipLayoutButton
                className={
                  relationshipLayouts[layout.id] === this.state.currentLayout
                    ? 'selected'
                    : ''
                }
                key={layout.id}
                onClick={() => {
                  this.setState({
                    currentLayout: relationshipLayouts[layout.id]
                  })
                  this.svgElement &&
                    (this.svgElement.__graphStyle =
                      relationshipLayouts[layout.id])
                  this.graphView.update()
                }}
              >
                {layout.display}
              </StyleRelationshipLayoutButton>
            ))}
          </StyleRelationshipLayoutButtonGroup>
          <StyleRelationshipLayoutButtonGroup>
            <StyledRelationshipLayoutHeader>
              Feature Exp
            </StyledRelationshipLayoutHeader>
            {featureItems.map(layout => (
              <StyleRelationshipLayoutButton
                className={
                  layout === this.state.featureExpressionLayout
                    ? 'selected'
                    : ''
                }
                key={layout.id}
                onClick={() => {
                  if (this.state.featureExpressionLayout !== layout) {
                    this.setState({
                      featureExpressionLayout: layout,
                      currentLayout: relationshipLayouts[layout.items[0].id]
                    })
                    this.svgElement &&
                      (this.svgElement.__graphStyle =
                        relationshipLayouts[layout.items[0].id])
                    this.graphView.update()
                  }
                }}
              >
                {layout.display}
              </StyleRelationshipLayoutButton>
            ))}
          </StyleRelationshipLayoutButtonGroup>
        </StyledLayoutPicker>
      )
    }
  }

  legend () {
    return (
      <StyledGraphLegend>
        <button onClick={this.props.setLightTheme}>Light</button>
        <button onClick={this.props.setDarkTheme}>Dark</button>
        <button onClick={this.props.setLightCustomTheme}>Light 2</button>
        <button onClick={this.props.setDarkCustomTheme}>Dark 2</button>
        <table>
          <tr>
            <th colspan='2'>Edge Types</th>
          </tr>
          {this.props.stats.relTypes &&
            Object.keys(this.props.stats.relTypes).map(relType => {
              const style = this.props.graphStyle.forRelationship({
                type: relType
              })
              return relType === '*' ? null : (
                <tr>
                  <td>
                    <svg width='180' height='15' viewBox='0 -6 144 12'>
                      <line
                        x1='0'
                        x2='144'
                        y1='0'
                        y2='0'
                        stroke='#888'
                        strokeWidth='5'
                        strokeDasharray={
                          (this.state.currentLayout.globalPattern &&
                            getPatternDashes(style.get('pattern'), 5)) ||
                          ''
                        }
                      />
                      {this.state.currentLayout.globalShape && (
                        <path
                          d={getShapeDef(
                            style.get('shape'),
                            { x: 0, y: 0 },
                            11
                          )}
                          stroke='black'
                          strokeWidth='1'
                          fill='#ffffff77'
                        />
                      )}
                    </svg>
                  </td>
                  <td>
                    <div className='legend-label' title={relType}>
                      {relType}
                    </div>
                  </td>
                </tr>
              )
            })}
          <tr>
            <th colspan='2'>Feature Expressions</th>
          </tr>
          {this.props.conditionTypes &&
            this.props.conditionTypes.map(condType => {
              const style = this.props.graphStyle.forCondition(condType)
              if (style.get('color') === 'var(--graph-color0)') return null
              return (
                <tr>
                  <td>
                    <svg width='180' height='15' viewBox='0 -6 144 12'>
                      <line
                        x1='0'
                        x2='144'
                        y1='0'
                        y2='0'
                        stroke={style.get('color')}
                        strokeWidth='5'
                        strokeDasharray={
                          this.state.currentLayout.localPattern
                            ? getPatternDashes(style.get('pattern'), 5)
                            : ''
                        }
                      />
                    </svg>
                  </td>
                  <td>
                    <div className='legend-label' title={condType}>
                      {condType}
                    </div>
                  </td>
                </tr>
              )
            })}
        </table>
      </StyledGraphLegend>
    )
  }

  render () {
    return (
      // <div>
      <StyledSvgWrapper>
        <svg className='neod3viz' ref={this.graphInit.bind(this)} />
        {/* {this.inputSlider()} */}
        {this.zoomButtons()}
        {/* {this.inputToggle()} */}
        {this.inputFeatureExpression()}
        {this.inputToggleStripes()}
        {this.legend()}
      </StyledSvgWrapper>
      // </div>
    )
  }
}

export const GraphComponent = connect(
  state => ({
    conditionTypes: state.filters
  }),
  dispatch => ({
    setLightTheme: () => dispatch(presetPaletteAction('light')),
    setDarkTheme: () => dispatch(presetPaletteAction('dark')),
    setLightCustomTheme: () => dispatch(presetPaletteAction('lightCustom')),
    setDarkCustomTheme: () => dispatch(presetPaletteAction('darkCustom')),
    addFilterAction: filter => dispatch(addFilterAction(filter))
  })
)(Graph)
