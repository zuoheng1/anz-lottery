import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useSphere, useBox } from '@react-three/cannon';
import { Environment, OrbitControls, Sparkles, Text, Float } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { useLotteryStore } from '../../stores/useLotteryStore';
import * as THREE from 'three';

// -----------------------------------------------------------------------------
// Materials & Constants
// -----------------------------------------------------------------------------

const CAPSULE_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ffffff', // White
  '#000000', // Black
];

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const Wall = (props: any) => {
  useBox(() => ({ type: 'Static', ...props }));
  return null; // Invisible walls
};

const Floor = (props: any) => {
    // 物理地板：位置下移，使得顶部表面与视觉地板对齐
    // 视觉地板(MachineHousing)顶部在 Y = -1.5 (center -2, height 1)
    // 所以物理盒子中心设在 -2, 高度 1 => 顶部 -1.5
    useBox(() => ({ type: 'Static', args: [10, 1, 10], ...props }));
    return null; // 隐藏物理辅助网格，使用 MachineHousing 的视觉效果
}

const Stirrer = ({ isSpinning }: { isSpinning: boolean }) => {
  // A rotating bar at the bottom to mix the capsules
  const [ref, api] = useBox(() => ({
    type: 'Kinematic',
    args: [3.5, 0.5, 0.5], 
    position: [0, -1.2, 0], // 抬高搅拌棒，防止陷入地板 (地板表面在 -1.5)
  }));

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (isSpinning) {
      // Rotate around Y axis
      api.rotation.set(0, time * 15, 0); 
      // Move up and down slightly
      // 地板表面 -1.5，搅拌棒中心 -1.2 (底部 -1.45)
      // 运动范围 -1.2 ~ -0.8
      api.position.set(0, -1.2 + Math.sin(time * 20) * 0.4, 0); 
    } else {
       api.rotation.set(0, time * 0.5, 0);
       api.position.set(0, -1.2, 0);
    }
  });

  // 隐藏搅拌棒的视觉效果，只保留物理碰撞
  return (
    <mesh ref={ref as any} visible={false}>
      <boxGeometry args={[3.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#fbbf24" />
    </mesh>
  );
};

const DetailedCapsule = ({ position, color, isWinner, text }: { position: [number, number, number], color: string, id: number, isWinner?: boolean, onRest?: () => void, text?: string }) => {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.35],
    restitution: 0.5,
    friction: 0.1,
    linearDamping: 0.1,
    angularDamping: 0.1,
  }));

  // 中奖小球的特殊逻辑
  useFrame(() => {
    if (isWinner) {
      // 强制移动到出口位置
      api.applyImpulse([0, 0, 8], [0, 0, 0]); // 增加力度
      // 也可以尝试直接设置速度
      // api.velocity.set(0, 5, 10);
    }
  });

  return (
    <group ref={ref as any}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={isWinner ? "#ffd700" : color} metalness={isWinner ? 0.8 : 0.1} roughness={0.2} emissive={isWinner ? "#ffd700" : undefined} emissiveIntensity={isWinner ? 0.5 : 0} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.02, 16, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 增加文字显示 */}
      <Text
        position={[0, 0, 0.36]} // 稍微浮出表面
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {text || ''}
      </Text>
      <Text
        position={[0, 0, -0.36]} // 背面也显示
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {text || ''}
      </Text>
    </group>
  );
};

const MachineHousing = () => {
    return (
        <group>
            {/* 玻璃球体 */}
            <mesh position={[0, 2.5, 0]}>
                <sphereGeometry args={[5, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
                <meshPhysicalMaterial 
                    color="#ffffff"
                    transmission={0.9}
                    opacity={0.3}
                    transparent
                    roughness={0}
                    metalness={0.1}
                    thickness={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

             {/* 顶部盖子 - 圆润的红色帽子 */}
             <mesh position={[0, 7.5, 0]}>
                 <cylinderGeometry args={[2.5, 3.5, 1, 64]} />
                 <meshStandardMaterial color="#dc2626" metalness={0.4} roughness={0.2} />
             </mesh>
             <mesh position={[0, 8, 0]}>
                 <sphereGeometry args={[2.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                 <meshStandardMaterial color="#dc2626" metalness={0.4} roughness={0.2} />
             </mesh>
             {/* 盖子顶部的金色装饰 */}
             <mesh position={[0, 10.5, 0]}>
                 <sphereGeometry args={[0.8, 32, 32]} />
                 <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.1} />
             </mesh>


            {/* 底部基座 - 圆润的碗状 */}
             <mesh position={[0, -2, 0]}>
                <cylinderGeometry args={[5, 4.5, 1, 64]} />
                 <meshStandardMaterial color="#dc2626" metalness={0.4} roughness={0.2} />
            </mesh>
            
            {/* 真正的底座主体 */}
            <mesh position={[0, -4.5, 0]}>
                <cylinderGeometry args={[4.5, 5, 4, 64]} />
                <meshStandardMaterial color="#dc2626" metalness={0.4} roughness={0.2} />
            </mesh>

            {/* 出口滑梯 - 内部不可见，外部装饰 */}
            <mesh position={[0, -5, 3.8]} rotation={[0.8, 0, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 1, 32]} />
                <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, -5, 4]} rotation={[0.8, 0, 0]}>
                 <torusGeometry args={[1.5, 0.2, 16, 32]} />
                 <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.1} />
            </mesh>
        </group>
    )
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export const GashaponMachine = ({ dispensedWinner }: { dispensedWinner?: any }) => {
  const { isSpinning, prizes } = useLotteryStore();
  const [capsules, setCapsules] = useState<any[]>([]);
  const [winnerId, setWinnerId] = useState<number | null>(null);

  useEffect(() => {
    // Generate fewer capsules for better performance but high quality
    const newCapsules = Array.from({ length: 50 }).map((_, i) => {
        const prize = prizes.length > 0 ? prizes[i % prizes.length] : null;
        return {
            position: [
                (Math.random() - 0.5) * 3, // 缩小范围，防止出界
                Math.random() * 3 + 2, // 降低生成高度 (2~5)，确保在墙壁范围内 (墙壁顶部9，底部-3)
                (Math.random() - 0.5) * 3
            ] as [number, number, number],
            color: prize?.color || CAPSULE_COLORS[i % CAPSULE_COLORS.length],
            text: prize?.name || '',
            id: i
        };
    });
    setCapsules(newCapsules);
  }, [prizes]); // 依赖 prizes 更新

  useEffect(() => {
    if (isSpinning) {
       setWinnerId(null);
    } else if (!isSpinning && winnerId === null) {
        // 停止时，随机选择一个作为“中奖”球
        setWinnerId(Math.floor(Math.random() * 50));
    }
  }, [isSpinning, winnerId]);

  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-[#450a0a] to-black">
      {/* 确保 key 变化时重新渲染 Canvas，或者不使用 key 强制重绘，这里看起来没问题，
          重点检查 Physics 组件的渲染 */}
      <Canvas shadows camera={{ position: [0, 4, 14], fov: 40 }} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#2a0a0a']} /> {/* 深红色背景 */}
        
        {/* Lighting Setup - 更明亮 */}
        <ambientLight intensity={0.6} />
        <spotLight 
            position={[10, 20, 10]} 
            angle={0.5} 
            penumbra={1} 
            intensity={3} 
            castShadow 
            shadow-bias={-0.0001}
        />
        <pointLight position={[-10, 5, -10]} intensity={2} color="#fbbf24" /> {/* 金光 */}
        <pointLight position={[10, 5, -10]} intensity={2} color="#ef4444" /> {/* 红光 */}
        
        <Environment preset="city" blur={0.8} />
        
        <Sparkles count={150} scale={12} size={4} speed={0.4} opacity={0.6} color="#fbbf24" />

        <Physics gravity={[0, -20, 0]} allowSleep={false}> {/* Increased gravity for snappier movement */}
          
          {/* Boundaries */}
          {/* Floor - Positioned to align physics top surface (-1.5) with visual base top */}
          <Floor position={[0, -2, 0]} />
          
          {/* Invisible Cylindrical Wall to keep balls in - Raised to prevent balls from spawning outside */}
           <Wall position={[0, 3, -2.5]} args={[5, 12, 0.5]} />
           <Wall position={[0, 3, 2.5]} args={[5, 12, 0.5]} />
           <Wall position={[-2.5, 3, 0]} rotation={[0, Math.PI/2, 0]} args={[5, 12, 0.5]} />
           <Wall position={[2.5, 3, 0]} rotation={[0, Math.PI/2, 0]} args={[5, 12, 0.5]} />

          <Stirrer isSpinning={isSpinning} />
          
          {capsules.map((capsule) => (
            <DetailedCapsule 
              key={capsule.id} 
              position={capsule.position} 
              color={capsule.color} 
              id={capsule.id}
              isWinner={winnerId === capsule.id}
              text={capsule.text}
            />
          ))}

          {/* 额外的出球动画 - 当有 dispensedWinner 时显示 */}
          {dispensedWinner && (
             <ResultCapsule text={dispensedWinner.prizeName} />
          )}
        </Physics>

        <MachineHousing />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
             <Text
                position={[0, 9, 0]}
                fontSize={0.8}
                color="#fbbf24"
                anchorX="center"
                anchorY="middle"
            >
                LUCKY DRAW
                <meshStandardMaterial emissive="#fbbf24" emissiveIntensity={2} toneMapped={false} />
            </Text>
        </Float>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.6}
          minDistance={12}
          maxDistance={25}
          autoRotate={!isSpinning}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

// 单独的 ResultCapsule 组件，用于展示掉落的球
const ResultCapsule = ({ text }: { text?: string }) => {
    // 从出口上方掉落
    const [ref] = useSphere(() => ({
        mass: 5,
        position: [0, -1, 5], // 出口附近
        args: [0.4],
        linearDamping: 0.1,
        angularDamping: 0.1
    }));

    return (
        <group ref={ref as any}>
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} emissive="#fbbf24" emissiveIntensity={0.8} />
            </mesh>
             <Sparkles count={20} scale={2} size={2} speed={0.4} opacity={1} color="#fbbf24" />
             <Text
                position={[0, 0, 0.41]}
                fontSize={0.2}
                color="black"
                anchorX="center"
                anchorY="middle"
            >
                {text || 'Winner'}
            </Text>
        </group>
    )
}
