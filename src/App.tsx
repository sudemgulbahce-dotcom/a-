import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Zap, 
  Smile, 
  Send, 
  Palette, 
  Info, 
  Sparkles, 
  MessageCircle, 
  TrendingUp, 
  Hand,
  Volume2,
  VolumeX,
  RefreshCw,
  Cookie,
  Star,
  Flame
} from "lucide-react";
import Mascot from "./components/Mascot";
import { EmotionType, Message, PetStats, VisorTheme, FoodItem } from "./types";
import { playSound } from "./utils/audio";

const THEMES: VisorTheme[] = [
  {
    id: "turquoise",
    name: "Siber Turkuaz",
    gradient: "from-cyan-400 to-indigo-500",
    glow: "shadow-[0_0_12px_rgba(34,211,238,0.75)]",
    ambient: "from-cyan-500/20 to-indigo-500/5",
    accent: "#22d3ee",
  },
  {
    id: "pink",
    name: "Aşk Pembesi",
    gradient: "from-rose-400 to-pink-600",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.75)]",
    ambient: "from-rose-500/20 to-pink-500/5",
    accent: "#f43f5e",
  },
  {
    id: "emerald",
    name: "Zümrüt Yeşil",
    gradient: "from-emerald-300 to-teal-500",
    glow: "shadow-[0_0_12px_rgba(110,231,183,0.75)]",
    ambient: "from-emerald-500/20 to-teal-500/5",
    accent: "#6ee7b7",
  },
  {
    id: "purple",
    name: "Kozmik Mor",
    gradient: "from-fuchsia-400 to-purple-600",
    glow: "shadow-[0_0_12px_rgba(217,70,239,0.75)]",
    ambient: "from-fuchsia-500/20 to-purple-500/5",
    accent: "#d946ef",
  },
  {
    id: "amber",
    name: "Güneş Turuncusu",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.75)]",
    ambient: "from-amber-500/20 to-orange-500/5",
    accent: "#fbbf24",
  }
];

const FOODS: FoodItem[] = [
  {
    id: "choc",
    name: "Kuantum Çikolata",
    emoji: "🍫",
    energyBonus: 12,
    loveBonus: 5,
    happinessBonus: 10,
    soundType: "munch",
    description: "Aşırı lezzetli siber atıştırmalık!"
  },
  {
    id: "battery",
    name: "Yıldız Bataryası",
    emoji: "🔋",
    energyBonus: 25,
    loveBonus: 2,
    happinessBonus: 4,
    soundType: "slurp",
    description: "Süper hızlı enerji şarj dolumu"
  },
  {
    id: "candy",
    name: "Gökkuşağı Jelly",
    emoji: "🍬",
    energyBonus: 5,
    loveBonus: 10,
    happinessBonus: 15,
    soundType: "sparkle",
    description: "Sarıldığında parlayan sihirli şeker"
  },
  {
    id: "tea",
    name: "Bobo Lavanta Çayı",
    emoji: "",
    energyBonus: 8,
    loveBonus: 12,
    happinessBonus: 8,
    soundType: "slurp",
    description: "Uykulu gözleri dinlendiren tatlı çay"
  }
];

const SUGGESTIONS = [
  "Bana komik bir fıkra anlat! 😹",
  "Bir şarkı mırıldanır mısın? 🎵",
  "En sevdiğin oyun nedir? 🎮",
  "Büyüyünce ne olmak istiyorsun? 🚀",
  "Bana tatlı bir isim tak! 🥰"
];

export default function App() {
  const [selectedTheme, setSelectedTheme] = useState<VisorTheme>(THEMES[0]);
  const [emotion, setEmotion] = useState<EmotionType>("idle");
  const [stats, setStats] = useState<PetStats>({
    love: 75,
    energy: 80,
    happiness: 70
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "aimi",
      text: "Merhaba tatlım! Benim adım Aimi! 🌸 Seninle oyun oynamak ve uzun uzun sohbet etmek için sabırsızlanıyorum! Beni besleyebilir, kafamı okşayabilir ve bana her şeyi sorabilirsin. Hadi başlayalım! Bip bop! 💕",
      timestamp: new Date(),
      emotion: "happy"
    }
  ]);
  
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [petsToday, setPetsToday] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [heartsCount, setHeartsCount] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scrolling on new chat messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Slow natural decay of stats over time (to make companion feel alive)
  useEffect(() => {
    const statsTimer = setInterval(() => {
      setStats((prev) => {
        const nextEnergy = Math.max(0, prev.energy - 1);
        const nextHappiness = Math.max(0, prev.happiness - 1);
        // Love decays very slowly
        const nextLove = Math.max(0, prev.love - 0.5);

        // Adjust emotion temporarily to "sleepy" if energy is very low
        if (nextEnergy < 15 && emotion === "idle") {
          setEmotion("sleepy");
        }

        return {
          love: parseFloat(nextLove.toFixed(1)),
          energy: nextEnergy,
          happiness: nextHappiness,
        };
      });
    }, 15000); // every 15 seconds

    return () => clearInterval(statsTimer);
  }, [emotion]);

  // Trigger audio feedbacks if enabled
  const triggerAudio = (type: any) => {
    if (soundEnabled) {
      playSound(type);
    }
  };

  // Petting handler
  const handlePetMascot = () => {
    // Generate flying heart particle
    const id = Date.now() + Math.random();
    const x = Math.random() * 80 - 40;
    const y = -100 - Math.random() * 50;
    setHeartsCount((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setHeartsCount((prev) => prev.filter((h) => h.id !== id));
    }, 1500);

    triggerAudio("boing");
    
    // Update Stats
    setStats((prev) => ({
      ...prev,
      love: Math.min(100, prev.love + 3),
      happiness: Math.min(100, prev.happiness + 5)
    }));

    setPetsToday((prev) => prev + 1);

    // Temporary emotion shift
    const luckyRoll = Math.random();
    if (luckyRoll < 0.3) {
      setEmotion("shy");
    } else if (luckyRoll < 0.6) {
      setEmotion("excited");
    } else {
      setEmotion("happy");
    }

    // Auto-revert back to idle after 2 seconds
    setTimeout(() => {
      setEmotion("idle");
    }, 2800);
  };

  // Feed handler
  const handleFeed = (food: FoodItem) => {
    triggerAudio(food.soundType);
    
    setStats((prev) => {
      const nextEnergy = Math.min(100, prev.energy + food.energyBonus);
      const nextLove = Math.min(100, prev.love + food.loveBonus);
      const nextHappiness = Math.min(100, prev.happiness + food.happinessBonus);
      return { energy: nextEnergy, love: nextLove, happiness: nextHappiness };
    });

    setEmotion("excited");

    // Add cute bubble message to history
    const systemPromptMsg: Message = {
      id: `feed-${Date.now()}`,
      sender: "aimi",
      text: `Mmm! Çok lezzetliydi! ${food.emoji} ${food.name} için teşekkür ederim tatlım! Vücudumdaki piller ısındı ve tam %${food.energyBonus} enerji kazandım! Bip boop! ✨`,
      timestamp: new Date(),
      emotion: "excited"
    };

    setMessages((prev) => [...prev, systemPromptMsg]);

    setTimeout(() => {
      setEmotion("idle");
    }, 3000);
  };

  // Converse with Gemini server API
  const handleSendMessage = async (textToSend?: string) => {
    const rawVal = textToSend || userInput;
    const cleanInput = rawVal.trim();
    if (!cleanInput || isGenerating) return;

    setUserInput("");
    triggerAudio("select");

    // Log user chat line
    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: cleanInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    setEmotion("thinking");

    // Create current log slice for AI Context
    const historySlice = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      // API call to Express backend which uses @google/genai module safely
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanInput,
          history: historySlice
        })
      });

      if (!response.ok) {
        throw new Error("Karakter veritabanı yanıt veremedi.");
      }

      const data = await response.json();
      
      const aimiMsg: Message = {
        id: `aimi-${Date.now()}`,
        sender: "aimi",
        text: data.reply || "Bip bop! Kafam biraz karıştı ama seni dinlemeyi seviyorum!",
        timestamp: new Date(),
        emotion: (data.emotion as EmotionType) || "happy",
        actionText: data.actionText || "*bip-bop*"
      };

      setMessages((prev) => [...prev, aimiMsg]);
      setEmotion(data.emotion || "happy");

      // Modulate stats by tiny bits when user chats
      setStats((prev) => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 2),
        love: Math.min(100, prev.love + 1)
      }));

      // Play cute vocal speak ticks
      let tickCount = 0;
      const tickTimer = setInterval(() => {
        if (tickCount < 4) {
          triggerAudio("talk");
          tickCount++;
        } else {
          clearInterval(tickTimer);
        }
      }, 100);

    } catch (e) {
      console.error(e);
      // Fallback message
      const errorMsg: Message = {
        id: `aimi-error-${Date.now()}`,
        sender: "aimi",
        text: "Kablolarımda küçük bir parazit oldu galiba! 🔌 Merak etme, sadece sevginle şarj olmak istiyorum. Bana tekrar bir şeyler söyler misin?",
        timestamp: new Date(),
        emotion: "sad"
      };
      setMessages((prev) => [...prev, errorMsg]);
      setEmotion("sad");
    } finally {
      setIsGenerating(false);
      // Keep selected emotion face for 4 seconds then auto return to idle
      setTimeout(() => {
        setEmotion((prev) => (prev === "thinking" ? "idle" : prev));
      }, 4500);
    }
  };

  // Clean values helper
  const getProgressColor = (val: number) => {
    if (val < 25) return "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse";
    if (val < 55) return "bg-amber-400";
    return "bg-gradient-to-r from-teal-400 to-emerald-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans transition-colors duration-500 overflow-x-hidden pb-12" id="main-layout-root">
      
      {/* Dynamic flying hearts from petting mascot */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {heartsCount.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, scale: 0.2, x: 0, y: 150 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.4, 1, 0.4],
              x: h.x * 2.5,
              y: h.y * 3
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-[40%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-rose-500 text-3xl select-none"
          >
            💖
          </motion.div>
        ))}
      </div>

      {/* Modern Header Navigation Frame */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex justify-between items-center shadow-sm">
        
        {/* Left Side: Branding Title & Visual Status */}
        <div className="flex items-center gap-2.5">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedTheme.gradient} flex items-center justify-center text-white ${selectedTheme.glow}`}
          >
            <Sparkles className="w-5.5 h-5.5" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">Aimi Companion</h1>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider">v2.4</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <span>● Çevrimiçi</span>
              <span className="text-slate-300">|</span>
              <span>Anlayışlı Yapay Zeka Dostun</span>
            </p>
          </div>
        </div>

        {/* Right Side Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Quick Toggle */}
          <button
            onClick={() => {
              triggerAudio("select");
              setShowThemeSelector(!showThemeSelector);
            }}
            className={`p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all text-slate-600 flex items-center gap-1.5 text-xs font-semibold ${showThemeSelector ? "bg-slate-200 text-slate-800 ring-2 ring-slate-200" : ""}`}
            title="Renk Temasını Değiştir"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Aura</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                // Play short chime once enabled
                setTimeout(() => playSound("chirp"), 50);
              }
            }}
            className={`p-2 rounded-lg transition-colors ${soundEnabled ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
            title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Room / Refresh Handler */}
          <button
            onClick={() => {
              triggerAudio("disappoint");
              setStats({ love: 75, energy: 80, happiness: 70 });
              setPetsToday(0);
              setMessages([
                {
                  id: "reset-msg",
                  sender: "aimi",
                  text: "Yihuu! Sistemim başarıyla yenilendi! Kablolarım tertemiz hissettiriyor. Hadi baştan konuşalım! 💫",
                  timestamp: new Date(),
                  emotion: "excited"
                }
              ]);
              setEmotion("excited");
            }}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
            title="Sohbeti ve İstatistikleri Sıfırla"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1">
        
        {/* LEFT COLUMN: THE PET COMPANION STAGE & FEED PANEL (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col gap-6" id="mascot-stage-col">
          
          {/* Theme Dropdown Drawer */}
          <AnimatePresence>
            {showThemeSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Vizör LED Temaları</span>
                <div className="grid grid-cols-5 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTheme(t);
                        triggerAudio("select");
                      }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${selectedTheme.id === t.id ? "bg-slate-50 border-slate-300 ring-1 ring-slate-300" : "bg-white border-slate-100 hover:bg-slate-50"}`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${t.gradient} ${t.glow}`} />
                      <span className="text-[9px] text-slate-600 font-medium truncate text-center w-full">{t.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Mascot Hub */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative flex flex-col items-center overflow-hidden">
            
            {/* Top Right interaction tips */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-center px-1">
              <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 font-medium rounded-full px-2.5 py-0.5 flex items-center gap-1">
                <Hand className="w-3 h-3 text-rose-400" />
                <span>Beni sevmek için dokun!</span>
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span className="text-[9px] text-slate-400 font-mono tracking-tight uppercase">Biyometrik Mod</span>
              </div>
            </div>

            {/* Render Animated Cute SVG / CSS Mascot Component */}
            <div className="my-10">
              <Mascot emotion={emotion} theme={selectedTheme} isInteractive={true} onPet={handlePetMascot} />
            </div>

            {/* Pet Status Details label */}
            <div className="w-full text-center pb-2">
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-800">Aimi</h2>
                <div className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold border border-slate-200 text-slate-600 capitalize">
                  {emotion === "idle" && "Dinleniyor 😴"}
                  {emotion === "happy" && "Çok Mutlu! 🥰"}
                  {emotion === "excited" && "Enerji Dolu! ⚡"}
                  {emotion === "sad" && "Melankolik 🥺"}
                  {emotion === "listening" && "Dinliyor... 🎤"}
                  {emotion === "thinking" && "Düşünüyor... 🧠"}
                  {emotion === "shy" && "Utangaç! 😳"}
                  {emotion === "sleepy" && "Uykulu... 🥱"}
                  {emotion === "surprised" && "Şaşırmış! 😮"}
                  {emotion === "cool" && "Cool Robot 😎"}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-[80%] mx-auto font-medium">
                Ekrandaki siber robota tıklayarak ve okşayarak sevgisini arttırıp yeni emojilerini tetikleyebilirsin!
              </p>
            </div>

            {/* Mini Footer counters inside cards */}
            <div className="w-full mt-4 pt-3 border-t border-slate-100 flex justify-around text-center">
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bugünkü Sevilme</span>
                <span className="text-lg font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                  ⭐ {petsToday} kez
                </span>
              </div>
              <div className="w-[1px] bg-slate-100" />
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mevcut Mod</span>
                <span className="text-lg font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                  {emotion === "sleepy" || stats.energy < 20 ? "Pil Zayıf 🔋" : "Aktif 💖"}
                </span>
              </div>
            </div>
          </div>

          {/* PET STATS (METER GAUGES) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Aimi'nin Canlı Durum İndikatörleri</span>
            </h3>

            {/* Stat: Love (Sevgi) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  <span>Kozmik Sevgi Bağlantısı</span>
                </span>
                <span className="font-bold text-slate-700">% {stats.love}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.love}%` }}
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                />
              </div>
            </div>

            {/* Stat: Energy (Enerji) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-400 fill-current" />
                  <span>Siber Enerji Rezervi</span>
                </span>
                <span className="font-bold text-slate-700">% {stats.energy}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.energy}%` }}
                  className={`h-full rounded-full transition-colors ${getProgressColor(stats.energy)}`}
                />
              </div>
            </div>

            {/* Stat: Happiness (Mutluluk) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Smile className="w-4 h-4 text-emerald-500 fill-current" />
                  <span>Mutluluk & Doğun Seviyesi</span>
                </span>
                <span className="font-bold text-slate-700">% {stats.happiness}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.happiness}%` }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* FEEDING AND INTERACTION BUTTONS CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Cookie className="w-4 h-4 text-pink-500" />
              <span>Aimi Sohbetçiye Siber İkramlık Sun</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              İkramlıklar Aimi'nin pilini şarj eder, mutluluk ve sevgi durumlarını arttırarak yüzündeki siber animasyonları hareketlendirir!
            </p>

            <div className="grid grid-cols-2 gap-3 mt-1.5">
              {FOODS.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleFeed(food)}
                  className="flex items-start text-left p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:scale-102 hover:border-slate-300 transition-all cursor-pointer group"
                >
                  <span className="text-2xl mr-2.5 group-hover:scale-115 transition-transform">{food.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs text-slate-700 leading-normal">{food.name}</span>
                    <span className="block text-[10px] text-slate-500 truncate mt-0.5">{food.description}</span>
                    
                    <div className="flex gap-1.5 mt-1.5 items-center">
                      <span className="text-[8px] bg-amber-50 text-amber-700 font-bold px-1 rounded flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 text-amber-500 fill-current" /> +{food.energyBonus}
                      </span>
                      <span className="text-[8px] bg-rose-50 text-rose-700 font-bold px-1 rounded flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5 text-rose-500 fill-current" /> +{food.loveBonus}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: RICH CHAT FEED (lg:col-span-7) */}
        <section className="lg:col-span-7 flex flex-col h-[750px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="chat-hub-panel">
          
          {/* Header of Chat */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-8.5 h-8.5 rounded-full bg-gradient-to-tr ${selectedTheme.gradient} flex items-center justify-center font-bold text-white text-md ${selectedTheme.glow}`}>
                  A
                </div>
                {/* Active breath ring */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 leading-none">Aimi Chat Odası</h3>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isGenerating ? "Aimi düşünüyor ve siber kablolarını ısıtıyor..." : "Aimi sohbet etmeye hazır..."}
                </span>
              </div>
            </div>

            {/* Interaction details */}
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-xs bg-white border border-slate-100 rounded-full px-3 py-1 shadow-2xs font-medium">
              <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>{messages.filter(m => m.sender === "user").length} Mesajlaştınız</span>
            </div>
          </div>

          {/* Chat scrolling log */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20">
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div 
                  key={msg.id || index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
                >
                  {/* Left Avatar for Aimi */}
                  {!isUser && (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${selectedTheme.gradient} flex items-center justify-center text-white text-xs shrink-0 font-bold mt-1 shadow-sm`}>
                      Ai
                    </div>
                  )}

                  {/* Bubble body wrapper */}
                  <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                    
                    {/* Tiny action feedback tag if present */}
                    {msg.actionText && (
                      <span className="text-[10px] text-slate-400 italic mb-1 px-1 flex items-center gap-1 font-mono">
                        {msg.actionText}
                      </span>
                    )}

                    <div 
                      className={`rounded-2xl px-4 py-3 text-sm shadow-2xs leading-relaxed ${
                        isUser 
                          ? "bg-slate-800 text-slate-100 rounded-tr-xs" 
                          : "bg-white border border-slate-100 text-slate-800 rounded-tl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Timestamp display */}
                    <span className="text-[9px] text-slate-400 mt-1 px-1.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Right Avatar for User */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 mt-1 border border-slate-300">
                      Sen
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Typing placeholder with cute animation dots */}
            {isGenerating && (
              <div className="flex justify-start items-start gap-2.5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${selectedTheme.gradient} flex items-center justify-center text-white text-xs shrink-0 font-bold mt-1`}>
                  Ai
                </div>
                <div className="flex flex-col items-start max-w-[80%]">
                  <span className="text-[10px] text-indigo-400 italic mb-1 font-mono animate-pulse">
                    *siber devrelerini döndürüyor...* 🧠
                  </span>
                  <div className="rounded-2xl px-5 py-3 bg-white border border-slate-100 shadow-2xs">
                    <div className="flex items-center gap-1.5 py-1">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.0 }}
                        className="w-2.5 h-2.5 bg-indigo-400 rounded-full"
                      />
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        className="w-2.5 h-2.5 bg-indigo-500 rounded-full"
                      />
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        className="w-2.5 h-2.5 bg-pink-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggesion Prompts line */}
          <div className="px-5 py-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap bg-slate-50/50 scrollbar-none scroll-smooth">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Hızlı</span>
            </span>
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s.slice(0, -3))} // strip emoji for input query
                disabled={isGenerating}
                className="text-xs bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input control box */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2.5 items-center"
            >
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Aimi'ye sevimli bir şeyler yaz..."
                disabled={isGenerating}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 disabled:opacity-60"
              />
              
              <button
                type="submit"
                disabled={!userInput.trim() || isGenerating}
                className={`p-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-30 disabled:hover:bg-slate-800`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </section>

      </main>

      {/* Decorative clean footer credits */}
      <footer className="mt-12 text-center text-slate-400 text-xs">
        <p>Aimi Interactive Cute companion AI, powered dynamically by Gemini 3.5 Flash.</p>
        <p className="mt-1">Designed safely with robust full-stack architecture & zero client-side keys exposure.</p>
      </footer>

    </div>
  );
}
