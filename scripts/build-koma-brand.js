// scripts/build-koma-brand.js
// Precision geometric calculations for Koma brand identity assets

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

// Colors
const COLORS = {
  ink: '#1D1B18',
  violet: '#5A46D6',
  paper: '#F7F4EE',
  white: '#FFFFFF',
  mutedInk: '#524E48',
  tan: '#DCCDBB'
};

/*
  METRICS SPECIFICATION (viewBox 0 0 540 160)
  Height = 160
  Ascender: y = 24
  x-height: y = 56 (x-height = 56 units: from 56 to 112)
  Baseline: y = 112
  Descender (comma tail tip): y = 144
  Stroke thickness T = 17.5
  
  Letter widths & spacing:
  'k': width ~ 66, spacing 16
  'o': width ~ 62, spacing 16
  'm': width ~ 96, spacing 16
  'a': width ~ 62, spacing 14
  ',': width ~ 42 (tail sweeps to left)
*/

// Let's create helper path generators with pure Bézier curves and clean geometry

function createCommaPath(cx, cy, scale = 1) {
  // cx, cy is the center of the circular head
  // Baseline alignment: when cy = 96, r = 16, bottom of head touches baseline at 112
  // Tail sweeps down to y = 142 (descender)
  const r = 16 * scale;
  const tailDrop = 34 * scale;
  const tailSweep = 18 * scale;
  
  // High-tension, editorial sculpted comma:
  // Circle head: top arc from (cx - r, cy) through (cx, cy - r) to (cx + r, cy)
  // Outer tail curve: flows from (cx + r, cy) curving outwards and down to (cx - tailSweep + 2, cy + tailDrop)
  // Tip: sharp modern editorial terminal cut
  // Inner tail curve: swoops back up into the belly (cx - r * 0.35, cy + r * 0.95) and blends back to (cx - r, cy)
  
  const p0 = `${cx - r},${cy}`;
  const p1 = `${cx},${cy - r}`;
  const p2 = `${cx + r},${cy}`;
  
  // Outer sweep:
  const c1x = cx + r;
  const c1y = cy + r * 0.75;
  const c2x = cx + r * 0.45;
  const c2y = cy + tailDrop * 0.75;
  const tipX = cx - tailSweep;
  const tipY = cy + tailDrop;
  
  // Tip terminal cut:
  const tipInnerX = tipX + 4.5 * scale;
  const tipInnerY = tipY - 2.5 * scale;
  
  // Inner scoop:
  const c3x = cx - tailSweep * 0.2;
  const c3y = cy + tailDrop * 0.55;
  const c4x = cx - r * 0.4;
  const c4y = cy + r * 1.05;
  const bellyX = cx - r * 0.45;
  const bellyY = cy + r * 0.92;
  
  // Left belly arc back to p0:
  const c5x = cx - r * 0.95;
  const c5y = cy + r * 0.65;
  
  return `M ${cx - r} ${cy} ` +
         `A ${r} ${r} 0 0 1 ${cx + r} ${cy} ` +
         `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tipX} ${tipY} ` +
         `L ${tipInnerX} ${tipInnerY} ` +
         `C ${c3x} ${c3y}, ${c4x} ${c4y}, ${bellyX} ${bellyY} ` +
         `C ${c5x} ${c5y}, ${cx - r} ${cy + r * 0.3}, ${cx - r} ${cy} Z`;
}

console.log('Comma path generator ready');
