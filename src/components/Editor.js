// Imports
import React from 'react';
import axios from 'axios';
import path from 'path';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import { Redirect } from "react-router-dom";
import { withTranslation } from 'react-i18next';

// Material UI Components
import { Box, Typography, AppBar, Toolbar, Button, ButtonGroup, Tooltip, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import SaveIcon from '@material-ui/icons/Save';
import BackupIcon from '@material-ui/icons/Backup';
import ListAltIcon from '@material-ui/icons/ListAlt';
import DeleteIcon from '@material-ui/icons/Delete';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import pink from '@material-ui/core/colors/pink';

// Styles
import '../css/Editor.css';
import 'react-markdown-editor-lite/lib/index.css';

import Status from '../status';

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

function AssetListItem(props) {
  return (
    <ListItem
    >
      <ListItemIcon>
        <AttachFileIcon />
      </ListItemIcon>
      <ListItemText primary={props.name} />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={() => props.handleDeleteAsset(props.name)}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleted: false,
      loaded: true,
      msg: null,
      error: false,
      showMsg: false,
      token: null,
      lastSavedContent: null,
      content: null,
      ifChanged: false,
      assets: [],
      type: this.props.location.state ? this.props.location.state.fileType : null,
      name: this.props.location.state ? this.props.location.state.name : null,
      showDeleteDialog: false,
      showAssetsDialog: false,
      showUploadDialog: false
    }
    // Make ref for markdown editor
    this.mdEditor = React.createRef();
    // Make ref for file upload
    this.fileInput = React.createRef();
    // Make this
    this.handleResize = this.handleResize.bind(this); // This is SO important, otherwise this would be the Window
    this.handleEditorKeyboard = this.handleEditorKeyboard.bind(this);
    this.handlePageOnClose = this.handlePageOnClose.bind(this);
    this.handleDeleteAsset = this.handleDeleteAsset.bind(this);
    // Detect window size to determine whether to show Markdown preview
    if (window.innerWidth <= 768)
      this.state.showMDPreview = false
    // Set title
    document.title = `${this.state.name} - ${this.props.t('Editor.title')}`;
    // Redirect if no token
    let token = localStorage.getItem('token');
    if (token)
      this.state.token = token;
    else {
      this.state.msg = this.props.t('Message.PLEASE_SIGN_IN');
      this.state.error = true;
    }
    // Set markdown parser
    this.mdParser = new MarkdownIt();
  }

  componentDidMount() {
    // Set window listener
    window.addEventListener('resize', this.handleResize); // Handle resize
    window.addEventListener('beforeunload', this.handlePageOnClose);
    // Set editor keyboard listener
    if (this.mdEditor.current)
      this.mdEditor.current.onKeyboard({
        key: 's',
        withKey: window.navigator.platform === 'MacIntel' ? ['metaKey'] : ['ctrlKey'],
        callback: this.handleEditorKeyboard.bind(this)
      });
    if (this.state.token) {
      this.loadFileContent(true);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('beforeunload', this.handlePageOnClose);
    if (this.mdEditor.current)
      this.mdEditor.current.offKeyboard({
        key: 's',
        withKey: window.navigator.platform === 'MacIntel' ? ['metaKey'] : ['ctrlKey'],
        callback: this.handleEditorKeyboard
      });
  }

  handleResize() {
    if (window.innerWidth <= 768)
      this.mdEditor.current.setView({
        html: false
      });
    else
      this.mdEditor.current.setView({
        html: true
      });
  }

  handleEditorKeyboard() {
    this.save();
  }

  handlePageOnClose(e) {
    // e.preventDefault();  // If added, Firefox will show the prompt anyway
    if (this.state.ifChanged)
      return e.returnValue = 'You have unsaved changes, are you sure to continue?';
  }

  loadFileContent(initial = false) {
    const entry_point = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo');
    let end_point;
    if (this.state.type === 'post')
      end_point = path.resolve(entry_point, 'posts', this.state.name);
    else if (this.state.type === 'page')
      end_point = path.resolve(entry_point, 'pages', this.state.name);
    // Setup header
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    axios.get(end_point, config)
      .then((res) => {
        this.setState({
          content: res.data.replace(/\r\n/g, '\n')  // Change CRLF to LF for Windows
        });
        if (initial)
          this.setState({
            lastSavedContent: res.data.replace(/\r\n/g, '\n')
          });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`),
            error: true,
            loaded: false
          });
        }
        else {
          this.setState({
            msg: Status.getCodeTranslationKey(err.response.data.code) ? this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`) : this.props.t('Message.FAILED_TO_CONNECT_SERVER'),
            error: true,
            loaded: false
          });
        }
      });
  }

  loadAssets() {
    const entry_point = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo', 'assets');
    let end_point = path.resolve(entry_point, this.state.type, this.state.name);
    // Setup header
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    axios.get(end_point, config)
      .then((res) => {
        this.setState({
          assets: res.data
        });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`),
            error: true
          });
        }
        else {
          this.setState({
            msg: Status.getCodeTranslationKey(err.response.data.code) ? this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`) : this.props.t('Message.FAILED_TO_CONNECT_SERVER'),
            error: true,
            showMsg: true,
            showAssetsDialog: false
          });
        }
      });
  }

  save() {
    const entry_point = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo');
    let end_point;
    if (this.state.type === 'post')
      end_point = path.resolve(entry_point, 'posts', this.state.name);
    else if (this.state.type === 'page')
      end_point = path.resolve(entry_point, 'pages', this.state.name);
    // Setup header
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    axios.post(end_point, {content: this.state.content}, config)
      .then((res) => {
        this.setState({
          error: false,
          msg: this.props.t(`Message.${Status.getCodeTranslationKey(res.data.code)}`),
          showMsg: true,
          lastSavedContent: this.state.content,
          ifChanged: false
        });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`),
            error: true
          });
        }
        else {
          this.setState({
            msg: Status.getCodeTranslationKey(err.response.data.code) ? this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`) : this.props.t('Message.FAILED_TO_CONNECT_SERVER'),
            error: true,
            showMsg: true
          });
        }
      });
  }

  delete() {
    const entry_point = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo', 'delete');
    let end_point = path.resolve(entry_point, this.state.type, this.state.name);
    // Setup header
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    axios.get(end_point, config)
      .then((res) => {
        this.setState({
          error: false,
          msg: this.props.t(`Message.${Status.getCodeTranslationKey(res.data.code)}`),
          deleted: true
        });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`),
            error: true
          });
        }
        else {
          this.setState({
            msg: Status.getCodeTranslationKey(err.response.data.code) ? this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`) : this.props.t('Message.FAILED_TO_CONNECT_SERVER'),
            error: true,
            showMsg: true
          });
        }
      });
  }

  handleDeleteAsset(fileName) {
    const entry_point = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo', 'delete');
    let end_point = path.resolve(entry_point, this.state.type, this.state.name, fileName);
    // Setup header
    const config = {
      headers: {
        'Authorization': ['Bearer', this.state.token].join(' ')
      }
    }
    axios.get(end_point, config)
      .then((res) => {
        this.setState({
          error: false,
          msg: this.props.t(`Message.${Status.getCodeTranslationKey(res.data.code)}`),
          showMsg: true
        });
        this.loadAssets();
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Unauthorized
          localStorage.removeItem('token');
          this.setState({
            token: null,
            msg: this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`),
            error: true
          });
        }
        else {
          this.setState({
            msg: Status.getCodeTranslationKey(err.response.data.code) ? this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`) : this.props.t('Message.FAILED_TO_CONNECT_SERVER'),
            error: true,
            showMsg: true
          });
        }
      });
  }

  upload() {
    const files = this.fileInput.current.files;
    if (files.length === 0) {
      return this.setState({
        msg: this.props.t('Message.NO_FILES_SELECTED'),
        error: true,
        showMsg: true
      });
    }
    else if (files.length > 5) {
      return this.setState({
        msg: this.props.t('Message.TOO_MANY_FILES_SELECTED'),
        error: true,
        showMsg: true
      });
    }
    else
    {
      let formData = new FormData();
      for (let i = 0; i < files.length; i++)
        formData.append('file', files[i])
      const entry_point = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo', 'upload');
      let end_point = path.resolve(entry_point, this.state.type, this.state.name);
      // Setup header
      const config = {
        headers: {
          'Authorization': ['Bearer', this.state.token].join(' '),
          'Content-Type': 'multipart/form-data'
        }
      }
      axios.post(end_point, formData, config)
        .then((res) => {
          this.setState({
            error: false,
            msg: this.props.t(`Message.${Status.getCodeTranslationKey(res.data.code)}`),
            showMsg: true,
            showUploadDialog: false
          });
        })
        .catch((err) => {
          if (err.response.status === 401) {
            // Unauthorized
            localStorage.removeItem('token');
            this.setState({
              token: null,
              msg: this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`),
              error: true
            });
          }
          else {
            this.setState({
              msg: Status.getCodeTranslationKey(err.response.data.code) ? this.props.t(`Message.${Status.getCodeTranslationKey(err.response.data.code)}`) : this.props.t('Message.FAILED_TO_CONNECT_SERVER'),
              error: true,
              showMsg: true
            });
          }
        });
    }
  }

  setOpenDialog(open) {
    this.setState({
      showDeleteDialog: open
    });
  }

  setOpenAssetsDialog(open) {
    this.setState({
      showAssetsDialog: open
    });
  }

  setOpenUploadDialog(open) {
    this.setState({
      showUploadDialog: open
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.setState({
      msg: this.props.t('Message.SIGNED_OUT'),
      error: false,
      token: null
    });
  }

  render() {
    // Setup translation function
    const { t } = this.props;
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
    if (this.state.deleted || !this.state.loaded) {
      return (
        <Redirect to={{
          pathname: path.resolve(process.env.REACT_APP_ROOT, '!'),
          state: {
            msg: this.state.msg,
            error: this.state.error
          }
        }} />
      );
    }
    if (!this.state.type || !this.state.name) {
      return (
        <Redirect to={{
          pathname: path.resolve(process.env.REACT_APP_ROOT, '!')
        }} />
      );
    }
    return (
      <div className="base">
        <AppBar position="relative" style={{backgroundColor: pink[500]}}>
          <Toolbar>
            <Box display={{ xs: 'block', sm: 'none' }} className="title">
              <Typography component="h1" variant="h6">
                Hexo Node Admin: [{this.state.type === 'post' ? t('Editor.title_post') : t('Editor.title_page')}]<b>{this.state.name}{this.state.ifChanged ? '*' : null}</b>
              </Typography>
            </Box>
            <Box display={{ xs: 'none', sm: 'block' }} className="title">
              <Typography component="h1" variant="h4">
                Hexo Node Admin: [{this.state.type === 'post' ? t('Editor.title_post') : t('Editor.title_page')}]<b>{this.state.name}{this.state.ifChanged ? '*' : null}</b>
              </Typography>
            </Box>
            <Box display={{ xs: 'none', sm: 'block' }}>
              <ButtonGroup size="small" variant="outlined" color="inherit">
                <Tooltip title={`${t('Editor.tooltip_save')} (${window.navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl'}S)`}>
                  <Button
                    onClick={() => this.save()}
                  >
                    <SaveIcon />
                  </Button>
                </Tooltip>
                <Tooltip title={t('Editor.tooltip_upload')}>
                  <Button
                    onClick={() => this.setOpenUploadDialog(true)}
                  >
                    <BackupIcon />
                  </Button>
                </Tooltip>
                <Tooltip title={t('Editor.tooltip_assets')}>
                  <Button
                    onClick={() => {
                      this.loadAssets();
                      this.setOpenAssetsDialog(true);
                    }}
                  >
                    <ListAltIcon />
                  </Button>
                </Tooltip>
                <Tooltip title={t('Editor.tooltip_delete')}>
                  <Button
                    onClick={() => this.setOpenDialog(true)}
                  >
                    <DeleteIcon />
                  </Button>
                </Tooltip>
                <Tooltip title={t('Editor.tooltip_signout')}>
                  <Button
                    onClick={() => this.logout()}
                  >
                    <ExitToAppIcon />
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Box>
          </Toolbar>
        </AppBar>
        <Box display={{ xs: 'block', sm: 'none' }}>
          <ButtonGroup size="small" variant="contained" color="inherit" fullWidth>
            <Tooltip title={`${t('Editor.tooltip_save')} (${window.navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl'}S)`}>
              <Button
                onClick={() => this.save()}
              >
                <SaveIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t('Editor.tooltip_upload')}>
              <Button
                onClick={() => this.setOpenUploadDialog(true)}
              >
                <BackupIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t('Editor.tooltip_assets')}>
              <Button
                onClick={() => {
                  this.loadAssets();
                  this.setOpenAssetsDialog(true);
                }}
              >
                <ListAltIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t('Editor.tooltip_delete')}>
              <Button
                onClick={() => this.setOpenDialog(true)}
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
            <Tooltip title={t('Editor.tooltip_signout')}>
              <Button
                onClick={() => this.logout()}
              >
                <ExitToAppIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
        <div className="editor-wrapper">
          <MdEditor
            ref={this.mdEditor}
            value={this.state.content}
            style={{height: '100%'}}
            renderHTML={(text) => this.mdParser.render(text)}
            config={{
              view: {
                menu: true,
                md: true,
                html: window.innerWidth > 768 ? true : false
              }
            }}
            onChange={({html, text}) => {
              this.setState({
                content: text,
                ifChanged: !(text === this.state.lastSavedContent)
              });
            }}
          />
        </div>
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
        <Dialog open={this.state.showDeleteDialog} onClose={() => this.setOpenDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t('Editor.dialog_delete_title')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('Editor.dialog_delete_text')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="default" onClick={() => {this.setOpenDialog(false)}}>
              {t('Editor.dialog_button_cancel')}
            </Button>
            <Button color="secondary" onClick={() => {this.delete()}}>
              {t('Editor.dialog_delete_button')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.showUploadDialog} onClose={() => this.setOpenUploadDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t('Editor.dialog_upload_title')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('Editor.dialog_upload_text1')}<br /> {t('Editor.dialog_upload_text2')}
            </DialogContentText>
            <FormControl fullWidth>
              <input type="file" multiple ref={this.fileInput} />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button color="default" onClick={() => {this.setOpenUploadDialog(false)}}>
              {t('Editor.dialog_button_cancel')}
            </Button>
            <Button color="primary" onClick={() => this.upload()}>
              {t('Editor.dialog_upload_button')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.showAssetsDialog} onClose={() => this.setOpenAssetsDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t('Editor.dialog_assets_title')}</DialogTitle>
          <DialogContent>
            {
              this.state.assets.length === 0 &&
              <DialogContentText>
                {t('Editor.dialog_assets_nofiles_text')}
              </DialogContentText>
            }
            {
              this.state.assets.length > 0 &&
              <DialogContentText>
                {t('Editor.dialog_assets_helper')} <br /> {'{% asset_path slug %}'} <br /> {'{% asset_img slug [title] %}'} <br /> {'{% asset_link slug [title] %}'}
              </DialogContentText>
            }
            <List>
              {
                this.state.assets.map(value => <AssetListItem name={value} key={value} handleDeleteAsset={this.handleDeleteAsset} />)
              }
            </List>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const TranslatedEditor = withTranslation()(Editor);

export default TranslatedEditor;