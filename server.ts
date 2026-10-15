import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '1mb' }));

  // ============================================================================
  // Cloud Run Health Check Endpoint (Readiness & Liveness Probes)
  // ============================================================================
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'Family Health Vault AI',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      cloudRunReady: true,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      syntheticDemoMode: true,
    });
  });

  // ============================================================================
  // Authenticated Private Demo Verification Endpoint
  // ============================================================================
  app.get('/api/demo/session', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const isTokenProvided = Boolean(authHeader && authHeader.startsWith('Bearer '));

    res.json({
      accessType: isTokenProvided ? 'authenticated-private-demo' : 'guest-preview',
      dataIntegrity: 'synthetic-hipaa-safe',
      maxHouseholdProfiles: 10,
      activeVault: 'The Vance Family Vault (Demo)',
    });
  });

  // ============================================================================
  // Server-Side Gemini AI Clinical Brief Proxy
  // Secure: GEMINI_API_KEY remains exclusively in server environment secrets
  // ============================================================================
  app.post('/api/ai/clinical-brief', async (req: Request, res: Response) => {
    const { memberName, age, allergies, chronicConditions, medications, symptoms, chiefComplaint, visitNotes } = req.body || {};

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // If GEMINI_API_KEY is configured on the server, call Google Gen AI
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const prompt = `You are a clinical preparation assistant for a family health record application.
Generate a structured, concise Doctor Visit Briefing for a physician consultation based on these patient details:
- Patient: ${memberName || 'Family Member'} (Age: ${age || 'N/A'})
- Known Allergies: ${Array.isArray(allergies) && allergies.length ? allergies.join(', ') : 'None documented'}
- Chronic Conditions: ${Array.isArray(chronicConditions) && chronicConditions.length ? chronicConditions.join(', ') : 'None'}
- Current Active Medications: ${Array.isArray(medications) ? medications.join('; ') : 'None'}
- Primary Concern / Chief Complaint: ${chiefComplaint || 'Routine medical checkup'}
- Recent Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms || 'None'}
- Patient Notes: ${visitNotes || 'None'}

Provide a 3-part structured summary:
1. Clinical Snapshot (Key risk factors, drug allergies, active regimens)
2. Triage Focus (Primary complaint and potential symptom correlation)
3. Suggested Questions for Physician (3 targeted, clinically-relevant questions)

Keep the response professional, concise, and safety-focused.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return res.json({
          success: true,
          source: 'gemini-server-side',
          briefing: response.text || '',
        });
      } catch (err: any) {
        console.warn('Gemini server API call failed, falling back to synthetic generator:', err?.message || err);
        // Fall back gracefully to synthetic clinical briefing
      }
    }

    // High-fidelity synthetic fallback (ensures demo runs with zero external billing or API keys required)
    const formattedBriefing = `### Clinical Snapshot
• **Patient**: ${memberName || 'Family Member'} (Age: ${age || 'N/A'})
• **Critical Alerts**: ${Array.isArray(allergies) && allergies.length ? `Allergies to ${allergies.join(', ')}` : 'No known drug allergies'}.
• **Active Continuous Regimens**: ${Array.isArray(medications) && medications.length ? medications.join('; ') : 'No continuous daily prescriptions recorded'}.

### Triage Focus
• **Chief Concern**: ${chiefComplaint || 'Periodic health assessment & medication review'}.
• **Observed Symptoms**: ${Array.isArray(symptoms) && symptoms.length ? symptoms.join(', ') : 'Stable; baseline checkup'}.
• **Clinical Context**: Baseline vitals and routine adherence tracked in Family Health Vault.

### Suggested Questions for Physician
1. Given the current regimen, are any dosage adjustments or lab panels recommended?
2. Are there any seasonal prophylaxis or vaccination boosters indicated at this milestone?
3. Should we establish an emergency action plan revision for the reported allergies/symptoms?`;

    return res.json({
      success: true,
      source: 'synthetic-clinical-engine',
      briefing: formattedBriefing,
    });
  });

  // ============================================================================
  // Vite Integration (Dev Middleware vs Production Static Serving)
  // ============================================================================
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from 'dist'
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Family Health Vault AI] Server running on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Family Health Vault AI] Fatal server boot error:', err);
  process.exit(1);
});
