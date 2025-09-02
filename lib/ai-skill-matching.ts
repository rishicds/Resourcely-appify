// @ts-ignore - Google Generative AI types
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export interface SkillMatch {
  userId: string;
  name: string;
  relevanceScore: number;
  matchingSkills: string[];
  matchingTools: string[];
  availability: boolean;
  helpScore?: number;
  reasoning: string;
}

export interface AISkillMatchRequest {
  query: string;
  context?: string;
  userPool: {
    $id: string;
    name: string;
    skills: string[];
    tools: string[];
    isAvailable: boolean;
    helpScore?: number;
    lastActive?: string;
  }[];
  maxResults?: number;
}

export interface AISkillMatchResponse {
  matches: SkillMatch[];
  extractedSkills: string[];
  extractedTools: string[];
  confidence: number;
  suggestions: string[];
}

/**
 * Parse natural language query to extract skills, tools, and intent
 */
export const parseNaturalLanguageQuery = async (query: string): Promise<{
  skills: string[];
  tools: string[];
  intent: string;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
Analyze this help request and extract relevant skills, tools, and intent:

Query: "${query}"

Return a JSON response with:
{
  "skills": ["array of relevant skills needed"],
  "tools": ["array of specific tools/technologies mentioned"],
  "intent": "clear description of what the user wants to accomplish",
  "urgency": "low|medium|high based on language used",
  "confidence": 0.0-1.0 confidence score
}

Common skill categories:
- Programming: JavaScript, Python, React, Node.js, Flutter, Swift, Kotlin
- Design: UI/UX, Figma, Photoshop, Sketch, Adobe Creative Suite
- DevOps: Docker, Kubernetes, AWS, Azure, CI/CD, Jenkins
- Data: SQL, MongoDB, Analytics, Machine Learning, Data Science
- Mobile: iOS, Android, React Native, Flutter
- Web: Frontend, Backend, Full-stack, API Development
- Other: Project Management, Marketing, Business Analysis

Return only valid JSON, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const parsed = JSON.parse(text);
      return {
        skills: parsed.skills || [],
        tools: parsed.tools || [],
        intent: parsed.intent || query,
        urgency: parsed.urgency || 'medium',
        confidence: parsed.confidence || 0.7
      };
    } catch (parseError) {
      console.error('Error parsing natural language query response:', parseError);
      console.log('Raw response text:', text);
      // Fallback to basic keyword extraction
      return extractSkillsBasic(query);
    }
  } catch (error) {
    console.error('Error parsing natural language query:', error);
    // Fallback to basic keyword extraction
    return extractSkillsBasic(query);
  }
};

/**
 * Basic keyword extraction fallback
 */
const extractSkillsBasic = (query: string) => {
  const commonSkills = [
    'javascript', 'python', 'react', 'nodejs', 'flutter', 'swift', 'kotlin',
    'ui', 'ux', 'design', 'figma', 'photoshop', 'sketch',
    'docker', 'kubernetes', 'aws', 'azure', 'devops',
    'sql', 'mongodb', 'database', 'analytics', 'ml', 'ai',
    'ios', 'android', 'mobile', 'frontend', 'backend', 'api'
  ];
  
  const commonTools = [
    'firebase', 'auth', 'authentication', 'database', 'storage',
    'git', 'github', 'vscode', 'xcode', 'android studio'
  ];
  
  const lowerQuery = query.toLowerCase();
  
  const skills = commonSkills.filter(skill => 
    lowerQuery.includes(skill) || lowerQuery.includes(skill.replace(/[^a-z]/g, ''))
  );
  
  const tools = commonTools.filter(tool => 
    lowerQuery.includes(tool) || lowerQuery.includes(tool.replace(/[^a-z]/g, ''))
  );
  
  return {
    skills,
    tools,
    intent: query,
    urgency: 'medium' as const,
    confidence: 0.5
  };
};

/**
 * AI-powered skill and resource matching
 */
export const aiSkillMatch = async (request: AISkillMatchRequest): Promise<AISkillMatchResponse> => {
  try {
    // Parse the natural language query first
    const queryAnalysis = await parseNaturalLanguageQuery(request.query);
    
    // If we have a small user pool, use AI for detailed matching
    if (request.userPool.length <= 50) {
      return aiDetailedMatch(request, queryAnalysis);
    } else {
      // For larger pools, use hybrid approach (AI + traditional filtering)
      return aiHybridMatch(request, queryAnalysis);
    }
  } catch (error) {
    console.error('Error in AI skill matching:', error);
    // Fallback to basic matching
    return basicSkillMatch(request);
  }
};

/**
 * Detailed AI matching for smaller user pools
 */
const aiDetailedMatch = async (
  request: AISkillMatchRequest, 
  queryAnalysis: any
): Promise<AISkillMatchResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const userSummaries = request.userPool.map(user => ({
      id: user.$id,
      name: user.name,
      skills: user.skills,
      tools: user.tools,
      available: user.isAvailable,
      helpScore: user.helpScore || 0,
      lastActive: user.lastActive
    }));
    
    const prompt = `
Analyze this help request and rank the most suitable teammates:

Request: "${request.query}"
Intent: ${queryAnalysis.intent}
Needed Skills: ${queryAnalysis.skills.join(', ')}
Needed Tools: ${queryAnalysis.tools.join(', ')}
Urgency: ${queryAnalysis.urgency}

Available teammates:
${JSON.stringify(userSummaries, null, 2)}

Rank teammates by relevance and return JSON:
{
  "matches": [
    {
      "userId": "user_id",
      "name": "User Name", 
      "relevanceScore": 0.0-1.0,
      "matchingSkills": ["skills that match"],
      "matchingTools": ["tools that match"],
      "availability": true/false,
      "reasoning": "why this person is a good match"
    }
  ],
  "extractedSkills": ["skills found in query"],
  "extractedTools": ["tools found in query"],
  "confidence": 0.0-1.0,
  "suggestions": ["helpful tips for the requester"]
}

Ranking criteria:
1. Direct skill/tool matches (weight: 40%)
2. Availability status (weight: 20%)
3. Help score/reputation (weight: 15%)
4. Recent activity (weight: 15%)
5. Skill complementarity (weight: 10%)

Return only JSON, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const aiResponse = JSON.parse(text);
      
      // Validate and clean the response
      const matches: SkillMatch[] = aiResponse.matches
        .filter((match: any) => match.userId && match.relevanceScore >= 0)
        .slice(0, request.maxResults || 10)
        .map((match: any) => ({
          userId: match.userId,
          name: match.name,
          relevanceScore: Math.min(Math.max(match.relevanceScore, 0), 1),
          matchingSkills: match.matchingSkills || [],
          matchingTools: match.matchingTools || [],
          availability: match.availability || false,
          helpScore: request.userPool.find(u => u.$id === match.userId)?.helpScore || 0,
          reasoning: match.reasoning || 'Good skills match'
        }));
      
      return {
        matches,
        extractedSkills: aiResponse.extractedSkills || queryAnalysis.skills,
        extractedTools: aiResponse.extractedTools || queryAnalysis.tools,
        confidence: aiResponse.confidence || queryAnalysis.confidence,
        suggestions: aiResponse.suggestions || []
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response text:', text);
      return basicSkillMatch(request);
    }
  } catch (error) {
    console.error('Error in detailed AI matching:', error);
    return basicSkillMatch(request);
  }
};

/**
 * Hybrid AI + traditional matching for larger user pools
 */
const aiHybridMatch = async (
  request: AISkillMatchRequest,
  queryAnalysis: any
): Promise<AISkillMatchResponse> => {
  // First, filter users using traditional methods
  const relevantUsers = request.userPool.filter(user => {
    const hasMatchingSkills = user.skills.some(skill => 
      queryAnalysis.skills.some((needed: string) => 
        skill.toLowerCase().includes(needed.toLowerCase()) ||
        needed.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const hasMatchingTools = user.tools.some(tool => 
      queryAnalysis.tools.some((needed: string) => 
        tool.toLowerCase().includes(needed.toLowerCase()) ||
        needed.toLowerCase().includes(tool.toLowerCase())
      )
    );
    
    return hasMatchingSkills || hasMatchingTools || user.isAvailable;
  });
  
  // Then use AI for ranking the filtered results
  const limitedRequest = {
    ...request,
    userPool: relevantUsers.slice(0, 30) // Limit to top 30 for AI processing
  };
  
  return aiDetailedMatch(limitedRequest, queryAnalysis);
};

/**
 * Basic fallback matching without AI
 */
const basicSkillMatch = (request: AISkillMatchRequest): AISkillMatchResponse => {
  const queryAnalysis = extractSkillsBasic(request.query);
  
  const matches: SkillMatch[] = request.userPool
    .map(user => {
      const matchingSkills = user.skills.filter(skill =>
        queryAnalysis.skills.some((needed: string) =>
          skill.toLowerCase().includes(needed.toLowerCase()) ||
          needed.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const matchingTools = user.tools.filter(tool =>
        queryAnalysis.tools.some((needed: string) =>
          tool.toLowerCase().includes(needed.toLowerCase()) ||
          needed.toLowerCase().includes(tool.toLowerCase())
        )
      );
      
      let relevanceScore = 0;
      relevanceScore += matchingSkills.length * 0.4;
      relevanceScore += matchingTools.length * 0.3;
      relevanceScore += user.isAvailable ? 0.2 : 0;
      relevanceScore += (user.helpScore || 0) * 0.1 / 100;
      
      return {
        userId: user.$id,
        name: user.name,
        relevanceScore: Math.min(relevanceScore, 1),
        matchingSkills,
        matchingTools,
        availability: user.isAvailable,
        helpScore: user.helpScore || 0,
        reasoning: `Matches ${matchingSkills.length} skills and ${matchingTools.length} tools`
      };
    })
    .filter(match => match.relevanceScore > 0 || match.availability)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, request.maxResults || 10);
  
  return {
    matches,
    extractedSkills: queryAnalysis.skills,
    extractedTools: queryAnalysis.tools,
    confidence: queryAnalysis.confidence,
    suggestions: [
      'Try being more specific about the tools you need help with',
      'Mention your skill level to get better matches',
      'Consider breaking down complex problems into smaller tasks'
    ]
  };
};

/**
 * Get AI-powered suggestions for improving help requests
 */
export const getQueryImprovementSuggestions = async (query: string): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
Analyze this help request and suggest improvements to get better matches:

Query: "${query}"

Provide 3-5 specific suggestions to make this request clearer and more likely to find the right help. Return as a JSON array of strings.

Example response:
["Be more specific about which part of Firebase auth you need help with", "Mention your current skill level", "Include what you've already tried"]

Return only the JSON array, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const suggestions = JSON.parse(text);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      return [
        'Try being more specific about your problem',
        'Mention what you\'ve already tried',
        'Include your skill level for better matches'
      ];
    }
  } catch (error) {
    console.error('Error getting query improvement suggestions:', error);
    return [
      'Be more specific about the tools and technologies involved',
      'Mention your experience level',
      'Describe what you\'ve already attempted'
    ];
  }
};
