import React, { Component } from 'react'
import { Resizable } from 'react-resizable'
import { Icon } from 'semantic-ui-react'

import { GraphStats } from '../mapper'
import {
  StyledNodeInspectorContainer,
  PaneContainer,
  StyledNodeInspectorTopMenuChevron,
  tablePanelMinWidth
} from './styled'
import { TabularView } from 'browser/modules/Stream/CypherFrame/TabularView'
import { BrowserRequestResult } from 'shared/modules/requests/requestsDuck'
import { VizItem } from './types'

interface TablePanelProps {
  expanded: boolean
  setWidth: (tablePanelwidth: number) => void
  stats: GraphStats
  toggleExpanded: () => void
  tablePanelwidth: number
  result: BrowserRequestResult
  hiddenNodeLabels: string[]
  hiddenRelationshipTypes: string[]
  setRelTypeVisibility: (type: string, value: boolean) => void
  hoveredItem: VizItem
  selectedItem: VizItem
}

export const defaultTablePanelWidth = (): number =>
  Math.max(window.innerWidth / 5, tablePanelMinWidth)

export class TablePanel extends Component<TablePanelProps> {
  render(): JSX.Element {
    const {
      expanded,
      setWidth,
      stats,
      toggleExpanded,
      tablePanelwidth,
      result,
      hiddenNodeLabels,
      hiddenRelationshipTypes,
      setRelTypeVisibility,
      hoveredItem,
      selectedItem
    } = this.props

    const relevantItems = ['node', 'relationship']
    const hoveringNodeOrRelationship =
      hoveredItem && relevantItems.includes(hoveredItem.type)
    const shownEl = hoveringNodeOrRelationship ? hoveredItem : selectedItem

    return (
      <>
        <StyledNodeInspectorTopMenuChevron
          position="right"
          expanded={expanded}
          onClick={toggleExpanded}
        >
          {expanded ? (
            <Icon
              title="Collapse the Tabular View display"
              name="chevron right"
            />
          ) : (
            <Icon title="Expand the Tabular View display" name="table" />
          )}
        </StyledNodeInspectorTopMenuChevron>

        {expanded && (
          <StyledNodeInspectorContainer
            position="right"
            width={tablePanelwidth}
            data-testid="tableInspector"
          >
            <Resizable
              width={tablePanelwidth}
              height={300 /*doesn't matter but required prop */}
              resizeHandles={['w']}
              onResize={(_e, { size }) => setWidth(size.width)}
            >
              <PaneContainer>
                <TabularView
                  result={result}
                  graphStats={stats}
                  hiddenNodeLabels={hiddenNodeLabels}
                  hiddenRelationshipTypes={hiddenRelationshipTypes}
                  setRelTypeVisibility={setRelTypeVisibility}
                  vizItem={shownEl}
                />
              </PaneContainer>
            </Resizable>
          </StyledNodeInspectorContainer>
        )}
      </>
    )
  }
}
