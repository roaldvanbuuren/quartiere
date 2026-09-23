/*
 * Depth field: the trylumen.io hero animation, ported from Lumen's DepthField.tsx
 * (itself ported from ELO Simulation's hero) to plain JS for the static site.
 *
 * A hidden looping video feeds frames into a WebGL2 texture. A lattice of points
 * samples it every frame; luminance drives each point's depth and size, so the
 * footage reads as a volumetric point cloud. Shaders are the originals, unchanged.
 *
 * Usage: <div class="depth-field" data-video="../../assets/lumen-depth-field.mp4"
 *             data-ash="238,229,212" data-warm="196,106,79"></div>
 * Decorative only: without WebGL2, or with prefers-reduced-motion, nothing renders.
 */
(function () {
  var VS = "#version 300 es\nprecision highp float;\nin vec2 aUv; in float aJit;\nuniform sampler2D uTex;\nuniform vec2 uRes, uCrop;\nuniform float uT;\nout float vE; out float vJit; out float vDepth; out float vRead;\nvoid main(){\n  vec2 suv = (aUv - 0.5) * uCrop + 0.5;\n  vec3 c = texture(uTex, vec2(suv.x, 1.0 - suv.y)).rgb;\n  float lum = dot(c, vec3(0.299,0.587,0.114));\n  float e = pow(clamp(lum,0.0,1.0), 0.38);\n  vE = e; vJit = aJit;\n  vRead = mix(0.34, 1.0, smoothstep(0.08, 0.52, aUv.x));\n  float z = 1.30 - e*0.34 + (aJit-0.5)*0.012;\n  vec2 p = aUv - 0.5;\n  float yaw = sin(uT*0.11)*0.072;\n  float pz0 = z - 1.0;\n  float px = p.x*cos(yaw) - pz0*sin(yaw);\n  float pz = max(p.x*sin(yaw) + pz0*cos(yaw) + 1.0, 0.22);\n  vDepth = pz;\n  float persp = 1.0/(pz*1.06);\n  gl_Position = vec4(vec2(px, p.y) * persp * 2.35, 0.0, 1.0);\n  gl_PointSize = (1.05 + e*2.6) * persp * (uRes.y/860.0) * 1.35;\n}";
  var FS = "#version 300 es\nprecision highp float;\nin float vE; in float vJit; in float vDepth; in float vRead;\nuniform vec3 uAsh, uWarm;\nuniform float uIntensity;\nout vec4 o;\nvoid main(){\n  vec2 pc = gl_PointCoord - vec2(0.5);\n  float tail = smoothstep(0.5,-0.05,pc.y) * max(0.0, 1.0 - abs(pc.x)*2.1);\n  float head = 1.0 - smoothstep(0.0,0.45,length(pc));\n  float a = head*0.90 + tail*0.32;\n  if(a <= 0.003) discard;\n  vec3 col = mix(uAsh*0.40, uAsh, smoothstep(0.10,0.62,vE));\n  col = mix(col, uWarm, smoothstep(0.72,1.00,vE)*0.85);\n  float far = clamp(1.0 - (vDepth-0.85)*0.45, 0.45, 1.0);\n  float br = (0.18 + vE*2.3) * far * vRead;\n  o = vec4(col, min(a*br*(0.60+0.40*vJit), 1.0)*uIntensity);\n}";

  function rgb(s, d) {
    var p = (s || d).split(",").map(function (x) { return parseFloat(x) / 255; });
    return p.length === 3 ? p : d.split(",").map(function (x) { return parseFloat(x) / 255; });
  }
  function shader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function init(host) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var canvas = document.createElement("canvas");
    host.appendChild(canvas);
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: "high-performance" });
    if (!gl) { canvas.remove(); return; }

    var video = document.createElement("video");
    video.src = host.getAttribute("data-video");
    video.muted = true; video.loop = true; video.playsInline = true; video.autoplay = true;
    video.setAttribute("playsinline", ""); video.preload = "auto";
    video.style.cssText = "position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
    video.addEventListener("loadedmetadata", function () { video.playbackRate = 0.5; });
    document.body.appendChild(video);
    video.play().catch(function () {});

    var width = host.getBoundingClientRect().width || window.innerWidth;
    var COLS = Math.min(512, Math.max(96, Math.round(width * 0.42)));
    var ROWS = Math.round(COLS * 9 / 16), N = COLS * ROWS;
    var uv = new Float32Array(N * 2), jit = new Float32Array(N), seed = 1;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var i = 0, y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++, i++) {
      uv[i * 2] = (x + 0.5) / COLS; uv[i * 2 + 1] = (y + 0.5) / ROWS; jit[i] = rnd();
    }

    var vs = shader(gl, gl.VERTEX_SHADER, VS), fs = shader(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindVertexArray(gl.createVertexArray());
    function buf(data, name, size) {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
    buf(uv, "aUv", 2); buf(jit, "aJit", 1);

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));

    var U = {};
    ["uTex", "uRes", "uCrop", "uT", "uAsh", "uWarm", "uIntensity"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform1i(U.uTex, 0);
    gl.uniform1f(U.uIntensity, parseFloat(host.getAttribute("data-intensity") || "1"));
    var ash = rgb(host.getAttribute("data-ash"), "238,229,212"), warm = rgb(host.getAttribute("data-warm"), "196,106,79");
    gl.uniform3f(U.uAsh, ash[0], ash[1], ash[2]);
    gl.uniform3f(U.uWarm, warm[0], warm[1], warm[2]);
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    function fit() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
      var w = Math.max(1, r.width), h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      var pa = w / h, sa = 16 / 9;
      if (pa > sa) gl.uniform2f(U.uCrop, 1.0, sa / pa); else gl.uniform2f(U.uCrop, pa / sa, 1.0);
    }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(host);

    var t0 = null, shown = false, dead = false, raf = 0;
    function frame(ts) {
      if (dead) return;
      raf = requestAnimationFrame(frame);
      if (t0 === null) t0 = ts;
      if (video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video); }
        catch (e) { dead = true; return; }
        if (!shown) { shown = true; canvas.classList.add("is-ready"); }
      }
      if (!shown) return;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uT, (ts - t0) / 1000);
      gl.drawArrays(gl.POINTS, 0, N);
    }
    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (e) { e[0] && e[0].isIntersecting ? start() : stop(); }, { rootMargin: "200px" }).observe(host);
    } else start();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) video.pause(); else { video.playbackRate = 0.5; video.play().catch(function () {}); }
    });
  }

  function boot() { Array.prototype.forEach.call(document.querySelectorAll(".depth-field"), init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
