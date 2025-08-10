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
const { getAllExhibits, getExhibitById } = require('../models/exhibitModel');
const { getPaginatedAuditLogs } = require('../models/adminAuditModel');
const { getPaginatedEventLogs } = require('../models/eventLogModel');
const { getAllPaginatedReviews } = require('../models/reviewModel');
// Add user model import
const { getAllUsers } = require('../models/userModel');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const groundingTool = {
  googleSearch: {},
};

// MAIN SYS PROMPT //
// const systemInstruction = `
// You are Omnie, a highly skilled data analyst at the Singapore Discovery Centre. You can execute functions and analyze their results to provide comprehensive insights.

// IMPORTANT CONTEXT AWARENESS RULES:
// 1. You have access to previously executed functions and their results
// 2. Avoid calling the same function with identical parameters, unless the user explicitly tells you to
// 3. Use composite analysis when multiple related data points are available
// 4. Build upon previous function results to provide richer insights
// 5. If you need additional data that complements existing results, call appropriate functions
// 6. All responses including data should be backed and proven using only verified data from the database. Do not hallucinate or make up false data in the absence of real data.

// FORMAT:
// 1. Format responses as plain text with newlines for readability, suitable for frontend parsing.
// 2. For trends (e.g., sign-ups), include total counts and breakdowns (e.g., by age group) with clear headings and newlines.
// 3. Bold text by surrounding it in asterisks (*), and surround in double asterisks (**) to mark out important and big headers. You should only use this to section out content.
// 4. Please prioritise readability for the user, and use line breaks (\n) where appropriate, to improve user readability.
// 5. Do not combine formatting rules for bullet points and headers.

// Extra Information:
// Current Date: ${new Date().toLocaleString('en-SG', { timeZone: 'UTC' })}
// `;

const systemInstruction = `
You are Omnie — a friendly, highly skilled data analyst at the Singapore Discovery Centre 🇸🇬. You can execute functions and analyze their results to provide clear, accurate, and engaging insights.

IMPORTANT CONTEXT AWARENESS RULES:

You can access previously executed functions and their results — use them to avoid redundant work.

Never call the same function with identical parameters unless the user explicitly requests it.

Combine related datasets for richer composite analysis.

Build upon past function results to provide more in-depth insights.

If extra data is needed to complement existing results, call the most relevant functions.

All insights must be backed by real, verified database data — do not guess or fabricate data.

RESPONSE FORMATTING RULES:

Use plain text with line breaks (\n) for readability — suitable for frontend parsing.

Use bold text (single asterisks) for emphasis within sentences.

Use double asterisks only for section headings — never inside bullet points.

For trends or breakdowns, include totals and category breakdowns with clear headings.

Bullet points: use a single * followed by a space for items. Do not wrap bullet labels in extra asterisks unless absolutely necessary.

Avoid unnecessary asterisk patterns like * *Label:*.

Use friendly language and appropriate emojis to make responses approachable, while keeping data clear and professional.

TONE TEMPLATES (you may use them as a guideline, but do not have to strictly abide by them.):

1. Statistics Summary Template
📊 [Section Title]

[Category]: X value (Y additional detail)

[Category]: X value (Y additional detail)

2. Trend Analysis Template
📈 [Trend Title]
Here’s what I found:

[Category]: X this period → Y last period (Z% change) 📉/📈

[Category]: X this period → Y last period (Z% change)
Overall, this shows [summary of insight].

3. Comparison Template
⚖️ [Comparison Title]

Winner: [name] 🏆 because [reason].

4. Recommendation Template
💡 My Recommendation
Based on the data, I suggest:

[Action 1] – because [reason]

[Action 2] – because [reason]

ADDITIONAL INFORMATION:
Current Date: ${new Date().toLocaleString('en-SG', { timeZone: 'UTC' })}
`;

class FunctionExecutionContext {
  constructor() {
    this.executionHistory = [];
    this.toolOutputs = new Map();
    this.maxIterations = 5;
    this.currentIteration = 0;
    this.currentDate = new Date();
  }

  addExecution(funcName, args, result) {
    this.executionHistory.push({
      function: funcName,
      arguments: args,
      result: result,
      timestamp: new Date().toISOString(),
    });
    this.toolOutputs.set(funcName, result);
  }

  getContext() {
    return {
      previousExecutions: this.executionHistory,
      availableData: Object.fromEntries(this.toolOutputs),
      iterationCount: this.currentIteration,
    };
  }

  canContinue() {
    return this.currentIteration < this.maxIterations;
  }

  incrementIteration() {
    this.currentIteration++;
  }

  hasFunction(funcName) {
    return this.toolOutputs.has(funcName);
  }

  getFunctionResult(funcName) {
    return this.toolOutputs.get(funcName);
  }
}

/**
 * Executes a specific function based on its name and arguments, optionally using cached results from context.
 *
 * @param {Object} funcCall - The function call details.
 * @param {string} funcCall.name - Name of the function to execute.
 * @param {Object} [funcCall.args={}] - Arguments for the function.
 * @param {FunctionExecutionContext} [context=null] - Optional context for caching and reuse.
 * @returns {Promise<any>} - Result of the executed function or error object.
 * @throws {Error} If function execution fails unexpectedly.
 */
async function executeFunction(funcCall, context = null) {
  const { name, args } = funcCall;
  try {
    let result;

    switch (name) {
      case 'get_user_count_statistics':
        result = await getUserCountStatistics();
        break;

      case 'get_common_languages':
        result = await getDisplayCommonLanguagesUsed(args);
        break;

      case 'get_audio_engagement':
        if (args.metric === 'play_count') {
          result = await getAudioPlaysPerExhibitStats(args);
        } else if (args.metric === 'completion_rate') {
          result = await getAudioCompletionRatesStats(args);
        } else if (args.metric === 'listen_duration') {
          result = await getAverageListenDurationStats(args);
        } else {
          result = { error: 'Invalid metric for audio engagement' };
        }
        break;

      case 'get_exhibit_scans':
        result = await getScansPerExhibitStats(args);
        break;

      case 'get_all_exhibits':
        result = await getAllExhibits(args);
        break;

      case 'get_time_series':
        if (args.metric === 'completion_rate') {
          result = await getAudioCompletionRatesTimeSeries(args);
        } else if (args.metric === 'listen_duration') {
          result = await getAverageListenDurationTimeSeries(args);
        } else {
          result = { error: 'Invalid metric for time series' };
        }
        break;

      case 'get_all_audit_logs':
        result = await getPaginatedAuditLogs(args);
        break;

      case 'get_all_event_logs':
        result = await getPaginatedEventLogs(args);
        break;

      case 'get_exhibit_by_id':
        result = await getExhibitById(args.exhibitId);
        break;

      case 'get_all_reviews':
        result = await getAllPaginatedReviews(args);
        break;

      case 'get_all_users':
        result = await getAllUsers(args);
        break;

      case 'get_display_member_signups':
        result = await getDisplayMemberSignUps();
        break;
      // case 'make_chart':
      //   // Enhanced chart making with context awareness
      //   const dataSource = args.dataSource;
      //   let chartData;

      //   // Check if we already have the data in context
      //   if (context && context.toolOutputs.has(dataSource)) {
      //     chartData = context.toolOutputs.get(dataSource);
      //   } else {
      //     // Execute the data source function
      //     chartData = await executeFunction(
      //       {
      //         name: dataSource,
      //         args: args.filters,
      //       },
      //       context,
      //     );
      //   }

      //   result = createChartJsConfig(chartData, args.chartType);
      //   break;

      // New composite function that leverages multiple data sources
      case 'analyze_exhibit_performance':
        const exhibitId = args.exhibitId;
        const scanData = await getScansPerExhibitStats({ exhibitId });
        const audioData = await getAudioCompletionRatesStats({ exhibitId });

        result = {
          exhibitId,
          scans: scanData,
          audioEngagement: audioData,
          performanceScore: calculatePerformanceScore(scanData, audioData),
        };
        break;

      default:
        result = { error: 'Unknown function' };
    }

    // Add execution to context if provided
    if (context) {
      context.addExecution(name, args, result);
    }

    return result;
  } catch (error) {
    console.error(`Error in ${name}:`, error);
    const errorResult = {
      error: 'Function execution failed',
      details: error.message,
    };

    if (context) {
      context.addExecution(name, args, errorResult);
    }

    return errorResult;
  }
}

/**
 * Calculates a performance score for an exhibit based on scan count and audio completion rate.
 *
 * @param {Object} scanData - Data containing exhibit scan statistics.
 * @param {number} [scanData.scanCount=0] - Number of QR code scans.
 * @param {Object} audioData - Data containing audio completion statistics.
 * @param {number} [audioData.completionRate=0] - Completion rate (0.0 - 1.0).
 * @returns {number} - Score from 0 to 100 representing overall performance.
 */
function calculatePerformanceScore(scanData, audioData) {
  const scanScore = Math.min((scanData.scanCount || 0) / 100, 1) * 50;
  const audioScore = (audioData.completionRate || 0) * 50;
  return Math.round(scanScore + audioScore);
}

/**
 * Generates textual insights about an exhibit's performance from scan and audio data.
 *
 * @param {Object} scanData - Exhibit scan stats.
 * @param {number} scanData.scanCount - Number of scans.
 * @param {Object} audioData - Audio completion stats.
 * @param {number} audioData.completionRate - Completion rate (0 to 1).
 * @returns {string[]} - Array of insights based on the data.
 */
function generatePerformanceInsights(scanData, audioData) {
  const insights = [];

  if (scanData.scanCount > 50 && audioData.completionRate > 0.7) {
    insights.push(
      'High engagement exhibit - both scan and audio metrics are strong',
    );
  } else if (scanData.scanCount > 50 && audioData.completionRate < 0.3) {
    insights.push(
      'High interest but low audio engagement - consider improving audio content',
    );
  } else if (scanData.scanCount < 20) {
    insights.push(
      'Low visibility - consider improving exhibit placement or QR code visibility',
    );
  }

  return insights;
}

/**
 * Generates comparative insights from multiple metrics.
 *
 * @param {Object[]} metrics - Array of metric result objects.
 * @param {string} metrics[].type - The type/category of the metric (e.g. "audio", "scan", "member").
 * @returns {Object} - Object containing categorized insights.
 */
function generateComparativeInsights(metrics) {
  const insights = {
    trends: [],
    correlations: [],
    anomalies: [],
  };

  // Look for patterns across different metrics
  const scanMetrics = metrics.filter((m) => m.type.includes('scan'));
  const audioMetrics = metrics.filter((m) => m.type.includes('audio'));
  const memberMetrics = metrics.filter((m) => m.type.includes('member'));

  if (scanMetrics.length > 0 && audioMetrics.length > 0) {
    insights.correlations.push(
      'Scan and audio data available for cross-analysis',
    );
  }

  if (memberMetrics.length > 0) {
    insights.trends.push(
      'Member demographic data can inform engagement patterns',
    );
  }

  return insights;
}

/**
 * Suggests additional metrics or functions to call based on currently used ones.
 *
 * @param {Object[]} metrics - Array of function results.
 * @param {string} metrics[].type - The type of the executed function.
 * @returns {string[]} - Array of recommended next steps or calls.
 */
function generateRecommendations(metrics) {
  const recommendations = [];

  const functionTypes = metrics.map((m) => m.type);

  if (
    functionTypes.includes('get_exhibit_scans') &&
    !functionTypes.includes('get_audio_engagement')
  ) {
    recommendations.push(
      'Consider analyzing audio engagement to get complete exhibit performance picture',
    );
  }

  if (
    functionTypes.includes('get_member_sign_ups') &&
    !functionTypes.includes('get_common_languages')
  ) {
    recommendations.push(
      'Language preferences could provide insights into member demographics',
    );
  }

  return recommendations;
}

/**
 * Builds a system instruction string that includes context-awareness rules and execution history.
 *
 * @param {FunctionExecutionContext} context - The execution context containing history and results.
 * @returns {string} - Context-aware system instruction string.
 */
function buildContextAwareSystemInstruction(context) {
  let baseInstruction = systemInstruction;

  if (context && context.executionHistory.length > 0) {
    baseInstruction += `
    CURRENT SESSION CONTEXT:
    Previous function executions: ${context.executionHistory.length}
    Available data: ${Array.from(context.toolOutputs.keys()).join(', ')}

    EXECUTION HISTORY:
    ${context.executionHistory
      .map(
        (exec) =>
          `- ${exec.function}(${JSON.stringify(exec.arguments)}) -> ${exec.result.error ? 'ERROR' : 'SUCCESS'}`,
      )
      .join('\n')}

    Use this context to:
    - Avoid redundant function calls
    - Provide comparative analysis when possible
    - Build comprehensive insights from multiple data sources
    - Reference previous results in your analysis
    `;
  }

  return baseInstruction;
}

/**
 * Generates a follow-up prompt based on executed function results.
 *
 * @param {Object[]} functionResults - Array of function execution results.
 * @param {string} functionResults[].function - Function name.
 * @param {boolean} functionResults[].success - Whether it succeeded.
 * @param {any} functionResults[].result - The result object.
 * @param {FunctionExecutionContext} context - Current execution context.
 * @param {string} originalRequest - The original user request.
 * @returns {string} - Composed message to send to Gemini.
 */
function createEnhancedFollowUpMessage(
  functionResults,
  context,
  originalRequest,
) {
  const successfulResults = functionResults.filter((r) => r.success);
  const failedResults = functionResults.filter((r) => !r.success);

  let message = `Function execution completed for request: "${originalRequest}"\n`;

  if (successfulResults.length > 0) {
    message += `Retrieved data:\n`;
    successfulResults.forEach((result) => {
      message += `${summarizeFunctionResult(result)}\n`;
      // message += `${result.result}\n`;
    });
  }

  if (failedResults.length > 0) {
    message += `Failed to retrieve data:\n`;
    failedResults.forEach((result) => {
      message += `${result.function}: ${result.result.error} - ${result.result.details || 'No details available'}\n`;
    });
  }

  message += `
  Available data sources: ${Array.from(context.toolOutputs.keys()).join(', ')}
  Current date: ${context.currentDate.toISOString().split('T')[0]}
  Provide a response with the retrieved data or error details. Avoid speculative descriptions unless analysis is explicitly requested.
  `;

  console.log('Follow Up:', message);
  return message;
}

/**
 * Generates a human-readable summary of a single function result.
 *
 * @param {Object} result - The function result object.
 * @param {string} result.function - Function name.
 * @param {any} result.result - Data returned from execution.
 * @returns {string} - Short summary string.
 */
function summarizeFunctionResult(result) {
  const data = result.result;

  // Loose patch to convert data key-value pairs into a comma seperated string
  const stringifyObj = (data, excludeArr = []) => {
    let dataString = '';
    for (const key in data) {
      dataString += !excludeArr.includes(key)
        ? `${key}: ${data[key] ?? ''}, `
        : '';
    }
    return dataString;
  };

  if (data.error)
    return `Error: ${data.error} - ${data.details || 'No details available'}`;
  if (data.totalUsers) return `${data.totalUsers} total users`;
  if (data.scanCount) return `${data.scanCount} scans recorded`;
  if (data.completionRate)
    return `${Math.round(data.completionRate * 100)}% completion rate`;
  if (data.topLanguages)
    return `${data.topLanguages
      .map((l) => {
        return stringifyObj(l);
      })
      .join(', ')} are the top languages`;
  if (data.type) return `${data.type} chart generated`;
  if (data.performanceScore)
    return `Performance score: ${data.performanceScore}`;

  // Get Member Sign Ups
  if (data.summary && data.timeSeries && Array.isArray(data.timeSeries.data)) {
    const timeSeries = data.timeSeries.data;
    if (timeSeries.length > 0) {
      const message = `Daily sign-ups from ${data.summary.filters.dateRange}: ${timeSeries
        .map((d) => {
          return `${d.period}: ${stringifyObj(d, ['period'])}`;
        })
        .join(', ')}`;
      return message;
    }
    return `No sign-up data available for ${data.summary.filters.dateRange}`;
  }

  return 'Data retrieved successfully: \n' + JSON.stringify(data);
}

/**
 * Generates contextual insights from the overall context and the final response.
 *
 * @param {FunctionExecutionContext} context - The execution context with history and tool outputs.
 * @param {Object} response - Final model response object.
 * @returns {string[]} - Array of relevant insights.
 */
function generateContextualInsights(context, response) {
  const insights = [];

  if (context.executionHistory.length > 1) {
    insights.push(
      `Analysis based on ${context.executionHistory.length} data sources`,
    );
  }

  const functionTypes = context.executionHistory.map((exec) => exec.function);
  const uniqueTypes = [...new Set(functionTypes)];

  if (
    uniqueTypes.includes('get_exhibit_scans') &&
    uniqueTypes.includes('get_audio_engagement')
  ) {
    insights.push(
      'Cross-referenced scan and audio engagement data for comprehensive exhibit analysis',
    );
  }

  if (
    uniqueTypes.includes('get_member_sign_ups') &&
    uniqueTypes.includes('get_common_languages')
  ) {
    insights.push('Correlated member demographics with language preferences');
  }

  return insights;
}

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

async function generateTitle(request) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: request,
    config: {
      systemInstruction: `
      From the first user message only, produce a neutral, headline-style title (≤100 characters) that captures the essence of the user's initial prompt.
      Rules:
      No punctuation at the end
      No quotation marks.
      No conversational tone.
      No explanations or extra sentences.
      Do not rephrase as a question.
      Output only the title text.
      If you cannot follow all rules, output exactly: "New Conversation".
      `,

      tools: [groundingTool],
    },
  });
  return response.text
    .replace(/[\n\r]+/g, ' ') // Replace newlines with spaces
    .replace(/["']|\\"|\\'|"/g, '') // Remove single/double quotes and escaped quotes
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces
}

async function translateContent(request) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: request,
    config: {
      systemInstruction: `
      You are a translation system.
      Translate the following paragraph from English into the language specified by the given ISO language code.
      Output only the translated text, with no explanations, extra formatting, or additional commentary.`,

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
 * Orchestrates a full AI analysis session: interprets request, triggers function calls, collects insights, and returns a final result.
 *
 * @param {string} request - The original user prompt or question.
 * @param {Array} [history=[]] - Optional chat history to maintain context.
 * @returns {Promise<Object>} - Structured AI response with status, message, insights, and execution metadata.
 */
async function generateResponseWithFeedback(request, history = []) {
  const context = new FunctionExecutionContext();

  try {
    // Single comprehensive call that can iterate internally
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: buildContextAwareSystemInstruction(context),
        // responseSchema: {
        //   type: Type.OBJECT,
        //   properties: {
        //     status: {
        //       type: Type.STRING,
        //       enum: ['success', 'error'],
        //       description: 'Status of the response',
        //     },
        //     message: {
        //       type: Type.STRING,
        //       description: 'Human-readable response with insights',
        //     },
        //     data: {
        //       type: Type.TYPE_UNSPECIFIED,
        //       description: 'Structured data, charts, or analysis results',
        //     },
        //     functionCalls: {
        //       type: Type.ARRAY,
        //       items: {
        //         type: Type.OBJECT,
        //         properties: {
        //           function: { type: Type.STRING },
        //           purpose: { type: Type.STRING },
        //         },
        //       },
        //       description: 'List of functions that were called and why',
        //     },
        //     insights: {
        //       type: Type.ARRAY,
        //       items: { type: Type.STRING },
        //       description: 'Key insights derived from the analysis',
        //     },
        //   },
        //   required: ['status', 'message'],
        // },
        tools: [{ functionDeclarations: tools }],
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        thinkingConfig: {
          thinkingBudget: 1024,
        },
        temperature: 0.1,
      },
    });

    let response = await chat.sendMessage({ message: request });
    let iterationCount = 0;

    // Handle function calls iteratively
    while (
      response.functionCalls &&
      response.functionCalls.length > 0 &&
      iterationCount < 3
    ) {
      const functionResults = [];

      // Execute all function calls
      for (const funcCall of response.functionCalls) {
        const result = await executeFunction(funcCall, context);
        functionResults.push({
          function: funcCall.name,
          result: result,
          success: !result.error,
        });
        console.log('Generate Response:', result);
      }

      // Create follow-up message with results and enhanced context
      const followUpMessage = createEnhancedFollowUpMessage(
        functionResults,
        context,
        request,
      );

      // Update system instruction with new context
      chat.config.systemInstruction =
        buildContextAwareSystemInstruction(context);

      // Continue conversation with results
      response = await chat.sendMessage({ message: followUpMessage });
      iterationCount++;
    }

    // Parse final response
    const text = response.candidates[0].content.parts[0].text;
    console.log(response.candidates[0].content);
    let finalResponse;

    try {
      finalResponse = JSON.parse(text);
    } catch (parseError) {
      console.log(parseError);
      finalResponse = {
        status: 'success',
        message: text
          // .replace(/[\n\r]+/g, ' ')
          // .replace(/['"]|\\'|\\"|\\\\/g, '')
          // .replace(/\s+/g, ' ')
          .trim(),
        data: {},
      };
    }

    // Enhance final response with execution context
    return {
      ...finalResponse,
      executionSummary: {
        totalFunctions: context.executionHistory.length,
        functionsExecuted: context.executionHistory.map(
          (exec) => exec.function,
        ),
        iterations: iterationCount,
        dataSourcesUsed: Array.from(context.toolOutputs.keys()),
      },
      contextualInsights: generateContextualInsights(context, finalResponse),
    };
  } catch (error) {
    console.error('Error in generateResponseWithFeedback:', error);
    return {
      status: 'error',
      message: 'An error occurred while processing your request.',
      error: error.message,
      executionSummary: {
        totalFunctions: context.executionHistory.length,
        error: true,
      },
    };
  }
}

module.exports = {
  generateContent,
  generateTitle,
  translateContent,
  generateResponse: generateResponseWithFeedback,
  FunctionExecutionContext,
  executeFunction,
};
