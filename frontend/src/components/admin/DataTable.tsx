import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  empty?: ReactNode;
};

export function DataTable<T>({ columns, rows, rowKey, empty }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div className="admin-table-wrap">
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
        <thead>
          <tr
            style={{
              background: "var(--color-soft-mist)",
              textAlign: "left",
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "12px 14px",
                  fontWeight: 600,
                  borderBottom:
                    "1px solid color-mix(in srgb, var(--color-pewter) 55%, transparent)",
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "12px 14px",
                    borderBottom:
                      "1px solid color-mix(in srgb, var(--color-pewter) 40%, transparent)",
                    verticalAlign: "top",
                  }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
