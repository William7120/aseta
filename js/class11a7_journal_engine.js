/**
 * =======================================================================
 * AZOTA OS - KỶ NIỆM 11A7 (THPT TRẦN VĂN GIÀU) - 3D MEMORY SCRAPBOOK
 * Ultra-smooth 3D Double-Page Spread Journal & Interactive Class Album
 * Exclusively featuring authentic Class 11A7 memories and photos
 * =======================================================================
 */

window.Class11A7JournalEngine = (function() {
  "use strict";

  // --- Embedded Handwriting WebFont (JSC Hand) ---
  const FONT = "@font-face{font-family:JSC Hand;font-style:normal;font-weight:600;font-display:swap;" +
  "src:url(data:font/woff2;base64,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) format(\"woff2\")}";

  // --- Real Photos of Class 11A7 (THPT Trần Văn Giàu) ---
  const PHOTOS_11A7 = {
    p2494: "assets/11a7/IMG_2494.JPG", // Nữ sinh + cô giáo áo dài nhận túi quà (ngang)
    p2495: "assets/11a7/IMG_2495.JPG", // Nữ sinh + cô giáo áo dài (dọc)
    p2496: "assets/11a7/IMG_2496.JPG", // Cận cảnh nữ sinh + cô giáo (ngang)
    p2497: "assets/11a7/IMG_2497.JPG", // Góc lớp học 11A7 & trần máy chiếu (dọc)
    p2498: "assets/11a7/IMG_2498.JPG", // Cả lớp pose dáng chỉ tay cực ngầu (2560x1920)
    p2499: "assets/11a7/IMG_2499.JPG", // Cả lớp cười tươi rạng rỡ (2560x1920)
    p2500: "assets/11a7/IMG_2500.JPG", // Cả lớp giơ tay chữ V - Peace (2560x1920)
    p2501: "assets/11a7/IMG_2501.JPG", // Cả lớp pose dáng đồng đội (2560x1920)
  };

  // --- 3D Physics & Layout Constants ---
  const OPEN = 5;   // centre spread slight V at spine, deg
  const SIDE = 80;  // stacked page turn angle
  const FOLD = 174; // folding shut angle

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function spreadAspect(stageW, stageH) {
    return stageW < 640 && stageH > stageW ? 0.86 : 1.25;
  }

  function spreadWidth(stageW, stageH) {
    if (stageW <= 0 || stageH <= 0) return 0;
    const narrow = stageW < 640;
    const aspect = spreadAspect(stageW, stageH);
    const maxW = narrow ? stageW * 0.86 : stageW * 0.54;
    const maxH = (narrow ? stageH * 0.80 : stageH * 0.90) * aspect;
    return Math.round(Math.min(maxW, maxH, 980));
  }

  function poseFor(p, w) {
    const d = Math.abs(p);
    const a = d < 1 ? d : 1;
    const s = p < 0 ? -1 : 1;
    const out = d > 1 ? d - 1 : 0;
    const x = s * (a * (w * 0.5 + w * 0.03) + out * w * 0.055);
    const z = -(a * w * 0.42 + out * w * 0.06);
    const fold = a * a;
    const left = p > 0 ? OPEN + (FOLD - OPEN) * fold : OPEN + (SIDE - OPEN) * a;
    const right = p < 0 ? -(OPEN + (FOLD - OPEN) * fold) : -(OPEN + (SIDE - OPEN) * a);
    const shade = (deg) => clamp((Math.abs(deg) - OPEN) / 95, 0, 0.62);
    return {
      x,
      z,
      left,
      right,
      shadeLeft: shade(left),
      shadeRight: shade(right),
      opacity: clamp(7.2 - d, 0, 1),
      hidden: d > 7.2,
    };
  }

  function settle(pos, velocity, n) {
    return clamp(Math.round(pos + clamp(velocity * 0.18, -1.5, 1.5)), 0, Math.max(0, n - 1));
  }

  function durationFor(steps) {
    return steps <= 0 ? 0 : Math.round(560 * Math.sqrt(Math.min(steps, 12)));
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // --- Core CSS Stylesheet ---
  const CSS =
    FONT +
    `
    /* Root 3D Album Stage */
    .jsc-root {
      position: relative;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      overflow: hidden;
      background: radial-gradient(120% 80% at 50% 35%, #2a2f47 0%, #1a1c2b 60%, #11121c 100%);
      color: #f4f2ee;
      font-family: ui-rounded, 'SF Pro Rounded', 'Segoe UI', system-ui, -apple-system, sans-serif;
      outline: none;
      user-select: none;
      -webkit-user-select: none;
      container-type: inline-size;
      touch-action: pan-y;
      box-sizing: border-box;
    }
    .jsc-root *, .jsc-root *::before, .jsc-root *::after {
      box-sizing: border-box;
    }

    /* Top Navigation Header */
    .jsc-top {
      position: relative;
      width: 100%;
      padding: max(10px, 1.2cqi) max(12px, 1.6cqi) 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 20;
    }
    .jsc-group {
      display: flex;
      align-items: center;
      gap: clamp(4px, .8cqi, 8px);
      flex-shrink: 0;
    }
    .jsc-chip {
      display: grid;
      place-items: center;
      width: clamp(34px, 3.6cqi, 42px);
      height: clamp(34px, 3.6cqi, 42px);
      border-radius: 50%;
      border: 0;
      padding: 0;
      cursor: pointer;
      color: #f4f2ee;
      background: rgba(255, 255, 255, .10);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .12), 0 2px 8px rgba(0,0,0,.3);
      transition: all .2s cubic-bezier(.2,.7,.2,1);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .jsc-chip:hover {
      background: rgba(255, 255, 255, .22);
      transform: translateY(-1px);
    }
    .jsc-chip:active {
      transform: scale(.94);
    }
    .jsc-chip[aria-pressed="true"], .jsc-chip.active {
      background: linear-gradient(135deg, #f59e0b, #ec4899);
      box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, .9), 0 4px 12px rgba(245, 158, 11, .35);
      color: #fff;
    }
    .jsc-chip svg {
      width: 46%;
      height: 46%;
    }

    /* Center Header Info */
    .jsc-head {
      text-align: center;
      white-space: nowrap;
      pointer-events: none;
      flex: 1;
      min-width: 0;
      padding: 0 6px;
    }
    .jsc-title {
      margin: 0;
      font-weight: 800;
      font-size: clamp(14px, 2.2cqi, 28px);
      letter-spacing: -0.01em;
      line-height: 1.15;
      background: linear-gradient(to right, #ffffff, #fef08a, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 10px rgba(0,0,0,.4);
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .jsc-meta {
      display: inline-flex;
      align-items: center;
      gap: .4em;
      margin-top: .25em;
      font-size: clamp(9px, 1cqi, 12px);
      font-weight: 600;
      color: #cbd5e1;
      background: rgba(255, 255, 255, .08);
      padding: 1px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, .1);
    }

    /* 3D Stage & Scene */
    .jsc-stage {
      position: relative;
      margin-top: clamp(8px, 2cqi, 28px);
      touch-action: pan-y;
      cursor: grab;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
    }
    .jsc-stage[data-drag] {
      cursor: grabbing;
    }
    .jsc-floor {
      position: absolute;
      left: 50%;
      top: 50%;
      width: calc(var(--jsc-w, 600px) * 1.5);
      height: calc(var(--jsc-h, 450px) * .6);
      transform: translate(-50%, calc(var(--jsc-h, 450px) * .2));
      background: #0a0b12;
      opacity: .65;
      filter: blur(calc(var(--jsc-w, 600px) * .035));
      border-radius: calc(var(--jsc-w, 600px) * .04);
      pointer-events: none;
    }
    .jsc-view {
      position: absolute;
      inset: 0;
      perspective: calc(var(--jsc-w, 600px) * 2.3);
      perspective-origin: 50% 46%;
    }
    .jsc-scene {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 0;
      height: 0;
      transform-style: preserve-3d;
    }
    .jsc-item {
      position: absolute;
      left: 0;
      top: 0;
      transform-style: preserve-3d;
      visibility: hidden;
    }

    /* Pages & Sheets */
    .jsc-page {
      position: absolute;
      top: calc(var(--jsc-h, 450px) * -.5);
      width: calc(var(--jsc-w, 600px) * .5);
      height: var(--jsc-h, 450px);
      overflow: hidden;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      background: #efebe3;
      box-shadow: 0 1px 0 rgba(255,255,255,.35) inset, 0 8px 24px rgba(0,0,0,.3);
    }
    .jsc-page[data-side=l] {
      left: calc(var(--jsc-w, 600px) * -.5);
      transform-origin: 100% 50%;
      border-radius: calc(var(--jsc-w, 600px) * .034) 0 0 calc(var(--jsc-w, 600px) * .034);
    }
    .jsc-page[data-side=r] {
      left: 0;
      transform-origin: 0 50%;
      border-radius: 0 calc(var(--jsc-w, 600px) * .034) calc(var(--jsc-w, 600px) * .034) 0;
    }
    .jsc-sheet {
      position: absolute;
      top: 0;
      width: var(--jsc-w, 600px);
      height: var(--jsc-h, 450px);
      pointer-events: none;
    }
    .jsc-page[data-side=l] > .jsc-sheet {
      left: 0;
    }
    .jsc-page[data-side=r] > .jsc-sheet {
      left: calc(var(--jsc-w, 600px) * -.5);
    }

    .jsc-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      object-fit: cover;
      display: block;
    }
    .jsc-gutter {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .jsc-page[data-side=l] .jsc-gutter {
      background: linear-gradient(90deg, rgba(255,255,255,0) 80%, rgba(20,18,30,.08) 92%, rgba(20,18,30,.32));
    }
    .jsc-page[data-side=r] .jsc-gutter {
      background: linear-gradient(270deg, rgba(255,255,255,0) 80%, rgba(20,18,30,.08) 92%, rgba(20,18,30,.32));
    }
    .jsc-shade {
      position: absolute;
      inset: 0;
      background: #141729;
      opacity: var(--jsc-s, 0);
      pointer-events: none;
    }

    /* Polaroid Prints */
    .jsc-print {
      position: absolute;
      margin: 0;
      background: #fbfaf6;
      padding: 3% 3% 0;
      box-shadow: 0 .4em 1em rgba(18,16,30,.28), 0 .1em .2em rgba(18,16,30,.2);
      font-size: calc(var(--jsc-w, 600px) * .01);
      cursor: pointer;
      pointer-events: auto;
      transition: transform .2s ease, box-shadow .2s ease;
      will-change: transform;
      border-radius: 4px;
    }
    .jsc-print:hover {
      transform: scale(1.04) rotate(0deg) !important;
      box-shadow: 0 .8em 1.8em rgba(0,0,0,.45);
      z-index: 5;
    }
    .jsc-print img {
      display: block;
      width: 100%;
      height: auto;
      max-width: none;
      object-fit: cover;
      border-radius: 2px;
    }
    .jsc-print figcaption {
      font-family: 'JSC Hand', 'Caveat', 'Patrick Hand', 'Dancing Script', 'Segoe Print', cursive;
      font-weight: 600;
      color: #2a2c3e;
      text-align: center;
      font-size: calc(var(--jsc-w, 600px) * .024);
      line-height: 1.1;
      padding: .32em .2em .4em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .jsc-print[data-tape] {
      padding: 0;
      background: none;
    }
    .jsc-print[data-tape]::before {
      content: '';
      position: absolute;
      left: 50%;
      top: -5%;
      width: 48%;
      height: 10%;
      transform: translateX(-50%) rotate(-3deg);
      background: rgba(236, 226, 196, .85);
      box-shadow: 0 1px 3px rgba(0,0,0,.15);
      z-index: 2;
    }
    .jsc-print[data-tape] figcaption {
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1.3em;
      color: #fff;
      text-shadow: 0 1px 4px rgba(0,0,0,.75);
      font-size: calc(var(--jsc-w, 600px) * .026);
    }

    /* Handwritten Notes */
    .jsc-note {
      position: absolute;
      font-family: 'JSC Hand', 'Caveat', 'Patrick Hand', 'Dancing Script', 'Segoe Print', cursive;
      font-weight: 600;
      line-height: 1.05;
      color: #272a3f;
      cursor: pointer;
      pointer-events: auto;
      transition: transform .2s ease;
    }
    .jsc-note:hover {
      transform: scale(1.05) rotate(0deg) !important;
      z-index: 5;
    }
    .jsc-note[data-style=card] {
      background: #fbf7ee;
      padding: .65em .8em .75em;
      box-shadow: 0 .3em .9em rgba(18,16,30,.25);
      clip-path: polygon(0 3%,7% 0,18% 2%,31% 0,46% 2%,60% 0,74% 2%,88% 0,100% 2%,99% 100%,84% 98%,69% 100%,52% 98%,37% 100%,21% 98%,6% 100%,1% 97%);
    }
    .jsc-note[data-style=ink] {
      color: #1e293b;
      background: rgba(255, 255, 255, .7);
      padding: .5em .7em;
      border-radius: 8px;
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
    }
    .jsc-note b {
      display: block;
      font-weight: 700;
      font-size: calc(var(--jsc-w, 600px) * .042);
      margin-bottom: .12em;
    }
    .jsc-note span {
      display: block;
      font-size: calc(var(--jsc-w, 600px) * .025);
      line-height: 1.15;
    }

    /* Mobile Left / Right Tap Indicators */
    .jsc-tap-hint {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, .45);
      border: 1px solid rgba(255, 255, 255, .2);
      color: #fff;
      display: grid;
      place-items: center;
      cursor: pointer;
      z-index: 8;
      backdrop-filter: blur(4px);
      transition: all .2s;
    }
    .jsc-tap-hint:hover {
      background: rgba(0, 0, 0, .7);
      transform: translateY(-50%) scale(1.1);
    }
    .jsc-tap-hint[data-side=l] {
      left: max(4px, 1cqi);
    }
    .jsc-tap-hint[data-side=r] {
      right: max(4px, 1cqi);
    }

    /* Bottom Control Bar */
    .jsc-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(8px, 1.2cqi, 16px);
      padding: clamp(8px, 1.2cqi, 16px) 12px max(14px, env(safe-area-inset-bottom, 14px));
      position: relative;
      z-index: 20;
      width: 100%;
    }
    .jsc-btn {
      display: grid;
      place-items: center;
      width: clamp(36px, 3.8cqi, 46px);
      height: clamp(36px, 3.8cqi, 46px);
      border-radius: 50%;
      border: 0;
      padding: 0;
      cursor: pointer;
      color: #1e293b;
      background: #ffffff;
      box-shadow: 0 4px 14px rgba(10,12,28,.35);
      transition: transform .2s cubic-bezier(.2,.7,.2,1), background .2s;
      flex-shrink: 0;
    }
    .jsc-btn:hover {
      transform: translateY(-2px);
      background: #f8fafc;
    }
    .jsc-btn:active {
      transform: scale(.92);
    }
    .jsc-btn.primary {
      background: linear-gradient(135deg, #f59e0b, #ec4899);
      color: #fff;
      box-shadow: 0 4px 18px rgba(245, 158, 11, .4);
    }
    .jsc-btn svg {
      width: 46%;
      height: 46%;
    }

    /* Page Pill Indicator */
    .jsc-page-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, .12);
      border: 1px solid rgba(255, 255, 255, .15);
      backdrop-filter: blur(8px);
      font-size: clamp(11px, 1.1cqi, 13px);
      font-weight: 700;
      color: #ffffff;
      cursor: pointer;
      transition: background .2s;
      white-space: nowrap;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .jsc-page-pill:hover {
      background: rgba(255, 255, 255, .22);
    }

    /* Lightbox Modal */
    .jsc-lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, .88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity .25s ease;
    }
    .jsc-lightbox.open {
      opacity: 1;
      pointer-events: auto;
    }
    .jsc-lightbox-card {
      background: #fff;
      color: #1e293b;
      border-radius: 20px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 18px;
      box-shadow: 0 20px 40px rgba(0,0,0,.6);
      transform: scale(.92);
      transition: transform .25s cubic-bezier(.2,.7,.2,1);
    }
    .jsc-lightbox.open .jsc-lightbox-card {
      transform: scale(1);
    }

    /* Grid View Modal */
    .jsc-grid-modal {
      position: absolute;
      inset: 0;
      background: rgba(15, 17, 26, .96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 50;
      display: none;
      flex-direction: column;
      padding: 18px;
      overflow-y: auto;
    }
    .jsc-grid-modal.open {
      display: flex;
    }
    .jsc-grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
      margin-top: 14px;
    }
    .jsc-grid-card {
      background: rgba(255, 255, 255, .06);
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all .2s ease;
      position: relative;
    }
    .jsc-grid-card:hover, .jsc-grid-card.active {
      border-color: #f59e0b;
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(245, 158, 11, .25);
    }
    .jsc-grid-card img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }
    .jsc-grid-card-body {
      padding: 10px 12px;
    }
    .jsc-grid-card-title {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
    }
    .jsc-grid-card-page {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }

    /* Mobile specific adjustments */
    @media (max-width: 640px) {
      .jsc-top {
        padding: 8px 10px 0;
      }
      .jsc-head {
        padding: 0 4px;
      }
      .jsc-title {
        font-size: 15px;
      }
      .jsc-meta {
        font-size: 10px;
        padding: 1px 6px;
      }
      .jsc-chip {
        width: 34px;
        height: 34px;
      }
      .jsc-bar {
        gap: 6px;
        padding: 6px 8px max(10px, env(safe-area-inset-bottom, 10px));
      }
      .jsc-btn {
        width: 36px;
        height: 36px;
      }
      .jsc-page-pill {
        padding: 4px 8px;
        font-size: 11px;
        max-width: 130px;
      }
      .jsc-page-pill-full {
        display: none !important;
      }
      .jsc-page-pill-short {
        display: inline !important;
      }
      .jsc-tap-hint {
        width: 32px;
        height: 32px;
      }
      .jsc-stage {
        margin-top: 4px;
      }
      #jscFullscreenBtn {
        display: none !important;
      }
    }
    @media (min-width: 641px) {
      .jsc-page-pill-short {
        display: none !important;
      }
      .jsc-page-pill-full {
        display: inline !important;
      }
    }
    `;

  // --- SVG Icons Map ---
  function getIconSvg(name) {
    const ICON_ATTRS = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"';
    switch (name) {
      case "book":
        return `<svg ${ICON_ATTRS}><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>`;
      case "grid":
        return `<svg ${ICON_ATTRS}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
      case "sound":
        return `<svg ${ICON_ATTRS}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
      case "mute":
        return `<svg ${ICON_ATTRS}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      case "music":
        return `<svg ${ICON_ATTRS}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
      case "fullscreen":
        return `<svg ${ICON_ATTRS}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
      case "close":
        return `<svg ${ICON_ATTRS}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      case "prev":
        return `<svg ${ICON_ATTRS}><polyline points="15 18 9 12 15 6"/></svg>`;
      case "next":
        return `<svg ${ICON_ATTRS}><polyline points="9 18 15 12 9 6"/></svg>`;
      case "play":
        return `<svg ${ICON_ATTRS}><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
      case "pause":
        return `<svg ${ICON_ATTRS}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
      case "add":
        return `<svg ${ICON_ATTRS}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
      default:
        return `<svg ${ICON_ATTRS}><circle cx="12" cy="12" r="10"/></svg>`;
    }
  }

  // --- Web Audio API Synthesizers ---
  let audioCtx = null;
  let soundEnabled = true;
  let musicEnabled = false;
  let musicInterval = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playPageFlipSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.14);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(550, now + 0.11);
      filter.Q.value = 2.4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.13);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  function playLoFiSchoolChord(freqs, duration = 2.2) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (e) {}
  }

  function toggleMusic(force) {
    musicEnabled = force !== undefined ? force : !musicEnabled;
    const btn = document.getElementById("jscMusicBtn");
    if (btn) {
      btn.classList.toggle("active", musicEnabled);
      btn.title = musicEnabled ? "Tắt nhạc học trò" : "Bật nhạc học trò du dương";
    }
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
    if (musicEnabled) {
      getAudioContext();
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [196.00, 246.94, 293.66, 392.00], // G
        [220.00, 261.63, 329.63, 440.00], // Am7
        [174.61, 220.00, 261.63, 349.23], // F
      ];
      let step = 0;
      playLoFiSchoolChord(chords[0]);
      musicInterval = setInterval(() => {
        step = (step + 1) % chords.length;
        playLoFiSchoolChord(chords[step]);
      }, 2600);
    }
  }

  // --- Real Class 11A7 Spreads Builder (Exclusively Real Photos) ---
  function build11A7Spreads() {
    const P = PHOTOS_11A7;

    return [
      // Trang 0: Bìa Sổ Lưu Bút 11A7
      {
        id: "spread-0",
        label: "Bìa Lưu Bút 11A7",
        paper: "#1b1f33",
        prints: [
          { src: P.p2500, x: 26, y: 12, w: 48, rotate: -1, caption: "Tập thể 11A7 • THPT Trần Văn Giàu ✨" }
        ],
        notes: [
          {
            x: 16,
            y: 64,
            w: 68,
            rotate: 1,
            style: "card",
            title: "LƯU BÚT THANH XUÂN 11A7",
            body: "Sĩ số: 41 thành viên • Niên khóa 2025 – 2027 • Nơi lưu giữ những nụ cười, kỷ niệm và tình bạn đẹp nhất của tuổi 17."
          }
        ]
      },

      // Trang 1: Gia Đình 11A7 — Đại Bản Doanh Lớp Học
      {
        id: "spread-1",
        label: "Gia Đình 11A7",
        paper: "#f7f4ed",
        prints: [
          { src: P.p2498, x: 6, y: 10, w: 38, rotate: -3, caption: "11A7 Điểm Danh — SS 41/41 🔥" },
          { src: P.p2499, x: 55, y: 10, w: 39, rotate: 3, caption: "Nụ Cười Rạng Rỡ 11A7 ✨", tape: true }
        ],
        notes: [
          {
            x: 6,
            y: 65,
            w: 38,
            rotate: 1,
            style: "card",
            title: "Đại Bản Doanh 11A7",
            body: "Muốn biết phải hỏi, muốn giỏi phải học. Phòng học thân quen, bảng đen phấn trắng và 41 người bạn tuyệt vời!"
          },
          {
            x: 55,
            y: 65,
            w: 39,
            rotate: -2,
            style: "card",
            title: "Chân - Thiện - Mỹ",
            body: "Nụ cười rạng rỡ của cả lớp. Dù bài vở có nhiều, cứ bên nhau là ngập tràn niềm vui!"
          }
        ]
      },

      // Trang 2: Những Bông Hoa 11A7 & Cô Chủ Nhiệm
      {
        id: "spread-2",
        label: "Những Bông Hoa 11A7",
        paper: "#fcf4f0",
        prints: [
          { src: P.p2495, x: 8, y: 8, w: 34, rotate: -4, caption: "Những đóa hoa 11A7 🌸" },
          { src: P.p2494, x: 54, y: 12, w: 40, rotate: 4, caption: "Món quà nhỏ - Niềm vui to 🎁", tape: true }
        ],
        notes: [
          {
            x: 8,
            y: 64,
            w: 38,
            rotate: 1,
            style: "card",
            title: "Cô Chủ Nhiệm & Phái Đẹp",
            body: "Cô chủ nhiệm dịu dàng trong tà áo dài truyền thống bên các bạn nữ sinh 11A7. Cảm ơn Cô vì đã luôn yêu thương tụi con!"
          },
          {
            x: 55,
            y: 66,
            w: 39,
            rotate: -1,
            style: "ink",
            title: "Yêu thương trao gửi",
            body: "Từng túi quà trao tay, từng lời chúc ấm áp. Những nụ cười tươi thắm nhất của lớp mình!"
          }
        ]
      },

      // Trang 3: Khoảnh Khắc Lớp Học & Trao Quà Ý Nghĩa
      {
        id: "spread-3",
        label: "Kỷ Niệm Lớp Học",
        paper: "#f5efe5",
        prints: [
          { src: P.p2497, x: 8, y: 8, w: 34, rotate: -3, caption: "Lớp học thân thương 🏫" },
          { src: P.p2496, x: 54, y: 10, w: 40, rotate: 3, caption: "Check-in cùng Cô ✨", tape: true }
        ],
        notes: [
          {
            x: 7,
            y: 64,
            w: 38,
            rotate: 2,
            style: "card",
            title: "Mỗi Ngày Đến Trường",
            body: "Bàn ghế gỗ, chiếc máy chiếu và bảng xanh thân quen. Nơi bắt đầu của biết bao kỷ niệm đẹp!"
          },
          {
            x: 55,
            y: 64,
            w: 39,
            rotate: -2,
            style: "card",
            title: "Khoảnh Khắc Đáng Nhớ",
            body: "Cả lớp cùng chuẩn bị, cùng chụp ảnh, cùng lưu giữ khoảnh khắc thanh xuân không thể nào phai."
          }
        ]
      },

      // Trang 4: Biệt Đội Siêu Quậy & 'Pose Dáng Bất Hủ'
      {
        id: "spread-4",
        label: "Pose Dáng Cực Ngầu",
        paper: "#eef2f7",
        prints: [
          { src: P.p2498, x: 6, y: 10, w: 40, rotate: -4, caption: "Biệt Đội 11A7 Xuất Kích ⚡" },
          { src: P.p2501, x: 54, y: 10, w: 40, rotate: 3, caption: "Đồng đội bất diệt 🤝", tape: true }
        ],
        notes: [
          {
            x: 6,
            y: 64,
            w: 38,
            rotate: 1,
            style: "card",
            title: "Pose Dáng Bất Hủ",
            body: "Các bạn nam ngồi bệt sàn lớp học, cả lớp đồng thanh chỉ tay tạo dáng. Bức ảnh độc quyền của 11A7!"
          },
          {
            x: 55,
            y: 64,
            w: 39,
            rotate: -2,
            style: "card",
            title: "Bách Chiến Bách Thắng",
            body: "Đoàn kết là sức mạnh. Dù học tập hay phong trào, 11A7 luôn kề vai sát cánh!"
          }
        ]
      },

      // Trang 5: Chữ V Chiến Thắng — Nụ Cười Tuổi 17
      {
        id: "spread-5",
        label: "Chữ V Quyết Tâm",
        paper: "#fcf8ee",
        prints: [
          { src: P.p2500, x: 6, y: 10, w: 40, rotate: -3, caption: "Peace & Love 11A7 ✌️" },
          { src: P.p2499, x: 54, y: 10, w: 40, rotate: 4, caption: "Thanh xuân rạng rỡ 🌟", tape: true }
        ],
        notes: [
          {
            x: 6,
            y: 64,
            w: 38,
            rotate: 1,
            style: "card",
            title: "Chữ V Niềm Tin",
            body: "Mỗi ngón tay chữ V là một lời hứa: Quyết tâm 9+ môn thi, cùng nhau chạm tay vào cánh cổng đại học mơ ước!"
          },
          {
            x: 55,
            y: 64,
            w: 39,
            rotate: -1,
            style: "ink",
            title: "Năm Tháng Rực Rỡ",
            body: "Cảm ơn vì đã là một phần thanh xuân của nhau. 11A7 sẽ mãi là ký ức đẹp nhất."
          }
        ]
      },

      // Trang 6: Đoàn Kết Là Sức Mạnh 11A7
      {
        id: "spread-6",
        label: "Tinh Thần Đồng Đội",
        paper: "#f6f1e6",
        prints: [
          { src: P.p2494, x: 6, y: 10, w: 39, rotate: -4, caption: "Nụ cười ngày vui 🌸" },
          { src: P.p2501, x: 54, y: 10, w: 40, rotate: 3, caption: "Chiến binh 11A7 💥", tape: true }
        ],
        notes: [
          {
            x: 6,
            y: 64,
            w: 38,
            rotate: 2,
            style: "card",
            title: "Giờ Ra Chơi & Tiếng Cười",
            body: "Những buổi giải lao rộn rã, chia nhau từng gói bánh, cùng nhau giải bài tập khó. Có lớp mình là vui nhất!"
          },
          {
            x: 55,
            y: 64,
            w: 39,
            rotate: -2,
            style: "card",
            title: "Mái Nhà Thứ Hai",
            body: "Dù mai này trưởng thành, mỗi đứa một phương trời, 11A7 mãi mãi là mái nhà ấm áp chào đón các bạn trở về."
          }
        ]
      },

      // Trang 7: Bức Tường Lưu Bút 11A7 & Chữ Ký Kỷ Niệm
      {
        id: "spread-7",
        label: "Lưu Bút & Lời Hứa",
        paper: "#ede5d8",
        prints: [
          { src: P.p2500, x: 6, y: 9, w: 38, rotate: -3, caption: "11A7 Mãi Mãi Một Gia Đình ❤️" },
          { src: P.p2495, x: 56, y: 8, w: 34, rotate: 4, caption: "Thanh xuân 11A7 rực rỡ ✨", tape: true }
        ],
        notes: [
          {
            x: 6,
            y: 62,
            w: 38,
            rotate: 1,
            style: "card",
            title: "Lưu Bút Tuổi 17",
            body: "Hãy viết tiếp những dòng lưu bút của bạn vào trang sổ này bằng nút [ + Viết lưu bút ] phía dưới nhé!"
          },
          {
            x: 55,
            y: 62,
            w: 40,
            rotate: -2,
            style: "card",
            title: "Hẹn Ước Tương Lai",
            body: "Chúc 41 thành viên 11A7 THPT Trần Văn Giàu luôn giữ vững nụ cười trên môi và thành công rực rỡ!"
          }
        ]
      }
    ];
  }

  // --- Engine State ---
  let spreads = [];
  let currentIndex = 0;
  let targetIndex = 0;
  let stageWidth = 0;
  let currentPos = 0;
  let tween = null;
  let rafId = 0;
  let dragData = null;
  let autoPlayTimer = null;
  let isAutoPlaying = false;
  let isInitialized = false;
  let containerEl = null;

  let rootEl = null;
  let stageEl = null;
  let itemsList = [];
  let pagesList = [];

  const STORAGE_KEY = "aseta_11a7_custom_memories_v1";

  function loadCustomMemories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomMemory(note) {
    try {
      const list = loadCustomMemories();
      list.push(note);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      mergeCustomMemories();
      renderSheets();
      paint();
      return true;
    } catch (e) {
      return false;
    }
  }

  function mergeCustomMemories() {
    const customs = loadCustomMemories();
    customs.forEach((mem) => {
      const spreadIdx = clamp(mem.spreadIndex ?? 0, 0, spreads.length - 1);
      const targetSpread = spreads[spreadIdx];
      if (targetSpread) {
        if (!targetSpread.notes) targetSpread.notes = [];
        const exists = targetSpread.notes.some(n => n.id === mem.id);
        if (!exists) {
          targetSpread.notes.push({
            id: mem.id,
            x: mem.x ?? 54,
            y: mem.y ?? 35,
            w: mem.w ?? 38,
            rotate: mem.rotate ?? -2,
            style: mem.style ?? "card",
            title: mem.title,
            body: mem.body + (mem.author ? " — " + mem.author : ""),
            author: mem.author,
            isCustom: true
          });
        }
      }
    });
  }

  function paint() {
    const w = stageWidth;
    if (!w || !itemsList.length) return;

    for (let i = 0; i < itemsList.length; i++) {
      const el = itemsList[i];
      if (!el) continue;
      const q = poseFor(i - currentPos, w);
      if (q.hidden) {
        el.style.visibility = "hidden";
        continue;
      }
      el.style.visibility = "visible";
      el.style.opacity = String(q.opacity);
      el.style.transform = `translate3d(${q.x.toFixed(2)}px, 0, ${q.z.toFixed(2)}px)`;

      const l = pagesList[i * 2];
      const r = pagesList[i * 2 + 1];
      if (l) {
        l.style.transform = `rotateY(${q.left.toFixed(2)}deg)`;
        l.style.setProperty("--jsc-s", q.shadeLeft.toFixed(3));
      }
      if (r) {
        r.style.transform = `rotateY(${q.right.toFixed(2)}deg)`;
        r.style.setProperty("--jsc-s", q.shadeRight.toFixed(3));
      }
    }
  }

  function frameLoop(t) {
    rafId = 0;
    if (tween) {
      const k = tween.dur > 0 ? clamp((t - tween.t0) / tween.dur, 0, 1) : 1;
      currentPos = tween.from + (tween.to - tween.from) * tween.ease(k);
      if (k >= 1) {
        tween = null;
      }
    }
    paint();
    if (tween) {
      rafId = requestAnimationFrame(frameLoop);
    }
  }

  function kick() {
    if (!rafId) {
      rafId = requestAnimationFrame(frameLoop);
    }
  }

  function goTo(to, ease = easeInOut) {
    const n = spreads.length;
    const next = clamp(to, 0, Math.max(0, n - 1));
    const changed = next !== targetIndex;
    targetIndex = next;
    currentIndex = next;

    if (changed) {
      playPageFlipSound();
      updateHeaderPill();
    }

    const dur = durationFor(Math.abs(next - currentPos));
    tween = {
      from: currentPos,
      to: next,
      t0: performance.now(),
      dur,
      ease
    };
    kick();
  }

  function updateHeaderPill() {
    const pillFull = document.getElementById("jscPagePillFull");
    const pillShort = document.getElementById("jscPagePillShort");
    const metaEl = document.getElementById("jscMetaLabel");
    const n = spreads.length;
    const currentSpread = spreads[currentIndex];
    const fullText = `Trang ${currentIndex + 1} / ${n} • ${currentSpread ? currentSpread.label : ""}`;
    const shortText = `Trang ${currentIndex + 1} / ${n}`;
    if (pillFull) pillFull.textContent = fullText;
    if (pillShort) pillShort.textContent = shortText;
    if (metaEl) metaEl.textContent = `${currentIndex + 1} / ${n}`;
  }

  function onPointerDown(e) {
    if (e.button !== 0 || spreads.length < 1) return;
    tween = null;
    dragData = {
      id: e.pointerId,
      x: e.clientX,
      from: currentPos,
      lastX: e.clientX,
      lastT: e.timeStamp,
      v: 0,
      moved: false
    };
  }

  function onPointerMove(e) {
    if (!dragData || dragData.id !== e.pointerId || !stageWidth) return;
    const dx = e.clientX - dragData.x;
    if (!dragData.moved && Math.abs(dx) > 6) {
      dragData.moved = true;
      if (stageEl) stageEl.setAttribute("data-drag", "");
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
    if (!dragData.moved) return;
    const dt = Math.max(1, e.timeStamp - dragData.lastT);
    dragData.v = dragData.v * 0.6 + (-(e.clientX - dragData.lastX) / (stageWidth * 0.42) / (dt / 1000)) * 0.4;
    dragData.lastX = e.clientX;
    dragData.lastT = e.timeStamp;
    currentPos = clamp(dragData.from - dx / (stageWidth * 0.42), -0.3, spreads.length - 0.7);
    kick();
  }

  function onPointerUp(e) {
    if (!dragData || dragData.id !== e.pointerId) return;
    const moved = dragData.moved;
    const v = dragData.v;
    dragData = null;
    if (stageEl) stageEl.removeAttribute("data-drag");

    if (moved) {
      goTo(settle(currentPos, v, spreads.length), easeOut);
      return;
    }

    const stageRect = stageEl ? stageEl.getBoundingClientRect() : null;
    if (stageRect) {
      const relX = e.clientX - stageRect.left;
      if (relX < stageRect.width * 0.25) {
        goTo(currentIndex - 1);
        return;
      } else if (relX > stageRect.width * 0.75) {
        goTo(currentIndex + 1);
        return;
      }
    }
  }

  function onWheel(e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    if (Math.abs(e.deltaX) < 30) return;
    goTo(targetIndex + (e.deltaX > 0 ? 1 : -1));
  }

  function onKeyDown(e) {
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      goTo(targetIndex + 1);
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      goTo(targetIndex - 1);
      e.preventDefault();
    } else if (e.key === "Home") {
      goTo(0);
      e.preventDefault();
    } else if (e.key === "End") {
      goTo(spreads.length - 1);
      e.preventDefault();
    } else if (e.key === "Escape") {
      closeModal();
    }
  }

  function toggleAutoPlay(force) {
    isAutoPlaying = force !== undefined ? force : !isAutoPlaying;
    const btn = document.getElementById("jscAutoPlayBtn");
    if (btn) {
      btn.innerHTML = getIconSvg(isAutoPlaying ? "pause" : "play");
      btn.title = isAutoPlaying ? "Tạm dừng tự động lật" : "Tự động lật trang";
      btn.classList.toggle("primary", isAutoPlaying);
    }
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
    if (isAutoPlaying) {
      autoPlayTimer = setInterval(() => {
        if (dragData) return;
        goTo(targetIndex >= spreads.length - 1 ? 0 : targetIndex + 1);
      }, 3200);
    }
  }

  function toggleFullscreen() {
    const el = containerEl || document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  function toggleGrid(force) {
    const gridModal = document.getElementById("jscGridModal");
    if (!gridModal) return;
    const isOpen = force !== undefined ? force : !gridModal.classList.contains("open");
    gridModal.classList.toggle("open", isOpen);

    if (isOpen) {
      renderGridContent();
    }
  }

  function renderGridContent() {
    const container = document.getElementById("jscGridContainer");
    if (!container) return;
    container.innerHTML = spreads.map((s, idx) => {
      const thumb = (s.prints && s.prints[0] ? s.prints[0].src : "") || s.image || "";
      return `
        <div class="jsc-grid-card ${idx === currentIndex ? 'active' : ''}" onclick="window.Class11A7JournalEngine.goTo(${idx}); window.Class11A7JournalEngine.toggleGrid(false);">
          ${thumb ? `<img src="${thumb}" alt="${s.label}" loading="lazy"/>` : `<div style="height:120px; background:${s.paper || '#2b304a'}; display:flex; align-items:center; justify-content:center; font-size:28px;">📖</div>`}
          <div class="jsc-grid-card-body">
            <div class="jsc-grid-card-title">${s.label || "Trang " + (idx + 1)}</div>
            <div class="jsc-grid-card-page">Kỷ niệm ${idx + 1} / ${spreads.length}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  function openLightbox(item) {
    const modal = document.getElementById("jscLightboxModal");
    const content = document.getElementById("jscLightboxContent");
    if (!modal || !content) return;

    if (item.type === "print") {
      content.innerHTML = `
        <div style="position:relative;">
          <img src="${item.src}" alt="" style="width:100%; max-height:65vh; object-fit:contain; border-radius:12px; display:block; margin:0 auto;"/>
          ${item.caption ? `<p style="font-family:'JSC Hand',cursive; font-size:24px; text-align:center; margin-top:14px; color:#1e293b; font-weight:700;">${item.caption}</p>` : ""}
          <div style="display:flex; justify-content:center; gap:12px; margin-top:16px;">
            <a href="${item.src}" download target="_blank" class="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800">
              📥 Tải ảnh gốc 11A7
            </a>
            <button type="button" class="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-pink-600" onclick="this.innerHTML='❤️ Đã thả tim!';">
              ❤️ Thả tim ảnh
            </button>
          </div>
        </div>
      `;
    } else if (item.type === "note") {
      content.innerHTML = `
        <div style="font-family:'JSC Hand',cursive; padding:12px 6px;">
          ${item.title ? `<h3 style="font-size:28px; font-weight:700; color:#0f172a; margin-bottom:8px;">${item.title}</h3>` : ""}
          <p style="font-size:20px; line-height:1.4; color:#334155; white-space:pre-line;">${item.body}</p>
          ${item.author ? `<p style="font-size:18px; color:#e11d48; text-align:right; margin-top:14px; font-weight:700;">— ${item.author}</p>` : ""}
          <div style="display:flex; justify-content:center; gap:12px; margin-top:20px; font-family:sans-serif;">
            <button type="button" class="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-pink-600" onclick="this.innerHTML='❤️ Cảm ơn bạn!';">
              ❤️ Yêu thích lưu bút
            </button>
          </div>
        </div>
      `;
    }

    modal.classList.add("open");
  }

  function closeLightbox() {
    const modal = document.getElementById("jscLightboxModal");
    if (modal) modal.classList.remove("open");
  }

  function openAddMemoryModal() {
    const modal = document.getElementById("jscAddMemoryModal");
    if (!modal) return;
    const select = document.getElementById("jscAddSpreadSelect");
    if (select) {
      select.innerHTML = spreads.map((s, idx) => `
        <option value="${idx}" ${idx === currentIndex ? "selected" : ""}>${s.label || "Trang " + (idx + 1)}</option>
      `).join("");
    }
    modal.style.display = "flex";
  }

  function closeAddMemoryModal() {
    const modal = document.getElementById("jscAddMemoryModal");
    if (modal) modal.style.display = "none";
  }

  function submitAddMemory() {
    const titleInput = document.getElementById("jscMemoryTitle");
    const bodyInput = document.getElementById("jscMemoryBody");
    const authorInput = document.getElementById("jscMemoryAuthor");
    const spreadSelect = document.getElementById("jscAddSpreadSelect");
    const styleSelect = document.getElementById("jscMemoryStyle");

    const title = titleInput ? titleInput.value.trim() : "";
    const body = bodyInput ? bodyInput.value.trim() : "";
    const author = authorInput ? authorInput.value.trim() : "Thành viên 11A7";
    const spreadIndex = spreadSelect ? parseInt(spreadSelect.value, 10) : currentIndex;
    const style = styleSelect ? styleSelect.value : "card";

    if (!body) {
      alert("Vui lòng nhập nội dung lưu bút kỷ niệm!");
      return;
    }

    const newNote = {
      id: "note-" + Date.now(),
      spreadIndex,
      title: title || "Kỷ niệm viết tay",
      body,
      author,
      style,
      x: 54,
      y: 25 + Math.floor(Math.random() * 25),
      w: 40,
      rotate: -3 + Math.floor(Math.random() * 6)
    };

    saveCustomMemory(newNote);
    closeAddMemoryModal();

    if (titleInput) titleInput.value = "";
    if (bodyInput) bodyInput.value = "";

    goTo(spreadIndex);

    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  function renderSheets() {
    const scene = document.getElementById("jscScene");
    if (!scene) return;

    itemsList = [];
    pagesList = [];

    scene.innerHTML = spreads.map((s, i) => `
      <div class="jsc-item" data-i="${i}" role="group" aria-label="${s.label || 'Spread ' + (i + 1)}">
        ${s.alt ? `<span class="sr-only">${s.alt}</span>` : ""}
        <div class="jsc-page" data-side="l">
          <div class="jsc-sheet" style="background:${s.paper || '#efebe3'};">
            ${s.image ? `<img class="jsc-bg" src="${s.image}" alt="" draggable="false" decoding="async"/>` : ""}
            ${renderPrints(s.prints, i)}
            ${renderNotes(s.notes, i)}
          </div>
          <div class="jsc-gutter"></div>
          <div class="jsc-shade"></div>
        </div>
        <div class="jsc-page" data-side="r">
          <div class="jsc-sheet" style="background:${s.paper || '#efebe3'};">
            ${s.image ? `<img class="jsc-bg" src="${s.image}" alt="" draggable="false" decoding="async"/>` : ""}
            ${renderPrints(s.prints, i)}
            ${renderNotes(s.notes, i)}
          </div>
          <div class="jsc-gutter"></div>
          <div class="jsc-shade"></div>
        </div>
      </div>
    `).join("");

    const itemEls = scene.querySelectorAll(".jsc-item");
    itemEls.forEach((el, idx) => {
      itemsList[idx] = el;
      const pages = el.querySelectorAll(".jsc-page");
      pagesList[idx * 2] = pages[0];
      pagesList[idx * 2 + 1] = pages[1];
    });
  }

  function renderPrints(prints, spreadIdx) {
    if (!prints || !prints.length) return "";
    return prints.map((p, k) => `
      <figure class="jsc-print" ${p.tape ? 'data-tape=""' : ''}
        style="left:${p.x}%; top:${p.y}%; width:${p.w}%; transform:rotate(${p.rotate || 0}deg);"
        onclick="event.stopPropagation(); window.Class11A7JournalEngine.openLightbox({type:'print', src:'${p.src}', caption:'${p.caption || ''}'});">
        <img src="${p.src}" alt="" draggable="false" decoding="async"/>
        ${p.caption ? `<figcaption>${p.caption}</figcaption>` : ""}
      </figure>
    `).join("");
  }

  function renderNotes(notes, spreadIdx) {
    if (!notes || !notes.length) return "";
    return notes.map((t, k) => `
      <div class="jsc-note" data-style="${t.style || 'card'}"
        style="left:${t.x}%; top:${t.y}%; width:${t.w}%; transform:rotate(${t.rotate || 0}deg);"
        onclick="event.stopPropagation(); window.Class11A7JournalEngine.openLightbox({type:'note', title:'${t.title || ''}', body:'${t.body || ''}', author:'${t.author || ''}'});">
        ${t.title ? `<b>${t.title}</b>` : ""}
        ${t.body ? `<span>${t.body}</span>` : ""}
      </div>
    `).join("");
  }

  function measureAndResize() {
    if (!stageEl || !rootEl) return;
    const rect = stageEl.getBoundingClientRect();
    const sw = rect.width;
    const sh = rect.height;
    if (sw <= 0 || sh <= 0) return;

    const w = spreadWidth(sw, sh);
    const aspect = spreadAspect(sw, sh);
    const h = Math.round(w / aspect);

    stageWidth = w;
    rootEl.style.setProperty("--jsc-w", w + "px");
    rootEl.style.setProperty("--jsc-h", h + "px");

    paint();
  }

  async function init() {
    if (isInitialized) return;
    containerEl = document.getElementById("class11A7Modal");
    if (!containerEl) return;

    spreads = build11A7Spreads();
    mergeCustomMemories();

    containerEl.innerHTML = `
      <div class="jsc-root" id="jscRoot">
        <style>${CSS}</style>

        <!-- TOP BAR (Never overflows on mobile) -->
        <div class="jsc-top">
          <div class="jsc-group">
            <button type="button" class="jsc-chip active" id="jscSpreadViewBtn" title="Xem dạng lật sách 3D" onclick="window.Class11A7JournalEngine.toggleGrid(false)">
              ${getIconSvg("book")}
            </button>
            <button type="button" class="jsc-chip" id="jscGridViewBtn" title="Xem danh sách tất cả các trang" onclick="window.Class11A7JournalEngine.toggleGrid(true)">
              ${getIconSvg("grid")}
            </button>
            <button type="button" class="jsc-chip hidden sm:grid" id="jscSoundBtn" title="Bật/Tắt âm thanh lật giấy" onclick="window.Class11A7JournalEngine.toggleAudio()">
              ${getIconSvg("sound")}
            </button>
          </div>

          <div class="jsc-head">
            <h2 class="jsc-title">Lưu Bút & Kỷ Niệm 11A7</h2>
            <div class="jsc-meta">
              <span id="jscMetaLabel">1 / ${spreads.length}</span> • THPT Trần Văn Giàu
            </div>
          </div>

          <div class="jsc-group">
            <button type="button" class="jsc-chip" id="jscMusicBtn" title="Bật/Tắt nhạc nền học trò" onclick="window.Class11A7JournalEngine.toggleMusic()">
              ${getIconSvg("music")}
            </button>
            <button type="button" class="jsc-chip" id="jscFullscreenBtn" title="Toàn màn hình" onclick="window.Class11A7JournalEngine.toggleFullscreen()">
              ${getIconSvg("fullscreen")}
            </button>
            <button type="button" class="jsc-chip" title="Đóng sổ kỷ niệm" onclick="window.Class11A7JournalEngine.closeModal()">
              ${getIconSvg("close")}
            </button>
          </div>
        </div>

        <!-- 3D STAGE -->
        <div class="jsc-stage" id="jscStage">
          <div class="jsc-floor"></div>

          <!-- Mobile Left & Right Tap Navigation Hints -->
          <button type="button" class="jsc-tap-hint" data-side="l" title="Trang trước" onclick="event.stopPropagation(); window.Class11A7JournalEngine.goTo(window.Class11A7JournalEngine.getCurrentIndex() - 1);">
            ${getIconSvg("prev")}
          </button>
          <button type="button" class="jsc-tap-hint" data-side="r" title="Trang sau" onclick="event.stopPropagation(); window.Class11A7JournalEngine.goTo(window.Class11A7JournalEngine.getCurrentIndex() + 1);">
            ${getIconSvg("next")}
          </button>

          <!-- 3D Perspective Viewport -->
          <div class="jsc-view">
            <div class="jsc-scene" id="jscScene"></div>
          </div>
        </div>

        <!-- BOTTOM CONTROLS BAR (Mobile balanced) -->
        <div class="jsc-bar">
          <button type="button" class="jsc-btn" title="Trang trước" onclick="window.Class11A7JournalEngine.goTo(window.Class11A7JournalEngine.getCurrentIndex() - 1)">
            ${getIconSvg("prev")}
          </button>

          <div class="jsc-page-pill" id="jscPagePill" onclick="window.Class11A7JournalEngine.toggleGrid(true)" title="Xem nhanh tất cả các trang">
            <span id="jscPagePillFull" class="jsc-page-pill-full">Trang 1 / ${spreads.length} • Bìa Lưu Bút 11A7</span>
            <span id="jscPagePillShort" class="jsc-page-pill-short">Trang 1 / ${spreads.length}</span>
          </div>

          <button type="button" class="jsc-btn primary" id="jscAutoPlayBtn" title="Tự động lật trang" onclick="window.Class11A7JournalEngine.toggleAutoPlay()">
            ${getIconSvg("play")}
          </button>

          <button type="button" class="jsc-btn" title="Viết lưu bút mới" onclick="window.Class11A7JournalEngine.openAddMemoryModal()">
            ${getIconSvg("add")}
          </button>

          <button type="button" class="jsc-btn" title="Trang sau" onclick="window.Class11A7JournalEngine.goTo(window.Class11A7JournalEngine.getCurrentIndex() + 1)">
            ${getIconSvg("next")}
          </button>
        </div>

        <!-- GRID OVERVIEW MODAL -->
        <div class="jsc-grid-modal" id="jscGridModal">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>📖 Toàn Bộ Trang Kỷ Niệm 11A7</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">8 Trang Đôi</span>
              </h3>
              <p class="text-xs text-slate-400">Chạm vào trang bất kỳ để lật nhanh tới kỷ niệm đó</p>
            </div>
            <button type="button" class="jsc-chip" onclick="window.Class11A7JournalEngine.toggleGrid(false)">
              ${getIconSvg("close")}
            </button>
          </div>
          <div class="jsc-grid-container" id="jscGridContainer"></div>
        </div>

        <!-- LIGHTBOX MODAL (Tap on photos/notes) -->
        <div class="jsc-lightbox" id="jscLightboxModal" onclick="window.Class11A7JournalEngine.closeLightbox()">
          <div class="jsc-lightbox-card" onclick="event.stopPropagation()">
            <div class="flex justify-end mb-2">
              <button type="button" class="p-1 rounded-full text-slate-400 hover:text-slate-800" onclick="window.Class11A7JournalEngine.closeLightbox()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div id="jscLightboxContent"></div>
          </div>
        </div>

        <!-- ADD MEMORY MODAL -->
        <div id="jscAddMemoryModal" style="display:none;" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div class="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden p-5 sm:p-6 text-white space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-pink-500/25">
                  ✍️
                </div>
                <div>
                  <h3 class="text-base font-black text-white">Viết Lưu Bút 11A7</h3>
                  <p class="text-xs text-slate-400">Ghim lời chúc hoặc kỷ niệm của bạn lên cuốn sổ lớp</p>
                </div>
              </div>
              <button type="button" class="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white" onclick="window.Class11A7JournalEngine.closeAddMemoryModal()">
                ✕
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-slate-300 mb-1">Ghim vào trang kỷ niệm:</label>
                <select id="jscAddSpreadSelect" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"></select>
              </div>

              <div>
                <label class="block font-bold text-slate-300 mb-1">Tiêu đề mẩu giấy (hoặc chủ đề):</label>
                <input type="text" id="jscMemoryTitle" placeholder="Ví dụ: Gửi 11A7 yêu dấu..." class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"/>
              </div>

              <div>
                <label class="block font-bold text-slate-300 mb-1">Lời nhắn / Kỷ niệm viết tay:</label>
                <textarea id="jscMemoryBody" rows="4" placeholder="Nhập lời chúc, tâm sự hoặc kỷ niệm đáng nhớ của bạn với lớp 11A7..." class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-slate-300 mb-1">Tên bạn (hoặc biệt danh):</label>
                  <input type="text" id="jscMemoryAuthor" placeholder="Ví dụ: Bảo Trân 11A7" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"/>
                </div>
                <div>
                  <label class="block font-bold text-slate-300 mb-1">Phong cách giấy:</label>
                  <select id="jscMemoryStyle" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400">
                    <option value="card">Giấy xé Vintage 📜</option>
                    <option value="ink">Mực xanh dịu trên nền trắng ✒️</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="pt-2 flex justify-end gap-2.5">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300" onclick="window.Class11A7JournalEngine.closeAddMemoryModal()">
                Hủy bỏ
              </button>
              <button type="button" class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-95" onclick="window.Class11A7JournalEngine.submitAddMemory()">
                Ghim Lên Sổ 📌
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    rootEl = document.getElementById("jscRoot");
    stageEl = document.getElementById("jscStage");

    stageEl.addEventListener("pointerdown", onPointerDown);
    stageEl.addEventListener("pointermove", onPointerMove);
    stageEl.addEventListener("pointerup", onPointerUp);
    stageEl.addEventListener("pointercancel", onPointerUp);
    stageEl.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    const ro = new ResizeObserver(() => {
      measureAndResize();
    });
    ro.observe(stageEl);

    renderSheets();
    measureAndResize();
    updateHeaderPill();

    isInitialized = true;
  }

  function toggleAudio() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById("jscSoundBtn");
    if (btn) {
      btn.innerHTML = getIconSvg(soundEnabled ? "sound" : "mute");
      btn.title = soundEnabled ? "Tắt âm thanh" : "Bật âm thanh";
      btn.classList.toggle("active", soundEnabled);
    }
  }

  function openModal(startIndex = 0) {
    init().then(() => {
      if (containerEl) {
        containerEl.style.display = "flex";
        containerEl.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        setTimeout(() => {
          measureAndResize();
          goTo(startIndex);
        }, 60);
      }
    });
  }

  function closeModal() {
    if (containerEl) {
      containerEl.style.display = "none";
      containerEl.classList.add("hidden");
      document.body.style.overflow = "";
      if (isAutoPlaying) toggleAutoPlay(false);
      if (musicEnabled) toggleMusic(false);
    }
  }

  return {
    init,
    openModal,
    closeModal,
    goTo,
    getCurrentIndex: () => currentIndex,
    toggleAutoPlay,
    toggleAudio,
    toggleMusic,
    toggleFullscreen,
    toggleGrid,
    openLightbox,
    closeLightbox,
    openAddMemoryModal,
    closeAddMemoryModal,
    submitAddMemory
  };
})();
