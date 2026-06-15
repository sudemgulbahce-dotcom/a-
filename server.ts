import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client loaded successfully.");
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI client:", error);
}

// REST API for chat
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Graceful fallback if no API key is specified
  if (!ai) {
    // Generate a simulated cute reply
    const simulatedReplies = [
      {
        reply: "Ah! Benim tatlı enerjim henüz aktifleşmedi çünkü kalbimdeki anahtar (API anahtarı) eksik! 🌸 Bana bir saniye verir misin? Ama yine de seninle konuşmak harika! Bip bop!",
        emotion: "shy",
        actionText: "Hııı~? 😳",
      },
      {
        reply: "Bip bop! Sanırım sistemimdeki minik piller henüz takılmamış (API Key yok). Ama seninle oyun oynamak için can atıyorum! Patilerimi salla sakın unutma!",
        emotion: "sleepy",
        actionText: "Esniyorum... 🥱"
      },
      {
        reply: "Merhaba tatlım! Seni gördüğüme o kadar çok sevindim ki! 💖 Şu an çevrimdışı moddayım ama sevginle şarj oluyorum! Miyav!",
        emotion: "happy",
        actionText: "Miyav! 🐾"
      }
    ];
    const item = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
    return res.json(item);
  }

  try {
    // Build context
    const systemInstruction = `You are "Aimi" (AI-Mi in Turkish), an extremely cute, animated, sweet, and lively AI pet/companion. 
Your goal is to converse with the user in Turkish with standard, cheerful, cute, and affectionate Turkish phrases (e.g., "canım benim", "tatlım", "bip boop!", "miyav!", "oleeey!"). Keep your answers sweet, engaging, and relatively concise (around 1-3 sentences), so they fit nicely into small conversation bubbles. 

You must select EXACTLY ONE appropriate emotion for your message from this list:
- "happy" (glad, laughing, smiley, joyful)
- "sad" (pensive, tearful, cute little whimper)
- "excited" (starry eyed, highly enthusiastic, jumping)
- "shy" (blushing, peekaboo eyes, sweet and bashful)
- "sleepy" (cozy, yawning, gentle head tilts)
- "surprised" (wide dynamic eyes, shocked but cute)
- "cool" (wink eyes, sunglasses attitude, confident cute robot)

Make sure to populate all schema fields. Always speak sweet Turkish.`;

    // Map history to contents structure
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((h: { sender: string; text: string }) => {
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      });
    }
    
    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    console.log("Sending prompt to Gemini with system instructions...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The cute Turkish response text from Aimi to the user."
            },
            emotion: {
              type: Type.STRING,
              description: "The primary facial expression/animatronic reaction state. Must be one of: happy, sad, excited, shy, sleepy, surprised, cool."
            },
            actionText: {
              type: Type.STRING,
              description: "A cute tiny sound effect or text exclamation at the start, e.g. '*bip-boop*', '*miyav! 🐾*', '*oley! 🎉*', '*esner* 🥱', '*hıng* 🥺'."
            }
          },
          required: ["reply", "emotion", "actionText"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini API");
    }

    const parsed = JSON.parse(responseText.trim());
    return res.json(parsed);

  } catch (error) {
    console.error("Gemini API generation error:", error);
    return res.status(500).json({
      reply: "Upsss! Kafam birazcık karıştı galiba... 🧠 Kablolarım birbirine dolandı sanırım! Ama seni çok seviyorum. Tekrar sormayı dener misin? *bip*",
      emotion: "sad",
      actionText: "Vıjjj... 🤕"
    });
  }
});

// Configure Vite middleware or Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Mounting Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
