import React, { useMemo } from 'react';

/**
 * Procedural Glass Shatter Particle System
 * Creates translucent glass fragments flying outward from the bulb's epicenter
 */
export default function GlassShatter() {
  const shards = useMemo(() => {
    const list = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
      const distance = 45 + Math.random() * 110;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance + Math.random() * 35; // slight gravitational pull
      const rot = (Math.random() - 0.5) * 540;
      const sizeW = 6 + Math.random() * 14;
      const sizeH = 6 + Math.random() * 16;
      const delay = Math.random() * 0.08;
      const duration = 0.55 + Math.random() * 0.35;
      
      // Random irregular shard clip paths
      const clipVariants = [
        'polygon(50% 0%, 0% 100%, 100% 100%)',
        'polygon(25% 0%, 100% 30%, 65% 100%, 0% 70%)',
        'polygon(0% 0%, 100% 0%, 80% 100%, 20% 90%)',
        'polygon(40% 0%, 100% 60%, 10% 100%)',
        'polygon(50% 0%, 90% 40%, 70% 100%, 10% 80%)'
      ];
      const clip = clipVariants[i % clipVariants.length];

      list.push({
        id: i,
        targetX,
        targetY,
        rot,
        sizeW,
        sizeH,
        clip,
        delay,
        duration,
      });
    }
    return list;
  }, []);

  const dustParticles = useMemo(() => {
    const sparks = [];
    for (let j = 0; j < 16; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const dist = 25 + Math.random() * 80;
      sparks.push({
        id: j,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 0.05,
      });
    }
    return sparks;
  }, []);

  return (
    <div className="shatter-layer" aria-hidden="true">
      {/* Flying Glass Shards */}
      {shards.map((s) => (
        <div
          key={`shard-${s.id}`}
          className="glass-shard"
          style={{
            width: `${s.sizeW}px`,
            height: `${s.sizeH}px`,
            clipPath: s.clip,
            left: '0px',
            top: '0px',
            transform: 'translate(-50%, -50%)',
            animation: `flyShard-${s.id} ${s.duration}s cubic-bezier(0.12, 0.8, 0.32, 1) ${s.delay}s forwards`,
          }}
        />
      ))}

      {/* Bursting glowing dust motes */}
      {dustParticles.map((d) => (
        <div
          key={`spark-${d.id}`}
          style={{
            position: 'absolute',
            width: `${d.size}px`,
            height: `${d.size}px`,
            borderRadius: '50%',
            background: 'rgba(255, 230, 160, 0.95)',
            boxShadow: '0 0 6px rgba(212, 163, 89, 0.9)',
            transform: 'translate(-50%, -50%)',
            animation: `flySpark-${d.id} 0.65s ease-out ${d.delay}s forwards`,
          }}
        />
      ))}

      <style>{`
        ${shards
          .map(
            (s) => `
          @keyframes flyShard-${s.id} {
            0% {
              transform: translate(-50%, -50%) scale(1) rotate(0deg);
              opacity: 1;
            }
            80% {
              opacity: 0.9;
            }
            100% {
              transform: translate(calc(-50% + ${s.targetX}px), calc(-50% + ${s.targetY}px)) scale(0.65) rotate(${s.rot}deg);
              opacity: 0;
            }
          }
        `
          )
          .join('\n')}

        ${dustParticles
          .map(
            (d) => `
          @keyframes flySpark-${d.id} {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(calc(-50% + ${d.x}px), calc(-50% + ${d.y}px)) scale(0);
              opacity: 0;
            }
          }
        `
          )
          .join('\n')}
      `}</style>
    </div>
  );
}
