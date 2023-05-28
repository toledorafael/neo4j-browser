import Table from 'browser/modules/D3Visualization/components/Table'
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

interface TableConfig {
  Header: string
  columns: Record<PropertyKey, any>[]
}

type TabularViewProps = {
  result: BrowserRequestResult
}

type ConditionProps = {
  value: string
}

// Custom component to render Genres
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
}

export const TabularViewComponent = ({
  result
}: TabularViewProps): JSX.Element => {
  const [columns, setColumns] = useState<TableConfig[]>([])
  const [data, setData] = useState<Record<PropertyKey, string>[]>([])

  const records: Neo4jRecord[] = useMemo(
    () =>
      result && 'records' in result && result.records.length
        ? result?.records
        : [],
    [result]
  )
  console.log(records)

  useEffect(() => {
    setColumns([
      {
        Header: 'Tabular View Results',
        columns: records[0].keys.map(field => ({
          Header: field,
          accessor: field,
          // eslint-disable-next-line react/display-name
          Cell: (cell: any) => <Conditions value={cell.value} />
        }))
      }
    ])
  }, [records])

  useEffect(() => {
    const dataTest: Record<PropertyKey, string>[] = []

    records.map((record: Neo4jRecord) => {
      if (columns && columns[0] && columns[0].columns) {
        const row: Record<PropertyKey, string> = {}

        columns[0].columns.map(field => {
          console.log(record.get(field.accessor))

          if (
            record.get(field.accessor).properties.hasOwnProperty('condition')
          ) {
            row[field.accessor.toString()] =
              'conditions: ' + record.get(field.accessor).properties.condition
          } else {
            row[field.accessor.toString()] = JSON.stringify(
              record.get(field.accessor).properties
            )
          }
        })

        dataTest.push(row)
      }
    })

    setData(dataTest)
  }, [records, columns])

  console.log(data)

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
