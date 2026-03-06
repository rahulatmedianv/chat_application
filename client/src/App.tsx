import { useState } from "react";
import { Chat } from "./Chat";
import { Login } from "./Login";

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<string>("global");
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      {currentUser ? (
        <Chat
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          chatWith={chatWith}
          handleChatUser={(args: string) => setChatWith(args)}
        />
      ) : (
        <Login onLogin={(user: string) => setCurrentUser(user)} />
      )}
    </div>
  );
}

export default App;
