import React from 'react';
import TablePagination from "@mui/material/TablePagination";

export default function Paginador({ count, page, onChangePage, rowsPerPage, onChangeRowsPerPage }) {

  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onChangeRowsPerPage}

      labelRowsPerPage="Reservas por página"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
    />
  );
}