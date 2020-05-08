import React from 'react';

class Lister extends React.Component {

  render() {
    return (
      <h1>This is Lister {this.props.type}</h1>
    );
  }
}

export default Lister;