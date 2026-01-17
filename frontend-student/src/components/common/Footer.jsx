'use client';

import { Box, Container, Grid, Typography } from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1565C0',
        color: 'white',
        py: 4,
        mt: 'auto',
        flexShrink: 0,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Company Information */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              APTIS Master
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: '500' }}>
              Nền tảng luyện thi APTIS trực tuyến hàng đầu
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: '1rem' }} />
                <Typography variant="body2">
                  Địa chỉ: [Địa chỉ công ty]
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: '1rem' }} />
                <Typography variant="body2">
                  Email: [Email liên hệ]
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: '1rem' }} />
                <Typography variant="body2">
                  Hotline: [Số điện thoại]
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Statistics */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Người đang học: [Số người]
              </Typography>
              
              {/* Development Credit */}
              <Box sx={{ mt: 3, textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  © 2024 APTIS Master. Tất cả các quyền được bảo lưu.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}