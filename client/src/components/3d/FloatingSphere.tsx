import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';

interface FloatingSphereProps {
  position: [number, number, number];
  size?: number;
  color?: string;
  speed?: number;
  distort?: number;
  floatRadius?: number;
}

export default function FloatingSphere({
  position,
  size = 1,
  color = '#14F195',
  speed = 1,
  distort = 0.4,
  floatRadius = 0.2
}: FloatingSphereProps) {
  const mesh = useRef<Mesh>(null!);
  const time = useRef(0);
  const initialPosition = useRef(new Vector3(...position));
  
  useFrame(() => {
    time.current += 0.01 * speed;
    
    if (mesh.current) {
      // Float in a circular pattern
      mesh.current.position.x = initialPosition.current.x + Math.sin(time.current) * floatRadius;
      mesh.current.position.y = initialPosition.current.y + Math.cos(time.current) * floatRadius;
      
      // Slow rotation
      mesh.current.rotation.x = time.current * 0.3;
      mesh.current.rotation.z = time.current * 0.2;
    }
  });

  return (
    <mesh
      position={position}
      ref={mesh}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <MeshDistortMaterial
        color={color}
        speed={2}
        distort={distort}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
}