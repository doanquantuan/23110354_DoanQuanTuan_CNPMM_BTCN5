import React from "react";
import Spinner from "./Spinner";

const Table = ({ columns = [], dataSource = [], loading = false, rowKey = "id" }) => {
  return (
    <div className="w-full overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              {columns.map((column, idx) => (
                <th key={column.key || column.dataIndex || idx} className="px-6 py-4">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Spinner size="md" />
                    <span className="text-gray-400 font-medium">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : dataSource.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 font-medium">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              dataSource.map((row, rowIdx) => (
                <tr key={row[rowKey] || row._id || rowIdx} className="hover:bg-gray-50/50 transition-colors duration-150">
                  {columns.map((column, colIdx) => {
                    const cleanIndex = column.dataIndex ? column.dataIndex.trim() : "";
                    const value = cleanIndex ? (row[cleanIndex] !== undefined ? row[cleanIndex] : row[column.dataIndex]) : undefined;
                    return (
                      <td key={column.key || column.dataIndex || colIdx} className="px-6 py-4 text-gray-600 font-medium">
                        {column.render ? column.render(value, row, rowIdx) : value ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
