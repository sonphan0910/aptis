'use client';

import { Box } from '@mui/material';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export default function RadarChart({ skillScores }) {
  // Transform skill scores into chart data with safety checks
  const data = skillScores.map(skill => {
    const maxScore = Number(skill.maxScore ?? skill.max_score ?? 1);
    const score = Number(skill.score ?? 0);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    
    return {
      skill: (skill.skillName || skill.skill_type || 'Unknown')
        .replace(/_/g, ' ')
        .toUpperCase(),
      score: Math.min(percentage, 100), // Cap at 100
      fullMark: 100
    };
  });

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Điểm số"
            dataKey="score"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </Box>
  );
}