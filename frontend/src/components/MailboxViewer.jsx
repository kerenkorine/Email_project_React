import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List,
} from "@mui/material";
import { Container, Box, Button } from "@mui/material";
//import { useHistory } from 'react-router-dom';
import {  useNavigate, useParams } from "react-router-dom";
import MailboxSelector from "./MailboxSelector";
import { formatDate } from "./utilities";
import SearchView from "./SearchView";
import ComposeView from "./ComposeView";
import SettingsDialog from "./SettingsDialog";
import StarredIndicator from "./StarredIndicator";
import UserAvatar from "./UserAvatar";
import React from "react";
import { Link } from "react-router-dom";


const MailboxViewer = () => {
  const [mails, setMails] = useState([]);
  const [error, setError] = useState("");
  const { mailbox = 'inbox' } = useParams();
  const [showSearch, setShowSearch] = useState(false);

  const handleButtonClick = () => {
    setShowSearch(!showSearch);
  };


  useEffect(() => {
    const fetchMails = async () => {
      const item = localStorage.getItem("user");
      if (!item) {
        return;
      }
      const user = JSON.parse(item);
      const bearerToken = user ? user.accessToken : "";

      fetch(`http://localhost:3010/v0/mail?mailbox=${mailbox}`, {
        method: "get",
        headers: new Headers({
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw response;
          }
          return response.json();
        })
        .then((json) => {
          console.log(json);
          setError("");
          // For each mailbox, sort its mails array in descending order
          json.forEach((mailbox) => {
            mailbox.mail.sort(
              (a, b) => new Date(b.mail.received) - new Date(a.mail.received)
            );
          });

          setMails(json);
        })
        .catch((error) => {
          console.log(error);
          setMails([]);
          setError(`${error.status} - ${error.statusText}`);
        });
    };

    fetchMails();
  }, [mailbox]);

    // find the mailbox object you want to display
    const currentMailbox = mails.find(m => m.name === mailbox);

 let history = useNavigate();
  const handleLogout = () => {
      // Remove the user from local storage to log them out
     // localStorage.removeItem('user');
     history('/');
      // Redirect to the login page
    };
  // ...

  return (
    <div style={{ width: '100%' }}>
      <AppBar position="static"></AppBar>
      <Container maxWidth="sm">
        <Toolbar>
          <MailboxSelector />
         
          <Button variant="contained" onClick={handleButtonClick}>Search</Button>
      {showSearch && <SearchView currentMailbox="inbox" />}
      
          <ComposeView />
          <UserAvatar username="User" onLogout={handleLogout} />
        
          <SettingsDialog />
        </Toolbar>

        {currentMailbox && (
          <Box sx={{margin: 'auto'}}>
            <Typography variant="h4">{currentMailbox.name}</Typography>
            <List>
            {currentMailbox.mail.map((mailItem) => (
              <ListItem key={mailItem.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{mailItem.mail.from.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <React.Fragment>
                      <Typography variant="h6" component="span">
                      {currentMailbox.name.toLowerCase() === "sent" ? mailItem.mail.to.name : mailItem.mail.from.name}
                      </Typography>
                      <Link to={`/mail/${mailItem.id}`}>
                        <Typography
                          component="div"
                          variant="body1"
                          color="textPrimary"
                        >
                          {mailItem.mail.subject}
                        </Typography>
                      </Link>
                    </React.Fragment>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textSecondary"
                      >
                        {mailItem.mail.content.length > 100
                          ? `${mailItem.mail.content.substring(0, 100)}...`
                          : mailItem.mail.content}
                      </Typography>
                    </React.Fragment>
                  }
                />

                <div>
                  <StarredIndicator initialIsStarred={mailItem.starred} />
                  <Typography variant="body2" color="textSecondary">
                    {formatDate(mailItem.mail.received)}
                  </Typography>
                </div>
                </ListItem>
            ))}
            </List>
          </Box>
        )}
      </Container>
      {error && <p>Error: {error}</p>}
    </div>
  );
};


export default MailboxViewer;
