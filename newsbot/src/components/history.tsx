
import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage);
    const chatKeys = keys.filter((key) => key.startsWith("chat_"));
    setHistory(chatKeys);
  }, []);

  function selectChat(id: string) {
    localStorage.setItem("current_chat", id.replace("chat_", ""));
    window.location.reload();
  }

  return (
    <div className="history">
      <h3>History</h3>
      <ul>
        {history.map((id) => (
          <li key={id} onClick={() => selectChat(id)}>
            {id.replace("chat_", "")}
          </li>
        ))}
      </ul>
    </div>
  );
}
