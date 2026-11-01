import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- Cyber Shark 3D Mesh ---
const CyberSharkMesh = ({ isShark = true }) => {
  const groupRef = useRef();
  const tail1Ref = useRef();
  const tail2Ref = useRef();
  const caudalRef = useRef();
  const finLeftRef = useRef();
  const finRightRef = useRef();
  const headRef = useRef();

  // Colors & Materials
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isShark ? '#121a24' : '#d9531e', // Dark cyber navy for shark, cyber orange/koi for koi
      metalness: 0.85,
      roughness: 0.25,
      wireframe: false,
    });
  }, [isShark]);

  const underbellyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isShark ? '#223244' : '#e6f7ff',
      metalness: 0.7,
      roughness: 0.3,
    });
  }, [isShark]);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isShark ? '#00ff41' : '#00e5ff',
      emissive: isShark ? '#00ff41' : '#00e5ff',
      emissiveIntensity: 2.5,
      toneMapped: false,
    });
  }, [isShark]);

  const finMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isShark ? '#0a1017' : '#ff7a45',
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
  }, [isShark]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const swimFreq = isShark ? 3.6 : 2.8;

    // 1. Natural spine undulation from front to rear
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * swimFreq) * -0.06;
    }
    if (tail1Ref.current) {
      tail1Ref.current.rotation.y = Math.sin(t * swimFreq - 0.4) * 0.22;
    }
    if (tail2Ref.current) {
      tail2Ref.current.rotation.y = Math.sin(t * swimFreq - 0.9) * 0.32;
    }
    if (caudalRef.current) {
      caudalRef.current.rotation.y = Math.sin(t * swimFreq - 1.5) * 0.48;
    }

    // 2. Fin fluttering
    if (finLeftRef.current) {
      finLeftRef.current.rotation.z = -0.3 + Math.sin(t * swimFreq) * 0.08;
    }
    if (finRightRef.current) {
      finRightRef.current.rotation.z = 0.3 - Math.sin(t * swimFreq) * 0.08;
    }

    // 3. True 3D Orbiting around center (0,0,0) / MOHAMMED MOSHII
    if (groupRef.current) {
      const speed = 0.45;
      const angle = t * speed;

      const rx = 4.3; // Horizontal orbit radius
      const rz = 2.8; // Depth orbit radius
      const ry = 0.9; // Vertical sine wave

      const x = Math.sin(angle) * rx;
      const z = Math.cos(angle) * rz;
      const y = Math.sin(angle * 2.0) * ry;

      // Tangent velocity for heading
      const vx = Math.cos(angle) * rx;
      const vz = -Math.sin(angle) * rz;
      const vy = Math.cos(angle * 2.0) * 2.0 * ry;

      groupRef.current.position.set(x, y, z);

      // Point in direction of velocity
      groupRef.current.rotation.y = Math.atan2(vx, vz);
      // Banking into the turn
      groupRef.current.rotation.z = -Math.sin(angle) * 0.35;
      // Pitching up and down with dive
      groupRef.current.rotation.x = -vy * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={[0.85, 0.85, 0.85]}>
      {/* --- HEAD & SNOUT --- */}
      <group ref={headRef} position={[0, 0, 0.8]}>
        {/* Head Mesh */}
        <mesh position={[0, 0, 0.3]} scale={[0.55, 0.42, 0.9]} material={bodyMaterial}>
          <coneGeometry args={[1, 1, 16]} />
        </mesh>

        {/* Cyber Eyes */}
        <mesh position={[0.42, 0.08, 0.2]} scale={[0.1, 0.1, 0.1]} material={glowMaterial}>
          <sphereGeometry args={[1, 12, 12]} />
        </mesh>
        <mesh position={[-0.42, 0.08, 0.2]} scale={[0.1, 0.1, 0.1]} material={glowMaterial}>
          <sphereGeometry args={[1, 12, 12]} />
        </mesh>

        {/* Cyber Neon Gills */}
        <mesh position={[0.48, -0.05, -0.1]} scale={[0.04, 0.16, 0.4]} material={glowMaterial}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        <mesh position={[-0.48, -0.05, -0.1]} scale={[0.04, 0.16, 0.4]} material={glowMaterial}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      </group>

      {/* --- MAIN TORSO --- */}
      <mesh position={[0, 0, 0]} scale={[0.62, 0.52, 1.4]} material={bodyMaterial}>
        <sphereGeometry args={[1, 24, 24]} />
      </mesh>

      {/* Underbelly */}
      <mesh position={[0, -0.12, 0]} scale={[0.56, 0.38, 1.35]} material={underbellyMaterial}>
        <sphereGeometry args={[1, 20, 20]} />
      </mesh>

      {/* --- DORSAL FIN (Top) --- */}
      <mesh position={[0, 0.65, -0.1]} rotation={[-0.45, 0, 0]} scale={[0.08, 0.75, 0.55]} material={finMaterial}>
        <coneGeometry args={[1, 1, 4]} />
      </mesh>

      {/* --- PECTORAL FINS (Wings) --- */}
      {/* Left Fin */}
      <mesh ref={finLeftRef} position={[0.58, -0.15, 0.2]} rotation={[0.2, 0, -0.35]} scale={[0.85, 0.06, 0.55]} material={finMaterial}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {/* Right Fin */}
      <mesh ref={finRightRef} position={[-0.58, -0.15, 0.2]} rotation={[0.2, 0, 0.35]} scale={[0.85, 0.06, 0.55]} material={finMaterial}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>

      {/* --- ARTICULATED TAIL (3 Joints) --- */}
      {/* Joint 1: Mid Tail */}
      <group ref={tail1Ref} position={[0, 0, -0.7]}>
        <mesh position={[0, 0, -0.45]} scale={[0.42, 0.36, 0.9]} material={bodyMaterial}>
          <cylinderGeometry args={[0.7, 1.0, 1, 16]} />
        </mesh>

        {/* Joint 2: Rear Tail */}
        <group ref={tail2Ref} position={[0, 0, -0.9]}>
          <mesh position={[0, 0, -0.4]} scale={[0.26, 0.24, 0.8]} material={bodyMaterial}>
            <cylinderGeometry args={[0.5, 0.9, 1, 14]} />
          </mesh>

          {/* Joint 3: Caudal (Tail Fin) */}
          <group ref={caudalRef} position={[0, 0, -0.8]}>
            {/* Top Lobe of Tail Fin */}
            <mesh position={[0, 0.45, -0.35]} rotation={[0.5, 0, 0]} scale={[0.06, 0.85, 0.45]} material={finMaterial}>
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
            {/* Bottom Lobe of Tail Fin */}
            <mesh position={[0, -0.3, -0.28]} rotation={[-0.5, 0, 0]} scale={[0.06, 0.55, 0.35]} material={finMaterial}>
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
            {/* Cyber Light Trail on Tail */}
            <mesh position={[0, 0.1, -0.4]} scale={[0.08, 0.9, 0.08]} material={glowMaterial}>
              <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

export default CyberSharkMesh;
