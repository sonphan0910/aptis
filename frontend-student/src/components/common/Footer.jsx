'use client';

import { Box, Container, Grid, Typography, Link, Divider, Stack } from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import NextLink from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2a2a2a',
        color: '#e0e0e0',
        pt: 6,
        pb: 3,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Về chúng tôi */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Về APTIS
            </Typography>
            <Stack spacing={1}>
              <Link
                component={NextLink}
                href="/about"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Giới thiệu
              </Link>
              <Link
                component={NextLink}
                href="/mission"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Sứ mệnh & Tầm nhìn
              </Link>
              <Link
                component={NextLink}
                href="/team"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Đội ngũ
              </Link>
              <Link
                component={NextLink}
                href="/partners"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Đối tác
              </Link>
            </Stack>
          </Grid>

          {/* Hỗ trợ */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Hỗ trợ
            </Typography>
            <Stack spacing={1}>
              <Link
                component={NextLink}
                href="/help"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Trung tâm trợ giúp
              </Link>
              <Link
                component={NextLink}
                href="/faq"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Câu hỏi thường gặp
              </Link>
              <Link
                component={NextLink}
                href="/contact"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Liên hệ chúng tôi
              </Link>
              <Link
                component={NextLink}
                href="/feedback"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Góp ý & Đề xuất
              </Link>
            </Stack>
          </Grid>

          {/* Pháp lý */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Pháp lý
            </Typography>
            <Stack spacing={1}>
              <Link
                component={NextLink}
                href="/privacy"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Chính sách bảo mật
              </Link>
              <Link
                component={NextLink}
                href="/terms"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Điều khoản sử dụng
              </Link>
              <Link
                component={NextLink}
                href="/cookies"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Chính sách Cookie
              </Link>
              <Link
                component={NextLink}
                href="/accessibility"
                sx={{
                  color: '#999999',
                  textDecoration: 'none',
                  '&:hover': { color: '#64b5f6' },
                  transition: 'color 0.3s',
                }}
              >
                Khả năng truy cập
              </Link>
            </Stack>
          </Grid>

          {/* Liên hệ */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Liên hệ
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Email sx={{ mt: 0.5, fontSize: 20, color: '#64b5f6' }} />
                <Box>
                  <Typography variant="body2" color="#999999">
                    Email:
                  </Typography>
                  <Link
                    href="mailto:support@aptis.edu.vn"
                    sx={{
                      color: '#64b5f6',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    support@aptis.edu.vn
                  </Link>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Phone sx={{ mt: 0.5, fontSize: 20, color: '#64b5f6' }} />
                <Box>
                  <Typography variant="body2" color="#999999">
                    Điện thoại:
                  </Typography>
                  <Link
                    href="tel:+84123456789"
                    sx={{
                      color: '#64b5f6',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    +84 (123) 456-789
                  </Link>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn sx={{ mt: 0.5, fontSize: 20, color: '#64b5f6' }} />
                <Box>
                  <Typography variant="body2" color="#999999">
                    Địa chỉ:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64b5f6' }}>
                    Hà Nội, Việt Nam
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Social Media & Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="#999999">
            © {currentYear} APTIS Student Platform. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#999999',
                '&:hover': { color: '#64b5f6' },
                transition: 'color 0.3s',
              }}
            >
              <Facebook />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#999999',
                '&:hover': { color: '#64b5f6' },
                transition: 'color 0.3s',
              }}
            >
              <Twitter />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#999999',
                '&:hover': { color: '#64b5f6' },
                transition: 'color 0.3s',
              }}
            >
              <LinkedIn />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#999999',
                '&:hover': { color: '#64b5f6' },
                transition: 'color 0.3s',
              }}
            >
              <Instagram />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
