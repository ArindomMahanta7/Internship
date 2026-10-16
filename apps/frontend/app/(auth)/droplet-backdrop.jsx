"use client";

import { useEffect, useMemo, useRef } from "react";

/* Water-droplet backdrop for the auth screens.
 *
 * The droplets sit at fixed positions and gently drift. When the cursor moves
 * near one, it gets pushed away and brightens, so the background feels liquid.
 * Everything is done with transforms on a few dozen elements in one
 * requestAnimationFrame loop, so it stays cheap and never re-renders React.
 */

const DROPLET_COUNT = 26;
const INFLUENCE_RADIUS = 180; // px within which a droplet reacts
const PUSH_DISTANCE = 46; // max px a droplet is displaced
const EASING = 0.12; // how quickly it eases back

/* Deterministic PRNG so server and client render identical droplets. */
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function DropletBackdrop() {
  const layerRef = useRef(null);
  const dropletRefs = useRef([]);
  const pointer = useRef({ x: -9999, y: -9999, active: false });

  /* Deterministic layout, generated once, so hydration matches. */
  const droplets = useMemo(() => {
    const random = mulberry32(20260825);
    return Array.from({ length: DROPLET_COUNT }, () => ({
      x: random() * 100, // % of layer width
      y: random() * 100, // % of layer height
      size: 10 + random() * 46, // px
      opacity: 0.35 + random() * 0.45,
      driftPhase: random() * Math.PI * 2,
      driftSpeed: 0.4 + random() * 0.6,
      driftAmount: 3 + random() * 5,
    }));
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;

    const nodes = dropletRefs.current.filter(Boolean);
    const state = nodes.map(() => ({ x: 0, y: 0 }));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;

    function onPointerMove(event) {
      const rect = layer.getBoundingClientRect();
      pointer.current.x = event.clientX - rect.left;
      pointer.current.y = event.clientY - rect.top;
      pointer.current.active = true;
      layer.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      layer.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }

    function onPointerLeave() {
      pointer.current.active = false;
      layer.style.setProperty("--glow-opacity", "0.35");
    }

    function onPointerEnter() {
      layer.style.setProperty("--glow-opacity", "0.9");
    }

    function tick(now) {
      const t = now / 1000;
      const rect = layer.getBoundingClientRect();
      const pointerPos = pointer.current;
      const animate = !reduceMotion.matches;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const drop = droplets[i];
        const item = state[i];

        const baseX = (drop.x / 100) * rect.width;
        const baseY = (drop.y / 100) * rect.height;

        let targetX = 0;
        let targetY = 0;
        let glow = 0;

        if (pointerPos.active) {
          const dx = baseX - pointerPos.x;
          const dy = baseY - pointerPos.y;
          const distance = Math.hypot(dx, dy);

          if (distance < INFLUENCE_RADIUS) {
            const strength = 1 - distance / INFLUENCE_RADIUS;
            const push = strength * PUSH_DISTANCE;
            const angle = Math.atan2(dy, dx);
            targetX = Math.cos(angle) * push;
            targetY = Math.sin(angle) * push;
            glow = strength;
          }
        }

        item.x += (targetX - item.x) * EASING;
        item.y += (targetY - item.y) * EASING;

        const driftX = animate ? Math.sin(t * drop.driftSpeed + drop.driftPhase) * drop.driftAmount : 0;
        const driftY = animate ? Math.cos(t * drop.driftSpeed * 0.8 + drop.driftPhase) * drop.driftAmount : 0;
        const scale = 1 + glow * 0.35;

        node.style.transform = `translate3d(${(item.x + driftX).toFixed(2)}px, ${(item.y + driftY).toFixed(
          2
        )}px, 0) scale(${scale.toFixed(3)})`;
        node.style.setProperty("--glow", glow.toFixed(3));
      }

      frameId = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerenter", onPointerEnter);
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerenter", onPointerEnter);
    };
  }, [droplets]);

  return (
    <div className="buycart-backdrop" ref={layerRef} aria-hidden="true">
      <div className="buycart-backdrop__glow" />
      {droplets.map((drop, index) => (
        <span
          key={index}
          className="buycart-droplet"
          ref={(node) => {
            dropletRefs.current[index] = node;
          }}
          style={{
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            width: `${drop.size}px`,
            height: `${drop.size}px`,
            marginTop: `${-drop.size / 2}px`,
            marginLeft: `${-drop.size / 2}px`,
            "--base-opacity": drop.opacity,
          }}
        />
      ))}
    </div>
  );
}
