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

import styled from 'styled-components'

export const legendRowHeight = 32
export const inspectorFooterContractedHeight = 22
export const panelMinWidth = 200

export const StyledSvgWrapper = styled.div`
  line-height: 0;
  height: 100%;
  position: relative;
  > svg {
    height: 100%;
    width: 100%;
    background-color: ${props => props.theme.frameBackground};
    .node {
      cursor: pointer;
      > .ring {
        fill: none;
        opacity: 0;
        stroke: #6ac6ff;
      }
      &.selected {
        > .ring {
          stroke: #fdcc59;
          opacity: 0.3;
        }
      }
      &.hidden {
        display: none;
      }
      &:hover {
        > .ring {
          stroke: #6ac6ff;
          opacity: 0.3;
        }
      }
    }
    .fileGroup {
      stroke-opacity: 1;
      pointer-events: none;
    }
    .legend rect {
      fill: white;
      stroke: black;
      opacity: 0.8;
    }

    circle.node {
      fill: lightsteelblue;
      stroke: #555;
      stroke-width: 3px;
    }
    circle.leaf {
      stroke: #fff;
      stroke-width: 1.5px;
    }
    circle.link-expanded {
      stroke: #555;
      stroke-width: 3px;
      stroke-dasharray: 2px 4px;
    }
    circle.helper {
      stroke-width: 0;
      fill: #333;
      opacity: 0.6;
    }
    circle.center-of-mass {
      fill: white;
      stroke: red;
      stroke-width: 5px;
    }
    path.hull {
      fill: lightsteelblue;
      fill-opacity: 0.3;
    }
    path.hlink {
      stroke: #333;
      stroke-opacity: 0.5;
      fill: none;
      pointer-events: none;
    }
    line.link {
      stroke: red;
      stroke-opacity: 0.7;
      pointer-events: none;
    }

    .relationship {
      > text {
        fill: ${props => props.theme.primaryText};
      }
      > .overlay {
        opacity: 0;
        fill: #6ac6ff;
      }
      &.selected {
        > .overlay {
          fill: #fdcc59;
          opacity: 0.3;
        }
      }
      &.hidden {
        display: none;
      }
      &:hover {
        > .overlay {
          fill: #6ac6ff;
          opacity: 0.3;
        }
      }
    }
    .remove_node {
      .expand_node {
        &:hover {
          border: 2px #000 solid;
        }
      }
    }
    .outline {
      cursor: pointer;
    }
    path {
      &.context-menu-item {
        stroke-width: 2px;
        fill: ${props => props.theme.primaryBackground};
      }
    }
    text {
      line-height: normal;
      &.context-menu-item {
        fill: #fff;
        text-anchor: middle;
        pointer-events: none;
        font-size: 14px;
      }
    }
    .context-menu-item {
      cursor: pointer;
      &:hover {
        fill: #b9b9b9;
        font-size: 14px;
      }
    }
    .context-menu-item-label {
      fill: rgb(12, 1, 1);
      text-anchor: left;
      pointer-events: none;
      text-align: left;
      font-size: 14px;
      font-family: Consolas;
      background: #ffffff;
      color: #313639;
      border: 1px solid #313639;
      border-radius: 8px;
    }

    .context-menu-item-labelbox {
      position: absolute;
      text-align: center;
      padding: 0.5rem;
      background: #ffffff;
      color: #313639;
      border: 1px solid #313639;
      border-radius: 8px;
      pointer-events: none;
      font-size: 1.3rem;
      width: 50px;
    }

    .context-menu-item-rect {
      pointer-events: none;
      fill: rgb(250, 224, 139);
    }
  }
`

export const StyledRowToggle = styled.div`
  float: right;
  display: block;
  width: 21px;
  height: 21px;
  line-height: 21px;
  text-align: center;
  cursor: pointer;
`

export const StyledInlineList = styled.ul`
  list-style: none;
  word-break: break-word;
`

export const StyledInlineListStylePicker = styled(StyledInlineList)<{
  frameHeight: number
}>`
  display: grid;
  overflow-y: auto;
  max-height: ${props => props.frameHeight - 75}px;
  background: ${props => props.theme.editorBackground};
  color: ${props => props.theme.primaryText};
  padding: 0.833em 1em;
`

export const StyledInlineListItem = styled.li`
  display: inline-block;
  padding-right: 5px;
`

export const StyledToken = styled(StyledInlineListItem)`
  display: inline-block;
  font-weight: bold;
  line-height: 1em;
  text-align: center;
  vertical-align: baseline;
  user-select: none;
  font-size: 12px;
  margin-right: 5px;
  cursor: pointer;
  margin-bottom: 3px;
`
export const StyledLabelToken = styled(StyledToken)`
  padding: 4px 7px 4px 9px;
  border-radius: 20px;
  word-break: break-all;
  margin-top: 4px;
  cursor: default;
`
export const StyledTokenRelationshipType = styled(StyledToken)`
  padding: 4px 7px 4px 5px;
  border-radius: 3px;
  word-break: break-all;
  cursor: default;
`

export const StyledTokenCount = styled.span`
  font-weight: normal;
`
export const StyledLegendContents = styled.ul`
  float: left;
  line-height: 1em;
  position: relative;
  top: 1px;
  top: -1px;
`

export const StyledLegendInlineList = styled(StyledInlineList)`
  padding: 4px 0 0 0;
  &.contracted {
    max-height: ${legendRowHeight}px;
    overflow: hidden;
  }
`

export const StyledPickerListItem = styled(StyledInlineListItem)`
  padding-right: 5px;
  padding-left: 0;
  vertical-align: middle;
  line-height: 0;
`

export const StyledPickerSelector = styled.a`
  background-color: #aaa;
  display: inline-block;
  height: 12px;
  width: 12px;
  margin-top: 1px;
  line-height: 0;
  cursor: pointer;
  opacity: 0.4;
  &:hover {
    opacity: 1;
  }
  &.active {
    opacity: 1;
  }
`
export const StyledCircleSelector = styled(StyledPickerSelector)`
  border-radius: 50%;
`
export const StyledCaptionSelector = styled.a`
  cursor: pointer;
  user-select: none;
  display: inline-block;
  padding: 1px 6px;
  font-size: 12px;
  line-height: 1em;
  color: #9195a0;
  border: 1px solid #9195a0;
  overflow: hidden;
  border-radius: 0.25em;
  margin-right: 0;
  font-weight: bold;
  &:hover {
    border-color: #aaa;
    color: #aaa;
    text-decoration: none;
  }
  &.active {
    color: white;
    background-color: #9195a0;
  }
`

export const StyledFullSizeContainer = styled.div`
  position: relative;
  height: 100%;
`

export const StyledInspectorFooterStatusMessage = styled.div`
  font-weight: bold;
`
export const StyledSliderHolder = styled.div`
  position: absolute;
  top: 63px;
  right: 0;
  padding: 6px 6px 0 6px;
  border-left: #e6e9ef solid 1px;
  border-top: #e6e9ef solid 1px;
  background: #fff;
`

export const StyleToggleGroupMarksButton = styled.button`
  position: absolute;
  top: 70px;
  right: 150px;
  list-style-type: none;
  font-size: 1.5em;
  border: none;
  border-radius: 8px;
  color: white;
  background: blue;
  border-color: black;
  padding: 15px 32px;
  &:focus {
    outline: none;
  }
  &.faded {
    opacity: 0.3;
    cursor: auto;
    &:hover {
      color: #9b9da2;
    }
  }
`

export const StyleSubmitButton = styled.button`
  width: 100%;
  max-width: 280px;
  list-style-type: none;
  font-size: 1em;
  border: none;
  border-radius: 0.25rem;
  color: white;
  background: #53917e;
  border-color: white;
  padding: 0 1rem;
  margin-bottom: 0.75rem;
  line-height: 28px;
  &:focus {
    outline: none;
  }
  &.faded {
    opacity: 0.3;
    cursor: auto;
    &:hover {
      color: #9b9da2;
    }
  }
`

export const StyleToggleWrapper = styled.label`
  display: flex;
  align-items: center;
  font-size: 12px;
  margin: 0.5rem 0;
`

export const StyleInputDiv = styled.div`
  color: black;
  width: 95%;
  background: white;
  border: none;
  margin-top: 0.5rem;
`

export const StyleTextArea = styled.textarea`
  width: 100%;
  max-width: 280px;
  height: 4em;
  line-height: 1.2em;
  resize: none;
  padding: 3px;
  border: rgb(189, 195, 199) solid 1px;
  border-radius: 0.25rem;
`

export const StyledZoomHolder = styled.div<{
  fullscreen: boolean
  offset: number
}>`
  position: ${props => (props.fullscreen ? 'fixed' : 'absolute')};
  bottom: 0;
  right: 0;
  padding: 6px 6px 0 6px;
  border-left: ${props => props.theme.inFrameBorder};
  border-right: ${props => props.theme.inFrameBorder};
  border-top: ${props => props.theme.inFrameBorder};
  background: ${props => props.theme.frameSidebarBackground};
`

export const StyledZoomButton = styled.button`
  display: list-item;
  list-style-type: none;
  margin-bottom: 10px;
  border: none;
  color: ${props => props.theme.frameButtonTextColor};
  background: transparent;
  border-color: black;
  padding: 2px 6px 3px;
  &:hover {
    opacity: 0.7;
  }
  &:focus {
    outline: none;
  }
  &.faded {
    opacity: 0.3;
    cursor: auto;
    &:hover {
      color: ${props => props.theme.frameButtonTextColor};
    }
  }
`

export const StyledNodeInspectorContainer = styled.div<{
  width: number
}>`
  position: absolute;
  left: 0px;
  top: 3px;
  z-index: 1;
  width: ${props => props.width}px;
  min-width: ${panelMinWidth}px;
  max-width: 95%;
  height: 100%;
  background: ${props => props.theme.editorBackground};
  color: ${props => props.theme.primaryText};
  font-family: ${props => props.theme.drawerHeaderFontFamily};
  box-shadow: 0px 0px 2px rgba(21, 30, 41, 0.1),
    0px 1px 2px rgba(21, 30, 41, 0.08), 0px 1px 4px rgba(21, 30, 41, 0.08);
`
export const StyledNodeInspectorTopMenuChevron = styled.div<{
  expanded: boolean
}>`
  cursor: pointer;
  position: absolute;
  left: 0px;
  top: 6px;
  z-index: 2;
  width: 32px;
  height: 32px;
  padding: 6px;
  ${props =>
    !props.expanded &&
    `background: ${props.theme.editorBackground};
     box-shadow: 0px 0px 2px rgba(21, 30, 41, 0.1),
      0px 1px 2px rgba(21, 30, 41, 0.08), 0px 1px 4px rgba(21, 30, 41, 0.08);
  `}
`

export const PaneContainer = styled.div`
  padding: 0 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const AlternatingTable = styled.table`
  tr:nth-child(even) {
    background: ${props => props.theme.alteringTableRowBackground};
  }
  tr:nth-child(odd) {
    background: ${props => props.theme.editorBackground};
  }
  font-size: 13px;
  width: 100%;
`

export const PaneHeader = styled.div`
  font-size: 16px;
  margin: 10px 0px 0px 20px;
  flex: 0 0 auto;
`

export const PaneBody = styled.div`
  overflow: auto;
  margin: 14px 0;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`
export const KeyCell = styled.td`
  font-weight: 700;
  vertical-align: top;
  padding: 2px;
  width: 30%;
`

export const CopyCell = styled.td`
  padding: 2px 5px;
  display: flex;
  justify-content: flex-end;
`
export const ValueCell = styled.td`
  padding: 2px;
  white-space: pre-wrap;
  vertical-align: top;
`

export const PaneTitle = styled.div`
  margin-bottom: 10px;
`

export const PaneBodySectionTitle = styled.span`
  font-weight: 700;
`

export const PaneBodySectionSmallText = styled.span`
  font-size: 0.9rem;
`
export const PaneBodySectionHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const StyledPatternSelectorBody = styled.div`
  margin-left: -2px;
  margin-right: -2px;
`

export const StyledPatternSelectorItem = styled.div`
  svg {
    display: block;
  }
  display: inline-block;
  background: white;
  margin: 2px;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;

  &:hover {
    background: #eeeeee;
  }
`

export const StyledGraphLegend = styled.div`
  width: 500px;
  line-height: 12px;
  font-size: 12px;
  padding: 0.75rem;
  margin: 1rem 1rem 1rem 0rem;
  background: white;
  border-radius: 0.25rem;
  border: rgb(189, 195, 199) solid 1px;

  td {
    padding: 4px 8px;
    .legend-label {
      width: fit-content;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  th {
    padding: 4px 8px;
    text-align: left;
  }
`
