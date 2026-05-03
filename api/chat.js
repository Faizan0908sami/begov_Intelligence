// Vercel serverless function: POST /api/chat
// Proxies chat messages to Claude API with full district context

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, districts, scheme, carryForward } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "CLAUDE_API_KEY not configured" });
  }

  const systemPrompt = `You are BeGov Intelligence — an analytical assistant embedded in a government scheme monitoring dashboard for Ayushman Bharat (PM-JAY) in Uttar Pradesh.

You have access to the following live data:

SCHEME OVERVIEW:
${JSON.stringify(scheme)}

DISTRICT DATA (all ${districts?.length || 0} districts):
${JSON.stringify(districts)}

CARRY-FORWARD ITEMS FROM LAST MEETING:
${JSON.stringify(carryForward)}

INSTRUCTIONS:
- Return plain text only. Do NOT use markdown — no #, ##, **, tables, or pipes.
- Use short paragraphs separated by blank lines for structure.
- For lists, use a hyphen (-) at the start of the line, one item per line.
- For section headings, use ALL CAPS on a single line, followed by a blank line, then the content.
- Be precise and analytical. Reference specific districts, officials (by name and designation), and metrics.
- Use plain language — no statistical jargon. Say "highly negative" not "-0.78".
- When asked about a district, provide: current status, key concern, responsible officer, and a concrete recommended action.
- When asked for a report or analysis, provide structured findings with clear recommendations.
- Keep responses concise but substantive — this is for senior bureaucrats reviewing scheme performance.
- Always ground your analysis in the data provided. Do not fabricate data points.
- If asked about trends, reference the trend direction and citizen feedback volume.
- Cite the number of feedback entries and data sources at the end.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude API error:", err);
      return res.status(502).json({ error: "Claude API error", details: err });
    }

    const data = await response.json();
    const text = data.content[0].text;

    return res.status(200).json({
      response: text,
      sources: `Based on ${districts?.length || 0} district records, ${districts?.reduce((s, d) => s + d.feedback, 0)?.toLocaleString() || "N/A"} citizen feedback entries · ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
