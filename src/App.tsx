import * as React from 'react';

import './App.css';
import { joinChannel, Message, subscribeMessages } from './Twitch';
import TsuComponent, { Tsu } from 'src/Tsu';

type State = {
  messages: Message[];
  tsus: Tsu[];
  gameState: GameState;

  // for game
  leftCandidate?: string;
  rightCandidate?: string;

  leftTsus: Tsu[],
  rightTsus: Tsu[],
  remainTsus: Tsu[],

  round: number;
};
let candidates = [
  '푸른 하늘',
  '두부집 효녀',
  '공장장',
  '국민여동생',
];

let winners = [];

enum GameState {
  WaitingJoin,
  OnGame,
};

export default class App extends React.Component {
  state: State = {
    messages: [],
    tsus: [],
    gameState: GameState.WaitingJoin,

    round: 1,
    leftTsus: [],
    rightTsus: [],
    remainTsus: [],
  };
  async componentWillMount() {
    await joinChannel('namse_');
    subscribeMessages(this.onMessage.bind(this));
  }

  onMessage(message: Message) {
    console.log(message);
    this.setState({
      messages: [
        ...this.state.messages,
        message,
      ],
    });

    const tsu = this.state.tsus.find(tsu => tsu.username === message.username);

    switch (this.state.gameState) {
      case GameState.WaitingJoin: {
        if (!tsu) {
          const newTsu: Tsu = {
            username: message.username,
          };
          this.setState({
            tsus: [...this.state.tsus, newTsu],
            remainTsus: [...this.state.remainTsus, newTsu],
          });
        }
      } break;
      case GameState.OnGame: {
        this.moveTsu(message);
      } break;
    }
  }


  moveTsu(message: Message) {
    const tsu = this.state.tsus.find(tsu => tsu.username === message.username);
    if (!tsu) {
      return;
    }

    const isLeft = message.text.indexOf('왼쪽') >= 0;
    const isRight = message.text.indexOf('오른쪽') >= 0;
    let moveToArrayName: string;
    let oppositeArrayName: string;

    if (isLeft) {
      moveToArrayName = 'leftTsus';
      oppositeArrayName = 'rightTsus';
    }
    else if (isRight) {
      moveToArrayName = 'rightTsus';
      oppositeArrayName = 'leftTsus';
    } else {
      return;
    }


    if (this.state[moveToArrayName].includes(tsu)) {
      return;
    }

    this.setState({
      [moveToArrayName]: [...this.state[moveToArrayName], tsu],
    });

    if (this.state[oppositeArrayName].includes(tsu)) {
      this.setState({
        [oppositeArrayName]: this.state[oppositeArrayName].filter(_tsu => _tsu !== tsu),
      });
    } else if (this.state.remainTsus.includes(tsu)) {
      this.setState({
        remainTsus: this.state.remainTsus.filter(_tsu => _tsu !== tsu),
      });
    }
  }

  popCandidate() {
    const candidateIndex = Math.floor(Math.random() * candidates.length);
    const candidate = candidates[candidateIndex];
    candidates = candidates.filter(c => c !== candidate);

    return candidate;
  }

  chooseCandidate() {
    const leftCandidate = this.popCandidate();
    const rightCandidate = this.popCandidate();
    this.setState({
      leftCandidate,
      rightCandidate,
    });
  }

  startGame = () => {
    this.setState({
      gameState: GameState.OnGame,
    });
    this.chooseCandidate();
  }

  renderWaitingJoin() {
    const tsus = this.state.tsus.map(tsu => (<TsuComponent {...tsu} />));
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">게임에 참가해주세요! 채팅에 아무말이나 쓰면 됩니다!!</h1>
          <button onClick={this.startGame} >게임 시작하기</button>
        </header>
        <p>
          {tsus}
        </p>
      </div>
    );
  }

  renderOnGame() {
    const leftTsuComponents = this.state.leftTsus.map(tsu => (<TsuComponent {...tsu} />));
    const rightTsusComponents = this.state.rightTsus.map(tsu => (<TsuComponent {...tsu} />));
    const remainTsuComponents = this.state.remainTsus.map(tsu => (<TsuComponent {...tsu} />));
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">라운드 {this.state.round} </h1>
        </header>
        <section className="container">
          <div className="left-candidate">
            <h2>{this.state.leftCandidate}</h2>
            {leftTsuComponents}
          </div>
          <div className="right-candidate">
            <h2>{this.state.rightCandidate}</h2>
            {rightTsusComponents}
          </div>
        </section>
        <p>
          {remainTsuComponents}
        </p>
      </div>
    );
  }
  public render() {
    const renderFunctionName = `render${GameState[this.state.gameState]}`;
    const renderFunction = this[renderFunctionName].bind(this);
    if (!renderFunction) {
      throw new Error(`no render function : ${renderFunctionName}`);
    }
    return renderFunction();
  }
}
