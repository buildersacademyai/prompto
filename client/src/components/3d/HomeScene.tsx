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
    
    // Add objects with flow speed - higher value = faster flow
    // First group of objects (cubes with primary color)
    createCube(-8, 0.5, -2, 1, '#9945FF', 1.5);
    createCube(-6, -0.8, -1, 0.7, '#9945FF', 1.2);
    createCube(-4, 1.2, -3, 0.5, '#9945FF', 1.8);
    
    // Second group of objects (spheres with accent color)
    createSphere(-7, -0.7, -1, 0.6, '#14F195', 1.3);
    createSphere(-5, 0.8, -2, 0.4, '#14F195', 1.6);
    createSphere(-9, -1.2, -0.5, 0.8, '#14F195', 1.1);
    
    // Third group (mixed objects with different colors)
    createCube(-3, -0.5, -2, 0.6, '#00FFA3', 2.0);
    createSphere(-2, 1.5, -1, 0.5, '#9945FF', 1.7);
    createCube(-1, 0.3, -3, 0.4, '#14F195', 1.4);
    
    // Add special object - torus
    const torusGeometry = new THREE.TorusGeometry(1.2, 0.15, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x9945FF, 
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x9945FF,
      emissiveIntensity: 0.2,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    // Start the torus off-screen to the left
    torus.position.set(-12, 0, -2);
    torus.rotation.x = Math.PI / 4;
    torus.userData = {
      flowSpeed: 1.3,
      startX: -12,
      endX: 12
    };
    scene.add(torus);
    objects.push(torus);
    
    // Add particles flowing from left to right
    const particleCount = 300;
    const particles = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({ 
      size: 0.03,
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    
    // Create arrays to store particle positions and their flow speeds
    const particlePositions = new Float32Array(particleCount * 3);
    const flowSpeeds = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Distribute particles in a tube-like shape extending from left to right
      const x = -10 + Math.random() * 20; // initial x across the scene
      const y = -3 + Math.random() * 6;  // height variation
      const z = -3 + Math.random() * 3;  // depth variation
      
      particlePositions[i3] = x;
      particlePositions[i3 + 1] = y;
      particlePositions[i3 + 2] = z;
      
      // Assign random flow speeds
      flowSpeeds[i] = 0.5 + Math.random() * 1.5;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Store flow speeds in userData for later animation
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.userData = { 
      flowSpeeds: flowSpeeds,
      positions: particlePositions, // store reference to buffer
      leftBound: -12,
      rightBound: 12
    };
    
    scene.add(particleSystem);
    objects.push(particleSystem);
    
    // Add a second particle system with different colors for visual interest
    const particles2 = new THREE.BufferGeometry();
    const particleMaterial2 = new THREE.PointsMaterial({ 
      size: 0.025,
      color: 0x14F195, // Accent color
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    
    const particlePositions2 = new Float32Array(particleCount * 3);
    const flowSpeeds2 = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Distribute particles in a tube-like shape extending from left to right
      const x = -12 + Math.random() * 24; // initial x across the scene
      const y = -3 + Math.random() * 6;  // height variation
      const z = -2 + Math.random() * 4;  // depth variation
      
      particlePositions2[i3] = x;
      particlePositions2[i3 + 1] = y;
      particlePositions2[i3 + 2] = z;
      
      // Assign random flow speeds
      flowSpeeds2[i] = 0.3 + Math.random() * 1.2;
    }
    
    particles2.setAttribute('position', new THREE.BufferAttribute(particlePositions2, 3));
    
    const particleSystem2 = new THREE.Points(particles2, particleMaterial2);
    particleSystem2.userData = { 
      flowSpeeds: flowSpeeds2,
      positions: particlePositions2,
      leftBound: -12,
      rightBound: 12
    };
    
    scene.add(particleSystem2);
    objects.push(particleSystem2);
    
    objectsRef.current = objects;
    
    // Animation function
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const time = Date.now() * 0.001;
      
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
        
        // Particle system animation
        if (obj instanceof THREE.Points) {
          // Animate particles flowing from left to right
          if (obj.userData.flowSpeeds && obj.userData.positions) {
            const positions = obj.userData.positions;
            const flowSpeeds = obj.userData.flowSpeeds;
            const leftBound = obj.userData.leftBound || -12;
            const rightBound = obj.userData.rightBound || 12;
            
            // Update each particle position
            for (let i = 0; i < flowSpeeds.length; i++) {
              const i3 = i * 3;
              
              // Move particle along x-axis
              positions[i3] += flowSpeeds[i] * 0.02;
              
              // If particle moves beyond right boundary, reset to left
              if (positions[i3] > rightBound) {
                positions[i3] = leftBound;
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