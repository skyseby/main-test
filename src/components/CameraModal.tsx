import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  Grid3X3,
  ImagePlus,
  RefreshCw,
  SwitchCamera,
  X,
  Zap,
  ZapOff,
} from 'lucide-react';
import { compressImage } from '../utils/image';

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
  onUpload: (file: File) => void;
  onMessage: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

type CameraState = 'idle' | 'requesting' | 'ready' | 'active' | 'unavailable' | 'blocked' | 'error';

export function CameraModal({ open, onClose, onCapture, onUpload, onMessage }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<CameraState>('idle');
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [flash, setFlash] = useState(false);
  const [grid, setGrid] = useState(false);
  const [busy, setBusy] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async (mode: 'environment' | 'user' = facing) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unavailable');
      onMessage('Camera access is unavailable in this browser. Choose a photo instead.', 'info');
      return;
    }

    setState('requesting');
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState('active');
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      const blocked = name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError';
      setState(blocked ? 'blocked' : 'error');
      onMessage(
        blocked
          ? 'Camera permission is blocked. You can allow it in browser settings or choose a photo.'
          : 'The camera could not start. Choose a photo or try again.',
        'error',
      );
    }
  }, [facing, onMessage, stopStream]);

  useEffect(() => {
    if (open) void startCamera();
    else stopStream();
    return stopStream;
  }, [open, startCamera, stopStream]);

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || busy) return;

    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing is unavailable.');
      context.drawImage(video, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          result => result ? resolve(result) : reject(new Error('Capture failed.')),
          'image/jpeg',
          0.92,
        );
      });
      onCapture(blob);
    } catch {
      onMessage('The frame could not be captured. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const result = await compressImage(file);
      onUpload(result.blob);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'The photo could not be opened.', 'error');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (!open) return null;

  return (
    <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Camera">
      <header className="camera-header">
        <button type="button" onClick={onClose} aria-label="Close camera"><X /></button>
        <strong>Capture today</strong>
        <button
          type="button"
          onClick={() => setGrid(value => !value)}
          aria-label="Toggle composition grid"
          aria-pressed={grid}
        >
          <Grid3X3 className={grid ? 'active-tool' : ''} />
        </button>
      </header>

      <div className={`camera-viewport ${grid ? 'show-grid' : ''}`}>
        <video ref={videoRef} playsInline muted />
        {grid && <div className="camera-grid" aria-hidden="true" />}
        {state !== 'active' && (
          <div className="camera-state">
            {state === 'requesting' ? <RefreshCw className="spin" /> : <Camera />}
            <h2>{state === 'requesting' ? 'Starting camera…' : 'Camera unavailable'}</h2>
            <p>
              {state === 'blocked'
                ? 'Permission is blocked in browser settings. Your library is still available.'
                : 'You can capture with a device camera or choose a photo from your library.'}
            </p>
            {state !== 'requesting' && (
              <button className="button primary" type="button" onClick={() => void startCamera()}>
                Try camera again
              </button>
            )}
          </div>
        )}
      </div>

      <div className="camera-tools">
        <button
          type="button"
          className={flash ? 'selected' : ''}
          onClick={() => setFlash(value => !value)}
          aria-label="Toggle flash"
          aria-pressed={flash}
        >
          {flash ? <Zap /> : <ZapOff />}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} aria-label="Choose photo from library">
          <ImagePlus />
        </button>
        <button
          className="shutter"
          type="button"
          onClick={() => void capture()}
          disabled={state !== 'active' || busy}
          aria-label="Take photo"
        >
          {busy ? <RefreshCw className="spin" /> : <span />}
        </button>
        <button
          type="button"
          onClick={() => {
            const next = facing === 'environment' ? 'user' : 'environment';
            setFacing(next);
            void startCamera(next);
          }}
          aria-label="Switch camera"
        >
          <SwitchCamera />
        </button>
        <button
          type="button"
          onClick={() => setFlash(value => !value)}
          aria-label="Toggle flash"
          aria-pressed={flash}
        >
          {flash ? <Zap /> : <ZapOff />}
        </button>
      </div>

      <input
        ref={fileRef}
        hidden
        type="file"
        accept="image/*"
        onChange={event => void upload(event.target.files?.[0])}
      />
    </div>
  );
}