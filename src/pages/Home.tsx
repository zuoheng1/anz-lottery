import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
      {/* 动态背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 光束 - 混合蓝色调 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#2bb8f5]/20 via-black to-black z-0" />
        
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              background: i % 2 === 0 ? 'rgba(43, 184, 245, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center space-y-8 p-4"
      >
        <motion.h1
          className="text-7xl md:text-9xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(43,184,245,0.5)] leading-tight"
        >
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-400 to-zinc-600 blur-[1px]">
              2025
            </span>
            <ArrowRight className="w-12 h-12 md:w-24 md:h-24 text-[#2bb8f5] animate-pulse" />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-[#2bb8f5]">
              2026
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2bb8f5] via-white to-[#2bb8f5] tracking-[0.2em]">
              ANZ YEAR END PARTY
            </span>
          </div>
        </motion.h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide uppercase border-t border-white/10 pt-8 mt-8">
          Celebrating Our Journey · December 19th
        </p>
        
        <div className="pt-8 flex justify-center">
          <Link to="/lottery">
            <Button size="lg" className="text-xl px-12 py-4 rounded-full shadow-[0_0_50px_rgba(43,184,245,0.3)] hover:shadow-[0_0_80px_rgba(43,184,245,0.5)] transition-shadow duration-500 border-t border-white/20 bg-gradient-to-r from-[#2bb8f5] to-blue-600 border-none group">
              <Sparkles className="mr-2 w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
              开启好运
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* 底部版权/装饰 */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2">
        <div className="w-1 h-12 bg-gradient-to-b from-transparent to-zinc-800" />
        <div className="text-zinc-700 text-xs tracking-[0.3em] font-mono uppercase">
            ANZ YEAR END PARTY
        </div>
      </div>
    </div>
  );
}
