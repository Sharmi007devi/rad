/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// Initialize Gemini safely to avoid crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please add it to Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// AI Endpoint for generating custom Shopify Liquid scripts
app.post("/api/generate-liquid", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Missing prompt parameter." });
      return;
    }

    const ai = getGeminiClient();
    const systemInstruction = 
      "You are an expert Shopify Merchant Architect and Liquid Code developer.\n" +
      "Your goal is to write highly secure, modular, and performant Shopify Liquid snippets (.liquid files), " +
      "combining Liquid tags, HTML, CSS, and/or clean modern JavaScript.\n" +
      "Always output your code with precise comments explaining how to use it inside a Shopify theme (e.g., in product.liquid or sections).\n" +
      "Use professional, elegant styling in your generated HTML snippets. Use inline styles or a <style> block so it renders nicely anywhere.\n" +
      "Limit explanations to brief usage instructions, prioritizing direct, copy-pasteable code.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Could not generate any code. Please try again.";
    res.json({ result: reply });
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal Server Error in Gemini generator."
    });
  }
});

// Configure Vite or Static Assets depending on Environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in Development Mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in Production Mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MeeshoShop Server running on http://localhost:${PORT}`);
  });
}

setupServer();
