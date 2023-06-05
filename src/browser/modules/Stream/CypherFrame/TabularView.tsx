import Table from 'browser/modules/D3Visualization/components/Table'
import { GraphStats } from 'browser/modules/D3Visualization/mapper'
import { Record as Neo4jRecord } from 'neo4j-driver'
import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { BrowserRequestResult } from 'shared/modules/requests/requestsDuck'
import styled from 'styled-components'

const StyledTabularView = styled.div`
  display: flex;
  padding: 1.5rem 3rem;
  flex-direction: column;
  align-content: center;
  justify-content: flex-start;
`

const StyledCondition = styled.div`
  padding: 0.5rem 1.25rem;
  border-radius: 1.5rem;
  color: #000000;
  background-color: #ffe081;
  width: fit-content;
`

const StyledDataEntry = styled.div`
  display: flex;
  flex-direction: row;
  line-height: 1.5rem;
`

const StyledLabel = styled.div`
  margin-right: 0.25rem;
  font-weight: bold;
`

interface TableConfig {
  Header: string
  columns: Record<PropertyKey, any>[]
}

type TabularViewProps = {
  result: BrowserRequestResult
  graphStats: GraphStats | null
}

type ConditionProps = {
  value: string[]
}

/* // Custom component to render Genres
const Conditions = ({ value }: ConditionProps) => {
  return (
    <>
      {value.search('conditions: ') == 0 ? (
        <StyledCondition key={value}>{value.slice(12)}</StyledCondition>
      ) : (
        <>{value}</>
      )}
    </>
  )
} */

const MultilineData = ({ value }: ConditionProps) => {
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
  graphStats
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
  console.log(graphStats)

  useEffect(() => {
    setColumns([
      {
        Header: 'Tabular View Results',
        columns: records[0].keys.map(field => ({
          Header: field,
          accessor: field,
          // eslint-disable-next-line react/display-name
          Cell: (cell: any) => <MultilineData value={cell.value} />
          // Cell: (cell: any) => <Conditions value={cell.value} />
        }))
      }
    ])
  }, [records])

  const getNodeDataMapping = (record: any): string[] => {
    const mapping = []

    mapping.push('<id>: ' + record.identity)
    mapping.push('filename: ' + record.properties.filename)
    mapping.push('label: ' + record.properties.label)
    mapping.push('type: ' + record.labels.join(', '))

    return mapping
  }

  useEffect(() => {
    const tempData: Record<PropertyKey, string[]>[] = []

    records.map((record: Neo4jRecord) => {
      if (columns && columns[0] && columns[0].columns) {
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
    })

    setData(tempData)
  }, [records, columns])

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
