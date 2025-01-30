// import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Sidebar from './Sidebar';
import MailboxViewer from './MailboxViewer';
import MailViewer from './MailViewer';

const ParentComponent = () => {
  const theme = useTheme();
  const matchesSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: matchesSM ? '1fr' : '1fr 2fr 2fr', 
      gap: '1rem' 
    }}>
      <Sidebar />
      <MailboxViewer />
      <MailViewer />
    </div>
  );
};

export default ParentComponent;
