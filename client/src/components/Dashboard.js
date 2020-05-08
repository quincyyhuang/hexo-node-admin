// Imports
import React from 'react';
import axios from 'axios';
import path from 'path';
import { Redirect } from "react-router-dom";

// Material UI Components
import { Container, Typography, TextField, Button, Box, Link, List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import PagesIcon from '@material-ui/icons/Pages';

function MyListItem(props) {
  return (
    <ListItem button {...props}>
      <ListItemIcon>
        {
          props.type == 'post' ? DescriptionIcon : PagesIcon
        }
      </ListItemIcon>
      <ListItemText primary={props.name} />
    </ListItem>
  );
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: null,
      token: null,
      posts: [],
      pages: [],
      stats: null
    }
    let token = localStorage.getItem('token');
    if (token)
      this.state.token = token;
    else
      this.state.msg = 'Please sign in.';
  }

  componentDidMount() {
    if (this.state.token)
    {
      // Fetch data
      const entry_point = '/api/hexo';
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
              msg: err.response.data.msg
            });
          }
        });
    }
  }

  render() {
    if (!this.state.token) {
      return <Redirect to={{
        pathname: '/',
        state: {
          msg: this.state.msg
        }
      }} />
    }
    return (
      <Container component='main' maxWidth='xs'>
        <Typography component="h1" variant="h4">
          Hexo Node Admin
        </Typography>
        <List component='nav'>

        </List>
      </Container>
    );
  }
}

export default Dashboard;