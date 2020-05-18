import React from 'react';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import PagesIcon from '@material-ui/icons/Pages';
import pink from '@material-ui/core/colors/pink';

function FileListItem({ itemType, name, handleClick }) {
  return (
    <ListItem
      button
      className='my-list-item'
      onClick={() => {
        handleClick(itemType, name);
      }}
    >
      <ListItemIcon>
        {
          itemType === 'post' ? <DescriptionIcon style={{color: pink[400]}} /> : <PagesIcon style={{color: pink[400]}} />
        }
      </ListItemIcon>
      <ListItemText primary={name} />
    </ListItem>
  );
}

export default FileListItem;