// fit pixel engine: one source for the page, the share images and /api/og
// (inlined into index.html by build.py; required by api/og.js in node)
(function (root) {
  var OL = 0x14121a, WHITE = 0xf6f4ff, BROWN = 0x7a3a2c, TEAR = 0x5bc4ff, GOLD = 0xffd34d, GOLDD = 0xc9861c, GOLDL = 0xfff1a8;
  var PINK = 0xff3d8b, PINKL = 0xff5ca0, PINKD = 0xf03482, LIME = 0xb9ff3b, GREY = 0x9a98a6, GREYD = 0x6e6c7a, PAPER = 0xececf0, PAPERD = 0xe2e2e8;
  // hoodie colourways [base, shade, light]; the biggest bag's mint picks one
  var HOODIES = [[0xb9ff3b, 0x7cc41a, 0xe2ff9e], [0x8e6bff, 0x5f43d1, 0xbba8ff], [0xff9a2e, 0xd06a10, 0xffc77d], [0x45c2ff, 0x1f8ad0, 0xa6e4ff],
    [0xff4f9a, 0xc82a6c, 0xffa3c8], [0x2fd38a, 0x179a5f, 0x8ff0c2], [0xffd34d, 0xc9a01c, 0xfff1a8], [0xf4f4f6, 0xc4c4ce, 0xffffff], [0x2b2a33, 0x18171d, 0x45434f], [0xff5a4e, 0xc7342b, 0xff9d95]];
  var MANNEQUIN = [0xc9c8d2, 0xa6a5b2, 0xe2e1ea];
  var CAPS = [[0x1d1b24, 0x0e0d12, 0x3a3745], [0xff3d8b, 0xc21f63, 0xff8fbd], [0xf4f4f6, 0xc9c9d2, 0xffffff], [0x3fa7ff, 0x1f6fc0, 0x9fd3ff], [0x2fd38a, 0x179a5f, 0x8ff0c2], [0xff8a1f, 0xc95f08, 0xffbf80]];
  var SKINS = [[0xf0b98f, 0xcf8f68, 0xffd6b3], [0xd99a6c, 0xb07448, 0xf2bf96], [0xa86a45, 0x82502f, 0xc98b62], [0x7a4a2e, 0x5c3520, 0x9a6444]];
  var COINS = [0xff8a1f, 0x3fa7ff, 0xa374ff, 0x2fd38a, 0xffd34d, 0xff4f9a, 0x45e0d0, 0xff5a4e];
  var N1 = ["oversized", "vintage", "limited", "thrifted", "custom", "bootleg", "archive", "sample", "one-off", "deadstock", "washed", "cropped"];
  var N2 = ["hoodie", "drip", "fit", "jacket", "tee", "cap", "sneaker", "tag", "stitch", "zip", "denim", "fleece"];
  var BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function traits(addr) {
    var h = hash(addr || "fit");
    return { cap: h % CAPS.length, skin: (h >>> 4) % SKINS.length, mirror: !!((h >>> 7) & 1), name: N1[(h >>> 8) % N1.length] + " " + N2[(h >>> 13) % N2.length] };
  }
  function hoodieFor(mint) { return HOODIES[hash("h" + mint) % HOODIES.length]; }
  function coinFor(mint) { return COINS[hash("c" + mint) % COINS.length]; }

  function Grid(w, h, bg) { this.w = w; this.h = h; this.px = new Int32Array(w * h).fill(bg == null ? -1 : bg); }
  Grid.prototype.set = function (x, y, c) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || c == null) return;
    this.px[y * this.w + x] = c;
  };
  Grid.prototype.get = function (x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h ? -1 : this.px[y * this.w + x]; };
  Grid.prototype.rect = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c); };
  Grid.prototype.rgba = function (out) {
    for (var i = 0; i < this.px.length; i++) {
      var c = this.px[i];
      if (c < 0) { out[i * 4 + 3] = 0; continue; }
      out[i * 4] = (c >> 16) & 255; out[i * 4 + 1] = (c >> 8) & 255; out[i * 4 + 2] = c & 255; out[i * 4 + 3] = 255;
    }
    return out;
  };
  // 3x5 pixel font (rows joined, 15 cells per glyph)
  var F3 = {
    "A": ".#.#.#####.##.#",
    "B": "##.#.###.#.###.",
    "C": ".###..#..#...##",
    "D": "##.#.##.##.###.",
    "E": "####..##.#..###",
    "F": "####..##.#..#..",
    "G": ".###..#.##.#.##",
    "H": "#.##.#####.##.#",
    "I": "###.#..#..#.###",
    "J": "..#..#..##.#.#.",
    "K": "#.##.###.#.##.#",
    "L": "#..#..#..#..###",
    "M": "#.########.##.#",
    "N": "##.#.##.##.##.#",
    "O": ".#.#.##.##.#.#.",
    "P": "##.#.###.#..#..",
    "Q": ".#.#.##.###..##",
    "R": "##.#.###.#.##.#",
    "S": ".###...#...###.",
    "T": "###.#..#..#..#.",
    "U": "#.##.##.##.####",
    "V": "#.##.##.##.#.#.",
    "W": "#.##.########.#",
    "X": "#.##.#.#.#.##.#",
    "Y": "#.##.#.#..#..#.",
    "Z": "###..#.#.#..###",
    "0": "####.##.##.####",
    "1": ".#.##..#..#.###",
    "2": "##...#.#.#..###",
    "3": "##...#.#...###.",
    "4": "#.##.####..#..#",
    "5": "####..##...###.",
    "6": ".###..####.####",
    "7": "###..#.#..#..#.",
    "8": "####.#####.####",
    "9": "####.####..###.",
    "$": ".####..#..####.",
    "?": "##...#.#.....#.",
    "+": "....#.###.#....",
    ".": ".............#.",
    "-": "......###......",
    ":": "....#.....#....",
    "!": ".#..#..#.....#.",
    "/": "..#..#.#.#..#..",
    " ": "...............",
    ",": "..........#.#..",
    "%": "#.#..#.#.#..#.#",
    "—": "......###......"
  };

  function textW(s, sc) { return s.length * 4 * sc - sc; }
  function text(g, s, x, y, sc, col, shadow) {
    s = String(s).toUpperCase(); sc = sc || 1;
    for (var n = 0; n < s.length; n++) {
      var gl = F3[s[n]] || F3["?"];
      for (var j = 0; j < 5; j++) for (var i = 0; i < 3; i++) if (gl[j * 3 + i] === "#") {
        if (shadow) g.rect(x + (n * 4 + i) * sc + sc, y + j * sc + sc, sc, sc, shadow);
      }
      for (var j2 = 0; j2 < 5; j2++) for (var i2 = 0; i2 < 3; i2++) if (gl[j2 * 3 + i2] === "#") g.rect(x + (n * 4 + i2) * sc, y + j2 * sc, sc, sc, col);
    }
  }

  // ticker on the chest: A-Z 0-9 only, 2-6 chars, and never a word on the blocklist
  var BLOCK = ["NIGG", "NIGA", "FAG", "KIKE", "SPIC", "CHINK", "RAPE", "NAZI", "HITLER", "KKK", "TRANNY", "RETARD", "CUNT", "PEDO"];
  function cleanTicker(s) {
    s = String(s || "").toUpperCase().replace(/^\$/, "");
    if (!/^[A-Z0-9]{2,6}$/.test(s)) return null;
    for (var i = 0; i < BLOCK.length; i++) if (s.indexOf(BLOCK[i]) >= 0) return null;
    return s;
  }

  // the character: geometry in a 32 x 40 unit box, sampled at k px per unit, then outlined
  // look = { hoodie:[c,d,l], cap:[c,d,l], skin:[c,d,l], face:"shades"|"cry"|"grin"|"blank", coins:[col..3], scars:0..4, chain, tag, ticker, mirror, gold }
  function guy(g, x0, y0, k, look) {
    var W = Math.floor(32 * k), H = Math.floor(44 * k), hc = look.hoodie, cc = look.cap, sk = look.skin, coins = look.coins || [], scars = look.scars || 0;
    var buf = new Int32Array(W * H).fill(-1);
    function el(x, y, cx, cy, rx, ry) { var a = (x - cx) / rx, b = (y - cy) / ry; return a * a + b * b <= 1; }
    function ci(x, y, cx, cy, r) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; }
    var SPOTS = [[7.2, 35.4], [24.8, 35.8], [9.8, 40.6]];
    var SCARS = [[16.6, 37.6], [21.4, 40.4], [2.8, 39.8], [12.2, 41.2]];
    for (var py = 0; py < H; py++) for (var px = 0; px < W; px++) {
      var x = (px + 0.5) / k, y = (py + 0.5) / k, c = -1, i;
      if (look.mirror) x = 32 - x;
      if (y >= 26.5 && el(x, y, 16, 44, 15.6, 17.5)) {
        c = hc[0];
        if (!el(x, y, 15.2, 44.6, 14.4, 16.4)) c = x > 16 ? hc[1] : hc[2];
        if (el(x, y, 16, 27.6, 7.4, 3.4) && !el(x, y, 16, 27.2, 4.4, 2.0)) c = hc[1];
        if ((Math.abs(x - 13.2) < 0.55 || Math.abs(x - 18.8) < 0.55) && y > 28.5 && y < (look.ticker && k >= 1.25 ? 30.4 : 32.6)) c = WHITE;
        if (Math.abs(x - 16) < 0.5 && y > 31 && !look.ticker) c = hc[1];
        for (i = 0; i < Math.min(3, coins.length); i++) {
          var sx = SPOTS[i][0], sy = SPOTS[i][1];
          if (ci(x, y, sx, sy, 2.7)) c = ci(x, y, sx, sy, 2.0) ? coins[i] : OL;
          if (ci(x, y, sx - 0.7, sy - 0.7, 0.8)) c = WHITE;
        }
        for (i = 0; i < Math.min(4, scars); i++) {
          var ax = SCARS[i][0], ay = SCARS[i][1];
          if (x > ax && x < ax + 6 && y > ay && y < ay + 3.4) {
            c = GREY;
            if (Math.abs((x - ax) - (y - ay) * 1.75) < 0.6 || Math.abs((ax + 6 - x) - (y - ay) * 1.75) < 0.6) c = OL;
          }
        }
        if (look.chain && Math.hypot(x - 16, (y - 26) * 1.25) > 4.5 && Math.hypot(x - 16, (y - 26) * 1.25) < 5.8 && y > 27.5) c = GOLD;
      }
      if (x > 12.8 && x < 19.2 && y > 23 && y < 27.6 && c < 0) c = sk[1];
      if (el(x, y, 16, 17, 8.4, 9.2) || ci(x, y, 7.7, 18.2, 1.7) || ci(x, y, 24.3, 18.2, 1.7)) {
        c = sk[0];
        if (x > 21.5 && !el(x, y, 15.4, 16.6, 8.0, 9.0)) c = sk[1];
        if (el(x, y, 11.6, 13, 1.8, 1.2)) c = sk[2];
      }
      if (el(x, y, 16, 17, 8.4, 9.2)) {
        var f = look.face;
        if (f === "shades") {
          if (y > 15.3 && y < 19.4 && x > 8.2 && x < 23.8 && !(x > 15.5 && x < 16.5 && y > 17.2)) c = OL;
          if (y > 16.2 && y < 17.2 && ((x > 10 && x < 11.2) || (x > 18.4 && x < 19.6))) c = PINK;
          if (y > 21.6 && y < 22.6 && x > 14 && x < 18.8) c = BROWN;
          if (y > 20.6 && y < 21.6 && x > 18 && x < 19.2) c = BROWN;
        } else if (f === "cry") {
          if (ci(x, y, 12.4, 17.4, 1.3) || ci(x, y, 19.6, 17.4, 1.3)) c = OL;
          if (ci(x, y, 12.0, 17.0, 0.45) || ci(x, y, 19.2, 17.0, 0.45)) c = WHITE;
          if (y > 14.6 && y < 15.4 && ((x > 10.6 && x < 13.6) || (x > 18.4 && x < 21.4))) c = BROWN;
          if (((x > 10.9 && x < 12.1) || (x > 19.9 && x < 21.1)) && y > 18.8 && y < 23) c = TEAR;
          if (el(x, y, 16, 23.2, 2.2, 1.0) && y < 23.2) c = BROWN;
        } else if (f === "grin") {
          if (y > 16.6 && y < 17.6 && ((x > 10.8 && x < 13.8) || (x > 18.2 && x < 21.2))) c = OL;
          if (y > 15.6 && y < 16.6 && ((x > 11.8 && x < 12.8) || (x > 19.2 && x < 20.2))) c = OL;
          if (el(x, y, 16, 21, 3.6, 2.2) && y > 21) c = BROWN;
          if (el(x, y, 16, 21, 3.0, 1.4) && y > 21 && y < 21.9) c = WHITE;
        } else {
          if (ci(x, y, 12.4, 17.6, 0.9) || ci(x, y, 19.6, 17.6, 0.9)) c = OL;
          if (y > 21.8 && y < 22.6 && x > 14.2 && x < 17.8) c = BROWN;
        }
      }
      if (el(x, y, 16, 10.6, 9.0, 6.6) && y < 11.4) {
        c = cc[0];
        if (x < 11 && y < 8) c = cc[2];
        if (Math.abs(x - 16) < 0.5 && y < 10) c = cc[1];
      }
      if (el(x, y, 16, 11.6, 11.6, 1.7) && y > 10.6) c = y > 12 ? cc[1] : cc[0];
      if (look.tag) {
        if (x > 25.4 && x < 26.0 && y > 6.5 && y < 10.5) c = WHITE;
        if (x > 25.0 && x < 30.6 && y > 10.2 && y < 16.4 && !(x > 29.6 && y < 11.2)) {
          c = WHITE;
          if (ci(x, y, 26.3, 11.5, 0.55)) c = OL;
          if (x > 26.2 && x < 29.6 && ((y > 12.7 && y < 13.5) || (y > 14.5 && y < 15.3))) c = PINK;
        }
      }
      buf[py * W + px] = c;
    }
    // ticker printed across the chest (only when there's room: k >= 1.25)
    var tk = look.ticker && k >= 1.25 ? look.ticker : null;
    if (tk) {
      var tw = textW(tk, 1), tx = Math.round(16 * k - tw / 2), ty = Math.round(31.8 * k);
      var ink = (hc[0] === 0x2b2a33) ? WHITE : OL;
      for (var n = 0; n < tk.length; n++) {
        var gl = F3[tk[n]] || F3["?"];
        for (var j = 0; j < 5; j++) for (var ii = 0; ii < 3; ii++) if (gl[j * 3 + ii] === "#") { var bx = tx + n * 4 + ii, by = ty + j; if (bx >= 0 && bx < W && by < H) buf[by * W + bx] = ink; }
      }
    }
    for (py = 0; py < H; py++) for (px = 0; px < W; px++) {
      var v = buf[py * W + px];
      if (v < 0) {
        if ((px > 0 && buf[py * W + px - 1] >= 0) || (px < W - 1 && buf[py * W + px + 1] >= 0) || (py > 0 && buf[(py - 1) * W + px] >= 0) || (py < H - 1 && buf[(py + 1) * W + px] >= 0)) g.set(x0 + px, y0 + py, look.gold ? GOLDD : OL);
      } else g.set(x0 + px, y0 + py, v);
    }
    return { w: W, h: H };
  }

  // the look for a scanned wallet. bags: [{mint, sym, usd, ch}] live, sorted by usd desc; dead: count; addr: wallet
  function lookFor(addr, scan) {
    var t = traits(addr);
    var look = { cap: CAPS[t.cap], skin: SKINS[t.skin], mirror: false, tag: true, coins: [], scars: 0, face: "blank", hoodie: MANNEQUIN, ticker: null, chain: false, gold: false };
    if (!scan) return look;
    var bags = scan.bags || [];
    if (bags.length) {
      look.hoodie = hoodieFor(bags[0].mint);
      look.ticker = cleanTicker(bags[0].sym);
      look.coins = bags.slice(1, 4).map(function (b) { return coinFor(b.mint); });
    }
    look.scars = Math.min(4, scan.dead || 0);
    var m = scan.move;
    look.face = m == null ? (bags.length ? "shades" : "blank") : m <= -10 ? "cry" : m >= 10 ? "grin" : "shades";
    look.chain = m != null && m >= 30;
    look.gold = !!scan.drip;
    return look;
  }

  // the fitting room: pink panel with a dithered glow, the character standing in it
  function room(g, x0, y0, w, h, opts) {
    opts = opts || {};
    var B0 = opts.bg == null ? PINK : opts.bg, BL = opts.bg == null ? PINKL : tint(B0, 1.13), BD = opts.bg == null ? PINKD : tint(B0, 0.93);
    for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) {
      var d = Math.hypot(x - (x0 + w / 2), y - (y0 + h * 0.42)), c = B0;
      if (d < w * 0.36 && BAYER[y & 3][x & 3] < (w * 0.36 - d) * 0.9) c = BL;
      if (((x - x0) % 8 === 0 || (y - y0) % 8 === 0) && c === B0) c = BD;
      g.set(x, y, c);
    }
    if (opts.gold) {
      for (var i = 0; i < w; i++) { g.set(x0 + i, y0, GOLD); g.set(x0 + i, y0 + 1, GOLDD); g.set(x0 + i, y0 + h - 1, GOLD); g.set(x0 + i, y0 + h - 2, GOLDD); }
      for (var j = 0; j < h; j++) { g.set(x0, y0 + j, GOLD); g.set(x0 + 1, y0 + j, GOLDD); g.set(x0 + w - 1, y0 + j, GOLD); g.set(x0 + w - 2, y0 + j, GOLDD); }
    }
  }
  function tint(c, f) { var r = Math.min(255, Math.round(((c >> 16) & 255) * f)), gg = Math.min(255, Math.round(((c >> 8) & 255) * f)), b = Math.min(255, Math.round((c & 255) * f)); return (r << 16) | (gg << 8) | b; }
  // every wallet's card gets its own background colour
  var TILES = [0xff3d8b, 0x45c2ff, 0xb9ff3b, 0xffd34d, 0xa374ff, 0xff8a1f, 0x2fd38a, 0xff5a4e, 0xf4f4f6, 0x8e6bff];
  function tileFor(addr) { return TILES[hash("t" + addr) % TILES.length]; }
  function numFor(addr) { return ("000" + (hash("n" + addr) % 10000)).slice(-4); }
  function sparkle(g, x, y, c) { g.set(x, y, WHITE); g.set(x + 1, y, c || 0xffd6e8); g.set(x - 1, y, c || 0xffd6e8); g.set(x, y + 1, c || 0xffd6e8); g.set(x, y - 1, c || 0xffd6e8); }

  // a portrait: square room, character bottom-centred. used for the stage, the saved pfp and the favicon
  function portrait(g, look, opts) {
    opts = opts || {};
    var N = g.w;
    room(g, 0, 0, N, g.h, { gold: look.gold, bg: opts.bg });
    var k = opts.k || N / 43, gw = Math.floor(32 * k), gh = Math.floor(44 * k);
    guy(g, Math.floor((N - gw) / 2) - 1, (opts.top != null ? opts.top : g.h - gh + Math.round(k * 0.5)) + (opts.bob || 0), k, look);
    var ph = opts.phase || 0, spots = [[0.11, 0.16], [0.88, 0.46], [0.14, 0.62]];
    if (opts.sparkles !== false) spots.forEach(function (s, i) { if (!look.gold || (ph + i * 4) % 12 < 8) sparkle(g, Math.round(N * s[0]), Math.round(g.h * s[1]), look.gold ? GOLDL : null); });
  }

  // the share banner (300 x 100, x5 = 1500 x 500): paper grid, codename, room on the right
  function banner(g, look, name, line2) {
    for (var y = 0; y < g.h; y++) for (var x = 0; x < g.w; x++) g.set(x, y, x % 10 === 0 || y % 10 === 0 ? PAPERD : PAPER);
    var rx = 196, rw = 92, ry = 10;
    for (var i = rx - 3; i < rx + rw + 3; i++) { g.set(i, ry - 1, OL); g.set(i, ry - 2, OL); }
    var sub = new Grid(rw, g.h - ry);
    portrait(sub, look, { k: 2.05 });
    for (var yy = 0; yy < sub.h; yy++) for (var xx = 0; xx < sub.w; xx++) g.set(rx + xx, ry + yy, sub.px[yy * sub.w + xx]);
    text(g, "FIT", 14, 16, 4, PINK);
    text(g, name, 14, 46, 3, OL);
    if (line2) text(g, line2, 14, 70, 2, GREYD);
  }

  // og / share card (240 x 126; x5 = 1200 x 630)
  function og(g) {
    for (var y = 0; y < g.h; y++) for (var x = 0; x < g.w; x++) g.set(x, y, x % 10 === 0 || y % 10 === 0 ? PAPERD : PAPER);
    var look = { hoodie: HOODIES[0], cap: CAPS[0], skin: SKINS[0], face: "shades", coins: [0xff8a1f, 0x3fa7ff, 0xa374ff], scars: 1, tag: true, ticker: "FIT" };
    var rx = 150, rw = 80, ry = 12;
    for (var i = rx - 3; i < rx + rw + 3; i++) { g.set(i, ry - 1, OL); g.set(i, ry - 2, OL); }
    var sub = new Grid(rw, g.h - ry); portrait(sub, look, { k: 2.2 });
    for (var yy = 0; yy < sub.h; yy++) for (var xx = 0; xx < sub.w; xx++) g.set(rx + xx, ry + yy, sub.px[yy * sub.w + xx]);
    text(g, "YOUR BAGS,", 12, 22, 3, OL);
    text(g, "YOUR", 12, 44, 3, OL); text(g, "FIT.", 12 + textW("YOUR ", 3), 44, 3, PINK);
    text(g, "PASTE ANY WALLET.", 12, 76, 1, GREYD);
    text(g, "GET DRESSED IN YOUR BAGS.", 12, 84, 1, GREYD);
  }

  var api = { Grid: Grid, hash: hash, traits: traits, hoodieFor: hoodieFor, coinFor: coinFor, cleanTicker: cleanTicker, guy: guy, lookFor: lookFor,
    room: room, portrait: portrait, tileFor: tileFor, numFor: numFor, TILES: TILES, COINS: COINS, banner: banner, og: og, text: text, textW: textW, HOODIES: HOODIES, CAPS: CAPS, SKINS: SKINS, MANNEQUIN: MANNEQUIN, F3: F3 };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.FIT = api;
})(this);
