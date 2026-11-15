/* Sifar's World: quest log page. Pixel scenes, galleries, RSVP demo. */
(function () {
  'use strict';
  var SW = window.SW, $ = SW.$, $$ = SW.$$, rng = SW.rng, doc = document;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) { return 'rgb(' + Math.round(lerp(c1[0], c2[0], t)) + ',' + Math.round(lerp(c1[1], c2[1], t)) + ',' + Math.round(lerp(c1[2], c2[2], t)) + ')'; }
  function mod(a, n) { return ((a % n) + n) % n; }

  /* ================= SCENE 1: Dhaka street at dusk ================= */
  function city(cv) {
    var x = cv.getContext('2d'), W = 320, H = 110, r = rng(9), far = [], near = [], farW = 0, nearW = 0, i;
    while (farW < W * 1.6) { var w = 14 + (r() * 20 | 0), h = 24 + (r() * 30 | 0); far.push({ x: farW, w: w, h: h, tank: r() < .3 }); farW += w + (r() * 3 | 0); }
    var cols = [[201, 183, 156], [176, 183, 196], [156, 90, 74], [143, 163, 184], [214, 199, 164], [120, 132, 150]];
    while (nearW < W * 2) {
      var nw = 26 + (r() * 26 | 0), nh = 34 + (r() * 30 | 0), b = { x: nearW, w: nw, h: nh, c: cols[r() * cols.length | 0], win: [], sign: r() < .45 ? ['#e5484d', '#22c55e', '#3d8bfd', '#f6c945'][r() * 4 | 0] : null, dome: r() < .12 };
      for (var wy = 4; wy < nh - 12; wy += 6) for (var wx = 3; wx < nw - 4; wx += 5) b.win.push({ x: wx, y: wy, s: r(), l: r() < .28 ? ['#e5484d', '#22c55e', '#3d8bfd'][r() * 3 | 0] : null });
      near.push(b); nearW += nw + 2 + (r() * 6 | 0);
    }
    var cars = [
      { k: 'bus', x: -60, y: 94, v: 9 }, { k: 'rick', x: 240, y: 104, v: -13 }, { k: 'car', x: 400, y: 90, v: -74, c: '#3d8bfd', f: true },
      { k: 'car', x: 620, y: 90, v: -88, c: '#f5f5f5', f: true }, { k: 'rick', x: 360, y: 104, v: -16 }
    ];
    function wheel(px, py) { x.fillStyle = '#15151a'; x.fillRect(px, py, 3, 3); x.fillStyle = '#8b8f96'; x.fillRect(px + 1, py + 1, 1, 1); }
    function cng(px, py) {
      x.fillStyle = '#0f3d22'; x.fillRect(px, py - 11, 13, 2);
      x.fillStyle = '#1f9d4d'; x.fillRect(px, py - 9, 14, 6); x.fillRect(px + 13, py - 7, 2, 4);
      x.fillStyle = '#bfe6ff'; x.fillRect(px + 8, py - 9, 4, 3); x.fillStyle = '#0f3d22'; x.fillRect(px + 3, py - 9, 4, 3);
      x.fillStyle = '#f6c945'; x.fillRect(px, py - 5, 14, 1);
      x.fillStyle = '#ffe066'; x.fillRect(px + 15, py - 5, 1, 2);
      wheel(px + 1, py - 3); wheel(px + 11, py - 3);
    }
    function rick(px, py) {
      x.fillStyle = '#e5484d'; x.fillRect(px, py - 10, 6, 4); x.fillStyle = '#3d8bfd'; x.fillRect(px, py - 8, 6, 1); x.fillStyle = '#f6c945'; x.fillRect(px + 1, py - 11, 4, 1);
      x.fillStyle = '#5b3a22'; x.fillRect(px + 1, py - 6, 6, 2); x.fillRect(px + 6, py - 4, 6, 1);
      x.fillStyle = '#e2a678'; x.fillRect(px + 8, py - 11, 2, 2); x.fillStyle = '#f5f5f5'; x.fillRect(px + 8, py - 9, 2, 4); x.fillStyle = '#27324f'; x.fillRect(px + 8, py - 5, 2, 2);
      x.fillStyle = '#15151a'; x.fillRect(px, py - 4, 4, 1); x.fillRect(px, py - 1, 4, 1); x.fillRect(px - 1, py - 3, 1, 2); x.fillRect(px + 4, py - 3, 1, 2);
      x.fillRect(px + 11, py - 3, 3, 1); x.fillRect(px + 11, py - 1, 3, 1); x.fillRect(px + 10, py - 2, 1, 1); x.fillRect(px + 14, py - 2, 1, 1);
    }
    function bus(px, py) {
      x.fillStyle = '#c73a2e'; x.fillRect(px, py - 15, 36, 13); x.fillStyle = '#f5f5f5'; x.fillRect(px, py - 8, 36, 2); x.fillStyle = '#16803d'; x.fillRect(px, py - 6, 36, 2);
      x.fillStyle = '#bfe6ff'; for (var k = 0; k < 6; k++) x.fillRect(px + 2 + k * 5, py - 13, 4, 4); x.fillRect(px + 32, py - 13, 3, 6);
      x.fillStyle = '#ffe066'; x.fillRect(px + 35, py - 5, 1, 2);
      wheel(px + 5, py - 3); wheel(px + 27, py - 3);
    }
    function car(px, py, c, flip) {
      x.fillStyle = c; x.fillRect(px, py - 6, 18, 4); x.fillRect(px + 4, py - 9, 10, 3);
      x.fillStyle = '#bfe6ff'; x.fillRect(px + 5, py - 8, 3, 2); x.fillRect(px + 10, py - 8, 3, 2);
      x.fillStyle = '#ffe066'; x.fillRect(flip ? px : px + 17, py - 5, 1, 2); x.fillStyle = '#e5484d'; x.fillRect(flip ? px + 17 : px, py - 5, 1, 2);
      wheel(px + 2, py - 3); wheel(px + 13, py - 3);
    }
    var stars = []; for (i = 0; i < 30; i++) stars.push([r() * W | 0, r() * 46 | 0]);
    var drops = []; for (i = 0; i < 46; i++) drops.push({ x: r() * W, y: r() * H, s: 90 + r() * 60 });
    var clock = $('#cityClock'), lastClock = '';

    return function (t, dt) {
      var cam = t * 34, night = (Math.sin(t * .12 - 1.2) + 1) / 2, rain = Math.max(0, Math.sin(t * .21 + 1) - .45) / .55;
      // sky bands
      var top = [lerp(86, 12, night), lerp(72, 16, night), lerp(140, 48, night)], bot = [lerp(255, 46, night), lerp(158, 52, night), lerp(110, 110, night)];
      for (i = 0; i < 9; i++) { x.fillStyle = mix(top, bot, i / 8); x.fillRect(0, i * 9, W, 9); }
      // sun or moon
      x.fillStyle = night > .5 ? '#eef0ff' : '#ffd166'; var oy = lerp(46, 16, Math.abs(night - .5) * 2); x.fillRect(236, oy, 12, 12);
      if (night > .5) { x.fillStyle = mix(top, bot, .2); x.fillRect(244, oy, 4, 4); }
      // stars
      if (night > .45) { x.fillStyle = 'rgba(255,255,255,' + (night - .45) * 1.6 + ')'; for (i = 0; i < stars.length; i++) x.fillRect(stars[i][0], stars[i][1], 1, 1); }
      // far skyline
      x.fillStyle = mix([112, 96, 150], [24, 28, 66], night);
      far.forEach(function (b) { var px = Math.floor(mod(b.x - cam * .12, farW)) - 40; x.fillRect(px, 78 - b.h, b.w, b.h); if (b.tank) x.fillRect(px + 3, 74 - b.h, 5, 4); });
      // near buildings
      near.forEach(function (b) {
        var px = Math.floor(mod(b.x - cam * .3, nearW)) - 60; if (px > W) return;
        var k = lerp(.86, .34, night); x.fillStyle = 'rgb(' + (b.c[0] * k | 0) + ',' + (b.c[1] * k | 0) + ',' + ((b.c[2] * k + night * 26) | 0) + ')';
        x.fillRect(px, 80 - b.h, b.w, b.h);
        x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(px + b.w - 2, 80 - b.h, 2, b.h); x.fillRect(px, 80 - b.h, b.w, 1);
        if (b.dome) { x.fillStyle = mix([230, 230, 220], [70, 80, 120], night); x.fillRect(px + 6, 74 - b.h, 10, 6); x.fillRect(px + 8, 71 - b.h, 6, 3); x.fillRect(px + 10, 68 - b.h, 2, 3); x.fillRect(px + b.w - 5, 62 - b.h, 2, 18); }
        b.win.forEach(function (w) {
          var lit = w.s < night * .75 && Math.floor(t * .2 + w.s * 40) % 9 !== 0;
          x.fillStyle = lit ? (w.s < .12 ? '#bfe6ff' : '#ffd97a') : mix([70, 84, 110], [20, 24, 44], night);
          x.fillRect(px + w.x, 80 - b.h + w.y, 3, 3);
          if (w.l) { x.fillStyle = w.l; x.fillRect(px + w.x, 80 - b.h + w.y + 3, 1, 1); x.fillRect(px + w.x + 2, 80 - b.h + w.y + 3, 1, 1); }
        });
        if (b.sign) { x.fillStyle = b.sign; x.fillRect(px + 3, 72, b.w - 8, 4); x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(px + 5, 73, b.w - 14, 1); }
        x.fillStyle = 'rgba(10,10,20,.5)'; x.fillRect(px + b.w / 2 - 2 | 0, 76, 4, 4);
      });
      // footpath, road
      x.fillStyle = mix([124, 128, 140], [58, 62, 80], night); x.fillRect(0, 80, W, 5);
      x.fillStyle = mix([160, 164, 172], [80, 84, 100], night); x.fillRect(0, 80, W, 1);
      x.fillStyle = mix([58, 60, 72], [30, 32, 44], night); x.fillRect(0, 85, W, 25);
      x.fillStyle = '#e9d27a'; for (i = -1; i < 12; i++) x.fillRect(Math.floor(i * 32 - mod(cam, 32)), 96, 14, 1);
      if (rain > 0) { x.fillStyle = 'rgba(170,200,255,' + rain * .14 + ')'; x.fillRect(0, 85, W, 25); }
      // street lamps
      for (i = -1; i < 5; i++) {
        var lx = Math.floor(i * 90 - mod(cam, 90)) + 40;
        x.fillStyle = '#2b2d35'; x.fillRect(lx, 56, 1, 26); x.fillRect(lx, 56, 5, 1);
        x.fillStyle = night > .35 ? '#ffe9a8' : '#9a9ea6'; x.fillRect(lx + 4, 57, 2, 1);
        if (night > .35) { x.fillStyle = 'rgba(255,220,130,' + (night - .35) * .11 + ')'; for (var g = 0; g < 6; g++) x.fillRect(lx + 4 - g, 58 + g * 4, 3 + g * 2, 26 - g * 4); }
      }
      // traffic
      cars.forEach(function (c) {
        c.x += c.v * dt; if (c.v > 0 && c.x > W + 60) c.x = -80 - Math.random() * 200; if (c.v < 0 && c.x < -60) c.x = W + 40 + Math.random() * 300;
        var px = Math.round(c.x), py = c.y + (Math.floor(t * 9 + c.x) % 2 ? 0 : 0);
        if (c.k === 'bus') bus(px, py); else if (c.k === 'rick') rick(px, py); else car(px, py, c.c, c.f);
      });
      var bob = Math.floor(t * 10) % 2;
      if (night > .35) { x.fillStyle = 'rgba(255,230,140,.13)'; for (var hl = 0; hl < 4; hl++) x.fillRect(137, 96 - hl, 10 + hl * 7, 2 + hl * 2); }
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(121, 100, 15, 1);
      cng(121, 100 - bob);
      // rain
      if (rain > 0) {
        x.fillStyle = 'rgba(200,220,255,' + rain * .6 + ')';
        drops.forEach(function (d) { d.y += d.s * dt; d.x -= d.s * dt * .3; if (d.y > H) { d.y = -4; d.x = Math.random() * (W + 40); } x.fillRect(d.x | 0, d.y | 0, 1, 3); });
      }
      if (clock) {
        var hr = night > .5 ? 21 : night > .25 ? 18 : 17, txt = 'Friday ' + hr + ':' + (10 + (Math.floor(t / 3) % 49)) + ' · ' + (rain > .3 ? 'Monsoon rain' : night > .5 ? 'Clear night' : 'Partly cloudy');
        if (txt !== lastClock) clock.textContent = lastClock = txt;
      }
    };
  }

  /* ================= SCENE 2: kash flowers by the river ================= */
  function kash(cv) {
    var x = cv.getContext('2d'), W = 320, H = 110, r = rng(21), stalks = [], seeds = [], i;
    for (i = 0; i < 130; i++) { var by = 80 + r() * 33; stalks.push({ x: r() * W, y: by, h: 15 + (by - 80) * .62 + r() * 9, p: r() * 6.28, l: 8 + r() * 5 }); }
    stalks.sort(function (a, b) { return a.y - b.y; });
    for (i = 0; i < 30; i++) seeds.push({ x: r() * W, y: 30 + r() * 60, s: 6 + r() * 12, p: r() * 6.28 });
    var clouds = [{ x: 30, y: 12, w: 34 }, { x: 150, y: 22, w: 26 }, { x: 260, y: 8, w: 40 }];
    return function (t, dt) {
      var top = [150, 208, 244], bot = [255, 238, 214];
      for (i = 0; i < 8; i++) { x.fillStyle = mix(top, bot, i / 7); x.fillRect(0, i * 9, W, 9); }
      // red sun, the logo colour
      var sx = 236, sy = 44, rad = 15 + Math.sin(t * .8) * .6;
      [[25, .1], [20, .14], [rad, 1]].forEach(function (ring) { x.fillStyle = 'rgba(237,27,36,' + ring[1] + ')'; var rr = ring[0]; for (var yy = -Math.ceil(rr); yy <= rr; yy++) { var hw = Math.floor(Math.sqrt(Math.max(0, rr * rr - yy * yy))); if (hw) x.fillRect(sx - hw, sy + yy, hw * 2, 1); } });
      // clouds
      x.fillStyle = '#ffffff';
      clouds.forEach(function (c) { var cx = mod(c.x + t * 2.2, W + 60) - 50; x.fillRect(cx, c.y + 3, c.w, 4); x.fillRect(cx + 4, c.y, c.w - 12, 4); x.fillRect(cx + 10, c.y - 2, c.w - 24, 2); });
      // far bank trees
      x.fillStyle = '#5d9c62'; for (i = 0; i < 40; i++) { var th = 4 + ((i * 37) % 7); x.fillRect(i * 8, 66 - th, 8, th); }
      x.fillStyle = '#4a8553'; x.fillRect(0, 64, W, 3);
      // river
      x.fillStyle = '#8cc8ea'; x.fillRect(0, 66, W, 14); x.fillStyle = '#a9dbf5'; x.fillRect(0, 66, W, 3);
      x.fillStyle = 'rgba(255,255,255,.75)'; for (i = 0; i < 16; i++) { var rx = mod(i * 47 + t * (6 + i % 3 * 3), W + 20) - 10; x.fillRect(rx | 0, 69 + (i * 5) % 10, 5 + i % 4, 1); }
      x.fillStyle = 'rgba(237,27,36,.25)'; for (i = 0; i < 5; i++) x.fillRect(sx - 8 + Math.sin(t + i) * 3 | 0, 68 + i * 2, 16 - i * 2, 1);
      // little boat
      var bx = mod(t * 5, W + 60) - 30, bb = Math.sin(t * 2) > 0 ? 0 : 1;
      x.fillStyle = '#5b3a22'; x.fillRect(bx | 0, 73 + bb, 16, 2); x.fillRect((bx | 0) - 2, 72 + bb, 3, 1); x.fillRect((bx | 0) + 15, 72 + bb, 3, 1);
      x.fillStyle = '#2f2118'; x.fillRect((bx | 0) + 6, 68 + bb, 2, 5); x.fillStyle = '#f5f5f5'; x.fillRect((bx | 0) + 5, 67 + bb, 4, 1);
      // field
      for (i = 0; i < 6; i++) { x.fillStyle = mix([150, 196, 120], [104, 160, 92], i / 5); x.fillRect(0, 80 + i * 5, W, 5); }
      // kash stalks
      var gust = Math.sin(t * .35) * 2.4;
      stalks.forEach(function (s) {
        var depth = (s.y - 80) / 34, sway = Math.sin(t * 1.15 + s.x * .055 + s.p * .2) * (1.6 + depth * 2) + gust * (.6 + depth), hgt = s.h | 0, k, px;
        x.fillStyle = depth < .35 ? '#a9c690' : '#8fb173';
        for (k = 0; k < hgt; k++) { px = s.x + sway * (k / hgt) * (k / hgt); x.fillRect(px | 0, (s.y - k) | 0, 1, 1); }
        var tx = s.x + sway, ty = s.y - hgt, L = s.l * (.75 + depth * .9), dir = sway > 0 ? 1 : -1;
        for (k = 0; k < L; k++) {
          var q = k / L, pw = 1 + Math.round(2.1 * Math.sin(Math.PI * q) * (.7 + depth * .9)), ppx = tx + dir * k * .55 + sway * .12 * k, ppy = ty - k * .8 + k * k * .045;
          x.fillStyle = '#ffffff'; x.fillRect((ppx - pw / 2) | 0, ppy | 0, pw, 1);
          if (pw > 1) { x.fillStyle = '#efe6d2'; x.fillRect((ppx + (dir > 0 ? -pw / 2 : pw / 2 - 1)) | 0, ppy | 0, 1, 1); }
        }
      });
      // drifting seeds
      x.fillStyle = '#ffffff';
      seeds.forEach(function (s) { s.x += (s.s + gust * 3) * dt; if (s.x > W + 4) { s.x = -4; s.y = 30 + Math.random() * 60; } x.globalAlpha = .55 + Math.sin(t * 2 + s.p) * .35; x.fillRect(s.x | 0, (s.y + Math.sin(t * .9 + s.p) * 5) | 0, 1, 1); });
      x.globalAlpha = 1;
    };
  }

  /* ================= SCENE 3: five a side from above ================= */
  function pitch(cv) {
    var x = cv.getContext('2d'), W = 320, H = 110, i;
    var home = [[24, 55], [86, 28], [86, 82], [150, 55], [206, 55]];
    var P = []; // players
    for (var tm = 0; tm < 2; tm++) for (i = 0; i < 5; i++) { var hx = tm ? W - home[i][0] : home[i][0]; P.push({ t: tm, i: i, hx: hx, hy: home[i][1], x: hx, y: home[i][1], ph: Math.random() * 6 }); }
    var ball = { x: 160, y: 55, z: 0 }, holder = P[3], fl = null, passes = 0, score = [0, 0], pause = 1.2, goalFx = $('#goalFx'), elA = $('#scA'), elB = $('#scB');
    function mates(p) { return P.filter(function (q) { return q.t === p.t && q !== p; }); }
    function kick(to, tx, ty, shot) { fl = { fx: ball.x, fy: ball.y, tx: tx, ty: ty, to: to, p: 0, d: Math.max(.35, Math.hypot(tx - ball.x, ty - ball.y) / (shot ? 190 : 120)), shot: shot }; }
    function next() {
      var dir = holder.t ? -1 : 1, goalX = holder.t ? 9 : W - 9;
      if (holder.i === 4 || passes >= 4 || (holder.i === 3 && Math.random() < .25)) { kick(null, goalX, 55 + (Math.random() - .5) * 14, true); passes = 0; return; }
      var opts = mates(holder).filter(function (q) { return q.i !== 0 && (q.x - holder.x) * dir > -30; }); if (!opts.length) opts = mates(holder);
      var to = opts[Math.random() * opts.length | 0]; passes++; kick(to, to.x + dir * 6, to.y, false);
    }
    function reset(team) { holder = P[team * 5 + 3]; ball.x = 160; ball.y = 55; fl = null; passes = 0; pause = 1.2; P.forEach(function (p) { p.x = p.hx; p.y = p.hy; }); }
    function circle(cx, cy, rad) { for (var a = 0; a < 48; a++) { var an = a / 48 * 6.283; x.fillRect(Math.round(cx + Math.cos(an) * rad), Math.round(cy + Math.sin(an) * rad), 1, 1); } }

    return function (t, dt) {
      // turf
      for (i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#2a9148' : '#2f9e4f'; x.fillRect(i * 20, 0, 20, H); }
      x.fillStyle = '#17603a'; x.fillRect(0, 0, W, 5); x.fillRect(0, H - 5, W, 5); x.fillRect(0, 0, 9, H); x.fillRect(W - 9, 0, 9, H);
      x.fillStyle = 'rgba(255,255,255,.85)';
      x.fillRect(9, 5, W - 18, 1); x.fillRect(9, H - 6, W - 18, 1); x.fillRect(9, 5, 1, H - 10); x.fillRect(W - 10, 5, 1, H - 10); x.fillRect(160, 5, 1, H - 10);
      circle(160, 55, 13); x.fillRect(159, 54, 3, 3);
      x.fillRect(9, 30, 26, 1); x.fillRect(9, 80, 26, 1); x.fillRect(35, 30, 1, 51); x.fillRect(W - 35, 30, 26, 1); x.fillRect(W - 35, 80, 26, 1); x.fillRect(W - 36, 30, 1, 51);
      x.fillStyle = '#ffffff'; x.fillRect(4, 45, 5, 1); x.fillRect(4, 65, 5, 1); x.fillRect(4, 45, 1, 21); x.fillRect(W - 9, 45, 5, 1); x.fillRect(W - 9, 65, 5, 1); x.fillRect(W - 5, 45, 1, 21);

      // play
      if (pause > 0) pause -= dt;
      else if (fl) {
        fl.p += dt / fl.d; var q = Math.min(1, fl.p);
        ball.x = lerp(fl.fx, fl.tx, q); ball.y = lerp(fl.fy, fl.ty, q); ball.z = Math.sin(q * Math.PI) * (fl.shot ? 2 : 5);
        if (q >= 1) {
          if (fl.shot) {
            var team = holder.t;
            if (Math.random() < .62) {
              score[team]++; if (elA) { elA.textContent = score[0]; elB.textContent = score[1]; }
              if (goalFx) { goalFx.classList.remove('on'); void goalFx.offsetWidth; goalFx.classList.add('on'); }
              if (score[0] + score[1] > 12) { score = [0, 0]; }
              fl = null; pause = 1.8; setTimeout(function () { reset(1 - team); }, 1500);
            } else { holder = P[(1 - team) * 5]; fl = null; pause = .7; passes = 0; }
          } else { holder = fl.to; fl = null; pause = .25 + Math.random() * .5; }
        }
      } else next();

      // movement
      P.forEach(function (p) {
        var dir = p.t ? -1 : 1, att = holder.t === p.t ? 26 : -8, tx = p.hx + dir * (p.i ? att : 0) + (ball.x - 160) * (p.i ? .22 : .03), ty = p.hy + (ball.y - p.hy) * (p.i ? .3 : .45);
        tx += Math.sin(t * .9 + p.ph) * 5; ty += Math.cos(t * 1.1 + p.ph) * 4;
        if (p === holder && !fl) { tx = ball.x - dir * 3; ty = ball.y; }
        p.x += (tx - p.x) * Math.min(1, dt * 2.6); p.y += (ty - p.y) * Math.min(1, dt * 2.6);
        if (p === holder && !fl && pause <= .6) { ball.x += (p.x + dir * 3 - ball.x) * .5; ball.y += (p.y - ball.y) * .5; ball.z = 0; }
      });
      P.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (p) {
        var px = Math.round(p.x), py = Math.round(p.y), bob = Math.floor(t * 7 + p.ph) % 2;
        x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(px - 2, py + 2, 5, 1);
        x.fillStyle = p.t ? '#f5f5f5' : '#1b1f4b'; x.fillRect(px - 1, py - 3 - bob, 3, 4);
        x.fillStyle = p.t ? '#e5484d' : '#b6f23c'; x.fillRect(px - 1, py - bob, 3, 1);
        if (p.i === 0) { x.fillStyle = '#f6c945'; x.fillRect(px - 1, py - 3 - bob, 3, 2); }
        x.fillStyle = '#e2a678'; x.fillRect(px - 1, py - 5 - bob, 3, 2); x.fillStyle = '#2a1d18'; x.fillRect(px - 1, py - 6 - bob, 3, 1);
      });
      x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(Math.round(ball.x) - 1, Math.round(ball.y) + 1, 2, 1);
      x.fillStyle = '#ffffff'; x.fillRect(Math.round(ball.x) - 1, Math.round(ball.y - ball.z) - 1, 2, 2);
    };
  }

  var scenes = { city: city, kash: kash, pitch: pitch };
  $$('canvas[data-scene]').forEach(function (cv) {
    var fn = scenes[cv.dataset.scene](cv), ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    SW.loop(cv, function (t, dt) { fn(t, dt || .033); }, 30);
  });

  /* ================= GALLERIES + LIGHTBOX ================= */
  var lb = $('#lightbox');
  function openLb(src, alt) { if (!lb) return; $('img', lb).src = src; $('img', lb).alt = alt || ''; lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); }
  if (lb) {
    lb.addEventListener('click', function () { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('on'); });
  }
  $$('[data-gallery]').forEach(function (g) {
    var imgs = $$('.frame__view img', g), cap = $('.frame__cap', g), th = $('.thumbs', g), cur = -1, timer = null, vis = false, view = $('.frame__view', g);
    function show(n, user) {
      cur = (n + imgs.length) % imgs.length;
      imgs.forEach(function (im, i) { im.classList.toggle('on', i === cur); if (i === cur || i === (cur + 1) % imgs.length) im.loading = 'eager'; });
      $$('.thumb', th).forEach(function (b, i) { b.classList.toggle('on', i === cur); });
      cap.textContent = imgs[cur].dataset.cap || imgs[cur].alt;
      if (user) restart();
    }
    function restart() { clearInterval(timer); if (vis) timer = setInterval(function () { if (!doc.hidden && !(lb && lb.classList.contains('on'))) show(cur + 1); }, 5200); }
    imgs.forEach(function (im, i) {
      var b = doc.createElement('button'); b.type = 'button'; b.className = 'thumb'; b.setAttribute('aria-label', 'Show screenshot ' + (i + 1));
      var t = doc.createElement('img'); t.src = im.getAttribute('src'); t.alt = ''; t.loading = 'lazy'; b.appendChild(t);
      b.addEventListener('click', function () { show(i, true); }); th.appendChild(b);
    });
    view.style.cursor = 'zoom-in';
    view.addEventListener('click', function () { openLb(imgs[cur].src, imgs[cur].alt); });
    show(0);
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; restart(); }, { threshold: .3 }).observe(g);
  });

  /* ================= RSVP DEMO ================= */
  (function () {
    var box = $('#rsvp'); if (!box) return;
    var CAP = 10, names = ['Striker', 'Nutmeg', 'Keeper', 'Tiki', 'Taka', 'Rocket', 'Captain', 'Lefty', 'Panna', 'Wall', 'Maestro', 'Turbo'];
    var state = {}; // name -> 'in' | 'out'
    ['Striker', 'Keeper', 'Tiki', 'Captain', 'Rocket'].forEach(function (n) { state[n] = 'in'; }); ['Lefty', 'Wall'].forEach(function (n) { state[n] = 'out'; });
    var ulIn = $('#rsvpIn'), ulOut = $('#rsvpOut'), cap = $('#rsvpCap'), log = $('#rsvpLog'), yes = $('#rsvpYes'), no = $('#rsvpNo'), els = {}, vis = false, voted = false;
    function chip(n) { var li = doc.createElement('li'); li.className = 'chipn' + (n === 'You' ? ' you' : ''); li.textContent = n; return li; }
    function count() { var c = 0; for (var k in state) if (state[k] === 'in') c++; return c; }
    function render() {
      // FLIP: remember where each chip was, move it, then animate from the old spot
      var first = {}, k; for (k in els) first[k] = els[k].getBoundingClientRect();
      for (k in state) { if (!els[k]) els[k] = chip(k); var target = state[k] === 'in' ? ulIn : ulOut; if (els[k].parentNode !== target) target.appendChild(els[k]); }
      for (k in els) if (!state[k]) { els[k].remove(); delete els[k]; }
      for (k in els) {
        var el = els[k], last = el.getBoundingClientRect(), f = first[k];
        if (SW.reduced) continue;
        if (!f) { el.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' }); continue; }
        var dx = f.left - last.left, dy = f.top - last.top;
        if (dx || dy) el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1.1)' }, { transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
      var c = count();
      $('i', cap).style.width = (c / CAP * 100) + '%'; cap.classList.toggle('full', c >= CAP);
      $('#rsvpCount').textContent = c + ' of ' + CAP + ' players'; $('#rsvpLeft').textContent = c >= CAP ? 'Full house' : (CAP - c) + ' spot' + (CAP - c === 1 ? '' : 's') + ' left';
      yes.disabled = state.You === 'in' || (c >= CAP && state.You !== 'in'); yes.textContent = state.You === 'in' ? 'You are in' : c >= CAP ? 'Full' : 'I am in';
      no.disabled = state.You === 'out'; no.textContent = state.You === 'out' ? 'You are out' : 'I am out';
    }
    function say(t) { log.textContent = t; }
    yes.addEventListener('click', function () { if (count() >= CAP) return; state.You = 'in'; render(); say('You are in. See you on the turf.'); SW.sfx.place(); if (!voted) { voted = true; SW.unlock('player'); } });
    no.addEventListener('click', function () { state.You = 'out'; render(); say('You are out. The squad will miss you.'); SW.sfx.place(); if (!voted) { voted = true; SW.unlock('player'); } });
    render();
    setInterval(function () {
      if (!vis || doc.hidden) return;
      var n = names[Math.random() * names.length | 0], c = count(), cur = state[n];
      if (cur === 'in') { if (c > 6 || Math.random() < .4) { state[n] = 'out'; say(n + ' dropped out.'); } else return; }
      else if (c < CAP) { state[n] = 'in'; say(n + (cur ? ' changed their mind and is in.' : ' is in.')); }
      else { state[n] = 'out'; say(n + ' missed the last spot.'); }
      render();
    }, 2600);
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: .3 }).observe(box);
  })();
})();
