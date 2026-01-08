'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { usePublicData } from '@/hooks/usePublicData';

export default function PublicDataDebugger() {
  const { aptisTypes, skillTypes, questionTypes, loading, error } = usePublicData();
  const [showDebug, setShowDebug] = useState(false);

  // Show debug panel on Ctrl+D
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'd') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showDebug) {
    return null;
  }

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        width: 400, 
        maxHeight: '80vh', 
        overflow: 'auto',
        zIndex: 9999,
        p: 2,
        backgroundColor: '#1e1e1e',
        color: '#ffffff'
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'monospace' }}>
        🔍 Public Data Debugger (Ctrl+D)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CircularProgress size={20} />
          <Typography>Loading...</Typography>
        </Box>
      )}

      <Card sx={{ mb: 2, bgcolor: '#2d2d2d', color: '#fff' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            APTIS Types ({aptisTypes?.length || 0})
          </Typography>
          {aptisTypes && aptisTypes.length > 0 ? (
            <Box>
              {aptisTypes.map((type) => (
                <Box key={type.id} sx={{ mb: 1, p: 1, bgcolor: '#3d3d3d', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    ID: {type.id} | Name: {type.aptis_type_name || type.name} | Code: {type.code}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="warning.main">
              No APTIS types loaded
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 2, bgcolor: '#2d2d2d', color: '#fff' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Skill Types ({skillTypes?.length || 0})
          </Typography>
          {skillTypes && skillTypes.length > 0 ? (
            <Box>
              {skillTypes.map((skill) => (
                <Box key={skill.id} sx={{ mb: 1, p: 1, bgcolor: '#3d3d3d', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    ID: {skill.id} | Name: {skill.skill_type_name || skill.name} | Code: {skill.code}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="warning.main">
              No Skill types loaded
            </Typography>
          )}
        </CardContent>
      </Card>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
        Press Ctrl+D to close
      </Typography>
    </Paper>
  );
}