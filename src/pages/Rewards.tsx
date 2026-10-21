import { Award, Flame, Images, Lock, Medal, Sparkles, Trophy } from 'lucide-react';
import { levelForXp } from '../utils/progress';
import type { Challenge, StreakResult } from '../types';

interface Props {
  xp: number;
  streak: StreakResult;
  challengeCount: number;
  challenges: Challenge[];
  rewards: { id: string; name: string; description: string; requirement: number; category: string; unlocked: boolean }[];
  history: Record<string, { completed: boolean; prompt: string; challengeId: string }>;
}

const icons = {
  flame: Flame,
  calendar: Sparkles,
  trophy: Trophy,
  award: Award,
  crown: Trophy,
  images: Images,
  sparkles: Sparkles,
  medal: Medal,
};

export function Rewards({ xp, streak, challengeCount, rewards }: Props) {
  const level = levelForXp(xp);
  const unlocked = rewards.filter(reward => reward.unlocked).length;

  return (
    <div className="page rewards-page">
      <header className="page-heading">
        <div><span className="eyebrow">SMALL MOMENTS, BIG RHYTHM</span><h1>Rewards</h1></div>
      </header>

      <section className="level-card">
        <div className="level-badge"><span>LV</span><strong>{level.level}</strong></div>
        <div className="level-copy">
          <div><strong>{xp.toLocaleString()} XP</strong><span>{level.current} / {level.needed} to next level</span></div>
          <div className="level-track"><span style={{ width: `${level.progress}%` }} /></div>
        </div>
      </section>

      <section className="reward-summary">
        <div><strong>{streak.current}</strong><span>Day streak</span></div>
        <div><strong>{streak.totalDays}</strong><span>Days captured</span></div>
        <div><strong>{challengeCount}</strong><span>Challenge types</span></div>
      </section>

      <div className="section-title">
        <div><span className="eyebrow">MILESTONES</span><h2>Badges</h2></div>
        <span>{unlocked}/{rewards.length}</span>
      </div>

      <section className="badge-grid">
        {rewards.map(reward => {
          const Icon = icons[reward.icon as keyof typeof icons] ?? Award;
          return (
            <article className={`reward-badge ${reward.unlocked ? 'unlocked' : 'locked'}`} key={reward.id}>
              <span><Icon /></span>
              <div><strong>{reward.name}</strong><p>{reward.description}</p></div>
              {reward.unlocked ? <small>Unlocked</small> : <Lock size={14} />}
            </article>
          );
        })}
      </section>
    </div>
  );
}