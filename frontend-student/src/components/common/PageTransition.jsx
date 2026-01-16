'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Box from '@mui/material/Box';

/**
 * Page transition wrapper to prevent flicker during navigation
 * Provides smooth transitions between pages using framer-motion
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] // cubic-bezier easing
        }}
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          width: '100%'
        }}
      >
        <Box sx={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%'
        }}>
          {children}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}