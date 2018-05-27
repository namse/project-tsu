import * as React from 'react';

import './App.css';
import logo from './logo.svg';
import { joinChannel, Message, subscribeMessages } from './Twitch';
import TsuComponent, { Tsu } from 'src/Tsu';

type State = {
  messages: Message[];
  tsus: Tsu[];
};

export default class App extends React.Component {
  state: State = {
    messages: [],
    tsus: [],
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

      const isAlreadyJoinedTsu = this.state.tsus.some(tsu => tsu.username === message.username)
      if (!isAlreadyJoinedTsu) {
        const newTsu: Tsu = {
          username: message.username,
        };
        this.setState({
          tsus: [...this.state.tsus, newTsu],
        });
      }
    });
  }
  public render() {
    console.log(this.state.messages.length);
    const messages = this.state.messages.map(message => (
      <div>{`${message.username}: ${message.text}`}</div>
    ));
    const tsus = this.state.tsus.map(tsu => (<TsuComponent {...tsu} />))
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
        <p>
          {tsus}
        </p>
      </div>
    );
  }
}
