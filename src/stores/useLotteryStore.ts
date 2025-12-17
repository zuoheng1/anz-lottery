import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState } from '../types';

export const useLotteryStore = create<AppState>()(
  persist(
    (set) => ({
      participants: [],
      prizes: [],
      winners: [],
      isSpinning: false,
      currentWinner: null,
      currentDrawer: null,

      setParticipants: (participants) => set({ participants }),
      addParticipant: (participant) => set((state) => ({ participants: [...state.participants, participant] })),
      removeParticipant: (id) => set((state) => ({ participants: state.participants.filter((p) => p.id !== id) })),
      clearParticipants: () => set({ participants: [] }),

      setPrizes: (prizes) => set({ prizes }),
      updatePrize: (id, updates) =>
        set((state) => ({
          prizes: state.prizes.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      addWinner: (winner) =>
        set((state) => {
          const newPrizes = state.prizes.map((p) =>
            p.id === winner.prizeId ? { ...p, remaining: p.remaining - 1 } : p
          );
          return {
            winners: [...state.winners, winner],
            prizes: newPrizes,
          };
        }),
      clearWinners: () =>
        set((state) => {
          const newPrizes = state.prizes.map((p) => ({ ...p, remaining: p.count }));
          return { winners: [], prizes: newPrizes };
        }),

      setIsSpinning: (isSpinning) => set({ isSpinning }),
      setCurrentWinner: (currentWinner) => set({ currentWinner }),
      setCurrentDrawer: (currentDrawer) => set({ currentDrawer }),

      resetLottery: () =>
        set((state) => ({
          winners: [],
          prizes: state.prizes.map((p) => ({ ...p, remaining: p.count })),
          currentWinner: null,
          currentDrawer: null,
          isSpinning: false,
        })),
    }),
    {
      name: 'anz-lottery-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        participants: state.participants,
        prizes: state.prizes,
        winners: state.winners,
      }),
    }
  )
);
