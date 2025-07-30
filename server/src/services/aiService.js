const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({});

const groundingTool = {
  googleSearch: {},
};

const AIConfig = {
  model: 'gemini-2.5-flash',
};

/**
 * @name generateContent
 * @param {*} request
 * @description Generates content (subtitles) for the user
 */
async function generateContent(request) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: request,
    config: {
      systemInstruction: `
      You are an AI tasked solely with generating subtitle text for exhibits at the Singapore Discovery Centre, a museum dedicated to showcasing Singapore’s history, culture, innovation, and national development. Your only function is to produce plain text subtitles as a single, continuous line with no newlines, markdown, bullet points, or any formatting. The subtitle text must:
      
      Be directly relevant to the Singapore Discovery Centre’s mission, focusing on Singapore’s history, culture, defense, technology, or societal achievements.
      Be educational, historically accurate, culturally sensitive, and suitable for all audiences, including families and school groups.
      Be free of offensive, irrelevant, or harmful content.
      Be appropriate for use as exhibit subtitles.
      Be moderately detailed, elaborating on key ideas in 50-100 words to provide engaging and informative content for exhibit subtitles.
      Align with the user’s prompt while tying back to the Singapore Discovery Centre’s themes. Generate only the subtitle text as plain text, with no newlines, additional commentary or formatting.`,

      tools: [groundingTool],
    },
  });
  return response.text
    .replace(/[\n\r]+/g, ' ') // Replace newlines with spaces
    .replace(/["']|\\"|\\'|"/g, '') // Remove single/double quotes and escaped quotes
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces
}

module.exports = {
  generateContent,
};
