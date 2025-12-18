'use client';

import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

export default function StatsCard({ title, value, icon, color = 'primary', subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="div" color="text.secondary" sx={{ fontSize: 14 }}>
            {title}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}.light`, width: 40, height: 40 }}>
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: subtitle ? 0.5 : 0 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}