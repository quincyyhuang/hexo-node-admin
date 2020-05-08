import React from 'react';

// Custom Components
import Login from './Login';
import Dashboard from './Dashboard';

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
          <Route path='/!' component={Dashboard} />
          <Route path='/' component={Login} />
        </Switch>
      </div>
    );
  }
}

export default App;