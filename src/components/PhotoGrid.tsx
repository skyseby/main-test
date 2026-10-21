import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, MapPin, Pencil, Trash2, X } from 'lucide-react';
import { formatLongDate } from '../utils/date';
import { downloadBlob } from '../utils/storage';
import type { PhotoEntry } from '../types';

interface Props {
  entries: PhotoEntry[];
  initialIndex?: number;
  onClose: () => void;
  onDelete: (entry: PhotoEntry) => void;
  onEdit: (entry: PhotoEntry) => void;
}

export function PhotoGrid({ entries, initialIndex = 0, onClose, onDelete, onEdit }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const entry = entries[index];
  const url = useMemo(() => entry ? URL.createObjectURL(entry.image) : '', [entry]);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex(value => Math.min(entries.length - 1, value + 1));
      if (event.key === 'ArrowLeft') setIndex(value => Math.max(0, value - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entries.length, onClose]);

  if (!entry) return null;

  return (
    <div className="gallery-viewer" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <header>
        <button type="button" onClick={onClose} aria-label="Close viewer"><X /></button>
        <span>{index + 1} / {entries.length}</span>
        <button
          type="button"
          onClick={() => downloadBlob(entry.image, `dayframe-${entry.date}.jpg`)}
          aria-label="Download photo"
        >
          <Download />
        </button>
      </header>
      <button
        className="gallery-arrow previous"
        type="button"
        onClick={() => setIndex(value => Math.max(0, value - 1))}
        disabled={index === 0}
        aria-label="Previous photo"
      >
        <ChevronLeft />
      </button>
      <img src={url} alt={entry.note || `Photo from ${entry.date}`} />
      <button
        className="gallery-arrow next"
        type="button"
        onClick={() => setIndex(value => Math.min(entries.length - 1, value + 1))}
        disabled={index === entries.length - 1}
        aria-label="Next photo"
      >
        <ChevronRight />
      </button>
      <section className="gallery-caption">
        <div>
          <strong>{formatLongDate(entry.date)}</strong>
          <p>{entry.note || 'A day worth remembering.'}</p>
          {entry.location && <span><MapPin size={14} /> {entry.location}</span>}
        </div>
        <div className="gallery-caption-actions">
          <button type="button" onClick={() => { onClose(); onEdit(entry); }} aria-label="Edit photo">
            <Pencil />
          </button>
          <button type="button" onClick={() => { onClose(); onDelete(entry); }} aria-label="Delete photo">
            <Trash2 />
          </button>
        </div>
      </section>
    </div>
  );
}