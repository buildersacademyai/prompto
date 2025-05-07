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
    const createCube = (x: number, y: number, z: number, size: number, color: string) => {
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(color),
        metalness: 0.3,
        roughness: 0.4,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, y, z);
      cube.userData = { rotationSpeed: 0.01 * Math.random() + 0.005 };
      scene.add(cube);
      objects.push(cube);
      return cube;
    };
    
    // Create spheres
    const createSphere = (x: number, y: number, z: number, radius: number, color: string) => {
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
        timeOffset: Math.random() * Math.PI * 2 
      };
      scene.add(sphere);
      objects.push(sphere);
      return sphere;
    };
    
    // Add cubes to the scene
    createCube(-2, 0, 0, 1, '#9945FF');
    createCube(2, -1, -2, 0.7, '#14F195');
    createCube(0, 2, -3, 0.5, '#00FFA3');
    
    // Add spheres to the scene
    createSphere(1, -1, 0, 0.6, '#14F195');
    createSphere(-1.5, 1, -1, 0.4, '#9945FF');
    createSphere(0, -1.5, -1, 0.8, '#00FFA3');
    
    // Add special object - torus
    const torusGeometry = new THREE.TorusGeometry(1.5, 0.2, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x9945FF, 
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x9945FF,
      emissiveIntensity: 0.2,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(0, 0, -2);
    torus.rotation.x = Math.PI / 4;
    scene.add(torus);
    objects.push(torus);
    
    // Add particles
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({ 
      size: 0.05,
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Distribute particles in a sphere
      const radius = 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = radius * Math.cos(phi);
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    particleSystem.userData = { rotationY: 0.0002 };
    objects.push(particleSystem);
    
    objectsRef.current = objects;
    
    // Animation function
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const time = Date.now() * 0.001;
      
      // Animate cubes
      objectsRef.current.forEach(obj => {
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.BoxGeometry) {
          obj.rotation.x += obj.userData.rotationSpeed || 0.01;
          obj.rotation.y += obj.userData.rotationSpeed || 0.01;
        }
        
        // Animate spheres
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.SphereGeometry) {
          const { baseY, floatSpeed, floatHeight, timeOffset } = obj.userData;
          if (baseY !== undefined && floatSpeed !== undefined && floatHeight !== undefined) {
            obj.position.y = baseY + Math.sin((time + timeOffset) * floatSpeed) * floatHeight;
          }
        }
        
        // Animate torus
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.TorusGeometry) {
          obj.rotation.x = time * 0.5;
          obj.rotation.y = time * 0.3;
        }
        
        // Animate particle system
        if (obj instanceof THREE.Points) {
          obj.rotation.y += obj.userData.rotationY || 0.0002;
        }
      });
      
      // Slowly rotate the entire scene for a nice effect
      scene.rotation.y = Math.sin(time * 0.1) * 0.1;
      
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