import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLotteryStore } from '../../stores/useLotteryStore';

const BALL_COLORS = [
  '#FF595E', // Pop Red
  '#FFCA3A', // Pop Yellow
  '#8AC926', // Pop Green
  '#1982C4', // Pop Blue
  '#6A4C93', // Pop Purple
  '#FF924C', // Pop Orange
  '#FF99C8', // Pastel Pink
  '#A0E7E5', // Pastel Cyan
];

interface BallProps {
  id: number;
  color: string;
  secondaryColor?: string;
  isSpinning: boolean;
  delay: number;
  text?: string;
}

const Ball = ({ color, isSpinning, text, index }: Omit<BallProps, 'id' | 'secondaryColor' | 'delay'> & { index: number }) => {
  const [pos] = useState(() => {
    // Determine row based on index to simulate stacking
    // Row 0 (bottom): index 0-5
    // Row 1: index 6-10
    // Row 2: index 11-15...
    const row = Math.floor(index / 6);
    const col = index % 6;
    
    // Base Y for bottom row. Higher rows subtract Y (go up).
    // Bottom of container is ~340px. Visual floor is ~280px.
    // Ball size 48px.
    const baseY = 280; 
    const y = baseY - (row * 35) - (Math.random() * 10); // Stacking up with some overlap
    
    // X spread. Container width 340px. Center is 170.
    // Row offset for honeycomb effect
    const xOffset = (row % 2) * 20;
    const x = 40 + (col * 45) + xOffset + (Math.random() * 10 - 5);
    
    return {
        x: Math.min(Math.max(x, 20), 270), // Clamp to container width
        y: Math.min(Math.max(y, 100), 280), // Clamp to container height
        rotate: Math.random() * 360
    };
  });

  return (
    <motion.div
      className="absolute w-12 h-12 rounded-full border-2 border-white/40 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden z-10"
      style={{ 
        background: color, 
      }}
      initial={{ x: pos.x, y: -50, opacity: 0 }}
      animate={isSpinning ? {
        x: [pos.x, Math.random() * 280, Math.random() * 280, pos.x],
        y: [pos.y, Math.random() * 280, Math.random() * 280, pos.y],
        rotate: [0, 180, 360, 720],
        opacity: 1
      } : {
        x: pos.x,
        y: pos.y,
        rotate: pos.rotate,
        opacity: 1
      }}
      transition={isSpinning ? {
        duration: 0.2,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse"
      } : {
        type: "spring",
        damping: 15,
        stiffness: 100,
        // Randomized delay for organic "raining" feel instead of rows
        delay: index * 0.02 + Math.random() * 0.3
      }}
    >
      {/* Glossy Highlight */}
      <div className="absolute top-2 left-2 w-4 h-3 rounded-full bg-white/80 blur-[1px]" />
      
      {/* Ball Number */}
      <span className="text-white font-black text-lg drop-shadow-md z-10 font-sans tracking-tighter">
        {text}
      </span>
    </motion.div>
  );
};

import { Winner } from '../../types';

export const GashaponMachine2D = ({ dispensedWinner }: { dispensedWinner?: Winner | null }) => {
  const { isSpinning, prizes } = useLotteryStore();
  const [balls, setBalls] = useState<BallProps[]>([]);

  useEffect(() => {
    // 获取所有剩余数量 > 0 的奖品
    const availablePrizes = prizes.filter(p => p.remaining > 0);
    
    // 如果没有奖品了，清空球
    if (availablePrizes.length === 0) {
        setBalls([]);
        return;
    }

    // Create balls based on available prizes or default set
    // If we have prizes, try to represent them. If too many, cap at 20 visually.
    const displayCount = Math.min(Math.max(availablePrizes.length, 25), 35);
    
    setBalls(prevBalls => {
        // Generate new data based on CURRENT available prizes
        const newBallsData = Array.from({ length: displayCount }).map((_, i) => {
           // Cycle through available prizes
           const prize = availablePrizes[i % availablePrizes.length];
           // Use a color from the palette based on index to ensure variety, 
           // even if prizes have same color or no color
           const color = BALL_COLORS[i % BALL_COLORS.length];
           
           return {
            color: color,
            text: prize ? prize.name : `${i + 1}`,
            // Add a secondary color for multi-color effect
            secondaryColor: BALL_COLORS[(i + 5) % BALL_COLORS.length]
          };
        });

        // Map to state, preserving ID (index) to maintain React component identity and internal state (position)
        // If the number of balls changes, some will be added/removed, which is fine.
        return newBallsData.map((data, i) => {
            const prevBall = prevBalls[i];
            return {
                id: i, // Keep index as ID to reuse Ball components
                ...data,
                isSpinning: false, // controlled by prop
                delay: prevBall ? prevBall.delay : Math.random() * 0.2,
            };
        });
    });
  }, [JSON.stringify(prizes.map(p => ({id: p.id, remaining: p.remaining})))]); // Deep compare for remaining count changes

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[360px] h-[580px] scale-100 md:scale-110">
        
        {/* Machine Top - Pop Red */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-[#FF4444] rounded-t-full z-10 border-4 border-black flex items-center justify-center shadow-[0_10px_0_rgba(0,0,0,0.1)]">
             {/* Decorative Bolts */}
             <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-white border-2 border-black" />
             <div className="absolute top-4 right-6 w-3 h-3 rounded-full bg-white border-2 border-black" />
             
             {/* Logo Badge */}
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#FFD000] rounded-full border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center z-20">
                <span className="text-black font-black text-2xl tracking-tighter">ANZ</span>
             </div>
        </div>

        {/* Glass Dome Container - Clean Glass */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-gradient-to-br from-white/30 to-white/10 rounded-full border-4 border-black backdrop-blur-sm z-0 overflow-hidden shadow-[inset_0_0_40px_rgba(255,255,255,0.2)]">
            {/* Reflection */}
            <div className="absolute top-8 left-12 w-24 h-12 bg-white/40 rounded-full -rotate-45 blur-sm z-30 pointer-events-none" />
            <div className="absolute bottom-12 right-12 w-12 h-6 bg-white/20 rounded-full -rotate-45 blur-sm z-30 pointer-events-none" />
            
            {/* Balls - No more blocking red block */}
            <div className="relative w-full h-full" style={{ willChange: 'transform' }}>
                <AnimatePresence>
                    {balls.map((ball, i) => (
                        <Ball 
                            key={ball.id}
                            {...ball}
                            index={i}
                            isSpinning={isSpinning}
                        />
                    ))}
                </AnimatePresence>
            </div>
            
            {/* Inner Shadow to Simulate Depth */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_-20px_60px_rgba(0,0,0,0.1)] pointer-events-none z-20" />
        </div>

        {/* Machine Base - Pop Art Style - Connected */}
        <div className="absolute top-[320px] left-1/2 -translate-x-1/2 w-[300px] h-[220px] z-10 flex flex-col items-center">
            {/* Main Body */}
            <div className="absolute inset-0 bg-[#FF4444] rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)] overflow-hidden">
                {/* Stripe Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 0, transparent 20px)',
                }} />
                
                {/* Side Highlights */}
                <div className="absolute top-0 left-4 bottom-0 w-8 bg-white/10 blur-sm" />
            </div>

            {/* Control Panel Area */}
            <div className="absolute top-6 w-[260px] h-[110px] bg-white rounded-2xl border-4 border-black flex flex-col items-center justify-center p-2 shadow-inner">
                
                <div className="flex items-center gap-6 w-full justify-center px-4">
                    {/* Coin Slot */}
                    <div className="w-12 h-16 bg-zinc-100 rounded-lg border-4 border-black flex flex-col items-center justify-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]">
                        <div className="w-2 h-8 bg-black rounded-full" />
                        <div className="text-[8px] font-black text-black uppercase tracking-widest">Coin</div>
                    </div>
                    
                    {/* Turning Knob - Pop Yellow */}
                    <motion.div 
                        className="w-16 h-16 rounded-full bg-[#FFD000] border-4 border-black flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                        animate={{ rotate: isSpinning ? 360 * 2 : 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    >
                        {/* Knob Handle Bar */}
                        <div className="absolute w-20 h-6 bg-white rounded-full border-4 border-black transform rotate-45" />
                        <div className="absolute w-20 h-6 bg-white rounded-full border-4 border-black transform -rotate-45" />
                        {/* Center Cap */}
                        <div className="absolute w-8 h-8 rounded-full bg-[#FFD000] border-4 border-black flex items-center justify-center z-10">
                            <div className="text-[8px] font-black text-black">TURN</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Exit Door - Gate Style */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-52 h-16 bg-zinc-900 rounded-t-xl border-4 border-black overflow-hidden flex justify-center items-end shadow-inner">
                {/* Flap Door */}
                {/* <motion.div
                    className="w-40 h-10 bg-white/10 rounded-t-lg border-t-4 border-white/20 backdrop-blur-sm transform origin-top hover:rotate-x-12 transition-transform cursor-pointer flex items-center justify-center absolute top-0 z-40"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: dispensedWinner ? 0 : 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    <span className="text-white/40 text-[10px] font-black uppercase mt-1 tracking-widest">Push</span>
                </motion.div> */}

                {/* Dispensed Ball - Inside the exit door, partially hidden */}
                <AnimatePresence>
                    {dispensedWinner && (
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", damping: 15 }}
                            className="absolute bottom-0 z-30 w-[3.75rem] h-[3.75rem] rounded-full border-4 border-black flex items-center justify-center shadow-lg overflow-hidden"
                            style={{ 
                                background: prizes.find(p => p.id === dispensedWinner.prizeId)?.color || '#ffd700'
                            }} 
                        >
                            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-white/60 blur-[2px]" />
                            <span 
                                className="text-white font-black text-3xl z-10 font-sans tracking-tighter leading-none text-center px-1"
                                style={{ WebkitTextStroke: '1px rgba(0,0,0,0.5)' }}
                            >
                                {dispensedWinner.prizeName}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Legs */}
            <div className="absolute -bottom-4 left-6 w-6 h-6 bg-black rounded-b-xl" />
            <div className="absolute -bottom-4 right-6 w-6 h-6 bg-black rounded-b-xl" />
        </div>
      </div>
    </div>
  );
};
