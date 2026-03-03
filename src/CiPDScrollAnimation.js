import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CiPDScrollAnimation({ maxWidth = 640, maxHeight } = {}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const imgSizeRef = useRef({ width: 16, height: 9 });
  const [loading, setLoading] = useState(true);
  const frameCount = 240;

  useEffect(() => {
    let cancelled = false;

    const loadOne = (i) =>
      new Promise((resolve) => {
        const img = new Image();
        const idx = String(i).padStart(3, '0');
        img.src = `${process.env.PUBLIC_URL}/animation/ezgif-frame-${idx}.jpg`;
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.error('Failed to load', img.src);
          resolve(img);
        };
      });

    const preloadAll = async () => {
      const promises = [];
      for (let i = 1; i <= frameCount; i++) promises.push(loadOne(i));
      const imgs = await Promise.all(promises);
      if (cancelled) return;
      imagesRef.current = imgs;
      const first = imgs[0];
      if (first && first.naturalWidth && first.naturalHeight) {
        imgSizeRef.current = { width: first.naturalWidth, height: first.naturalHeight };
      }
      setLoading(false);
      initCanvasAndScroll();
    };

    function initCanvasAndScroll() {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const ctx = canvas.getContext('2d');

      let dpr = window.devicePixelRatio || 1;

      function resize() {
        dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        const containerW = rect.width;
        const aspect = imgSizeRef.current.width / imgSizeRef.current.height || 16 / 9;
        const canvasW = containerW;
        const canvasH = canvasW / aspect;

        canvas.style.width = canvasW + 'px';
        canvas.style.height = canvasH + 'px';
        canvas.width = Math.round(canvasW * dpr);
        canvas.height = Math.round(canvasH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        renderFrame(currentFrame);
      }

      let currentFrame = 0;

      function renderFrame(index) {
        currentFrame = Math.min(frameCount - 1, Math.max(0, Math.round(index)));
        const img = imagesRef.current[currentFrame];
        if (!img) return;

        const cw = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, cw, ch);

        const imgAspect = (img.naturalWidth || imgSizeRef.current.width) / (img.naturalHeight || imgSizeRef.current.height);
        let drawW = cw;
        let drawH = ch;
        if (imgAspect > cw / ch) {
          drawH = ch;
          drawW = drawH * imgAspect;
        } else {
          drawW = cw;
          drawH = drawW / imgAspect;
        }
        const x = (cw - drawW) / 2;
        const y = (ch - drawH) / 2;
        ctx.drawImage(img, x, y, drawW, drawH);
      }

      window.addEventListener('resize', resize);

      // draw first frame
      renderFrame(0);

      const gsapCtx = gsap.context(() => {
        const obj = { frame: 0 };
        gsap.to(obj, {
          frame: frameCount - 1,
          ease: 'none',
          onUpdate: () => renderFrame(obj.frame),
          snap: { frame: 1 },
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '+=2000',
            scrub: 1,
            pin: true,
          },
        });
      }, container);

      // attach cleanup to canvas for outer effect cleanup
      canvas._cipd_cleanup = () => {
        window.removeEventListener('resize', resize);
        try {
          gsapCtx.revert();
        } catch (e) {
          console.warn('gsap revert failed', e);
        }
      };
    }

    preloadAll();

    return () => {
      cancelled = true;
      const canvas = canvasRef.current;
      if (canvas && canvas._cipd_cleanup) canvas._cipd_cleanup();
    };
  }, []);

  const containerStyle = { position: 'relative', width: '100%', maxWidth, margin: '0 auto', overflow: 'hidden' };
  if (maxHeight) containerStyle.maxHeight = maxHeight;

  return (
    <div ref={containerRef} style={containerStyle}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.95)', zIndex: 50 }}>
          <div style={{ fontSize: 18, color: '#111' }}>Loading...</div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
    </div>
  );
}
