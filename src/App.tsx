import * as React from 'react';

import { SimpleButton } from "ui";

interface Props {
   name: string;
}

class App extends React.Component<Props> {
  render() {
    const { name } = this.props;
    return (
      <>
        <h1 className="text-4xl text-white bg-black">
          Hello {name}
          <SimpleButton primary>Test ...</SimpleButton>
          <SimpleButton secondary>Test ...</SimpleButton>
        </h1>
      </>
    );
  }
}

export default App;
