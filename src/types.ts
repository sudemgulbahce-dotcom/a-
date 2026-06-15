export type EmotionType = 
  | "idle" 
  | "listening" 
  | "thinking" 
  | "speaking" 
  | "happy" 
  | "sad" 
  | "excited" 
  | "shy" 
  | "sleepy" 
  | "surprised" 
  | "cool";

export interface Message {
  id: string;
  sender: "user" | "aimi";
  text: string;
  timestamp: Date;
  emotion?: EmotionType;
  actionText?: string;
}

export interface PetStats {
  love: number;        // 0 to 100
  energy: number;      // 0 to 100
  happiness: number;   // 0 to 100
}

export interface VisorTheme {
  id: string;
  name: string;
  gradient: string;
  glow: string;
  ambient: string;
  accent: string;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  energyBonus: number;
  loveBonus: number;
  happinessBonus: number;
  soundType: "munch" | "slurp" | "sparkle";
  description: string;
}
