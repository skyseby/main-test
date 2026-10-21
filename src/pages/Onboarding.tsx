import { useState } from 'react';
import { Camera, Check, ImagePlus, LockKeyhole, Sparkles } from 'lucide-react';

interface Props {
  onComplete: (demo: boolean) => void;
  onError: (message: string) => void;
}

export function Onboarding({ onComplete, onError }: Props) {
  const [demo, setDemo] = useState(true);
  const [busy, setBusy] = useState(false);

  const continueToApp = async () => {
    setBusy(true);
    try {
      await onComplete(demo);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Setup could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="onboarding">
      <div className="onboarding-art">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="hero-camera"><Camera size={62} strokeWidth={1.4} /></div>
        <span className="floating-card card-one"><Sparkles /> One frame a day</span>
        <span className="floating-card card-two"><LockKeyhole /> Private by design</span>
      </div>
      <section className="onboarding-copy">
        <span className="eyebrow">WELCOME TO DAYFRAME</span>
        <h1>Remember today,<br /><em>one frame at a time.</em></h1>
        <p>A gentle daily photo ritual that grows into a visual story, entirely on your device.</p>
        <ul>
          <li><span><Camera /></span><div><strong>Capture your day</strong><small>Use the camera or choose a photo.</small></div><Check /></li>
          <li><span><Sparkles /></span><div><strong>Build a daily habit</strong><small>Complete creative prompts and earn rewards.</small></div><Check /></li>
          <li><span><LockKeyhole /></span><div><strong>Keep it private</strong><small>Nothing leaves this browser unless you export it.</small></div><Check /></li>
        </ul>
        <label className="demo-option">
          <input type="checkbox" checked={demo} onChange={event => setDemo(event.target.checked)} />
          <span><ImagePlus size={18} /> Include sample days so I can explore</span>
        </label>
        <button className="button primary large" type="button" disabled={busy} onClick={() => void continueToApp()}>
          {busy ? 'Preparing your journal…' : 'Start my journal'}
        </button>
        <small className="privacy-note"><LockKeyhole size={12} /> No account. No tracking. No uploads.</small>
      </section>
    </main>
  );
}