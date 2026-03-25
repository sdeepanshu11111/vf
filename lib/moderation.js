export async function checkContentForModeration(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY found. Skipping moderation.");
    return { isAppropriate: true };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const prompt = `You are a strict community moderator. Review the following content for hate speech, severe profanity, explicit sexual material, spam, or targeted harassment. If it contains any of these, it is inappropriate. Respond ONLY with a valid JSON object in the exact format: {"isAppropriate": boolean, "reason": "string (empty if appropriate)"}.

Content to review:
"${text}"`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      // Fail open if the API causes an error, so we don't break the app
      return { isAppropriate: true }; 
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (resultText) {
      const parsed = JSON.parse(resultText);
      return parsed;
    }
    
    return { isAppropriate: true };
  } catch (err) {
    console.error("Moderation error:", err);
    return { isAppropriate: true };
  }
}
