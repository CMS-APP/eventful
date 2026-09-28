import { authProviderColor, authProviderLabel } from "@/features/stats/utils/userStats";

export interface AuthProviderStat {
  value: string;
  count: number;
}

export function AuthProviderChart({ stats }: { stats: AuthProviderStat[] }) {
  const total = stats.reduce((sum, stat) => sum + stat.count, 0);

  if (total === 0) {
    return <p className="user-stats-label">No sign-in data yet.</p>;
  }

  const maxCount = Math.max(...stats.map((stat) => stat.count), 1);

  return (
    <ul className="auth-provider-list">
      {stats.map((stat) => {
        const percentage = (stat.count / total) * 100;
        const color = authProviderColor(stat.value);

        return (
          <li className="auth-provider-row" key={stat.value}>
            <span className="auth-provider-label-group">
              <span
                className="auth-provider-swatch"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="user-stats-label">
                {authProviderLabel(stat.value)}
              </span>
            </span>
            <div className="auth-provider-row-bottom">
              <div className="auth-provider-bar-track">
                <div
                  className="auth-provider-bar-fill"
                  style={{
                    width: `${Math.max((stat.count / maxCount) * 100, 4)}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              <span className="user-stats-count">
                {stat.count.toLocaleString()}
              </span>
              <span className="auth-provider-percentage">
                {percentage.toFixed(1)}%
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
