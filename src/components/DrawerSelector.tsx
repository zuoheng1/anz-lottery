import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLotteryStore } from '../stores/useLotteryStore';
import { useToastStore } from '../store/toastStore';
import { useLotterySound } from '../hooks/useLotterySound';

export const DrawerSelector = ({ onCardSelected }: { onCardSelected?: () => void }) => {
  const { participants, winners, setCurrentDrawer } = useLotteryStore();
  const { addToast } = useToastStore();
  
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<typeof participants[0] | null>(null);
  const [cards, setCards] = useState<Array<{id: string, color: string, rotation: number}>>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { playCardFlipSound } = useLotterySound();

  // Generate cards based on eligible participants
  useEffect(() => {
    // 1. Filter eligible participants
    const eligibleCount = participants.filter(p => !winners.some(w => w.participantId === p.id)).length;
    
    // Generate cards based on eligible participants
    setCards(Array.from({ length: eligibleCount }).map((_, i) => ({
      id: `card-${i}`,
      color: [
        '#FF595E', // Pop Red
        '#FFCA3A', // Pop Yellow
        '#8AC926', // Pop Green
        '#1982C4', // Pop Blue
        '#6A4C93', // Pop Purple
        '#FF924C', // Pop Orange
      ][i % 6],
      rotation: 0 // No rotation for grid layout
    })));
  }, [participants, winners]);
  
  const allCompleted = participants.length > 0 && participants.filter(p => !winners.some(w => w.participantId === p.id)).length === 0;

  const handleCardClick = (cardId: string) => {
    if (isShuffling || selectedPerson) return; // Prevent double clicks

    setSelectedCardId(cardId);
    playCardFlipSound();
    
    // 1. Filter eligible participants
    const eligible = participants.filter(p => !winners.some(w => w.participantId === p.id));
    
    if (eligible.length === 0) {
      addToast('所有人都已中奖！', 'warning');
      setSelectedCardId(null);
      return;
    }

    setIsShuffling(true);

    // 2. Pick random person
    const cryptoRandom = () => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xffffffff + 1);
    };
    const randomIndex = Math.floor(cryptoRandom() * eligible.length);
    const person = eligible[randomIndex];

    // 3. Reveal animation sequence
    setTimeout(() => {
        setSelectedPerson(person);
        setIsShuffling(false);
        playCardFlipSound();
        onCardSelected?.();
    }, 600);
  };

  const handleConfirmSelection = () => {
      if (selectedPerson) {
          setCurrentDrawer(selectedPerson);
      }
  };

  const CardItem = ({ card }: { card: typeof cards[0] }) => (
    <motion.div
        key={card.id}
        onClick={() => handleCardClick(card.id)}
        layoutId={card.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={selectedCardId === card.id ? {
            scale: 1,
            opacity: 1,
            zIndex: 50
        } : selectedCardId ? {
            scale: 0,
            opacity: 0
        } : {
            scale: 1,
            opacity: 1,
            zIndex: 1
        }}
        whileHover={!selectedCardId ? { 
            scale: 1.05, 
            y: -10,
            zIndex: 10,
            transition: { duration: 0.2 }
        } : {}}
        className="w-40 h-60 rounded-[1.5rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] bg-white cursor-pointer relative group overflow-hidden border-2 border-transparent hover:border-black/5 transition-all select-none"
        style={{ cursor: 'pointer', background: card.color }}
    >
        {/* Blind Box "Packaging" Design */}
        <div className="w-full h-full flex flex-col items-center justify-between p-5 relative z-10">
            {/* Top Logo Area */}
            <div className="w-full flex justify-center">
                <div className="bg-black/10 px-3 py-1 rounded-full">
                    <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">Blind Box</span>
                </div>
            </div>

            {/* Center Question Mark */}
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                <span className="text-5xl font-black text-white drop-shadow-md">?</span>
            </div>

            {/* Bottom Brand */}
            <div className="text-white/90 font-black text-sm tracking-wider uppercase">
                ANZ PARTY
            </div>
        </div>
        
        {/* Subtle Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#fff_0%,_transparent_60%)]" />
        <div className="absolute inset-0 opacity-5" 
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} 
        />
    </motion.div>
  );

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-auto">
        {/* Title */}
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-24 text-center"
        >
             {/* Dynamic Title based on state */}
             {selectedPerson ? (
                 <>
                    
                    <p className="text-zinc-400 font-bold tracking-[0.2em] mt-2 uppercase text-xs">Let the show begin</p>
                 </>
             ) : (
                 // Empty when no card selected, or could be "WHO IS NEXT?" if desired for initial state
                 // But user requested "Don't show WHO IS NEXT" when card is drawn.
                 // The previous request was "Don't show WHO IS NEXT when card is present".
                 // So we keep it empty or show something else initially if needed.
                 // Let's stick to empty as per previous instruction for "WHO IS NEXT", but add "GOOD LUCK" when selected.
                 null
             )}
        </motion.div>

        {/* Card Deck Area - Grid Style */}
        <div className="absolute inset-x-0 top-48 md:top-56 bottom-0 flex items-center justify-center perspective-1000 overflow-hidden">
            <div className="w-full max-w-7xl h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
                {allCompleted ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center bg-white p-12 rounded-[2rem] shadow-xl border-4 border-zinc-100"
                    >
                        <div className="text-8xl mb-6 animate-bounce">🎉</div>
                        <h3 className="text-4xl font-black text-zinc-900 mb-2">ALL COMPLETED</h3>
                        <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">The event has successfully concluded</p>
                    </motion.div>
                ) : !selectedPerson ? (
                    <div className="w-full flex flex-col justify-center items-center gap-4">
                         {/* Split cards into two rows for balanced layout */}
                         <div className="flex justify-center gap-6 flex-wrap">
                            {cards.slice(0, Math.ceil(cards.length / 2)).map(card => (
                                <CardItem key={card.id} card={card} />
                            ))}
                         </div>
                         <div className="flex justify-center gap-6 flex-wrap">
                            {cards.slice(Math.ceil(cards.length / 2)).map(card => (
                                <CardItem key={card.id} card={card} />
                            ))}
                         </div>
                    </div>
                ) : (
                    <motion.div
                        layoutId={selectedCardId!} // Morph from the clicked card
                        initial={{ rotateY: 180, scale: 1 }} // Start flipped (seeing back)
                        animate={{ rotateY: 0, scale: 1.2 }} // Flip to front
                        transition={{ 
                            layout: { duration: 0.5, ease: "easeInOut" },
                            rotateY: { duration: 0.8, ease: "backOut", delay: 0.2 } // Delay flip slightly
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="relative w-[18rem] h-[30rem] z-50"
                    >
                        {/* Front Face (Content) - Character Card Style */}
                        <div 
                            className="absolute inset-0 w-full h-full rounded-[2rem] bg-white border-4 border-white shadow-2xl overflow-hidden z-20 flex flex-col"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            {/* Card Header Background - Takes 40% height */}
                            <div className="h-2/5 w-full bg-[#FFD000] relative shrink-0">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
                            </div>
                            
                            {/* Content Body - Takes remaining height */}
                            <div className="flex-1 w-full relative flex flex-col items-center px-4">
                                {/* Avatar - Pulled up with negative margin - Increased Size */}
                                <div className="-mt-24 w-48 h-48 rounded-full border-[6px] border-white shadow-lg mb-2 bg-zinc-100 overflow-hidden shrink-0 relative z-10">
                                    {selectedPerson.avatar ? (
                                        <img src={selectedPerson.avatar} alt={selectedPerson.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-6xl font-black text-zinc-400">
                                            {selectedPerson.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Name */}
                                <h3 className="text-3xl font-black text-zinc-900 mb-1 text-center tracking-tight shrink-0">{selectedPerson.name}</h3>
                                
                                {/* Department Tag */}
                                <div className="px-3 py-1 bg-zinc-100 rounded-full text-zinc-500 font-bold text-[10px] uppercase tracking-wider shadow-sm shrink-0 mb-auto">
                                    {selectedPerson.department || 'LUCKY PARTICIPANT'}
                                </div>
                                
                                {/* Action Button - Mimic the black bar in image */}
                                <div className="w-full pb-6 shrink-0 mt-4">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleConfirmSelection();
                                        }}
                                        className="w-full h-12 bg-black text-white rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl group cursor-pointer"
                                    >
                                        <span>START LOTTERY</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Back Face (Pattern) - Blind Box Style */}
                        <div 
                            className="absolute inset-0 w-full h-full rounded-[2rem] shadow-xl pointer-events-none"
                            style={{ 
                                backfaceVisibility: 'hidden', 
                                transform: 'rotateY(180deg)',
                                background: cards.find(c => c.id === selectedCardId)?.color || '#ef4444'
                            }}
                        >
                             <div className="w-full h-full flex flex-col items-center justify-between p-6">
                                <div className="w-full flex justify-center">
                                    <div className="bg-black/10 px-3 py-1 rounded-full">
                                        <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">Blind Box</span>
                                    </div>
                                </div>
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
                                    <span className="text-6xl font-black text-white drop-shadow-md">?</span>
                                </div>
                                <div className="text-white/90 font-black text-sm tracking-wider uppercase">
                                    ANZ PARTY
                                </div>
                            </div>
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#fff_0%,_transparent_60%)] pointer-events-none" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </div>

        {/* Action Button - Only show if not selected */}
        {!selectedPerson && !isShuffling && !selectedCardId && !allCompleted && (
            <div className="absolute bottom-24">
                <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full border border-zinc-200 shadow-sm text-zinc-400 font-bold text-xs tracking-widest animate-pulse">
                    PICK A BLIND BOX TO REVEAL
                </div>
            </div>
        )}
    </div>
  );
};
