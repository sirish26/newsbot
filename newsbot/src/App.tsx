
import Chat from "./components/chat";
import Sidebar from "./components/sidebar";
import "./index.scss";

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <Chat />
    </div>
  );
}

