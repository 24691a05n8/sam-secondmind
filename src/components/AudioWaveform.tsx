import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  isPaused?: boolean;
  audioLevel?: number; // 0 to 1
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isRecording,
  isPaused = false,
  audioLevel = 0,
  barCount = 36
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const heights = new Array(barCount).fill(4);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / barCount) - 3;

      for (let i = 0; i < barCount; i++) {
        let targetHeight = 4;
        if (isRecording && !isPaused) {
          // Dynamic wave formula with audio level + sine harmonics
          const centerDist = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
          const wave = Math.sin(Date.now() * 0.006 + i * 0.4) * 0.3 + 0.7;
          targetHeight = Math.max(4, centerDist * (audioLevel * 0.8 + 0.2) * wave * (height * 0.85));
        }

        // Smooth damping
        heights[i] += (targetHeight - heights[i]) * 0.2;

        const x = i * (barWidth + 3);
        const y = (height - heights[i]) / 2;

        // Gradient from electric blue (#4F8CFF) to primary purple (#8B5CF6) to highlight (#B69CFF)
        const gradient = ctx.createLinearGradient(0, y, 0, y + heights[i]);
        gradient.addColorStop(0, '#4F8CFF');
        gradient.addColorStop(0.6, '#8B5CF6');
        gradient.addColorStop(1, '#B69CFF');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, heights[i], 3);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRecording, isPaused, audioLevel, barCount]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={380}
        height={56}
        className="w-full max-w-md h-14 rounded-lg bg-sam-surface/40 border border-sam-purple/10 shadow-inner"
      />
    </div>
  );
};

