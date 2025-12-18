'use client';

import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';

const pathLabels = {
  dashboard: 'Trang chủ',
  teacher: 'Giáo viên',
  admin: 'Quản trị',
  questions: 'Câu hỏi',
  exams: 'Bài thi',
  criteria: 'Tiêu chí',
  submissions: 'Xem xét bài',
  reports: 'Báo cáo',
  users: 'Người dùng',
  profile: 'Hồ sơ',
  new: 'Tạo mới'
};

export default function Breadcrumb() {
  const pathname = usePathname();
  
  // Tách path thành mảng segments
  const segments = pathname.split('/').filter(segment => segment && segment !== '(dashboard)');
  
  // Nếu đang ở trang chủ, không hiển thị breadcrumb
  if (segments.length <= 1) {
    return null;
  }

  const buildPath = (index) => {
    return '/' + segments.slice(0, index + 1).join('/');
  };

  return (
    <Box mb={2}>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          component={NextLink}
          href="/dashboard"
          underline="hover"
          color="inherit"
          display="flex"
          alignItems="center"
          gap={0.5}
        >
          <Home fontSize="small" />
          Trang chủ
        </Link>
        
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const path = buildPath(index);
          const label = pathLabels[segment] || segment;
          
          if (isLast) {
            return (
              <Typography key={segment} color="text.primary">
                {label}
              </Typography>
            );
          }
          
          return (
            <Link
              key={segment}
              component={NextLink}
              href={path}
              underline="hover"
              color="inherit"
            >
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}