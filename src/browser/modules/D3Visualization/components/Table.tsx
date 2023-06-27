import React, { useState } from 'react'
import { useTable } from 'react-table'

import '../../../styles/data-table.css'

type TableProps = {
  columns: any
  data: any
}

const Table = ({ columns, data }: TableProps) => {
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

  const [selectedCell, setSelectedCell] = useState([-1, -1])
  const clickOnCell = (rIndex: number, cIndex: number) => {
    if (rIndex === selectedCell[0] && cIndex === selectedCell[1]) {
      setSelectedCell([-1, -1])
    } else {
      setSelectedCell([rIndex, cIndex])
    }
  }

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
                const isSelected =
                  rIndex === selectedCell[0] && cIndex === selectedCell[1]

                return (
                  <td
                    className="data-cell"
                    {...cell.getCellProps()}
                    key={cIndex}
                    onClick={() => clickOnCell(rIndex, cIndex)}
                    style={{
                      backgroundColor: isSelected ? '#E0E0E0' : 'white'
                    }}
                  >
                    {cell.render('Cell')}
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
