import EmptyState from '../common/EmptyState';

function DataTable({
  columns,
  data = [],
  rowKey = 'id',
  emptyTitle = 'No records found',
  emptyDescription = 'There is nothing to display yet.',
  className = '',
}) {
  if (!data.length) {
    return (
      <div className={`ui-table-wrap ${className}`.trim()}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className={`ui-table-wrap ${className}`.trim()}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const key = row[rowKey] ?? rowIndex;

            return (
              <tr key={key}>
                {columns.map((column) => (
                  <td key={column.key} data-label={column.header}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
