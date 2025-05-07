import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

// Simple Cube Component
function SimpleCube({ position, color = '#9945FF', size = 1 }) {
  const mesh = useRef<Mesh>(null!);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh position={position} ref={mesh}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Simple Sphere Component
function SimpleSphere({ position, color = '#14F195', size = 1 }) {
  const mesh = useRef<Mesh>(null!);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      const t = clock.getElapsedTime() * 0.5;
      mesh.current.position.y = position[1] + Math.sin(t) * 0.2;
    }
  });

  return (
    <mesh position={position} ref={mesh}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function HomeScene() {
  return (
    <div className="w-full h-[70vh] bg-black/30 rounded-xl overflow-hidden border border-primary/20">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={['#050816']} />
        
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#9945FF" />
        <pointLight position={[5, -5, 5]} intensity={0.3} color="#14F195" />
        
        {/* Simple Cubes */}
        <SimpleCube position={[-2, 0, 0]} size={1} />
        <SimpleCube position={[2, -1, -2]} size={0.7} color="#14F195" />
        <SimpleCube position={[0, 2, -3]} size={0.5} color="#00FFA3" />
        
        {/* Simple Spheres */}
        <SimpleSphere position={[1, -1, 0]} size={0.6} />
        <SimpleSphere position={[-1.5, 1, -1]} size={0.4} color="#9945FF" />
        <SimpleSphere position={[0, -1.5, -1]} size={0.8} color="#00FFA3" />
        
        {/* Orbit controls for interactivity */}
        <OrbitControls 
          enableZoom={false}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.5}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}