import History from "./history";

export default function Sidebar() {
  function createNewChat() {
    localStorage.removeItem("current_chat");
    window.location.reload();
  }

  return (
    <div className="sidebar">
      <button onClick={createNewChat} className="new-chat-btn">
        New Chat
      </button>
      <History />
    </div>
  );
}
