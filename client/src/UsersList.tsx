type UsersListProps = {
  readonly inactiveUsers: string[];
  readonly activeUsers: string[];
  readonly handleChatUser: (userName: string) => void;
};

export default function UsersList({
  inactiveUsers,
  activeUsers,
  handleChatUser,
}: UsersListProps) {
  return (
    <aside className="w-72 border-l border-slate-200 bg-slate-50 p-4">
      <button
        className="mb-3 flex w-full items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        onClick={() => handleChatUser("global")}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M3 5a2 2 0 0 1 2-2h2a1 1 0 1 1 0 2H5v2a1 1 0 1 1-2 0V5Zm14-1a1 1 0 0 1 1-1h2a2 2 0 0 1 2 2v2a1 1 0 1 1-2 0V5h-2a1 1 0 0 1-1-1ZM3 17a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2H4a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1Zm18 0a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-2a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z" />
        </svg>
        Global Chat
      </button>
      <SectionTitle title="Active Users" />
      {activeUsers.length === 0 ? (
        <EmptyUsersState label="No active users right now" />
      ) : (
        <ul className="space-y-2">
          {activeUsers.map((userName) => (
            <li key={userName}>
              <button
                className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:bg-emerald-50"
                onClick={() => handleChatUser(userName)}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span>{userName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <SectionTitle title="Inactive Users" />
      {inactiveUsers.length === 0 ? (
        <EmptyUsersState label="No inactive users right now" />
      ) : (
        <ul className="space-y-2">
          {inactiveUsers.map((userName) => (
            <li
              key={userName}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span>{userName}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

type SectionTitleProps = {
  readonly title: string;
};

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <h2 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {title}
    </h2>
  );
}

type EmptyUsersStateProps = {
  readonly label: string;
};

function EmptyUsersState({ label }: EmptyUsersStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
      <div className="mb-2 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 19c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        </svg>
      </div>
      <p className="text-center">{label}</p>
    </div>
  );
}
