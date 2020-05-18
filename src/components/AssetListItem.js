import React from 'react';
import { ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import DeleteIcon from '@material-ui/icons/Delete';

function AssetListItem({ name, handleDeleteAsset }) {
  return (
    <ListItem
    >
      <ListItemIcon>
        <AttachFileIcon />
      </ListItemIcon>
      <ListItemText primary={name} />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={() => handleDeleteAsset(name)}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

export default AssetListItem;