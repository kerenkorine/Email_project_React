import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useToken from './useToken';
import { Typography, useTheme, useMediaQuery, Grid, Box, IconButton } from '@mui/material';
import { formatDate } from "./utilities";
import DeleteIcon from '@mui/icons-material/Delete';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import { useNavigate } from "react-router-dom";

const MailViewer = () => {
  const { id } = useParams();
   
  const [mail, setMail] = useState(null);
  const token = useToken();
  const theme = useTheme();
  const matchesSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [mailboxes, setMailboxes] = useState([]);
  const [selectedMailbox, setSelectedMailbox] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3010/v0/mail/${id}`, {
        method: 'get',
        headers: new Headers({
          'Authorization': `Bearer ${token}`,  // replace with your actual token
        })
    })
      .then((response) => {
        if (!response.ok) { throw response }
        return response.json()  
      })
      .then((json) => {
        setMail(json);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id, token]);


  useEffect(() => {
    fetch("http://localhost:3010/v0/mailboxes", {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
      })
    })
    .then(response => {
      if (!response.ok) { throw response }
      return response.json()
    })
    .then(json => {
      setMailboxes(json);
    })
    .catch(error => {
      console.error(error);
    });
  }, [token]);

  const handleChange = (event) => {
    setSelectedMailbox(event.target.value);
  };

  const handleMove = () => {
    fetch(`http://localhost:3010/v0/mail/${id}?mailbox=${selectedMailbox}`, {
      method: 'put',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
      })
    })
    .then(response => {
      if (!response.ok) { throw response }
      // You might want to update the state of your app here or redirect the user
    })
    .catch(error => {
      console.error(error);
    });
  }
  let history = useNavigate();
  const handleDelete = () => {
    fetch(`http://localhost:3010/v0/mail/${id}?mailbox=trash`, {
      method: 'put',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
      })
    })
    .then((response) => {
      if (!response.ok) { throw response }
      // You might want to update the state of your app here or redirect the user
      history('/MailboxViewer');
    })
    .catch((error) => {
      console.error(error);
    });
  }

  if (!mail) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container justify={matchesSM ? 'center' : 'flex-start'} style={{ width: '100%' }}>
      <Box bgcolor={theme.palette.secondary.main} color={theme.palette.primary.contrastText} m={2} p={2} borderRadius={2}>
        <IconButton onClick={handleDelete} style={{float: 'right'}}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={handleMove} style={{float: 'right'}}>
          <MoveToInboxIcon />
        </IconButton>
        <FormControl>
          <InputLabel>Move to</InputLabel>
          <Select value={selectedMailbox} onChange={handleChange}>
            {mailboxes.map((mailbox, index) => (
              <MenuItem key={index} value={mailbox}>
                {mailbox}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="h4">{mail.subject}</Typography>
        <Typography variant="body1">From: {mail.from.name} ({mail.from.email})</Typography>
        <Typography variant="body1">To: {mail.to.name} ({mail.to.email})</Typography>
        <Typography variant="body1">Sent: {formatDate(mail.sent)}</Typography>
        <Typography variant="body1">Received: {formatDate(mail.received)}</Typography>
        <Typography variant="body2">{mail.content}</Typography>
      </Box>
    </Grid>
  );
};

export default MailViewer;
