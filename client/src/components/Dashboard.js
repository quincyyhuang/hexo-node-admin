// Imports
import React from 'react';
import axios from 'axios';
import path from 'path';
import _ from 'lodash';
import { Redirect } from "react-router-dom";

// Material UI Components
import { Container, Typography, TextField, Button, ButtonGroup, List, ListItem, ListItemIcon, ListItemText, ListSubheader, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, Select, MenuItem, Snackbar, Tooltip} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import DescriptionIcon from '@material-ui/icons/Description';
import PagesIcon from '@material-ui/icons/Pages';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import BuildIcon from '@material-ui/icons/Build';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import pink from '@material-ui/core/colors/pink';

// Styles
import '../css/Dashboard.css';

function MyListItem(props) {
  return (
    <ListItem
      button
      className='my-list-item'
      onClick={() => {
        props.handleClick(props.itemType, props.name);
      }}
    >
      <ListItemIcon>
        {
          props.itemType === 'post' ? <DescriptionIcon style={{color: pink[400]}} /> : <PagesIcon style={{color: pink[400]}} />
        }
      </ListItemIcon>
      <ListItemText primary={props.name} />
    </ListItem>
  );
}

// Components
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Message(props) {
  return (
    <Snackbar
      open={props.showMsg}
      autoHideDuration={3000}
      onClose={props.handleClose}
    >
      <Alert severity={props.error ? 'error' : 'success'}>
        {props.msg}
      </Alert>
    </Snackbar>
  );
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: null,
      error: false,
      showMsg: false,
      token: null,
      posts: [],
      pages: [],
      query: '',
      stats: null,
      newFileModal: false,
      newFileType: 'post',
      newFileName: ''
    }
    // Make debounced function
    this.debouncedSetNewQuery = _.debounce((newQuery) => {
      this.setState({
        query: newQuery
      });
    }, 500);
    // Set title
    document.title = 'Hexo Node Admin - Dashboard';
    // Redirect if no token
    let token = localStorage.getItem('token');
    if (token)
      this.state.token = token;
    else {
      this.state.msg = 'Please sign in.';
      this.state.error = true;
    }
    // Handle redirect to here error message
    if (props.location.state) {
      this.state.error = props.location.state.error;
      this.state.msg = props.location.state.msg;
      if (this.state.msg)
        this.state.showMsg = true;
    }
  }

  // Getter properties
  get filteredPosts() {
    return _.filter(this.state.posts, value => value.toLowerCase().includes(this.state.query.toLowerCase()));
  }

  get filteredPages() {
    return _.filter(this.state.pages, value => value.toLowerCase().includes(this.state.query.toLowerCase()));
  }

  componentDidMount() {
    if (this.state.token)
      this.fetchData();
  }

  fetchData() {
    // Fetch data
    const entry_point = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo');
    const posts_all = path.resolve(entry_point, 'posts', 'all');
    const pages_all = path.resolve(entry_point, 'pages', 'all');
    const stats_all = path.resolve(entry_point, 'stats');
    // Setup header
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    // Setup promises
    const p_posts = axios.get(posts_all, config);
    const p_pages = axios.get(pages_all, config);
    const p_stats = axios.get(stats_all, config);
    axios.all([p_posts, p_pages, p_stats])
      .then(([posts, pages, stats]) => {
        this.setState({
          posts: posts.data,
          pages: pages.data,
          stats: stats.data
        });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: err.response.data.msg,
            error: true
          });
        }
        else {
          this.setState({
            msg: err.response.data.msg || 'Failed to connect to server',
            error: true,
            showMsg: true
          });
        }
      });
  }

  logout() {
    localStorage.removeItem('token');
    this.setState({
      msg: 'Signed out.',
      error: false,
      token: null
    });
  }

  setOpenDialog(open) {
    this.setState({
      newFileModal: open
    });
  }

  handleSubmit() {
    if (!this.state.newFileName)
      this.setState({
        msg: 'Empty file name.',
        error: true,
        showMsg: true
      });
    else
    {
      const endpoint = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo', 'new');
      const config = {
        headers: {
          'Authorization': ['Bearer', this.state.token].join(' ')
        }
      }
      axios.get(path.resolve(endpoint, this.state.newFileType, this.state.newFileName), config)
        .then((res) => {
          this.setState({
            msg: res.data.msg,
            error: false,
            showMsg: true,
            newFileModal: false
          });
          this.fetchData();
        })
        .catch((err) => {
          if (err.response.status === 401) {
            // Unauthorized
            localStorage.removeItem('token');
            this.setState({
              token: null,
              msg: err.response.data.msg,
              error: true
            });
          }
          else
            this.setState({
              msg: err.response.data.msg || 'Failed to connect to server.',
              error: true,
              showMsg: true,
              newFileModal: false
            });
        });
    }
  }

  generate() {
    const endpoint = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo', 'generate');
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    axios.get(endpoint, config)
      .then((res) => {
        this.setState({
          msg: res.data.msg,
          error: false,
          showMsg: true
        });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: err.response.data.msg,
            error: true
          });
        }
        else
          this.setState({
            msg: err.response.data.msg || 'Failed to connect to server.',
            error: true,
            showMsg: true,
          });
      });
  }

  deploy() {
    const endpoint = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo', 'deploy');
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    axios.get(endpoint, config)
      .then((res) => {
        this.setState({
          msg: res.data.msg,
          error: false,
          showMsg: true
        });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: err.response.data.msg,
            error: true
          });
        }
        else
          this.setState({
            msg: err.response.data.msg || 'Failed to connect to server.',
            error: true,
            showMsg: true,
          });
      });
  }

  clean() {
    const endpoint = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo', 'clean');
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    axios.get(endpoint, config)
      .then((res) => {
        this.setState({
          msg: res.data.msg,
          error: false,
          showMsg: true
        });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: err.response.data.msg,
            error: true
          });
        }
        else
          this.setState({
            msg: err.response.data.msg || 'Failed to connect to server.',
            error: true,
            showMsg: true,
          });
      });
  }

  openEditor(fileType, name) {
    this.props.history.push(path.resolve(process.env.REACT_APP_ROOT, 'compose'), {
      fileType, name
    });
  }

  render() {
    if (!this.state.token) {
      return (
        <Redirect to={{
          pathname: process.env.REACT_APP_ROOT,
          state: {
            msg: this.state.msg,
            error: this.state.error
          }
        }} />
      );
    }
    return (
      <Container component='main' maxWidth='sm' className='root'>
        <div className='header'>
          <Typography component="h1" variant="h4">
            Hexo Node Admin
          </Typography>
        </div>
        <div className='button-group'>
          <ButtonGroup fullWidth>
            <Tooltip title="New">
              <Button variant="outlined" color='secondary' onClick={() => this.setOpenDialog(true)}>
                <AddCircleIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Generate">
              <Button variant="outlined" color='secondary' onClick={() => this.generate()}>
                <BuildIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Deploy">
              <Button variant="outlined" color="secondary" onClick={() => this.deploy()}>
                <PublishIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Clean">
              <Button variant="outlined" color="secondary" onClick={() => this.clean()}>
                <DeleteSweepIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Sign out">
              <Button variant="outlined" color="secondary" onClick={() => this.logout()}>
                <ExitToAppIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </div>
        <div className="search-box">
          <TextField
            margin="dense"
            label="Search"
            type="text"
            fullWidth
            color="secondary"
            variant="outlined"
            onChange={(e) => {
              this.debouncedSetNewQuery(e.target.value);
            }}
          />
        </div>
        <Divider />
        <List
          component='nav'
          dense
          subheader={
            <ListSubheader component="div">
              Posts - {this.filteredPosts.length}
              {
                this.filteredPosts.length === 0 && 
                <Typography component="h6">
                  No posts.
                </Typography>
              }
            </ListSubheader>
          }
        >
          {
            this.filteredPosts.map(post => 
              <MyListItem
                itemType='post'
                name={post}
                key={post}
                handleClick={(fileType, name) => {this.openEditor(fileType, name)}}
              />
            )
          }
        </List>
        <Divider />
        <List
          component='nav'
          dense
          subheader={
            <ListSubheader component="div">
              Pages - {this.filteredPages.length}
              {
                this.filteredPosts.length === 0 && 
                <Typography component="h6">
                  No pages.
                </Typography>
              }
            </ListSubheader>
          }
        >
          {
            this.filteredPages.map(page =>
              <MyListItem
                itemType='page'
                name={page}
                key={page}
                handleClick={(fileType, name) => {this.openEditor(fileType, name)}}
              />
            )
          }
        </List>
        {/* 
        Modal dialog
        */}
        <Dialog open={this.state.newFileModal} onClose={() => {this.setState({newFileModal: false})}}>
          <DialogTitle>Create a new file</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please select file type and enter file name.
            </DialogContentText>
            <FormControl required fullWidth>
              <InputLabel id="file-type">Type</InputLabel>
              <Select
                labelId="file-type"
                value={this.state.newFileType}
                fullWidth
                color="secondary"
                onChange={(e) => {
                  this.setState({
                    newFileType: e.target.value
                  });
                }}
              >
                <MenuItem value={'post'}>Post</MenuItem>
                <MenuItem value={'page'}>Page</MenuItem>
              </Select>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                color="secondary"
                required
                onChange={(e) => {
                  this.setState({
                    newFileName: e.target.value
                  });
                }}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={() => {this.setOpenDialog(false)}}>
              Cancel
            </Button>
            <Button color="secondary" onClick={() => {this.handleSubmit()}}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
        <Message
          showMsg={this.state.showMsg}
          msg={this.state.msg}
          error={this.state.error}
          handleClose={() => {
            this.setState({
              showMsg: false
            });
          }}
        />
      </Container>
    );
  }
}

export default Dashboard;