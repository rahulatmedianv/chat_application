import { useState } from "react";

export function Login({ onLogin }: { onLogin: (user: string) => void }) {
  const [inputValue, setInputValue] = useState("user1");

  const loginButtonDisabled = inputValue.trim().length === 0;

  return (
    <div className="login">
      <span className="login-title">Login to your account</span>
      {/* <input
        className="input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      /> */}
      <select onChange={(e) => setInputValue(e.target.value)}>
        <option value="user1" selected>User 1</option>
        <option value="user2">User 2</option>
        <option value="user3">User 3</option>
        <option value="user4">User 4</option>
      </select>
      <button
        disabled={loginButtonDisabled}
        className="button"
        onClick={() => onLogin(inputValue)}
        onKeyDown={(e) => (e.key === "Enter" ? onLogin(inputValue) : undefined)}
      >
        Login
      </button>
    </div>
  );
}
