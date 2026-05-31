import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import soon from "./assets/animation/soon.mp4";
import d4c  from "./assets/animation/d4credesignkahny.mp4";

const SFX_PIECES = [
  { src: d4c,  title: "D4C Cutscene", tag: "CUTSCENE", desc: "Custom redesigned D4C SFX" },
  { src: soon, title: "Explosion SFX", tag: "EXPLOSION", desc: "Soon" },
  { src: soon, title: "Magic SFX",     tag: "MAGIC",     desc: "Soon" },
  { src: soon, title: "Summon SFX",    tag: "CHARACTER", desc: "Soon" },
  { src: soon, title: "Other",         tag: "ATTACK",    desc: "Soon" },
  { src: soon, title: "Other",         tag: "ATTACK",    desc: "Soon" },
  // ── Add more entries here ──
];

export default function Sfx({ src: bgSrc }) {
  const navigate    = useNavigate();
  const [active, setActive]       = useState(0);
  const [mounted, setMounted]     = useState(false);
  const [lightbox, setLightbox]   = useState(false);
  const [lbVisible, setLbVisible] = useState(false);
  const previewRef  = useRef(null);
  const lightboxRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.currentTime = 0;
      previewRef.current.play().catch(() => {});
    }
  }, [active]);

  const openLightbox = useCallback(() => {
    setLightbox(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setLbVisible(true)));
  }, []);

  const closeLightbox = useCallback(() => {
    setLbVisible(false);
    setTimeout(() => setLightbox(false), 380);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (lightbox) {
        if (e.key === "Escape") closeLightbox();
        return;
      }
      if (e.key === "ArrowUp"   || e.key === "w" || e.key === "W") setActive(i => Math.max(0, i - 1));
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setActive(i => Math.min(SFX_PIECES.length - 1, i + 1));
      if (e.key === "Enter" || e.key === "f" || e.key === "F")     openLightbox();
      if (e.key === "Escape" || e.key === "Backspace" || e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, navigate, openLightbox, closeLightbox]);

  const piece = SFX_PIECES[active];

  return (
    <div id="menu-screen">
      <video src={bgSrc} autoPlay loop muted playsInline style={{ pointerEvents: "none" }} />

      {/* Entry reveal — amber flash */}
      <div className="sfx-entry-mask" aria-hidden="true">
        <video src={bgSrc} autoPlay loop muted playsInline className="sfx-entry-video" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Entry wipe — amber/gold ── */
        .sfx-entry-mask {
          position: absolute; inset: 0; z-index: 9;
          overflow: hidden; background: #d4920a;
          clip-path: circle(0 at 50% 50%);
          animation: sfx-entry-reveal 1.1s cubic-bezier(0.16,1,0.3,1) forwards;
          pointer-events: none;
        }
        .sfx-entry-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
        }
        @keyframes sfx-entry-reveal {
          from { clip-path: circle(0 at 50% 50%); }
          to   { clip-path: circle(150vmax at 50% 50%); }
        }

        /* ── Root overlay ── */
        .sfx-overlay {
          position: absolute; inset: 0; z-index: 10;
          display: flex; align-items: stretch;
          pointer-events: none;
        }

        /* ── Left panel ── */
        .sfx-left {
          position: relative;
          width: clamp(280px, 36vw, 480px);
          display: flex; flex-direction: column;
          justify-content: center;
          gap: 6px;
          pointer-events: all;
          flex-shrink: 0;
        }

        /* ── Bar hit wrapper ── */
        .sfx-bar-hit {
          position: relative;
          width: 100%;
          padding-bottom: 18px;
          cursor: pointer; outline: none;
          transform: translateX(-110%);
          transition: transform 0.52s cubic-bezier(0.22,1,0.36,1),
                      width 0.32s cubic-bezier(0.22,1,0.36,1);
          user-select: none;
          pointer-events: all;
        }
        .sfx-bar-hit--mounted  { transform: translateX(0); }
        .sfx-bar-hit:nth-child(1) { transition-delay: 0ms; }
        .sfx-bar-hit:nth-child(2) { transition-delay: 60ms; }
        .sfx-bar-hit:nth-child(3) { transition-delay: 120ms; }
        .sfx-bar-hit:nth-child(4) { transition-delay: 180ms; }
        .sfx-bar-hit:nth-child(5) { transition-delay: 240ms; }
        .sfx-bar-hit:nth-child(6) { transition-delay: 300ms; }
        .sfx-bar-hit:nth-child(7) { transition-delay: 360ms; }
        .sfx-bar-hit--active { width: 108%; }

        .sfx-bar-visual {
          position: relative; height: 54px;
          background: rgba(28, 18, 2, 0.93);
          clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
          pointer-events: none;
          border-left: 3px solid rgba(212,146,10,0.0);
          transition: height 0.28s cubic-bezier(0.22,1,0.36,1),
                      border-color 0.2s ease,
                      background 0.2s ease;
        }
        .sfx-bar-hit--active .sfx-bar-visual {
          height: 74px;
          border-left-color: #d4920a;
          background: rgba(42, 26, 2, 0.97);
        }

        /* Gold accent underlay */
        .sfx-bar-accent {
          position: absolute; inset: 0;
          background: #d4920a;
          clip-path: polygon(65% 0, 100% 0, 100% 100%, calc(65% - 12px) 100%);
          transform: translateY(-5px); opacity: 0;
          transition: opacity 0.2s ease; z-index: 0; pointer-events: none;
        }
        .sfx-bar-hit--active .sfx-bar-accent { opacity: 1; }

        /* Warm fill sweep */
        .sfx-bar-fill {
          position: absolute; inset: 0; background: #fde68a;
          clip-path: polygon(calc(100% - 4px) 0, 100% 0, calc(100% - 14px) 100%, calc(100% - 18px) 100%);
          transition: clip-path 0.32s cubic-bezier(0.22,1,0.36,1);
          z-index: 0; pointer-events: none;
        }
        .sfx-bar-hit--active .sfx-bar-fill {
          clip-path: polygon(28% 0, 100% 0, calc(100% - 12px) 100%, calc(28% + 110px) 100%);
        }

        .sfx-bar-content {
          position: relative; z-index: 2; height: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 0 14px; pointer-events: none;
        }
        .sfx-bar-index {
          font-family: 'Bebas Neue', sans-serif; font-size: 26px;
          color: rgba(212,146,10,0.35); line-height: 1; flex-shrink: 0;
          letter-spacing: 1px; transition: color 0.2s ease;
        }
        .sfx-bar-hit--active .sfx-bar-index { color: rgba(0,0,0,0.3); }

        .sfx-bar-text { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
        .sfx-bar-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 21px;
          letter-spacing: 3px; color: rgba(253,200,80,0.9); line-height: 1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.2s ease;
        }
        .sfx-bar-hit--active .sfx-bar-title { color: #1a0f00; }

        .sfx-bar-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(212,146,10,0.45); transition: color 0.2s ease;
        }
        .sfx-bar-hit--active .sfx-bar-tag { color: rgba(0,0,0,0.45); }

        .sfx-bar-hint {
          font-family: 'Bebas Neue', sans-serif; font-size: 10px;
          letter-spacing: 2px; color: #d4920a;
          flex-shrink: 0; padding-right: 4px; min-width: 56px; text-align: right;
        }

        .sfx-bar-desc {
          display: block; position: absolute;
          bottom: 2px; left: 14px; right: 14px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 11px;
          font-weight: 300; letter-spacing: 0.5px; color: rgba(220,170,60,0.5);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: 0; transform: translateY(-2px);
          transition: opacity 0.18s ease 0.06s, transform 0.18s ease 0.06s;
          pointer-events: none;
        }
        .sfx-bar-hit--active .sfx-bar-desc { opacity: 1; transform: translateY(0); }

        /* ── Right panel — video preview ── */
        .sfx-right {
          flex: 1;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          pointer-events: all;
          overflow: hidden;
        }

        @keyframes sfx-preview-in {
          0%   { opacity: 0; transform: scale(0.96) translateX(16px); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }

        .sfx-preview-shell {
          position: relative;
          width: min(88%, 680px);
          aspect-ratio: 16/9;
          cursor: pointer;
          animation: sfx-preview-in 0.38s cubic-bezier(0.22,1,0.36,1) both;
        }
        .sfx-preview-shell::before {
          content: "";
          position: absolute; inset: -2px;
          background: linear-gradient(135deg, #d4920a 0%, rgba(212,146,10,0.3) 50%, transparent 100%);
          z-index: 0; border-radius: 2px;
        }

        .sfx-preview-frame {
          position: relative; width: 100%; height: 100%;
          background: #100800; overflow: hidden; z-index: 1;
        }
        .sfx-preview-video {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .sfx-preview-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
          background: rgba(40,24,2,0.6);
        }
        .sfx-preview-placeholder-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 3px; color: rgba(212,146,10,0.25);
        }
        .sfx-preview-placeholder-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          letter-spacing: 5px; color: rgba(212,146,10,0.35);
        }

        /* Hover overlay */
        .sfx-preview-overlay {
          position: absolute; inset: 0; z-index: 3;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease;
        }
        .sfx-preview-shell:hover .sfx-preview-overlay { background: rgba(0,0,0,0.45); }

        .sfx-play-btn {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(212,146,10,0.9);
          border: 2px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #fff;
          opacity: 0; transform: scale(0.8);
          transition: opacity 0.18s ease, transform 0.18s ease;
          pointer-events: none;
        }
        .sfx-preview-shell:hover .sfx-play-btn { opacity: 1; transform: scale(1); }

        .sfx-preview-info {
          position: absolute; bottom: -48px; left: 0; right: 0;
          display: flex; align-items: center; gap: 12px; padding: 0 2px;
        }
        .sfx-preview-info-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 18px;
          letter-spacing: 3px; color: rgba(253,220,100,0.85);
        }
        .sfx-preview-info-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: #e8a812; border: 1px solid rgba(212,146,10,0.45);
          padding: 2px 6px; border-radius: 2px;
        }
        .sfx-preview-info-desc {
          flex: 1;
          font-family: 'Barlow Condensed', sans-serif; font-size: 12px;
          font-weight: 300; color: rgba(220,180,80,0.3);
          letter-spacing: 0.4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Lightbox ── */
        .sfx-lightbox {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.36s cubic-bezier(0.4,0,0.2,1);
          cursor: default;
        }
        .sfx-lightbox--open { background: rgba(0,0,0,0.94); }

        .sfx-lightbox__inner {
          position: relative;
          width: min(94vw, 1200px);
          display: flex; flex-direction: column; gap: 0;
          opacity: 0; transform: translateY(24px) scale(0.97);
          transition: opacity 0.34s cubic-bezier(0.22,1,0.36,1),
                      transform 0.34s cubic-bezier(0.22,1,0.36,1);
        }
        .sfx-lightbox--open .sfx-lightbox__inner {
          opacity: 1; transform: translateY(0) scale(1);
        }
        .sfx-lightbox:not(.sfx-lightbox--open) .sfx-lightbox__inner {
          opacity: 0; transform: translateY(12px) scale(0.98);
          transition: opacity 0.26s cubic-bezier(0.4,0,1,1),
                      transform 0.26s cubic-bezier(0.4,0,1,1);
        }

        .sfx-lightbox__frame {
          position: relative; width: 100%; aspect-ratio: 16/9;
          background: #0a0500;
          border: 1px solid rgba(212,146,10,0.22);
          border-bottom: none; overflow: hidden;
        }
        .sfx-lightbox__video {
          width: 100%; height: 100%; display: block; object-fit: contain;
        }
        .sfx-lightbox__placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
        }
        .sfx-lightbox__placeholder-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 3px; color: rgba(212,146,10,0.2);
        }
        .sfx-lightbox__placeholder-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 32px;
          letter-spacing: 6px; color: rgba(212,146,10,0.28);
        }

        @keyframes sfx-toolbar-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sfx-lb-toolbar {
          display: flex; align-items: center;
          background: rgba(8,5,0,0.97);
          border: 1px solid rgba(212,146,10,0.2);
          padding: 0 14px; height: 42px; gap: 14px;
          animation: sfx-toolbar-in 0.3s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        .sfx-lb-info {
          display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;
        }
        .sfx-lb-counter {
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 2px; color: rgba(212,146,10,0.3); flex-shrink: 0;
        }
        .sfx-lb-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 16px;
          letter-spacing: 3px; color: rgba(253,220,130,0.85);
        }
        .sfx-lb-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: #e8a812; border: 1px solid rgba(212,146,10,0.35);
          padding: 1px 5px; border-radius: 2px; flex-shrink: 0;
        }
        .sfx-lb-desc {
          flex: 1; font-family: 'Barlow Condensed', sans-serif; font-size: 12px;
          font-weight: 300; color: rgba(220,180,80,0.3); letter-spacing: 0.4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sfx-lb-btn {
          height: 26px; min-width: 26px; padding: 0 8px;
          background: rgba(212,146,10,0.06); border: 1px solid rgba(212,146,10,0.22);
          color: rgba(230,170,50,0.7); cursor: pointer; border-radius: 3px;
          font-family: 'Bebas Neue', sans-serif; font-size: 12px; letter-spacing: 2px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
        }
        .sfx-lb-btn:hover { background: rgba(212,146,10,0.22); color: #fde68a; border-color: rgba(212,146,10,0.65); }
        .sfx-lb-btn:active { background: rgba(212,146,10,0.35); }
        .sfx-lb-btn--close { margin-left: 4px; }
        .sfx-lb-btn--close:hover { background: rgba(212,146,10,0.38); }

        /* ── Footer ── */
        .sfx-footer {
          position: fixed; bottom: 20px; right: 28px;
          display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
          font-family: 'Bebas Neue', sans-serif; z-index: 10;
          opacity: 0; transition: opacity 0.4s ease 1s; pointer-events: none;
        }
        .sfx-footer--mounted { opacity: 1; }
        .sfx-footer__row {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; letter-spacing: 2px; color: rgba(212,146,10,0.22);
        }
        .sfx-footer__row kbd {
          font-family: 'Bebas Neue', sans-serif;
          border: 1px solid rgba(212,146,10,0.18); border-radius: 3px;
          padding: 1px 6px; font-size: 10px; background: none; color: inherit;
        }

        /* ── Back button ── */
        .sfx-back-btn {
          position: fixed; bottom: 20px; left: 20px; z-index: 50;
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 2.5px; color: rgba(212,146,10,0.8);
          background: rgba(212,146,10,0.06);
          border: 1px solid rgba(212,146,10,0.28);
          border-radius: 3px; padding: 5px 12px;
          cursor: pointer; pointer-events: all;
          opacity: 0; transform: translateY(4px);
          transition: opacity 0.4s ease 1s, transform 0.4s ease 1s,
                      background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .sfx-back-btn--mounted { opacity: 1; transform: translateY(0); }
        .sfx-back-btn:hover { background: rgba(212,146,10,0.18); color: #fde68a; border-color: rgba(212,146,10,0.65); }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .sfx-left  { width: 100%; justify-content: flex-end; padding-bottom: 56px; }
          .sfx-right { display: none; }
          .sfx-overlay { flex-direction: column; }
          .sfx-footer { display: none; }
          .sfx-lightbox__inner { width: 98vw; }
          .sfx-lb-desc { display: none; }
        }
      `}</style>

      <div className="sfx-overlay">
        {/* ── Left: bar stack ── */}
        <div className="sfx-left">
          {SFX_PIECES.map((item, i) => (
            <div
              key={i}
              className={[
                "sfx-bar-hit",
                active === i  ? "sfx-bar-hit--active"  : "",
                mounted       ? "sfx-bar-hit--mounted"  : "",
              ].join(" ")}
              style={{ transitionDelay: `${i * 60}ms`, pointerEvents: "all" }}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              role="button" tabIndex={0}
              aria-label={`${item.title} — ${item.tag}`}
              onKeyDown={(e) => { if (e.key === "Enter") { setActive(i); openLightbox(); } }}
            >
              <div className="sfx-bar-visual">
                <span className="sfx-bar-accent" aria-hidden="true" />
                <span className="sfx-bar-fill"   aria-hidden="true" />
                <span className="sfx-bar-content">
                  <span className="sfx-bar-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="sfx-bar-text">
                    <span className="sfx-bar-title">{item.title}</span>
                    <span className="sfx-bar-tag">{item.tag}</span>
                  </span>
                  <span className="sfx-bar-hint" aria-hidden="true">
                    {active === i ? "CLICK / ↵" : ""}
                  </span>
                </span>
              </div>
              <span className="sfx-bar-desc">{item.desc}</span>
            </div>
          ))}
        </div>

        {/* ── Right: live preview ── */}
        <div className="sfx-right">
          <div
            className="sfx-preview-shell"
            key={active}
            onClick={openLightbox}
            title="Click to fullscreen"
          >
            <div className="sfx-preview-frame">
              {piece.src ? (
                <video
                  ref={previewRef}
                  src={piece.src}
                  autoPlay loop muted playsInline
                  className="sfx-preview-video"
                />
              ) : (
                <div className="sfx-preview-placeholder">
                  <span className="sfx-preview-placeholder-label">VIDEO PREVIEW</span>
                  <span className="sfx-preview-placeholder-title">{piece.title}</span>
                </div>
              )}
            </div>
            <div className="sfx-preview-overlay">
              <div className="sfx-play-btn">⛶</div>
            </div>
            <div className="sfx-preview-info">
              <span className="sfx-preview-info-title">{piece.title}</span>
              <span className="sfx-preview-info-tag">{piece.tag}</span>
              <span className="sfx-preview-info-desc">{piece.desc}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className={`sfx-lightbox${lbVisible ? " sfx-lightbox--open" : ""}`}
          onClick={(e) => { if (e.currentTarget === e.target) closeLightbox(); }}
          role="dialog" aria-modal="true"
        >
          <div className="sfx-lightbox__inner" ref={lightboxRef}>
            <div className="sfx-lightbox__frame">
              {piece.src ? (
                <video
                  src={piece.src}
                  autoPlay loop playsInline controls
                  className="sfx-lightbox__video"
                />
              ) : (
                <div className="sfx-lightbox__placeholder">
                  <span className="sfx-lightbox__placeholder-label">NO VIDEO ATTACHED</span>
                  <span className="sfx-lightbox__placeholder-title">{piece.title}</span>
                </div>
              )}
            </div>
            <div className="sfx-lb-toolbar">
              <div className="sfx-lb-info">
                <span className="sfx-lb-counter">{String(active + 1).padStart(2, "0")} / {String(SFX_PIECES.length).padStart(2, "0")}</span>
                <span className="sfx-lb-title">{piece.title}</span>
                <span className="sfx-lb-tag">{piece.tag}</span>
                <span className="sfx-lb-desc">{piece.desc}</span>
              </div>
              <button className="sfx-lb-btn" onClick={() => setActive(i => Math.max(0, i - 1))} aria-label="Previous">◄</button>
              <button className="sfx-lb-btn" onClick={() => setActive(i => Math.min(SFX_PIECES.length - 1, i + 1))} aria-label="Next">►</button>
              <button className="sfx-lb-btn sfx-lb-btn--close" onClick={closeLightbox} aria-label="Close">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer hints ── */}
      <footer className={`sfx-footer${mounted ? " sfx-footer--mounted" : ""}`}>
        <div className="sfx-footer__row"><kbd>↑↓ / WS</kbd><span>SELECT</span></div>
        <div className="sfx-footer__row"><kbd>↵ / F</kbd><span>FULLSCREEN</span></div>
        <div className="sfx-footer__row"><kbd>ESC</kbd><span>BACK</span></div>
      </footer>

      {/* ── Back button ── */}
      <button
        className={`sfx-back-btn${mounted ? " sfx-back-btn--mounted" : ""}`}
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ◄ BACK
      </button>
    </div>
  );
}