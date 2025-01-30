// UserAvatar.jsx

import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

// eslint-disable-next-line react/prop-types
const UserAvatar = ({ username, onLogout }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        onLogout();
    };

    return (
        <div>
            <IconButton onClick={handleClick}>
                <Avatar>{username[0]}</Avatar>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </div>
    );
};

export default UserAvatar;
