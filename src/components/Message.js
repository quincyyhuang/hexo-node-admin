import React from 'react';
import { useTranslation } from 'react-i18next';

import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

import Status from '../status';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Message(props) {
  const { t } = useTranslation();
  const localizedMessage = t(`Message.${Status.getCodeTranslationKey(props.messageCode)}`);

  return (
    <Snackbar
      open={props.ifShowMessage}
      autoHideDuration={props.ifMessageIsError ? 3000 : 1000}
      onClose={props.handleClose}
    >
      <Alert severity={props.ifMessageIsError ? 'error' : 'success'}>
        {localizedMessage}
      </Alert>
    </Snackbar>
  );
}

export default Message;