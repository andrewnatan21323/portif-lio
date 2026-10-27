import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Scene3D({ active }: { active: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const [fallback, setFallback] = useState(false);
  activeRef.current = active;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!hasWebGL()) { setFallback(true); return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    // Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe9ee, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x42d6c3, 18, 20);
    rim.position.set(-4, -2, 3);
    scene.add(rim);

    // Sculpture
    const root = new THREE.Group();
    scene.add(root);
    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    const g = <T extends THREE.BufferGeometry>(x: T) => (geos.push(x), x);
    const m = <T extends THREE.Material>(x: T) => (mats.push(x), x);

    const core = new THREE.Mesh(
      g(new THREE.IcosahedronGeometry(1.15, 0)),
      m(new THREE.MeshPhysicalMaterial({ color: 0x087f8c, metalness: 0.55, roughness: 0.18, clearcoat: 1, flatShading: true })),
    );
    root.add(core);

    const shell = new THREE.Mesh(
      g(new THREE.IcosahedronGeometry(1.75, 1)),
      m(new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.08, thickness: 0.6, transparent: true, opacity: 0.55, flatShading: true })),
    );
    root.add(shell);
    const wire = new THREE.LineSegments(
      g(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.76, 1))),
      m(new THREE.LineBasicMaterial({ color: 0x42d6c3, transparent: true, opacity: 0.7 })),
    );
    root.add(wire);

    const ringMat = m(new THREE.MeshStandardMaterial({ color: 0x102a43, metalness: 0.8, roughness: 0.25 }));
    const ring1 = new THREE.Mesh(g(new THREE.TorusGeometry(2.45, 0.035, 12, 120)), ringMat);
    ring1.rotation.x = Math.PI / 2.4;
    const ring2 = new THREE.Mesh(g(new THREE.TorusGeometry(2.15, 0.05, 12, 120)), m(new THREE.MeshStandardMaterial({ color: 0x42d6c3, metalness: 0.4, roughness: 0.3, emissive: 0x42d6c3, emissiveIntensity: 0.15 })));
    ring2.rotation.set(Math.PI / 3, Math.PI / 5, 0);
    root.add(ring1, ring2);

    const cubeGeo = g(new THREE.BoxGeometry(0.22, 0.22, 0.22));
    const cubeMat = m(new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.2 }));
    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Mesh(cubeGeo, cubeMat);
      const a = (i / 7) * Math.PI * 2;
      s.position.set(Math.cos(a) * 2.45, 0, Math.sin(a) * 2.45);
      ring1.add(s);
      satellites.push(s);
    }

    // Interaction state
    let dragging = false, hovering = false;
    let lastX = 0, lastY = 0;
    const rot = { x: 0.2, y: 0 }, target = { x: 0.2, y: 0 };
    const tilt = { x: 0, y: 0 }, tiltTarget = { x: 0, y: 0 };
    let glow = 0;

    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tiltTarget.y = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
      tiltTarget.x = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
      if (!dragging) return;
      target.y += (e.clientX - lastX) * 0.01;
      target.x = THREE.MathUtils.clamp(target.x + (e.clientY - lastY) * 0.01, -1.3, 1.3);
      lastX = e.clientX; lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false; el.style.cursor = "grab";
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; tiltTarget.x = 0; tiltTarget.y = 0; };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.position.z = w / h < 0.9 ? 11 : 9;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([en]) => { if (en) visible = en.isIntersecting; });
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || !activeRef.current || document.hidden) return;
      if (!dragging && !reduced) target.y += dt * 0.25;
      const k = 1 - Math.pow(0.001, dt);
      rot.x += (target.x - rot.x) * k;
      rot.y += (target.y - rot.y) * k;
      tilt.x += (tiltTarget.x - tilt.x) * k * 0.6;
      tilt.y += (tiltTarget.y - tilt.y) * k * 0.6;
      if (!dragging) target.x += (0.2 - target.x) * dt * 0.8;
      root.rotation.set(rot.x + tilt.x, rot.y + tilt.y, 0);
      const t = clock.elapsedTime;
      if (!reduced) {
        core.rotation.y = -t * 0.4;
        ring2.rotation.z = t * 0.3;
        ring1.rotation.z = -t * 0.15;
        root.position.y = Math.sin(t * 0.8) * 0.08;
      }
      glow += ((hovering || dragging ? 1 : 0) - glow) * k;
      rim.intensity = 18 + glow * 22;
      root.scale.setScalar(1 + glow * 0.04);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      geos.forEach((x) => x.dispose());
      mats.forEach((x) => x.dispose());
      renderer.dispose();
      el.remove();
    };
  }, []);

  if (fallback) {
    return (
      <div className="flex h-full w-full items-center justify-center" aria-hidden>
        <div className="float-slow h-56 w-56 rotate-45 rounded-[2rem] border border-aqua/50 bg-secondary shadow-[var(--shadow-aqua)]" />
      </div>
    );
  }
  return <div ref={mountRef} className="h-full w-full" role="img" aria-label="Escultura geométrica 3D interativa — arraste para girar" />;
}
