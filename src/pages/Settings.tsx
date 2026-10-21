import { useState } from 'react';
import {
  Bell,
  Clock3,
  Database,
  Download,
  FileJson,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Volume2,
} from 'lucide-react';
import { timezoneLabel } from '../utils/date';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onExportMetadata: () => void;
  onExportImages: () => void;
  onClearDemo: () => void;
  onReset: () => void;
  onMessage: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

export function SettingsPage({
  settings,
  onSettingsChange,
  onExportMetadata,
  onExportImages,
  onClearDemo,
  onReset,
  onMessage,
}: Props) {
  const [requesting, setRequesting] = useState(false);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      onMessage('This browser does not support notifications.', 'error');
      return;
    }

    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      onSettingsChange({
        ...settings,
        notificationsGranted: granted,
        reminderEnabled: granted,
      });

      onMessage(
        granted
          ? 'Daily reminder enabled.'
          : 'Notification permission was not granted. You can change it in browser settings.',
        granted ? 'success' : 'info',
      );
    } catch {
      onMessage('Notification permission could not be requested. You can change it in browser settings.', 'error');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="page settings-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h1>Settings</h1>
        </div>
      </header>

      <section className="settings-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">REMINDERS</span>
            <h2>Daily nudge</h2>
          </div>
        </div>
        <div className="settings-card">
          <label className="setting-row">
            <span className="setting-icon"><Bell /></span>
            <span className="setting-copy">
              <strong>Reminder</strong>
              <small>Notify when the day is still waiting.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={event => {
                if (event.target.checked && !settings.notificationsGranted) {
                  void requestNotifications();
                } else {
                  update('reminderEnabled', event.target.checked);
                }
              }}
            />
          </label>
          <label className="setting-row">
            <span className="setting-icon"><Clock3 /></span>
            <span className="setting-copy">
              <strong>Reminder time</strong>
              <small>Uses your device’s local timezone.</small>
            </span>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={event => update('reminderTime', event.target.value)}
            />
          </label>
          <button
            className="settings-action"
            type="button"
            onClick={() => void requestNotifications()}
            disabled={requesting}
          >
            {requesting ? <RefreshCw className="spin" /> : <Bell />}
            {settings.notificationsGranted
              ? 'Notification permission granted'
              : 'Enable browser notifications'}
          </button>
          <p className="setting-help">
            Scheduled reminders depend on browser support and the app being open or installed.
            Pausing stops the in-app reminder.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">PREFERENCES</span>
            <h2>Capture</h2>
          </div>
        </div>
        <div className="settings-card">
          <label className="setting-row">
            <span className="setting-icon"><MapPin /></span>
            <span className="setting-copy">
              <strong>Location</strong>
              <small>Offer to attach your place to a frame.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.locationEnabled}
              onChange={event => update('locationEnabled', event.target.checked)}
            />
          </label>
          <label className="setting-row">
            <span className="setting-icon"><Volume2 /></span>
            <span className="setting-copy">
              <strong>Milestone sound</strong>
              <small>Play a subtle sound when you unlock a badge.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={event => update('soundEnabled', event.target.checked)}
            />
          </label>
          <div className="setting-row">
            <span className="setting-icon"><Clock3 /></span>
            <span className="setting-copy">
              <strong>Timezone</strong>
              <small>{timezoneLabel(settings.timezone)}</small>
            </span>
            <span className="timezone-value">{settings.timezone}</span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">YOUR DATA</span>
            <h2>Export & reset</h2>
          </div>
        </div>
        <div className="settings-card">
          <button className="settings-action" type="button" onClick={onExportMetadata}>
            <FileJson /> Export JSON metadata
          </button>
          <button className="settings-action" type="button" onClick={onExportImages}>
            <Download /> Download all photos
          </button>
          {settings.demoLoaded && (
            <button className="settings-action" type="button" onClick={onClearDemo}>
              <Database /> Clear sample photos
            </button>
          )}
          <button className="settings-action danger" type="button" onClick={onReset}>
            <Trash2 /> Reset progress
          </button>
        </div>
      </section>

      <section className="privacy-card">
        <ShieldCheck />
        <div>
          <strong>Private by design</strong>
          <p>
            Photos and personal data remain in this browser. Nothing is uploaded.
            Export a backup before clearing site data.
          </p>
        </div>
      </section>
    </div>
  );
}