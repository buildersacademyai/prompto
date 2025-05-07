import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial } from '@react-three/drei';
import { Mesh } from 'three';

interface AnimatedCubeProps {
  position: [number, number, number];
  size?: number;
  color?: string;
  speed?: number;
  wobbleSpeed?: number;
  wobbleStrength?: number;
}

export default function AnimatedCube({
  position,
  size = 1,
  color = '#9945FF',
  speed = 0.01,
  wobbleSpeed = 1,
  wobbleStrength = 0.2
}: AnimatedCubeProps) {
  const mesh = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x = mesh.current.rotation.y += speed;
    }
  });

  return (
    <mesh
      position={position}
      ref={mesh}
      scale={clicked ? size * 1.2 : size}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <MeshWobbleMaterial 
        color={hovered ? '#14F195' : color} 
        factor={wobbleStrength} 
        speed={wobbleSpeed} 
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}