from pathlib import Path

content = """import React from "react";
import { useThemeMode } from "@context/ThemeContext";

const toggles = [
  { id: 'recommendations', label: 'AI recommendations', description: 'Enable personalised game and venue suggestions across the dashboard.' },
  { id: 'reminders', label: 'Game reminders', description: 'Send push notifications before kick-off and when rosters change.' },
  { id: 'newsletter', label: 'Weekly digest', description: 'Recap community highlights, new venues, and top matchups.' },
];

export default function SettingsPage() {
  const { mode, toggle } = useThemeMode();

  return (
    <div className=\"space-y-6\">
      <header className=\"rounded-3xl bg-[var(--bg-muted)] p-8 shadow-inner\">
        <h1 className=\"text-2xl font-bold text-[var(--text)]\">Dashboard preferences</h1>
        <p className=\"mt-2 max-w-2xl text-sm text-[var(--text-3)]\">Control theme, notification cadence, and how aggressively the AI co-pilot surfaces sessions for you.</p>
      </header>

      <section className=\"rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm\">
        <div className=\"flex items-center justify-between\">
          <div>
            <h2 className=\"text-lg font-semibold text-[var(--text)]\">Appearance</h2>
            <p className=\"text-sm text-[var(--text-3)]\">Switch between light and dark without reloading the app.</p>
          </div>
          <button onClick={toggle} className=\"rounded-full border border-[var(--brand-royal)] px-4 py-2 text-sm font-semibold text-[var(--brand-royal)] transition hover:bg-[var(--brand-royal)]/10\">Toggle {mode === 'dark' ? 'light' : 'dark'} mode</button>
        </div>
      </section>

      <section className=\"rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm\">
        <h2 className=\"text-lg font-semibold text-[var(--text)]\">Notifications</h2>
        <div className=\"mt-4 space-y-4\">
          {toggles.map((setting) => (
            <label key={setting.id} className=\"flex items-start justify-between gap-6 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-4 transition hover:border-[var(--brand-royal)]\">
              <span>
                <span className=\"block text-sm font-semibold text-[var(--text)]\">{setting.label}</span>
                <span className=\"block text-xs text-[var(--text-3)]\">{setting.description}</span>
              </span>
              <input type="checkbox" defaultChecked className=\"h-5 w-5 rounded border-[var(--border)] text-[var(--brand-royal)] focus:ring-[var(--brand-crimson)]\" />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
"""
Path('src/pages/dashboard/SettingsPage.tsx').write_text(content, encoding='utf-8')
