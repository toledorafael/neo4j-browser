import CheckBoxFilter from 'browser/modules/D3Visualization/components/CheckBoxFilter'
import Table from 'browser/modules/D3Visualization/components/Table'
import { GraphStats } from 'browser/modules/D3Visualization/mapper'
import { Record as Neo4jRecord } from 'neo4j-driver'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { BrowserRequestResult } from 'shared/modules/requests/requestsDuck'
import styled from 'styled-components'

const StyledTabularView = styled.div`
  display: flex;
  padding: 1.5rem 3rem;
  flex-direction: column;
  align-content: center;
  justify-content: flex-start;
  overflow-y: scroll;
  min-height: 300px;
`

const StyledDataEntry = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  line-height: 1.5rem;
`

const StyledLabel = styled.div`
  margin-right: 0.25rem;
  font-weight: bold;
`

const StyledHeader = styled.div`
  white-space: normal;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

interface TableConfig {
  Header: string
  columns: Record<PropertyKey, any>[]
}

type TabularViewProps = {
  result: BrowserRequestResult
  graphStats: GraphStats | null
  hiddenNodeLabels: string[]
  hiddenRelationshipTypes: string[]
  setRelTypeVisibility: (type: string, value: boolean) => void
}

type HeaderCellProps = {
  value: PropertyKey
  relTypes: string[]
  record: any
  getSelectedAttributes: (param: string[]) => void
  hiddenRelationshipTypes: string[]
  setRelTypeVisibility: (type: string, value: boolean) => void
}

type CellProps = {
  value: string[]
}

const HeaderEntry = ({
  value,
  relTypes,
  record,
  getSelectedAttributes,
  hiddenRelationshipTypes,
  setRelTypeVisibility
}: HeaderCellProps) => {
  const isRelationship = record
    .get(value)
    .properties.hasOwnProperty('condition')

  const index = record.keys.indexOf(value)
  const desc = ['Start node', 'Relationship', 'End node']

  console.log(hiddenRelationshipTypes)
  return (
    <StyledHeader>
      {value} - {desc[index]}
      {isRelationship ? (
        <CheckBoxFilter
          options={relTypes}
          callback={() => {}}
          type="relationship"
          hiddenRelationshipTypes={hiddenRelationshipTypes}
          setRelTypeVisibility={setRelTypeVisibility}
        />
      ) : index == 0 ? (
        <CheckBoxFilter
          options={['id', 'filename', 'label', 'type']}
          callback={getSelectedAttributes}
          type="node"
          hiddenRelationshipTypes={hiddenRelationshipTypes}
          setRelTypeVisibility={setRelTypeVisibility}
        />
      ) : (
        <></>
      )}
    </StyledHeader>
  )
}

// Compute the formatted data cell
const MultilineData = ({ value }: CellProps) => {
  return (
    <>
      {value.map(data => {
        const dataArray = data.split('\n')

        return dataArray.map((dataEntry, index) => {
          const dataMapping = dataEntry.split(': ')
          return (
            <StyledDataEntry key={index}>
              <StyledLabel>{dataMapping[0]}: </StyledLabel>
              {dataMapping[1]}
            </StyledDataEntry>
          )
        })
      })}
    </>
  )
}

export const TabularViewComponent = ({
  result,
  graphStats,
  hiddenNodeLabels,
  hiddenRelationshipTypes,
  setRelTypeVisibility
}: TabularViewProps): JSX.Element => {
  const [columns, setColumns] = useState<TableConfig[]>([])
  const [data, setData] = useState<Record<PropertyKey, string[]>[]>([])

  const records: Neo4jRecord[] = useMemo(
    () =>
      result && 'records' in result && result.records.length
        ? result?.records
        : [],
    [result]
  )

  const relTypes: string[] = useMemo(
    () =>
      graphStats && graphStats.relTypes
        ? Object.keys(graphStats.relTypes).filter(e => e !== '*')
        : [],
    [graphStats]
  )
  const [selectedAttributes, setSelectedAttributes] = useState([
    'id',
    'filename',
    'label',
    'type'
  ])

  // Set the selected attributes based on callback from CheckBoxFilter
  const getSelectedAttributes = useCallback(param => {
    setSelectedAttributes(param)
  }, [])

  useEffect(() => {
    setColumns([
      {
        Header: 'Tabular View Results',
        columns: records[0].keys.map(field => ({
          // eslint-disable-next-line react/display-name
          Header: () => (
            <HeaderEntry
              value={field}
              relTypes={relTypes}
              record={records[0]}
              getSelectedAttributes={getSelectedAttributes}
              hiddenRelationshipTypes={hiddenRelationshipTypes}
              setRelTypeVisibility={setRelTypeVisibility}
            />
          ),
          accessor: field,
          // eslint-disable-next-line react/display-name
          Cell: (cell: any) => <MultilineData value={cell.value} />
          // Cell: (cell: any) => <Conditions value={cell.value} />
        }))
      }
    ])
  }, [records, hiddenRelationshipTypes, relTypes])

  const getNodeDataMapping = (record: any): string[] => {
    const mapping = []

    if (selectedAttributes.includes('id')) {
      mapping.push('id: ' + record.identity)
    }
    if (selectedAttributes.includes('filename')) {
      mapping.push('filename: ' + record.properties.filename)
    }
    if (selectedAttributes.includes('label')) {
      mapping.push('label: ' + record.properties.label)
    }
    if (selectedAttributes.includes('type')) {
      mapping.push('type: ' + record.labels.join(', '))
    }

    return mapping
  }

  useEffect(() => {
    const tempData: Record<PropertyKey, string[]>[] = []

    records.map((record: Neo4jRecord) => {
      if (columns && columns[0] && columns[0].columns) {
        // Check if the type of the relationship is selected by the user
        let shouldBeInvisible = false
        columns[0].columns.map(field => {
          const isRelationship = record
            .get(field.accessor)
            .properties.hasOwnProperty('condition')

          if (isRelationship) {
            if (
              hiddenRelationshipTypes != undefined &&
              hiddenRelationshipTypes.includes(record.get(field.accessor).type)
            ) {
              shouldBeInvisible = true
            }
          } else {
            if (
              hiddenNodeLabels != undefined &&
              hiddenNodeLabels.includes(record.get(field.accessor).labels[0])
            ) {
              shouldBeInvisible = true
            }
          }
        })

        if (!shouldBeInvisible) {
          // Populate the row of entry
          const row: Record<PropertyKey, string[]> = {}

          columns[0].columns.map(field => {
            row[field.accessor.toString()] = []

            if (
              record.get(field.accessor).properties.hasOwnProperty('condition') // Relationship
            ) {
              row[field.accessor.toString()].push(
                'condition: ' + record.get(field.accessor).properties.condition
              )
              row[field.accessor.toString()].push(
                'relationship type: ' + record.get(field.accessor).type
              )
            } else {
              // Node
              row[field.accessor.toString()].push(
                ...getNodeDataMapping(record.get(field.accessor))
              )
            }
          })

          tempData.push(row)
        }
      }
    })

    setData(tempData)
  }, [
    records,
    columns,
    hiddenNodeLabels,
    hiddenRelationshipTypes,
    selectedAttributes
  ])

  return (
    <StyledTabularView>
      {records.length === 0 ? (
        'Query results are currently unavailable.'
      ) : (
        <Table columns={columns} data={data} />
      )}
    </StyledTabularView>
  )
}

export const TabularStatusBarComponent = () => {
  return <>The results are for testing purposes only.</>
}

export const TabularView = connect()(TabularViewComponent)
export const TabularStatusBar = connect()(TabularStatusBarComponent)
