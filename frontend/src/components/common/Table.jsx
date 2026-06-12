export default function Table({ 
  columns = [],
  data = [],
  loading = false,
  error = null,
  empty = "Không có dữ liệu",
  className = '',
  onRowClick = null,
  rowKey = 'id',
}) {
  if (error) {
    return <div className="table-error">{error}</div>;
  }

  if (loading) {
    return <div className="table-loading">Đang tải...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="table-empty">{empty}</div>;
  }

  return (
    <div className="table-scroll">
      <table className={`data-table ${className}`.trim()}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr 
              key={row[rowKey]} 
              className={onRowClick ? 'table-row-clickable' : ''}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
