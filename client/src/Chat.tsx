import { act, useEffect, useState } from "react";
import { io } from "socket.io-client";

type ChatProps = {
  readonly currentUser: string;
  readonly onLogout: () => void;
};

type Message = {
  readonly id?: number;
  readonly body: string;
  readonly author: string;
};

const systemMessage: Message = {
  id: 1,
  body: "Welcome to the Nest chat app",
  author: "Bot",
};

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false,
});
// const socket = io("https://cj2k8290-4000.inc1.devtunnels.ms/", {
//   autoConnect: false,
// });

export function Chat({ currentUser, onLogout }: ChatProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([systemMessage]);
  const [activeUsers, setActiveUsers] = useState<number>(0);

  useEffect(() => {
    socket.connect();
    socket.on("active-users:update", (activeUsr) => {
      setActiveUsers(activeUsr);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("chat", (newMessage: Message) => {
      console.log("New message added", newMessage);
      setMessages((previousMessages) => [...previousMessages, newMessage]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat");
    };
  }, []);

  const handleSendMessage = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key !== "Enter" || inputValue.trim().length === 0) return;
    console.log("message sent");
    socket.emit("chat", { author: currentUser, body: inputValue.trim() });
    setInputValue("");
  };

  const handleLogout = () => {
    socket.disconnect();
    onLogout();
  };

  return (
    <div className="flex h-screen w-3/5 flex-col border-x border-[#d1dbe3] bg-red-200">
      <div className="flex items-center justify-between border-b border-[#d1dbe3] bg-[#f6fbff] px-[0.9em] py-[0.9em] text-base">
        <span className="font-bold text-black/90">Nest Chat App</span>
        <span className="font-bold text-black/90">
          Active User: {activeUsers}
        </span>
        <button
          className="cursor-pointer rounded bg-[#007bff] px-2 py-[0.35rem] text-base text-white"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="flex h-[calc(100vh-48px)] flex-col overflow-auto bg-white px-2 py-3 text-black/90">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`mt-[0.4em] block w-1/2 text-[0.91em] ${
              currentUser === message.author ? "ml-auto" : ""
            }`}
          >
            <div
              className={`flex flex-row items-center  ${
                currentUser === message.author ? "  justify-end" : "gap-2"
              }`}
            >
              <span
                className={`text-[0.81em] font-semibold  ${
                  currentUser === message.author ? "hidden" : ""
                }`}
              >
                {message.author}
              </span>
              <div
                className={`w-fit px-[0.9em] py-[0.6em] ${
                  currentUser === message.author
                    ? "rounded-[0.7em_0_0_0.7em] bg-[#6bb9f2]"
                    : "rounded-[0_0.7em_0.7em_0] bg-[#c6e3fa]"
                }`}
              >
                <span className="break-words whitespace-pre-wrap py-[0.6em]">
                  {message.body}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex border-t border-[#d1dbe3] p-2">
        <input
          className="w-full rounded-[0.7em] border-0 bg-[#c6e3fa] px-[0.9em] py-[0.8em] text-[15px] text-black/90 focus:outline-none"
          placeholder="Type message here"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleSendMessage}
        />
      </div>
    </div>
  );
}
