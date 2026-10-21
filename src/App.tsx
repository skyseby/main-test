import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Images, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { CameraModal } from './components/CameraModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { PhotoEditor } from './components/PhotoEditor';
import { PhotoGrid } from './components/PhotoGrid';
import { ToastRegion } from './components/ToastRegion';
import { usePhotoLibrary } from './hooks/usePhotoLibrary';
import { Library } from './pages/Library';
import { Onboarding } from './pages/Onboarding';
import { Rewards } from './pages/Rewards';
import { SettingsPage } from './pages/Settings';
import { Today } from './pages/Today';
import { CHALLENGES } from './data/challenges';
import { localDateKey } from './utils/date';
import { compressImage } from './utils/image';
import { DEFAULT_SETTINGS, getChallengeForDate } from './utils/progress';
import {
  downloadBlob,
  loadSettings,
  saveSettings,
} from './utils/storage';
import type {
  AppPage,
  PhotoEntry,
  Settings as AppSettings,
  ToastMessage,
} from './types';

const PAGES: { id: AppPage; label: string; icon: typeof CalendarDays }[] = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'library', label: 'Library', icon: Images },
  { id: 'rewards', label: 'Rewards', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function readSettings(): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...loadSettings(),
  };
}

function App() {
  const library = usePhotoLibrary();
  const [page, setPage] = useState<AppPage>('today');
  const [settings, setSettings] = useState<AppSettings>(readSettings);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [editingEntry, setEditingEntry] = useState<PhotoEntry | null>(null);
  const [galleryEntry, setGalleryEntry] = useState<PhotoEntry | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PhotoEntry | null>(null);

  const addToast = useCallback(
    (message: string, tone: ToastMessage['tone'] = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts(current => [...current, { id, message, tone }]);
      window.setTimeout(() => {
        setToasts(current => current.filter(toast => toast.id !== id));
      }, 4200);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const updateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const completeOnboarding = useCallback(
    async (includeDemo: boolean) => {
      if (includeDemo && !settings.demoLoaded) {
        await library.loadDemo();
      }
      updateSettings({
        ...settings,
        onboarded: true,
        demoLoaded: includeDemo,
      });
    },
    [library, settings, updateSettings],
  );

  const openUpload = useCallback(
    async (file: File) => {
      try {
        const result = await compressImage(file);
        setEditingEntry(null);
        setPendingBlob(result.blob);
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : 'The selected photo could not be processed.',
          'error',
        );
      }
    },
    [addToast],
  );

  const openCapture = useCallback((blob: Blob) => {
    setCameraOpen(false);
    setEditingEntry(null);
    setPendingBlob(blob);
  }, []);

  const saveFrame = useCallback(
    async (frame: Omit<PhotoEntry, 'id'>) => {
      const existing = library.entries.find(entry => entry.date === frame.date);
      const prompt = frame.prompt || getChallengeForDate(frame.date, library.history, CHALLENGES);
      await library.save(
        {
          ...frame,
          id: existing?.id ?? frame.date,
          prompt,
        },
        prompt,
      );
      setPendingBlob(null);
      setEditingEntry(null);
      addToast('Your frame was saved to your journal.', 'success');
    },
    [addToast, library],
  );

  const requestDelete = useCallback((entry: PhotoEntry) => {
    setDeleteTarget(entry);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await library.remove(deleteTarget.date);
      setDeleteTarget(null);
      setGalleryEntry(null);
      addToast('The frame was removed.', 'success');
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'The frame could not be removed.',
        'error',
      );
    }
  }, [addToast, deleteTarget, library]);

  const resetProgress = useCallback(async () => {
    try {
      await library.clear();
      updateSettings({
        ...DEFAULT_SETTINGS,
        onboarded: true,
        timezone: settings.timezone,
      });
      setResetOpen(false);
      setPage('today');
      addToast('Your journal was reset.', 'success');
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'The journal could not be reset.',
        'error',
      );
    }
  }, [addToast, library, settings.timezone, updateSettings]);

  const exportMetadata = useCallback(() => {
    const metadata = library.entries.map(entry => ({
      id: entry.id,
      date: entry.date,
      note: entry.note,
      location: entry.location,
      prompt: entry.prompt,
      timestamp: entry.timestamp,
      updatedAt: entry.updatedAt,
      demo: entry.demo,
    }));
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, `dayframe-metadata-${localDateKey()}.json`);
    addToast('Journal metadata exported.', 'success');
  }, [addToast, library.entries]);

  const exportImages = useCallback(() => {
    if (!library.entries.length) {
      addToast('There are no photos to export yet.', 'info');
      return;
    }
    library.entries.forEach((entry, index) => {
      window.setTimeout(() => {
        downloadBlob(entry.image, `dayframe-${entry.date}.jpg`);
      }, index * 250);
    });
    addToast('Photo downloads started.', 'success');
  }, [addToast, library.entries]);

  const clearDemo = useCallback(async () => {
    try {
      await library.clearDemo();
      updateSettings({ ...settings, demoLoaded: false });
      addToast('Sample photos removed.', 'success');
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Sample photos could not be removed.',
        'error',
      );
    }
  }, [addToast, library, settings, updateSettings]);

  const rerollChallenge = useCallback(() => {
    const current = getChallengeForDate(localDateKey(), library.history, CHALLENGES);
    const currentIndex = CHALLENGES.findIndex(challenge => challenge.prompt === current);
    const next = CHALLENGES[(currentIndex + 1) % CHALLENGES.length];
    library.setPrompt(localDateKey(), next.prompt);
    addToast('A new challenge is ready.', 'info');
  }, [addToast, library]);

  const editorDate = editingEntry?.date ?? localDateKey();
  const editorPrompt = useMemo(
    () =>
      editingEntry?.prompt ??
      getChallengeForDate(editorDate, library.history, CHALLENGES),
    [editorDate, editingEntry?.prompt, library.history],
  );

  if (!settings.onboarded) {
    return (
      <>
        <Onboarding
          onComplete={completeOnboarding}
          onError={message => addToast(message, 'error')}
        />
        <ToastRegion toasts={toasts} dismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          className="brand"
          type="button"
          onClick={() => setPage('today')}
          aria-label="Go to Today"
        >
          <span className="brand-mark"><span /></span>
          <strong>Dayframe</strong>
        </button>
        <span className="header-tagline">ONE DAY, ONE FRAME</span>
      </header>

      <main className="app-content">
        {page === 'today' && (
          <Today
            entries={library.entries}
            history={library.history}
            streak={library.streak}
            onOpenCamera={() => setCameraOpen(true)}
            onUpload={file => void openUpload(file)}
            onOpenEntry={setGalleryEntry}
            onReroll={rerollChallenge}
          />
        )}

        {page === 'library' && (
          <Library
            entries={library.entries}
            onOpen={entry => setGalleryEntry(entry)}
          />
        )}

        {page === 'rewards' && (
          <Rewards
            xp={library.xp}
            streak={library.streak}
            challengeCount={library.challengeCount}
            challenges={CHALLENGES}
            rewards={library.rewards}
            history={library.history}
          />
        )}

        {page === 'settings' && (
          <SettingsPage
            settings={settings}
            onSettingsChange={updateSettings}
            onExportMetadata={exportMetadata}
            onExportImages={exportImages}
            onClearDemo={() => void clearDemo()}
            onReset={() => setResetOpen(true)}
            onMessage={addToast}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {PAGES.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={page === item.id ? 'active' : ''}
              onClick={() => setPage(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={openCapture}
        onUpload={file => void openUpload(file)}
        onMessage={addToast}
      />

      {pendingBlob && (
        <PhotoEditor
          blob={pendingBlob}
          date={localDateKey()}
          initialPrompt={editorPrompt}
          onCancel={() => setPendingBlob(null)}
          onSave={saveFrame}
          onMessage={addToast}
        />
      )}

      {editingEntry && (
        <PhotoEditor
          blob={editingEntry.image}
          date={editingEntry.date}
          existing={editingEntry}
          initialPrompt={editorPrompt}
          onCancel={() => setEditingEntry(null)}
          onSave={saveFrame}
          onMessage={addToast}
        />
      )}

      {galleryEntry && (
        <PhotoGrid
          entries={library.entries}
          initialIndex={Math.max(
            0,
            library.entries.findIndex(entry => entry.date === galleryEntry.date),
          )}
          onClose={() => setGalleryEntry(null)}
          onDelete={requestDelete}
          onEdit={setEditingEntry}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this frame?"
        message="This photo will be permanently removed from this device. This action cannot be undone."
        confirmLabel="Delete frame"
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset your journal?"
        message="All photos, challenge history, and progress will be permanently removed from this device."
        confirmLabel="Reset everything"
        danger
        onConfirm={() => void resetProgress()}
        onCancel={() => setResetOpen(false)}
      />

      <ToastRegion toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}

export default App;