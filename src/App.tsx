import * as React from 'react';

import './App.css';
import logo from './logo.svg';
import { joinChannel, Message, subscribeMessages } from './Twitch';

type State = {
  messages: Message[];
};

class App extends React.Component {
  state: State = {
    messages: [],
  };
  async componentWillMount() {
    await joinChannel('namse_');
    subscribeMessages((message: Message) => {
      console.log(message);
      this.setState({
        messages: [
          ...this.state.messages,
          message,
        ],
      });

    });
  }
  public render() {
    console.log(this.state.messages.length);
    const messages = this.state.messages.map(message => (
      <div>{`${message.username}: ${message.text}`}</div>
    ));
    console.log(messages);
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          {messages}
        </p>
      </div>
    );
  }
}

export default App;
