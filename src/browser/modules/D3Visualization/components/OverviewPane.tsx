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

import React, { useState } from 'react'
import { Icon } from 'semantic-ui-react'
import { log } from '../../Logging/Log'

import {
  StyledGraphLegend,
  StyledLegendInlineList,
  PaneBody,
  PaneHeader,
  PaneBodySectionTitle,
  PaneBodySectionSmallText,
  PaneBodySectionHeaderWrapper,
  StyledLayoutPicker,
  StyleRelationshipLayoutButtonGroup,
  StyledRelationshipLayoutHeader,
  StyleRelationshipLayoutButton,
  StyleInputDiv,
  StyleTextArea,
  StyleSubmitButton
} from './styled'
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { StyledTruncatedMessage } from 'browser/modules/Stream/styled'
import { StyleableNodeLabel } from './StyleableNodeLabel'
import { GraphStats } from '../mapper'
import { StyleableRelType } from './StyleableRelType'
import { ShowMoreOrAll } from 'browser-components/ShowMoreOrAll/ShowMoreOrAll'
import { connect } from 'react-redux'
import { GlobalState } from 'shared/globalState'
import * as actions from 'shared/modules/grass/grassDuck'
import neoGraphStyle from '../graphStyle'

import { FilterState, addFilterAction } from 'shared/modules/filters/filters'
import { presetPaletteAction } from 'shared/modules/palette/palette'
import { LayoutState, updateLayoutAction } from 'shared/modules/layout/layout'
import { Action, Dispatch } from 'redux'
import { getPatternDashes } from '../lib/visualization/utils/pattern'
import { featureItems, relationshipLayouts } from './Graph'

type PaneBodySectionHeaderProps = {
  title: string
  numOfElementsVisible: number
  totalNumOfElements: number
}
function PaneBodySectionHeader({
  title,
  numOfElementsVisible,
  totalNumOfElements
}: PaneBodySectionHeaderProps) {
  return (
    <PaneBodySectionHeaderWrapper>
      <PaneBodySectionTitle>{title}</PaneBodySectionTitle>
      {numOfElementsVisible < totalNumOfElements && (
        <PaneBodySectionSmallText>
          {`(showing ${numOfElementsVisible} of ${totalNumOfElements})`}
        </PaneBodySectionSmallText>
      )}
    </PaneBodySectionHeaderWrapper>
  )
}

export type GraphStyle = {
  forNode: any
  forRelationship: any
  forCondition: any
  loadRules: any
  resetToDefault: any
  rules: GraphStyleRule[]
  toSheet: any
}

type GraphStyleRule = {
  props: Record<string, string>
  selector: { classes: string[]; tag: string }
}

type OverviewPaneProps = {
  frameHeight: number
  graphStyle: GraphStyle
  graphStyleData: any
  hasTruncatedFields: boolean
  nodeCount: number | null
  relationshipCount: number | null
  stats: GraphStats
  filters: FilterState
  hiddenNodeLabels: string[]
  hiddenRelationshipTypes: string[]
  setNodeLabelVisibility: (label: string, value: boolean) => void
  setRelTypeVisibility: (type: string, value: boolean) => void
  patternSelectorVisible: boolean
  updateStyle: any
  setLightTheme: () => void
  setDarkTheme: () => void
  addFilterAction: (filter: string) => void
  updateLayoutAction: (layout: LayoutState) => void
}

export const OVERVIEW_STEP_SIZE = 50

function OverviewPane({
  frameHeight,
  // graphStyle: graphStyleProp,
  graphStyleData,
  hasTruncatedFields,
  nodeCount,
  relationshipCount,
  stats,
  filters,
  hiddenNodeLabels,
  hiddenRelationshipTypes,
  setNodeLabelVisibility,
  setRelTypeVisibility,
  patternSelectorVisible,
  updateStyle,
  setLightTheme,
  setDarkTheme,
  addFilterAction,
  updateLayoutAction
}: OverviewPaneProps): JSX.Element {
  const [maxLabelsCount, setMaxLabelsCount] = useState(OVERVIEW_STEP_SIZE)
  const [maxRelationshipsCount, setMaxRelationshipsCount] = useState(
    OVERVIEW_STEP_SIZE
  )

  // Fix sidebar not updating immediately
  const graphStyle = neoGraphStyle()
  if (graphStyleData) {
    graphStyle.loadRules(graphStyleData)
  }

  const onMoreLabelsClick = (numMore: number) => {
    setMaxLabelsCount(maxLabelsCount + numMore)
  }

  const onMoreRelationshipsClick = (numMore: number) => {
    setMaxRelationshipsCount(maxRelationshipsCount + numMore)
  }

  const { relTypes, labels } = stats
  const visibleLabelKeys = labels
    ? Object.keys(labels).slice(0, maxLabelsCount)
    : []
  const visibleRelationshipKeys = relTypes
    ? Object.keys(relTypes).slice(0, maxRelationshipsCount)
    : []
  const totalNumOfLabelTypes = labels ? Object.keys(labels).length : 0
  const totalNumOfRelTypes = relTypes ? Object.keys(relTypes).length : 0

  const [currentLayout, setCurrentLayout] = useState(
    relationshipLayouts[featureItems[0].items[0].id]
  )
  const [featureExpressionLayout, setFeatureExpressionLayout] = useState(
    featureItems[0]
  )
  const [newConditionType, setNewConditionType] = useState('')

  const handleSubmit = () => {
    if (newConditionType) {
      addFilterAction(newConditionType)
      // Logging filter creation
      log('createNewFilter, ' + newConditionType)

      graphStyle.addCondition(newConditionType)
      updateStyle(graphStyle.toSheet())

      // Clear text input
      Array.from(document.querySelectorAll('textArea')).forEach(
        (input: any) => (input.value = '')
      )

      /* const stats = getGraphStats(graph)
      const newstats = {
        labels: stats.labels,
        relTypes: stats.relTypes
      }
      onGraphModelChange(newstats) */
    }
  }

  const updateFeatureExpressionState = (event: any) => {
    setNewConditionType(event.target.value)
  }

  return (
    <>
      <PaneHeader>{'Overview'}</PaneHeader>
      <PaneBody>
        {labels && visibleLabelKeys.length !== 0 && (
          <div>
            <PaneBodySectionHeader
              title={'Node labels'}
              numOfElementsVisible={visibleLabelKeys.length}
              totalNumOfElements={totalNumOfLabelTypes}
            />
            <StyledLegendInlineList>
              {visibleLabelKeys.map((label: string) => (
                <StyleableNodeLabel
                  key={label}
                  graphStyle={graphStyle}
                  frameHeight={frameHeight}
                  selectedLabel={{
                    label,
                    propertyKeys: Object.keys(labels[label].properties),
                    count: labels[label].count
                  }}
                  setVisibility={(value: any) =>
                    setNodeLabelVisibility(label, value)
                  }
                  visible={!hiddenNodeLabels.includes(label)}
                />
              ))}
            </StyledLegendInlineList>
            <ShowMoreOrAll
              total={totalNumOfLabelTypes}
              shown={visibleLabelKeys.length}
              moreStep={OVERVIEW_STEP_SIZE}
              onMore={onMoreLabelsClick}
            />
          </div>
        )}
        {relTypes && visibleRelationshipKeys.length !== 0 && (
          <div>
            <PaneBodySectionHeader
              title={'Relationship Types'}
              numOfElementsVisible={visibleRelationshipKeys.length}
              totalNumOfElements={totalNumOfRelTypes}
            />
            <StyledLegendInlineList>
              {visibleRelationshipKeys.map(relType => (
                <StyleableRelType
                  key={relType}
                  graphStyle={graphStyle}
                  frameHeight={frameHeight}
                  selectedRelType={{
                    relType,
                    propertyKeys: Object.keys(relTypes[relType].properties),
                    count: relTypes[relType].count
                  }}
                  setVisibility={(value: any) =>
                    setRelTypeVisibility(relType, value)
                  }
                  visible={!hiddenRelationshipTypes.includes(relType)}
                />
              ))}
            </StyledLegendInlineList>
            <ShowMoreOrAll
              total={totalNumOfRelTypes}
              shown={visibleRelationshipKeys.length}
              moreStep={OVERVIEW_STEP_SIZE}
              onMore={onMoreRelationshipsClick}
            />
          </div>
        )}
        {filters && filters.length !== 0 && (
          // FIXME: figure out what visible means here
          <div>
            <PaneBodySectionHeader
              title={'Filters'}
              numOfElementsVisible={filters.length}
              totalNumOfElements={filters.length}
            />
            <StyledLegendInlineList>
              {filters.map(filter => (
                <StyleableRelType
                  key={filter}
                  graphStyle={graphStyle}
                  frameHeight={frameHeight}
                  selectedFilter={{
                    condition: filter
                  }}
                  patternSelectorVisible={patternSelectorVisible}
                />
              ))}
            </StyledLegendInlineList>
            <ShowMoreOrAll
              total={filters.length}
              shown={filters.length}
              moreStep={OVERVIEW_STEP_SIZE}
              onMore={() => console.log('onMore')}
            />
          </div>
        )}
        <div style={{ paddingBottom: '10px' }}>
          {hasTruncatedFields && (
            <StyledTruncatedMessage>
              <Icon name="warning sign" /> Record fields have been
              truncated.&nbsp;
            </StyledTruncatedMessage>
          )}
          {nodeCount !== null &&
            relationshipCount !== null &&
            `Displaying ${numberToUSLocale(
              nodeCount
            )} nodes, ${numberToUSLocale(relationshipCount)} relationships.`}
        </div>

        {/* Graph controlls */}
        {/* Input box to enter a new filter */}
        <StyleInputDiv>
          <StyleTextArea
            placeholder="Feature expression"
            onChange={updateFeatureExpressionState}
          />
          <StyleSubmitButton onClick={handleSubmit}>
            Create filter
          </StyleSubmitButton>
        </StyleInputDiv>

        {/* Layout switcher */}
        <StyledLayoutPicker>
          <StyleRelationshipLayoutButtonGroup>
            <StyledRelationshipLayoutHeader>
              Layout
            </StyledRelationshipLayoutHeader>
            {featureItems.map(layout => (
              <StyleRelationshipLayoutButton
                className={layout === featureExpressionLayout ? 'selected' : ''}
                key={layout.display}
                onClick={() => {
                  if (featureExpressionLayout !== layout) {
                    const newLayout = relationshipLayouts[layout.items[0].id]
                    updateLayoutAction(newLayout)
                    log('change to ' + layout.display)

                    setFeatureExpressionLayout(layout)
                    setCurrentLayout(newLayout)
                  }
                }}
              >
                {layout.display}
              </StyleRelationshipLayoutButton>
            ))}
          </StyleRelationshipLayoutButtonGroup>
        </StyledLayoutPicker>

        <StyledGraphLegend>
          {/* Theme switcher */}
          <button onClick={setLightTheme} style={{ marginRight: '8px' }}>
            Dark Theme
          </button>
          <button onClick={setDarkTheme}>Light Theme</button>

          {/* Legend for filters */}
          <table>
            <tr>
              <th colSpan={2}>Feature Expressions</th>
            </tr>

            {filters &&
              filters.map((condType: any) => {
                const style = graphStyle.forCondition(condType)
                if (style.get('color') === 'var(--graph-color0)') return null
                return (
                  <tr key={condType}>
                    <td>
                      <svg width="180" height="15" viewBox="0 -6 144 12">
                        <line
                          x1="0"
                          x2="144"
                          y1="0"
                          y2="0"
                          stroke={style.get('color')}
                          strokeWidth="5"
                          strokeDasharray={
                            currentLayout.localPattern
                              ? getPatternDashes(style.get('pattern'), 5)
                              : ''
                          }
                        />
                      </svg>
                    </td>
                    <td>
                      <div className="legend-label" title={condType}>
                        {condType}
                      </div>
                    </td>
                  </tr>
                )
              })}
          </table>
        </StyledGraphLegend>
      </PaneBody>
    </>
  )
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setLightTheme: () => dispatch(presetPaletteAction('light')),
  setDarkTheme: () => dispatch(presetPaletteAction('dark')),
  addFilterAction: (filter: string) => dispatch(addFilterAction(filter)),
  updateLayoutAction: (layout: LayoutState) =>
    dispatch(updateLayoutAction(layout))
})

export default connect(
  (state: GlobalState) => ({
    graphStyleData: actions.getGraphStyleData(state),
    filters: state.filters
  }),
  mapDispatchToProps
)(OverviewPane)
