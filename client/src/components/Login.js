// Imports
import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

// Material UI Components
import { styled } from '@material-ui/core/styles';
import { Container, Avatar, Typography, TextField, Button, Box, Link, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import pink from '@material-ui/core/colors/pink';

/* CSS */
const SDiv = styled('div')({
  marginTop: 8 * 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

const SAvatar = styled(Avatar)({
  margin: 8,
  backgroundColor: pink[500]
});

/* Components */
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

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function LoginMessage(props) {
  return (
    <Snackbar
      open={props.showMsg}
      autoHideDuration={props.error ? 3000 : 1000}
      onClose={props.handleClose}
    >
      <Alert severity={props.error ? 'error' : 'success'}>
        {props.error ? props.msg : 'Login successful.'}
      </Alert>
    </Snackbar>
  );
}

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,
      error: null,
      msg: null,
      showMsg: false,
      redirect: false,
      token: localStorage.getItem('token')
    }
    // Handle redirect to here error message
    if (props.location.state) {
      this.state.error = true;
      this.state.msg = props.location.state.msg;
      this.state.showMsg = true;
    }
    // Set title
    document.title = 'Hexo Node Admin - Login';
  }

  login() {
    const url = '/api/auth/login';
    axios.post(url, {
      u: this.state.username,
      p: this.state.password
    })
      .then((res) => {
        const token = res.data.token;
        localStorage.setItem('token', token);
        this.setState({
          error: false,
          showMsg: true
        });
      })
      .catch((err) => {
        this.setState({
          error: true,
          msg: err.response.data.msg || 'Failed to connect to the server.',
          showMsg: true
        });
      });
  }

  render() {
    if (this.state.redirect === true || this.state.token)
      return <Redirect to={'/!'} />
    else
    return (
      <Container component='main' maxWidth='xs'>
        <LoginMessage showMsg={this.state.showMsg} msg={this.state.msg} error={this.state.error} handleClose={() => {
          if (this.state.error === true)
            this.setState({
              showMsg: false,
            });
          else
            this.setState({
              showMsg: false,
              redirect: true
            });
        }} />
        <SDiv className='paper'>
          <Typography component="h1" variant="h4">
            Hexo Node Admin
          </Typography>
          <SAvatar>
            <LockOutlinedIcon />
          </SAvatar>
          <form>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoFocus
            onChange={(event) => {
              this.setState({
                'username': event.target.value
              });
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(event) => {
              this.setState({
                'password': event.target.value
              });
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="outlined"
            color="primary"
            size='large'
            style={{
              marginTop: 16
            }}
            onClick={(e) => {
              e.preventDefault();
              this.login();
            }}
          >
            Sign In
          </Button>
          </form>
        </SDiv>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    );
  }
}

export default Login;