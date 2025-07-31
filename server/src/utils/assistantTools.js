const { Type } = require('@google/genai');

const getUserCountStatistics = {
  name: 'get_user_count_statistics',
  description:
    'Retrieve total user counts and registration statistics for guests and members at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

const getMemberSignUps = {
  name: 'get_member_sign_ups',
  description:
    'Get a breakdown of member sign-ups by age group, gender, and time period at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      startDate: {
        type: Type.STRING,
        description: 'Start date for the data range (YYYY-MM-DD). Optional.',
      },
      endDate: {
        type: Type.STRING,
        description: 'End date for the data range (YYYY-MM-DD). Optional.',
      },
      gender: {
        type: Type.STRING,
        enum: ['male', 'female', 'all'],
        description: 'Filter by gender. Use "all" for no filter. Optional.',
      },
      ageGroup: {
        type: Type.STRING,
        enum: ['children', 'youth', 'adults', 'seniors', 'all'],
        description: 'Filter by age group. Use "all" for no filter. Optional.',
      },
      granularity: {
        type: Type.STRING,
        enum: ['daily', 'weekly', 'monthly'],
        description: 'Time granularity for the data. Optional.',
      },
    },
    required: [],
  },
};

const getCommonLanguages = {
  name: 'get_common_languages',
  description:
    'Retrieve the most common languages used by members at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      limit: {
        type: Type.INTEGER,
        description:
          'Maximum number of languages to return. Optional, defaults to 5.',
      },
    },
    required: [],
  },
};

const getAudioEngagement = {
  name: 'get_audio_engagement',
  description:
    'Retrieve audio engagement metrics (play counts, completion rates, or average listen duration) for exhibits at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      metric: {
        type: Type.STRING,
        enum: ['play_count', 'completion_rate', 'listen_duration'],
        description:
          'The metric to retrieve: play_count, completion_rate, or listen_duration.',
      },
      exhibitId: {
        type: Type.STRING,
        description: 'ID of the exhibit to filter by. Optional.',
      },
      startDate: {
        type: Type.STRING,
        description: 'Start date for the data range (YYYY-MM-DD). Optional.',
      },
      endDate: {
        type: Type.STRING,
        description: 'End date for the data range (YYYY-MM-DD). Optional.',
      },
    },
    required: ['metric'],
  },
};

const getExhibitScans = {
  name: 'get_exhibit_scans',
  description:
    'Retrieve QR code scan counts for exhibits at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      exhibitId: {
        type: Type.STRING,
        description: 'ID of the exhibit to filter by. Optional.',
      },
      startDate: {
        type: Type.STRING,
        description: 'Start date for the data range (YYYY-MM-DD). Optional.',
      },
      endDate: {
        type: Type.STRING,
        description: 'End date for the data range (YYYY-MM-DD). Optional.',
      },
      granularity: {
        type: Type.STRING,
        enum: ['daily', 'weekly', 'monthly'],
        description: 'Time granularity for the data. Optional.',
      },
      limit: {
        type: Type.INTEGER,
        description: 'Maximum number of exhibits to return. Optional.',
      },
    },
    required: [],
  },
};

const getTimeSeries = {
  name: 'get_time_series',
  description:
    'Retrieve time series data for audio engagement metrics at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      metric: {
        type: Type.STRING,
        enum: ['completion_rate', 'listen_duration'],
        description:
          'The metric to retrieve: completion_rate or listen_duration.',
      },
      startDate: {
        type: Type.STRING,
        description: 'Start date for the data range (YYYY-MM-DD). Optional.',
      },
      endDate: {
        type: Type.STRING,
        description: 'End date for the data range (YYYY-MM-DD). Optional.',
      },
      granularity: {
        type: Type.STRING,
        enum: ['daily', 'weekly', 'monthly'],
        description: 'Time granularity for the data.',
      },
    },
    required: ['metric', 'granularity'],
  },
};

const getUserProfileStats = {
  name: 'get_user_profile_stats',
  description:
    'Retrieve aggregated demographic statistics for users at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      metric: {
        type: Type.STRING,
        enum: ['average_age', 'gender_distribution'],
        description:
          'The demographic metric to retrieve: average_age or gender_distribution.',
      },
    },
    required: ['metric'],
  },
};

const getExhibitDetails = {
  name: 'get_exhibit_details',
  description:
    'Retrieve details about a specific exhibit at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      exhibitId: {
        type: Type.STRING,
        description: 'ID of the exhibit to retrieve details for.',
      },
      title: {
        type: Type.STRING,
        description:
          'Title of the exhibit to retrieve details for. Optional if exhibitId is provided.',
      },
    },
    required: ['exhibitId'],
  },
};

const getAuditLogSummary = {
  name: 'get_audit_log_summary',
  description:
    'Retrieve a summary of recent system actions (e.g., exhibit updates) at the Singapore Discovery Centre.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      startDate: {
        type: Type.STRING,
        description:
          'Start date for the audit log range (YYYY-MM-DD). Optional.',
      },
      endDate: {
        type: Type.STRING,
        description: 'End date for the audit log range (YYYY-MM-DD). Optional.',
      },
      actionType: {
        type: Type.STRING,
        enum: ['create', 'update', 'delete', 'all'],
        description:
          'Filter by action type. Use "all" for no filter. Optional.',
      },
    },
    required: [],
  },
};

const makeChart = {
  name: 'make_chart',
  description:
    'Generate a Chart.js configuration for visualizing data from Singapore Discovery Centre analytics.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      dataSource: {
        type: Type.STRING,
        enum: [
          'member_sign_ups',
          'exhibit_scans',
          'time_series',
          'common_languages',
          'audio_engagement',
        ],
        description: 'The data source for the chart.',
      },
      chartType: {
        type: Type.STRING,
        enum: ['bar', 'line', 'pie'],
        description: 'The type of chart to generate.',
      },
      filters: {
        type: Type.OBJECT,
        properties: {
          startDate: {
            type: Type.STRING,
            description:
              'Start date for the data range (YYYY-MM-DD). Optional.',
          },
          endDate: {
            type: Type.STRING,
            description: 'End date for the data range (YYYY-MM-DD). Optional.',
          },
          exhibitId: {
            type: Type.STRING,
            description: 'ID of the exhibit to filter by. Optional.',
          },
        },
        required: [],
      },
    },
    required: ['dataSource', 'chartType'],
  },
};

const tools = [
  getUserCountStatistics,
  getMemberSignUps,
  getCommonLanguages,
  // getAudioEngagement,
  // getExhibitScans,
  getTimeSeries,
  getUserProfileStats,
  getExhibitDetails,
  getAuditLogSummary,
  makeChart,
];

function createChartJsConfig(data, chartType) {
  const labels = data.labels || Object.keys(data);
  const values =
    data.values || Object.values(data).map((item) => item.count || item);
  return {
    type: chartType,
    data: {
      labels,
      datasets: [
        {
          label: data.label || 'Data',
          data: values,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
      },
    },
  };
}

async function formatFunctionResponse(data, functionName) {
  let message = '';
  switch (functionName) {
    case 'get_user_count_statistics':
      message = `This month, ${data.registrations.thisMonth} new users signed up, with ${data.registrations.today} today and ${data.registrations.thisYear} this year. Total users: ${data.totalUsers}.`;
      break;
    case 'get_member_sign_ups':
      message = `Here’s the breakdown of member sign-ups: ${data.datasets[0].data.join(', ')} for ${data.labels.join(', ')}.`;
      break;
    case 'get_common_languages':
      message = `The top languages used by members are ${data.topLanguages.map((l) => l.languageName).join(', ')}.`;
      break;
    // TODO Output here is wrong
    case 'get_audio_engagement':
      message = `Audio engagement: ${data.title || 'Selected exhibits'} have a ${data.metric} of ${data.value || data.completionRate || data.listenDuration}.`;
      break;
    // TODO Function Call should fetch 1 exhibit only
    case 'get_exhibit_scans':
      message = `The ${data.title || 'selected exhibit'} had ${data.scanCount} scans.`;
      break;
    case 'get_time_series':
      message = `The ${data.metric} trend shows values like ${data.datasets[0].data.slice(0, 3).join(', ')} over recent periods.`;
      break;
    case 'get_user_profile_stats':
      message = data.averageAge
        ? `The average age of members is ${data.averageAge} years.`
        : `Gender distribution: ${data.map((g) => `${g.gender}: ${g._count}`).join(', ')}.`;
      break;
    case 'get_exhibit_details':
      message = `The ${data.title} exhibit is described as: ${data.description}.`;
      break;
    case 'get_audit_log_summary':
      message = `Recent actions include ${data.length} updates, such as ${data[0]?.actionType} on ${data[0]?.timestamp}.`;
      break;
    case 'make_chart':
      message = `Here is a ${data.type} chart for the requested data.`;
      break;
    default:
      message =
        'I’m not sure how to process that request. Could you clarify or ask about specific data?';
      data = {};
  }
  return { message, data };
}

module.exports = { tools, createChartJsConfig, formatFunctionResponse };
