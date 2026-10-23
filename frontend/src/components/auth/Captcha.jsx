import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { GlassInput } from './GlassFields';

// Ambiguous characters (0/O, 1/I/L) are left out so the code is easy to read.
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const WIDTH = 176;
const HEIGHT = 52;
const COLORS = ['#e0f2fe', '#bae6fd', '#a5f3fc', '#ffffff', '#bfdbfe'];

function generateCode() {
  let code = '';
  const bytes = new Uint32Array(CODE_LENGTH);
  const hasCrypto = typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues;
  if (hasCrypto) window.crypto.getRandomValues(bytes);
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    const n = hasCrypto ? bytes[i] : Math.floor(Math.random() * 1e9);
    code += CHARSET[n % CHARSET.length];
  }
  return code;
}

const rand = (min, max) => Math.random() * (max - min) + min;

/** Case-insensitive comparison between what the user typed and the generated code. */
export function isCaptchaValid(input = '', code = '') {
  return !!code && input.trim().toUpperCase() === code.toUpperCase();
}

export function Captcha({ value, onChange, onCodeChange, refreshSignal = 0, error, inputId = 'captcha-input' }) {
  const canvasRef = useRef(null);
  const onCodeChangeRef = useRef(onCodeChange);
  onCodeChangeRef.current = onCodeChange;
  const [code, setCode] = useState('');

  const regenerate = useCallback(() => {
    const next = generateCode();
    setCode(next);
    if (onCodeChangeRef.current) onCodeChangeRef.current(next);
  }, []);

  // New code on mount and whenever the parent bumps refreshSignal
  useEffect(() => {
    regenerate();
  }, [regenerate, refreshSignal]);

  // Draw the code with noise so it is not trivially machine-readable
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !code) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bg.addColorStop(0, '#0b1f4d');
    bg.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // background noise lines
    for (let i = 0; i < 7; i += 1) {
      ctx.strokeStyle = `rgba(125, 211, 252, ${rand(0.15, 0.4).toFixed(2)})`;
      ctx.lineWidth = rand(0.8, 1.6);
      ctx.beginPath();
      ctx.moveTo(rand(0, WIDTH), rand(0, HEIGHT));
      ctx.bezierCurveTo(rand(0, WIDTH), rand(0, HEIGHT), rand(0, WIDTH), rand(0, HEIGHT), rand(0, WIDTH), rand(0, HEIGHT));
      ctx.stroke();
    }

    // noise dots
    for (let i = 0; i < 40; i += 1) {
      ctx.fillStyle = `rgba(186, 230, 253, ${rand(0.2, 0.6).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(rand(0, WIDTH), rand(0, HEIGHT), rand(0.6, 1.6), 0, Math.PI * 2);
      ctx.fill();
    }

    // characters
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const step = WIDTH / (code.length + 1);
    for (let i = 0; i < code.length; i += 1) {
      ctx.save();
      ctx.translate(step * (i + 1), HEIGHT / 2 + rand(-4, 4));
      ctx.rotate(rand(-0.35, 0.35));
      ctx.font = `bold ${Math.round(rand(26, 31))}px Inter, Arial, sans-serif`;
      ctx.fillStyle = COLORS[Math.floor(Math.random() * COLORS.length)];
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    // strike-through wave
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const startY = rand(HEIGHT * 0.35, HEIGHT * 0.65);
    ctx.moveTo(0, startY);
    ctx.bezierCurveTo(WIDTH * 0.3, startY + rand(-14, 14), WIDTH * 0.65, startY + rand(-14, 14), WIDTH, rand(HEIGHT * 0.3, HEIGHT * 0.7));
    ctx.stroke();
  }, [code]);

  const handleRefresh = () => {
    regenerate();
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Captcha image. Type the characters you see into the box below."
          className="rounded-lg border border-white/25 select-none"
          style={{ width: WIDTH, height: HEIGHT, maxWidth: '100%' }}
        />
        <button
          type="button"
          onClick={handleRefresh}
          className="p-2.5 rounded-lg border border-white/25 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          aria-label="Get a new captcha"
          title="Get a new captcha"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <GlassInput
        id={inputId}
        label="Captcha"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type the characters shown above"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={CODE_LENGTH}
        error={error}
      />
    </div>
  );
}
