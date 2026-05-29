import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bgVideo from "./assets/UryuUIChangedEND.mp4";

import ui1 from "./assets/KaguraUI.png";
import ui2 from "./assets/KaguraUI.png";
import ui3 from "./assets/KaguraUI.png";
import ui4 from "./assets/KaguraUI.png";
import ui5 from "./assets/KaguraUI.png";

const UI_PIECES = [
  {
    // src: ui1,
    src: ui1,
    title: "Game HUD",
    tag: "Game UI",
    desc: "In-game heads-up display — health, inventory, and minimap layout designed for readability under pressure.",
  },
  {
    // src: ui2,
    src: ui2,
    title: "Main Menu",
    tag: "Game UI",
    desc: "Cinematic character-select screen with animated bars and role indicators.",
  },
  {
    // src: ui3,
    src: ui3,
    title: "Inventory System",
    tag: "Game UI",
    desc: "Grid-based item management with tooltip overlays and drag-and-drop zones.",
  },
  {
    // src: ui4,
    src: ui4,
    title: "Settings Screen",
    tag: "Game UI",
    desc: "Keybindings, audio sliders, and display options — tabbed layout with a clean dark theme.",
  },
  {
    // src: ui5,
    src: ui5,
    title: "Pause Menu",
    tag: "Game UI",
    desc: "Minimal overlay pause screen with resume, options, and quit — designed not to break immersion.",
  },
  // ── To add more pieces, copy a block above and paste it here ──
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.4;

export default function UIGallery() {
  const [mounted, setMounted]     = useState(false);
  const [active, setActive]       = useState(0);
  const [lightbox, setLightbox]   = useState(false);
  const [lbIndex, setLbIndex]     = useState(0);
  const [lbVisible, setLbVisible] = useState(false);
  const [scanlines, setScanlines] = useState(true);

  // Zoom / pan state
  const [zoom, setZoom]           = useState(1);
  const [pan, setPan]             = useState({ x: 0, y: 0 });
  const isDragging                = useRef(false);
  const dragStart                 = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const frameRef                  = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Reset zoom/pan whenever image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [lbIndex]);

  const openLightbox = useCallback((i) => {
    setLbIndex(i);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setLightbox(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setLbVisible(true)));
  }, []);

  const closeLightbox = useCallback(() => {
    setLbVisible(false);
    setTimeout(() => setLightbox(false), 420);
  }, []);

  const lbNavigate = useCallback((dir) => {
    setLbIndex(i => (i + dir + UI_PIECES.length) % UI_PIECES.length);
  }, []);

  const clampPan = useCallback((x, y, z) => {
    const frame = frameRef.current;
    if (!frame) return { x, y };
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const maxX = (fw * (z - 1)) / 2;
    const maxY = (fh * (z - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const applyZoom = useCallback((newZoom, originX, originY) => {
    const frame = frameRef.current;
    if (!frame) return;
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    const rect = frame.getBoundingClientRect();
    // Zoom toward mouse position
    const ox = originX !== undefined ? originX - rect.left - rect.width / 2  : 0;
    const oy = originY !== undefined ? originY - rect.top  - rect.height / 2 : 0;
    setZoom(prev => {
      const ratio = clamped / prev;
      setPan(p => {
        const nx = (p.x - ox) * ratio + ox;
        const ny = (p.y - oy) * ratio + oy;
        return clampPan(nx, ny, clamped);
      });
      return clamped;
    });
  }, [clampPan]);

  // Scroll to zoom
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    applyZoom(zoom + delta, e.clientX, e.clientY);
  }, [zoom, applyZoom]);

  // Drag to pan
  const onMouseDown = useCallback((e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
  }, [zoom, pan]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    const nx = dragStart.current.px + dx;
    const ny = dragStart.current.py + dy;
    setPan(clampPan(nx, ny, zoom));
  }, [zoom, clampPan]);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  // Touch pinch-to-zoom
  const lastTouchDist = useRef(null);
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1 && zoom > 1) {
      isDragging.current = true;
      dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, px: pan.x, py: pan.y };
    }
  }, [zoom, pan]);

  const onTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / lastTouchDist.current;
      lastTouchDist.current = dist;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      applyZoom(zoom * ratio, cx, cy);
    } else if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - dragStart.current.mx;
      const dy = e.touches[0].clientY - dragStart.current.my;
      setPan(clampPan(dragStart.current.px + dx, dragStart.current.py + dy, zoom));
    }
  }, [zoom, applyZoom, clampPan]);

  const onTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastTouchDist.current = null;
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (lightbox) {
        if (e.key === "Escape") closeLightbox();
        // Only navigate when not zoomed in (zoomed: arrow keys pan instead)
        if (zoom <= 1) {
          if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") lbNavigate(-1);
          if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") lbNavigate(1);
        }
        if (e.key === "+" || e.key === "=") applyZoom(zoom + ZOOM_STEP);
        if (e.key === "-") applyZoom(zoom - ZOOM_STEP);
        if (e.key === "0") { setZoom(1); setPan({ x: 0, y: 0 }); }
        return;
      }
      if (e.key === "ArrowUp"   || e.key === "w" || e.key === "W") setActive(i => Math.max(0, i - 1));
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setActive(i => Math.min(UI_PIECES.length - 1, i + 1));
      if (e.key === "Enter" || e.key === "f" || e.key === "F") openLightbox(active);
      if (e.key === "Escape" || e.key === "Backspace") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, active, zoom, navigate, openLightbox, closeLightbox, lbNavigate, applyZoom]);

  const piece = UI_PIECES[lbIndex];
  const zoomPct = Math.round(zoom * 100);

  return (
    <div id="gallery-root">
      <video src={bgVideo} autoPlay loop muted playsInline className="bg-video" style={{pointerEvents:"none",zIndex:0}} />

      {/* ── Bar stack ── */}
      <nav className="bar-stack" aria-label="UI work gallery" style={{pointerEvents:"all",zIndex:50}}>
        {UI_PIECES.map((item, i) => (
          <div
            key={i}
            className={["bar-hit", active===i?"bar-hit--active":"", mounted?"bar-hit--mounted":""].join(" ")}
            style={{ transitionDelay:`${i*70}ms`, pointerEvents:"all", position:"relative", zIndex:50 }}
            onClick={() => openLightbox(i)}
            onMouseEnter={() => setActive(i)}
            role="button" tabIndex={0}
            aria-label={`${item.title} — ${item.tag}`}
            onKeyDown={(e) => { if (e.key==="Enter") openLightbox(i); }}
          >
            <div className="bar-visual">
              <span className="bar__red"  aria-hidden="true" />
              <span className="bar__fill" aria-hidden="true" />
              <span className="bar__thumb" aria-hidden="true">
                {item.src
                  ? <img src={item.src} alt="" className="bar__thumb-img" />
                  : <span className="bar__thumb-placeholder" />
                }
              </span>
              <span className="bar__content">
                <span className="bar__index">{String(i+1).padStart(2,"0")}</span>
                <span className="bar__text">
                  <span className="bar__title">{item.title}</span>
                  <span className="bar__tag">{item.tag}</span>
                </span>
                <span className="bar__hint" aria-hidden="true">{active===i?"CLICK / ↵":""}</span>
              </span>
            </div>
            <span className="bar__desc">{item.desc}</span>
          </div>
        ))}
      </nav>

      {/* ── Footer hints ── */}
      <footer className={`footer${mounted?" footer--mounted":""}`}>
        <div className="footer__row"><kbd>↑↓ / WS</kbd><span>SELECT</span></div>
        <div className="footer__row"><kbd>↵ / F</kbd><span>VIEW</span></div>
        <div className="footer__row"><kbd>ESC</kbd><span>BACK</span></div>
      </footer>

      {/* ── Back button ── */}
      <button
        className={`back-btn${mounted ? " back-btn--mounted" : ""}`}
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ◄ BACK
      </button>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className={`lightbox${lbVisible?" lightbox--open":""}`}
          onClick={(e) => { if (e.currentTarget===e.target) closeLightbox(); }}
          role="dialog" aria-modal="true" aria-label={`${piece.title} fullscreen`}
        >
          <div className={`lightbox__inner${lbVisible ? " lightbox__inner--open" : ""}`}>

            {/* Prev / Next */}
            <button className="lightbox__nav lightbox__nav--prev" onClick={() => lbNavigate(-1)} aria-label="Previous">◄</button>
            <button className="lightbox__nav lightbox__nav--next" onClick={() => lbNavigate(1)}  aria-label="Next">►</button>

            {/* ── Image frame ── */}
            <div
              className="lightbox__frame"
              ref={frameRef}
              key={lbIndex}
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{ cursor: zoom > 1 ? "grab" : "default" }}
            >
              {piece.src ? (
                <img
                  src={piece.src}
                  alt={piece.title}
                  className="lightbox__img"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: isDragging.current ? "none" : "transform 0.12s ease",
                    userSelect: "none",
                    WebkitUserDrag: "none",
                  }}
                  draggable={false}
                />
              ) : (
                <div className="lightbox__placeholder">
                  <span className="lightbox__placeholder-label">1920 × 1080</span>
                  <span className="lightbox__placeholder-title">{piece.title}</span>
                </div>
              )}
              {scanlines && <span className="lightbox__scanlines" aria-hidden="true" />}
            </div>

            {/* ── Toolbar ── */}
            <div className="lb-toolbar">
              {/* Left: info */}
              <div className="lb-toolbar__info">
                <span className="lb-toolbar__counter">{String(lbIndex+1).padStart(2,"0")} / {String(UI_PIECES.length).padStart(2,"0")}</span>
                <span className="lb-toolbar__title">{piece.title}</span>
                <span className="lb-toolbar__tag">{piece.tag}</span>
              </div>

              {/* Center: zoom controls */}
              <div className="lb-toolbar__zoom">
                <button className="lb-btn" onClick={() => applyZoom(zoom - ZOOM_STEP)} aria-label="Zoom out" title="Zoom out (-)">−</button>
                <span className="lb-zoom-pct">{zoomPct}%</span>
                <button className="lb-btn" onClick={() => applyZoom(zoom + ZOOM_STEP)} aria-label="Zoom in"  title="Zoom in (+)">+</button>
                <button className="lb-btn lb-btn--text" onClick={() => { setZoom(1); setPan({x:0,y:0}); }} aria-label="Reset zoom" title="Reset zoom (0)">1:1</button>
                <button className="lb-btn lb-btn--text" onClick={() => { setZoom(MIN_ZOOM); setPan({x:0,y:0}); }} aria-label="Fit to frame" title="Fit">FIT</button>
              </div>

              {/* Right: scanlines toggle + close */}
              <div className="lb-toolbar__right">
                <button
                  className={`lb-btn lb-btn--text lb-scanline-toggle${scanlines ? " lb-scanline-toggle--on" : ""}`}
                  onClick={() => setScanlines(s => !s)}
                  aria-label="Toggle scanlines"
                  title="Toggle TV effect"
                >
                  <span className="lb-scanline-icon" aria-hidden="true" />
                  CRT
                </button>
                <button className="lb-btn lb-btn--close" onClick={closeLightbox} aria-label="Close">✕</button>
              </div>
            </div>

            {/* Description */}
            <p className="lightbox__desc">{piece.desc}</p>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        #gallery-root {
          position: fixed; inset: 0;
          overflow: hidden; background: #000;
          isolation: isolate;
        }

        .bg-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
          pointer-events: none !important;
        }

        /* ── Bar stack ── */
        .bar-stack {
          position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          z-index: 50;
          display: flex; flex-direction: column;
          gap: 8px; padding: 0; list-style: none;
          pointer-events: all;
        }

        .bar-hit {
          position: relative;
          width: 340px;
          padding-bottom: 20px;
          cursor: pointer; outline: none;
          transform: translateX(-120%);
          transition: transform 0.55s cubic-bezier(0.22,1,0.36,1),
                      width 0.35s cubic-bezier(0.22,1,0.36,1);
          user-select: none;
          pointer-events: all;
        }
        .bar-hit--mounted  { transform: translateX(0); }
        .bar-hit:nth-child(1) { transition-delay: 0ms; }
        .bar-hit:nth-child(2) { transition-delay: 70ms; }
        .bar-hit:nth-child(3) { transition-delay: 140ms; }
        .bar-hit:nth-child(4) { transition-delay: 210ms; }
        .bar-hit:nth-child(5) { transition-delay: 280ms; }
        .bar-hit--active { width: 390px; }

        .bar-visual {
          position: relative; height: 58px;
          background: rgba(8,8,10,0.88);
          clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
          transition: height 0.3s cubic-bezier(0.22,1,0.36,1);
          pointer-events: none;
        }
        .bar-hit--active .bar-visual { height: 80px; }

        .bar__red {
          position: absolute; inset: 0;
          background: #c4001a;
          clip-path: polygon(68% 0, 100% 0, 100% 100%, calc(68% - 12px) 100%);
          transform: translateY(-5px); opacity: 0;
          transition: opacity 0.2s ease; z-index: 0; pointer-events: none;
        }
        .bar-hit--active .bar__red { opacity: 1; }

        .bar__fill {
          position: absolute; inset: 0; background: #fff;
          clip-path: polygon(calc(100% - 4px) 0, 100% 0, calc(100% - 14px) 100%, calc(100% - 18px) 100%);
          transition: clip-path 0.35s cubic-bezier(0.22,1,0.36,1);
          z-index: 0; pointer-events: none;
        }
        .bar-hit--active .bar__fill {
          clip-path: polygon(30% 0, 100% 0, calc(100% - 12px) 100%, calc(30% + 120px) 100%);
        }

        .bar__thumb {
          position: absolute; top: 0; right: 0;
          width: 42%; height: 100%; z-index: 1;
          overflow: hidden;
          clip-path: polygon(18px 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
          opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
        }
        .bar-hit--active .bar__thumb { opacity: 0.6; }
        .bar__thumb-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
        .bar__thumb-placeholder { display: block; width: 100%; height: 100%; background: rgba(255,255,255,0.04); }

        .bar__content {
          position: relative; z-index: 2; height: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 0 12px 0 16px; pointer-events: none;
        }
        .bar__index {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          color: rgba(255,255,255,0.18); line-height: 1; flex-shrink: 0;
          letter-spacing: 1px; transition: color 0.2s ease;
        }
        .bar-hit--active .bar__index { color: rgba(0,0,0,0.3); }

        .bar__text { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
        .bar__title {
          font-family: 'Bebas Neue', sans-serif; font-size: 22px;
          letter-spacing: 3px; color: rgba(255,255,255,0.9); line-height: 1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.2s ease;
        }
        .bar-hit--active .bar__title { color: #0a0a0a; }
        .bar__tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 10px;
          font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(255,255,255,0.3); transition: color 0.2s ease;
        }
        .bar-hit--active .bar__tag { color: rgba(0,0,0,0.4); }
        .bar__hint {
          font-family: 'Bebas Neue', sans-serif; font-size: 11px;
          letter-spacing: 2px; color: #c4001a;
          flex-shrink: 0; padding-right: 6px; min-width: 60px; text-align: right;
        }
        .bar__desc {
          display: block; position: absolute;
          bottom: 2px; left: 16px; right: 16px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 11px;
          font-weight: 300; letter-spacing: 0.5px; color: rgba(255,255,255,0.4);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: 0; transform: translateY(-2px);
          transition: opacity 0.2s ease 0.08s, transform 0.2s ease 0.08s;
          pointer-events: none;
        }
        .bar-hit--active .bar__desc { opacity: 1; transform: translateY(0); }

        /* ── Footer ── */
        .footer {
          position: fixed; bottom: 20px; right: 28px;
          display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
          font-family: 'Bebas Neue', sans-serif; z-index: 10;
          opacity: 0; transition: opacity 0.4s ease 0.8s; pointer-events: none;
        }
        .footer--mounted { opacity: 1; }
        .footer__row { display: flex; align-items: center; gap: 8px; font-size: 12px; letter-spacing: 2px; color: rgba(255,255,255,0.2); }
        .footer__row kbd {
          font-family: 'Bebas Neue', sans-serif;
          border: 1px solid rgba(255,255,255,0.12); border-radius: 3px;
          padding: 1px 6px; font-size: 10px; background: none; color: inherit;
        }

        /* ── Back button ── */
        .back-btn {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 50;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 12px;
          letter-spacing: 2.5px;
          color: rgba(196,0,26,0.7);
          background: rgba(196,0,26,0.06);
          border: 1px solid rgba(196,0,26,0.25);
          border-radius: 3px;
          padding: 5px 12px;
          cursor: pointer;
          pointer-events: all;
          opacity: 0;
          transform: translateY(4px);
          transition:
            opacity 0.4s ease 0.9s,
            transform 0.4s ease 0.9s,
            background 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease;
        }
        .back-btn--mounted {
          opacity: 1;
          transform: translateY(0);
        }
        .back-btn:hover {
          background: rgba(196,0,26,0.18);
          color: #ff2233;
          border-color: rgba(196,0,26,0.55);
        }
        .back-btn:active {
          background: rgba(196,0,26,0.28);
        }

        /* ── Lightbox ── */
        .lightbox {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.38s cubic-bezier(0.4,0,0.2,1);
          cursor: default;
        }
        .lightbox--open { background: rgba(0,0,0,0.92); }

        /* Inner panel — slides up on open, slides down on close */
        .lightbox__inner {
          position: relative;
          width: min(90vw, 1200px);
          display: flex; flex-direction: column; gap: 0;
          opacity: 0;
          transform: translateY(28px) scale(0.97);
          transition:
            opacity 0.35s cubic-bezier(0.22,1,0.36,1),
            transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .lightbox__inner--open {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        /* Exit: faster, slides down slightly */
        .lightbox:not(.lightbox--open) .lightbox__inner {
          opacity: 0;
          transform: translateY(14px) scale(0.98);
          transition:
            opacity 0.28s cubic-bezier(0.4,0,1,1),
            transform 0.28s cubic-bezier(0.4,0,1,1);
        }

        .lightbox__nav {
          position: absolute; top: 50%; transform: translateY(-60%);
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.6);
          font-family: 'Bebas Neue', sans-serif; font-size: 18px;
          width: 38px; height: 38px; border-radius: 4px;
          cursor: pointer; transition: background 0.15s ease, color 0.15s ease; z-index: 10;
        }
        .lightbox__nav:hover { background: rgba(196,0,26,0.35); color: #fff; }
        .lightbox__nav--prev { right: calc(100% + 14px); }
        .lightbox__nav--next { left:  calc(100% + 14px); }

        /* Image frame */
        @keyframes lb-frame-in {
          0%   { opacity: 0; transform: scale(0.975); }
          100% { opacity: 1; transform: scale(1); }
        }
        .lightbox__frame {
          position: relative; width: 100%; aspect-ratio: 16/9;
          background: #060608;
          border: 1px solid rgba(255,255,255,0.08);
          border-bottom: none;
          overflow: hidden;
          animation: lb-frame-in 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lightbox__img {
          width: 100%; height: 100%;
          object-fit: contain; display: block;
          will-change: transform;
        }
        .lightbox__placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
        }
        .lightbox__placeholder-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 3px; color: rgba(255,255,255,0.15);
        }
        .lightbox__placeholder-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 32px;
          letter-spacing: 6px; color: rgba(255,255,255,0.25);
        }
        .lightbox__scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px
          );
          pointer-events: none; z-index: 3;
        }

        @keyframes lb-toolbar-in {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        /* ── Toolbar ── */
        .lb-toolbar {
          display: flex; align-items: center;
          background: rgba(6,6,8,0.97);
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 0 12px;
          height: 42px; gap: 12px;
          animation: lb-toolbar-in 0.32s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }

        .lb-toolbar__info {
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0; min-width: 0;
        }
        .lb-toolbar__counter {
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 2px; color: rgba(255,255,255,0.2);
          flex-shrink: 0;
        }
        .lb-toolbar__title {
          font-family: 'Bebas Neue', sans-serif; font-size: 16px;
          letter-spacing: 3px; color: rgba(255,255,255,0.75);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .lb-toolbar__tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: #c4001a; border: 1px solid rgba(196,0,26,0.35);
          padding: 1px 5px; border-radius: 2px; flex-shrink: 0;
        }

        .lb-toolbar__zoom {
          flex: 1; display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .lb-zoom-pct {
          font-family: 'Bebas Neue', sans-serif; font-size: 14px;
          letter-spacing: 1px; color: rgba(255,255,255,0.5);
          min-width: 38px; text-align: center;
        }

        .lb-toolbar__right {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }

        /* Shared button style */
        .lb-btn {
          height: 28px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          border-radius: 3px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 1px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          width: 28px;
          transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
          flex-shrink: 0;
        }
        .lb-btn:hover { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.22); }
        .lb-btn:active { background: rgba(196,0,26,0.3); border-color: rgba(196,0,26,0.5); color: #fff; }

        .lb-btn--text {
          width: auto; padding: 0 8px;
          font-size: 11px; letter-spacing: 2px;
        }
        .lb-btn--close {
          font-size: 13px; margin-left: 4px;
        }
        .lb-btn--close:hover { background: rgba(196,0,26,0.35); border-color: rgba(196,0,26,0.5); color: #fff; }

        /* CRT toggle — lit up when on */
        .lb-scanline-toggle {
          display: flex; align-items: center; gap: 5px;
          color: rgba(255,255,255,0.3); border-color: rgba(255,255,255,0.08);
        }
        .lb-scanline-toggle--on {
          color: #4af; border-color: rgba(68,170,255,0.4);
          background: rgba(68,170,255,0.08);
        }
        .lb-scanline-toggle--on:hover { background: rgba(68,170,255,0.16); color: #6cf; }

        /* tiny CRT icon — 3 horizontal lines */
        .lb-scanline-icon {
          display: inline-flex; flex-direction: column;
          gap: 2px; width: 12px; flex-shrink: 0;
        }
        .lb-scanline-icon::before,
        .lb-scanline-icon::after {
          content: ""; display: block;
          height: 1.5px; width: 100%; border-radius: 1px;
          background: currentColor; opacity: 0.9;
        }
        .lb-scanline-icon::after { width: 75%; }

        /* Description below toolbar */
        .lightbox__desc {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 300; letter-spacing: 0.4px;
          color: rgba(255,255,255,0.35); line-height: 1.5;
          padding: 8px 12px 0;
          animation: lb-toolbar-in 0.32s cubic-bezier(0.22,1,0.36,1) 0.16s both;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .bar-hit        { width: 280px; }
          .bar-hit--active { width: 308px; }
          .bar-hit--active .bar-visual { height: 72px; }
          .footer { display: none; }
          .lightbox__nav--prev { right: auto; left: 4px;  top: auto; bottom: calc(100% + 54px); transform: none; }
          .lightbox__nav--next { left:  auto; right: 4px; top: auto; bottom: calc(100% + 54px); transform: none; }
          .lightbox__inner { width: 98vw; }
          .lb-toolbar { padding: 0 8px; gap: 8px; }
          .lb-toolbar__tag { display: none; }
        }
      `}</style>
    </div>
  );
}