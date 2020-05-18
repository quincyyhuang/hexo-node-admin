// Imports
import React from 'react';
import path from 'path';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Redirect } from "react-router-dom";

// Material UI Components
import { styled } from '@material-ui/core/styles';
import { Container, Avatar, Typography, TextField, Button, Box} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import pink from '@material-ui/core/colors/pink';

// Components
import Copyright from './Copyright';
import Message from './Message';

// Actions
import { login } from '../actions/loginActions';
import { dismissMessage } from '../actions/messageActions';

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

// Set up react-redux
const mapStateToProps = (state) => {
  const { ifShowMessage, ifMessageIsError, messageCode } = state.message;
  const { token } = state.auth;

  return { ifShowMessage, ifMessageIsError, messageCode, token };
}

const mapDispatchToProps = { login, dismissMessage };

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,
      redirect: this.props.token ? true : false,
    }
    // Set title
    document.title = this.props.t('Login.title');
  }

  render() {
    // Setup translation function
    const { t } = this.props;
    if (this.state.redirect)
      return <Redirect to={path.resolve(process.env.REACT_APP_ROOT, '!')} />
    return (
      <div>
      <Message
        ifShowMessage={this.props.ifShowMessage}
        ifMessageIsError={this.props.ifMessageIsError}
        messageCode={this.props.messageCode}
        handleClose={() => {
          this.props.dismissMessage();
          if (this.props.token)
            this.setState({ redirect: true });
        }}
      />
      <Container component='main' maxWidth='xs'>
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
              this.props.login(this.state.username, this.state.password);
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
      </div>
    );
  }
}

const TranslatedLogin = withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Login));

export default TranslatedLogin;