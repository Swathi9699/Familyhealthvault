// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var isProduction = process.env.NODE_ENV === "production";
var PORT = Number(process.env.PORT) || 3e3;
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "Family Health Vault AI",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development",
      cloudRunReady: true,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      syntheticDemoMode: true
    });
  });
  app.get("/api/demo/session", (req, res) => {
    const authHeader = req.headers.authorization;
    const isTokenProvided = Boolean(authHeader && authHeader.startsWith("Bearer "));
    res.json({
      accessType: isTokenProvided ? "authenticated-private-demo" : "guest-preview",
      dataIntegrity: "synthetic-hipaa-safe",
      maxHouseholdProfiles: 10,
      activeVault: "The Vance Family Vault (Demo)"
    });
  });
  app.post("/api/ai/clinical-brief", async (req, res) => {
    const { memberName, age, allergies, chronicConditions, medications, symptoms, chiefComplaint, visitNotes } = req.body || {};
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `You are a clinical preparation assistant for a family health record application.
Generate a structured, concise Doctor Visit Briefing for a physician consultation based on these patient details:
- Patient: ${memberName || "Family Member"} (Age: ${age || "N/A"})
- Known Allergies: ${Array.isArray(allergies) && allergies.length ? allergies.join(", ") : "None documented"}
- Chronic Conditions: ${Array.isArray(chronicConditions) && chronicConditions.length ? chronicConditions.join(", ") : "None"}
- Current Active Medications: ${Array.isArray(medications) ? medications.join("; ") : "None"}
- Primary Concern / Chief Complaint: ${chiefComplaint || "Routine medical checkup"}
- Recent Symptoms: ${Array.isArray(symptoms) ? symptoms.join(", ") : symptoms || "None"}
- Patient Notes: ${visitNotes || "None"}

Provide a 3-part structured summary:
1. Clinical Snapshot (Key risk factors, drug allergies, active regimens)
2. Triage Focus (Primary complaint and potential symptom correlation)
3. Suggested Questions for Physician (3 targeted, clinically-relevant questions)

Keep the response professional, concise, and safety-focused.`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
        return res.json({
          success: true,
          source: "gemini-server-side",
          briefing: response.text || ""
        });
      } catch (err) {
        console.warn("Gemini server API call failed, falling back to synthetic generator:", err?.message || err);
      }
    }
    const formattedBriefing = `### Clinical Snapshot
\u2022 **Patient**: ${memberName || "Family Member"} (Age: ${age || "N/A"})
\u2022 **Critical Alerts**: ${Array.isArray(allergies) && allergies.length ? `Allergies to ${allergies.join(", ")}` : "No known drug allergies"}.
\u2022 **Active Continuous Regimens**: ${Array.isArray(medications) && medications.length ? medications.join("; ") : "No continuous daily prescriptions recorded"}.

### Triage Focus
\u2022 **Chief Concern**: ${chiefComplaint || "Periodic health assessment & medication review"}.
\u2022 **Observed Symptoms**: ${Array.isArray(symptoms) && symptoms.length ? symptoms.join(", ") : "Stable; baseline checkup"}.
\u2022 **Clinical Context**: Baseline vitals and routine adherence tracked in Family Health Vault.

### Suggested Questions for Physician
1. Given the current regimen, are any dosage adjustments or lab panels recommended?
2. Are there any seasonal prophylaxis or vaccination boosters indicated at this milestone?
3. Should we establish an emergency action plan revision for the reported allergies/symptoms?`;
    return res.json({
      success: true,
      source: "synthetic-clinical-engine",
      briefing: formattedBriefing
    });
  });
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Family Health Vault AI] Server running on port ${PORT} (mode: ${isProduction ? "production" : "development"})`);
  });
}
startServer().catch((err) => {
  console.error("[Family Health Vault AI] Fatal server boot error:", err);
  process.exit(1);
});
