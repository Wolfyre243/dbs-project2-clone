const { Type } = require('@google/genai');
const AuditActions = require('../configs/auditActionConfig');
const EventTypes = require('../configs/eventTypes');

// Enhanced tools that support context-aware operations
const analyzeExhibitPerformance = {
  name: 'analyze_exhibit_performance',
  description:
    'Comprehensive analysis of exhibit performance using multiple metrics including scans, audio engagement, and visitor patterns.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      exhibitId: {
        type: Type.STRING,
        description:
          'ID of the exhibit to analyze. Optional - if not provided, analyzes all exhibits.',
      },
      includeComparison: {
        type: Type.BOOLEAN,
        description:
          'Whether to include comparison with other exhibits. Defaults to false.',
      },
      timeframe: {
        type: Type.STRING,
        enum: ['week', 'month', 'quarter', 'year'],
        description: 'Timeframe for the analysis. Defaults to month.',
      },
    },
    required: [],
  },
};

const generateInsightReport = {
  name: 'generate_insight_report',
  description:
    'Generate comprehensive insights and recommendations based on available data and previous function results.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reportType: {
        type: Type.STRING,
        enum: [
          'visitor_engagement',
          'exhibit_performance',
          'operational_summary',
          'trend_analysis',
        ],
        description: 'Type of insight report to generate.',
      },
      includeCharts: {
        type: Type.BOOLEAN,
        description: 'Whether to include chart configurations in the report.',
      },
      focusAreas: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          enum: [
            'audio_engagement',
            'scan_rates',
            'demographics',
            'temporal_patterns',
          ],
        },
        description: 'Specific areas to focus on in the report.',
      },
    },
    required: ['reportType'],
  },
};

const optimizeDataRetrieval = {
  name: 'optimize_data_retrieval',
  description:
    'Intelligently determine what data to fetch based on the query and previously retrieved data.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The user query to analyze for data needs.',
      },
      availableData: {
        type: Type.OBJECT,
        description: 'Previously retrieved data to avoid redundant calls.',
      },
      priority: {
        type: Type.STRING,
        enum: ['speed', 'completeness', 'accuracy'],
        description: 'Optimization priority. Defaults to completeness.',
      },
    },
    required: ['query'],
  },
};

const makeContextAwareChart = {
  name: 'make_context_aware_chart',
  description:
    'Generate charts that automatically adapt based on available data and user intent.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      chartIntent: {
        type: Type.STRING,
        enum: ['comparison', 'trend', 'distribution', 'correlation'],
        description: 'The analytical intent of the chart.',
      },
      dataContext: {
        type: Type.OBJECT,
        description: 'Available data sources and their relationships.',
      },
      visualPreference: {
        type: Type.STRING,
        enum: ['simple', 'detailed', 'interactive'],
        description: 'Complexity level of the visualization.',
      },
    },
    required: ['chartIntent'],
  },
};

const getUserCountStatistics = {
  name: 'get_user_count_statistics',
  description:
    'Retrieves aggregate statistics about registered users, including total counts and breakdowns by type (Guests and Members). Optionally accepts filter parameters to refine results by date range, demographics, or other criteria.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filter: {
        type: Type.OBJECT,
        description:
          'Optional filtering rules to narrow the statistics. Example fields: date range, user type (Guest or Member), or registration source.',
      },
    },
    required: [],
  },
};

const enhancedTools = [
  getUserCountStatistics,
  {
    name: 'get_all_users',
    description:
      'Retrieve all users with pagination, sorting, and advanced filtering.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: { type: Type.INTEGER, description: 'Page number (default: 1)' },
        pageSize: {
          type: Type.INTEGER,
          description: 'Users per page (default: 10)',
        },
        sortBy: {
          type: Type.STRING,
          description: 'Field to sort by (e.g., createdAt, age)',
        },
        order: {
          type: Type.STRING,
          enum: ['asc', 'desc'],
          description: 'Sort order',
        },
        search: {
          type: Type.STRING,
          description: 'Search term for username, first/last name',
        },
        // statusId: { type: Type.INTEGER, description: 'Filter by statusId' },
        // roleId: { type: Type.INTEGER, description: 'Filter by roleId' },
        ageMin: { type: Type.INTEGER, description: 'Minimum age filter' },
        ageMax: { type: Type.INTEGER, description: 'Maximum age filter' },
        gender: {
          type: Type.STRING,
          enum: ['M', 'F'],
          description: 'Gender filter',
        },
        languageCode: {
          type: Type.STRING,
          description: 'Language code filter',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_display_member_signups',
    description:
      'Get member sign-up statistics with filtering by date, gender, age group, and granularity.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        startDate: {
          type: Type.STRING,
          description: 'Start date (YYYY-MM-DD)',
        },
        endDate: { type: Type.STRING, description: 'End date (YYYY-MM-DD)' },
        gender: {
          type: Type.STRING,
          enum: ['All', 'M', 'F'],
          description: 'Gender filter (All, M, F)',
        },
        ageGroup: {
          type: Type.STRING,
          enum: ['All', 'Children', 'Youth', 'Adults', 'Seniors'],
          description: 'Age group filter',
        },
        granularity: {
          type: Type.STRING,
          enum: ['day', 'month', 'year'],
          description: 'Time granularity for time series data',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_all_audit_logs',
    description:
      'Retrieve all admin audit logs with pagination, sorting, and optional filtering.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: { type: Type.INTEGER, description: 'Page number (default: 1)' },
        pageSize: {
          type: Type.INTEGER,
          description: 'Logs per page (default: 10)',
        },
        sortBy: {
          type: Type.STRING,
          description: 'Field to sort by (e.g., timestamp)',
        },
        order: {
          type: Type.STRING,
          enum: ['asc', 'desc'],
          description: 'Sort order',
        },
        // actionTypeId: {
        //   type: Type.INTEGER,
        //   enum: [...Object.values(AuditActions).map(v => parseInt(v))],
        //   description: 'Filter by actionTypeId',
        // },
        search: {
          type: Type.STRING,
          description: 'Search term for entityName or logText',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_all_event_logs',
    description:
      'Retrieve all event logs with pagination, sorting, and optional filtering.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: { type: Type.INTEGER, description: 'Page number (default: 1)' },
        pageSize: {
          type: Type.INTEGER,
          description: 'Logs per page (default: 10)',
        },
        sortBy: {
          type: Type.STRING,
          description: 'Field to sort by (e.g., timestamp)',
        },
        order: {
          type: Type.STRING,
          enum: ['asc', 'desc'],
          description: 'Sort order',
        },
        // eventTypeId: {
        //   type: Type.INTEGER,
        //   // enum: [...Object.values(EventTypes).map(v => parseInt(v))],
        //   description: 'Filter by eventTypeId',
        // },
        search: {
          type: Type.STRING,
          description: 'Search term for entityName or details',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_exhibit_by_id',
    description: 'Retrieve an exhibit by its ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        exhibitId: { type: Type.STRING, description: 'Exhibit ID (UUID)' },
      },
      required: ['exhibitId'],
    },
  },
  {
    name: 'get_all_reviews',
    description:
      'Retrieve all user reviews with pagination, sorting, and optional search/filter.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: { type: Type.INTEGER, description: 'Page number (default: 1)' },
        pageSize: {
          type: Type.INTEGER,
          description: 'Reviews per page (default: 10)',
        },
        sortBy: {
          type: Type.STRING,
          description: 'Field to sort by (e.g., createdAt)',
        },
        order: {
          type: Type.STRING,
          enum: ['asc', 'desc'],
          description: 'Sort order',
        },
        search: {
          type: Type.STRING,
          description: 'Search term for review text',
        },
        filter: {
          type: Type.OBJECT,
          description: 'Optional filter object for advanced queries',
          properties: {
            statusId: {
              type: Type.INTEGER,
              description:
                'Filter exhibits by statusId (e.g., ACTIVE, ARCHIVED)',
            },
          },
        },
      },
      required: [],
    },
  },
  {
    name: 'get_common_languages',
    description: 'Retrieve common languages used by members.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.INTEGER,
          description: 'Maximum languages to return',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_all_exhibits',
    description:
      'Retrieve a paginated, sortable list of exhibits with optional search and status filter.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: {
          type: Type.INTEGER,
          description: 'Page number (default: 1)',
        },
        pageSize: {
          type: Type.INTEGER,
          description: 'Number of exhibits per page (default: 10)',
        },
        sortBy: {
          type: Type.STRING,
          description: 'Field to sort by (e.g., title, createdAt)',
        },
        order: {
          type: Type.STRING,
          enum: ['asc', 'desc'],
          description: 'Sort order (asc or desc)',
        },
        search: {
          type: Type.STRING,
          description: 'Search term for exhibit title or description',
        },
        // Filter
        filter: {
          type: Type.OBJECT,
          description: 'Filter exhibits by various fields, such as statusId',
          properties: {
            statusId: {
              type: Type.INTEGER,
              description:
                'Filter exhibits by statusId (e.g., ACTIVE, ARCHIVED)',
            },
          },
        },
      },
      required: [],
    },
  },
  {
    name: 'get_audio_engagement',
    description:
      'Retrieve audio engagement metrics (play_count, completion_rate, listen_duration). Note: exhibitId, startDate, and endDate are ignored for all metrics.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        metric: {
          type: Type.STRING,
          enum: ['play_count', 'completion_rate', 'listen_duration'],
        },
        exhibitId: {
          type: Type.STRING,
          description: 'Ignored for all metrics',
        },
        startDate: {
          type: Type.STRING,
          description: 'Ignored for all metrics',
        },
        endDate: { type: Type.STRING, description: 'Ignored for all metrics' },
      },
      required: ['metric'],
    },
  },
  {
    name: 'get_exhibit_scans',
    description:
      'Retrieve QR scan data for exhibits with filtering by date, granularity, and limit. Dates must be in 2025 or later.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        startDate: {
          type: Type.STRING,
          description: 'Start date (YYYY-MM-DD, must be 2025 or later)',
        },
        endDate: {
          type: Type.STRING,
          description: 'End date (YYYY-MM-DD, must be 2025 or later)',
        },
        granularity: { type: Type.STRING, enum: ['day', 'month', 'year'] },
        limit: { type: Type.INTEGER },
      },
      required: [],
    },
  },
  {
    name: 'get_time_series',
    description:
      'Retrieve time series data for audio metrics (completion_rate, listen_duration). Note: startDate, endDate, and granularity are ignored for all metrics.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        metric: {
          type: Type.STRING,
          enum: ['completion_rate', 'listen_duration'],
        },
        startDate: {
          type: Type.STRING,
          description: 'Ignored for all metrics',
        },
        endDate: { type: Type.STRING, description: 'Ignored for all metrics' },
        granularity: {
          type: Type.STRING,
          enum: ['daily', 'weekly', 'monthly'],
        },
      },
      required: ['metric'],
    },
  },
  analyzeExhibitPerformance,
  // generateInsightReport,
  // optimizeDataRetrieval,
  // makeContextAwareChart,
];

function createContextAwareChartConfig(data, chartType, context = null) {
  const baseConfig = createChartJsConfig(data, chartType);

  if (!context) return baseConfig;

  const executionHistory = context.executionHistory || [];
  const hasTimeSeriesData = executionHistory.some(
    (exec) =>
      exec.function.includes('time_series') ||
      exec.function.includes('sign_ups'),
  );

  if (hasTimeSeriesData && chartType === 'line') {
    baseConfig.options.scales = {
      x: {
        type: 'time',
        time: { unit: 'day' },
      },
      y: {
        beginAtZero: true,
      },
    };
  }

  if (executionHistory.length > 1) {
    baseConfig.options.plugins.annotation = {
      annotations: {
        contextNote: {
          type: 'label',
          content: `Based on ${executionHistory.length} data sources`,
          position: { x: 'end', y: 'start' },
        },
      },
    };
  }

  return baseConfig;
}

async function formatContextAwareResponse(data, functionName, context = null) {
  const baseFormatting = await formatFunctionResponse(data, functionName);

  if (!context || context.executionHistory.length <= 1) {
    return baseFormatting;
  }

  const relatedFunctions = context.executionHistory
    .filter((exec) => exec.function !== functionName)
    .map((exec) => exec.function);

  if (relatedFunctions.length > 0) {
    const contextualInsight = generateContextualInsight(
      data,
      relatedFunctions,
      context,
    );
    baseFormatting.message += ` ${contextualInsight}`;
  }

  return baseFormatting;
}

function generateContextualInsight(currentData, relatedFunctions, context) {
  const insights = [];

  if (
    relatedFunctions.includes('get_member_sign_ups') &&
    relatedFunctions.includes('get_audio_engagement')
  ) {
    insights.push(
      'This data shows interesting correlations with member demographics and engagement patterns.',
    );
  }

  if (relatedFunctions.includes('get_exhibit_scans') && currentData.scanCount) {
    const scanData = context.toolOutputs.get('get_exhibit_scans');
    if (scanData && scanData.scanCount) {
      const comparison =
        currentData.scanCount > scanData.scanCount ? 'higher' : 'lower';
      insights.push(
        `Scan activity is ${comparison} compared to the previous analysis.`,
      );
    }
  }

  return insights.length > 0 ? insights.join(' ') : '';
}

function validateFunctionContext(functionName, args, context) {
  const warnings = [];
  const suggestions = [];

  // Check for redundant calls
  if (context && context.toolOutputs.has(functionName)) {
    const previousArgs = context.executionHistory.find(
      (exec) => exec.function === functionName,
    )?.arguments;

    if (JSON.stringify(args) === JSON.stringify(previousArgs)) {
      warnings.push('Duplicate function call detected');
      suggestions.push('Consider using cached data');
    }
  }

  // Check for missing complementary data
  if (functionName === 'make_context_aware_chart' && context) {
    const hasDataSource = context.toolOutputs.has(args.dataSource);
    if (!hasDataSource) {
      suggestions.push(`Consider fetching ${args.dataSource} data first`);
    }
  }

  // Validate dates to ensure they are in 2025 or later
  if (args.startDate || args.endDate) {
    if (args.startDate && new Date(args.startDate).getFullYear() < 2025) {
      warnings.push(`Invalid startDate: ${args.startDate} is before 2025`);
      suggestions.push('Use a date in 2025 or later');
    }
    if (args.endDate && new Date(args.endDate).getFullYear() < 2025) {
      warnings.push(`Invalid endDate: ${args.endDate} is before 2025`);
      suggestions.push('Use a date in 2025 or later');
    }
  }

  return { warnings, suggestions };
}

module.exports = {
  tools: enhancedTools,
  createChartJsConfig: createContextAwareChartConfig,
  formatFunctionResponse: formatContextAwareResponse,
  validateFunctionContext,
  generateContextualInsight,
};
