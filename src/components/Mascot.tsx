import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EmotionType, VisorTheme } from "../types";
import { playSound } from "../utils/audio";

interface MascotProps {
  emotion: EmotionType;
  theme: VisorTheme;
  isInteractive?: boolean;
  onPet?: () => void;
}

export default function Mascot({ emotion, theme, isInteractive = true, onPet }: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Periodic random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (emotion !== "sleepy" && emotion !== "thinking") {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, [emotion]);

  // Track mouse coordinates to skew the eyes (look-at-cursor)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate center of mascot
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Compute delta clamped to maximum offset of 8px
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const maxOffset = 8;
      const clampFactor = Math.min(dist / 300, 1) * maxOffset;
      
      setMousePos({
        x: (dx / dist) * clampFactor,
        y: (dy / dist) * clampFactor,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMascotClick = () => {
    if (!isInteractive) return;
    playSound("boing");
    setClickCount((prev) => prev + 1);
    if (onPet) onPet();
  };

  // Sound effects per emotion triggers on mount
  useEffect(() => {
    if (emotion === "excited") playSound("sparkle");
    if (emotion === "sad") playSound("disappoint");
    if (emotion === "happy") playSound("chirp");
    if (emotion === "listening") playSound("listen");
    if (emotion === "thinking") playSound("thinking");
    if (emotion === "shy") playSound("select");
  }, [emotion]);

  // Particle emission helper based on emotion
  const getParticles = () => {
    if (emotion === "happy") {
      return Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        char: "✦",
        color: "text-amber-300",
        x: Math.random() * 200 - 100,
        y: -120 - Math.random() * 40,
        delay: i * 0.1,
      }));
    }
    if (emotion === "excited") {
      return Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        char: "💖",
        color: "text-rose-400",
        x: Math.random() * 180 - 90,
        y: -110 - Math.random() * 50,
        delay: i * 0.15,
      }));
    }
    if (emotion === "sleepy") {
      return Array.from({ length: 3 }).map((_, i) => ({
        id: i,
        char: "Zzz",
        color: "text-sky-300 font-mono text-xs",
        x: 60 + Math.random() * 30,
        y: -60 - Math.random() * 40,
        delay: i * 0.5,
      }));
    }
    if (emotion === "sad") {
      return Array.from({ length: 2 }).map((_, i) => ({
        id: i,
        char: "💧",
        color: "text-sky-400 opacity-80",
        x: (i === 0 ? -40 : 40) + Math.random() * 10,
        y: -10 + Math.random() * 30,
        delay: i * 0.3,
      }));
    }
    return [];
  };

  const activeParticles = getParticles();

  // Floating variants
  const mascotFloatingVariant = {
    animate: {
      y: emotion === "excited" ? [-5, -25, -5] : [0, -12, 0],
      rotate: emotion === "thinking" ? [0, 2, -2, 0] : [0, 1.5, -1.5, 0],
      transition: {
        duration: emotion === "excited" ? 1.0 : emotion === "sleepy" ? 5.0 : 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div 
      ref={containerRef} 
      className="relative flex flex-col items-center justify-center p-4 cursor-pointer select-none"
      onClick={handleMascotClick}
      id="aimi-mascot-container"
    >
      {/* Background Ambient Glow Halo */}
      <div 
        className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-1000 ${theme.ambient} opacity-25`} 
        style={{ transform: "translateY(-10px)" }}
      />

      {/* Floating Emotion Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        <AnimatePresence mode="popLayout">
          {activeParticles.map((p) => (
            <motion.div
              key={`${emotion}-${p.id}`}
              initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                scale: [0.6, 1.2, 1, 0.4],
                x: p.x, 
                y: p.y
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, delay: p.delay, ease: "easeOut", repeat: Infinity }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${p.color} pointer-events-none drop-shadow-md text-lg z-20`}
            >
              {p.char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Mascot Frame */}
      <motion.div
        variants={mascotFloatingVariant}
        animate="animate"
        className="relative z-10 flex flex-col items-center"
      >
        {/* Cute Floating Antennas / Ears */}
        <div className="absolute -top-12 flex justify-between w-40 px-2 pointer-events-none">
          {/* Left Cat-Ear */}
          <motion.div
            animate={
              emotion === "excited" ? { rotate: [0, -15, 10, 0] } :
              emotion === "sad" ? { rotate: -20, y: 6 } :
              emotion === "listening" ? { y: [0, -4, 0] } :
              { rotate: 0, y: 0 }
            }
            transition={{
              duration: 0.6,
              repeat: emotion === "listening" ? Infinity : 0,
              repeatType: "reverse"
            }}
            className="w-12 h-14 bg-gradient-to-tr from-slate-700 to-slate-800 rounded-tr-3xl rounded-bl-xl origin-bottom-right shadow-lg transform -rotate-12 border-t-2 border-r border-slate-600 relative overflow-hidden"
          >
            {/* Inner Ear LED */}
            <div className={`absolute bottom-1 right-1 w-7 h-10 rounded-tr-2xl rounded-bl-md bg-gradient-to-tr ${theme.gradient} opacity-80 ${theme.glow}`} />
          </motion.div>

          {/* Right Cat-Ear */}
          <motion.div
            animate={
              emotion === "excited" ? { rotate: [0, 15, -10, 0] } :
              emotion === "sad" ? { rotate: 20, y: 6 } :
              emotion === "listening" ? { y: [0, -4, 0] } :
              { rotate: 0, y: 0 }
            }
            transition={{
              duration: 0.6,
              repeat: emotion === "listening" ? Infinity : 0,
              repeatType: "reverse",
              delay: 0.1
            }}
            className="w-12 h-14 bg-gradient-to-tl from-slate-700 to-slate-800 rounded-tl-3xl rounded-br-xl origin-bottom-left shadow-lg transform rotate-12 border-t-2 border-l border-slate-600 relative overflow-hidden"
          >
            {/* Inner Ear LED */}
            <div className={`absolute bottom-1 left-1 w-7 h-10 rounded-tl-2xl rounded-br-md bg-gradient-to-tl ${theme.gradient} opacity-80 ${theme.glow}`} />
          </motion.div>
        </div>

        {/* Cute Floating Head Antennas ball */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <motion.div 
            animate={{
              height: emotion === "excited" ? [24, 34, 24] : [20, 24, 20],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 bg-slate-500 rounded-full"
          />
          <motion.div 
            animate={{
              scale: emotion === "thinking" ? [1, 1.3, 1] : 1,
              boxShadow: emotion === "thinking" ? "0 0 16px var(--color-sky-400)" : "0 0 8px transparent"
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className={`w-5 h-5 -mt-1 rounded-full bg-gradient-to-br ${theme.gradient} ${theme.glow} shadow-md`}
          />
        </div>

        {/* Outer Round Cyber Dome body */}
        <div className="relative w-56 h-48 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-[50%_50%_45%_45%] border-t-4 border-slate-600 shadow-[0_16px_40px_rgba(0,0,0,0.5),_inset_0_2px_4px_rgba(255,255,255,0.15)] flex items-center justify-center overflow-visible">
          
          {/* Edge Reflecting Bezel Line */}
          <div className="absolute inset-2 rounded-[50%_50%_45%_45%] border border-slate-700/60 pointer-events-none" />

          {/* LED Visor Screen */}
          <div className="w-[84%] h-[78%] bg-[#0e1624] rounded-[45%] border-t border-slate-900 shadow-inner flex flex-col items-center justify-center p-3 relative overflow-hidden">
            
            {/* Digital Grid scanlines overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_94%,rgba(255,255,255,0.05)_96%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-full" />

            {/* Glowing screen content wrapper */}
            <div className="w-full h-full flex flex-col justify-between items-center relative py-1">
              
              {/* Dynamic Eye Row */}
              <div className="flex justify-between w-[76%] items-center mt-3 scale-110">
                
                {/* Left Eye Container */}
                <motion.div 
                  className="relative flex items-center justify-center w-8 h-8"
                  style={{
                    x: mousePos.x,
                    y: mousePos.y,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {/* Blink overlay */}
                    {isBlinking ? (
                      <motion.div 
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: 0.1 }}
                        exit={{ scaleY: 1 }}
                        className={`w-7 h-1.5 rounded-full bg-gradient-to-r ${theme.gradient} ${theme.glow}`}
                      />
                    ) : (
                      <motion.div
                        key={emotion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        {/* Render Eye Graphic based on Emotion */}
                        {emotion === "idle" && (
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${theme.gradient} ${theme.glow} flex items-center justify-center`}>
                            {/* Cute Pupil reflection */}
                            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 left-1.5" />
                          </div>
                        )}

                        {emotion === "listening" && (
                          // Waves eyes
                          <svg className="w-8 h-8 overflow-visible" viewBox="0 0 24 24">
                            <motion.path 
                              d="M 2,12 Q 6,6 10,12 T 18,12" 
                              fill="none" 
                              stroke={`url(#themeGrad-${theme.id})`} 
                              strokeWidth="3.5" 
                              strokeLinecap="round"
                              animate={{ d: ["M 2,12 Q 6,6 10,12 T 18,12", "M 2,12 Q 6,18 10,12 T 18,12", "M 2,12 Q 6,6 10,12 T 18,12"] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <defs>
                                <linearGradient id={`themeGrad-${theme.id}`} x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor={theme.accent} />
                                  <stop offset="100%" stopColor="#fff" />
                                </linearGradient>
                              </defs>
                            </motion.path>
                          </svg>
                        )}

                        {emotion === "thinking" && (
                          // Cute winding arch spirals
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className={`w-7 h-7 border-[3.5px] border-dashed rounded-full ${theme.glow}`}
                            style={{ borderColor: theme.accent }}
                          />
                        )}

                        {(emotion === "speaking" || emotion === "happy") && (
                          // Happy curvy arch eyes (^ ^)
                          <div className="relative w-8 h-4 overflow-visible">
                            <svg className="w-full h-full" viewBox="0 0 24 12">
                              <path 
                                d="M 2,10 C 6,2 18,2 22,10" 
                                fill="none" 
                                stroke={theme.accent} 
                                strokeWidth="3.5" 
                                strokeLinecap="round" 
                              />
                            </svg>
                          </div>
                        )}

                        {emotion === "excited" && (
                          // Glowing Star eyes
                          <svg className="w-8 h-8 fill-current text-yellow-300 drop-shadow-md overflow-visible animate-pulse" viewBox="0 0 24 24">
                            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                          </svg>
                        )}

                        {emotion === "sad" && (
                          // Drooping tearful eyes (/ \)
                          <div className="relative w-8 h-4 overflow-visible">
                            <svg className="w-full h-full" viewBox="0 0 24 12">
                              <path 
                                d="M 2,2 C 8,10 16,10 22,2" 
                                fill="none" 
                                stroke={theme.accent} 
                                strokeWidth="3.5" 
                                strokeLinecap="round" 
                              />
                            </svg>
                            {/* Tiny cyber tear */}
                            <motion.div 
                              animate={{ y: [4, 18], opacity: [1, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                              className="absolute w-1.5 h-3 bg-sky-300 rounded-full left-3 top-2"
                            />
                          </div>
                        )}

                        {emotion === "shy" && (
                          // Cute blushing horizontal indicators (looking bashfully downwards < >)
                          <div className="flex gap-0.5 items-center justify-center">
                            <div className="w-2.5 h-4 bg-rose-400 rounded-full transform -rotate-12" />
                            <div className="w-1.5 h-2 bg-rose-300 rounded-full" />
                          </div>
                        )}

                        {emotion === "sleepy" && (
                          // Sleeping lines (- -)
                          <div className="w-6 h-1 rounded-full bg-sky-300 opacity-80" />
                        )}

                        {emotion === "surprised" && (
                          // Large hollow ring eyes (O O)
                          <div className={`w-7 h-7 rounded-full border-[3.5px] bg-transparent ${theme.glow}`} style={{ borderColor: theme.accent }} />
                        )}

                        {emotion === "cool" && (
                          // Sleek dark sunglasses / rectangular winking look
                          <div className="relative w-8 h-5 flex items-center justify-center">
                            <div className="w-8 h-3.5 bg-slate-900 rounded border border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] flex items-center">
                              <div className="w-3.5 h-1.5 bg-cyan-400 rounded-sm mx-1 animate-pulse" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Right Eye Container */}
                <motion.div 
                  className="relative flex items-center justify-center w-8 h-8"
                  style={{
                    x: mousePos.x,
                    y: mousePos.y,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isBlinking ? (
                      <motion.div 
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: 0.1 }}
                        exit={{ scaleY: 1 }}
                        className={`w-7 h-1.5 rounded-full bg-gradient-to-r ${theme.gradient} ${theme.glow}`}
                      />
                    ) : (
                      <motion.div
                        key={emotion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        {/* Eye rendering */}
                        {emotion === "idle" && (
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${theme.gradient} ${theme.glow} flex items-center justify-center`}>
                            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 left-1.5" />
                          </div>
                        )}

                        {emotion === "listening" && (
                          <svg className="w-8 h-8 overflow-visible" viewBox="0 0 24 24">
                            <motion.path 
                              d="M 2,12 Q 6,18 10,12 T 18,12" 
                              fill="none" 
                              stroke={`url(#themeGrad-${theme.id})`} 
                              strokeWidth="3.5" 
                              strokeLinecap="round"
                              animate={{ d: ["M 2,12 Q 6,18 10,12 T 18,12", "M 2,12 Q 6,6 10,12 T 18,12", "M 2,12 Q 6,18 10,12 T 18,12"] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            />
                          </svg>
                        )}

                        {emotion === "thinking" && (
                          <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className={`w-7 h-7 border-[3.5px] border-dashed rounded-full ${theme.glow}`}
                            style={{ borderColor: theme.accent }}
                          />
                        )}

                        {(emotion === "speaking" || emotion === "happy") && (
                          <div className="relative w-8 h-4 overflow-visible">
                            <svg className="w-full h-full" viewBox="0 0 24 12">
                              <path 
                                d="M 2,10 C 6,2 18,2 22,10" 
                                fill="none" 
                                stroke={theme.accent} 
                                strokeWidth="3.5" 
                                strokeLinecap="round" 
                              />
                            </svg>
                          </div>
                        )}

                        {emotion === "excited" && (
                          <svg className="w-8 h-8 fill-current text-yellow-300 drop-shadow-md overflow-visible animate-pulse" viewBox="0 0 24 24">
                            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                          </svg>
                        )}

                        {emotion === "sad" && (
                          <div className="relative w-8 h-4 overflow-visible">
                            <svg className="w-full h-full" viewBox="0 0 24 12">
                              <path 
                                d="M 2,2 C 8,10 16,10 22,2" 
                                fill="none" 
                                stroke={theme.accent} 
                                strokeWidth="3.5" 
                                strokeLinecap="round" 
                              />
                            </svg>
                            <motion.div 
                              animate={{ y: [4, 18], opacity: [1, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.6 }}
                              className="absolute w-1.5 h-3 bg-sky-300 rounded-full right-3 top-2"
                            />
                          </div>
                        )}

                        {emotion === "shy" && (
                          <div className="flex gap-0.5 items-center justify-center">
                            <div className="w-2.5 h-4 bg-rose-400 rounded-full transform rotate-12" />
                            <div className="w-1.5 h-2 bg-rose-300 rounded-full" />
                          </div>
                        )}

                        {emotion === "sleepy" && (
                          <div className="w-6 h-1 rounded-full bg-sky-300 opacity-80" />
                        )}

                        {emotion === "surprised" && (
                          <div className={`w-7 h-7 rounded-full border-[3.5px] bg-transparent ${theme.glow}`} style={{ borderColor: theme.accent }} />
                        )}

                        {emotion === "cool" && (
                          // Wink eye
                          <div className="relative w-8 h-4 overflow-visible">
                            <svg className="w-full h-full" viewBox="0 0 24 12">
                              <path 
                                d="M 2,10 Q 12,-1 22,10" 
                                fill="none" 
                                stroke={theme.accent} 
                                strokeWidth="3.5" 
                                strokeLinecap="round" 
                              />
                            </svg>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Rosy Cheeks Indicator (Flush when happy, sad, excited, blush) */}
              <div className="absolute inset-x-4 top-[50%] flex justify-between pointer-events-none px-2">
                <motion.div 
                  animate={{
                    scale: emotion === "shy" ? 1.6 : emotion === "excited" || emotion === "happy" ? 1.3 : 1,
                    opacity: emotion === "sleepy" ? 0.1 : emotion === "shy" ? 0.8 : 0.45,
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-4 h-2.5 bg-rose-500 rounded-full blur-[2px]" 
                />
                <motion.div 
                  animate={{
                    scale: emotion === "shy" ? 1.6 : emotion === "excited" || emotion === "happy" ? 1.3 : 1,
                    opacity: emotion === "sleepy" ? 0.1 : emotion === "shy" ? 0.8 : 0.45,
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-4 h-2.5 bg-rose-500 rounded-full blur-[2px]" 
                />
              </div>

              {/* Dynamic Mouth Row */}
              <div className="mb-2 mt-1 h-6 flex items-center justify-center overflow-visible">
                <AnimatePresence mode="wait">
                  {emotion === "speaking" ? (
                    // Opening & closing talk scale ellipse
                    <motion.div 
                      key="mouth-speaking"
                      animate={{
                        scaleY: [1, 2.5, 1, 3.2, 1],
                        scaleX: [1, 1.3, 1, 0.8, 1],
                      }}
                      transition={{ duration: 0.45, repeat: Infinity }}
                      className={`w-3.5 h-1.5 rounded-full bg-gradient-to-r ${theme.gradient} ${theme.glow}`}
                    />
                  ) : emotion === "happy" || emotion === "excited" ? (
                    // Happy wide open happy mouth
                    <motion.div 
                      key="mouth-happy"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.5 }}
                      className="w-5 h-3 bg-rose-500 rounded-b-full border-t-[2px] border-amber-300 relative overflow-hidden"
                    >
                      {/* Sweet tiny tongue */}
                      <div className="absolute bottom-0 inset-x-1 h-1.5 bg-rose-300 rounded-t-full" />
                    </motion.div>
                  ) : emotion === "sad" ? (
                    // Downward curving pout
                    <svg key="mouth-sad" className="w-6 h-3" viewBox="0 0 24 12">
                      <path d="M 4,10 C 8,2 16,2 20,10" fill="none" stroke={theme.accent} strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : emotion === "surprised" ? (
                    // Circle "O" mouth
                    <div key="mouth-surprized" className={`w-3.5 h-3.5 rounded-full border-2 bg-transparent ${theme.glow}`} style={{ borderColor: theme.accent }} />
                  ) : emotion === "sleepy" ? (
                    // Tiny bubbles/ellipse snoring mouth
                    <motion.div 
                      key="mouth-sleepy"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2.5 h-2.5 rounded-full border border-sky-400 bg-sky-500/20"
                    />
                  ) : emotion === "cool" ? (
                    // Slick smirk
                    <div key="mouth-cool" className="w-4 h-1 bg-cyan-400 rounded-tr-lg transform rotate-6 border-b border-white/20" />
                  ) : (
                    // Default gentle smile mouth: "v" or wave line (w)
                    <div key="mouth-idle" className="relative w-6 h-2 overflow-visible opacity-90 flex items-center justify-center">
                      <svg className="w-5 h-2.5" viewBox="0 0 24 12">
                        <path d="M 4,2 Q 6,8 10,2 Q 14,8 18,2" fill="none" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

        {/* Cute Floating Mini Robot Hands/Wings */}
        <div className="absolute inset-x-[-18px] top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          {/* Left Hand */}
          <motion.div
            animate={
              emotion === "excited" ? { y: [-15, 10, -15], rotate: [20, -10, 20] } :
              emotion === "shy" ? { x: [0, 8, 0], rotate: [0, 25, 0] } :
              emotion === "happy" ? { rotate: [12, -8, 12] } :
              { y: [0, -4, 0], rotate: 0 }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className={`w-5 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border-l border-t border-slate-500 shadow-md origin-top-left -rotate-12 ${emotion === "shy" ? "opacity-90" : "opacity-100"}`}
          />

          {/* Right Hand */}
          <motion.div
            animate={
              emotion === "excited" ? { y: [10, -15, 10], rotate: [-20, 10, -20] } :
              emotion === "shy" ? { x: [0, -8, 0], rotate: [0, -25, 0] } :
              emotion === "happy" ? { rotate: [-12, 8, -12] } :
              { y: [-4, 0, -4], rotate: 0 }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="w-5 h-12 rounded-full bg-gradient-to-bl from-slate-600 to-slate-800 border-r border-t border-slate-500 shadow-md origin-top-right rotate-12"
          />
        </div>
        
        {/* Floating shadow ring below base */}
        <div className="w-36 h-2.5 bg-black/40 rounded-full blur-[4px] mt-2 animate-pulse mx-auto" />
      </motion.div>
    </div>
  );
}
