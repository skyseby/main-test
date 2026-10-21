import { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Flame,
  ImagePlus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { CHALLENGES } from '../data/challenges';
import { formatLongDate, getWeekDates, localDateKey } from '../utils/date';
import { getChallengeForDate } from '../utils/progress';
import type { ChallengeHistory, PhotoEntry, StreakResult } from '../types';

interface Props {
  entries: PhotoEntry[];
  history: ChallengeHistory;
  streak: StreakResult;
  onOpenCamera: () => void;
  onUpload: (file: File) => void;
  onOpenEntry: (entry: PhotoEntry) => void;
  onReroll: () => void;
}

export function Today({
  entries,
  history,
  streak,
  onOpenCamera,
  onUpload,
  onOpenEntry,
  onReroll,
}: Props) {
  const today = localDateKey();
  const [weekDates] = useState(getWeekDates());
  const fileRef = useRef<HTMLInputElement>(null);
  const todayEntry = entries.find(entry => entry.date === today);
  const prompt = getChallengeForDate(today, history, CHALLENGES);
  const completed = Boolean(todayEntry);
  const weeklyCount = weekDates.filter(date => entries.some(entry => entry.date === date)).length;

  return (
    <div className="page today-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">{formatLongDate(today)}</span>
          <h1>Today’s frame</h1>
        </div>
        <div className="today-level">
          <span>DAY</span>
          <strong>{streak.current + 1}</strong>
        </div>
      </header>

      <section className="streak-card">
        <div className="streak-main">
          <span className="streak-icon"><Flame /></span>
          <div>
            <strong>{streak.current} day{streak.current === 1 ? '' : 's'}</strong>
            <span>Current streak</span>
          </div>
        </div>
        <div className="streak-stats">
          <div><strong>{streak.longest}</strong><span>Longest</span></div>
          <div><strong>{streak.totalDays}</strong><span>Days captured</span></div>
          <div><strong>{streak.totalPhotos}</strong><span>Frames</span></div>
        </div>
      </section>

      <section className={`challenge-card ${completed ? 'completed' : ''}`}>
        <div className="challenge-topline">
          <span><Sparkles size={15} /> TODAY’S CHALLENGE</span>
          <button type="button" onClick={onReroll} disabled={completed}>
            <RefreshCw size={15} /> Reroll
          </button>
        </div>
        <h2>“{prompt}”</h2>
        <p>{completed ? 'Completed. Your frame is part of your story.' : 'Complete it when you save today’s photo.'}</p>
        {completed && <span className="completed-chip"><CheckCircle2 size={14} /> Completed</span>}
      </section>

      <section className="capture-card">
        {todayEntry ? (
          <button className="today-photo" type="button" onClick={() => onOpenEntry(todayEntry)}>
            <img src={URL.createObjectURL(todayEntry.image)} alt="Today’s saved photo" />
            <span className="saved-overlay"><CheckCircle2 /> Saved today</span>
          </button>
        ) : (
          <div className="capture-placeholder">
            <div className="capture-rings">
              <span><Camera size={44} /></span>
            </div>
            <h2>What made today yours?</h2>
            <p>One photo is all it takes to keep the streak alive.</p>
            <button className="button primary large" type="button" onClick={onOpenCamera}>
              <Camera /> Open camera
            </button>
            <button className="button ghost" type="button" onClick={() => fileRef.current?.click()}>
              <ImagePlus /> Choose from library
            </button>
            <input
              ref={fileRef}
              hidden
              type="file"
              accept="image/*"
              onChange={event => {
                const file = event.currentTarget.files?.[0];
                if (file) onUpload(file);
                event.currentTarget.value = '';
              }}
            />
          </div>
        )}
      </section>

      <section className="week-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">THIS WEEK</span>
            <h2>Your rhythm</h2>
          </div>
          <span>{weeklyCount}/7</span>
        </div>
        <div className="week-grid">
          {weekDates.map(date => {
            const entry = entries.find(item => item.date === date);
            const dayLabel = new Date(`${date}T12:00:00`)
              .toLocaleDateString(undefined, { weekday: 'short' })
              .slice(0, 1);

            return (
              <div className={`week-day ${entry ? 'captured' : ''}`} key={date}>
                <span>{dayLabel}</span>
                {entry ? <CheckCircle2 size={18} /> : <i />}
              </div>
            );
          })}
        </div>
        <div
          className="weekly-progress"
          role="progressbar"
          aria-label="Weekly capture progress"
          aria-valuemin={0}
          aria-valuemax={7}
          aria-valuenow={weeklyCount}
        >
          <span style={{ width: `${(weeklyCount / 7) * 100}%` }} />
        </div>
        <p className="motivational-copy">
          {weeklyCount === 7
            ? 'A complete week. You showed up for every day.'
            : `${7 - weeklyCount} more ${7 - weeklyCount === 1 ? 'day' : 'days'} to complete this week.`}
        </p>
      </section>
    </div>
  );
}