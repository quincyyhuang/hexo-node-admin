// Imports
import React from 'react';
import { connect } from 'react-redux';
import path from 'path';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import { Redirect } from "react-router-dom";
import { withTranslation } from 'react-i18next';

// Material UI Components
import { Box, Typography, AppBar, Toolbar, Button, ButtonGroup, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, List  } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import BackupIcon from '@material-ui/icons/Backup';
import ListAltIcon from '@material-ui/icons/ListAlt';
import DeleteIcon from '@material-ui/icons/Delete';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import Message from './Message';
import AssetListItem from './AssetListItem';

import pink from '@material-ui/core/colors/pink';

// Styles
import '../css/Editor.css';
import 'react-markdown-editor-lite/lib/index.css';

// Actions
import { logout } from '../actions/loginActions';
import { getFile, saveFile, onChangeFile, deleteFile, getAssets, deleteAsset, uploadAsset } from '../actions/editorActions';
import { showMessage, dismissMessage } from '../actions/messageActions';

import Status from '../status';

// Set up react-redux
const mapStateToProps = (state) => {
  const { ifShowMessage, ifMessageIsError, messageCode } = state.message;
  const { token } = state.auth;
  let { ifChanged, content, lastSavedContent, assets } = state.editor;
  // Change CRLF to LF on Windows so that on change * can function correctly
  content = content.replace(/\r\n/g, '\n');
  lastSavedContent = lastSavedContent.replace(/\r\n/g, '\n');

  return { ifShowMessage, ifMessageIsError, messageCode, token, ifChanged, content, lastSavedContent, assets };
}

const mapDispatchToProps = { logout, getFile, saveFile, onChangeFile, deleteFile, getAssets, deleteAsset, uploadAsset, showMessage, dismissMessage };

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleted: false,
      isLoggedOut: false,
      type: this.props.location.state ? this.props.location.state.fileType : null,
      name: this.props.location.state ? this.props.location.state.name : null,
      showMDPreview: true,
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
    // Set markdown parser
    this.mdParser = new MarkdownIt();
  }

  componentDidMount() {
    // Set window listener
    window.addEventListener('resize', this.handleResize); // Handle resize
    window.addEventListener('orientationchange', this.handleResize); // Handle rotate
    window.addEventListener('beforeunload', this.handlePageOnClose);
    // Set editor keyboard listener
    if (this.mdEditor.current)
      this.mdEditor.current.onKeyboard({
        key: 's',
        withKey: window.navigator.platform === 'MacIntel' ? ['metaKey'] : ['ctrlKey'],
        callback: this.handleEditorKeyboard.bind(this)
      });
    // Load content
    this.props.getFile(this.state.type, this.state.name);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
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
    this.props.saveFile(this.state.type, this.state.name, this.props.content);
  }

  handlePageOnClose(e) {
    // e.preventDefault();  // If added, Firefox will show the prompt anyway
    if (this.props.ifChanged)
      return e.returnValue = 'You have unsaved changes, are you sure to continue?';
  }

  handleDeleteAsset(fileName) {
    this.props.deleteAsset(this.state.type, this.state.name, fileName);
  }

  upload() {
    const files = this.fileInput.current.files;
    if (files.length === 0) {
      return this.props.showMessage(true, Status.NO_FILES_SELECTED);
    }
    else if (files.length > 5) {
      return this.props.showMessage(true, Status.TOO_MANY_FILES_SELECTED);
    }
    else
    {
      let formData = new FormData();
      for (let i = 0; i < files.length; i++)
        formData.append('file', files[i])
      this.props.uploadAsset(this.state.type, this.state.name, formData)
        .then(() => {
          // Close upload modal
          this.setState({
            showUploadDialog: false
          });
        })
        .catch(() => {});
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

  render() {
    // Setup translation function
    const { t } = this.props;
    if (this.state.isLoggedOut)
      return <Redirect to={{ pathname: process.env.REACT_APP_ROOT }} />;
    if (!this.props.token) {
      this.props.showMessage(true, Status.AUTH_NOT_LOGGED_IN);
      return <Redirect to={{ pathname: process.env.REACT_APP_ROOT }} />;
    }
    if (this.state.deleted)
      return <Redirect to={{ pathname: path.resolve(process.env.REACT_APP_ROOT, '!') }} />;
    if (!this.state.type || !this.state.name)
      return <Redirect to={{ pathname: path.resolve(process.env.REACT_APP_ROOT, '!') }} />;

    return (
      <div id="base">
        <AppBar position="relative" style={{backgroundColor: pink[500]}}>
          <Toolbar>
            <Box display={{ xs: 'block', sm: 'none' }} className="title">
              <Typography component="h1" variant="h6">
                Hexo Node Admin: [{this.state.type === 'post' ? t('Editor.title_post') : t('Editor.title_page')}]<b>{this.state.name}{this.props.ifChanged ? '*' : null}</b>
              </Typography>
            </Box>
            <Box display={{ xs: 'none', sm: 'block' }} className="title">
              <Typography component="h1" variant="h4">
                Hexo Node Admin: [{this.state.type === 'post' ? t('Editor.title_post') : t('Editor.title_page')}]<b>{this.state.name}{this.props.ifChanged ? '*' : null}</b>
              </Typography>
            </Box>
            <Box display={{ xs: 'none', sm: 'block' }}>
              <ButtonGroup size="small" variant="outlined" color="inherit">
                <Tooltip title={`${t('Editor.tooltip_save')} (${window.navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl'}S)`}>
                  <Button
                    onClick={() => this.props.saveFile(this.state.type, this.state.name, this.props.content)}
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
                      this.props.getAssets(this.state.type, this.state.name)
                        .then(() => {
                          // Open dialog only when successful
                          this.setOpenAssetsDialog(true);
                        })
                        .catch(() => {});
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
                    onClick={() => {
                      this.setState({
                        isLoggedOut: true
                      });
                      this.props.logout();
                    }}
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
                onClick={() => this.props.saveFile(this.state.type, this.state.name, this.props.content)}
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
                  this.props.getAssets(this.state.type, this.state.name);
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
                onClick={() => {
                  this.setState({
                    isLoggedOut: true
                  });
                  this.props.logout();
                }}
              >
                <ExitToAppIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
        <div className="editor-wrapper">
          <MdEditor
            ref={this.mdEditor}
            value={this.props.content}
            style={{ flexGrow: 1 }}
            renderHTML={(text) => this.mdParser.render(text)}
            config={{
              view: {
                menu: true,
                md: true,
                html: window.innerWidth > 768 ? true : false
              }
            }}
            onChange={({html, text}) => {
              this.props.onChangeFile(text);
            }}
          />
        </div>
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
            <Button
              color="secondary"
              onClick={() => {
                this.props.deleteFile(this.state.type, this.state.name)
                  .then(() => {
                    // Can redirect to dashboard
                    this.setState({
                      deleted: true
                    });
                  })
                  .catch(() => {});
              }}
            >
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
              this.props.assets.length === 0 &&
              <DialogContentText>
                {t('Editor.dialog_assets_nofiles_text')}
              </DialogContentText>
            }
            {
              this.props.assets.length > 0 &&
              <DialogContentText>
                {t('Editor.dialog_assets_helper')} <br /> {'{% asset_path slug %}'} <br /> {'{% asset_img slug [title] %}'} <br /> {'{% asset_link slug [title] %}'}
              </DialogContentText>
            }
            <List>
              {
                this.props.assets.map(value => <AssetListItem name={value} key={value} handleDeleteAsset={this.handleDeleteAsset} />)
              }
            </List>
          </DialogContent>
        </Dialog>
        <Message
          ifShowMessage={this.props.ifShowMessage}
          ifMessageIsError={this.props.ifMessageIsError}
          messageCode={this.props.messageCode}
          handleClose={() => {
            this.props.dismissMessage();
          }}
        />
      </div>
    );
  }
}

const TranslatedEditor = withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Editor));

export default TranslatedEditor;