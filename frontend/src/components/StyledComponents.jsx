import { Drawer, Container, ListItem, Typography as MuiTypography, Modal } from '@mui/material';
import { styled } from '@mui/system';

export const StyledDrawer = styled(Drawer)({
  width: 240,
  backgroundColor: '#fff59d',
  color: '#fff59d',
});

export const StyledContainer = styled(Container)({
  fontFamily: 'cursive',
  marginLeft: 240,
  textAlign: 'center',
  marginRight: 240,
  padding: '20px',
});

export const StyledListItem = styled(ListItem)({
    fontFamily: 'cursive',
  cursor: 'pointer',
  border: 'dashed',
  '&:hover': {
    backgroundColor: '#fff59d',
    border: 'solid',
  },
});

export const StyledTypography = styled(MuiTypography)({
  fontFamily: 'cursive',
  backgroundColor: 'lightblue',
  textAlign: 'center',
  padding: '10px',
  marginRight: 240,
  border: 'black', 
  borderBlockStyle: 'solid',
});

export const StyledModal = styled(Modal)(() => ({
  fontFamily: 'cursive',
  color: 'red',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& div:focus': {
    outline: 'none',
  },
}));
