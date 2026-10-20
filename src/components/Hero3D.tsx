import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export const Hero3D: React.FC<{ lang: 'en' | 'ta' }> = ({ lang }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLowGraphics, setIsLowGraphics] = useState(false);

  useEffect(() => {
    // Detect low-spec devices
    const isLowSpec =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
      ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2);
    if (isLowSpec) {
      setIsLowGraphics(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 180;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1a3c, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed for Hero3D, falling back:', e);
      setIsLowGraphics(true);
      return;
    }

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff4d5a, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const cyanFillLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    cyanFillLight.position.set(-3, -2, -2);
    scene.add(cyanFillLight);

    // Procedural 3D Ambulance Hero Group
    const ambulanceGroup = new THREE.Group();

    // 1. Chassis / Main White Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.7, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.1,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.45;
    ambulanceGroup.add(bodyMesh);

    // 2. Red Emergency Side Stripe
    const stripeGeo = new THREE.BoxGeometry(1.61, 0.14, 0.81);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xff4d5a,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x991b1b,
      emissiveIntensity: 0.3,
    });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.y = 0.45;
    ambulanceGroup.add(stripeMesh);

    // 3. Cabin Windshield / Windows
    const cabinGeo = new THREE.BoxGeometry(0.6, 0.35, 0.78);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0.4, 0.65, 0);
    ambulanceGroup.add(cabinMesh);

    // 4. Wheels (4 black rubber tires with chrome rims)
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2,
    });

    const wheelPositions = [
      [-0.5, 0.18, 0.42],
      [0.5, 0.18, 0.42],
      [-0.5, 0.18, -0.42],
      [0.5, 0.18, -0.42],
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.13, 12), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(pos[0], pos[1], pos[2]);

      ambulanceGroup.add(wheel);
      ambulanceGroup.add(rim);
    });

    // 5. Roof Emergency Light Bar (Red and Blue Strobe)
    const beaconBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.08, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    beaconBase.position.set(0, 0.84, 0);
    ambulanceGroup.add(beaconBase);

    const redLightMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });
    const blueLightMat = new THREE.MeshStandardMaterial({
      color: 0x0066ff,
      emissive: 0x0066ff,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });

    const redBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.2), redLightMat);
    redBeacon.position.set(-0.1, 0.9, 0);
    ambulanceGroup.add(redBeacon);

    const blueBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.2), blueLightMat);
    blueBeacon.position.set(0.1, 0.9, 0);
    ambulanceGroup.add(blueBeacon);

    // 6. Glowing Radar Pulse Rings beneath ambulance
    const ringGeo = new THREE.RingGeometry(1.2, 1.25, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff4d5a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.02;
    scene.add(ringMesh);

    scene.add(ambulanceGroup);

    // Interactive pointer rotation
    let targetRotY = 0.4;
    let targetRotX = 0.1;
    let currentRotY = 0.4;
    let currentRotX = 0.1;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.9 + 0.4;
      targetRotX = -y * 0.3 + 0.1;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handlePointerMove);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damping on vehicle rotation
      currentRotY += (targetRotY - currentRotY) * 0.06;
      currentRotX += (targetRotX - currentRotX) * 0.06;
      ambulanceGroup.rotation.y = currentRotY;
      ambulanceGroup.rotation.x = currentRotX;

      // Subtle suspension floating
      ambulanceGroup.position.y = Math.sin(elapsedTime * 3) * 0.04;

      // Emergency Light Strobe Flash
      const strobe = Math.floor(elapsedTime * 6) % 2 === 0;
      redLightMat.emissiveIntensity = strobe ? 3.5 : 0.4;
      blueLightMat.emissiveIntensity = strobe ? 0.4 : 3.5;

      // Expand pulse ring
      const ringScale = (elapsedTime % 2) * 1.5;
      ringMesh.scale.set(ringScale, ringScale, ringScale);
      ringMat.opacity = Math.max(0, 0.7 - ringScale * 0.4);

      if (renderer) {
        renderer.render(scene, camera);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handlePointerMove);
      if (renderer && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, [isLowGraphics]);

  if (isLowGraphics) {
    return (
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{lang === 'ta' ? 'அதிவேக 3D அவசர ஆம்புலன்ஸ் இயக்கம் தயார்' : '3D Rapid Dispatch Engine Active'}</span>
        </div>
        <button
          onClick={() => setIsLowGraphics(false)}
          className="text-xs text-rose-400 hover:text-white transition flex items-center gap-1 font-mono"
        >
          <Eye className="w-3.5 h-3.5" />
          {lang === 'ta' ? '3D காட்சியை இயக்கு' : 'Enable 3D Hero'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-gradient-to-b from-[#0A1A3C]/90 to-slate-950/90 border border-slate-800 shadow-2xl flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Hero Overlay HUD */}
      <div className="absolute top-2.5 left-3 pointer-events-none flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
          {lang === 'ta' ? '3D நிகழ்நேர ஆம்புலன்ஸ் மாதிரி' : '3D Real-time Telemetry Model'}
        </span>
      </div>

      <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          {lang === 'ta' ? 'சுழற்ற இழுக்கவும்' : 'Drag to rotate 3D model'}
        </span>
        <button
          onClick={() => setIsLowGraphics(true)}
          className="text-[10px] bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-2 py-1 rounded font-mono border border-slate-800 flex items-center gap-1 cursor-pointer transition"
          title="Toggle 2D mode"
        >
          <EyeOff className="w-3 h-3" />
          {lang === 'ta' ? '2D முறை' : 'Low GPU'}
        </button>
      </div>
    </div>
  );
};
