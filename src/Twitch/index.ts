const ws = new WebSocket('ws://irc-ws.chat.twitch.tv');
const nick = 'justinfan13113 '; //all lowercase
const auth = 'kappa'; //include oauth:xxxx

let untilOpenWebSocketResolve: () => void;
const untilOpenWebSocket = new Promise((resolve) => {
  untilOpenWebSocketResolve = resolve;
});

ws.onopen = () => {
  ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
  ws.send('PASS ' + auth);
  ws.send('NICK ' + nick);
  untilOpenWebSocketResolve();
};

export type Message = {
  username: string;
  text: string;
}
export type OnMessageHandler = (message: Message) => void;

export async function joinChannel(channel: string) {
  await untilOpenWebSocket;
  ws.send('JOIN #' + channel);
}

const subscribeHandlers: OnMessageHandler[] = [];

export function subscribeMessages(onMessage: OnMessageHandler) {
  subscribeHandlers.push(onMessage);
}

function broadcastMessage(message: Message) {
  subscribeHandlers.forEach((handler) => {
    handler(message);
  })
}

// reply to ping
ws.onmessage = (event) => {
  const { data } = event;

  if (data.lastIndexOf('PING', 0) === 0) {
    ws.send('PONG :tmi.twitch.tv');
    console.log('PONG Sent\r\n');
    return;
  }

  const indexOfPRIVMSG = data.indexOf('PRIVMSG');
  if (indexOfPRIVMSG >= 0) {
    const headers = data.substring(0, indexOfPRIVMSG).split(';');
    const content = data.substring(data.indexOf(':', indexOfPRIVMSG) + 1);
    const name = headers.find(header => header.indexOf('display-name') === 0)
      .substring('display-name='.length);

    broadcastMessage({
      username: name,
      text: content,
    });
  }
};
