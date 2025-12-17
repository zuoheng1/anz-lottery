import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Volume2, X, Code2, Lock, Shuffle } from 'lucide-react';
import { Button } from './ui/Button';

export const NotaryPublic = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  const statement = "咳咳，试麦，试麦。各位 ANZ 的小伙伴们，晚上好！我是本次年会特邀的，莫得感情的 AI 公证员。兹证明：本次 ANZ Year End Party 抽奖，在风景优美、同时也非常隐蔽的——一亩山房森林美学聚会庄园举行。经由本 AI 的24小时无死角盯梢，我敢用我的 CPU 发誓：这台扭蛋机，绝对没有黑幕！没有后门！老板想中奖也得看我的算法！所有结果，纯属天意。我宣布：抽奖有效！祝大家锦鲤附体，大奖拿来吧你！";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!synth.current) return;

    if (isSpeaking) {
      synth.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const voices = synth.current.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh-CN') && (v.name.includes('Google') || v.name.includes('Microsoft'))) || voices.find(v => v.lang.includes('zh-CN'));

    const chunks = statement.split(/(?<=[。！？])/).filter(s => s.trim().length > 0);
    const styles = [
      { pitch: 1.35, rate: 1.18, volume: 1 },
      { pitch: 0.85, rate: 0.92, volume: 1 },
      { pitch: 1.15, rate: 1.35, volume: 1 },
      { pitch: 1.05, rate: 1.05, volume: 1 },
    ];

    let index = 0;
    const speakNext = () => {
      if (!synth.current) return;
      if (index >= chunks.length) {
        setIsSpeaking(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[index]);
      u.lang = 'zh-CN';
      if (zhVoice) u.voice = zhVoice;
      const style = styles[index % styles.length];
      u.pitch = style.pitch;
      u.rate = style.rate;
      u.volume = style.volume;
      u.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.current = u;
      synth.current.speak(u);
    };

    setIsSpeaking(true);
    speakNext();
  };

  return (
    <>
      {/* 悬浮公证徽章 */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-40 group flex items-center gap-2"
      >
        <div className="relative w-12 h-12 bg-blue-900/80 backdrop-blur-md rounded-full border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 animate-pulse" />
            <ShieldCheck className="w-6 h-6 text-blue-300 drop-shadow-[0_0_5px_rgba(147,197,253,0.8)]" />
        </div>
        <div className="bg-blue-950/80 backdrop-blur-md text-blue-200 px-3 py-1 rounded-full text-xs font-mono border border-blue-500/30 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300 pointer-events-none">
            AI公证处监督中
        </div>
      </motion.button>

      {/* 公证弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-white/85 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-zinc-200">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-black" />
                    <h3 className="text-lg font-bold text-black">公正性声明</h3>
                </div>
                <button 
                  onClick={() => {
                      setIsOpen(false);
                      if (synth.current) {
                          synth.current.cancel();
                          setIsSpeaking(false);
                      }
                  }}
                  className="text-zinc-500 hover:text-black transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 border-2 border-zinc-300 shadow">
                         <img src="/avatars/default.png" alt="AI Notary" className="w-16 h-16 rounded-full opacity-80 grayscale" onError={(e) => {
                             // Fallback if image fails
                             (e.target as HTMLImageElement).style.display = 'none';
                         }}/>
                         <ShieldCheck className="w-10 h-10 text-black absolute" />
                    </div>
                    <div className="text-center">
                        <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">AI Notary Public</div>
                        <div className="text-zinc-500 font-medium text-sm mt-1">一亩山房森林美学聚会庄园</div>
                    </div>
                </div>

                <div className="relative bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                    <p className="text-zinc-700 leading-relaxed text-justify font-serif italic relative z-10">
                        "{statement}"
                    </p>
                    <div className="absolute top-2 left-2 text-6xl text-zinc-300 font-serif leading-none -z-0 opacity-60">“</div>
                    <div className="absolute bottom-[-20px] right-4 text-6xl text-zinc-300 font-serif leading-none -z-0 opacity-60">”</div>
                </div>

                {/* Technical Verification Section */}
                <div className="border-t border-zinc-200 pt-4">
                  <button 
                    onClick={() => setShowTechDetails(!showTechDetails)}
                    className="w-full flex items-center justify-between text-zinc-500 hover:text-black text-xs uppercase tracking-widest mb-4 transition-colors"
                  >
                    <span>公平性技术核验参数</span>
                    <span>{showTechDetails ? '收起' : '查看详情'}</span>
                  </button>
                  
                  <AnimatePresence>
                    {showTechDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-1 gap-3 overflow-hidden"
                      >
                        <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm flex items-start gap-3">
                            <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="text-black text-sm font-bold">硬件级随机熵源</div>
                                <div className="text-zinc-600 text-xs mt-1">
                                    使用 <code className="bg-zinc-100 px-1 py-0.5 rounded text-green-600">window.crypto.getRandomValues</code>
                                    <br/>基于操作系统底层的真随机数生成器 (CSPRNG)，杜绝伪随机。
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm flex items-start gap-3">
                            <Shuffle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="text-black text-sm font-bold">Fisher-Yates 洗牌算法</div>
                                <div className="text-zinc-600 text-xs mt-1">
                                    采用 O(n) 复杂度的标准洗牌算法，确保每一种排列组合的出现概率在数学上是严格相等的。
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm flex items-start gap-3">
                            <Code2 className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                                <div className="text-black text-sm font-bold">双重随机化流程</div>
                                <div className="text-zinc-600 text-xs mt-1">
                                    系统对“参与者列表”和“奖品池”分别进行独立随机打乱，随后进行索引匹配。双盲机制确保结果不可预测。
                                </div>
                            </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer / Action */}
                <div className="flex justify-center pt-2">
                    <Button onClick={handleSpeak} className="px-6 py-3 rounded-full font-bold" variant={isSpeaking ? 'outline' : 'primary'}>
                        <Volume2 size={20} className={isSpeaking ? 'animate-bounce' : ''} />
                        {isSpeaking ? '正在宣读证词...' : '宣读公证词'}
                    </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
