import React from 'react';
import '../css/App.css';

// Custom Components
import Login from './Login';
import Dashboard from './Dashboard';
import Lister from './Lister';
import Other from './Other';

// Router
import {
  Switch,
  Route
} from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route path='/!'>
            <Dashboard />
          </Route>
          <Route path='/posts'>
            <Lister type='posts'/>
          </Route>
          <Route path='/pages'>
            <Lister type='pages' />
          </Route>
          <Route path='/stats'>
            <Other type='stats' />
          </Route>
          <Route path='/about'>
            <Other type='about' />
          </Route>
          <Route path='/'>
            <Login />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default App;