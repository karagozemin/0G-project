"use client";

import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sphere, OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";

// --- SHADERS ---
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
    gl_FragColor = vec4(0.0, 0.85, 0.65, 1.0) * intensity * 0.9;
  }
`;

// --- COMPONENTS ---

function EarthWithMarkers() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load Earth texture - Blue marble (colorful day view)
  const earthTexture = useLoader(
    THREE.TextureLoader, 
    "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg"
  );

  // More validator positions on globe surface
  const markerPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const count = 40; // Increased from 25
    
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);
      
      positions.push(new THREE.Vector3(x, y, z).multiplyScalar(1.02));
    }
    return positions;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008; // Slightly faster rotation
    }
  });

  return (
    <group>
      {/* Rotating group - Earth + Markers + Arcs rotate together */}
      <group ref={groupRef}>
        {/* Base Earth Sphere with colorful texture - CLEAN & SOLID */}
        <Sphere args={[1, 64, 64]}>
      <meshStandardMaterial
            map={earthTexture}
            roughness={0.5}
            metalness={0}
      />
    </Sphere>

        {/* Validator dots - Fixed on globe surface */}
        {markerPositions.map((pos, i) => (
          <GlowingMarker 
            key={i} 
            position={pos} 
            color={i % 3 === 0 ? "#00D9A5" : i % 3 === 1 ? "#00B894" : "#10B981"}
            size={0.016}
          />
        ))}

        {/* Transaction arcs - NOW INSIDE rotating group! */}
        <TransactionFlows validatorPositions={markerPositions} />
      </group>

      {/* Atmosphere Glow - Visible at edges */}
      <mesh scale={[1.18, 1.18, 1.18]}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Static glowing dot marker - NO animation
function GlowingMarker({ position, color = "#00D9A5", size = 0.02 }: { position: THREE.Vector3; color?: string; size?: number }) {
  return (
    <group position={position}>
      {/* Core dot - bright center */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      {/* Glow ring - static */}
      <mesh>
        <sphereGeometry args={[size * 1.8, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Visible animated arc with TUBE geometry for thickness
function AnimatedArc({ 
  startPos, 
  endPos, 
  duration = 0.5,
  color = "#00D9A5"
}: { 
  startPos: THREE.Vector3; 
  endPos: THREE.Vector3; 
  delay?: number;
  duration?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(Math.random() * 0.3);
  
  // Create curve - arc stays ABOVE globe surface
  const { curve, curvePoints } = useMemo(() => {
    const distance = startPos.distanceTo(endPos);
    // Higher arc to avoid clipping through globe (globe radius = 1)
    const arcHeight = 1.4 + distance * 0.2;
    
    const mid = new THREE.Vector3()
      .addVectors(startPos, endPos)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(arcHeight);
      
    const c = new THREE.QuadraticBezierCurve3(startPos.clone(), mid, endPos.clone());
    const points = c.getPoints(50);
    
    return { curve: c, curvePoints: points };
  }, [startPos, endPos]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    progressRef.current += delta / duration;
    
    // Loop
    if (progressRef.current > 1.25) {
      progressRef.current = 0;
    }
    
    const progress = Math.min(progressRef.current, 1);
    const totalPts = curvePoints.length;
    const headIdx = Math.floor(progress * (totalPts - 1));
    const tailLen = 15;
    const tailIdx = Math.max(0, headIdx - tailLen);
    
    // Create tube from visible points
    const visiblePts = curvePoints.slice(tailIdx, headIdx + 1);
    if (visiblePts.length >= 2) {
      const pathCurve = new THREE.CatmullRomCurve3(visiblePts);
      const tubeGeom = new THREE.TubeGeometry(pathCurve, 20, 0.006, 8, false);
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = tubeGeom;
      meshRef.current.visible = true;
    } else {
      meshRef.current.visible = false;
    }
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 20, 0.006, 8, false]} />
      <meshBasicMaterial 
        color={color} 
        transparent
        opacity={1}
      />
    </mesh>
  );
}

// Transaction flow manager - continuous random arcs with distance check
function TransactionFlows({ validatorPositions }: { validatorPositions: THREE.Vector3[] }) {
  const [arcs, setArcs] = useState<Array<{
    id: number;
    start: THREE.Vector3;
    end: THREE.Vector3;
    color: string;
    speed: number;
  }>>([]);
  
    const colors = [
      "#00D9A5", "#00B894", "#10B981", "#059669",  // Mantle Teal/Green
      "#00FFFF", "#00BFFF", "#1E90FF",              // Cyan/Mavi
      "#34D399", "#6EE7B7", "#A7F3D0",              // Light Green
      "#00FF00", "#7CFC00", "#ADFF2F",              // Bright Green
      "#FFFFFF", "#F0F0F0"                          // Beyaz
    ];
  const arcIdRef = useRef(0);
  const lastUsedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Create arc from a specific starting point to a distant point
    const createArcFromPoint = (startIdx: number) => {
      const startPos = validatorPositions[startIdx];
      
      // Find furthest points and pick one randomly
      const distances = validatorPositions.map((pos, idx) => ({
        idx,
        dist: startPos.distanceTo(pos)
      }));
      
      // Sort by distance and pick from the far ones
      distances.sort((a, b) => b.dist - a.dist);
      const farPoints = distances.slice(0, Math.ceil(validatorPositions.length / 3));
      const chosen = farPoints[Math.floor(Math.random() * farPoints.length)];
      
      arcIdRef.current += 1;
      return {
        id: arcIdRef.current,
        start: startPos,
        end: validatorPositions[chosen.idx],
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.4 + Math.random() * 0.3 // Varied speeds
      };
    };

    // Create initial arcs from different starting points
    const initial: typeof arcs = [];
    const step = Math.max(1, Math.floor(validatorPositions.length / 15));
    for (let i = 0; i < validatorPositions.length; i += step) {
      initial.push(createArcFromPoint(i));
      lastUsedRef.current.add(i);
    }
    setArcs(initial);

    // Continuously add new arcs from rotating points
    let nextStartIdx = 0;
    const addInterval = setInterval(() => {
      // Cycle through all points
      nextStartIdx = (nextStartIdx + 1) % validatorPositions.length;
      
      setArcs(prev => {
        const newArc = createArcFromPoint(nextStartIdx);
        const updated = [...prev, newArc];
        return updated.slice(-25); // Keep max 25 active arcs
      });
    }, 200); // Add new arc every 200ms

    return () => clearInterval(addInterval);
  }, [validatorPositions]);

  return (
    <group>
      {arcs.map(arc => (
        <AnimatedArc
          key={arc.id}
          startPos={arc.start}
          endPos={arc.end}
          color={arc.color}
          duration={arc.speed}
      />
      ))}
    </group>
  );
}

export default function Globe() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 4.8], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-3, 2, -3]} intensity={1.2} color="#00D9A5" />
        <pointLight position={[-5, -2, -5]} intensity={1} color="#00B894" />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffffff" />
        
        <Suspense fallback={null}>
          <EarthWithMarkers />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
