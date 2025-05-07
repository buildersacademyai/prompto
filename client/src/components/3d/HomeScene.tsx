import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Pure Three.js implementation (not using React Three Fiber)
export default function HomeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#050816');
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50, 
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 8;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const purpleLight = new THREE.PointLight(0x9945FF, 1, 15);
    purpleLight.position.set(-5, 5, 5);
    scene.add(purpleLight);
    
    const greenLight = new THREE.PointLight(0x14F195, 0.8, 15);
    greenLight.position.set(5, -5, 5);
    scene.add(greenLight);
    
    // Create objects
    const objects: THREE.Object3D[] = [];
    
    // Create cubes
    const createCube = (x: number, y: number, z: number, size: number, color: string, flowSpeed: number = 0) => {
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(color),
        metalness: 0.3,
        roughness: 0.4,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, y, z);
      cube.userData = { 
        rotationSpeed: 0.01 * Math.random() + 0.005,
        flowSpeed: flowSpeed,
        initialX: x,
        // Starting position on the left side of the canvas (will be randomized)
        startX: -10 - Math.random() * 5,
        // Reset position (will be farther than the right side)
        endX: 10 + Math.random() * 5
      };
      scene.add(cube);
      objects.push(cube);
      return cube;
    };
    
    // Create spheres
    const createSphere = (x: number, y: number, z: number, radius: number, color: string, flowSpeed: number = 0) => {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(color),
        metalness: 0.2,
        roughness: 0.3,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.userData = { 
        baseY: y,
        floatSpeed: 0.5 * Math.random() + 0.3,
        floatHeight: 0.2 * Math.random() + 0.1,
        timeOffset: Math.random() * Math.PI * 2,
        flowSpeed: flowSpeed,
        initialX: x,
        // Starting position on the left side of the canvas (will be randomized)
        startX: -10 - Math.random() * 5,
        // Reset position (will be farther than the right side)
        endX: 10 + Math.random() * 5
      };
      scene.add(sphere);
      objects.push(sphere);
      return sphere;
    };
    
    // No solid objects - they're hidden per user request
    // We'll only use particle systems for the visual effects
    
    // Add enhanced particle effects flowing from left to right
    const particleCount = 800; // Increased count for more density
    
    // WHITE PARTICLES (Main flow)
    const particles = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({ 
      size: 0.05, // Larger size
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true, // Makes particles smaller with distance
    });
    
    // Create arrays to store particle positions and their flow speeds
    const particlePositions = new Float32Array(particleCount * 3);
    const flowSpeeds = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Distribute particles in a curved stream-like shape extending from left to right
      const x = -15 + Math.random() * 30; // initial x across the scene
      const y = -4 + Math.random() * 8;  // height variation
      const z = -5 + Math.random() * 5;  // depth variation
      
      // Curve the stream slightly
      const distance = Math.sqrt(x*x + y*y);
      
      particlePositions[i3] = x;
      particlePositions[i3 + 1] = y + Math.sin(distance * 0.1) * 0.5;
      particlePositions[i3 + 2] = z;
      
      // Assign random flow speeds - faster at the center of stream
      flowSpeeds[i] = 0.6 + Math.random() * 1.8;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Store flow speeds in userData for later animation
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.userData = { 
      flowSpeeds: flowSpeeds,
      positions: particlePositions,
      leftBound: -15,
      rightBound: 15
    };
    
    scene.add(particleSystem);
    objects.push(particleSystem);
    
    // PRIMARY COLOR PARTICLES (Purple)
    const particlesPrimary = new THREE.BufferGeometry();
    const particleMaterialPrimary = new THREE.PointsMaterial({ 
      size: 0.04,
      color: 0x9945FF, // Primary brand color
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    
    const particlePositionsPrimary = new Float32Array(particleCount * 3);
    const flowSpeedsPrimary = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      const x = -15 + Math.random() * 30;
      const y = -4 + Math.random() * 8;
      const z = -4 + Math.random() * 5;
      
      particlePositionsPrimary[i3] = x;
      particlePositionsPrimary[i3 + 1] = y;
      particlePositionsPrimary[i3 + 2] = z;
      
      flowSpeedsPrimary[i] = 0.4 + Math.random() * 1.5;
    }
    
    particlesPrimary.setAttribute('position', new THREE.BufferAttribute(particlePositionsPrimary, 3));
    
    const particleSystemPrimary = new THREE.Points(particlesPrimary, particleMaterialPrimary);
    particleSystemPrimary.userData = { 
      flowSpeeds: flowSpeedsPrimary,
      positions: particlePositionsPrimary,
      leftBound: -15,
      rightBound: 15
    };
    
    scene.add(particleSystemPrimary);
    objects.push(particleSystemPrimary);
    
    // ACCENT COLOR PARTICLES (Green)
    const particlesAccent = new THREE.BufferGeometry();
    const particleMaterialAccent = new THREE.PointsMaterial({ 
      size: 0.035,
      color: 0x14F195, // Accent color
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    
    const particlePositionsAccent = new Float32Array(particleCount * 3);
    const flowSpeedsAccent = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      const x = -15 + Math.random() * 30;
      const y = -4 + Math.random() * 8;
      const z = -4 + Math.random() * 5;
      
      particlePositionsAccent[i3] = x;
      particlePositionsAccent[i3 + 1] = y;
      particlePositionsAccent[i3 + 2] = z;
      
      flowSpeedsAccent[i] = 0.5 + Math.random() * 1.2;
    }
    
    particlesAccent.setAttribute('position', new THREE.BufferAttribute(particlePositionsAccent, 3));
    
    const particleSystemAccent = new THREE.Points(particlesAccent, particleMaterialAccent);
    particleSystemAccent.userData = { 
      flowSpeeds: flowSpeedsAccent,
      positions: particlePositionsAccent,
      leftBound: -15,
      rightBound: 15
    };
    
    scene.add(particleSystemAccent);
    objects.push(particleSystemAccent);
    
    objectsRef.current = objects;
    
    // Animation function
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const time = Date.now() * 0.01;
      
      // Animate all objects
      objectsRef.current.forEach(obj => {
        // Flow animation (move objects from left to right)
        if (obj.userData.flowSpeed && obj.userData.flowSpeed > 0) {
          // Increase the X position
          obj.position.x += obj.userData.flowSpeed * 0.05;
          
          // If object moves out of the right side, reset it to the left
          if (obj.position.x > obj.userData.endX) {
            obj.position.x = obj.userData.startX;
          }
        }
        
        // Cube animations
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.BoxGeometry) {
          obj.rotation.x += obj.userData.rotationSpeed || 0.01;
          obj.rotation.y += obj.userData.rotationSpeed || 0.01;
        }
        
        // Sphere animations - vertical bobbing + flow
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.SphereGeometry) {
          const { baseY, floatSpeed, floatHeight, timeOffset } = obj.userData;
          if (baseY !== undefined && floatSpeed !== undefined && floatHeight !== undefined) {
            obj.position.y = baseY + Math.sin((time + timeOffset) * floatSpeed) * floatHeight;
          }
        }
        
        // Torus animations
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.TorusGeometry) {
          obj.rotation.x = time * 0.5;
          obj.rotation.y = time * 0.3;
          // Add additional rotation for dynamic effect
          obj.rotation.z = Math.sin(time * 0.2) * 0.3;
        }
        
        // Enhanced particle system animation
        if (obj instanceof THREE.Points) {
          // Animate particles flowing from left to right with wave effects
          if (obj.userData.flowSpeeds && obj.userData.positions) {
            const positions = obj.userData.positions;
            const flowSpeeds = obj.userData.flowSpeeds;
            const leftBound = obj.userData.leftBound || -15;
            const rightBound = obj.userData.rightBound || 15;
            
            // Update each particle position
            for (let i = 0; i < flowSpeeds.length; i++) {
              const i3 = i * 3;
              
              // Move particle along x-axis
              positions[i3] += flowSpeeds[i] * 0.02;
              
              // Add subtle wave motion to y and z based on particle position and time
              const xPos = positions[i3];
              
              // Sinusoidal wave pattern along the y-axis (vertical)
              positions[i3 + 1] += Math.sin(time * 0.005 + xPos * 0.1) * 0.002 * flowSpeeds[i];
              
              // Subtle z-axis movement for depth
              positions[i3 + 2] += Math.cos(time * 0.003 + xPos * 0.05) * 0.001 * flowSpeeds[i];
              
              // If particle moves beyond right boundary, reset to left with slight randomization
              if (positions[i3] > rightBound) {
                positions[i3] = leftBound + Math.random() * 2; // Slight randomization when resetting
                positions[i3 + 1] = -4 + Math.random() * 8; // Reset y with randomization
                positions[i3 + 2] = -4 + Math.random() * 5; // Reset z with randomization
              }
            }
            
            // Update the buffer attribute to reflect new positions
            obj.geometry.attributes.position.needsUpdate = true;
          }
        }
      });
      
      // Subtle oscillating scene rotation rather than continuous rotation
      scene.rotation.y = Math.sin(time * 0.1) * 0.05;
      
      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Request next frame
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose geometries and materials
      objectsRef.current.forEach(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          
          if (Array.isArray(obj.material)) {
            obj.material.forEach(material => material.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-[70vh] rounded-xl overflow-hidden border border-primary/20 relative"
    />
  );
}