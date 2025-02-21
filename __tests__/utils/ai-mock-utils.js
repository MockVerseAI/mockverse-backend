/**
 * Mock feedback response for application analysis
 * @param {Object} application - The application object
 * @returns {Object} Mock feedback object
 */
export const mockApplicationFeedback = (application) => ({
  feedback: {
    strengths: [
      'Strong technical background matching job requirements',
      'Relevant experience in required technologies',
      'Salary expectations align with market range'
    ],
    improvements: [
      'Consider highlighting specific achievements',
      'Add more details about leadership experience',
      'Include relevant certifications'
    ],
    marketAnalysis: {
      salaryRange: {
        low: application.salary.min - 10000,
        average: (application.salary.min + application.salary.max) / 2,
        high: application.salary.max + 10000,
        currency: application.salary.currency
      },
      marketDemand: {
        level: 'high',
        trend: 'increasing',
        details: 'Strong demand for this role in the current market'
      },
      competitiveAnalysis: {
        competitionLevel: 'moderate',
        requiredSkills: [
          'JavaScript',
          'Node.js',
          'React',
          'AWS'
        ],
        recommendedSkills: [
          'TypeScript',
          'Docker',
          'Kubernetes'
        ]
      }
    },
    nextSteps: [
      'Follow up within 5-7 business days',
      'Prepare for technical interview',
      'Research company culture and values'
    ]
  }
});

/**
 * Mock interview chat response
 * @param {Object} options - Chat options
 * @param {string} options.message - The user's message
 * @param {string} options.jobRole - The job role being interviewed for
 * @returns {Object} Mock chat response
 */
export const mockInterviewChat = ({ message, jobRole }) => ({
  role: 'assistant',
  content: `Here's a thoughtful response to: ${message}. This is a mock interview response for ${jobRole} position that simulates AI-generated content.`,
  usage: {
    promptTokens: 150,
    completionTokens: 50,
    totalTokens: 200
  }
});

/**
 * Mock interview report generation
 * @param {Object} options - Report options
 * @param {string} options.jobRole - The job role
 * @param {string} options.jobDescription - The job description
 * @param {Object} options.parsedResume - The parsed resume data
 * @param {Array<Object>} options.conversation - The interview conversation
 * @returns {Object} Mock interview report
 */
export const mockInterviewReport = ({ jobRole, jobDescription, parsedResume, conversation }) => ({
  report: {
    summary: `Overall positive interview performance for ${jobRole} position`,
    score: 85,
    feedback: {
      strengths: [
        'Clear communication',
        `Strong understanding of ${jobRole} requirements`,
        'Good problem-solving approach'
      ],
      improvements: [
        'Could provide more detailed examples',
        'Consider asking more follow-up questions',
        'Elaborate more on system design decisions'
      ],
      technicalAssessment: {
        overallScore: 8.5,
        areas: {
          problemSolving: 9,
          technicalKnowledge: parsedResume.skills.length > 3 ? 9 : 8,
          systemDesign: 8.5
        }
      },
      communicationAssessment: {
        overallScore: 8,
        areas: {
          clarity: 8.5,
          confidence: conversation.length > 5 ? 9 : 8,
          professionalism: 8.5
        }
      }
    },
    roleAlignment: {
      requirements: {
        essential: [
          {
            requirement: jobDescription.slice(0, 50),
            met: true,
            notes: 'Demonstrated strong technical knowledge'
          }
        ],
        experience: 'Highly relevant experience',
        skills: {
          technical: { match: 0.85, notes: 'Strong technical skills' },
          soft: { match: 0.8, notes: 'Good communication skills' }
        }
      }
    },
    recommendations: [
      'Focus on system design patterns',
      'Practice behavioral scenarios',
      'Review latest industry trends'
    ]
  },
  usage: {
    promptTokens: 500,
    completionTokens: 300,
    totalTokens: 800
  }
});

/**
 * Mock resume analysis
 * @param {Object} options - Analysis options
 * @param {string} options.resumeText - The resume text content
 * @param {string} options.jobDescription - The job description to analyze against
 * @returns {Object} Mock resume analysis
 */
export const mockResumeAnalysis = ({ resumeText, jobDescription }) => ({
  analysis: {
    score: resumeText.length > 500 ? 85 : 75,
    feedback: {
      strengths: [
        'Clear and professional format',
        `Content matches ${jobDescription.slice(0, 30)}...`,
        'Quantifiable achievements'
      ],
      improvements: [
        'Add more keywords from job description',
        'Elaborate on leadership experience',
        'Include more specific metrics'
      ],
      keywordAnalysis: {
        present: ['JavaScript', 'React', 'Node.js'],
        missing: ['Docker', 'Kubernetes', 'GraphQL']
      },
      formatAnalysis: {
        structure: 'Good',
        readability: 'High',
        atsCompatibility: 'Compatible'
      }
    },
    recommendations: [
      'Tailor resume for specific job',
      'Add certifications section',
      'Include github profile'
    ]
  },
  usage: {
    promptTokens: resumeText.length,
    completionTokens: 200,
    totalTokens: resumeText.length + 200
  }
});

/**
 * Mock AI response generation
 * @param {Object} options - Generation options
 * @param {Array<Object>} options.messages - The conversation messages
 * @param {string} options.model - The AI model to use
 * @param {string} options.systemPrompt - The system prompt
 * @returns {Object} Mock AI response
 */
export const mockGenerateAIResponse = ({ messages, model, systemPrompt }) => ({
  text: `This is a mock AI response using ${model} model with system prompt: ${systemPrompt.slice(0, 50)}...`,
  usage: {
    promptTokens: messages.reduce((acc, m) => acc + m.content.length, 0),
    completionTokens: 50,
    totalTokens: messages.reduce((acc, m) => acc + m.content.length, 0) + 50
  },
  warnings: null
}); 