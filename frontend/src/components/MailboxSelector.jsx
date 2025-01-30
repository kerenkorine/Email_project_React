import { IconButton, Drawer, List, ListItem, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, useTheme, useMediaQuery } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import { useState, useEffect } from "react";
import useToken from './useToken';
import { Typography } from '@mui/material';
import {Link, useLocation} from 'react-router-dom';
import { useCallback } from 'react';
import SettingsDialog from "./SettingsDialog";


const MailboxSelector = () => {
  const [mailboxes, setMailboxes] = useState([]);
  const [newMailboxDialogOpen, setNewMailboxDialogOpen] = useState(false);
  const [newMailboxName, setNewMailboxName] = useState("");
  const token = useToken();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);


  const fetchMailboxes = useCallback(() => {
    fetch("http://localhost:3010/v0/mailboxes", {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
      })
    })
      .then((response) => {
        if (!response.ok) { throw response }
        return response.json()
      })
      .then((json) => {
        setMailboxes(json);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);

  useEffect(() => {
    fetchMailboxes();
}, [fetchMailboxes]);

const handleNewMailboxDialogOpen = () => {
  setNewMailboxDialogOpen(true);
};

const handleNewMailboxDialogClose = () => {
  setNewMailboxDialogOpen(false);
  setNewMailboxName("");
};

const handleCreateNewMailbox = () => {
  fetch("http://localhost:3010/v0/mailboxes", { 
    method: 'post',
    headers: new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ name: newMailboxName }) 
  })
    .then((response) => {
      if (!response.ok) { throw response }
      fetchMailboxes();
      handleNewMailboxDialogClose();
    })
    .catch((error) => {
      console.error(error);
    });
};

const handleDrawerToggle = () => {
  setDrawerOpen(!drawerOpen);
};

const location = useLocation();

// Extract the mailbox name from the URL. 
// The slice(15) is to remove the '/MailboxViewer/' part from the URL.
const currentMailbox = location.pathname.slice(15);

return (
  <div>
  <IconButton color="inherit" onClick={handleDrawerToggle}>
    <MailIcon />
  </IconButton>
  <Drawer variant={isMobile ? 'temporary' : 'permanent'} open={drawerOpen} onClose={handleDrawerToggle}>
    <List>
      <ListItem disabled>
        <Typography variant="h6">
          Slug Mail
        </Typography>
      </ListItem>
      {mailboxes.map((mailbox) => (
        <ListItem button key={mailbox} selected={mailbox === currentMailbox}>
          <Link to={`/MailboxViewer/${mailbox}`}>{mailbox}</Link>
        </ListItem>
      ))}
      <ListItem button onClick={handleNewMailboxDialogOpen}>+New Mailbox</ListItem>
      <SettingsDialog />
    </List>
  </Drawer>

    <Dialog open={newMailboxDialogOpen} onClose={handleNewMailboxDialogClose}>
        <DialogTitle>Create New Mailbox</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the name for the new mailbox.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Mailbox Name"
            type="text"
            fullWidth
            value={newMailboxName}
            onChange={(event) => setNewMailboxName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewMailboxDialogClose}>Cancel</Button>
          <Button onClick={handleCreateNewMailbox}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MailboxSelector;
