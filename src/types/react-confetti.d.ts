declare module 'react-confetti' {
  import React from 'react';

  interface ConfettiProps {
    width: number;
    height: number;
    numberOfPieces?: number;
    friction?: number;
    wind?: number;
    gravity?: number;
    initialVelocityX?: number;
    initialVelocityY?: number;
    colors?: string[];
    opacity?: number;
    recycle?: boolean;
    run?: boolean;
    confettiSource?: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    drawShape?: (ctx: CanvasRenderingContext2D) => void;
    onConfettiComplete?: (confetti: any) => void;
  }

  const Confetti: React.FC<ConfettiProps>;
  export default Confetti;
}
