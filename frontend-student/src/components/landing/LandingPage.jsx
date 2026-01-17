'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from '@mui/material';
import { Rating } from '@mui/material';
import {
  PlayArrow,
  School,
  WorkspacePremium,
  Group,
  Star,
  Phone,
  Email,
  LocationOn,
  Menu,
} from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleRegisterClick = () => {
    router.push('/register');
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#5865F2' }}>
              APTIS
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
              <Button color="inherit">Home</Button>
              <Button color="inherit">Courses</Button>
              <Button color="inherit">Teachers</Button>
              <Button color="inherit">Pages</Button>
              <Button color="inherit">News</Button>
              <Button color="inherit">Contact</Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                📞 664 888 222
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                ✉️ contact@aptis.com
              </Typography>
              <Button variant="outlined" onClick={handleLoginClick} sx={{ ml: 2 }}>
                Sign in / Register
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #5865F2 0%, #7C3AED 100%)',
          color: 'white',
          py: 10,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, fontStyle: 'italic' }}>
                Ready to learn!
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3, lineHeight: 1.2 }}>
                Learn new things daily
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Get access to 6800+ courses from 680 professional teachers
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                sx={{ 
                  backgroundColor: '#FF6B35',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': { backgroundColor: '#E55B2B' }
                }}
                onClick={handleLoginClick}
              >
                DISCOVER MORE
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616c04ac1cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                  alt="Student learning"
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%', border: '2px solid #5865F2' }}>
              <School sx={{ fontSize: 60, color: '#5865F2', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Learn Skills
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                with unlimited courses
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%', backgroundColor: '#5865F2', color: 'white' }}>
              <Group sx={{ fontSize: 60, color: 'white', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Expert Teachers
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Best & highly qualified
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%', border: '2px solid #5865F2' }}>
              <WorkspacePremium sx={{ fontSize: 60, color: '#5865F2', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Certificates
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                value all over the world
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ backgroundColor: '#F8F9FA', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Team learning"
                  style={{ 
                    width: '100%', 
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    backgroundColor: 'white',
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#5865F2', fontWeight: 'bold' }}>
                    Trusted by 8800 customers
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#5865F2', mb: 2, fontWeight: 'bold' }}>
                About APTIS Company
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                Welcome to the Online Learning Center
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: '#666', lineHeight: 1.8 }}>
                There are many variations of passages of Lorem Ipsum available, but the majority have 
                suffered alteration in some form. Simply free text by injected humour.
              </Typography>
              <Box sx={{ mb: 4 }}>
                {[
                  'Get unlimited access to 6800+ of our top courses',
                  'Explore a variety of fresh educational topics',
                  'Find the best qualified teacher for you',
                  'Transform access to education'
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#5865F2', mr: 2 }} />
                    <Typography variant="body1" sx={{ color: '#666' }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  backgroundColor: '#5865F2',
                  px: 4,
                  py: 1.5,
                  '&:hover': { backgroundColor: '#4752C4' }
                }}
                onClick={handleLoginClick}
              >
                VIEW ALL COURSES
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Courses */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#5865F2', mb: 2 }}>
          Popular Courses
        </Typography>
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6 }}>
          Featured Courses
        </Typography>
        
        <Grid container spacing={4}>
          {[
            {
              title: 'The Complete APTIS Preparation Course',
              instructor: 'Kevin Martin',
              students: 35,
              rating: 4.5,
              image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
              featured: true
            },
            {
              title: 'IELTS Training Practical Techniques',
              instructor: 'Jessica Smith',
              students: 26,
              rating: 4.8,
              image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
              featured: true
            },
            {
              title: 'English Communication Skills',
              instructor: 'Kevin Martin',
              students: 45,
              rating: 4.7,
              image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
              featured: true
            }
          ].map((course, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                {course.featured && (
                  <Chip 
                    label="FEATURED"
                    sx={{ 
                      position: 'absolute', 
                      top: 15, 
                      left: 15, 
                      backgroundColor: '#5865F2', 
                      color: 'white',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}
                  />
                )}
                <Box sx={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                  <img 
                    src={course.image}
                    alt={course.title}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {course.instructor}
                    </Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <Group sx={{ fontSize: 16, color: '#666', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {course.students}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {course.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Rating value={course.rating} size="small" readOnly />
                    <Typography variant="h6" sx={{ color: '#5865F2', fontWeight: 'bold' }}>
                      Free
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Statistics Section */}
      <Box sx={{ backgroundColor: '#2C3E50', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#3498DB', mb: 1 }}>
                  Fun Facts
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                  APTIS Mission is to Polish your skill
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  There are many variations of passages of lorem ipsum 
                  available but the majority have suffered.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <School sx={{ fontSize: 50, color: '#3498DB', mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      6,800
                    </Typography>
                    <Typography variant="body1">
                      Pro Teachers
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Group sx={{ fontSize: 50, color: '#3498DB', mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      9,800
                    </Typography>
                    <Typography variant="body1">
                      Skill Courses
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Group sx={{ fontSize: 50, color: '#3498DB', mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      8,800
                    </Typography>
                    <Typography variant="body1">
                      Students Enrolled
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#5865F2', mb: 2 }}>
          Checkout New List
        </Typography>
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6 }}>
          Top Categories
        </Typography>
        
        <Grid container spacing={4}>
          {[
            { title: 'Art & Design', courses: '3 Full Courses', color: '#FF6B35' },
            { title: 'Lifestyle', courses: '1 Full Courses', color: '#3498DB' },
            { title: 'Photography', courses: '4 Full Courses', color: '#9B59B6' },
            { title: 'Marketing', courses: '2 Full Courses', color: '#5865F2' }
          ].map((category, idx) => (
            <Grid item xs={12} md={3} key={idx}>
              <Card sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                <Box 
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${category.color}66 0%, ${category.color} 100%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 3,
                    color: 'white'
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    {category.courses}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {category.title}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button 
            variant="outlined" 
            size="large"
            onClick={handleLoginClick}
            sx={{ 
              borderColor: '#5865F2',
              color: '#5865F2',
              px: 4,
              py: 1.5,
              '&:hover': { backgroundColor: '#5865F2', color: 'white' }
            }}
          >
            VIEW ALL COURSES
          </Button>
        </Box>
      </Container>

      {/* Newsletter Section */}
      <Box sx={{ backgroundColor: '#5865F2', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                Subscribe to Our Newsletter to Get Daily Content!
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter your email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '& input': {
                        color: '#333'
                      }
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#FF6B35',
                    px: 3,
                    '&:hover': { backgroundColor: '#E55B2B' }
                  }}
                >
                  ➤
                </Button>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                📧 Sign up now for weekly news and updates
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#2C3E50', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#3498DB' }}>
                APTIS
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                Start learning from our experts and enhance your skills
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { backgroundColor: 'white', color: '#2C3E50' }
                }}
              >
                READ MORE
              </Button>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Contact
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Phone sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2">664 888 0000</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Email sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2">contact@aptis.com</Typography>
              </Box>
              <Box>
                <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2">80 Brooklyn Street</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>About</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>Overview</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>Teachers</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>Join Us</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>Our News</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Courses
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>UX/UX Design</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>WordPress Development</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>Business Strategy</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>Software Development</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#3498DB' } }}>Business English</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Featured Posts
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Box sx={{ width: 50, height: 50, backgroundColor: '#3498DB', borderRadius: 1, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#3498DB', fontSize: '0.8rem' }}>
                    📅 8 Dec. 2020
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    APTIS Certifications for Your Career
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ width: 50, height: 50, backgroundColor: '#3498DB', borderRadius: 1, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#3498DB', fontSize: '0.8rem' }}>
                    📅 8 Dec. 2020
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Entry Level Networking Certification
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ borderTop: '1px solid #34495E', mt: 6, pt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © Copyright 2024 by APTIS Learning Platform
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}