import { useState } from "react";

type LoginProps = {
  readonly onLogin: (user: string) => void;
};

export function Login({ onLogin }: LoginProps) {
  const [selectedUser, setSelectedUser] = useState<string>("user1");

  const isLoginDisabled: boolean = selectedUser.trim().length === 0;

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-6 flex flex-col items-center gap-3">
        <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
          <circle cx="32" cy="32" r="30" fill="#dbeafe" />
          <path
            d="M18 23h28a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H28l-10 8V27a4 4 0 0 1 4-4Z"
            fill="#60a5fa"
          />
        </svg>
        <h1 className="text-2xl font-semibold text-slate-700">
          Login to Chat
        </h1>
      </div>
      <label className="mb-2 block text-sm font-medium text-slate-600">
        Select account
      </label>
      {/* <select
        className="mb-4 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
        onChange={(e) => setSelectedUser(e.target.value)}
        defaultValue="user1"
      >
        <option value="user1">User 1</option>
        <option value="user2">User 2</option>
        <option value="user3">User 3</option>
        <option value="user4">User 4</option>
      </select> */}
      <input
        type="text"
        className="mb-4 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
        onChange={(e) => setSelectedUser(e.target.value)}
        defaultValue="user1"
        onKeyDown={(e) => (e.key === "Enter" ? onLogin(selectedUser) : undefined)}
      />
      
      <button
        disabled={isLoginDisabled}
        className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => onLogin(selectedUser)}
        onKeyDown={(e) => (e.key === "Enter" ? onLogin(selectedUser) : undefined)}
      >
        Login
      </button>
    </div>
  );
}
