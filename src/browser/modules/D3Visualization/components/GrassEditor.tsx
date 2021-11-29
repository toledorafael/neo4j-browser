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
import { connect, ConnectedComponent } from 'react-redux'
import neoGraphStyle from '../graphStyle'
import {
  StyledPickerSelector,
  StyledTokenRelationshipType,
  StyledInlineList,
  StyledInlineListItem,
  StyledLabelToken,
  StyledPickerListItem,
  StyledCircleSelector,
  StyledCaptionSelector,
  StyledInlineListStylePicker
} from './styled'
import * as actions from 'shared/modules/grass/grassDuck'
import { toKeyString } from 'shared/services/utils'
import { GraphStyle } from './OverviewPane'
import { GlobalState } from 'shared/globalState'
import { Action, Dispatch } from 'redux'
import PatternSelector from './PatternSelector'
import { removeFilterAction } from 'shared/modules/filters/filters'
import { PaletteState } from 'shared/modules/palette/palette'

type GrassEditorProps = {
  graphStyleData?: any
  graphStyle?: GraphStyle
  update?: any
  selectedLabel?: { label: string; propertyKeys: string[] }
  selectedRelType?: { relType: string; propertyKeys: string[] }
  selectedCondition?: { condition: string }
  frameHeight: number
  visible?: boolean
  setVisibility?: (value: boolean) => void
}

export class GrassEditorComponent extends Component<
  GrassEditorProps & {
    palette: PaletteState
    removeFilter: (value: string) => void
  }
> {
  graphStyle: any
  nodeDisplaySizes: any
  picker: any
  widths: any
  constructor(props: any) {
    super(props)
    this.graphStyle = neoGraphStyle()
    if (this.props.graphStyleData) {
      this.graphStyle.loadRules(this.props.graphStyleData)
    }
    this.nodeDisplaySizes = []
    this.widths = []
    for (let index = 0; index < 10; index++) {
      this.nodeDisplaySizes.push(`${12 + 2 * index}px`)
      this.widths.push(`${5 + 3 * index}px`)
    }
  }

  sizeLessThan(size1: any, size2: any) {
    const size1Numerical = size1 ? size1.replace('px', '') + 0 : 0
    const size2Numerical = size1 ? size2.replace('px', '') + 0 : 0
    return size1Numerical <= size2Numerical
  }

  updateStyle(selector: any, styleProp: any) {
    // This function updates Style rules.
    this.graphStyle.changeForSelector(selector, styleProp)
    // In the current implementation of condition style selector,
    // Instead of calling the function in line  358
    // It drops my newly added rule for conditions and stops at the end of line 63
    this.props.update(this.graphStyle.toSheet())
  }

  circleSelector(
    styleProps: any,
    styleProvider: any,
    activeProvider: any,
    className: any,
    selector: any,
    textProvider = (_: any) => {
      return ''
    }
  ) {
    return styleProps.map((styleProp: any, i: any) => {
      const onClick = () => {
        this.updateStyle(selector, styleProp) // onClick of circleSelector, goes to line 58. A click adds a style rule
      }
      const style = styleProvider(styleProp, i)
      const text = textProvider(styleProp)
      const active = activeProvider(styleProp)
      return (
        <StyledPickerListItem
          className={className}
          key={toKeyString('circle' + i)}
        >
          <StyledCircleSelector
            className={active ? 'active' : ''}
            style={style}
            onClick={onClick}
          >
            {text}
          </StyledCircleSelector>
        </StyledPickerListItem>
      )
    })
  }

  colorPicker(selector: any, styleForLabel: any) {
    return (
      <StyledInlineListItem key="color-picker">
        <StyledInlineList>
          <StyledInlineListItem>Color:</StyledInlineListItem>
          {this.circleSelector(
            this.graphStyle.defaultColors(),
            (color: any) => {
              return { backgroundColor: color.color }
            },
            (color: any) => {
              return color.color === styleForLabel.get('color')
            },
            'color-picker-item',
            selector
          )}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  sizePicker(selector: any, styleForLabel: any) {
    return (
      <StyledInlineListItem key="size-picker">
        <StyledInlineList data-testid="size-picker">
          <StyledInlineListItem>Size:</StyledInlineListItem>
          {this.circleSelector(
            this.graphStyle.defaultSizes(),
            (_size: any, index: any) => {
              return {
                width: this.nodeDisplaySizes[index],
                height: this.nodeDisplaySizes[index]
              }
            },
            (size: any) => {
              return this.sizeLessThan(
                size.diameter,
                styleForLabel.get('diameter')
              )
            },
            'size-picker-item',
            selector
          )}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  widthPicker(selector: any, styleForItem: any) {
    const widthSelectors = this.graphStyle
      .defaultArrayWidths()
      .map((widthValue: any, i: any) => {
        const onClick = () => {
          this.updateStyle(selector, widthValue)
        }
        const style = { width: this.widths[i] }
        const active =
          styleForItem.get('shaft-width') === widthValue['shaft-width']
        return (
          <StyledPickerListItem key={toKeyString('width' + i)}>
            <StyledPickerSelector
              className={active ? 'active' : ''}
              style={style}
              onClick={onClick}
            />
          </StyledPickerListItem>
        )
      })
    return (
      <StyledInlineListItem key="width-picker">
        <StyledInlineList>
          <StyledInlineListItem>Line width:</StyledInlineListItem>
          {widthSelectors}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  iconPicker(selector: any) {
    return (
      <li key="icon-picker">
        Icon:
        <ul>
          {this.picker(
            this.graphStyle.defaultIconCodes(),
            () => {
              return { fontFamily: 'streamline' }
            },
            'icon-picker-item',
            selector,
            (iconCode: any) => {
              return iconCode['icon-code']
            }
          )}
        </ul>
      </li>
    )
  }

  captionPicker(
    selector: any,
    styleForItem: any,
    propertyKeys: any,
    showTypeSelector = false
  ) {
    const captionSelector = (displayCaption: string, captionToSave: string) => {
      const onClick = () => {
        this.updateStyle(selector, { caption: captionToSave })
      }
      const active = styleForItem.props.caption === captionToSave
      return (
        <StyledPickerListItem key={toKeyString('caption' + displayCaption)}>
          <StyledCaptionSelector
            className={active ? 'active' : ''}
            onClick={onClick}
          >
            {displayCaption}
          </StyledCaptionSelector>
        </StyledPickerListItem>
      )
    }
    const captionSelectors = propertyKeys.map((propKey: any) => {
      return captionSelector(propKey, `{${propKey}}`)
    })
    let typeCaptionSelector = null
    if (showTypeSelector) {
      typeCaptionSelector = captionSelector('<type>', '<type>')
    }
    return (
      <StyledInlineListItem key="caption-picker">
        <StyledInlineList>
          <StyledInlineListItem>Caption:</StyledInlineListItem>
          {captionSelector('<id>', '<id>')}
          {typeCaptionSelector}
          {captionSelectors}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  dashPicker(selector: any, _styleForItem: any) {
    return (
      <span>
        {/* <input
          type='text'
          value={styleForItem.get('pattern') || ''}
          onChange={e => {
            this.updateStyle(selector, { pattern: e.target.value })
          }}
        /> */}
        <PatternSelector
          patterns={[
            '',
            'dashes 1',
            'dashes 3',
            'dashes 3 1',
            'dashes 1 3',
            'dashes 1 1 3 1',
            'dashes 1 1 3 1 1 1'
          ]}
          selectPattern={(pattern: string) => {
            this.updateStyle(selector, { pattern })
          }}
        />
      </span>
    )
  }

  stylePicker() {
    // Based on what type of graph components is selected, we add applicable style pickers
    let pickers
    let title
    let showVisibleToggle
    let deleteFilterButton = null
    const { visible } = this.props

    if (this.props.selectedLabel) {
      // If selected components are nodes
      const labelList =
        this.props.selectedLabel.label !== '*'
          ? [this.props.selectedLabel.label]
          : []
      const styleForLabel = this.graphStyle.forNode({ labels: labelList })
      const inlineStyle = {
        backgroundColor: styleForLabel.get('color'),
        color: styleForLabel.get('text-color-internal'),
        cursor: 'default'
      }
      pickers = [
        this.colorPicker(styleForLabel.selector, styleForLabel),
        this.sizePicker(styleForLabel.selector, styleForLabel),
        this.captionPicker(
          styleForLabel.selector,
          styleForLabel,
          this.props.selectedLabel.propertyKeys
        )
      ]
      title = (
        <StyledLabelToken style={inlineStyle}>
          {this.props.selectedLabel.label || '*'}
        </StyledLabelToken>
      )
      // visible = !this.props.hiddenNodeLabels.includes(
      //   this.props.selectedLabel.label
      // )
      showVisibleToggle = this.props.selectedLabel.label !== '*'
    } else if (this.props.selectedRelType) {
      // If selected components are relationships
      const relTypeSelector =
        this.props.selectedRelType.relType !== '*'
          ? { type: this.props.selectedRelType.relType }
          : {}
      const styleForRelType = this.graphStyle.forRelationship(relTypeSelector)
      const inlineStyle = {
        backgroundColor: styleForRelType.get('color'),
        color: styleForRelType.get('text-color-internal'),
        cursor: 'default'
      }
      pickers = [
        this.colorPicker(styleForRelType.selector, styleForRelType),
        this.widthPicker(styleForRelType.selector, styleForRelType),
        this.captionPicker(
          styleForRelType.selector,
          styleForRelType,
          this.props.selectedRelType.propertyKeys,
          true
        )
      ]
      title = (
        <StyledTokenRelationshipType style={inlineStyle}>
          {this.props.selectedRelType.relType || '*'}
        </StyledTokenRelationshipType>
      )
      // visible = !this.props.hiddenRelationshipTypes.includes(
      //   this.props.selectedRelType.relType
      // )
      showVisibleToggle = this.props.selectedRelType.relType !== '*'
    } else if (this.props.selectedCondition) {
      // If selected components are conditions
      const conditionSelector = this.props.selectedCondition.condition // conditionSelector is the string users submitted from the text input box
      // this.props.selectedCondition.relType !== '*'
      //   ? this.props.selectedCondition.condition
      //   : ''
      const styleForRelType = this.graphStyle.forCondition(conditionSelector) // See graphStyle.js
      const inlineStyle = {
        backgroundColor: styleForRelType.get('color'),
        color: styleForRelType.get('text-color-internal')
      }
      pickers = [
        this.colorPicker(styleForRelType.selector, styleForRelType),
        this.widthPicker(styleForRelType.selector, styleForRelType),
        this.dashPicker(styleForRelType.selector, styleForRelType)
        // this.captionPicker(
        //  styleForRelType.selector,
        //  styleForRelType,
        //  this.props.selectedCondition.,
        // true
        // )
      ]
      title = (
        <StyledTokenRelationshipType
          className="token token-relationship"
          style={inlineStyle}
        >
          {this.props.selectedCondition.condition || '*'}
        </StyledTokenRelationshipType>
      )
      deleteFilterButton = (
        <button
          onClick={() => {
            if (this.props.selectedCondition) {
              this.props.removeFilter(this.props.selectedCondition.condition)
            }
            this.graphStyle.destroySelector(styleForRelType.selector)
            this.props.update(this.graphStyle.toSheet())
          }}
        >
          Remove filter
        </button>
      )
    } else {
      return null
    }
    const visibleToggle = (
      <label>
        Visible:
        <input
          type="checkbox"
          checked={visible}
          onChange={e =>
            this.props.setVisibility &&
            this.props.setVisibility(e.target.checked)
          }
          // @ts-ignore accent-color not in current version of css-types
          style={{ marginLeft: '4px', accentColor: '#777777' }}
        />
      </label>
    )
    const style: { [key: string]: string } = {}
    this.props.palette.colors.forEach((color, i) => {
      style[`--graph-color${i}`] = color
    })
    this.props.palette.borderColors.forEach((color, i) => {
      style[`--border-color${i}`] = color
    })
    style['--graph-internal-text-color'] = this.props.palette.textColor
    return (
      <StyledInlineListStylePicker
        frameHeight={this.props.frameHeight}
        style={style}
      >
        {title}
        {showVisibleToggle && this.props.setVisibility && visibleToggle}
        {deleteFilterButton}
        {pickers}
      </StyledInlineListStylePicker>
    )
  }

  componentDidUpdate(prevProps: any) {
    if (
      this.props.graphStyleData &&
      prevProps.graphStyleData !== this.props.graphStyleData
    ) {
      this.graphStyle.loadRules(this.props.graphStyleData)
    }
  }

  render() {
    return this.stylePicker()
  }
}
const mapStateToProps = (state: GlobalState) => ({
  graphStyleData: actions.getGraphStyleData(state),
  meta: state.meta,
  palette: state.palette
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  update: (data: any) => {
    dispatch(actions.updateGraphStyleData(data))
  },
  removeFilter: (filter: string) => {
    dispatch(removeFilterAction(filter))
  }
})

export const GrassEditor: ConnectedComponent<
  typeof GrassEditorComponent,
  GrassEditorProps
> = connect(mapStateToProps, mapDispatchToProps)(GrassEditorComponent)
