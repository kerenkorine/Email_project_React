import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import useToken from './useToken';


const ComposeView = () => {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  

  const token = useToken();
  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSend = () => {
    // Sending logic here
    fetch("http://localhost:3010/v0/mail", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: {
          email: to,
        },
        subject: subject,
        content: content,
      }),
    })
      .then((response) => {
        if (!response.ok) { throw response }
        return response.json()
      })
      .then((json) => {
        console.log(json);
        // Close the dialog after sending
        setOpen(false);
      })
      .catch((error) => {
        console.error(error);
        // Keep the dialog open in case of error
      });
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Compose
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Compose New Mail</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="To"
            type="email"
            fullWidth
            value={to}
            onChange={e => setTo(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Subject"
            fullWidth
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} endIcon={<SendIcon />}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ComposeView;
