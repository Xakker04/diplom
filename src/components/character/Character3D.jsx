import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import './Character3D.css';

/* ── Ranglar ── */
const SKIN = '#f1c27d';
const EYE  = '#222';
const BOY  = { hair: '#3a2a1a', shirt: '#3b82f6', pants: '#1f2937' };
const GIRL = { hair: '#6d3b1f', dress: '#ec4899', shoe: '#b91c64' };

/* ── Yuz (ikkala personajda umumiy) ── */
const Face = () => (
  <group>
    {/* bosh */}
    <mesh position={[0, 0.62, 0]} castShadow>
      <sphereGeometry args={[0.32, 32, 32]} />
      <meshStandardMaterial color={SKIN} />
    </mesh>
    {/* ko'zlar */}
    <mesh position={[-0.12, 0.66, 0.28]}>
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshStandardMaterial color={EYE} />
    </mesh>
    <mesh position={[0.12, 0.66, 0.28]}>
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshStandardMaterial color={EYE} />
    </mesh>
    {/* tabassum */}
    <mesh position={[0, 0.55, 0.29]} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.08, 0.018, 12, 24, Math.PI]} />
      <meshStandardMaterial color={'#c0392b'} />
    </mesh>
  </group>
);

/* ── Bola ── */
const Boy = () => (
  <group>
    <Face />
    {/* soch */}
    <mesh position={[0, 0.8, 0]} scale={[1, 0.6, 1]}>
      <sphereGeometry args={[0.34, 32, 32]} />
      <meshStandardMaterial color={BOY.hair} />
    </mesh>
    {/* tana */}
    <mesh position={[0, 0.05, 0]} castShadow>
      <cylinderGeometry args={[0.26, 0.3, 0.6, 24]} />
      <meshStandardMaterial color={BOY.shirt} />
    </mesh>
    {/* qo'llar */}
    <mesh position={[-0.36, 0.12, 0]} rotation={[0, 0, 0.35]}>
      <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
      <meshStandardMaterial color={BOY.shirt} />
    </mesh>
    <mesh position={[0.36, 0.12, 0]} rotation={[0, 0, -0.35]}>
      <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
      <meshStandardMaterial color={BOY.shirt} />
    </mesh>
    {/* oyoqlar */}
    <mesh position={[-0.13, -0.55, 0]}>
      <capsuleGeometry args={[0.1, 0.45, 8, 16]} />
      <meshStandardMaterial color={BOY.pants} />
    </mesh>
    <mesh position={[0.13, -0.55, 0]}>
      <capsuleGeometry args={[0.1, 0.45, 8, 16]} />
      <meshStandardMaterial color={BOY.pants} />
    </mesh>
  </group>
);

/* ── Qiz ── */
const Girl = () => (
  <group>
    <Face />
    {/* soch (oldingi qism) */}
    <mesh position={[0, 0.82, 0]} scale={[1.05, 0.7, 1.05]}>
      <sphereGeometry args={[0.34, 32, 32]} />
      <meshStandardMaterial color={GIRL.hair} />
    </mesh>
    {/* uzun soch (orqada) */}
    <mesh position={[0, 0.35, -0.18]}>
      <capsuleGeometry args={[0.18, 0.4, 8, 16]} />
      <meshStandardMaterial color={GIRL.hair} />
    </mesh>
    {/* ikki dumcha (ponytail) */}
    <mesh position={[-0.34, 0.66, -0.05]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={GIRL.hair} />
    </mesh>
    <mesh position={[0.34, 0.66, -0.05]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={GIRL.hair} />
    </mesh>
    {/* ko'ylak (konus) */}
    <mesh position={[0, -0.05, 0]} castShadow>
      <coneGeometry args={[0.42, 0.8, 28]} />
      <meshStandardMaterial color={GIRL.dress} />
    </mesh>
    {/* qo'llar */}
    <mesh position={[-0.32, 0.18, 0]} rotation={[0, 0, 0.4]}>
      <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
      <meshStandardMaterial color={SKIN} />
    </mesh>
    <mesh position={[0.32, 0.18, 0]} rotation={[0, 0, -0.4]}>
      <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
      <meshStandardMaterial color={SKIN} />
    </mesh>
    {/* oyoqlar */}
    <mesh position={[-0.11, -0.62, 0]}>
      <capsuleGeometry args={[0.07, 0.3, 8, 16]} />
      <meshStandardMaterial color={SKIN} />
    </mesh>
    <mesh position={[0.11, -0.62, 0]}>
      <capsuleGeometry args={[0.07, 0.3, 8, 16]} />
      <meshStandardMaterial color={SKIN} />
    </mesh>
  </group>
);

/* ── Aylanib + sekin tebranib turadi ── */
const Spinner = ({ variant }) => {
  const ref = useRef();
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.5;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.04;
  });
  return (
    <group ref={ref}>
      {variant === 'girl' ? <Girl /> : <Boy />}
    </group>
  );
};

/*
  variant — 'boy' | 'girl'
*/
const Character3D = ({ variant = 'boy' }) => (
  <div className="char3d-canvas">
    <Canvas camera={{ position: [0, 0.1, 3], fov: 35 }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} />
      <Spinner variant={variant} />
    </Canvas>
  </div>
);

export default Character3D;
