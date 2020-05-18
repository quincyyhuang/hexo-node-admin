import React from 'react';

import { Typography, Link } from '@material-ui/core';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Created with ❤️ by '}
      <Link color="inherit" href="https://quincyhuang.io/" target="_blank" rel="noopener">
        Quincy
      </Link>{' '}
      {'.'}
    </Typography>
  );
}

export default Copyright;