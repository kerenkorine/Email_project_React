import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchView = () => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // Add the functionality to search through your mails here
    }

    return (
        <TextField
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search mail"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
        />
    );
}

export default SearchView;
