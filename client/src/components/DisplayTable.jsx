import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

const DisplayTable = ({ data = [], column = [] }) => {
  const table = useReactTable({
    data,
    columns: [
      {
        accessorFn: (_, index) => index + 1,
        id: 'serialNumber',
        header: 'Sr. No',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'code', // Added the "Code" column
        header: 'Code',
        cell: info => info.getValue() || '-', // Display "-" if the code value is missing
      },
      ...column,
    ],
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-2 overflow-x-auto">
      {data.length ? (
        <table className="w-full border-collapse border" role="table">
          <thead className="bg-gray-800 text-white">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left border"
                    scope="col"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-100">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 text-sm border whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No Data Found
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}

export default DisplayTable
