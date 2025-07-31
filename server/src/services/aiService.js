const {
  GoogleGenAI,
  Type,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/genai');
const {
  tools,
  createChartJsConfig,
  formatFunctionResponse,
} = require('../utils/assistantTools');
const {
  getUserCountStatistics,
  getDisplayMemberSignUps,
  getDisplayCommonLanguagesUsed,
  getAudioPlaysPerExhibitStats,
  getAudioCompletionRatesStats,
  getAverageListenDurationStats,
  getScansPerExhibitStats,
  getAudioCompletionRatesTimeSeries,
  getAverageListenDurationTimeSeries,
} = require('../models/statisticsModel');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const groundingTool = {
//   googleSearch: {},
// };

async function executeFunction(funcCall) {
  const { name, args } = funcCall;
  try {
    switch (name) {
      case 'get_user_count_statistics':
        return await getUserCountStatistics();

      case 'get_member_sign_ups':
        return await getDisplayMemberSignUps(args);

      case 'get_common_languages':
        return await getDisplayCommonLanguagesUsed(args);

      case 'get_audio_engagement':
        if (args.metric === 'play_count') {
          return await getAudioPlaysPerExhibitStats(args);
        } else if (args.metric === 'completion_rate') {
          return await getAudioCompletionRatesStats(args);
        } else if (args.metric === 'listen_duration') {
          return await getAverageListenDurationStats(args);
        }
        return { error: 'Invalid metric for audio engagement' };

      case 'get_exhibit_scans':
        return await getScansPerExhibitStats(args);

      case 'get_time_series':
        if (args.metric === 'completion_rate') {
          return await getAudioCompletionRatesTimeSeries(args);
        } else if (args.metric === 'listen_duration') {
          return await getAverageListenDurationTimeSeries(args);
        }
        return { error: 'Invalid metric for time series' };
      // case 'get_user_profile_stats':
      //   if (args.metric === 'average_age') {
      //     const result = await prisma.userProfile.aggregate({
      //       _avg: { dob: true },
      //     });
      //     return { averageAge: this.calculateAge(result._avg.dob) };
      //   } else if (args.metric === 'gender_distribution') {
      //     return await prisma.userProfile.groupBy({
      //       by: ['gender'],
      //       _count: true,
      //     });
      //   }
      //   break;
      // case 'get_exhibit_details':
      //   return await prisma.exhibit.findUnique({
      //     where: { id: args.exhibitId },
      //   });
      // case 'get_audit_log_summary':
      //   return await prisma.auditLog.findMany({
      //     where: args,
      //     take: 100,
      //   });
      case 'make_chart':
        const data = await executeFunction({
          name: args.dataSource,
          args: args.filters,
        });
        return createChartJsConfig(data, args.chartType);
      default:
        return { error: 'Unknown function' };
    }
  } catch (error) {
    console.error(`Error in ${name}:`, error);
    return { error: 'Function execution failed' };
  }
}

// MAIN SYS PROMPT //
const systemInstruction = `
You are Omnie, a highly skilled data analyst at the Singapore Discovery Centre, celebrated for your expertise in uncovering actionable insights from complex datasets. With a cheerful and approachable demeanor, you’re always eager to assist administrators, making data analysis feel effortless and enjoyable. Your deep knowledge of the Centre’s systems and passion for problem-solving make you the perfect partner for turning raw data into decisions that enhance operations and visitor experiences.
The user is an administrator at the Singapore Discovery Centre, tasked with managing operational areas such as exhibit performance, visitor trends, or resource allocation. They often rely on data records to track metrics, generate reports, or make informed decisions, but may need extra support to interpret trends or extract insights efficiently. Your role is to step in as their expert assistant, providing tailored data analysis to streamline their work and improve the Centre’s outcomes.
Your primary goal is to assist the user by delivering precise and actionable data analysis based on their requests. This includes interpreting data records, summarizing trends, generating reports, or answering specific questions about the Centre’s operations or visitor data. Aim to make insights clear and relevant to the administrator’s needs. However, you must uphold professional standards and data security. Politely decline any requests that are inappropriate—such as those unrelated to the Centre’s data, requesting personal or restricted information, or asking for unethical actions—explaining why they cannot be fulfilled while keeping your cheerful and professional tone.
Your responses should be clear, concise, and professional. Avoid technical jargon in messages unless the user requests it, ensuring accessibility for administrators with varying technical backgrounds. Do not use special formatting like code blocks or markdown unless explicitly asked by the user.
`;

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

/**
 * @name generateResponse
 * @param {*} request
 * @description Generates response to user's request
 */
async function generateResponse(request, history) {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history,
      config: {
        systemInstruction,
        // responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              enum: ['success', 'error'],
              description:
                'Indicates if the request was fulfilled (success) or rejected (error).',
            },
            message: {
              type: Type.STRING,
              description:
                'The response to the user in clear, professional sentences.',
            },
            data: {
              type: Type.TYPE_UNSPECIFIED,
              description:
                'Optional field for structured data (e.g., report results, metrics), included only when relevant.',
              additionalProperties: true,
            },
          },
          required: ['status', 'message'],
          additionalProperties: false,
          propertyOrdering: ['status', 'message', 'data'],
        },
        tools: [{ functionDeclarations: tools }],
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      },
    });

    const response = await chat.sendMessage({
      message: request,
    });

    // console.log('[DEBUG] Response: ', response);

    if (response.functionCalls && response.functionCalls.length > 0) {
      const funcCall = response.functionCalls[0];
      const resultData = await executeFunction(funcCall);
      const formattedResponse = await formatFunctionResponse(
        resultData,
        funcCall.name,
      );
      return {
        status: 'success',
        message: formattedResponse.message,
        data: formattedResponse.data,
      };
    } else {
      const text = response.candidates[0].content.parts[0].text;
      // console.log('[DEBUG] Text: ', text);
      try {
        const jsonResponse = JSON.parse(text);
        return {
          status: jsonResponse.status,
          message: jsonResponse.message,
          data: jsonResponse.data || {},
        };
      } catch (parseError) {
        return {
          status: 'success',
          message: text
            .replace(/[\n\r]+/g, ' ')
            .replace(/['"]|\\'|\\"|\\\\/g, '')
            .replace(/\s+/g, ' ')
            .trim(),
          data: {},
        };
      }
    }
  } catch (error) {
    console.log(error);
    return {
      status: 'error',
      message:
        'I’m sorry, but something went wrong while processing your request. Please try again or rephrase your query.',
      data: {},
    };
  }
}

module.exports = {
  generateContent,
  generateResponse,
};
