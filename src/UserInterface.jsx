import { useState, useEffect, useCallback } from "react";
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

export default function UIGallery() {
  const [mounted, setMounted]       = useState(false);
  const [active, setActive]         = useState(0);
  const [lightbox, setLightbox]     = useState(false);
  const [lbIndex, setLbIndex]       = useState(0);
  const [lbVisible, setLbVisible]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const openLightbox = useCallback((i) => {
    setLbIndex(i);
    setLightbox(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setLbVisible(true)));
  }, []);

  const closeLightbox = useCallback(() => {
    setLbVisible(false);
    setTimeout(() => setLightbox(false), 260);
  }, []);

  const lbNavigate = useCallback((dir) => {
    setLbIndex(i => (i + dir + UI_PIECES.length) % UI_PIECES.length);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      // Don't fire if user is typing somewhere
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (lightbox) {
        if (e.key === "Escape")                                        closeLightbox();
        if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") lbNavigate(-1);
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") lbNavigate(1);
        return;
      }
      // Gallery navigation — WASD + arrows
      if (e.key === "ArrowUp"   || e.key === "w" || e.key === "W")
        setActive(i => Math.max(0, i - 1));
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
        setActive(i => Math.min(UI_PIECES.length - 1, i + 1));
      // Open: Enter or F (WASD-friendly confirm, avoids d/a conflict)
      if (e.key === "Enter" || e.key === "f" || e.key === "F")
        openLightbox(active);
      if (e.key === "Escape" || e.key === "Backspace")
        navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, active, navigate, openLightbox, closeLightbox, lbNavigate]);

  const piece = UI_PIECES[lbIndex];

  return (
    <div id="gallery-root">
      <video src={bgVideo} autoPlay loop muted playsInline className="bg-video" style={{pointerEvents: "none", zIndex: 0}} />

      {/* ── Bar stack ── */}
      <nav className="bar-stack" aria-label="UI work gallery" style={{pointerEvents: "all", zIndex: 50}}>
        {UI_PIECES.map((item, i) => (
          // Wrapper div handles all pointer events — no clip-path here so hit area is full rectangle
          <div
            key={i}
            className={[
              "bar-hit",
              active === i  ? "bar-hit--active"  : "",
              mounted       ? "bar-hit--mounted"  : "",
            ].join(" ")}
            style={{ transitionDelay: `${i * 70}ms`, pointerEvents: 'all', position: 'relative', zIndex: 50 }}
            onClick={() => openLightbox(i)}
            onMouseEnter={() => setActive(i)}
            role="button"
            tabIndex={0}
            aria-label={`${item.title} — ${item.tag}`}
            onKeyDown={(e) => { if (e.key === "Enter") openLightbox(i); }}
          >
            {/* Visual bar — clip-path is only visual, pointer events stay on wrapper */}
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
                <span className="bar__index">{String(i + 1).padStart(2, "0")}</span>
                <span className="bar__text">
                  <span className="bar__title">{item.title}</span>
                  <span className="bar__tag">{item.tag}</span>
                </span>
                <span className="bar__hint" aria-hidden="true">
                  {active === i ? "CLICK / ↵" : ""}
                </span>
              </span>
            </div>

            {/* Description sits outside the clipped bar so it's always readable */}
            <span className="bar__desc">{item.desc}</span>
          </div>
        ))}
      </nav>

      {/* ── Footer hints ── */}
      <footer className={`footer${mounted ? " footer--mounted" : ""}`}>
        <div className="footer__row"><kbd>↑↓ / WS</kbd><span>SELECT</span></div>
        <div className="footer__row"><kbd>↵ / F</kbd><span>VIEW</span></div>
        <div className="footer__row"><kbd>ESC</kbd><span>BACK</span></div>
      </footer>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className={`lightbox${lbVisible ? " lightbox--open" : ""}`}
          onClick={(e) => { if (e.currentTarget === e.target) closeLightbox(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`${piece.title} fullscreen`}
        >
          <div className="lightbox__inner">
            <button className="lightbox__nav lightbox__nav--prev" onClick={() => lbNavigate(-1)} aria-label="Previous">◄</button>
            <button className="lightbox__nav lightbox__nav--next" onClick={() => lbNavigate(1)}  aria-label="Next">►</button>

            <div className="lightbox__frame">
              {piece.src
                ? <img src={piece.src} alt={piece.title} className="lightbox__img" />
                : (
                  <div className="lightbox__placeholder">
                    <span className="lightbox__placeholder-label">1920 × 1080</span>
                    <span className="lightbox__placeholder-title">{piece.title}</span>
                  </div>
                )
              }
              <span className="lightbox__scanlines" aria-hidden="true" />
            </div>

            <div className="lightbox__info">
              <div className="lightbox__info-left">
                <span className="lightbox__counter">{String(lbIndex + 1).padStart(2,"0")} / {String(UI_PIECES.length).padStart(2,"0")}</span>
                <span className="lightbox__title">{piece.title}</span>
                <span className="lightbox__tag">{piece.tag}</span>
              </div>
              <p className="lightbox__desc">{piece.desc}</p>
              <button className="lightbox__close" onClick={closeLightbox} aria-label="Close">✕</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        #gallery-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: #000;
          isolation: isolate;
        }

        .bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          pointer-events: none !important;
        }

        /* ── Bar stack ── */
        .bar-stack {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0;
          list-style: none;
        }

        /* ── Hit wrapper — full rectangle, no clip-path ── */
        .bar-hit {
          position: relative;
          width: 340px;
          /* extra padding-bottom to give room for the desc line */
          padding-bottom: 20px;
          cursor: pointer;
          outline: none;
          /* slide in animation */
          transform: translateX(-120%);
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                      width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          user-select: none;
          pointer-events: all;
        }
        .bar-hit--mounted  { transform: translateX(0); }
        .bar-hit:nth-child(1) { transition-delay: 0ms; }
        .bar-hit:nth-child(2) { transition-delay: 70ms; }
        .bar-hit:nth-child(3) { transition-delay: 140ms; }
        .bar-hit:nth-child(4) { transition-delay: 210ms; }
        .bar-hit:nth-child(5) { transition-delay: 280ms; }
        .bar-hit--active   { width: 390px; }

        /* ── Visual bar — clip-path lives here, not on the hit target ── */
        .bar-visual {
          position: relative;
          height: 58px;
          background: rgba(8, 8, 10, 0.88);
          clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
          overflow: visible;
          transition: height 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none; /* hit wrapper handles clicks */
        }
        .bar-hit--active .bar-visual { height: 80px; }

        /* red underlay */
        .bar__red {
          position: absolute;
          inset: 0;
          background: #c4001a;
          clip-path: polygon(68% 0, 100% 0, 100% 100%, calc(68% - 12px) 100%);
          transform: translateY(-5px);
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 0;
          pointer-events: none;
        }
        .bar-hit--active .bar__red { opacity: 1; }

        /* white fill sweep */
        .bar__fill {
          position: absolute;
          inset: 0;
          background: #fff;
          clip-path: polygon(calc(100% - 4px) 0, 100% 0, calc(100% - 14px) 100%, calc(100% - 18px) 100%);
          transition: clip-path 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 0;
          pointer-events: none;
        }
        .bar-hit--active .bar__fill {
          clip-path: polygon(30% 0, 100% 0, calc(100% - 12px) 100%, calc(30% + 120px) 100%);
        }

        /* thumbnail */
        .bar__thumb {
          position: absolute;
          top: 0; right: 0;
          width: 42%;
          height: 100%;
          z-index: 1;
          overflow: hidden;
          clip-path: polygon(18px 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .bar-hit--active .bar__thumb { opacity: 0.6; }
        .bar__thumb-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
        }
        .bar__thumb-placeholder {
          display: block; width: 100%; height: 100%;
          background: rgba(255,255,255,0.04);
        }

        /* bar content */
        .bar__content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px 0 16px;
          pointer-events: none;
        }

        .bar__index {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          color: rgba(255,255,255,0.18);
          line-height: 1;
          flex-shrink: 0;
          letter-spacing: 1px;
          transition: color 0.2s ease;
        }
        .bar-hit--active .bar__index { color: rgba(0,0,0,0.3); }

        .bar__text {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
          min-width: 0;
        }
        .bar__title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.9);
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s ease;
        }
        .bar-hit--active .bar__title { color: #0a0a0a; }

        .bar__tag {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          transition: color 0.2s ease;
        }
        .bar-hit--active .bar__tag { color: rgba(0,0,0,0.4); }

        .bar__hint {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          color: #c4001a;
          flex-shrink: 0;
          padding-right: 6px;
          min-width: 60px;
          text-align: right;
        }

        /* desc sits below the clipped bar — no clip-path restriction */
        .bar__desc {
          display: block;
          position: absolute;
          bottom: 2px;
          left: 16px;
          right: 16px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: 0;
          transform: translateY(-2px);
          transition: opacity 0.2s ease 0.08s, transform 0.2s ease 0.08s;
          pointer-events: none;
        }
        .bar-hit--active .bar__desc {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Footer ── */
        .footer {
          position: fixed;
          bottom: 20px;
          right: 28px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          font-family: 'Bebas Neue', sans-serif;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.4s ease 0.8s;
          pointer-events: none;
        }
        .footer--mounted { opacity: 1; }
        .footer__row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
        }
        .footer__row kbd {
          font-family: 'Bebas Neue', sans-serif;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 3px;
          padding: 1px 6px;
          font-size: 10px;
          background: none;
          color: inherit;
        }

        /* ── Lightbox ── */
        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.26s ease;
          cursor: default;
        }
        .lightbox--open { background: rgba(0,0,0,0.9); }

        .lightbox__inner {
          position: relative;
          width: min(90vw, 1100px);
          display: flex;
          flex-direction: column;
          gap: 14px;
          cursor: default;
        }

        .lightbox__nav {
          position: absolute;
          top: 50%;
          transform: translateY(-60%);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.6);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          width: 38px;
          height: 38px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          z-index: 10;
        }
        .lightbox__nav:hover { background: rgba(196,0,26,0.35); color: #fff; }
        .lightbox__nav--prev { right: calc(100% + 14px); }
        .lightbox__nav--next { left:  calc(100% + 14px); }

        .lightbox__frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #0a0a0c;
          border: 1px solid rgba(255,255,255,0.1);
          overflow: hidden;
        }
        .lightbox__img {
          width: 100%; height: 100%;
          object-fit: contain;
          display: block;
        }
        .lightbox__placeholder {
          width: 100%; height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .lightbox__placeholder-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.15);
        }
        .lightbox__placeholder-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          letter-spacing: 6px;
          color: rgba(255,255,255,0.25);
        }
        .lightbox__scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px
          );
          pointer-events: none;
          z-index: 2;
        }

        .lightbox__info {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        .lightbox__info-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .lightbox__counter {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
        }
        .lightbox__title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 4px;
          color: #fff;
        }
        .lightbox__tag {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #c4001a;
          border: 1px solid rgba(196,0,26,0.4);
          padding: 2px 7px;
          border-radius: 2px;
        }
        .lightbox__desc {
          flex: 1;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.4px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
        }
        .lightbox__close {
          flex-shrink: 0;
          width: 30px; height: 30px;
          border-radius: 3px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-family: 'Barlow Condensed', sans-serif;
        }
        .lightbox__close:hover { background: rgba(196,0,26,0.35); color: #fff; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .bar-hit        { width: 280px; }
          .bar-hit--active { width: 308px; }
          .bar-hit--active .bar-visual { height: 72px; }
          .footer { display: none; }
          .lightbox__nav--prev { right: auto; left: 4px;  top: auto; bottom: -50px; transform: none; }
          .lightbox__nav--next { left:  auto; right: 4px; top: auto; bottom: -50px; transform: none; }
          .lightbox__info { flex-wrap: wrap; }
          .lightbox__inner { width: 96vw; }
        }
      `}</style>
    </div>
  );
}