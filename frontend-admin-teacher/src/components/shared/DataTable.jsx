'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography
} from '@mui/material';
import LoadingSpinner from '../common/LoadingSpinner';

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  pagination = null,
  onPageChange,
  emptyMessage = 'Không có dữ liệu'
}) {
  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage + 1);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    if (onPageChange) {
      onPageChange(1, newLimit);
    }
  };

  if (loading) {
    return (
      <Paper>
        <LoadingSpinner message="Đang tải dữ liệu..." />
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id} 
                  align={column.align || 'left'}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Box py={4}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id || index}>
                  {columns.map((column) => (
                    <TableCell 
                      key={column.id} 
                      align={column.align || 'left'}
                    >
                      {column.render 
                        ? column.render(row) 
                        : row[column.id]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.total || 0}
          rowsPerPage={pagination.limit || 10}
          page={(pagination.page || 1) - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} trong tổng số ${count}`
          }
        />
      )}
    </Paper>
  );
}