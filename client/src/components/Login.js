import React from 'react';

// Material UI Components
import { Button } from '@material-ui/core';

class Login extends React.Component {
  render() {
    return (
      <div>
        <h1>This is Login</h1>
        <Button variant="contained" color="primary">
          Hello World
        </Button>
      </div>
    );
  }
}

export default Login;