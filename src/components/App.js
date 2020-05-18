import React from 'react';
import path from 'path';

// Custom Components
import Login from './Login';
import Dashboard from './Dashboard';
import Editor from './Editor';

// Router
import {
  Switch,
  Route,
  Redirect
} from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path={path.resolve(process.env.REACT_APP_ROOT, '!')} component={Dashboard} />
          <Route exact path={path.resolve(process.env.REACT_APP_ROOT, 'compose')} component={Editor} />
          <Route exact path={process.env.REACT_APP_ROOT} component={Login} />
          <Route path={process.env.REACT_APP_ROOT}>
            <Redirect to={process.env.REACT_APP_ROOT} />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default App;