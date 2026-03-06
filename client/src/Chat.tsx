import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import UsersList from "./UsersList";

type ChatProps = {
  readonly currentUser: string;
  readonly onLogout: () => void;
  readonly chatWith?: string;
  readonly handleChatUser: (user: string) => void;
};

type PresenceUser = {
  readonly id: string;
  readonly active: boolean;
  readonly name: string;
};

type ActiveUsers = {
  readonly users: Record<string, PresenceUser>;
  readonly count: number;
};

type Message = {
  readonly id?: string;
  readonly body: string;
  readonly author: string;
  readonly receiver?: string;
  readonly createdAt?: string;
};

const socket = io(import.meta.env.VITE_BACKEND_URL, { autoConnect: false });

export function Chat({
  currentUser,
  onLogout,
  chatWith = "global",
  handleChatUser,
}: ChatProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUsers>({
    users: {},
    count: 0,
  });
  const activeUserNames: string[] = getActiveUserNames(
    activeUsers,
    currentUser,
  );
  const inactiveUsers: string[] = getInactiveUserNames(
    activeUsers,
    currentUser,
  );

  useEffect(() => {
    const executeRegisterPresence = (): void => {
      socket.emit("presence:register", { currentUser });
    };
    const executeUpdatePresence = (snapshot: ActiveUsers): void => {
      setActiveUsers(snapshot);
    };
    socket.connect();
    socket.on("connect", executeRegisterPresence);
    socket.on("presence:update", executeUpdatePresence);
    executeRegisterPresence();
    return () => {
      socket.off("connect", executeRegisterPresence);
      socket.off("presence:update", executeUpdatePresence);
    };
  }, [currentUser]);

  useEffect(() => {
    if (chatWith === "global") {
      const executeSetGlobalHistory = (history: Message[]): void => {
        setMessages(history);
      };
      const executeAppendGlobalMessage = (newMessage: Message): void => {
        setMessages((previousMessages) => [...previousMessages, newMessage]);
      };
      socket.emit("chat:history:request");
      socket.on("chat:history:response", executeSetGlobalHistory);
      socket.on("chat", executeAppendGlobalMessage);
      return () => {
        socket.off("chat:history:response", executeSetGlobalHistory);
        socket.off("chat", executeAppendGlobalMessage);
      };
    }
    const executeSetDmHistory = (history: Message[]): void => {
      setMessages(history);
    };
    const executeAppendDmMessage = (newMessage: Message): void => {
      const isCurrentConversation: boolean = isMessageInConversation({
        message: newMessage,
        currentUser,
        chatWith,
      });
      if (!isCurrentConversation) {
        return;
      }
      setMessages((previousMessages) => [...previousMessages, newMessage]);
    };
    socket.emit("dm:history:request", {
      senderName: currentUser,
      receiverName: chatWith,
    });
    socket.on("dm:history:response", executeSetDmHistory);
    socket.on("dm:new", executeAppendDmMessage);
    return () => {
      socket.off("dm:history:response", executeSetDmHistory);
      socket.off("dm:new", executeAppendDmMessage);
    };
  }, [currentUser, chatWith]);

  const executeSendMessage = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key !== "Enter") {
      return;
    }
    const nextMessage: string = inputValue.trim();
    if (nextMessage.length === 0) {
      return;
    }
    if (chatWith === "global") {
      socket.emit("chat", { author: currentUser, body: nextMessage });
    } else {
      socket.emit("dm:send", {
        senderName: currentUser,
        receiverName: chatWith,
        message: nextMessage,
      });
    }
    setInputValue("");
  };

  const executeLogout = (): void => {
    socket.disconnect();
    onLogout();
  };

  return (
    <div className="flex h-screen w-full max-w-[1200px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V8a2 2 0 0 1 2-2Z" />
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700">
              Signed in as {currentUser}
            </span>
            <span className="text-xs text-slate-500">
              {chatWith === "global"
                ? "Global room"
                : `Direct chat with ${chatWith}`}
            </span>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {activeUsers.count} active
        </span>
        <button
          className="rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-600"
          onClick={executeLogout}
        >
          Logout
        </button>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                <svg viewBox="0 0 64 64" className="h-20 w-20" fill="none">
                  <circle cx="32" cy="32" r="30" fill="#eff6ff" />
                  <path
                    d="M20 24h24a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H30l-10 8V28a4 4 0 0 1 4-4Z"
                    fill="#bfdbfe"
                  />
                </svg>
                <span className="text-sm font-medium">No messages yet</span>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id ?? `${message.author}-${message.body}`}
                  className={`mt-2 flex w-full text-sm ${
                    currentUser === message.author
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-[60%]">
                    <span
                      className={`mb-1 block text-xs font-semibold text-slate-500 ${
                        currentUser === message.author
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {message.author}
                    </span>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        currentUser === message.author
                          ? "rounded-tr-sm bg-blue-500 text-white"
                          : "rounded-tl-sm bg-blue-100 text-slate-700"
                      }`}
                    >
                      <span className="break-words whitespace-pre-wrap">
                        {message.body}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex border-t border-slate-200 bg-white p-3">
            <input
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder={
                chatWith === "global"
                  ? "Send a message to global chat"
                  : `Send a direct message to ${chatWith}`
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={executeSendMessage}
            />
          </div>
        </div>
        <UsersList
          inactiveUsers={inactiveUsers}
          activeUsers={activeUserNames}
          handleChatUser={handleChatUser}
        />
      </div>
    </div>
  );
}

type MessageConversationMatcher = {
  readonly message: Message;
  readonly currentUser: string;
  readonly chatWith: string;
};

function isMessageInConversation({
  message,
  currentUser,
  chatWith,
}: MessageConversationMatcher): boolean {
  const isOutgoingMessage: boolean =
    message.author === currentUser && message.receiver === chatWith;
  const isIncomingMessage: boolean =
    message.author === chatWith && message.receiver === currentUser;
  return isOutgoingMessage || isIncomingMessage;
}

function getActiveUserNames(
  activeUsers: ActiveUsers,
  currentUser: string,
): string[] {
  return Object.entries(activeUsers.users)
    .filter(([userName, user]) => user.active && userName !== currentUser)
    .map(([userName]) => userName)
    .sort((firstName, secondName) => firstName.localeCompare(secondName));
}

function getInactiveUserNames(
  activeUsers: ActiveUsers,
  currentUser: string,
): string[] {
  return Object.entries(activeUsers.users)
    .filter(([userName, user]) => !user.active && userName !== currentUser)
    .map(([userName]) => userName)
    .sort((firstName, secondName) => firstName.localeCompare(secondName));
}
