import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingIconProps {
  icon: string
  position: [number, number, number]
  color: string
  size?: number
}

function IconMesh({ icon, position, color, size = 1 }: FloatingIconProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.8}
        wireframe
      />
    </mesh>
  )
}

export function FloatingIcon(props: FloatingIconProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} />
        <IconMesh {...props} />
      </Canvas>
    </div>
  )
}
