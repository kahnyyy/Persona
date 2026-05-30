import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── ADD YOUR VIDEOS HERE ────────────────────────────────────────────────────
// import vid1 from "./assets/anim1.mp4";
// { src: vid1, title: "TITLE", tag: "TYPE", desc: "Short description." }
// ─────────────────────────────────────────────────────────────────────────────

const ANIM_PIECES = [
  { src: null, title: "Slash FX",       tag: "VFX",       desc: "High-speed sword slash with motion blur and impact frames." },
  { src: null, title: "Fire Loop",      tag: "VFX",       desc: "Looping flame animation hand-drawn frame by frame." },
  { src: null, title: "Character Run",  tag: "CHARACTER", desc: "Full character run cycle with secondary motion." },
  { src: null, title: "Idle Breath",    tag: "CHARACTER", desc: "Subtle idle breathing animation with cloth physics." },
  { src: null, title: "Impact Hit",     tag: "VFX",       desc: "Smear frames and hit flash on contact point." },
  { src: null, title: "Crowd Scene",    tag: "SCENE",     desc: "Multi-layer parallax crowd animation with depth." },
  // ── Add more entries here ──
];

export default function Animation({ src: bgSrc }) {
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

  // Restart preview video whenever active changes
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
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setActive(i => Math.min(ANIM_PIECES.length - 1, i + 1));
      if (e.key === "Enter" || e.key === "f" || e.key === "F")     openLightbox();
      if (e.key === "Escape" || e.key === "Backspace" || e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, navigate, openLightbox, closeLightbox]);

  const piece = ANIM_PIECES[active];

  return (
    <div id="menu-screen">
      {/* Background video */}
      <video src={bgSrc} autoPlay loop muted playsInline style={{ pointerEvents: "none" }} />

      {/* Entry reveal mask */}
      <div className="anim-entry-mask" aria-hidden="true">
        <video src={bgSrc} autoPlay loop muted playsInline className="anim-entry-video" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Entry wipe ── */
        .anim-entry-mask {
          position: absolute; inset: 0; z-index: 9;
          overflow: hidden; background: #c4001a;
          clip-path: circle(0 at 50% 50%);
          animation: anim-entry-reveal 1.1s cubic-bezier(0.16,1,0.3,1) forwards;
          pointer-events: none;
        }
        .anim-entry-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
        }
        @keyframes anim-entry-reveal {
          from { clip-path: circle(0 at 50% 50%); }
          to   { clip-path: circle(150vmax at 50% 50%); }
        }

        /* ── Root overlay ── */
        .anim-overlay {
          position: absolute; inset: 0; z-index: 10;
          display: flex; align-items: stretch;
          pointer-events: none;
        }

        /* ── Left panel — bar stack ── */
        .anim-left {
          position: relative;
          width: clamp(280px, 36vw, 480px);
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 0 0 0 0;
          gap: 6px;
          pointer-events: all;
          flex-shrink: 0;
        }

        /* ── Bar hit wrapper (same pattern as UIGallery) ── */
        .anim-bar-hit {
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
        .anim-bar-hit--mounted  { transform: translateX(0); }
        .anim-bar-hit:nth-child(1) { transition-delay: 0ms; }
        .anim-bar-hit:nth-child(2) { transition-delay: 60ms; }
        .anim-bar-hit:nth-child(3) { transition-delay: 120ms; }
        .anim-bar-hit:nth-child(4) { transition-delay: 180ms; }
        .anim-bar-hit:nth-child(5) { transition-delay: 240ms; }
        .anim-bar-hit:nth-child(6) { transition-delay: 300ms; }
        .anim-bar-hit:nth-child(7) { transition-delay: 360ms; }
        .anim-bar-hit--active { width: 108%; }

        .anim-bar-visual {
          position: relative; height: 54px;
          background: rgba(60, 4, 4, 0.92);
          clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
          transition: height 0.28s cubic-bezier(0.22,1,0.36,1);
          pointer-events: none;
          border-left: 3px solid rgba(196,0,26,0.0);
          transition: height 0.28s cubic-bezier(0.22,1,0.36,1),
                      border-color 0.2s ease;
        }
        .anim-bar-hit--active .anim-bar-visual {
          height: 74px;
          border-left-color: #c4001a;
          background: rgba(80, 6, 6, 0.96);
        }

        /* Red accent underlay */
        .anim-bar-red {
          position: absolute; inset: 0;
          background: #c4001a;
          clip-path: polygon(65% 0, 100% 0, 100% 100%, calc(65% - 12px) 100%);
          transform: translateY(-5px); opacity: 0;
          transition: opacity 0.2s ease; z-index: 0; pointer-events: none;
        }
        .anim-bar-hit--active .anim-bar-red { opacity: 1; }

        /* White fill sweep */
        .anim-bar-fill {
          position: absolute; inset: 0; background: #fff;
          clip-path: polygon(calc(100% - 4px) 0, 100% 0, calc(100% - 14px) 100%, calc(100% - 18px) 100%);
          transition: clip-path 0.32s cubic-bezier(0.22,1,0.36,1);
          z-index: 0; pointer-events: none;
        }
        .anim-bar-hit--active .anim-bar-fill {
          clip-path: polygon(28% 0, 100% 0, calc(100% - 12px) 100%, calc(28% + 110px) 100%);
        }

        .anim-bar-content {
          position: relative; z-index: 2; height: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 0 14px 0 14px; pointer-events: none;
        }
        .anim-bar-index {
          font-family: 'Bebas Neue', sans-serif; font-size: 26px;
          color: rgba(255,80,80,0.35); line-height: 1; flex-shrink: 0;
          letter-spacing: 1px; transition: color 0.2s ease;
        }
        .anim-bar-hit--active .anim-bar-index { color: rgba(0,0,0,0.28); }

        .anim-bar-text { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
        .anim-bar-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 21px;
          letter-spacing: 3px; color: rgba(255,120,120,0.85); line-height: 1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.2s ease;
        }
        .anim-bar-hit--active .anim-bar-title { color: #0a0a0a; }

        .anim-bar-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(255,80,80,0.4); transition: color 0.2s ease;
        }
        .anim-bar-hit--active .anim-bar-tag { color: rgba(0,0,0,0.4); }

        .anim-bar-hint {
          font-family: 'Bebas Neue', sans-serif; font-size: 10px;
          letter-spacing: 2px; color: #c4001a;
          flex-shrink: 0; padding-right: 4px; min-width: 56px; text-align: right;
        }

        .anim-bar-desc {
          display: block; position: absolute;
          bottom: 2px; left: 14px; right: 14px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 11px;
          font-weight: 300; letter-spacing: 0.5px; color: rgba(255,140,140,0.5);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: 0; transform: translateY(-2px);
          transition: opacity 0.18s ease 0.06s, transform 0.18s ease 0.06s;
          pointer-events: none;
        }
        .anim-bar-hit--active .anim-bar-desc { opacity: 1; transform: translateY(0); }

        /* ── Right panel — video preview ── */
        .anim-right {
          flex: 1;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          pointer-events: all;
          overflow: hidden;
        }

        @keyframes anim-preview-in {
          0%   { opacity: 0; transform: scale(0.96) translateX(16px); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }

        .anim-preview-shell {
          position: relative;
          width: min(88%, 680px);
          aspect-ratio: 16/9;
          cursor: pointer;
          animation: anim-preview-in 0.38s cubic-bezier(0.22,1,0.36,1) both;
        }

        .anim-preview-shell::before {
          content: "";
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #c4001a 0%, rgba(196,0,26,0.3) 50%, transparent 100%);
          z-index: 0;
          border-radius: 2px;
        }

        .anim-preview-frame {
          position: relative; width: 100%; height: 100%;
          background: #0a0202;
          overflow: hidden;
          z-index: 1;
        }

        .anim-preview-video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }

        .anim-preview-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
          background: rgba(80,4,4,0.5);
        }
        .anim-preview-placeholder-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 3px; color: rgba(255,80,80,0.25);
        }
        .anim-preview-placeholder-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          letter-spacing: 5px; color: rgba(255,80,80,0.35);
        }

        /* Hover overlay */
        .anim-preview-overlay {
          position: absolute; inset: 0; z-index: 3;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease;
        }
        .anim-preview-shell:hover .anim-preview-overlay { background: rgba(0,0,0,0.45); }

        .anim-play-btn {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(196,0,26,0.85);
          border: 2px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #fff;
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.18s ease, transform 0.18s ease;
          pointer-events: none;
        }
        .anim-preview-shell:hover .anim-play-btn {
          opacity: 1; transform: scale(1);
        }

        /* Info strip below preview */
        .anim-preview-info {
          position: absolute;
          bottom: -48px; left: 0; right: 0;
          display: flex; align-items: center; gap: 12px;
          padding: 0 2px;
        }
        .anim-preview-info-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 18px;
          letter-spacing: 3px; color: rgba(255,255,255,0.7);
        }
        .anim-preview-info-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: #c4001a; border: 1px solid rgba(196,0,26,0.4);
          padding: 2px 6px; border-radius: 2px;
        }
        .anim-preview-info-desc {
          flex: 1;
          font-family: 'Barlow Condensed', sans-serif; font-size: 12px;
          font-weight: 300; color: rgba(255,255,255,0.3);
          letter-spacing: 0.4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Lightbox ── */
        .anim-lightbox {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.36s cubic-bezier(0.4,0,0.2,1);
          cursor: default;
        }
        .anim-lightbox--open { background: rgba(0,0,0,0.94); }

        .anim-lightbox__inner {
          position: relative;
          width: min(94vw, 1200px);
          display: flex; flex-direction: column; gap: 0;
          opacity: 0; transform: translateY(24px) scale(0.97);
          transition: opacity 0.34s cubic-bezier(0.22,1,0.36,1),
                      transform 0.34s cubic-bezier(0.22,1,0.36,1);
        }
        .anim-lightbox--open .anim-lightbox__inner {
          opacity: 1; transform: translateY(0) scale(1);
        }
        .anim-lightbox:not(.anim-lightbox--open) .anim-lightbox__inner {
          opacity: 0; transform: translateY(12px) scale(0.98);
          transition: opacity 0.26s cubic-bezier(0.4,0,1,1),
                      transform 0.26s cubic-bezier(0.4,0,1,1);
        }

        .anim-lightbox__frame {
          position: relative; width: 100%; aspect-ratio: 16/9;
          background: #050000;
          border: 1px solid rgba(196,0,26,0.25);
          border-bottom: none; overflow: hidden;
        }
        .anim-lightbox__video {
          width: 100%; height: 100%; display: block; object-fit: contain;
        }
        .anim-lightbox__placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
        }
        .anim-lightbox__placeholder-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 3px; color: rgba(255,80,80,0.2);
        }
        .anim-lightbox__placeholder-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 32px;
          letter-spacing: 6px; color: rgba(255,80,80,0.3);
        }

        /* Lightbox toolbar */
        .anim-lb-toolbar {
          display: flex; align-items: center;
          background: rgba(8,2,2,0.97);
          border: 1px solid rgba(196,0,26,0.18);
          padding: 0 14px; height: 42px; gap: 14px;
          animation: lb-toolbar-in 0.3s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        @keyframes lb-toolbar-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-lb-info {
          display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;
        }
        .anim-lb-counter {
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 2px; color: rgba(255,80,80,0.3); flex-shrink: 0;
        }
        .anim-lb-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 16px;
          letter-spacing: 3px; color: rgba(255,255,255,0.75);
        }
        .anim-lb-tag {
          font-family: 'Barlow Condensed', sans-serif; font-size: 9px;
          font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: #c4001a; border: 1px solid rgba(196,0,26,0.35);
          padding: 1px 5px; border-radius: 2px; flex-shrink: 0;
        }
        .anim-lb-desc {
          flex: 1; font-family: 'Barlow Condensed', sans-serif; font-size: 12px;
          font-weight: 300; color: rgba(255,255,255,0.3); letter-spacing: 0.4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .anim-lb-btn {
          height: 26px; min-width: 26px; padding: 0 8px;
          background: rgba(196,0,26,0.06); border: 1px solid rgba(196,0,26,0.22);
          color: rgba(255,100,100,0.65); cursor: pointer; border-radius: 3px;
          font-family: 'Bebas Neue', sans-serif; font-size: 12px; letter-spacing: 2px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease;
        }
        .anim-lb-btn:hover { background: rgba(196,0,26,0.22); color: #fff; border-color: rgba(196,0,26,0.6); }
        .anim-lb-btn:active { background: rgba(196,0,26,0.35); }
        .anim-lb-btn--close { margin-left: 4px; }
        .anim-lb-btn--close:hover { background: rgba(196,0,26,0.4); }

        /* ── Footer ── */
        .anim-footer {
          position: fixed; bottom: 20px; right: 28px;
          display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
          font-family: 'Bebas Neue', sans-serif; z-index: 10;
          opacity: 0; transition: opacity 0.4s ease 1s; pointer-events: none;
        }
        .anim-footer--mounted { opacity: 1; }
        .anim-footer__row {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; letter-spacing: 2px; color: rgba(255,100,100,0.25);
        }
        .anim-footer__row kbd {
          font-family: 'Bebas Neue', sans-serif;
          border: 1px solid rgba(255,80,80,0.15); border-radius: 3px;
          padding: 1px 6px; font-size: 10px; background: none; color: inherit;
        }

        /* ── Back button ── */
        .anim-back-btn {
          position: fixed; bottom: 20px; left: 20px;
          z-index: 50;
          font-family: 'Bebas Neue', sans-serif; font-size: 12px;
          letter-spacing: 2.5px; color: rgba(196,0,26,0.7);
          background: rgba(196,0,26,0.06);
          border: 1px solid rgba(196,0,26,0.25);
          border-radius: 3px; padding: 5px 12px;
          cursor: pointer; pointer-events: all;
          opacity: 0; transform: translateY(4px);
          transition: opacity 0.4s ease 1s, transform 0.4s ease 1s,
                      background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .anim-back-btn--mounted { opacity: 1; transform: translateY(0); }
        .anim-back-btn:hover { background: rgba(196,0,26,0.18); color: #ff2233; border-color: rgba(196,0,26,0.55); }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .anim-left { width: 100%; justify-content: flex-end; padding-bottom: 56px; }
          .anim-right { display: none; }
          .anim-overlay { flex-direction: column; }
          .anim-footer { display: none; }
          .anim-lightbox__inner { width: 98vw; }
          .anim-lb-desc { display: none; }
        }
      `}</style>

      <div className="anim-overlay">
        {/* ── Left: bar stack ── */}
        <div className="anim-left">
          {ANIM_PIECES.map((item, i) => (
            <div
              key={i}
              className={[
                "anim-bar-hit",
                active === i  ? "anim-bar-hit--active"  : "",
                mounted       ? "anim-bar-hit--mounted"  : "",
              ].join(" ")}
              style={{ transitionDelay: `${i * 60}ms`, pointerEvents: "all" }}
              onClick={() => { setActive(i); }}
              onMouseEnter={() => setActive(i)}
              role="button" tabIndex={0}
              aria-label={`${item.title} — ${item.tag}`}
              onKeyDown={(e) => { if (e.key === "Enter") { setActive(i); openLightbox(); } }}
            >
              <div className="anim-bar-visual">
                <span className="anim-bar-red"  aria-hidden="true" />
                <span className="anim-bar-fill" aria-hidden="true" />
                <span className="anim-bar-content">
                  <span className="anim-bar-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="anim-bar-text">
                    <span className="anim-bar-title">{item.title}</span>
                    <span className="anim-bar-tag">{item.tag}</span>
                  </span>
                  <span className="anim-bar-hint" aria-hidden="true">
                    {active === i ? "CLICK / ↵" : ""}
                  </span>
                </span>
              </div>
              <span className="anim-bar-desc">{item.desc}</span>
            </div>
          ))}
        </div>

        {/* ── Right: live preview ── */}
        <div className="anim-right">
          <div
            className="anim-preview-shell"
            key={active}
            onClick={openLightbox}
            title="Click to fullscreen"
          >
            <div className="anim-preview-frame">
              {piece.src ? (
                <video
                  ref={previewRef}
                  src={piece.src}
                  autoPlay loop muted playsInline
                  className="anim-preview-video"
                />
              ) : (
                <div className="anim-preview-placeholder">
                  <span className="anim-preview-placeholder-label">VIDEO PREVIEW</span>
                  <span className="anim-preview-placeholder-title">{piece.title}</span>
                </div>
              )}
            </div>
            <div className="anim-preview-overlay">
              <div className="anim-play-btn">⛶</div>
            </div>
            {/* Info strip */}
            <div className="anim-preview-info">
              <span className="anim-preview-info-title">{piece.title}</span>
              <span className="anim-preview-info-tag">{piece.tag}</span>
              <span className="anim-preview-info-desc">{piece.desc}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className={`anim-lightbox${lbVisible ? " anim-lightbox--open" : ""}`}
          onClick={(e) => { if (e.currentTarget === e.target) closeLightbox(); }}
          role="dialog" aria-modal="true"
        >
          <div className="anim-lightbox__inner" ref={lightboxRef}>
            <div className="anim-lightbox__frame">
              {piece.src ? (
                <video
                  src={piece.src}
                  autoPlay loop playsInline controls
                  className="anim-lightbox__video"
                />
              ) : (
                <div className="anim-lightbox__placeholder">
                  <span className="anim-lightbox__placeholder-label">NO VIDEO ATTACHED</span>
                  <span className="anim-lightbox__placeholder-title">{piece.title}</span>
                </div>
              )}
            </div>

            <div className="anim-lb-toolbar">
              <div className="anim-lb-info">
                <span className="anim-lb-counter">{String(active + 1).padStart(2, "0")} / {String(ANIM_PIECES.length).padStart(2, "0")}</span>
                <span className="anim-lb-title">{piece.title}</span>
                <span className="anim-lb-tag">{piece.tag}</span>
                <span className="anim-lb-desc">{piece.desc}</span>
              </div>
              {/* Navigate inside lightbox */}
              <button className="anim-lb-btn" onClick={() => setActive(i => Math.max(0, i - 1))} aria-label="Previous">◄</button>
              <button className="anim-lb-btn" onClick={() => setActive(i => Math.min(ANIM_PIECES.length - 1, i + 1))} aria-label="Next">►</button>
              <button className="anim-lb-btn anim-lb-btn--close" onClick={closeLightbox} aria-label="Close">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer hints ── */}
      <footer className={`anim-footer${mounted ? " anim-footer--mounted" : ""}`}>
        <div className="anim-footer__row"><kbd>↑↓ / WS</kbd><span>SELECT</span></div>
        <div className="anim-footer__row"><kbd>↵ / F</kbd><span>FULLSCREEN</span></div>
        <div className="anim-footer__row"><kbd>ESC</kbd><span>BACK</span></div>
      </footer>

      {/* ── Back button ── */}
      <button
        className={`anim-back-btn${mounted ? " anim-back-btn--mounted" : ""}`}
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ◄ BACK
      </button>
    </div>
  );
}