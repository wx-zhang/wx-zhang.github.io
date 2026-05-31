/* ==========================================================================
   dTRPO Teaser Animation
   Trajectory probability calculation
   ========================================================================== */

(function () {
  "use strict";

  const BLUE = "#004EA2";
  const BLUE_LIGHT = "#5b9bd5";
  const GRAY = "#bbb";
  const GRAY_DARK = "#888";
  const GREEN = "#2d8a4e";
  const RED = "#d32f2f";
  const ORANGE = "#e67e22";
  const BG = "#f8f8f8";
  const MASK_COLOR = "#ddd";

  const TOKENS = ["The", "cat", "sat", "on", "the", "mat", "and", "purr"];
  const BLOCK_SIZE = 4;

  let speed = 1;
  let animRunning = false;
  let animTimers = [];

  /* ---- Utility ---- */
  function clearTimers() {
    animTimers.forEach(t => clearTimeout(t));
    animTimers = [];
    animRunning = false;
  }

  function schedule(fn, delay) {
    const t = setTimeout(fn, delay / speed);
    animTimers.push(t);
    return t;
  }

  /* ---- SVG helpers ---- */
  function makeSVG(parent, vb) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", vb);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    parent.appendChild(svg);
    return svg;
  }

  function rect(svg, x, y, w, h, fill, rx) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", x); r.setAttribute("y", y);
    r.setAttribute("width", w); r.setAttribute("height", h);
    r.setAttribute("fill", fill);
    if (rx) r.setAttribute("rx", rx);
    svg.appendChild(r);
    return r;
  }

  function text(svg, x, y, content, size, fill, anchor, weight) {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x); t.setAttribute("y", y);
    t.setAttribute("font-size", size);
    t.setAttribute("fill", fill || "#333");
    t.setAttribute("text-anchor", anchor || "middle");
    t.setAttribute("dominant-baseline", "central");
    t.setAttribute("font-family", "'Google Sans', 'Noto Sans', sans-serif");
    if (weight) t.setAttribute("font-weight", weight);
    t.textContent = content;
    svg.appendChild(t);
    return t;
  }

  // Math label using foreignObject + MathJax (same renderer as Method section)
  function mathLabel(svg, x, y, w, h, latex, fontSize, color, align) {
    const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    fo.setAttribute("x", x); fo.setAttribute("y", y);
    fo.setAttribute("width", w); fo.setAttribute("height", h);
    const justify = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
    const div = document.createElement("div");
    div.style.cssText = `font-size:${fontSize || 10}px; color:${color || "#333"}; display:flex; align-items:center; justify-content:${justify}; width:100%; height:100%; overflow:visible;`;
    div.innerHTML = `\\(${latex}\\)`;
    fo.appendChild(div);
    svg.appendChild(fo);
    return fo;
  }

  // Single deferred MathJax typeset — called once after all SVGs are built
  function typesetAllMath() {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch(() => {});
    } else {
      setTimeout(typesetAllMath, 300);
    }
  }

  function group(svg, id, hidden) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    if (id) g.id = id;
    if (hidden) g.setAttribute("opacity", "0");
    svg.appendChild(g);
    return g;
  }

  function line(svg, x1, y1, x2, y2, color, width, dash) {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", x1); l.setAttribute("y1", y1);
    l.setAttribute("x2", x2); l.setAttribute("y2", y2);
    l.setAttribute("stroke", color); l.setAttribute("stroke-width", width || 1.5);
    if (dash) l.setAttribute("stroke-dasharray", dash);
    svg.appendChild(l);
    return l;
  }

  function arrow(svg, x1, y1, x2, y2, color) {
    const id = "ah" + Math.random().toString(36).slice(2, 8);
    let defs = svg.querySelector("defs");
    if (!defs) { defs = document.createElementNS("http://www.w3.org/2000/svg", "defs"); svg.prepend(defs); }
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", id); marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", 8); marker.setAttribute("refY", 5);
    marker.setAttribute("markerWidth", 6); marker.setAttribute("markerHeight", 6);
    marker.setAttribute("orient", "auto-start-reverse");
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M 0 0 L 10 5 L 0 10 z"); p.setAttribute("fill", color);
    marker.appendChild(p); defs.appendChild(marker);
    const l = line(svg, x1, y1, x2, y2, color, 1.5);
    l.setAttribute("marker-end", `url(#${id})`);
    return l;
  }

  /* ================================================================
     RIGHT PANEL: Trajectory probability reduction
     4 rows: original → sampled mask → unmask → collect prob
     Dashed line splits blocks; each block has its own sample arrow
     ================================================================ */
  const RP = {
    PAD: 28,          // left/right padding
    W: 0, H: 22, GAP: 3,  // token box dims (W computed)
    DASH_GAP: 12,     // gap for dashed divider between blocks
    ROW_GAP: 14,      // vertical gap between arrow area and next row
    ARROW_H: 38,      // height reserved for arrows between rows
    TOTAL_TOKENS: 8,
    Y_TOP: 46,
  };

  function rpLayout() {
    // Compute token box width to fill the full SVG width symmetrically
    const svgW = 470;
    const usable = svgW - 2 * RP.PAD - RP.DASH_GAP; // space for tokens
    const perBlock = usable / 2;
    RP.W = Math.floor((perBlock - (BLOCK_SIZE - 1) * RP.GAP) / BLOCK_SIZE);

    const blockW = BLOCK_SIZE * RP.W + (BLOCK_SIZE - 1) * RP.GAP;
    const totalW = 2 * blockW + RP.DASH_GAP;
    const startX = (svgW - totalW) / 2;

    // Block start X positions
    const b1x = startX;
    const b2x = startX + blockW + RP.DASH_GAP;
    // Dash line X
    const dashX = startX + blockW + RP.DASH_GAP / 2;

    return { svgW, blockW, b1x, b2x, dashX };
  }

  function rpTokenX(blockStartX, i) {
    return blockStartX + i * (RP.W + RP.GAP);
  }

  function rpBlockCenterX(blockStartX) {
    return blockStartX + (BLOCK_SIZE * RP.W + (BLOCK_SIZE - 1) * RP.GAP) / 2;
  }

  function initRightPanel() {
    const container = document.getElementById("demo-right-svg");
    if (!container) return;
    container.innerHTML = "";

    const svg = makeSVG(container, "0 20 470 285");
    drawRightStatic(svg);
  }

  function drawRightStatic(svg) {
    const L = rpLayout();
    const { b1x, b2x, dashX } = L;

    // Block labels
    text(svg, rpBlockCenterX(b1x), 33, "Block 1", 10, GRAY_DARK, "middle", "600");
    text(svg, rpBlockCenterX(b2x), 33, "Block 2", 10, GRAY_DARK, "middle", "600");

    // === ROW 1: Original sentence (y) ===
    const R1Y = RP.Y_TOP;
    // Row label
    text(svg, RP.PAD - 2, R1Y + RP.H / 2, "", 8, GRAY_DARK, "end"); // no label needed, title suffices

    for (let i = 0; i < BLOCK_SIZE; i++) {
      const xi = rpTokenX(b1x, i);
      rect(svg, xi, R1Y, RP.W, RP.H, MASK_COLOR, 3).id = "rp-b1-box-" + i;
      text(svg, xi + RP.W / 2, R1Y + RP.H / 2, "[M]", 9, GRAY_DARK).id = "rp-b1-txt-" + i;
    }
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const xi = rpTokenX(b2x, i);
      rect(svg, xi, R1Y, RP.W, RP.H, MASK_COLOR, 3).id = "rp-b2-box-" + i;
      text(svg, xi + RP.W / 2, R1Y + RP.H / 2, "[M]", 9, GRAY_DARK).id = "rp-b2-txt-" + i;
    }

    // Dashed divider for row 1
    line(svg, dashX, R1Y - 2, dashX, R1Y + RP.H + 2, GRAY, 1, "4,3");

    const b1cx = rpBlockCenterX(b1x);
    const b2cx = rpBlockCenterX(b2x);

    const lblW = RP.PAD - 2;
    const rLblX = 470 - lblW;

    // === Section 1a: Arrow 1→2 (hidden) ===
    const g1a = group(svg, "rp-arr1", true);
    const A1Y = R1Y + RP.H + 4;
    const A1Yend = A1Y + RP.ARROW_H - 4;
    arrow(g1a, b1cx, A1Y, b1cx, A1Yend, GRAY_DARK);
    arrow(g1a, b2cx, A1Y, b2cx, A1Yend, GRAY_DARK);
    const a1Mid = A1Y + RP.ARROW_H / 2;
    text(g1a, b1cx - 6, a1Mid, "sample", 9, GRAY_DARK, "end");
    mathLabel(g1a, b1cx + 5, a1Mid - 12, 100, 24, "t_1 \\sim U(1,T_B)", 9, GRAY_DARK, "left");
    text(g1a, b2cx - 6, a1Mid, "sample", 9, GRAY_DARK, "end");
    mathLabel(g1a, b2cx + 5, a1Mid - 12, 100, 24, "t_2 \\sim U(1,T_B)", 9, GRAY_DARK, "left");

    // === Section 1b: Row 2 + τ labels (hidden) ===
    const g1b = group(svg, "rp-row2", true);
    const R2Y = A1Yend + 4;
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const xi = rpTokenX(b1x, i);
      rect(g1b, xi, R2Y, RP.W, RP.H, MASK_COLOR, 3).id = "rp-s1-box-" + i;
      text(g1b, xi + RP.W / 2, R2Y + RP.H / 2, "[M]", 9, GRAY_DARK).id = "rp-s1-txt-" + i;
    }
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const xi = rpTokenX(b2x, i);
      rect(g1b, xi, R2Y, RP.W, RP.H, MASK_COLOR, 3).id = "rp-s2-box-" + i;
      text(g1b, xi + RP.W / 2, R2Y + RP.H / 2, "[M]", 9, GRAY_DARK).id = "rp-s2-txt-" + i;
    }
    line(g1b, dashX, R2Y - 2, dashX, R2Y + RP.H + 2, GRAY, 1, "4,3");
    mathLabel(g1b, 0, R2Y - 2, lblW, RP.H + 4, "\\pmb{\\tau}_{t_1}", 8, GRAY_DARK);
    mathLabel(g1b, rLblX, R2Y - 2, lblW, RP.H + 4, "\\pmb{\\tau}_{t_2}", 8, GRAY_DARK);

    // === Section 2a: Arrow 2→3 (hidden) ===
    const g2a = group(svg, "rp-arr2", true);
    const A2Y = R2Y + RP.H + 4;
    const A2Yend = A2Y + RP.ARROW_H - 4;
    arrow(g2a, b1cx, A2Y, b1cx, A2Yend, GRAY_DARK);
    arrow(g2a, b2cx, A2Y, b2cx, A2Yend, GRAY_DARK);
    const a2Mid = A2Y + RP.ARROW_H / 2;
    text(g2a, b1cx - 6, a2Mid, "unmask", 9, GRAY_DARK, "end");
    mathLabel(g2a, b1cx + 5, a2Mid - 12, 120, 24, "\\pi_\\theta(\\pmb{\\tau}_{t_1-1} \\mid \\pmb{\\tau}_{t_1})", 9, GRAY_DARK, "left");
    text(g2a, b2cx - 6, a2Mid, "unmask", 9, GRAY_DARK, "end");
    mathLabel(g2a, b2cx + 5, a2Mid - 12, 120, 24, "\\pi_\\theta(\\pmb{\\tau}_{t_2-1} \\mid \\pmb{\\tau}_{t_2})", 9, GRAY_DARK, "left");

    // === Section 2b: Row 3 + τ labels (hidden) ===
    const g2b = group(svg, "rp-row3", true);
    const R3Y = A2Yend + 4;
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const xi = rpTokenX(b1x, i);
      rect(g2b, xi, R3Y, RP.W, RP.H, MASK_COLOR, 3).id = "rp-u1-box-" + i;
      text(g2b, xi + RP.W / 2, R3Y + RP.H / 2, "[M]", 9, GRAY_DARK).id = "rp-u1-txt-" + i;
    }
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const xi = rpTokenX(b2x, i);
      rect(g2b, xi, R3Y, RP.W, RP.H, MASK_COLOR, 3).id = "rp-u2-box-" + i;
      text(g2b, xi + RP.W / 2, R3Y + RP.H / 2, "[M]", 9, GRAY_DARK).id = "rp-u2-txt-" + i;
    }
    line(g2b, dashX, R3Y - 2, dashX, R3Y + RP.H + 2, GRAY, 1, "4,3");
    mathLabel(g2b, 0, R3Y - 2, lblW + 6, RP.H + 4, "\\pmb{\\tau}_{t_1-1}", 8, GRAY_DARK);
    mathLabel(g2b, rLblX - 6, R3Y - 2, lblW + 6, RP.H + 4, "\\pmb{\\tau}_{t_2-1}", 8, GRAY_DARK);

    // === Section 3a: Arrow 3→4 (hidden) ===
    const g3a = group(svg, "rp-arr3", true);
    const A3Y = R3Y + RP.H + 4;
    const A3Yend = A3Y + RP.ARROW_H - 4;
    arrow(g3a, b1cx, A3Y, b1cx, A3Yend, GRAY_DARK);
    arrow(g3a, b2cx, A3Y, b2cx, A3Yend, GRAY_DARK);
    const a3Mid = A3Y + RP.ARROW_H / 2;
    text(g3a, b1cx - 6, a3Mid, "collect unmasked", 9, GRAY_DARK, "end");
    mathLabel(g3a, b1cx + 5, a3Mid - 12, 100, 24, "\\mathcal{I}_{t_1}", 9, GRAY_DARK, "left");
    text(g3a, b2cx - 6, a3Mid, "collect unmasked", 9, GRAY_DARK, "end");
    mathLabel(g3a, b2cx + 5, a3Mid - 12, 100, 24, "\\mathcal{I}_{t_2}", 9, GRAY_DARK, "left");

    // === Section 3b: Row 4 (hidden) ===
    const g3b = group(svg, "rp-row4", true);
    const R4Y = A3Yend + 4;
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const xi = rpTokenX(b1x, i);
      rect(g3b, xi, R4Y, RP.W, RP.H, "transparent", 3).id = "rp-r1-box-" + i;
      text(g3b, xi + RP.W / 2, R4Y + RP.H / 2, "", 8, GRAY_DARK).id = "rp-r1-txt-" + i;
    }
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const xi = rpTokenX(b2x, i);
      rect(g3b, xi, R4Y, RP.W, RP.H, "transparent", 3).id = "rp-r2-box-" + i;
      text(g3b, xi + RP.W / 2, R4Y + RP.H / 2, "", 8, GRAY_DARK).id = "rp-r2-txt-" + i;
    }
    line(g3b, dashX, R4Y - 2, dashX, R4Y + RP.H + 2, GRAY, 1, "4,3");

    // === Section 4: Formula + Legend (hidden) ===
    const g4 = group(svg, "rp-sec4", true);
    const FY = R4Y + RP.H + 6;
    rect(g4, RP.PAD, FY, 470 - 2 * RP.PAD, 36, "#fff", 6);
    mathLabel(g4, RP.PAD + 4, FY + 2, 470 - 2 * RP.PAD - 8, 32,
      "\\frac{\\pi_\\theta}{\\pi_{\\text{ref}}} = \\sum_{\\text{block}} \\mathbb{E}_{t} \\sum_{i \\in \\mathcal{I}_t} \\frac{\\mu_\\theta(\\tau^{(i)})}{\\mu_{\\text{ref}}(\\tau^{(i)})}", 10, ORANGE);

    // Row 1 label (always visible)
    mathLabel(svg, 0, R1Y - 2, lblW, RP.H + 4, "\\pmb{y}", 8, GRAY_DARK);

  }

  function showSection(svg, id) {
    const el = svg.getElementById(id);
    if (el) el.setAttribute("opacity", "1");
  }

  function hideSection(svg, id) {
    const el = svg.getElementById(id);
    if (el) el.setAttribute("opacity", "0");
  }

  function animateRight() {
    clearTimers();
    animRunning = true;

    const svg = document.getElementById("demo-right-svg")?.querySelector("svg");
    if (!svg) return;

    const TOKENS_B1 = TOKENS.slice(0, 4);
    const TOKENS_B2 = TOKENS.slice(4, 8);

    const alreadyUnmaskedB1 = [0, 2];
    const newlyUnmaskedB1 = [3];
    const alreadyUnmaskedB2 = [1, 3];
    const newlyUnmaskedB2 = [2];

    const STEP = 600;

    // Step 1: Show row 1 (original sentence → all green)
    let delay = 400;
    schedule(() => {
      for (let i = 0; i < BLOCK_SIZE; i++) {
        const box = svg.getElementById("rp-b1-box-" + i);
        const txt = svg.getElementById("rp-b1-txt-" + i);
        if (box) box.setAttribute("fill", GREEN);
        if (txt) { txt.textContent = TOKENS_B1[i]; txt.setAttribute("fill", "#fff"); }
      }
      for (let i = 0; i < BLOCK_SIZE; i++) {
        const box = svg.getElementById("rp-b2-box-" + i);
        const txt = svg.getElementById("rp-b2-txt-" + i);
        if (box) box.setAttribute("fill", GREEN);
        if (txt) { txt.textContent = TOKENS_B2[i]; txt.setAttribute("fill", "#fff"); }
      }
    }, delay);

    // Step 2: Show arrow 1→2
    delay += STEP;
    schedule(() => { showSection(svg, "rp-arr1"); }, delay);

    // Step 3: Show row 2 + τ labels, fill data
    delay += STEP;
    schedule(() => {
      showSection(svg, "rp-row2");
      for (let i = 0; i < BLOCK_SIZE; i++) {
        const box = svg.getElementById("rp-s1-box-" + i);
        const txt = svg.getElementById("rp-s1-txt-" + i);
        if (alreadyUnmaskedB1.includes(i)) {
          if (box) box.setAttribute("fill", GREEN);
          if (txt) { txt.textContent = TOKENS_B1[i]; txt.setAttribute("fill", "#fff"); }
        }
      }
      for (let i = 0; i < BLOCK_SIZE; i++) {
        const box = svg.getElementById("rp-s2-box-" + i);
        const txt = svg.getElementById("rp-s2-txt-" + i);
        if (alreadyUnmaskedB2.includes(i)) {
          if (box) box.setAttribute("fill", GREEN);
          if (txt) { txt.textContent = TOKENS_B2[i]; txt.setAttribute("fill", "#fff"); }
        }
      }
    }, delay);

    // Step 4: Show arrow 2→3
    delay += STEP;
    schedule(() => { showSection(svg, "rp-arr2"); }, delay);

    // Step 5: Show row 3 + τ labels, fill data
    delay += STEP;
    schedule(() => {
      showSection(svg, "rp-row3");
      for (let i = 0; i < BLOCK_SIZE; i++) {
        const box = svg.getElementById("rp-u1-box-" + i);
        const txt = svg.getElementById("rp-u1-txt-" + i);
        if (newlyUnmaskedB1.includes(i)) {
          if (box) box.setAttribute("fill", ORANGE);
          if (txt) { txt.textContent = TOKENS_B1[i]; txt.setAttribute("fill", "#fff"); }
        } else if (alreadyUnmaskedB1.includes(i)) {
          if (box) box.setAttribute("fill", GREEN);
          if (txt) { txt.textContent = TOKENS_B1[i]; txt.setAttribute("fill", "#fff"); }
        }
      }
      for (let i = 0; i < BLOCK_SIZE; i++) {
        const box = svg.getElementById("rp-u2-box-" + i);
        const txt = svg.getElementById("rp-u2-txt-" + i);
        if (newlyUnmaskedB2.includes(i)) {
          if (box) box.setAttribute("fill", ORANGE);
          if (txt) { txt.textContent = TOKENS_B2[i]; txt.setAttribute("fill", "#fff"); }
        } else if (alreadyUnmaskedB2.includes(i)) {
          if (box) box.setAttribute("fill", GREEN);
          if (txt) { txt.textContent = TOKENS_B2[i]; txt.setAttribute("fill", "#fff"); }
        }
      }
    }, delay);

    // Step 6: Show arrow 3→4
    delay += STEP;
    schedule(() => { showSection(svg, "rp-arr3"); }, delay);

    // Step 7: Show row 4, fill ratio data
    delay += STEP;
    schedule(() => {
      showSection(svg, "rp-row4");
      for (let i = 0; i < BLOCK_SIZE; i++) {
        const box = svg.getElementById("rp-r1-box-" + i);
        const txt = svg.getElementById("rp-r1-txt-" + i);
        if (newlyUnmaskedB1.includes(i)) {
          if (box) box.setAttribute("fill", ORANGE);
          if (txt) { txt.textContent = "\u03BC\u03B8/\u03BC\u1D63"; txt.setAttribute("fill", "#fff"); txt.setAttribute("font-size", "7"); txt.setAttribute("font-style", "italic"); }
        }
      }
      for (let i = 0; i < BLOCK_SIZE; i++) {
        const box = svg.getElementById("rp-r2-box-" + i);
        const txt = svg.getElementById("rp-r2-txt-" + i);
        if (newlyUnmaskedB2.includes(i)) {
          if (box) box.setAttribute("fill", ORANGE);
          if (txt) { txt.textContent = "\u03BC\u03B8/\u03BC\u1D63"; txt.setAttribute("fill", "#fff"); txt.setAttribute("font-size", "7"); txt.setAttribute("font-style", "italic"); }
        }
      }
    }, delay);

    // Step 8: Show formula + legend
    delay += STEP;
    schedule(() => { showSection(svg, "rp-sec4"); }, delay);

    // Reset and loop
    delay += 2500;
    schedule(() => {
      resetRight();
      if (animRunning) animateRight();
    }, delay);
  }

  function resetRight() {
    const svg = document.getElementById("demo-right-svg")?.querySelector("svg");
    if (!svg) return;
    // Hide all sections
    ["rp-arr1", "rp-row2", "rp-arr2", "rp-row3", "rp-arr3", "rp-row4", "rp-sec4"].forEach(id => hideSection(svg, id));
    // Reset token data
    for (let b = 1; b <= 2; b++) {
      for (let i = 0; i < BLOCK_SIZE; i++) {
        ["b", "s", "u"].forEach(prefix => {
          const box = svg.getElementById(`rp-${prefix}${b}-box-${i}`);
          const txt = svg.getElementById(`rp-${prefix}${b}-txt-${i}`);
          if (box) box.setAttribute("fill", MASK_COLOR);
          if (txt) { txt.textContent = "[M]"; txt.setAttribute("fill", GRAY_DARK); txt.setAttribute("font-size", "9"); txt.removeAttribute("font-style"); }
        });
        const box = svg.getElementById(`rp-r${b}-box-${i}`);
        const txt = svg.getElementById(`rp-r${b}-txt-${i}`);
        if (box) box.setAttribute("fill", "transparent");
        if (txt) { txt.textContent = ""; txt.setAttribute("fill", GRAY_DARK); txt.setAttribute("font-size", "8"); txt.removeAttribute("font-style"); }
      }
    }
  }

  /* ================================================================
     Controls
     ================================================================ */
  function initControls() {
    const playBtn = document.getElementById("btn-play");
    const resetBtn = document.getElementById("btn-reset");
    const speedSlider = document.getElementById("speed-slider");
    const speedLabel = document.getElementById("speed-label");

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (animRunning) {
          clearTimers();
          playBtn.textContent = "▶ Play";
          playBtn.classList.remove("active");
        } else {
          playBtn.textContent = "⏸ Pause";
          playBtn.classList.add("active");
          if (document.getElementById("demo-right-svg")) animateRight();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        clearTimers();
        resetRight();
        if (playBtn) { playBtn.textContent = "▶ Play"; playBtn.classList.remove("active"); }
      });
    }

    if (speedSlider) {
      speedSlider.addEventListener("input", (e) => {
        speed = parseFloat(e.target.value);
        if (speedLabel) speedLabel.textContent = speed.toFixed(1) + "x";
      });
    }
  }

  /* ================================================================
     Qualitative results navigation
     ================================================================ */
  function initQualNav() {
    const buttons = document.querySelectorAll(".qual-nav button");
    const examples = document.querySelectorAll(".qual-example");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.example;
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        examples.forEach(ex => {
          ex.style.display = ex.id === target ? "block" : "none";
        });
      });
    });
  }

  /* ================================================================
     Init
     ================================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    initRightPanel();
    initControls();
    initQualNav();

    // Single MathJax typeset for all SVG foreignObject labels
    typesetAllMath();

    // Auto-play
    setTimeout(() => {
      const playBtn = document.getElementById("btn-play");
      if (playBtn) playBtn.click();
    }, 500);
  });
})();
