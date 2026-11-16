/* Sifar's World: shared engine.
   Procedural textures, pixel icons, sound, HUD, toasts, reveals, counters. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var SW = window.SW = {};

  /* ---------------- helpers ---------------- */
  var LS = SW.store = {
    get: function (k, d) { try { var v = localStorage.getItem('sw-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('sw-' + k, JSON.stringify(v)); } catch (e) { } }
  };
  var SS = {
    get: function (k) { try { return sessionStorage.getItem('sw-' + k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem('sw-' + k, v); } catch (e) { } }
  };
  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  function mk(w, h) { var c = doc.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function cssVar(name, canvas) { root.style.setProperty(name, 'url(' + canvas.toDataURL() + ')'); }
  SW.$ = $; SW.$$ = $$; SW.mk = mk; SW.rng = rng;
  var reduced = SW.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- textures (16 x 16, original procedural pixel art) ---------------- */
  var TEX = SW.tex = {};
  function pick(r, pal) {
    var tot = 0, i; for (i = 0; i < pal.length; i++) tot += pal[i][1];
    var v = r() * tot; for (i = 0; i < pal.length; i++) { v -= pal[i][1]; if (v <= 0) return pal[i][0]; }
    return pal[0][0];
  }
  function tex(name, seed, pal, post) {
    var c = mk(16, 16), x = c.getContext('2d'), r = rng(seed);
    for (var py = 0; py < 16; py++) for (var px = 0; px < 16; px++) { x.fillStyle = pick(r, pal); x.fillRect(px, py, 1, 1); }
    if (post) post(x, r);
    TEX[name] = c; cssVar('--t-' + name, c); return c;
  }
  function dashes(col, n) {
    return function (x, r) {
      x.fillStyle = col;
      for (var i = 0; i < n; i++) { var w = 2 + (r() * 3 | 0); x.fillRect(r() * 14 | 0, r() * 16 | 0, w, 1); if (r() < .4) x.fillRect(r() * 15 | 0, r() * 15 | 0, 1, 2); }
    };
  }
  tex('dirt', 11, [['#8f6244', 6], ['#845838', 3], ['#9b6d4d', 2], ['#6f4830', 1]], function (x, r) {
    x.fillStyle = '#b08d74'; for (var i = 0; i < 4; i++) x.fillRect(r() * 16 | 0, r() * 16 | 0, 1, 1);
  });
  tex('stone', 21, [['#8e9299', 6], ['#868a91', 3], ['#989ca3', 2]], dashes('#70747c', 7));
  tex('deep', 31, [['#565a6c', 6], ['#4d5162', 3], ['#5f6376', 2]], dashes('#3c3f4e', 7));
  tex('cave', 41, [['#34364a', 6], ['#2d2f41', 3], ['#3c3e55', 2]], function (x, r) {
    dashes('#222433', 6)(x, r); x.fillStyle = '#6a56c8'; x.fillRect(r() * 16 | 0, r() * 16 | 0, 1, 1);
  });
  tex('bedrock', 51, [['#2a2b33', 4], ['#1b1c22', 3], ['#44454f', 2], ['#0f0f14', 1]]);
  tex('asphalt', 61, [['#3b3d48', 6], ['#35373f', 3], ['#454854', 2]], dashes('#2b2d35', 4));
  tex('paper', 71, [['#f6efe2', 6], ['#f1e8d8', 3], ['#faf5ea', 2]], function (x, r) {
    x.fillStyle = '#efcfc8'; x.fillRect(r() * 16 | 0, r() * 16 | 0, 1, 1);
  });
  tex('turf', 81, [['#14532d', 6], ['#125029', 3], ['#17603a', 1]], function (x, r) {
    x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(8, 0, 8, 16);
  });
  tex('plank', 91, [['#b08350', 6], ['#a87b49', 3], ['#b98c59', 2]], function (x, r) {
    x.fillStyle = '#7c5730';
    for (var row = 0; row < 4; row++) { x.fillRect(0, row * 4 + 3, 16, 1); x.fillRect((row * 7 + 3) % 16, row * 4, 1, 3); }
  });
  tex('grass', 101, [['#6fc04e', 6], ['#7fd45a', 3], ['#5fae42', 2]]);
  (function () {
    var c = mk(16, 16), x = c.getContext('2d'), r = rng(111);
    x.drawImage(TEX.dirt, 0, 0);
    for (var px = 0; px < 16; px++) {
      var h = 3 + (r() * 3 | 0);
      for (var py = 0; py < h; py++) { x.fillStyle = py === 0 ? '#8be063' : (py === h - 1 ? '#4f9a38' : pick(r, [['#6fc04e', 3], ['#7fd45a', 2]])); x.fillRect(px, py, 1, 1); }
    }
    TEX['grass-side'] = c; cssVar('--t-grass-side', c);
  })();

  // jagged transition strip between two materials, 8 tiles wide
  function edge(name, top, bot, seed) {
    var c = mk(128, 16), x = c.getContext('2d'), r = rng(seed), by = 8, t, b;
    t = TEX[top].getContext('2d').getImageData(0, 0, 16, 16).data;
    b = TEX[bot].getContext('2d').getImageData(0, 0, 16, 16).data;
    var img = x.createImageData(128, 16), d = img.data;
    for (var px = 0; px < 128; px++) {
      if (px % 2 === 0) { by += (r() * 3 | 0) - 1; by = Math.max(4, Math.min(12, by)); if (px > 118) by += by > 8 ? -1 : by < 8 ? 1 : 0; }
      for (var py = 0; py < 16; py++) {
        var src = py < by ? t : b, si = ((py * 16) + (px % 16)) * 4, di = (py * 128 + px) * 4, k = py === by ? .72 : 1;
        d[di] = src[si] * k; d[di + 1] = src[si + 1] * k; d[di + 2] = src[si + 2] * k; d[di + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0); cssVar('--e-' + name, c);
  }
  edge('dirt-stone', 'dirt', 'stone', 5); edge('stone-deep', 'stone', 'deep', 6); edge('deep-cave', 'deep', 'cave', 7);
  edge('cave-plank', 'cave', 'plank', 8); edge('grass-asphalt', 'dirt', 'asphalt', 9); edge('asphalt-paper', 'asphalt', 'paper', 10);
  edge('paper-turf', 'paper', 'turf', 12); edge('turf-plank', 'turf', 'plank', 13);

  // ore = base rock with little gems
  var ORES = { diamond: ['#5ee6e0', '#d7fffb', '#2aa7a2'], gold: ['#f6c945', '#fff3b0', '#b8861c'], ruby: ['#ff5d6c', '#ffc2c8', '#b32735'], amethyst: ['#b78cf0', '#ead9ff', '#7446b8'], emerald: ['#4ade80', '#c9ffdd', '#1d8f47'] };
  SW.oreURL = function (kind, base, seed) {
    var c = mk(16, 16), x = c.getContext('2d'), r = rng(seed || 3), p = ORES[kind];
    x.drawImage(TEX[base], 0, 0);
    for (var i = 0; i < 5; i++) {
      var gx = 1 + (r() * 12 | 0), gy = 1 + (r() * 12 | 0);
      x.fillStyle = p[2]; x.fillRect(gx, gy, 3, 2); x.fillStyle = p[0]; x.fillRect(gx, gy, 2, 2); x.fillStyle = p[1]; x.fillRect(gx, gy, 1, 1);
    }
    return c.toDataURL();
  };
  SW.oreGlow = function (kind) { return ORES[kind][0]; };

  /* ---------------- isometric block sprites (unit u = 4) ---------------- */
  var BP = SW.blockPal = {
    grass: { top: ['#7fd45a', '#8fe06a', '#6cc24a'], side: ['#96684a', '#7c5238'], lip: ['#63b545', '#4f9a38'] },
    dirt: { top: ['#9b6d4d', '#a67858', '#8a5e40'], side: ['#8a5e40', '#6f4a32'] },
    stone: { top: ['#a2a6ad', '#b0b4ba', '#92969d'], side: ['#868a92', '#6c7078'] },
    sand: { top: ['#f0dea6', '#f8eabd', '#e2cd8f'], side: ['#d9c387', '#bfa76c'] },
    water: { top: ['#62bdf2', '#8fd6ff', '#4ea6e0'], side: ['#3f95d2', '#2f7fbb'] },
    log: { top: ['#b89260', '#caa672', '#9a7648'], side: ['#7a5234', '#5f3e26'] },
    leaf: { top: ['#58b84e', '#6fd062', '#429a3c'], side: ['#3f9238', '#30782c'] },
    blossom: { top: ['#ffb7c9', '#ffd3df', '#f590ad'], side: ['#ef8aa6', '#d96b8b'] },
    ore: { top: ['#a2a6ad', '#b0b4ba', '#92969d'], side: ['#868a92', '#6c7078'], gem: ['#5ee6e0', '#d7fffb'] },
    gold: { top: ['#a2a6ad', '#b0b4ba', '#92969d'], side: ['#868a92', '#6c7078'], gem: ['#f6c945', '#fff3b0'] }
  };
  SW.makeBlock = function (type, seed, u) {
    u = u || 4;
    var W = 4 * u, c = mk(W, W), x = c.getContext('2d'), P = BP[type], r = rng(seed || 1), px, py, k, w, x0, col;
    // top diamond
    for (py = 0; py < 2 * u; py++) {
      k = py < u ? py + 1 : 2 * u - py; w = k * 4; x0 = 2 * u - k * 2;
      for (px = 0; px < w; px++) {
        var v = r(); col = v < .14 ? P.top[1] : v < .3 ? P.top[2] : P.top[0];
        if ((px < 2 || px >= w - 2) && py < u) col = P.top[1];
        x.fillStyle = col; x.fillRect(x0 + px, py, 1, 1);
      }
    }
    // faces
    for (px = 0; px < W; px++) {
      var left = px < 2 * u, m = left ? px : W - 1 - px, y0 = u + (m >> 1) + 1;
      for (py = 0; py < 2 * u; py++) {
        col = P.side[left ? 0 : 1];
        if (P.lip && py < 2 + ((px * 7 + (seed || 1)) % 3 === 0 ? 1 : 0)) col = P.lip[left ? 0 : 1];
        else if (r() < .1) col = P.side[left ? 1 : 0];
        if (P.gem && r() < .09) col = P.gem[r() < .3 ? 1 : 0];
        x.fillStyle = col; x.fillRect(px, y0 + py, 1, 1);
      }
    }
    return c;
  };

  /* ---------------- pixel icons from emoji ---------------- */
  var iconCache = {};
  SW.icon = function (ch, size) {
    size = size || 18;
    var key = ch + size; if (iconCache[key]) return iconCache[key];
    var c = mk(size, size), x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = (size - 3) + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    x.fillText(ch, size / 2, size / 2 + 1);
    var img = x.getImageData(0, 0, size, size), d = img.data;
    for (var i = 3; i < d.length; i += 4) d[i] = d[i] > 105 ? 255 : 0;
    x.putImageData(img, 0, 0);
    return (iconCache[key] = c.toDataURL());
  };
  SW.paintIcons = function (scope) {
    $$('[data-px]', scope).forEach(function (el) {
      if (el.dataset.pxDone === el.dataset.px) return;
      el.style.backgroundImage = 'url(' + SW.icon(el.dataset.px, +el.dataset.pxSize || 18) + ')';
      el.dataset.pxDone = el.dataset.px;
    });
  };

  // sprite from a character map
  SW.sprite = function (rows, pal, scale) {
    var h = rows.length, w = rows[0].length, c = mk(w, h), x = c.getContext('2d');
    for (var py = 0; py < h; py++) for (var px = 0; px < w; px++) { var ch = rows[py][px]; if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(px, py, 1, 1); } }
    if (!scale || scale === 1) return c;
    var o = mk(w * scale, h * scale), ox = o.getContext('2d'); ox.imageSmoothingEnabled = false; ox.drawImage(c, 0, 0, w * scale, h * scale); return o;
  };

  // cursors
  (function () {
    var rows = ['X..........', 'XX.........', 'XoX........', 'XooX.......', 'XoooX......', 'XooooX.....', 'XoooooX....', 'XooooooX...', 'XoooooooX..', 'XooooooooX.', 'XoooooXXXXX', 'XooXooX....', 'XoX.XooX...', 'XX..XooX...', 'X....XooX..', '.....XXX...'];
    var a = SW.sprite(rows, { X: '#1b1b1f', o: '#ffffff' }, 2), b = SW.sprite(rows, { X: '#1b1b1f', o: '#f6c945' }, 2);
    root.style.setProperty('--cursor', 'url(' + a.toDataURL() + ') 1 1, auto');
    root.style.setProperty('--cursor-hand', 'url(' + b.toDataURL() + ') 1 1, pointer');
    var p = new Image(); p.onload = function () {
      var c = mk(32, 32), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(p, 0, 0, 32, 32);
      root.style.setProperty('--cursor-pick', 'url(' + c.toDataURL() + ') 6 26, crosshair');
    }; p.src = SW.icon('⛏️', 16);
  })();

  // brand block, favicon, loader block, lanterns, social icons
  SW.blockURL = (function () {
    var b = SW.makeBlock('grass', 7), o = mk(64, 64), x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(b, 0, 0, 64, 64); return o.toDataURL();
  })();
  (function () {
    var l = doc.createElement('link'); l.rel = 'icon'; l.href = SW.blockURL; doc.head.appendChild(l);
    var lan = SW.sprite(['...KK...', '...KK...', '..KKKK..', '.KKKKKK.', '.KyYYyK.', '.KYWWYK.', '.KYWWYK.', '.KyYYyK.', '.KKKKKK.', '..KKKK..', '........'], { K: '#2a2018', Y: '#ffc34d', y: '#f09a2a', W: '#fff3c4' });
    root.style.setProperty('--lantern', 'url(' + lan.toDataURL() + ')');
    var socials = {
      mail: SW.sprite(['................', '................', '.KKKKKKKKKKKKKK.', '.KWWWWWWWWWWWWK.', '.KKWWWWWWWWWWKK.', '.KWKWWWWWWWWKWK.', '.KWWKWWWWWWKWWK.', '.KWWWKWWWWKWWWK.', '.KWWWWKKKKWWWWK.', '.KWWWWWWWWWWWWK.', '.KWWWWWWWWWWWWK.', '.KWWWWWWWWWWWWK.', '.KKKKKKKKKKKKKK.', '......RR........', '................', '................'], { K: '#3b2a20', W: '#fff7e6', R: '#e5484d' }),
      fb: SW.sprite(['.BBBBBBBBBBBBBB.', 'BBBBBBBBBBBBBBBB', 'BBBBBBBBBWWWWBBB', 'BBBBBBBBWWWWWBBB', 'BBBBBBBBWWWBBBBB', 'BBBBBBBBWWWBBBBB', 'BBBBBBWWWWWWWBBB', 'BBBBBBWWWWWWWBBB', 'BBBBBBBBWWWBBBBB', 'BBBBBBBBWWWBBBBB', 'BBBBBBBBWWWBBBBB', 'BBBBBBBBWWWBBBBB', 'BBBBBBBBWWWBBBBB', 'BBBBBBBBWWWBBBBB', 'BBBBBBBBWWWBBBBB', '.BBBBBBBWWWBBBB.'], { B: '#1877f2', W: '#ffffff' }),
      ig: SW.sprite(['.PPPPPPPPPPPPPP.', 'PPPPPPPPPPPPPPPP', 'PPWWWWWWWWWWWWPP', 'PPWPPPPPPPPWWWPP', 'PPWPPPPPPPPWWWPP', 'PPWPPPWWWWPPPWOO', 'OOWPPWWOOWWPPWOO', 'OOWPPWOOOOWPPWOO', 'OOWPPWOOOOWPPWOO', 'OOWPPWWOOWWPPWOO', 'OOWOOOWWWWOOOWYY', 'YYWOOOOOOOOOOWYY', 'YYWOOOOOOOOOOWYY', 'YYWWWWWWWWWWWWYY', 'YYYYYYYYYYYYYYYY', '.YYYYYYYYYYYYYY.'], { P: '#c13584', O: '#f56040', Y: '#fcaf45', W: '#ffffff' }),
      li: SW.sprite(['.BBBBBBBBBBBBBB.', 'BBBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBBB', 'BBWWWBBBBBBBBBBB', 'BBWWWBBBBBBBBBBB', 'BBBBBBBBBBBBBBBB', 'BBWWWBWWWBWWWBBB', 'BBWWWBWWWWWWWWBB', 'BBWWWBWWWWBWWWBB', 'BBWWWBWWWBBWWWBB', 'BBWWWBWWWBBWWWBB', 'BBWWWBWWWBBWWWBB', 'BBWWWBWWWBBWWWBB', 'BBBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBBB', '.BBBBBBBBBBBBBB.'], { B: '#0a66c2', W: '#ffffff' })
    };
    SW.social = {}; for (var k in socials) SW.social[k] = socials[k].toDataURL();
  })();

  /* ---------------- sound ---------------- */
  var AC = null, master, musicGain, delayIn, sfxOn = LS.get('sfx', true), musicOn = false, musicTimer = null;
  function ac() {
    if (!AC) {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      AC = new C(); master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination);
      musicGain = AC.createGain(); musicGain.gain.value = 0;
      var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1900;
      var dl = AC.createDelay(1); dl.delayTime.value = .46; var fb = AC.createGain(); fb.gain.value = .42;
      delayIn = AC.createGain(); delayIn.connect(lp); lp.connect(musicGain); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(musicGain);
      musicGain.connect(master);
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function tone(f, dur, type, vol, slide, at) {
    if (!sfxOn) return; var a = ac(); if (!a) return;
    var t = a.currentTime + (at || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .1, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, vol, freq) {
    if (!sfxOn) return; var a = ac(); if (!a) return;
    var n = a.sampleRate * dur | 0, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 1200;
    s.buffer = buf; g.gain.value = vol || .2; s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  SW.sfx = {
    click: function () { tone(520, .07, 'square', .05, 380); },
    hover: function () { tone(880, .03, 'sine', .025); },
    pop: function () { noise(.12, .22, 900 + Math.random() * 500); tone(180 + Math.random() * 60, .1, 'triangle', .12, 90); },
    place: function () { tone(240, .08, 'triangle', .1, 320); },
    gem: function () { tone(1320, .12, 'sine', .08); tone(1760, .16, 'sine', .07, null, .07); tone(2640, .3, 'sine', .05, null, .14); },
    chime: function () { tone(660, .14, 'triangle', .08); tone(880, .14, 'triangle', .08, null, .1); tone(1320, .4, 'triangle', .07, null, .2); },
    whoosh: function () { noise(.3, .08, 500); },
    goal: function () { tone(523, .1, 'square', .05); tone(659, .1, 'square', .05, null, .1); tone(784, .3, 'square', .05, null, .2); }
  };
  // gentle generative music: slow pentatonic notes through an echo
  var SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 784], BASS = [130.81, 174.61, 110, 98], step = 4, beat = 0;
  function note(f, vol, len) {
    var a = AC, t = a.currentTime + .05, o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain();
    o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2;
    var g2 = a.createGain(); g2.gain.value = .25;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .35); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(delayIn); o.start(t); o2.start(t); o.stop(t + len + .1); o2.stop(t + len + .1);
  }
  function musicTick() {
    if (!musicOn) return;
    step = Math.max(0, Math.min(SCALE.length - 1, step + ((Math.random() * 5 | 0) - 2)));
    note(SCALE[step], .11, 3.6);
    if (beat % 4 === 0) note(BASS[(beat / 4 | 0) % BASS.length], .12, 6);
    if (Math.random() < .3) setTimeout(function () { if (musicOn) note(SCALE[Math.min(SCALE.length - 1, step + 2)], .07, 3); }, 420);
    beat++;
    musicTimer = setTimeout(musicTick, 1400 + Math.random() * 1500);
  }
  SW.setMusic = function (on) {
    var a = ac(); if (!a) return; musicOn = on;
    musicGain.gain.cancelScheduledValues(a.currentTime); musicGain.gain.linearRampToValueAtTime(on ? .9 : 0, a.currentTime + (on ? 1.2 : .5));
    clearTimeout(musicTimer); if (on) musicTick();
  };

  /* ---------------- toasts + achievements ---------------- */
  var ACH = SW.achievements = {
    miner: ['⛏️', 'First block', 'You mined a block. It grows back.'],
    lumber: ['🌳', 'Busy hands', 'Twenty five blocks mined.'],
    shiny: ['💎', 'Ooh, shiny', 'You found a hidden gem in the rock.'],
    collector: ['👑', 'Gem collector', 'Five gems found. Keep looking.'],
    owl: ['🌙', 'Night owl', 'You changed the time of day.'],
    dj: ['🎵', 'Cozy tunes', 'You turned on the music.'],
    mail: ['✉️', 'Mail saved', 'Email address copied.'],
    player: ['⚽', 'Squad player', 'You voted in the RSVP demo.'],
    splash: ['✨', 'Splash reader', 'You read ten splash texts.']
  };
  var got = LS.get('ach', {});
  SW.toast = function (icon, title, text) {
    var box = $('#toasts'); if (!box) return;
    var t = doc.createElement('div'); t.className = 'toast';
    t.innerHTML = '<i class="px" data-px="' + icon + '" data-px-size="20"></i><div><b></b><span></span></div>';
    $('b', t).textContent = title; $('span', t).textContent = text;
    box.appendChild(t); SW.paintIcons(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('in'); }); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 700); }, 4600);
  };
  SW.unlock = function (id) {
    if (got[id] || !ACH[id]) return false;
    got[id] = 1; LS.set('ach', got);
    SW.toast(ACH[id][0], ACH[id][1], ACH[id][2]); SW.sfx.chime();
    doc.dispatchEvent(new CustomEvent('sw:stat'));
    return true;
  };
  SW.achCount = function () { var n = 0; for (var k in got) if (ACH[k]) n++; return n; };
  SW.achTotal = Object.keys(ACH).length;

  /* ---------------- visits + time ---------------- */
  var visits = LS.get('visits', 0);
  if (!SS.get('seen')) { visits++; LS.set('visits', visits); }
  if (!LS.get('first', 0)) LS.set('first', Date.now());
  SW.visits = visits;
  var played = LS.get('time', 0);
  setInterval(function () { if (!doc.hidden) { played += 1; if (played % 5 === 0) LS.set('time', played); doc.dispatchEvent(new CustomEvent('sw:tick', { detail: played })); } }, 1000);
  SW.played = function () { return played; };
  SW.bump = function (key, n) { var v = LS.get(key, 0) + (n || 1); LS.set(key, v); doc.dispatchEvent(new CustomEvent('sw:stat')); return v; };

  /* ---------------- counters ---------------- */
  SW.count = function (el, to, opts) {
    opts = opts || {};
    var dec = opts.dec || 0, pre = opts.pre || '', suf = opts.suf || '', from = opts.from || 0, dur = opts.dur || 1800, t0 = null;
    function fmt(v) { return pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US')) + suf; }
    if (reduced) { el.textContent = fmt(to); return; }
    function f(t) {
      if (t0 === null) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * p); if (p === 1) e = 1;
      el.textContent = fmt(from + (to - from) * e); if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  };

  /* ---------------- canvas loop that only runs while visible ---------------- */
  SW.loop = function (el, fn, fps) {
    var vis = false, last = 0, gap = 1000 / (fps || 30), running = false;
    function frame(t) {
      if (!vis || doc.hidden) { running = false; return; }
      if (t - last >= gap - 2) { fn(t / 1000, Math.min(.1, (t - last) / 1000)); last = t; }
      requestAnimationFrame(frame);
    }
    function kick() { if (!running && vis && !doc.hidden) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }, { rootMargin: '80px' }).observe(el);
    doc.addEventListener('visibilitychange', kick);
    fn(0, 0);
  };

  /* ---------------- boot ---------------- */
  function boot() {
    SW.paintIcons();
    $$('.brand__block, .loader__block').forEach(function (e) { e.style.backgroundImage = 'url(' + SW.blockURL + ')'; });
    $$('.lantern').forEach(function (e) { e.style.backgroundImage = 'var(--lantern)'; });
    $$('[data-social]').forEach(function (e) { e.style.backgroundImage = 'url(' + SW.social[e.dataset.social] + ')'; });

    // stagger indexes
    $$('[data-stagger]').forEach(function (p) { Array.prototype.forEach.call(p.children, function (c, i) { c.style.setProperty('--i', i); }); });

    // reveals
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.dataset.count) startCount(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    $$('[data-r]').forEach(function (e) { io.observe(e); });
    function startCount(el) { SW.count(el, +el.dataset.count, { dec: +el.dataset.dec || 0, pre: el.dataset.pre || '', suf: el.dataset.suf || '' }); }
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { cio.unobserve(e.target); startCount(e.target); } }); }, { threshold: .4 });
    $$('[data-count]:not([data-r])').forEach(function (e) { cio.observe(e); });

    // ores
    function layOres() {
      $$('[data-ores]').forEach(function (sec, si) {
        $$('.ore', sec).forEach(function (o) { if (!o.classList.contains('mined')) o.remove(); });
        if ($$('.ore', sec).length) return;
        var T = parseFloat(getComputedStyle(root).getPropertyValue('--tile')) || 64, w = sec.clientWidth, h = sec.clientHeight;
        var cols = Math.floor(w / T), rows = Math.floor(h / T), wrapW = Math.min(1120, w - 40), free = Math.floor(((w - wrapW) / 2 - 12) / T);
        if (free < 1) return;
        var r = rng(77 + si * 13), base = sec.dataset.oreBase || 'stone', used = {};
        sec.dataset.ores.split(',').forEach(function (spec, k) {
          var kind = spec.split(':')[0], n = +spec.split(':')[1];
          for (var i = 0; i < n; i++) {
            var side = r() < .5, c = (r() * free | 0), col = side ? c : cols - 1 - c, row = 2 + (r() * Math.max(1, rows - 3) | 0), key = col + '_' + row;
            if (used[key]) continue; used[key] = 1;
            var o = doc.createElement('button'); o.className = 'ore'; o.type = 'button'; o.setAttribute('aria-label', 'Hidden ' + kind + ' ore. Click to mine.');
            o.style.cssText = 'left:' + col * T + 'px;top:' + row * T + 'px;--i:' + (i + k) + ';--glow:' + SW.oreGlow(kind) + ';background-image:url(' + SW.oreURL(kind, base, i * 7 + k) + ')';
            o.dataset.kind = kind; sec.appendChild(o);
          }
        });
      });
    }
    layOres();
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layOres, 300); });
    doc.addEventListener('click', function (e) {
      var o = e.target.closest && e.target.closest('.ore'); if (!o || o.classList.contains('mined')) return;
      o.classList.add('mined'); SW.sfx.gem(); burst(e.clientX, e.clientY, SW.oreGlow(o.dataset.kind));
      var n = SW.bump('gems'); if (!SW.unlock('shiny')) { if (n >= 5) SW.unlock('collector'); SW.toast('💎', 'Gem found!', 'A ' + o.dataset.kind + '. That makes ' + n + '.'); }
    });

    // little DOM particle burst
    function burst(x, y, col) {
      for (var i = 0; i < 10; i++) {
        var p = doc.createElement('i'), a = Math.random() * 6.28, d = 30 + Math.random() * 60;
        p.style.cssText = 'position:fixed;z-index:130;left:' + x + 'px;top:' + y + 'px;width:8px;height:8px;pointer-events:none;background:' + col + ';transition:transform .7s cubic-bezier(.2,.8,.2,1),opacity .7s';
        doc.body.appendChild(p);
        (function (p, a, d) { requestAnimationFrame(function () { p.style.transform = 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 30) + 'px) rotate(180deg) scale(.3)'; p.style.opacity = 0; }); setTimeout(function () { p.remove(); }, 750); })(p, a, d);
      }
    }
    SW.burst = burst;

    // HUD: time of day, sound
    var bt = $('#btnTime'), bs = $('#btnSfx'), bm = $('#btnMusic');
    function paintTime() { var n = root.dataset.time === 'night'; if (bt) { $('.px', bt).dataset.px = n ? '🌙' : '☀️'; SW.paintIcons(bt); bt.dataset.tip = n ? 'Night. Click for day' : 'Day. Click for night'; } }
    paintTime();
    if (bt) bt.addEventListener('click', function () {
      root.dataset.time = root.dataset.time === 'night' ? 'day' : 'night'; LS.set('time-of-day', root.dataset.time); paintTime(); SW.sfx.whoosh(); SW.unlock('owl');
    });
    function paintSfx() { if (bs) { bs.classList.toggle('off', !sfxOn); bs.dataset.tip = sfxOn ? 'Sound effects on' : 'Sound effects off'; } }
    paintSfx();
    if (bs) bs.addEventListener('click', function () { sfxOn = !sfxOn; LS.set('sfx', sfxOn); paintSfx(); SW.sfx.click(); });
    if (bm) { bm.classList.add('off'); bm.addEventListener('click', function () { var on = bm.classList.contains('off'); bm.classList.toggle('off', !on); bm.dataset.tip = on ? 'Music on' : 'Music off'; SW.setMusic(on); if (on) SW.unlock('dj'); }); }

    // click + hover sounds
    doc.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a, .btn, .thumb, .tool')) SW.sfx.click(); });
    var lastHover = null;
    doc.addEventListener('mouseover', function (e) { var t = e.target.closest && e.target.closest('.btn, .nav__links a'); if (t && t !== lastHover) SW.sfx.hover(); lastHover = t; });

    // nav: solid after scrolling, progress line, active link, parallax
    var nav = $('.nav'), prog = $('.progress i'), links = $$('.nav__links a'), pars = $$('[data-par]'), tick = false;
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href').split('#')[0].toLowerCase() === here); });
    function onScroll() {
      tick = false;
      var max = Math.max(1, doc.documentElement.scrollHeight - innerHeight), p = Math.min(1, Math.max(0, scrollY / max));
      if (prog) prog.style.transform = 'scaleX(' + p + ')';
      if (nav) nav.classList.toggle('solid', scrollY > 30);
      for (var i = 0; i < pars.length; i++) pars[i].style.transform = 'translate3d(0,' + (scrollY * +pars[i].dataset.par) + 'px,0)';
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    // smooth scrolling (Lenis) and eased jumps to sections
    var lenis = null;
    if (window.Lenis && !reduced) {
      lenis = SW.lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    }
    SW.scrollTo = function (el) {
      if (lenis) lenis.scrollTo(el, { duration: 1.5, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    };
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var el = doc.getElementById(id.slice(1)); if (!el) return;
      e.preventDefault(); SW.scrollTo(el); try { history.replaceState(null, '', id); } catch (err) { }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      var n = +e.key; if (n >= 1 && n <= links.length && !e.ctrlKey && !e.metaKey && !e.altKey) links[n - 1].click();
    });

    // tile transition: a mosaic of sky tiles that pops in and out as a ripple
    var tiles = $('#tiles'), tcols = 1, trows = 1, tlist = [];
    function buildTiles() {
      if (!tiles) return;
      var size = innerWidth < 700 ? 64 : 100; tcols = Math.ceil(innerWidth / size); trows = Math.ceil(innerHeight / size);
      tiles.style.gridTemplateColumns = 'repeat(' + tcols + ',1fr)'; tiles.style.gridTemplateRows = 'repeat(' + trows + ',1fr)';
      var pal = root.dataset.time === 'night' ? ['#141a45', '#182052', '#1c2459', '#111740'] : ['#69bdf0', '#74c4f3', '#80cbf6', '#62b6ea'];
      tiles.textContent = ''; tlist = [];
      for (var i = 0; i < tcols * trows; i++) { var t = doc.createElement('i'); t.style.setProperty('--c', pal[Math.random() * pal.length | 0]); tiles.appendChild(t); tlist.push(t); }
    }
    function ripple(cx, cy, step) {
      var far = 0;
      for (var i = 0; i < tlist.length; i++) { var d = Math.hypot(i % tcols - cx, (i / tcols | 0) - cy); far = Math.max(far, d); tlist[i].style.setProperty('--d', Math.round(d * step) + 'ms'); }
      return far * step;
    }
    function cover(instant) {
      if (!tiles) return;
      if (instant) tiles.classList.add('instant');
      tiles.classList.add('cover');
      if (instant) { void tiles.offsetWidth; tiles.classList.remove('instant'); }
    }
    if (tiles) {
      doc.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || a.target === '_blank') return;
        var href = a.getAttribute('href'); if (!/\.html(#.*)?$/.test(href) || /^https?:/.test(href)) return;
        if (href.split('#')[0].toLowerCase() === here) { if (href.indexOf('#') < 0) { e.preventDefault(); if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo(0, 0); } return; }
        e.preventDefault(); SS.set('wipe', '1'); SW.sfx.whoosh();
        buildTiles();
        var wait = ripple(e.clientX / innerWidth * tcols - .5, e.clientY / innerHeight * trows - .5, 26);
        cover(false);
        setTimeout(function () { location.href = href; }, reduced ? 0 : wait + 520);
      });
      window.addEventListener('pageshow', function (e) { if (e.persisted) tiles.classList.remove('cover'); });
    }

    // loader: a little island builds itself block by block, then the sky breaks into tiles
    var loader = $('#loader');
    function reveal(hadContent) {
      doc.body.classList.add('go'); SS.set('seen', '1');
      try { sessionStorage.removeItem('sw-wipe'); } catch (err) { }
      root.classList.remove('from-wipe');
      ripple(tcols / 2 - .5, trows / 2 - .5, 38);
      if (loader) loader.classList.add('done');
      setTimeout(function () { if (tiles) tiles.classList.remove('cover'); }, hadContent ? 280 : 80);
      doc.dispatchEvent(new CustomEvent('sw:go'));
    }
    function buildIsland(done) {
      var cv = $('#loaderIsland'), pct = $('#loaderPct'), tip = $('#loaderTip'); if (!cv) return done();
      var x = cv.getContext('2d'), W = cv.width, H = cv.height, quick = !!SS.get('seen'), dur = quick ? 700 : 2000, r = rng(7), list = [], i;
      for (var gx = 0; gx < 5; gx++) for (var gy = 0; gy < 5; gy++) {
        var d = Math.hypot(gx - 2, gy - 2); if (d > 2.3) continue;
        var dep = Math.max(1, Math.round((2.6 - d) * 1.2));
        for (var z = -dep; z <= 0; z++) list.push({ x: gx, y: gy, z: z, t: z === 0 ? (gx === 3 && gy === 3 ? 'water' : 'grass') : z === -1 ? 'dirt' : (r() < .16 ? 'ore' : 'stone') });
      }
      [[1, 1, 1, 'log'], [1, 1, 2, 'log'], [0, 1, 3, 'leaf'], [2, 1, 3, 'leaf'], [1, 0, 3, 'blossom'], [1, 2, 3, 'leaf'], [1, 1, 3, 'leaf'], [1, 1, 4, 'blossom']].forEach(function (b) { list.push({ x: b[0], y: b[1], z: b[2], t: b[3] }); });
      list.sort(function (a, b) { return a.z - b.z || (a.x + a.y) - (b.x + b.y) || a.x - b.x; });
      list.forEach(function (b, n) { b.at = n / list.length * .92; b.s = SW.makeBlock(b.t, 3 + (r() * 9 | 0)); });
      var order = list.slice().sort(function (a, b) { return ((a.x + a.y) * 100 + a.z) - ((b.x + b.y) * 100 + b.z) || a.x - b.x; });
      var base = tip ? tip.textContent : '', tips = [base, 'Planting a tree', 'Filling the pond', 'Brewing calm', 'Almost there'], t0 = performance.now();
      function frame(now) {
        var p = Math.min(1, (now - t0) / dur);
        x.clearRect(0, 0, W, H); x.imageSmoothingEnabled = false;
        for (i = 0; i < order.length; i++) {
          var b = order[i]; if (b.at > p) continue;
          var k = Math.min(1, (p - b.at) * dur / 240), e = 1 - (1 - k) * (1 - k);
          x.globalAlpha = k; x.drawImage(b.s, W / 2 - 8 + (b.x - b.y) * 8, 30 + (b.x + b.y) * 4 - b.z * 8 - Math.round((1 - e) * 16) + (b.t === 'water' ? 2 : 0));
        }
        x.globalAlpha = 1;
        if (pct) pct.textContent = Math.round(p * 100) + '%';
        if (tip && !quick) { var tx = tips[Math.min(tips.length - 1, p * tips.length | 0)]; if (tip.textContent !== tx) tip.textContent = tx; }
        if (p < 1) requestAnimationFrame(frame); else setTimeout(done, 420);
      }
      requestAnimationFrame(frame);
    }
    buildTiles(); cover(true);
    if (loader) loader.classList.add('tiled');
    if (!loader || root.classList.contains('from-wipe') || reduced) requestAnimationFrame(function () { requestAnimationFrame(function () { reveal(false); }); });
    else buildIsland(function () { reveal(true); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
