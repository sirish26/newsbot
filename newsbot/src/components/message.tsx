import type { Msg } from '../types';

export default function Message({ msg }: { msg: Msg }) {
  const side = msg.sender === 'user' ? 'user' : 'bot';
  return (
    <div className={`message ${side}-message`}>
      <div className="message-bubble">{msg.text}</div>
    </div>
  );

}
