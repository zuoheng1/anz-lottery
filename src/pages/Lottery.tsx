import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GashaponMachine2D } from '../components/2d/GashaponMachine2D';
import { useLotteryStore } from '../stores/useLotteryStore';
import { Winner } from '../types';
import Confetti from 'react-confetti';
import { X, Trophy } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import { Button } from '../components/ui/Button';
import { useLotterySound } from '../hooks/useLotterySound';
import { NotaryPublic } from '../components/NotaryPublic';
import { DrawerSelector } from '../components/DrawerSelector';

export default function Lottery() {
  const { 
    isSpinning, 
    setIsSpinning, 
    participants, 
    prizes, 
    setPrizes,
    addWinner,
    currentDrawer,
    setCurrentDrawer
  } = useLotteryStore();
  
  const { addToast } = useToastStore();
  const { playBGM, stopBGM, playSpinSound, playWinSound } = useLotterySound();
  
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<Winner | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const [isDispensing, setIsDispensing] = useState(false);
  const [hasSelectedCard, setHasSelectedCard] = useState(false);

  // Initialize default prizes if empty
  useEffect(() => {
    // Reset spinning state on mount to prevent stuck state from persistence
    setIsSpinning(false);

    // Only if prizes are empty AND we have participants
    if (prizes.length === 0 && participants.length > 0) {
      const defaultPrizes = Array.from({ length: participants.length }).map((_, i) => ({
        id: crypto.randomUUID(),
        name: `${i + 1}`,
        count: 1,
        remaining: 1,
        color: [
          '#FF0000', '#FFD700', '#FFA500', '#FF69B4', '#00FFFF', 
          '#32CD32', '#9370DB', '#FF00FF', '#FF7F50', '#40E0D0',
          '#FF4500', '#ADFF2F', '#1E90FF', '#FF1493', '#FFFF00'
        ][i % 15]
      }));
      setPrizes(defaultPrizes);
    }
  }, [prizes.length, participants.length, setPrizes]);

  // Play BGM when component mounts
  useEffect(() => {
    // Optional: playBGM(); 
    // Usually browsers block autoplay, so we might want to start it on first user interaction or just leave it for spin
    return () => stopBGM();
  }, [playBGM, stopBGM]);

  // Handle spin sound loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpinning) {
      playBGM(); // Start music on spin
      interval = setInterval(() => {
        playSpinSound();
      }, 100);
    } else {
      clearInterval(interval!);
    }
    return () => clearInterval(interval);
  }, [isSpinning, playSpinSound, playBGM]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [hasSpun, setHasSpun] = useState(false);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;
    
    if (!currentDrawer) {
        addToast('请先抽取一位抽奖人！', 'warning');
        return;
    }
    
    // 检查是否有剩余奖品
    const remainingPrizes = prizes.filter(p => p.remaining > 0);
    if (remainingPrizes.length === 0) {
      addToast('奖品已抽完！', 'warning');
      return;
    }

    setIsSpinning(true);
    setHasSpun(true); // Mark as spun
    setCurrentResult(null);
    setIsDispensing(false);
    
    // 模拟抽奖过程
    setTimeout(() => {
      try {
          // 使用 Fisher-Yates 洗牌算法和 Web Crypto API 生成随机数
          const cryptoRandom = () => {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] / (0xffffffff + 1);
          };

          // 1. 随机打乱奖品列表（将剩余奖品展开为单个项目进行打乱）
          const availablePrizePool: typeof remainingPrizes = [];
          remainingPrizes.forEach(prize => {
              for(let i=0; i < prize.remaining; i++) {
                  availablePrizePool.push(prize);
              }
          });
          
          for (let i = availablePrizePool.length - 1; i > 0; i--) {
            const j = Math.floor(cryptoRandom() * (i + 1));
            [availablePrizePool[i], availablePrizePool[j]] = [availablePrizePool[j], availablePrizePool[i]];
          }
          
        // 2. 选取第一个结果 (抽奖人是确定的 currentDrawer)
          const randomParticipant = currentDrawer;
          const randomPrize = availablePrizePool[0];
          
          console.log('Winner Confirmed:', randomParticipant.name, 'Prize:', randomPrize.name);

          const newWinner: Winner = {
            id: crypto.randomUUID(),
            participantId: randomParticipant.id,
            participantName: randomParticipant.name,
            prizeId: randomPrize.id,
            prizeName: randomPrize.name,
            timestamp: Date.now()
          };
          
          addWinner(newWinner);
          setCurrentResult(newWinner);
          setIsDispensing(true); // 开始掉落动画
          setIsSpinning(false); // Stop spinning immediately when dispensing starts

          // 掉落动画结束后显示结果
          setTimeout(() => {
            console.log('Animation finished, showing result');
            setIsDispensing(false);
            stopBGM(); // Stop music immediately
            
            // Ensure state update happens after dispensing animation
            requestAnimationFrame(() => {
                setShowResult(true);
            });
          }, 3500); 
      } catch (error) {
          console.error("Lottery logic failed:", error);
          setIsSpinning(false); 
          addToast("抽奖过程发生错误，请重试", "error");
      }
    }, 2000);
  };
  
  const handleClaimPrize = () => {
      setShowResult(false);
      setCurrentDrawer(null); // Reset drawer only after claiming prize
      setHasSpun(false); // Reset spin lock
      setHasSelectedCard(false);
  };
  
  // Play win sound when result is shown
  useEffect(() => {
      if (showResult) {
          playWinSound();
      }
  }, [showResult, playWinSound]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F8F8F8]">
      {/* Pop Mart Style Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ scale: 1, opacity: 0.12 }}
          animate={{ scale: 1.06, opacity: 0.16 }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-[-20%] right-[-10%] w-[65%] h-[85%] rounded-full bg-[#FFD000]"
          style={{ filter: 'blur(70px)' }}
        />
        <motion.div
          initial={{ scale: 1, opacity: 0.10 }}
          animate={{ scale: 1.05, opacity: 0.14 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute bottom-[-20%] left-[-10%] w-[45%] h-[65%] rounded-full bg-[#FF4444]"
          style={{ filter: 'blur(60px)' }}
        />

        <motion.div
          initial={{ left: '-30%', opacity: 0.25 }}
          animate={{ left: '110%', opacity: 0.35 }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-[22%] h-20 w-[55%] rounded-full bg-gradient-to-r from-[#FFD000]/35 to-transparent"
          style={{ filter: 'blur(24px)', mixBlendMode: 'screen' }}
        />
        <motion.div
          initial={{ left: '110%', opacity: 0.22 }}
          animate={{ left: '-30%', opacity: 0.32 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-[52%] h-16 w-[50%] rounded-full bg-gradient-to-l from-[#FF924C]/35 to-transparent"
          style={{ filter: 'blur(22px)', mixBlendMode: 'screen' }}
        />
        <motion.div
          initial={{ left: '-25%', opacity: 0.20 }}
          animate={{ left: '110%', opacity: 0.30 }}
          transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-[78%] h-14 w-[48%] rounded-full bg-gradient-to-r from-[#FF4444]/35 to-transparent"
          style={{ filter: 'blur(20px)', mixBlendMode: 'screen' }}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0.12 }}
          animate={{ scale: 1.05, opacity: 0.18 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,208,0,0.35) 0%, rgba(255,0,0,0.0) 60%)',
            filter: 'blur(40px)'
          }}
        />

        <motion.div
          initial={{ rotate: 0, opacity: 0.08 }}
          animate={{ rotate: 360, opacity: 0.12 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh]"
          style={{
            backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
            backgroundSize: '26px 26px'
          }}
        />
      </div>

      {/* 顶部标题栏 - Phase 2 */}
      <AnimatePresence mode="wait">
        {currentDrawer ? (
            <div key="draw-title" className="absolute top-0 left-0 w-full z-20 pt-6 pb-2 flex flex-col items-center pointer-events-none">
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="relative flex flex-col items-center"
                >
                    <div className="relative mb-2">
                        <h1 className="absolute top-1 left-1 text-6xl md:text-8xl font-black tracking-tighter leading-none text-center text-[#FFD000] select-none"
                            style={{ WebkitTextStroke: '2px #000' }}>
                            GOOD LUCK!
                        </h1>
                        <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter leading-none text-center select-none"
                            style={{ WebkitTextStroke: '2px #000', color: '#FFF' }}>
                            GOOD LUCK!
                        </h1>
                    </div>
                </motion.div>
            </div>
        ) : (!hasSelectedCard ? (
            <div key="select-title" className="absolute top-0 left-0 w-full z-20 pt-8 pb-4 flex flex-col items-center pointer-events-none">
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="relative flex flex-col items中心"
                >
                    <div className="relative mb-6">
                        <h1 className="absolute top-1 left-1 text-6xl md:text-8xl font-black tracking-tighter leading-none text-center text-[#FFD000] select-none"
                            style={{ WebkitTextStroke: '2px #000' }}>
                            WHO IS NEXT?
                        </h1>
                        <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter leading-none text-center select-none"
                            style={{ WebkitTextStroke: '2px #000', color: '#FFF' }}>
                            WHO IS NEXT?
                        </h1>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FFD000] via-[#FF924C] to-[#FF4444] text-black px-6 py-1.5 rounded-full text-sm font-black tracking-widest uppercase border border-zinc-300 shadow transform -rotate-2 whitespace-nowrap z-10">
                            Select a Blind Box
                        </div>
                    </div>
                </motion.div>
            </div>
        ) : (
            <div key="post-select-title" className="absolute top-0 left-0 w-full z-20 pt-6 pb-2 flex flex-col items-center pointer-events-none">
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="relative flex flex-col items-center"
                >
                    <div className="relative mb-2">
                        <h1 className="absolute top-1 left-1 text-6xl md:text-8xl font-black tracking-tighter leading-none text-center text-[#FFD000] select-none"
                            style={{ WebkitTextStroke: '2px #000' }}>
                            GOOD LUCK!
                        </h1>
                        <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter leading-none text-center select-none"
                            style={{ WebkitTextStroke: '2px #000', color: '#FFF' }}>
                            GOOD LUCK!
                        </h1>
                    </div>
                </motion.div>
            </div>
        ))}
      </AnimatePresence>

      {/* 2D 扭蛋机主体 + 操作区左右排布 */}
      <AnimatePresence>
        {currentDrawer && (
            <motion.div 
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: "spring", damping: 25, stiffness: 90 }}
                className="absolute inset-0 z-10 flex items-end justify-center gap-10 px-6 pt-16 md:pt-20 pb-4 md:pb-6"
                style={{ willChange: 'transform' }}
            >
                <div className="relative transform scale-85 md:scale-100">
                    <GashaponMachine2D dispensedWinner={isDispensing ? currentResult : null} />
                </div>

                <div className="w-[640px] pointer-events-auto self-end">
                    <div className="bg-white/85 backdrop-blur-xl rounded-full px-6 py-4 flex items-center justify-between gap-6 border-2 border-zinc-300 shadow-lg">
                        

                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-white border-2 border-zinc-300 shadow-sm overflow-hidden">
                                {participants.find(p => p.id === currentDrawer.id)?.avatar ? (
                                    <img 
                                        src={participants.find(p => p.id === currentDrawer.id)!.avatar}
                                        alt="Current Player Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl">🎯</div>
                                )}
                            </div>
                            <div className="text-lg font-black text-black">{currentDrawer.name}</div>
                            <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                {participants.find(p => p.id === currentDrawer.id)?.department || 'Participant'}
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <motion.button
                                onClick={handleSpin}
                                disabled={isSpinning}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    relative w-24 h-24 rounded-full 
                                    bg-[#FFD000] text-black
                                    border-4 border-black
                                    shadow-[0_8px_0_0_rgba(0,0,0,1)]
                                    active:shadow-none active:translate-y-2
                                    flex items-center justify-center
                                    transition-all duration-100
                                    disabled:opacity-80 disabled:cursor-not-allowed
                                    disabled:shadow-none disabled:translate-y-2
                                `}
                            >
                                {isSpinning ? (
                                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="text-3xl font-black italic tracking-tighter">GO</span>
                                )}
                            </motion.button>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFD000] via-[#FF924C] to-[#FF4444] text-black px-4 py-2 rounded-full text-xs font-black tracking-widest border border-zinc-300 shadow">
                            <span>LEFT</span>
                            <span className="text-black text-lg">
                                {prizes.reduce((acc, p) => acc + p.remaining, 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* 选人阶段组件 */}
      {!currentDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20"
          >
              {participants.length > 0 ? (
                  <DrawerSelector onCardSelected={() => setHasSelectedCard(true)} />
              ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-8xl mb-6 opacity-20 grayscale">🎲</div>
                      <h2 className="text-4xl font-black text-zinc-300 mb-2">NO PARTICIPANTS</h2>
                      <p className="text-zinc-400 font-bold tracking-widest uppercase text-sm">Please add participants in settings</p>
                  </div>
              )}
          </motion.div>
      )}

      {/* 公证处组件 */}
      <NotaryPublic />

      {/* 抽奖结果弹窗 - Pop Mart Unboxing Style */}
      <AnimatePresence>
        {showResult && currentResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={800} gravity={0.15} colors={['#FFD000', '#FF4444', '#000000', '#FFFFFF']} />
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="relative bg-white p-2 rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-[#F8F8F8] rounded-[1.5rem] p-8 flex flex-col items-center border border-zinc-100">
                      <button 
                        onClick={handleClaimPrize}
                        className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors z-10"
                      >
                        <X size={24} />
                      </button>
                  
                  {/* Avatar Circle with Pop Ring */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mb-6 relative"
                  >
                    <div className="w-32 h-32 rounded-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative z-10 overflow-hidden">
                        {currentResult.participantId && participants.find(p => p.id === currentResult.participantId)?.avatar ? (
                             <img 
                                src={participants.find(p => p.id === currentResult.participantId)?.avatar} 
                                alt="Winner Avatar" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                             <Trophy size={48} className="text-[#FFD000]" />
                        )}
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-2 -right-2 text-4xl animate-bounce z-10">✨</div>
                    <div className="absolute -bottom-2 -left-2 text-4xl animate-bounce" style={{ animationDelay: '0.2s',zIndex: 10 }}>🎉</div>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-black mb-1 tracking-tight"
                  >
                    CONGRATS!
                  </motion.h2>
                  
                  <div className="text-zinc-500 font-medium mb-6">
                    {currentResult.participantName}
                  </div>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full py-4 px-6 bg-white rounded-xl border-2 border-zinc-100 mb-8 text-center shadow-sm"
                  >
                    <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">YOU WON</div>
                    <div className="text-xl font-black text-[#FF4444]">{currentResult.prizeName}</div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full"
                  >
                      <Button 
                        onClick={handleClaimPrize} 
                        className="w-full bg-[#FFD000] hover:bg-[#FFE033] text-black font-black text-lg py-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        CLAIM PRIZE
                      </Button>
                  </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 控制台已并入右侧操作区 */}
    </div>
  );
}
