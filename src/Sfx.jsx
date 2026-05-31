import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import soon from "./assets/animation/soon.mp4";
import d4c from "./assets/animation/d4credesignkahny.mp4";

const VFX_PIECES = [
  { src: soon, title: "D4C CUTSCENE",       tag: "ATTACK",    desc: "custom redesigned d4c sfx" },
  { src: soon, title: "Explosion SFX", tag: "EXPLOSION", desc: "Soon" },
  { src: soon, title: "Magic SFX",     tag: "MAGIC",     desc: "Soon" },
  { src: soon, title: "Summon SFX",    tag: "CHARACTER", desc: "Soon" },
  { src: soon, title: "Other",         tag: "ATTACK",    desc: "Soon" },
  { src: soon, title: "Other",         tag: "ATTACK",    desc: "Soon" },
  // ── Add more entries here ──
];

// Olive/gold accent colour
const A = "#8a9a00";       // main accent (olive gold)
const A2 = "rgba(138,154,0,"; // for rgba variants

export default function Vfx({ src: bgSrc }) {
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
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setActive(i => Math.min(VFX_PIECES.length - 1, i + 1));
      if (e.key === "Enter" || e.key === "f" || e.key === "F")     openLightbox();
      if (e.key === "Escape" || e.key === "Backspace" || e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, navigate, openLightbox, closeLightbox]);

  const piece = VFX_PIECES[active];

  return (
    <div id="menu-screen">
      <video src={bgSrc} autoPlay loop muted playsInline style={{ pointerEvents: "none" }} />

      {/* Entry reveal mask — olive flash */}
      <div className="vfx-entry-mask" aria-hidden="true">
        <video src={bgSrc} autoPlay loop muted playsInline className="vfx-entry-video" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Entry wipe ── */
        .vfx-entry-mask {
          position: absolute; inset: 0; z-index: 9;
          overflow: hidden; background: #6b7800;
          clip-path: circle(0 at 50% 50%);
          animation: vfx-entry-reveal 1.1s cubic-bezier(0.16,1,0.3,1) forwards;
          pointer-events: none;
        }
        .vfx-entry-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
        }
        @keyframes vfx-entry-reveal {
          from { clip-path: circle(0 at 50% 50%); }
          to   { clip-path: circle(150vmax at 50% 50%); }
        }

        /* ── Root overlay ── */
        .vfx-overlay {
          position: absolute; inset: 0; z-index: 10;
          display: flex; align-items: stretch;
          pointer-events: none;
        }

        /* ── Left panel ── */
        .vfx-left {
          position: relative;
          width: clamp(280px, 36vw, 480px);
          display: flex; flex-direction: column;
          justify-content: center;
          gap: 6px;
          pointer-events: all;
          flex-shrink: 0;
        }

        /* ── Bar hit wrapper ── */
        .vfx-bar-hit {
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
        .vfx-bar-hit--mounted  { transform: translateX(0); }
        .vfx-bar-hit:nth-child(1) { transition-delay: 0ms; }
        .vfx-bar-hit:nth-child(2) { transition-delay: 60ms; }
        .vfx-bar-hit:nth-child(3) { transition-delay: 120ms; }
        .vfx-bar-hit:nth-child(4) { transition-delay: 180ms; }
        .vfx-bar-hit:nth-child(5) { transition-delay: 240ms; }
        .vfx-bar-hit:nth-child(6) { transition-delay: 300ms; }
        .vfx-bar-hit:nth-child(7) { transition-delay: 360ms; }
        .vfx-bar-hit--active { width: 108%; }

        .vfx-bar-visual {
          position: relative; height: 54px;
          background: rgba(20, 24, 4, 0.92);
          clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
          pointer-events: none;
          border-left: 3px solid rgba(138,154,0,0.0);
          transition: height 0.28s cubic-bezier(0.22,1,0.36,1),
                      border-color 0.2s ease,
                      background 0.2s ease;
        }
        .vfx-bar-hit--active .vfx-bar-visual {
          height: 74px;
          border-left-color: #8a9a00;
          background: rgba(32, 38, 4, 0.97);
        }

        /* Olive accent underlay */
        .vfx-bar-accent {
          position: absolute; inset: 0;
          background: #8a9a00;
          clip-path: polygon(65% 0, 100% 0, 100% 100%, calc(65% - 12px) 100%);
          transform: translateY(-5px); opacity: 0;
          transition: opacity 0.2s ease; z-index: 0; pointer-events: none;
        }
        .vfx-bar-hit--active .vfx-bar-accent { opacity: 1; }

        /* White fill sweep */
        .vfx-bar-fill {
          position: absolute; inset: 0; background: #e8e8d0;
          clip-path: polygon(calc(100% - 4px) 0, 100% 0, calc(100% - 14px) 100%, calc(100% - 18px) 100%);
          transition: clip-path 0.32s cubic-bezier(0.22,1,0.36,1);
          z-index: 0; pointer-events: none;
        }
        .vfx-bar-hit--active .vfx-bar-fill {
          clip-path: polygon(28% 0, 100% 0, calc(100% - 12px) 100%, calc(28% + 110px) 100%);
        }

        .vfx-bar-content {
          position: relative; z-index: 2; height: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 0 14px; pointer-events: none;
        }
        .vfx-bar-index {
          font-family: 'Bebas Neue', sans-serif; font-size: 26px;
          color: rgba(180,200,40,0.3); line-height: 1; flex-shrink: 0;
          letter-spacing: 1px; transition: color 0.2s ease;
        }
        .vfx-bar-hit--active .vfx-bar-index { color: rgba(0,0,0,0.3); }

        .vfx-bar-text { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
        .vfx-bar-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 21px;
          letter-spacing: 3px; color: rgba(200,220,80,0.85); line-height: 1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.2s ease;
        }
        .vfx-bar-hit--active .vfx-bar-title { color: #1a1a00; }

        .vfx-bar-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(180,200,40,0.4); transition: color 0.2s ease;
        }
        .vfx-bar-hit--active .vfx-bar-tag { color: rgba(0,0,0,0.4); }

        .vfx-bar-hint {
          font-family: 'Bebas Neue', sans-serif; font-size: 10px;
          letter-spacing: 2px; color: #8a9a00;
          flex-shrink: 0; padding-right: 4px; min-width: 56px; text-align: right;
        }

        .vfx-bar-desc {
          display: block; position: absolute;
          bottom: 2px; left: 14px; right: 14px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 11px;
          font-weight: 300; letter-spacing: 0.5px; color: rgba(190,210,60,0.45);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: 0; transform: translateY(-2px);
          transition: opacity 0.18s ease 0.06s, transform 0.18s ease 0.06s;
          pointer-events: none;
        }
        .vfx-bar-hit--active .vfx-bar-desc { opacity: 1; transform: translateY(0); }

        /* ── Right panel — video preview ── */
        .vfx-right {
          flex: 1;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          pointer-events: all;
          overflow: hidden;
        }

        @keyframes vfx-preview-in {
          0%   { opacity: 0; transform: scale(0.96) translateX(16px); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }

        .vfx-preview-shell {
          position: relative;
          width: min(88%, 680px);
          aspect-ratio: 16/9;
          cursor: pointer;
          animation: vfx-preview-in 0.38s cubic-bezier(0.22,1,0.36,1) both;
        }
        .vfx-preview-shell::before {
          content: "";
          position: absolute; inset: -2px;
          background: linear-gradient(135deg, #8a9a00 0%, rgba(138,154,0,0.3) 50%, transparent 100%);
          z-index: 0; border-radius: 2px;
        }

        .vfx-preview-frame {
          position: relative; width: 100%; height: 100%;
          background: #0c0e02; overflow: hidden; z-index: 1;
        }
        .vfx-preview-video {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .vfx-preview-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
          background: rgba(30,36,4,0.6);
        }
        .vfx-preview-placeholder-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 3px; color: rgba(180,200,40,0.25);
        }
        .vfx-preview-placeholder-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          letter-spacing: 5px; color: rgba(180,200,40,0.35);
        }

        /* Hover overlay */
        .vfx-preview-overlay {
          position: absolute; inset: 0; z-index: 3;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease;
        }
        .vfx-preview-shell:hover .vfx-preview-overlay { background: rgba(0,0,0,0.45); }

        .vfx-play-btn {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(138,154,0,0.88);
          border: 2px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #fff;
          opacity: 0; transform: scale(0.8);
          transition: opacity 0.18s ease, transform 0.18s ease;
          pointer-events: none;
        }
        .vfx-preview-shell:hover .vfx-play-btn { opacity: 1; transform: scale(1); }

        .vfx-preview-info {
          position: absolute; bottom: -48px; left: 0; right: 0;
          display: flex; align-items: center; gap: 12px; padding: 0 2px;
        }
        .vfx-preview-info-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 18px;
          letter-spacing: 3px; color: rgba(220,230,140,0.8);
        }
        .vfx-preview-info-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: #a8bc00; border: 1px solid rgba(138,154,0,0.45);
          padding: 2px 6px; border-radius: 2px;
        }
        .vfx-preview-info-desc {
          flex: 1;
          font-family: 'Barlow Condensed', sans-serif; font-size: 12px;
          font-weight: 300; color: rgba(200,210,120,0.3);
          letter-spacing: 0.4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Lightbox ── */
        .vfx-lightbox {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.36s cubic-bezier(0.4,0,0.2,1);
          cursor: default;
        }
        .vfx-lightbox--open { background: rgba(0,0,0,0.94); }

        .vfx-lightbox__inner {
          position: relative;
          width: min(94vw, 1200px);
          display: flex; flex-direction: column; gap: 0;
          opacity: 0; transform: translateY(24px) scale(0.97);
          transition: opacity 0.34s cubic-bezier(0.22,1,0.36,1),
                      transform 0.34s cubic-bezier(0.22,1,0.36,1);
        }
        .vfx-lightbox--open .vfx-lightbox__inner {
          opacity: 1; transform: translateY(0) scale(1);
        }
        .vfx-lightbox:not(.vfx-lightbox--open) .vfx-lightbox__inner {
          opacity: 0; transform: translateY(12px) scale(0.98);
          transition: opacity 0.26s cubic-bezier(0.4,0,1,1),
                      transform 0.26s cubic-bezier(0.4,0,1,1);
        }

        .vfx-lightbox__frame {
          position: relative; width: 100%; aspect-ratio: 16/9;
          background: #050600;
          border: 1px solid rgba(138,154,0,0.22);
          border-bottom: none; overflow: hidden;
        }
        .vfx-lightbox__video {
          width: 100%; height: 100%; display: block; object-fit: contain;
        }
        .vfx-lightbox__placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
        }
        .vfx-lightbox__placeholder-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 3px; color: rgba(180,200,40,0.2);
        }
        .vfx-lightbox__placeholder-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 32px;
          letter-spacing: 6px; color: rgba(180,200,40,0.28);
        }

        /* Lightbox toolbar */
        @keyframes vfx-toolbar-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vfx-lb-toolbar {
          display: flex; align-items: center;
          background: rgba(4,5,0,0.97);
          border: 1px solid rgba(138,154,0,0.18);
          padding: 0 14px; height: 42px; gap: 14px;
          animation: vfx-toolbar-in 0.3s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        .vfx-lb-info {
          display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;
        }
        .vfx-lb-counter {
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 2px; color: rgba(180,200,40,0.3); flex-shrink: 0;
        }
        .vfx-lb-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 16px;
          letter-spacing: 3px; color: rgba(230,240,180,0.8);
        }
        .vfx-lb-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: #a8bc00; border: 1px solid rgba(138,154,0,0.35);
          padding: 1px 5px; border-radius: 2px; flex-shrink: 0;
        }
        .vfx-lb-desc {
          flex: 1; font-family: 'Barlow Condensed', sans-serif; font-size: 12px;
          font-weight: 300; color: rgba(200,210,120,0.3); letter-spacing: 0.4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .vfx-lb-btn {
          height: 26px; min-width: 26px; padding: 0 8px;
          background: rgba(138,154,0,0.06); border: 1px solid rgba(138,154,0,0.22);
          color: rgba(190,210,60,0.65); cursor: pointer; border-radius: 3px;
          font-family: 'Bebas Neue', sans-serif; font-size: 12px; letter-spacing: 2px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
        }
        .vfx-lb-btn:hover { background: rgba(138,154,0,0.22); color: #e8f080; border-color: rgba(138,154,0,0.6); }
        .vfx-lb-btn:active { background: rgba(138,154,0,0.35); }
        .vfx-lb-btn--close { margin-left: 4px; }
        .vfx-lb-btn--close:hover { background: rgba(138,154,0,0.38); }

        /* ── Footer ── */
        .vfx-footer {
          position: fixed; bottom: 20px; right: 28px;
          display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
          font-family: 'Bebas Neue', sans-serif; z-index: 10;
          opacity: 0; transition: opacity 0.4s ease 1s; pointer-events: none;
        }
        .vfx-footer--mounted { opacity: 1; }
        .vfx-footer__row {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; letter-spacing: 2px; color: rgba(180,200,60,0.22);
        }
        .vfx-footer__row kbd {
          font-family: 'Bebas Neue', sans-serif;
          border: 1px solid rgba(160,180,40,0.15); border-radius: 3px;
          padding: 1px 6px; font-size: 10px; background: none; color: inherit;
        }

        /* ── Back button ── */
        .vfx-back-btn {
          position: fixed; bottom: 20px; left: 20px; z-index: 50;
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 2.5px; color: rgba(138,154,0,0.75);
          background: rgba(138,154,0,0.06);
          border: 1px solid rgba(138,154,0,0.28);
          border-radius: 3px; padding: 5px 12px;
          cursor: pointer; pointer-events: all;
          opacity: 0; transform: translateY(4px);
          transition: opacity 0.4s ease 1s, transform 0.4s ease 1s,
                      background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .vfx-back-btn--mounted { opacity: 1; transform: translateY(0); }
        .vfx-back-btn:hover { background: rgba(138,154,0,0.18); color: #d4e840; border-color: rgba(138,154,0,0.6); }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .vfx-left  { width: 100%; justify-content: flex-end; padding-bottom: 56px; }
          .vfx-right { display: none; }
          .vfx-overlay { flex-direction: column; }
          .vfx-footer { display: none; }
          .vfx-lightbox__inner { width: 98vw; }
          .vfx-lb-desc { display: none; }
        }
      `}</style>

      <div className="vfx-overlay">
        {/* ── Left: bar stack ── */}
        <div className="vfx-left">
          {VFX_PIECES.map((item, i) => (
            <div
              key={i}
              className={[
                "vfx-bar-hit",
                active === i  ? "vfx-bar-hit--active"  : "",
                mounted       ? "vfx-bar-hit--mounted"  : "",
              ].join(" ")}
              style={{ transitionDelay: `${i * 60}ms`, pointerEvents: "all" }}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              role="button" tabIndex={0}
              aria-label={`${item.title} — ${item.tag}`}
              onKeyDown={(e) => { if (e.key === "Enter") { setActive(i); openLightbox(); } }}
            >
              <div className="vfx-bar-visual">
                <span className="vfx-bar-accent" aria-hidden="true" />
                <span className="vfx-bar-fill"   aria-hidden="true" />
                <span className="vfx-bar-content">
                  <span className="vfx-bar-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="vfx-bar-text">
                    <span className="vfx-bar-title">{item.title}</span>
                    <span className="vfx-bar-tag">{item.tag}</span>
                  </span>
                  <span className="vfx-bar-hint" aria-hidden="true">
                    {active === i ? "CLICK / ↵" : ""}
                  </span>
                </span>
              </div>
              <span className="vfx-bar-desc">{item.desc}</span>
            </div>
          ))}
        </div>

        {/* ── Right: live preview ── */}
        <div className="vfx-right">
          <div
            className="vfx-preview-shell"
            key={active}
            onClick={openLightbox}
            title="Click to fullscreen"
          >
            <div className="vfx-preview-frame">
              {piece.src ? (
                <video
                  ref={previewRef}
                  src={piece.src}
                  autoPlay loop muted playsInline
                  className="vfx-preview-video"
                />
              ) : (
                <div className="vfx-preview-placeholder">
                  <span className="vfx-preview-placeholder-label">VIDEO PREVIEW</span>
                  <span className="vfx-preview-placeholder-title">{piece.title}</span>
                </div>
              )}
            </div>
            <div className="vfx-preview-overlay">
              <div className="vfx-play-btn">⛶</div>
            </div>
            <div className="vfx-preview-info">
              <span className="vfx-preview-info-title">{piece.title}</span>
              <span className="vfx-preview-info-tag">{piece.tag}</span>
              <span className="vfx-preview-info-desc">{piece.desc}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className={`vfx-lightbox${lbVisible ? " vfx-lightbox--open" : ""}`}
          onClick={(e) => { if (e.currentTarget === e.target) closeLightbox(); }}
          role="dialog" aria-modal="true"
        >
          <div className="vfx-lightbox__inner" ref={lightboxRef}>
            <div className="vfx-lightbox__frame">
              {piece.src ? (
                <video
                  src={piece.src}
                  autoPlay loop playsInline controls
                  className="vfx-lightbox__video"
                />
              ) : (
                <div className="vfx-lightbox__placeholder">
                  <span className="vfx-lightbox__placeholder-label">NO VIDEO ATTACHED</span>
                  <span className="vfx-lightbox__placeholder-title">{piece.title}</span>
                </div>
              )}
            </div>
            <div className="vfx-lb-toolbar">
              <div className="vfx-lb-info">
                <span className="vfx-lb-counter">{String(active + 1).padStart(2, "0")} / {String(VFX_PIECES.length).padStart(2, "0")}</span>
                <span className="vfx-lb-title">{piece.title}</span>
                <span className="vfx-lb-tag">{piece.tag}</span>
                <span className="vfx-lb-desc">{piece.desc}</span>
              </div>
              <button className="vfx-lb-btn" onClick={() => setActive(i => Math.max(0, i - 1))} aria-label="Previous">◄</button>
              <button className="vfx-lb-btn" onClick={() => setActive(i => Math.min(VFX_PIECES.length - 1, i + 1))} aria-label="Next">►</button>
              <button className="vfx-lb-btn vfx-lb-btn--close" onClick={closeLightbox} aria-label="Close">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer hints ── */}
      <footer className={`vfx-footer${mounted ? " vfx-footer--mounted" : ""}`}>
        <div className="vfx-footer__row"><kbd>↑↓ / WS</kbd><span>SELECT</span></div>
        <div className="vfx-footer__row"><kbd>↵ / F</kbd><span>FULLSCREEN</span></div>
        <div className="vfx-footer__row"><kbd>ESC</kbd><span>BACK</span></div>
      </footer>

      {/* ── Back button ── */}
      <button
        className={`vfx-back-btn${mounted ? " vfx-back-btn--mounted" : ""}`}
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ◄ BACK
      </button>
    </div>
  );
}