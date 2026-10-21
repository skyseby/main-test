import { useMemo, useState } from 'react';
import { Images, Search } from 'lucide-react';
import { formatShortDate } from '../utils/date';
import type { PhotoEntry } from '../types';

interface Props {
  entries: PhotoEntry[];
  onOpen: (entry: PhotoEntry, index: number) => void;
}

export function Library({ entries, onOpen }: Props) {
  const [filter, setFilter] = useState<'all' | 'captured'>('all');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => entries.filter(entry => {
    const matchesFilter = filter === 'all' || Boolean(entry.date);
    const text = `${entry.note} ${entry.location ?? ''} ${entry.date}`.toLowerCase();
    return matchesFilter && text.includes(query.toLowerCase());
  }), [entries, filter, query]);

  return (
    <div className="page library-page">
      <header className="page-heading">
        <div><span className="eyebrow">YOUR VISUAL STORY</span><h1>Library</h1></div>
        <span className="library-count">{entries.length} frames</span>
      </header>

      <div className="library-search">
        <Search size={17} />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search captions or dates"
          aria-label="Search library"
        />
      </div>

      <div className="segmented-control" aria-label="Library filter">
        <button className={filter === 'all' ? 'active' : ''} type="button" onClick={() => setFilter('all')}>
          All frames
        </button>
        <button className={filter === 'captured' ? 'active' : ''} type="button" onClick={() => setFilter('captured')}>
          By day
        </button>
      </div>

      {filtered.length === 0 ? (
        <section className="empty-state">
          <span><Images /></span>
          <h2>{entries.length ? 'No matching frames' : 'Your story starts here'}</h2>
          <p>{entries.length ? 'Try another caption, place, or date.' : 'Capture today and it will appear in your private timeline.'}</p>
        </section>
      ) : (
        <section className="photo-grid">
          {filtered.map((entry, index) => {
            const url = URL.createObjectURL(entry.image);
            return (
              <button className="grid-photo" type="button" key={entry.date} onClick={() => onOpen(entry, entries.indexOf(entry))}>
                <img src={url} alt={entry.note || formatShortDate(entry.date)} loading="lazy" />
                <span><strong>{formatShortDate(entry.date)}</strong><small>{entry.note || 'A day worth remembering.'}</small></span>
              </button>
            );
          })}
        </section>
      )}
    </div>
  );
}