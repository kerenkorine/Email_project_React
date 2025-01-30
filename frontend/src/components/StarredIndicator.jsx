import { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import IconButton from '@mui/material/IconButton';

// eslint-disable-next-line react/prop-types
const StarredIndicator = ({ initialIsStarred }) => {
  const [isStarred, setIsStarred] = useState(initialIsStarred);

  const handleClick = () => {
    setIsStarred(!isStarred);
  };

  return (
    <IconButton onClick={handleClick}>
      {isStarred ? <StarIcon /> : <StarBorderIcon />}
    </IconButton>
  );
};

export default StarredIndicator;
