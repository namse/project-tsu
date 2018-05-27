import * as React from 'react';

export type Tsu = {
  username: string;
}

type Props = Tsu;

type State = {
};

export default class TsuComponent extends React.Component {
  props: Props;
  state: State = {
  };
  public render() {
    return (
      <div className="Tsu">
        <span>{`${this.props.username}`}</span>
      </div>
    );
  }
}
