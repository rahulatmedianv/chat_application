import { useState } from "react";
import "./App.css";
import { Chat } from "./Chat";
import { Login } from "./Login";

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  return (
    <div className="app bg-green-200">
      {currentUser ? (
        <Chat currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      ) : (
        <Login onLogin={setCurrentUser} />
      )}
    </div>
  );
}

export default App;
