import { useEffect, useMemo, useState } from 'react';
import { Check, MapPin, RefreshCw, X } from 'lucide-react';
import { CHALLENGES } from '../data/challenges';
import { formatLongDate, localDateKey } from '../utils/date';
import { compressImage } from '../utils/image';
import type { PhotoEntry } from '../types';

interface Props {
  blob: Blob;
  date: string;
  existing?: PhotoEntry;
  initialPrompt: string;
  onCancel: () => void;
  onSave: (entry: Omit<PhotoEntry, 'id'>) => Promise<void>;
  onMessage: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

export function PhotoEditor({
  blob,
  date,
  existing,
  initialPrompt,
  onCancel,
  onSave,
  onMessage,
}: Props) {
  const [image, setImage] = useState(blob);
  const [note, setNote] = useState(existing?.note ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [prompt, setPrompt] = useState(existing?.prompt ?? initialPrompt);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const previewUrl = useMemo(() => URL.createObjectURL(image), [image]);

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  const replaceImage = async (file?: File) => {
    if (!file) return;
    try {
      const result = await compressImage(file);
      setImage(result.blob);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'The photo could not be processed.', 'error');
    }
  };

  const useLocation = () => {
    if (!navigator.geolocation) {
      onMessage('Location is not supported by this browser.', 'error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setLocating(false);
      },
      () => {
        onMessage('Your location could not be read. You can enter it manually.', 'error');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const timestamp = existing?.timestamp ?? Date.now();
      await onSave({
        date,
        image,
        note: note.trim(),
        location: location.trim() || undefined,
        prompt,
        timestamp,
        updatedAt: Date.now(),
        demo: existing?.demo,
      });
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'The photo could not be saved.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="photo-editor" role="dialog" aria-modal="true" aria-label="Save photo">
      <header>
        <button type="button" onClick={onCancel} aria-label="Cancel"><X /></button>
        <strong>{existing ? 'Edit frame' : 'Keep this frame'}</strong>
        <button className="editor-save-top" type="button" onClick={() => void submit()} disabled={saving}>
          <Check /> Save
        </button>
      </header>

      <div className="editor-scroll">
        <div className="editor-preview">
          <img src={previewUrl} alt="Photo preview" />
          <label className="replace-photo">
            <RefreshCw size={15} /> Replace
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={event => void replaceImage(event.target.files?.[0])}
            />
          </label>
        </div>

        <div className="editor-fields">
          <span className="eyebrow">{formatLongDate(date)}</span>
          <label>
            Caption
            <textarea
              value={note}
              maxLength={280}
              placeholder="What would you like to remember?"
              onChange={event => setNote(event.target.value)}
            />
          </label>
          <label>
            Location <small>Optional</small>
            <div className="location-field">
              <MapPin size={17} />
              <input
                value={location}
                placeholder="Add a place"
                onChange={event => setLocation(event.target.value)}
              />
              <button type="button" onClick={useLocation} disabled={locating}>
                {locating ? <RefreshCw className="spin" size={16} /> : 'Use GPS'}
              </button>
            </div>
          </label>
          <label>
            Daily challenge
            <select value={prompt} onChange={event => setPrompt(event.target.value)}>
              {CHALLENGES.map(challenge => (
                <option key={challenge.id} value={challenge.prompt}>{challenge.prompt}</option>
              ))}
            </select>
          </label>
          <div className="privacy-note"><MapPin size={13} /> Saved only on this device.</div>
        </div>
      </div>

      <div className="editor-actions">
        <button className="button primary large" type="button" onClick={() => void submit()} disabled={saving}>
          {saving ? <><RefreshCw className="spin" size={18} /> Saving…</> : <><Check size={18} /> Save to journal</>}
        </button>
      </div>
    </div>
  );
}