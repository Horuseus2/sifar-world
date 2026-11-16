/* Sifar's World: shared sky scene + home page (island, inventory, stats). */
(function () {
  'use strict';
  var SW = window.SW, $ = SW.$, $$ = SW.$$, mk = SW.mk, rng = SW.rng, doc = document, root = doc.documentElement;
  var LAUNCH = new Date(2026, 10, 16); // world day 1

  /* ================= SKY ================= */
  (function sky() {
    var skyEl = $('.sky'); if (!skyEl) return;
    // stars
    $$('.stars').forEach(function (el, i) {
      var c = mk(128, 128), x = c.getContext('2d'), r = rng(40 + i * 9);
      for (var k = 0; k < 46; k++) { x.fillStyle = r() < .2 ? '#ffe9a8' : r() < .5 ? '#cfd6ff' : '#ffffff'; x.globalAlpha = .5 + r() * .5; x.fillRect(r() * 128 | 0, r() * 128 | 0, 1, 1); }
      el.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    });
    // clouds
    var cl = $('#clouds'), r = rng(5);
    function cloud(seed) {
      var rr = rng(seed), w = 22 + (rr() * 12 | 0), c = mk(w, 10), x = c.getContext('2d');
      x.fillStyle = '#ffffff';
      x.fillRect(2, 5, w - 4, 4); x.fillRect(0, 6, w, 2);
      var n = 2 + (rr() * 2 | 0);
      for (var i = 0; i < n; i++) { var bw = 6 + (rr() * 6 | 0), bx = 2 + (rr() * (w - bw - 4) | 0), bh = 2 + (rr() * 3 | 0); x.fillRect(bx, 5 - bh, bw, bh); x.fillRect(bx + 1, 4 - bh, bw - 2, 1); }
      x.fillStyle = '#dbeefa'; x.fillRect(2, 8, w - 4, 1); x.fillRect(3, 9, w - 6, 1);
      return { url: c.toDataURL(), w: w };
    }
    if (cl) for (var i = 0; i < 8; i++) {
      var c = cloud(100 + i), s = 4 + (r() * 4 | 0), d = doc.createElement('div'), dur = 80 + r() * 110;
      d.className = 'cloud';
      d.style.cssText = 'top:' + (4 + r() * 50) + '%;width:' + c.w * s + 'px;height:' + 10 * s + 'px;background-image:url(' + c.url + ');animation-duration:' + dur + 's;animation-delay:-' + (r() * dur) + 's;opacity:' + (.6 + r() * .4);
      cl.appendChild(d);
    }
    // birds + fireflies
    var bird = SW.sprite(['X...X.....', '.X.X.XX.XX', '..X....X..'], { X: '#2b3a55' });
    for (i = 0; i < 3; i++) {
      var b = doc.createElement('div'); b.className = 'bird';
      b.style.cssText = 'top:' + (14 + i * 9) + '%;background-image:url(' + bird.toDataURL() + ');background-size:40px 12px;animation-delay:-' + (i * .2) + 's,-' + (i * 9 + 3) + 's;animation-duration:.5s,' + (24 + i * 7) + 's';
      skyEl.appendChild(b);
    }
    for (i = 0; i < 12; i++) {
      var f = doc.createElement('i'); f.className = 'firefly';
      f.style.cssText = 'left:' + (4 + r() * 92) + '%;bottom:' + (70 + r() * 260) + 'px;animation-delay:-' + (r() * 7) + 's;animation-duration:' + (5 + r() * 5) + 's';
      skyEl.appendChild(f);
    }
    // hills
    function hills(h, seed, lo, hi, body, top, tree) {
      var c = mk(256, h), x = c.getContext('2d'), rr = rng(seed), cur = (lo + hi) / 2 | 0, hs = [];
      for (var i = 0; i < 32; i++) {
        var back = i > 25 ? ((lo + hi) / 2 | 0) - cur : 0;
        cur += back ? Math.sign(back) * 4 : ((rr() * 3 | 0) - 1) * 4; cur = Math.max(lo, Math.min(hi, cur)); hs.push(cur);
      }
      for (i = 0; i < 32; i++) {
        x.fillStyle = body; x.fillRect(i * 8, h - hs[i], 8, hs[i]);
        x.fillStyle = top; x.fillRect(i * 8, h - hs[i], 8, 2);
        if (tree && rr() < .34) {
          var tx = i * 8 + 2, ty = h - hs[i];
          x.fillStyle = tree[2]; x.fillRect(tx + 1, ty - 4, 2, 4);
          x.fillStyle = tree[0]; x.fillRect(tx - 2, ty - 10, 8, 6); x.fillRect(tx - 1, ty - 12, 6, 2);
          x.fillStyle = tree[1]; x.fillRect(tx - 1, ty - 11, 3, 2); x.fillRect(tx - 2, ty - 9, 2, 2);
        }
      }
      return 'url(' + c.toDataURL() + ')';
    }
    root.style.setProperty('--hill-far-d', hills(64, 3, 20, 56, '#a9dccf', '#c4ecdf'));
    root.style.setProperty('--hill-far-n', hills(64, 3, 20, 56, '#232f63', '#2e3c78'));
    root.style.setProperty('--hill-near-d', hills(48, 8, 8, 30, '#79c96a', '#97df83', ['#4fae4a', '#69c561', '#7a5234']));
    root.style.setProperty('--hill-near-n', hills(48, 8, 8, 30, '#1f3f4d', '#2a5362', ['#173340', '#1f4352', '#152a33']));
    // flowers on the ground
    var sp = $('#sprouts');
    if (sp) {
      var kinds = [
        SW.sprite(['........', '..RR.RR.', '..RRRRR.', '...RYR..', '...RRR..', '....G...', '..G.G...', '...GG...'], { R: '#ff6b7d', Y: '#ffe066', G: '#3f8f35' }),
        SW.sprite(['........', '...W.W..', '..WWYWW.', '...WYW..', '..W.G.W.', '....G.G.', '....GG..', '....G...'], { W: '#ffffff', Y: '#ffc83d', G: '#3f8f35' }),
        SW.sprite(['........', '........', '........', '.G...G..', '.G.G.G.G', '.GGG.GGG', '..GGGGG.', '..GGGGG.'], { G: '#4fa83c' }),
        SW.sprite(['........', '..PP....', '.PPPP...', '.PPYP...', '..PP..G.', '...G.G..', '...GG...', '...G....'], { P: '#b78cf0', Y: '#fff3b0', G: '#3f8f35' })
      ];
      for (i = 0; i < 18; i++) {
        var e = doc.createElement('i'); e.className = 'sprout';
        e.style.cssText = 'left:' + (1 + r() * 96) + '%;--i:' + i + ';background-image:url(' + kinds[r() * kinds.length | 0].toDataURL() + ')';
        sp.appendChild(e);
      }
    }
  })();

  /* ================= TITLE + SPLASH ================= */
  (function title() {
    var n = 0;
    $$('.title .w').forEach(function (w) {
      var t = w.textContent; w.textContent = '';
      t.split('').forEach(function (ch) { var s = doc.createElement('span'); s.className = 'l'; s.style.setProperty('--i', n++); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); w.appendChild(s); });
    });
    var sp = $('#splash'); if (!sp) return;
    var list = (sp.dataset.list ? sp.dataset.list.split('|') : ['Made in Dhaka!', '100% hand placed pixels!', 'Also try futsal!', 'Now with extra blocks!', 'Rain friendly!', 'Click the island!', 'Press 1 to 6!', 'Dig straight down!', 'Powered by cha!', 'Find the hidden gems!', 'Best viewed with snacks!', 'Night mode is cozy!', 'Zero loading screens! Almost!']);
    var idx = 0, clicks = 0;
    function next() { idx = (idx + 1 + (Math.random() * (list.length - 1) | 0)) % list.length; sp.textContent = list[idx]; }
    sp.addEventListener('click', function () { next(); SW.sfx.place(); if (++clicks >= 10) SW.unlock('splash'); });
    setInterval(function () { if (!doc.hidden) next(); }, 7000);
  })();

  /* ================= ISLAND ================= */
  (function island() {
    var cv = $('#island'); if (!cv) return;
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, OX = W / 2, OY = 62, N = 9, r = rng(1234);
    var SPR = {};
    function spr(type) { var v = r() * 3 | 0, k = type + v; return SPR[k] || (SPR[k] = SW.makeBlock(type, 10 + v * 17 + type.length)); }
    // silhouette mask for hit testing
    var mask = SW.makeBlock('stone', 1).getContext('2d').getImageData(0, 0, 16, 16).data;

    var blocks = [], top = {}; // top[x_y] = top standing height
    function add(x, y, z, type) { var b = { x: x, y: y, z: z, type: type, spr: spr(type), alive: true, t: 0, key: (x + y) * 100 + z }; blocks.push(b); return b; }
    var water = { '5_5': 1, '6_5': 1, '5_6': 1, '6_6': 1 };
    var land = {};
    for (var x = 0; x < N; x++) for (var y = 0; y < N; y++) {
      var d = Math.hypot(x - 4, y - 4) + (r() - .5) * .5; if (d < 4.35) land[x + '_' + y] = d;
    }
    function isLand(x, y) { return land[x + '_' + y] !== undefined; }
    for (var k in land) {
      var p = k.split('_'), bx = +p[0], by = +p[1], dd = land[k], h = 0, type = 'grass';
      if (Math.hypot(bx - 2.2, by - 2.4) < 1.5) h = 1;
      if (bx === 2 && by === 2) h = 2;
      if (water[k]) type = 'water';
      else if (water[(bx + 1) + '_' + by] || water[(bx - 1) + '_' + by] || water[bx + '_' + (by + 1)] || water[bx + '_' + (by - 1)]) type = 'sand';
      var dep = Math.max(1, Math.round((4.7 - dd) * 1.25 + r() * .8));
      for (var z = -dep; z < h; z++) add(bx, by, z, z >= h - 1 ? 'dirt' : (r() < .1 ? 'ore' : r() < .06 ? 'gold' : 'stone'));
      var tb = add(bx, by, h, type); tb.top = true;
      if (type !== 'water') top[k] = h;
    }
    // trees
    function tree(tx, ty, th, big) {
      var base = top[tx + '_' + ty]; delete top[tx + '_' + ty];
      for (var z = 1; z <= th; z++) add(tx, ty, base + z, 'log');
      var cz = base + th;
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue; if (!big && dx && dy) continue;
        add(tx + dx, ty + dy, cz, r() < .3 ? 'blossom' : 'leaf');
      }
      add(tx + 1, ty, cz + 1, 'leaf'); add(tx - 1, ty, cz + 1, r() < .5 ? 'blossom' : 'leaf'); add(tx, ty + 1, cz + 1, 'leaf'); add(tx, ty - 1, cz + 1, 'leaf'); add(tx, ty, cz + 1, 'leaf');
      if (big) add(tx, ty, cz + 2, 'blossom');
    }
    tree(6, 2, 3, true); tree(2, 6, 2, false);
    // decorations on grass tops
    var deco = {}, flowers = [
      SW.sprite(['.R.', 'RYR', '.R.', '.G.', '.G.'], { R: '#ff6b7d', Y: '#ffe066', G: '#2f7d2b' }),
      SW.sprite(['.W.', 'WYW', '.W.', '.G.', '.G.'], { W: '#ffffff', Y: '#ffc83d', G: '#2f7d2b' }),
      SW.sprite(['...', 'G.G', 'G.G', 'GGG', '.G.'], { G: '#3c9a34' }),
      SW.sprite(['.P.', 'PYP', '.P.', '.G.', '.G.'], { P: '#b78cf0', Y: '#fff3b0', G: '#2f7d2b' })
    ];
    blocks.forEach(function (b) { if (b.top && b.type === 'grass' && top[b.x + '_' + b.y] !== undefined && r() < .34) deco[b.x + '_' + b.y] = flowers[r() * flowers.length | 0]; });
    blocks.sort(function (a, b) { return a.key - b.key || a.x - b.x; });

    function sx(x, y) { return OX + (x - y) * 8; }
    function sy(x, y, z) { return OY + (x + y) * 4 - z * 8; }

    // the little explorer
    var manA = SW.sprite(['.HHHH.', 'HHHHHH', 'HSSSSH', '.SKSK.', '.SSSS.', 'BBBBBB', 'SBBBBS', '.BBBB.', '.PPPP.', '.P..P.'], { H: '#2a1d18', S: '#e2a678', K: '#1b1b1f', B: '#3d8bfd', P: '#27324f' });
    var manB = SW.sprite(['.HHHH.', 'HHHHHH', 'HSSSSH', '.SKSK.', '.SSSS.', 'BBBBBB', 'SBBBBS', '.BBBB.', '.PPPP.', '..PP..'], { H: '#2a1d18', S: '#e2a678', K: '#1b1b1f', B: '#3d8bfd', P: '#27324f' });
    var man = { x: 4, y: 4, fx: 4, fy: 4, tx: 4, ty: 4, p: 1, wait: 1.5, flip: false, say: 0, text: '' };
    function standable(x, y) { var k = x + '_' + y; if (top[k] === undefined) return false; var b = topBlock(x, y); return b && b.alive; }
    function topBlock(x, y) { for (var i = 0; i < blocks.length; i++) { var b = blocks[i]; if (b.top && b.x === x && b.y === y) return b; } return null; }
    function manZ(x, y) { return top[x + '_' + y] || 0; }

    var parts = [], petals = [], hover = null, hinted = false, say = $('#islandSay');
    var flies = [{ a: 0, c: '#ff8fb1' }, { a: 2.4, c: '#ffe066' }, { a: 4.4, c: '#ffffff' }];

    function pickAt(px, py) {
      for (var i = blocks.length - 1; i >= 0; i--) {
        var b = blocks[i]; if (!b.alive) continue;
        var lx = Math.floor(px - (sx(b.x, b.y) - 8)), ly = Math.floor(py - sy(b.x, b.y, b.z) - (b.type === 'water' ? 2 : 0));
        if (lx >= 0 && lx < 16 && ly >= 0 && ly < 16 && mask[(ly * 16 + lx) * 4 + 3] > 0) return b;
      }
      return null;
    }
    function toCanvas(e) { var rc = cv.getBoundingClientRect(); return [(e.clientX - rc.left) / rc.width * W, (e.clientY - rc.top) / rc.height * H]; }
    cv.addEventListener('mousemove', function (e) { var p = toCanvas(e); hover = pickAt(p[0], p[1]); });
    cv.addEventListener('mouseleave', function () { hover = null; });
    cv.addEventListener('click', function (e) {
      var p = toCanvas(e), b = pickAt(p[0], p[1]); if (!b) return;
      if (b.top && b.x === man.tx && b.y === man.ty) { man.say = 1.6; man.text = 'Hey!'; SW.sfx.place(); return; }
      b.alive = false; b.t = 5 + Math.random() * 3; hover = null;
      var pal = SW.blockPal[b.type], cols = pal.top.concat(pal.side), cx = sx(b.x, b.y), cy = sy(b.x, b.y, b.z) + 6;
      for (var i = 0; i < 12; i++) parts.push({ x: cx + (Math.random() - .5) * 10, y: cy + (Math.random() - .5) * 8, vx: (Math.random() - .5) * 46, vy: -20 - Math.random() * 50, l: .7 + Math.random() * .4, c: cols[Math.random() * cols.length | 0] });
      SW.sfx.pop();
      var n = SW.bump('blocks'); SW.unlock('miner'); if (n >= 25) SW.unlock('lumber');
      if (!hinted) { hinted = true; var hEl = $('#islandHint'); if (hEl) { hEl.textContent = 'Nice. Blocks grow back after a moment.'; setTimeout(function () { hEl.style.transition = 'opacity 1s'; hEl.style.opacity = 0; }, 3500); } }
    });

    function update(dt, t) {
      var i, b;
      for (i = 0; i < blocks.length; i++) { b = blocks[i]; if (!b.alive) { b.t -= dt; if (b.t <= 0) { b.alive = true; b.drop = 1; } } else if (b.drop) { b.drop = Math.max(0, b.drop - dt * 2.2); } }
      for (i = parts.length - 1; i >= 0; i--) { var q = parts[i]; q.vy += 190 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.l -= dt; if (q.l <= 0) parts.splice(i, 1); }
      if (Math.random() < dt * 1.2) petals.push({ x: sx(6, 2) + (Math.random() - .5) * 26, y: sy(6, 2, 5) + 6, l: 4, s: Math.random() * 6 });
      for (i = petals.length - 1; i >= 0; i--) { var pt = petals[i]; pt.y += 9 * dt; pt.x += Math.sin(t * 2 + pt.s) * 8 * dt + 3 * dt; pt.l -= dt; if (pt.l <= 0) petals.splice(i, 1); }
      // explorer walk
      if (man.p < 1) { man.p = Math.min(1, man.p + dt * 1.7); man.x = man.fx + (man.tx - man.fx) * man.p; man.y = man.fy + (man.ty - man.fy) * man.p; }
      else {
        man.wait -= dt;
        if (man.wait <= 0) {
          var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(function (d) { var nx = man.tx + d[0], ny = man.ty + d[1]; return standable(nx, ny) && Math.abs(manZ(nx, ny) - manZ(man.tx, man.ty)) <= 1; });
          if (dirs.length) { var dv = dirs[Math.random() * dirs.length | 0]; man.fx = man.tx; man.fy = man.ty; man.tx += dv[0]; man.ty += dv[1]; man.p = 0; man.flip = (dv[0] - dv[1]) < 0; }
          man.wait = .5 + Math.random() * 2.2;
          if (Math.random() < .12) { man.say = 2; man.text = ['Nice day.', 'Hi!', 'La la la', 'Mind the pond.', 'So calm.'][Math.random() * 5 | 0]; }
        }
      }
      if (man.say > 0) man.say -= dt;
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H); ctx.imageSmoothingEnabled = false;
      var mKey = (Math.max(man.fx + man.fy, man.tx + man.ty)) * 100 + Math.max(manZ(man.fx, man.fy), manZ(man.tx, man.ty)) + .5, manDone = false;
      function drawMan() {
        manDone = true;
        var z = manZ(man.fx, man.fy) + (manZ(man.tx, man.ty) - manZ(man.fx, man.fy)) * man.p, hop = Math.sin(man.p * Math.PI) * 4;
        var cx = Math.round(sx(man.x, man.y)), fy = Math.round(sy(man.x, man.y, z) + 5 - (man.p < 1 ? hop : Math.abs(Math.sin(t * 2)) * .6));
        ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(cx - 3, Math.round(sy(man.x, man.y, z)) + 4, 6, 2);
        var img = (man.p < 1 && Math.floor(t * 8) % 2) ? manB : manA;
        if (man.flip) { ctx.save(); ctx.translate(cx + 3, fy - 10); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0); ctx.restore(); } else ctx.drawImage(img, cx - 3, fy - 10);
        man.sx = cx; man.sy = fy - 10;
      }
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        if (!manDone && b.key > mKey) drawMan();
        if (!b.alive) continue;
        var px = sx(b.x, b.y) - 8, py = sy(b.x, b.y, b.z);
        if (b.drop) { var e = b.drop * b.drop; py -= Math.round(e * 26); ctx.globalAlpha = 1 - b.drop * .8; }
        if (b.type === 'water') py += 2;
        ctx.drawImage(b.spr, px, py);
        if (b.type === 'water') {
          ctx.fillStyle = 'rgba(255,255,255,.75)';
          var ph = Math.floor(t * 2.2 + b.x * 3 + b.y) % 6; ctx.fillRect(px + 4 + ph, py + 3, 2, 1); ctx.fillRect(px + 9 - ph * .5 | 0, py + 5, 2, 1);
        }
        if (b === hover) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .3; ctx.drawImage(b.spr, px, py); ctx.globalCompositeOperation = 'source-over'; }
        ctx.globalAlpha = 1;
        if (b.top && !b.drop) { var dc = deco[b.x + '_' + b.y]; if (dc) ctx.drawImage(dc, px + 6 + Math.round(Math.sin(t * 1.6 + b.x) * .6), py - 1); }
      }
      if (!manDone) drawMan();
      // petals, butterflies, particles
      for (i = 0; i < petals.length; i++) { ctx.fillStyle = i % 2 ? '#ffd3df' : '#ffb7c9'; ctx.globalAlpha = Math.min(1, petals[i].l); ctx.fillRect(petals[i].x | 0, petals[i].y | 0, 1, 1); }
      ctx.globalAlpha = 1;
      for (i = 0; i < flies.length; i++) {
        var f = flies[i], fx = OX + Math.cos(t * .5 + f.a) * 50 + Math.sin(t * 1.3 + f.a) * 10, fy2 = 52 + Math.sin(t * .8 + f.a * 2) * 22, wing = Math.floor(t * 9 + i) % 2;
        ctx.fillStyle = f.c; ctx.fillRect(fx | 0, fy2 | 0, 1, 1); ctx.fillRect((fx | 0) - 1, (fy2 | 0) - wing, 1, 1); ctx.fillRect((fx | 0) + 1, (fy2 | 0) - wing, 1, 1);
      }
      for (i = 0; i < parts.length; i++) { ctx.fillStyle = parts[i].c; ctx.globalAlpha = Math.min(1, parts[i].l * 2); ctx.fillRect(parts[i].x | 0, parts[i].y | 0, 2, 2); }
      ctx.globalAlpha = 1;
      // speech bubble
      if (say) {
        if (man.say > 0 && man.sx) { if (say.textContent !== man.text) say.textContent = man.text; say.style.left = (man.sx / W * 100) + '%'; say.style.top = (man.sy / H * 100) + '%'; say.classList.add('on'); }
        else say.classList.remove('on');
      }
    }
    SW.loop(cv, function (t, dt) { update(dt, t); draw(t); }, 30);
  })();

  /* ================= AVATAR ================= */
  (function () {
    var a = $('#avatar'); if (!a) return;
    var s = SW.sprite(['................', '....HHHHHHHH....', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHSSSSSSHHH..', '..HSSSSSSSSSSH..', '..SSWKSSSSWKSS..', '..SSSSSSSSSSSS..', '..SSSSSssSSSSS..', '..SSSMSSSSMSSS..', '...SSSMMMMSSS...', '....SSSSSSSS....', '..BBBBSSSSBBBB..', '.BBBBBBBBBBBBBB.', 'BBBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBBB'], { '.': '#bfe6ff', H: '#2a1d18', S: '#e2a678', s: '#c98a5e', W: '#ffffff', K: '#1b1b1f', M: '#8a3b34', B: '#3d8bfd' });
    a.style.backgroundImage = 'url(' + s.toDataURL() + ')';
  })();

  /* ================= SKILLS ================= */
  (function () {
    var grid = $('#skillGrid'); if (!grid) return;
    var items = [
      ['MK', 'Marketing strategy', '#22c55e', '#05230f', 'Knowing who a thing is for.'],
      ['BR', 'Brand building', '#b78cf0', '#2a1050', 'Turning a logo into a whole world.'],
      ['CS', 'Case solving', '#f6c945', '#3a2706', 'Messy problem in, clear plan out.'],
      ['PT', 'Pitching', '#ff7a8a', '#4a0f18', 'Selling an idea to a room of judges.'],
      ['UI', 'UI design', '#38bdf8', '#082f49', 'Layout, type, colour and feel.'],
      ['HTML', 'HTML', '#e44d26', '#fff', 'The bedrock of every build.'],
      ['CSS', 'CSS', '#2965f1', '#fff', 'Where the smooth motion lives.'],
      ['JS', 'JavaScript', '#f7df1e', '#2b2d33', 'Makes everything here move.'],
      ['TS', 'TypeScript', '#3178c6', '#fff', 'JavaScript with a helmet on.'],
      ['RE', 'React', '#61dafb', '#12303a', 'Reusable blocks for interfaces.'],
      ['NX', 'Next.js', '#15151a', '#fff', 'Full sites on top of React.'],
      ['3D', 'three.js', '#049ef4', '#fff', 'Renders the city in Boys Theft Auto.'],
      ['CV', 'Canvas', '#f97316', '#fff', 'Draws the island, pixel by pixel.'],
      ['WA', 'Web Audio', '#a855f7', '#fff', 'Every sound here is made live.'],
      ['FB', 'Firebase', '#ffca28', '#3a2706', 'Realtime votes and multiplayer.'],
      ['GS', 'GSAP', '#88ce02', '#12300b', 'Scroll driven animation.'],
      ['ND', 'Node.js', '#3c873a', '#fff', 'Build scripts and map baking.'],
      ['GIT', 'Git', '#f05032', '#fff', 'Save points for real life.']
    ];
    items.forEach(function (it, i) {
      var c = doc.createElement('div'); c.className = 'box skill lift'; c.setAttribute('data-r', ''); c.style.setProperty('--i', i % 3);
      c.innerHTML = '<i class="skill__ico" style="--c:' + it[2] + ';--tc:' + it[3] + '">' + it[0] + '</i><div><b></b><span></span></div>';
      $('b', c).textContent = it[1]; $('span', c).textContent = it[4];
      grid.appendChild(c);
    });
  })();

  /* ================= STATS ================= */
  (function () {
    var box = $('#stats'); if (!box) return;
    var S = SW.store, shown = false;
    function fmtTime(s) { var h = s / 3600 | 0, m = (s / 60 | 0) % 60, ss = s % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (ss < 10 ? '0' : '') + ss; }
    function day() { return Math.max(1, Math.floor((Date.now() - LAUNCH.getTime()) / 864e5) + 1); }
    function vals() { return { stVisits: SW.globalVisits || SW.visits, stYou: SW.visits, stDay: day(), stBlocks: S.get('blocks', 0), stGems: S.get('gems', 0), stAch: SW.achCount(), stQuests: 3 }; }
    function paint(anim) {
      var v = vals();
      for (var id in v) { var el = $('#' + id); if (!el) continue; if (anim) SW.count(el, v[id], { suf: id === 'stAch' ? ' / ' + SW.achTotal : '' }); else el.textContent = v[id].toLocaleString('en-US') + (id === 'stAch' ? ' / ' + SW.achTotal : ''); }
      $('#stTime').textContent = fmtTime(SW.played());
    }
    paint(false);
    new IntersectionObserver(function (es, io) { if (es[0].isIntersecting) { io.disconnect(); shown = true; paint(true); } }, { threshold: .25 }).observe(box);
    doc.addEventListener('sw:stat', function () { if (shown) setTimeout(function () { paint(false); }, 50); });
    doc.addEventListener('sw:tick', function () { $('#stTime').textContent = fmtTime(SW.played()); });
    var note = $('#stNote');
    if (note && !SW.globalVisits) note.textContent = 'Visits are counted on this device for now. A shared counter for all visitors is coming.';
  })();

  /* ================= COPY EMAIL ================= */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.copy, done = function () { b.textContent = 'Copied!'; SW.sfx.place(); if (!SW.unlock('mail')) SW.toast('✉️', 'Copied', v); setTimeout(function () { b.textContent = 'Copy address'; }, 2200); };
      function fallback() { var t = doc.createElement('textarea'); t.value = v; t.style.cssText = 'position:fixed;opacity:0'; doc.body.appendChild(t); t.select(); try { doc.execCommand('copy'); } catch (e) { } t.remove(); done(); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, fallback); else fallback();
    });
  });
})();
