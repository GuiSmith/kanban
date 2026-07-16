import React from 'react';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import MuiTable from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

function defaultFormat(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

export default function Table({
  tableColumns = {},
  tableRowActions = null,
  rows = [],
  rowKey = 'id',
  tableContainerProps,
  tableProps,
}) {
  const columnEntries = Object.entries(tableColumns ?? {});
  const rawActions = tableRowActions?.actions ?? {};
  const actionList = Array.isArray(rawActions) ? rawActions : Object.values(rawActions);
  const actionCount = actionList.length;
  const headerColumnCount = columnEntries.length + (actionCount > 0 ? actionCount : 0);

  return (
    <TableContainer component={Paper} {...tableContainerProps}>
      <MuiTable
        size="small"
        {...tableProps}
        sx={{
          '& .MuiTableCell-root': {
            whiteSpace: 'nowrap',
          },
        }}
      >
        <TableHead>
          <TableRow>
            {columnEntries.map(([key, col]) => (
              <TableCell key={key}>{col?.display ?? key}</TableCell>
            ))}
            {actionCount > 0 ? (
              <TableCell colSpan={actionCount}>{tableRowActions?.display ?? 'Ações'}</TableCell>
            ) : null}
          </TableRow>
        </TableHead>

        <TableBody>
          {Array.isArray(rows) && rows.length > 0 ? (
            rows.map((row, index) => {
              const stableKey = row?.[rowKey] ?? index;
              return (
                <TableRow key={stableKey}>
                  {columnEntries.map(([key, col]) => {
                    const value = row?.[key];
                    const format = typeof col?.format === 'function' ? col.format : defaultFormat;
                    return <TableCell key={key}>{format(value, row)}</TableCell>;
                  })}

                  {actionList.map((actionConfig, actionIndex) => {
                    const actionValue = row?.[actionConfig?.key];
                    const renderAction = actionConfig?.action;
                    return (
                      <TableCell key={actionIndex}>
                        {typeof renderAction === 'function' ? renderAction(actionValue, row) : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={Math.max(1, headerColumnCount)}>Nenhum registro.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}
