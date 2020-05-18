// Imports
import React from 'react';
import { connect } from 'react-redux';
import path from 'path';
import _ from 'lodash';
import { Redirect } from "react-router-dom";
import { withTranslation } from 'react-i18next';

// Material UI Components
import { Container, Typography, TextField, Button, ButtonGroup, List, ListSubheader, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, Select, MenuItem, Tooltip} from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import BuildIcon from '@material-ui/icons/Build';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

// Components
import Message from './Message';
import FileListItem from './FileListItem';

// Styles
import '../css/Dashboard.css';

// Actions
import { logout } from '../actions/loginActions';
import { getAllPosts, getAllPages, getAllStats, generate, deploy, clean, filterItems, newFile } from '../actions/dashboardActions';
import { showMessage, dismissMessage } from '../actions/messageActions';

import Status from '../status';

// Set up react-redux
const mapStateToProps = (state) => {
  const { ifShowMessage, ifMessageIsError, messageCode } = state.message;
  const { token } = state.auth;
  const { stats, query } = state.dashboard;
  let { posts, pages } = state.dashboard;
  // Filter posts and pages for display
  posts = _.filter(posts, value => value.toLowerCase().includes(query.toLowerCase()));
  pages = _.filter(pages, value => value.toLowerCase().includes(query.toLowerCase()));

  return { ifShowMessage, ifMessageIsError, messageCode, token, posts, pages, stats, query };
}

const mapDispatchToProps = { logout, getAllPosts, getAllPages, getAllStats, generate, deploy, clean, filterItems, newFile, showMessage, dismissMessage };

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newFileModal: false,
      newFileType: 'post',
      newFileName: '',
      redirect: this.props.token ? false : true,   // If no token, redirect to /
      isLoggedOut: false
    }
    // Make debounced function
    this.debouncedSetNewQuery = _.debounce((newQuery) => {
      this.props.filterItems(newQuery);
    }, 500);
    // Set title
    document.title = this.props.t('Dashboard.title');
  }

  static getDerivedStateFromProps(props) {
    return {
      redirect: props.token ? false : true
    }
  }

  componentDidMount() {
    this.props.getAllPosts();
    this.props.getAllPages();
    this.props.getAllStats();
  }

  setOpenDialog(open) {
    this.setState({
      newFileModal: open
    });
  }

  openEditor(fileType, name) {
    this.props.history.push(path.resolve(process.env.REACT_APP_ROOT, 'compose'), {
      fileType, name
    });
  }

  render() {
    // Setup translation function
    const { t } = this.props;
    if (this.state.redirect) {
      if (!this.state.isLoggedOut)
        this.props.showMessage(true, Status.AUTH_NOT_LOGGED_IN);
      return (
        <Redirect to={{
          pathname: process.env.REACT_APP_ROOT,
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
            <Tooltip title={t('Dashboard.tooltip_new')}>
              <Button variant="outlined" color='secondary' onClick={() => this.setOpenDialog(true)}>
                <AddCircleIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t('Dashboard.tooltip_generate')}>
              <Button variant="outlined" color='secondary' onClick={() => this.props.generate()}>
                <BuildIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t('Dashboard.tooltip_deploy')}>
              <Button variant="outlined" color="secondary" onClick={() => this.props.deploy()}>
                <PublishIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t('Dashboard.tooltip_clean')}>
              <Button variant="outlined" color="secondary" onClick={() => this.props.clean()}>
                <DeleteSweepIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t('Dashboard.tooltip_signout')}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  this.setState({
                    redirect: true,
                    isLoggedOut: true
                  });
                  this.props.logout();
                }}>
                <ExitToAppIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </div>
        <div className="search-box">
          <TextField
            margin="dense"
            label={t('Dashboard.label_search')}
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
              {t('Dashboard.listsubheader_posts')} - {this.props.posts.length}
              {
                this.props.posts.length === 0 && 
                <Typography component="h6">
                  {t('Dashboard.listsubheader_text_noposts')}
                </Typography>
              }
            </ListSubheader>
          }
        >
          {
            this.props.posts.map(post => 
              <FileListItem
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
              {t('Dashboard.listsubheader_pages')} - {this.props.pages.length}
              {
                this.props.pages.length === 0 && 
                <Typography component="h6">
                  {t('Dashboard.listsubheader_text_nopages')}
                </Typography>
              }
            </ListSubheader>
          }
        >
          {
            this.props.pages.map(page =>
              <FileListItem
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
        <Dialog open={this.state.newFileModal} fullWidth maxWidth="sm" onClose={() => {this.setState({newFileModal: false})}}>
          <DialogTitle>{t('Dashboard.dialog_new_title')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('Dashboard.dialog_new_helper')}
            </DialogContentText>
            <FormControl required fullWidth>
              <InputLabel id="file-type">{t('Dashboard.dialog_new_label_type')}</InputLabel>
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
                <MenuItem value={'post'}>{t('Dashboard.dialog_menuitem_post')}</MenuItem>
                <MenuItem value={'page'}>{t('Dashboard.dialog_menuitem_page')}</MenuItem>
              </Select>
              <TextField
                autoFocus
                margin="dense"
                label={t('Dashboard.dialog_new_label_name')}
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
            <Button onClick={() => {this.setOpenDialog(false)}}>
              {t('Dashboard.dialog_button_cancel')}
            </Button>
            <Button color="secondary" onClick={() => {
              // newFile now returns a promise
              this.props.newFile(this.state.newFileType, this.state.newFileName)
                .then(() => {
                  this.setOpenDialog(false);
                })
                .catch((err) => {
                  // Do nothing, do not close the modal
                });
            }}>
              {t('Dashboard.dialog_new_button_ok')}
            </Button>
          </DialogActions>
        </Dialog>
        <Message
          ifShowMessage={this.props.ifShowMessage}
          ifMessageIsError={this.props.ifMessageIsError}
          messageCode={this.props.messageCode}
          handleClose={() => {
            this.props.dismissMessage();
          }}
        />
      </Container>
    );
  }
}

const TranslatedDashboard = withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Dashboard));

export default TranslatedDashboard;