function getUserSummary(user) {
  const activeSubscriptions = user.subscriptions.filter((sub) => sub.status === 'active');
  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => sum + sub.cost, 0);

  return {
    activeCount: activeSubscriptions.length,
    monthlyTotal,
    totalCount: user.subscriptions.length,
  };
}

export default function UserWorkspacePanel({
  users,
  activeUserId,
  newUserName,
  onNewUserNameChange,
  onCreateUser,
  onSelectUser,
  onDeleteUser,
  formatCurrency,
}) {
  return (
    <div className="panel-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Lokale Nutzer</p>
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-1)]">
            Getrennte Workspaces pro Person oder Kontext
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-3)]">
            Jeder Nutzer speichert Abos, Theme und Verlaufsdaten separat im Browser.
          </p>
        </div>
        <span className="dashboard-pill">{users.length} gespeichert</span>
      </div>

      <div className="mt-6 grid gap-3">
        {users.map((user) => {
          const isActive = user.id === activeUserId;
          const summary = getUserSummary(user);

          return (
            <article
              key={user.id}
              className="rounded-[1.5rem] border px-4 py-4 transition-all duration-200"
              style={{
                borderColor: isActive ? 'rgba(var(--accent-rgb), 0.4)' : 'var(--glass-border)',
                background: isActive
                  ? 'rgba(var(--accent-rgb), 0.10)'
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-[var(--text-1)]">
                      {user.name}
                    </p>
                    {isActive && (
                      <span className="dashboard-pill dashboard-pill--accent">Aktiv</span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--text-3)]">
                    <span>{summary.activeCount} aktive Abos</span>
                    <span>{formatCurrency(summary.monthlyTotal)} / Monat</span>
                    <span>{summary.totalCount} Eintraege</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectUser(user.id)}
                    disabled={isActive}
                    className="dashboard-button dashboard-button--secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isActive ? 'Aktiv' : 'Wechseln'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteUser(user.id)}
                    disabled={users.length === 1}
                    className="dashboard-button dashboard-button--secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Loeschen
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <form
        onSubmit={onCreateUser}
        className="mt-6 flex flex-col gap-3 md:flex-row md:items-center"
      >
        <input
          value={newUserName}
          onChange={(event) => onNewUserNameChange(event.target.value)}
          className="dashboard-input flex-1"
          placeholder="z. B. Familie, Business oder Privat"
          aria-label="Neuen Nutzer anlegen"
        />

        <button
          type="submit"
          disabled={!newUserName.trim()}
          className="dashboard-button disabled:cursor-not-allowed disabled:opacity-50"
        >
          Nutzer anlegen
        </button>
      </form>

      <p className="mt-3 text-sm leading-6 text-[var(--text-3)]">
        Neue Nutzer starten mit leerem Portfolio, damit Daten sauber getrennt bleiben.
      </p>
    </div>
  );
}
