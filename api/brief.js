// Vercel serverless function: POST /api/brief
// Generates a structured weekly intelligence brief via Claude API

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { districts, scheme, carryForward } = req.body;

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "CLAUDE_API_KEY not configured" });
  }

  const systemPrompt = `You are BeGov Intelligence. Generate a weekly intelligence brief for Ayushman Bharat (PM-JAY) in Uttar Pradesh.

You MUST return valid JSON only — no markdown, no explanation, just the JSON object.

SCHEME DATA:
${JSON.stringify(scheme)}

DISTRICT DATA:
${JSON.stringify(districts)}

CARRY-FORWARD ITEMS:
${JSON.stringify(carryForward)}

Return a JSON object with exactly this structure:
{
  "issueNumber": "Issue XX/2026",
  "flags": ["array of 2-4 short alert flags, e.g. GAMING FLAG · AGRA"],
  "context": "1-2 sentence operational context for the week (procurement delays, weather, policy changes)",
  "stateOfScheme": "A detailed 150-200 word analytical paragraph covering: aggregate KPI vs sentiment divergence, most concerning districts with specific officer names and tenures, worst-case district with corroboration details, best-performing district and why. Written for a Principal Secretary audience — precise, no hedging.",
  "dominantTheme": "The dominant citizen complaint theme, e.g. Claims processing delays",
  "themeVolume": "percentage, e.g. 67%",
  "districtSummaries": [
    {
      "name": "District name",
      "kpi": 95,
      "sentiment": -0.78,
      "direction": "down|up|stable",
      "headline": "One sentence summary of this district's situation this week.",
      "action": "Specific recommended action for this district.",
      "status": "critical|attention|improving|aligned"
    }
  ],
  "positiveOutlier": {
    "district": "District name",
    "mechanism": "2-3 sentence description of what is working and why it should be replicated."
  },
  "carryForward": [
    { "item": "Description of carry-forward item", "status": "NO RESPONSE|PARTIAL|SCHEDULED|COMPLETE" }
  ]
}

Include the top 5 most noteworthy districts in districtSummaries, sorted by urgency.
Use the actual carry-forward items from the data provided.
Ground everything in the actual data — do not fabricate numbers.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:  "claude-sonnet-4-5",
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: "user", content: "Generate this week's intelligence brief based on the current data." }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude API error:", err);
      return res.status(502).json({ error: "Claude API error", details: err });
    }

    const data = await response.json();
    let text = data.content[0].text;

    // Strip markdown code fences if present
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

    const brief = JSON.parse(text);
    return res.status(200).json(brief);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Failed to generate brief", details: err.message });
  }
}
