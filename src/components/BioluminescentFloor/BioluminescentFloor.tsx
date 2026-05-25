import { useEffect, useRef } from 'react';
import './BioluminescentFloor.css';

const VERTEX_SRC = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

/**
 * Fragment shader: radial bioluminescent glow around a target point. The
 * target is blended between the smoothed cursor and a sine-driven idle
 * drift based on u_drift_mix (0 = follow cursor, 1 = drift). Outputs
 * premultiplied alpha so it pairs cleanly with blendFunc(ONE, ONE).
 */
const FRAGMENT_SRC = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_drift_mix;

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Idle ambient drift trajectory (in normalized space, then scaled)
    vec2 drift = vec2(
      sin(u_time * 0.5 + st.y * 4.0) * 0.32,
      cos(u_time * 0.4 + st.x * 4.0) * 0.18
    );
    vec2 driftPos = u_resolution * vec2(0.5 + drift.x, 0.45 + drift.y);
    vec2 target = mix(u_mouse, driftPos, u_drift_mix);

    float dist = distance(gl_FragCoord.xy, target);
    float halo = exp(-dist * 0.018) * 0.55;
    float core = exp(-dist * 0.045) * 0.95;
    float glow = clamp(halo + core, 0.0, 1.0);

    float shimmer = 0.85 + 0.15 * sin(u_time * 2.4 + dist * 0.05);
    vec3 teal  = vec3(0.30, 0.80, 0.63); // #4ecba0
    vec3 light = vec3(0.55, 0.95, 0.78);
    vec3 color = (teal * halo + light * core) * shimmer;

    // Premultiplied output — pair with blendFunc(ONE, ONE) for additive
    gl_FragColor = vec4(color * glow, glow);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[BioluminescentFloor] shader compile failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function BioluminescentFloor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    // ── Accessibility: live-react to OS-level reduced-motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isMotionReduced = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isMotionReduced = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[BioluminescentFloor] program link failed:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uDriftMix = gl.getUniformLocation(program, 'u_drift_mix');

    // Clean additive blend for premultiplied output
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    let canvasWidth = 1;
    let canvasHeight = 1;
    let rawMouseX = 0;
    let rawMouseY = 0;
    let smoothedMouseX = 0;
    let smoothedMouseY = 0;
    let lastRawX = 0;
    let lastRawY = 0;
    let idleSeconds = 0;
    let driftMix = 1; // start in drift mode so the floor is alive before any input
    let lastFrameTime = performance.now();
    let frameId = 0;

    // ── ResizeObserver with borderBoxSize fallback for older specs ──
    const ro = new ResizeObserver((entries) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const entry of entries) {
        let cssW: number;
        let cssH: number;
        if (entry.borderBoxSize && entry.borderBoxSize.length) {
          const box = entry.borderBoxSize[0];
          cssW = box.inlineSize;
          cssH = box.blockSize;
        } else {
          cssW = entry.contentRect.width;
          cssH = entry.contentRect.height;
        }
        canvasWidth = Math.max(1, Math.floor(cssW * dpr));
        canvasHeight = Math.max(1, Math.floor(cssH * dpr));
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        // Seed cursor near center on first sizing so the glow shows immediately
        if (smoothedMouseX === 0 && smoothedMouseY === 0) {
          rawMouseX = smoothedMouseX = canvasWidth / 2;
          rawMouseY = smoothedMouseY = canvasHeight * 0.45;
        }
      }
    });
    ro.observe(canvas);

    const updateMouseFromClient = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      rawMouseX = (clientX - rect.left) * dpr;
      rawMouseY = (rect.height - (clientY - rect.top)) * dpr;
      idleSeconds = 0;
    };
    const onMouseMove = (e: MouseEvent) => updateMouseFromClient(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) updateMouseFromClient(t.clientX, t.clientY);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const render = (now: number) => {
      const deltaSec = Math.min(0.1, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      // Idle detection based on raw cursor delta
      const moveMagnitude = Math.hypot(rawMouseX - lastRawX, rawMouseY - lastRawY);
      lastRawX = rawMouseX;
      lastRawY = rawMouseY;
      if (moveMagnitude < 0.5) idleSeconds += deltaSec;
      else idleSeconds = 0;

      // Smooth blend between cursor-follow (0) and drift (1)
      const targetMix = idleSeconds > 1.6 ? 1 : 0;
      driftMix += (targetMix - driftMix) * Math.min(1, deltaSec * 3.2);

      // Smooth cursor position
      const lerp = Math.min(1, deltaSec * 8);
      smoothedMouseX += (rawMouseX - smoothedMouseX) * lerp;
      smoothedMouseY += (rawMouseY - smoothedMouseY) * lerp;

      gl.uniform2f(uRes, canvasWidth, canvasHeight);
      gl.uniform2f(uMouse, smoothedMouseX, smoothedMouseY);
      gl.uniform1f(uTime, isMotionReduced ? 0 : now * 0.001);
      gl.uniform1f(uDriftMix, driftMix);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      motionQuery.removeEventListener('change', handleMotionChange);
      ro.disconnect();
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div className="bio-floor-container" aria-hidden="true">
      <canvas ref={canvasRef} className="bio-floor-canvas" />
      <div className="bio-floor-hud">
        Bioluminescent layer active // multi-pass additive blending
      </div>
    </div>
  );
}
