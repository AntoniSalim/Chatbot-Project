import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "TERBACA" : "KOSONG"
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!Array.isArray(conversation)) {
      return res.status(400).json({
        error: "Conversation must be an array",
      });
    }

    const contents = conversation.map((message) => ({
      role: message.role === "model" ? "model" : "user",
      parts: [{ text: message.text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 30,
        systemInstruction:
          "Kamu adalah EduMate AI, asisten belajar ramah untuk siswa. Jawablah dalam Bahasa Indonesia. Gunakan gaya bahasa santai, jelas, dan mudah dipahami. Jika pengguna bertanya tentang pelajaran, jelaskan dengan langkah-langkah sederhana.",
      },
    });

    res.json({
      result: response.text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get response from Gemini AI",
    });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`EduMate AI running at http://localhost:${PORT}`);
});