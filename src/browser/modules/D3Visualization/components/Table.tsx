import React from 'react'
import { useTable } from 'react-table'
import styled from 'styled-components'

import '../../../styles/data-table.css'

const StyledColorsContainer = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
`

const StyledColorDiv = styled.div<{ color: string; width: number }>`
  // background-color: rgba(255, 122, 89, .5);
  background-color: ${props => props.color};
  height: 100%;
  width: ${props => props.width}%;
  display: inline-block;
`

type TableProps = {
  columns: any
  data: any
  colorMap: string[][]
}

const Table = ({ columns, data, colorMap }: TableProps) => {
  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups, if your table has groupings
    rows, // rows for the table based on the data passed
    prepareRow // Prepare the row (this function needs to be called for each row before getting the row props)
  } = useTable({
    columns,
    data
  })

  return (
    <table className="data-table" {...getTableProps()}>
      <thead className="data-sticky-header">
        {headerGroups.map((headerGroup, rIndex) => {
          return rIndex !== 0 ? (
            <tr
              className="data-row data-header"
              {...headerGroup.getHeaderGroupProps()}
              key={rIndex}
            >
              {headerGroup.headers.map((column, cIndex) => (
                <th
                  className="data-cell"
                  {...column.getHeaderProps()}
                  key={cIndex}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ) : (
            <></>
          )
        })}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, rIndex) => {
          prepareRow(row)

          return (
            <tr className="data-row" {...row.getRowProps()} key={rIndex}>
              {row.cells.map((cell, cIndex) => {
                const colors = cIndex == 1 ? colorMap[rIndex] : []
                const colorWidth = 100.0 / colors.length

                return (
                  <td
                    className="data-cell"
                    {...cell.getCellProps()}
                    key={cIndex}
                  >
                    <>
                      <StyledColorsContainer>
                        {colors.map((color, colorIndex) => (
                          <StyledColorDiv
                            key={colorIndex}
                            color={color}
                            width={colorWidth}
                          />
                        ))}
                      </StyledColorsContainer>
                      {cell.render('Cell')}
                    </>
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default Table
