type UsersListProps = {
  readonly inactiveUsers: string[];
  readonly activeUsers: string[];
};

export default function UsersList({ inactiveUsers, activeUsers }: UsersListProps) {
    console.log({ inactiveUsers, activeUsers });
  return (
    <aside className="w-64 border-l border-[#d1dbe3] bg-[#f8fafc] p-3">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Active Users
      </h2>
      {activeUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
          No active users right now.
        </div>
      ) : (
        <ul className="space-y-2">
          {activeUsers.map((username) => (
            <li
              key={username}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span>{username}</span>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Inactive Users</h2>
      {inactiveUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
          No inactive users right now.
        </div>
      ) : (
        <ul className="space-y-2">
          {inactiveUsers.map((username) => (
            <li
              key={username}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span>{username}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
