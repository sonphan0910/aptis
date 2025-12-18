'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Avatar
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  PersonAdd,
  Block,
  CheckCircle
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { fetchUsers, deleteUser, updateUserStatus } from '@/store/slices/userSlice';
import DataTable from '@/components/shared/DataTable';
import UserForm from '@/components/admin/users/UserForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function UsersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { users, isLoading: loading, pagination } = useSelector(state => state.users);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    handleFetchUsers();
  }, [searchTerm, filters]);

  const handleFetchUsers = (page = 1) => {
    dispatch(fetchUsers({
      page,
      search: searchTerm,
      ...filters
    }));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  const handleToggleStatus = async (user) => {
    await dispatch(updateUserStatus({
      id: user.id,
      is_active: !user.is_active
    }));
    handleFetchUsers();
  };

  const handleDelete = (user) => {
    setConfirmDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (confirmDelete) {
      await dispatch(deleteUser(confirmDelete.id));
      setConfirmDelete(null);
      handleFetchUsers();
    }
  };

  const handleUserFormClose = () => {
    setUserFormOpen(false);
    setEditingUser(null);
    handleFetchUsers();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'teacher': return 'primary';
      case 'student': return 'secondary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị';
      case 'teacher': return 'Giáo viên';
      case 'student': return 'Học viên';
      default: return role;
    }
  };

  const columns = [
    {
      id: 'user',
      label: 'Người dùng',
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 40, height: 40 }}>
            {row.full_name?.charAt(0) || row.email?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {row.full_name || 'Chưa có tên'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'role',
      label: 'Vai trò',
      render: (row) => (
        <Chip 
          label={getRoleLabel(row.role)} 
          size="small" 
          color={getRoleColor(row.role)}
          variant="filled"
        />
      )
    },
    {
      id: 'created_at',
      label: 'Ngày tạo',
      render: (row) => new Date(row.created_at).toLocaleDateString('vi-VN')
    },
    {
      id: 'last_login',
      label: 'Đăng nhập cuối',
      render: (row) => row.last_login ? new Date(row.last_login).toLocaleDateString('vi-VN') : 'Chưa từng'
    },
    {
      id: 'is_active',
      label: 'Trạng thái',
      render: (row) => (
        <Chip 
          label={row.is_active ? 'Hoạt động' : 'Tạm khóa'} 
          size="small"
          color={row.is_active ? 'success' : 'default'}
          icon={row.is_active ? <CheckCircle /> : <Block />}
        />
      )
    },
    {
      id: 'actions',
      label: 'Hành động',
      align: 'center',
      render: (row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEdit(row)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleToggleStatus(row)}
            color={row.is_active ? "warning" : "success"}
          >
            {row.is_active ? <Block /> : <CheckCircle />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row)}
            color="error"
            disabled={row.role === 'admin'}
          >
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý người dùng
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setUserFormOpen(true)}
          size="large"
        >
          Thêm người dùng
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Tìm kiếm email, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={filters.role}
                label="Vai trò"
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="admin">Quản trị</MenuItem>
                <MenuItem value="teacher">Giáo viên</MenuItem>
                <MenuItem value="student">Học viên</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filters.status}
                label="Trạng thái"
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Tạm khóa</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handleFetchUsers}
      />

      <UserForm
        open={userFormOpen}
        user={editingUser}
        onClose={handleUserFormClose}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa người dùng"
        content={`Bạn có chắc muốn xóa người dùng "${confirmDelete?.email}"? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteUser}
        onCancel={() => setConfirmDelete(null)}
      />
    </Box>
  );
}