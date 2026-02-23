"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIGeneratorController = void 0;
// ─── System prompt sent to Gemini ─────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are an Enterprise CRM Architect. The user will provide an industry or business type. You must return ONLY a raw JSON object — no markdown, no backticks, no explanation, no code fences. The JSON object must match this exact structure:

{
  "name": "string — industry name, e.g. 'Dental Clinic CRM'",
  "schema_json": {
    "tables": [
      {
        "name": "string — table name in snake_case",
        "columns": {
          "id": { "type": "UUID", "primaryKey": true, "defaultValue": "UUIDV4" },
          "fieldName": { "type": "STRING|NUMBER|BOOLEAN|ENUM", "allowNull": true }
        }
      }
    ]
  },
  "default_roles_json": {
    "roles": ["Admin", "Manager", "Staff"]
  },
  "ui_config_json": {
    "primary_color": "#hex color appropriate for the industry",
    "sidebar_theme": "dark"
  },
  "default_stages_json": [
    { "name": "Lead", "color": "#hex" },
    { "name": "Qualified", "color": "#hex" },
    { "name": "Won", "color": "#22c55e" },
    { "name": "Lost", "color": "#ef4444" }
  ]
}

Generate 3-5 relevant tables with 4-8 meaningful columns per table. Column types must be one of: STRING, NUMBER, BOOLEAN, ENUM. Return ONLY the JSON, nothing else.`;
// ─── Controller ───────────────────────────────────────────────────────────────
class AIGeneratorController {
    /**
     * POST /api/ai/generate-blueprint
     * Body: { prompt: string }
     * Calls Gemini 2.5 Flash to generate a CRM Blueprint JSON for the given industry.
     */
    static async generateBlueprint(req, res) {
        const { prompt } = req.body;
        if (!prompt || prompt.trim().length === 0) {
            res.status(400).json({ error: '`prompt` is required. Describe an industry (e.g. "Dental Clinic").' });
            return;
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
            return;
        }
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        console.log(`[AIGeneratorController] Generating blueprint for prompt: "${prompt.trim()}"`);
        let geminiResponse;
        try {
            const fetchResponse = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: SYSTEM_INSTRUCTION }],
                    },
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt.trim() }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.4,
                        topP: 0.9,
                        maxOutputTokens: 8192,
                        responseMimeType: 'application/json',
                    },
                }),
            });
            if (!fetchResponse.ok) {
                const errorBody = await fetchResponse.text();
                console.error('[AIGeneratorController] Gemini HTTP error:', fetchResponse.status, errorBody);
                res.status(502).json({
                    error: `Gemini API returned HTTP ${fetchResponse.status}. Please retry.`,
                    detail: errorBody,
                });
                return;
            }
            geminiResponse = (await fetchResponse.json());
        }
        catch (networkError) {
            const msg = networkError instanceof Error ? networkError.message : String(networkError);
            console.error('[AIGeneratorController] Network error calling Gemini:', msg);
            res.status(502).json({ error: `Network error reaching Gemini API: ${msg}` });
            return;
        }
        // ── Extract raw text from candidates ──────────────────────────────────
        if (geminiResponse.error) {
            console.error('[AIGeneratorController] Gemini returned an error:', geminiResponse.error);
            res.status(502).json({ error: `Gemini error: ${geminiResponse.error.message}` });
            return;
        }
        const rawText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (!rawText) {
            res.status(502).json({ error: 'Gemini returned an empty response. Please try a more specific prompt.' });
            return;
        }
        // ── Parse + validate the JSON ──────────────────────────────────────────
        let blueprint;
        try {
            // Strip any accidental markdown code fences (safety net even with responseMimeType)
            const cleaned = rawText
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            blueprint = JSON.parse(cleaned);
        }
        catch (parseError) {
            console.error('[AIGeneratorController] Failed to parse Gemini JSON:', rawText);
            res.status(502).json({
                error: 'Gemini returned malformed JSON. Please retry or refine your prompt.',
                raw: rawText.slice(0, 500), // partial for debugging
            });
            return;
        }
        // ── Validate required top-level keys ──────────────────────────────────
        const required = [
            'name', 'schema_json', 'default_roles_json', 'ui_config_json', 'default_stages_json',
        ];
        const missing = required.filter((k) => !(k in blueprint));
        if (missing.length > 0) {
            res.status(422).json({
                error: `AI response is missing required fields: ${missing.join(', ')}. Please retry.`,
                partial: blueprint,
            });
            return;
        }
        console.log(`[AIGeneratorController] ✓ Blueprint generated: "${blueprint.name}" (${blueprint.schema_json.tables?.length ?? 0} tables)`);
        res.status(200).json({
            message: 'Blueprint generated successfully by Gemini AI.',
            blueprint,
        });
    }
}
exports.AIGeneratorController = AIGeneratorController;
