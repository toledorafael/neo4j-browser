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

interface TablePanelProps {
  expanded: boolean
  setWidth: (tablePanelwidth: number) => void
  stats: GraphStats
  toggleExpanded: () => void
  tablePanelwidth: number
  result: BrowserRequestResult
  hiddenRelationshipTypes: string[]
  setRelTypeVisibility: (type: string, value: boolean) => void
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
      hiddenRelationshipTypes,
      setRelTypeVisibility
    } = this.props

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
                  hiddenRelationshipTypes={hiddenRelationshipTypes}
                  setRelTypeVisibility={setRelTypeVisibility}
                />
              </PaneContainer>
            </Resizable>
          </StyledNodeInspectorContainer>
        )}
      </>
    )
  }
}
