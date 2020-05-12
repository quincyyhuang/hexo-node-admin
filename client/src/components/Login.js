// Imports
import React from 'react';
import axios from 'axios';
import path from 'path';
import { Redirect } from "react-router-dom";
import { withTranslation } from 'react-i18next';

// Material UI Components
import { styled } from '@material-ui/core/styles';
import { Container, Avatar, Typography, TextField, Button, Box, Link, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import pink from '@material-ui/core/colors/pink';

import Status from '../status';

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
        {props.msg}
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
      isRedirected: false,
      token: localStorage.getItem('token')
    }
    // Handle redirect to here error message
    if (props.location.state) {
      this.state.isRedirected = true;
      this.state.error = props.location.state.error;
      this.state.msg = props.location.state.msg;
      this.state.showMsg = true;
    }
    // Set title
    document.title = this.props.t('Login.title');
  }

  login() {
    const url = path.resolve(process.env.REACT_APP_ROOT, 'api', 'auth', 'login');
    axios.post(url, {
      u: this.state.username,
      p: this.state.password
    })
      .then((res) => {
        const token = res.data.token;
        localStorage.setItem('token', token);
        this.setState({
          error: false,
          msg: this.props.t('Message.AUTH_LOGGED_IN'),
          showMsg: true,
          isRedirected: false
        });
      })
      .catch((err) => {
        this.setState({
          error: true,
          msg: Status.getCodeTranslationKey(err.response.data.code) ? this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`) : this.props.t('Message.FAILED_TO_CONNECT_SERVER'),
          showMsg: true,
          isRedirected: false
        });
      });
  }

  render() {
    // Setup translation function
    const { t } = this.props;
    if (this.state.redirect === true || this.state.token)
      return <Redirect to={path.resolve(process.env.REACT_APP_ROOT, '!')} />
    else
    return (
      <Container component='main' maxWidth='xs'>
        <LoginMessage showMsg={this.state.showMsg} msg={this.state.msg} error={this.state.error} handleClose={() => {
          if (this.state.error === true)
            this.setState({
              showMsg: false,
            });
          else {
            if (this.state.isRedirected === true)
              this.setState({
                showMsg: false,
                isRedirected: false
              });
            else
              this.setState({
                showMsg: false,
                redirect: true
              });
          }
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
            label={t('Login.label_username')}
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
            label={t('Login.label_password')}
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
            {t('Login.button_signin')}
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

const TranslatedLogin = withTranslation()(Login);

export default TranslatedLogin;