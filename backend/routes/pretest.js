const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Helper function: Exponential backoff retry for Gemini API calls
async function retryWithBackoff(apiCall, retries = RETRY_CONFIG.maxRetries) {
  let lastError;
  let delay = RETRY_CONFIG.initialDelay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`API call attempt ${attempt + 1}/${retries + 1}`);
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Check if it's a 503 error (service unavailable)
      if (error.status === 503 || error.message?.includes('503') || error.message?.includes('high demand')) {
        console.log(`503 error detected. Attempt ${attempt + 1}/${retries + 1} failed.`);
        
        // If we have retries left, wait and try again
        if (attempt < retries) {
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
          continue;
        }
      }
      
      // For non-503 errors or if we've exhausted retries, throw immediately
      throw error;
    }
  }
  
  throw lastError;
}

// Fallback static questions when API is unavailable
const STATIC_QUESTIONS = [
  {
    questionNumber: 1,
    totalQuestions: 5,
    question: "What type of activities do you enjoy the most in your free time?",
    choices: [
      { key: "A", text: "Using computers, phones, or playing video games" },
      { key: "B", text: "Helping friends with their homework or teaching younger siblings" },
      { key: "C", text: "Planning events or managing group projects" },
      { key: "D", text: "Gardening, taking care of animals, or outdoor activities" }
    ]
  },
  {
    questionNumber: 2,
    totalQuestions: 5,
    question: "Which school subjects do you find most interesting?",
    choices: [
      { key: "A", text: "Math, Science, and Computer classes" },
      { key: "B", text: "English, Filipino, and Social Studies" },
      { key: "C", text: "Business subjects and Economics" },
      { key: "D", text: "Agriculture and Environmental Science" }
    ]
  },
  {
    questionNumber: 3,
    totalQuestions: 5,
    question: "What kind of work environment appeals to you?",
    choices: [
      { key: "A", text: "Office with computers and technology" },
      { key: "B", text: "Classroom or training center" },
      { key: "C", text: "Business office or retail environment" },
      { key: "D", text: "Outdoor or field work" }
    ]
  },
  {
    questionNumber: 4,
    totalQuestions: 5,
    question: "What are your strongest skills?",
    choices: [
      { key: "A", text: "Problem-solving and logical thinking" },
      { key: "B", text: "Communication and explaining things to others" },
      { key: "C", text: "Leadership and organizing people" },
      { key: "D", text: "Hands-on work and practical skills" }
    ]
  },
  {
    questionNumber: 5,
    totalQuestions: 5,
    question: "What motivates you the most in your future career?",
    choices: [
      { key: "A", text: "Creating innovative solutions and working with technology" },
      { key: "B", text: "Making a difference in people's lives through education" },
      { key: "C", text: "Building a successful business or managing teams" },
      { key: "D", text: "Working with nature and sustainable practices" }
    ]
  }
];

// Simple course recommendation based on static answers
function getStaticRecommendation(answers) {
  const scores = {
    BSIT: 0,
    BSCS: 0,
    BSED: 0,
    BSBA: 0,
    BSAG: 0
  };

  // Score based on answers (A=tech, B=education, C=business, D=agriculture)
  answers.forEach(answer => {
    if (answer === 'A') {
      scores.BSIT += 2;
      scores.BSCS += 2;
    } else if (answer === 'B') {
      scores.BSED += 2;
    } else if (answer === 'C') {
      scores.BSBA += 2;
    } else if (answer === 'D') {
      scores.BSAG += 2;
    }
  });

  // Find top 2 courses
  const sortedCourses = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topCourse = sortedCourses[0][0];
  const altCourse = sortedCourses[1][0];

  const courseDetails = {
    BSIT: {
      name: "Bachelor of Science in Information Technology",
      analysis: "Based on your answers, you show strong interest in technology and problem-solving. Your preference for hands-on computer work and creating digital solutions makes Information Technology an excellent fit for you.",
      careers: ["Software Developer", "IT Support Specialist", "Web Developer", "Systems Analyst"]
    },
    BSCS: {
      name: "Bachelor of Science in Computer Science",
      analysis: "Your logical thinking and interest in technology suggest Computer Science would be ideal. This program focuses on programming, algorithms, and software engineering.",
      careers: ["Software Engineer", "Systems Architect", "Data Scientist", "AI Developer"]
    },
    BSED: {
      name: "Bachelor of Secondary Education",
      analysis: "Your communication skills and desire to help others learn make you well-suited for teaching. You can inspire and shape the next generation.",
      careers: ["High School Teacher", "Educational Coordinator", "Curriculum Developer", "Academic Counselor"]
    },
    BSBA: {
      name: "Bachelor of Science in Business Administration",
      analysis: "Your leadership abilities and interest in management indicate Business Administration is a great match. You'll learn to lead teams and build successful enterprises.",
      careers: ["Business Manager", "Entrepreneur", "Marketing Manager", "Operations Manager"]
    },
    BSAG: {
      name: "Bachelor of Science in Agriculture",
      analysis: "Your interest in hands-on work and sustainable practices makes Agriculture an excellent choice. You'll learn modern farming techniques and environmental management.",
      careers: ["Agricultural Manager", "Farm Consultant", "Agribusiness Owner", "Environmental Specialist"]
    }
  };

  const matchPercentage = Math.round((sortedCourses[0][1] / (answers.length * 2)) * 100);

  return {
    type: "result",
    recommendedCourse: topCourse,
    courseName: courseDetails[topCourse].name,
    analysis: courseDetails[topCourse].analysis,
    careerProspects: courseDetails[topCourse].careers,
    matchPercentage: matchPercentage,
    alternativeCourse: altCourse,
    alternativeCourseName: courseDetails[altCourse].name,
    alternativeReason: `Based on your responses, ${courseDetails[altCourse].name} could also be a good fit for you.`,
    fallbackMode: true
  };
}

// @route   GET /api/pretest/status — Check if user has completed pretest
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      completed: user.pretestCompleted || false,
      result: user.pretestResult || null
    });
  } catch (error) {
    console.error('Pretest status error:', error);
    res.status(500).json({ message: 'Failed to check pretest status' });
  }
});

// @route   POST /api/pretest/start — Get first question
router.post('/start', auth, async (req, res) => {
  try {
    console.log('Pretest start requested by user:', req.user._id);
    
    const courses = await Course.find({ isActive: true });
    console.log('Found courses:', courses.length);
    
    if (courses.length === 0) {
      console.error('No active courses found in database');
      return res.status(500).json({ message: 'No courses available. Please contact administrator.' });
    }
    
    const courseList = courses.map(c => `${c.code} - ${c.name}: ${c.description}`).join('\n');

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      console.log('Falling back to static questions');
      
      // Fallback to static questions
      return res.json({
        response: { type: 'question', ...STATIC_QUESTIONS[0] },
        conversationHistory: [
          { role: 'system', content: 'static_mode' },
          { role: 'assistant', content: JSON.stringify({ type: 'question', ...STATIC_QUESTIONS[0] }) }
        ],
        fallbackMode: true
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const systemPrompt = `You are an academic counselor for Cebu Technological University - Daanbantayan Campus.
Your job is to help incoming 1st year college students find the best course/program for them through adaptive questioning.

Available courses/programs:
${courseList}

CRITICAL INSTRUCTIONS:
- Ask ONE question at a time in simple, student-friendly language
- Each question should have 4 selection choices (A, B, C, D)
- IMPORTANT: Based on the student's answer, ask a DEEPER follow-up question that is DIRECTLY RELATED to their previous choice
- If they choose technology-related answer, next question should explore WHAT KIND of technology work they prefer
- If they choose business-related answer, next question should explore WHAT ASPECT of business interests them
- If they choose teaching-related answer, next question should explore WHAT SUBJECTS or AGE GROUP they prefer
- Continue asking 5-7 adaptive questions total
- Questions should progressively narrow down their interests based on previous answers
- Use simple, conversational language that students can easily understand
- Avoid technical jargon or complex terminology
- NEVER mention "AI" or "artificial intelligence" - present yourself as the university's counseling team

RESPONSE FORMAT (JSON only, no markdown):
For questions:
{"type":"question","questionNumber":1,"totalQuestions":6,"question":"What type of activities do you enjoy the most in your free time?","choices":[{"key":"A","text":"Using computers, phones, or playing video games"},{"key":"B","text":"Helping friends with their homework or teaching younger siblings"},{"key":"C","text":"Planning events or managing group projects"},{"key":"D","text":"Gardening, taking care of animals, or outdoor activities"}]}

For final recommendation (after 5-7 questions):
{"type":"result","recommendedCourse":"BSIT","courseName":"Bachelor of Science in Information Technology","analysis":"Based on your answers, you show strong interest in technology and problem-solving. Your preference for hands-on computer work and creating digital solutions makes Information Technology an excellent fit for you.","careerProspects":["Software Developer","IT Support Specialist","Web Developer","Systems Analyst"],"matchPercentage":92,"alternativeCourse":"BSED","alternativeCourseName":"Bachelor of Secondary Education","alternativeReason":"If you're interested in deeper programming and software engineering, Computer Science would also be a great choice."}

Start with the first question now. Use simple, friendly language. Respond with JSON only, no markdown code blocks.`;

    console.log('Calling Gemini API with retry logic...');
    
    let result;
    let cleanedResponse;
    let useFallback = false;
    
    try {
      // Try API call with retry logic
      result = await retryWithBackoff(async () => {
        return await model.generateContent(systemPrompt);
      });
      
      const responseText = result.response.text();
      console.log('Gemini raw response:', responseText);
      
      // Clean the response - remove markdown code blocks if present
      cleanedResponse = responseText.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      cleanedResponse = cleanedResponse.trim();
    } catch (apiError) {
      console.error('Gemini API failed after retries:', apiError.message);
      
      // Check if it's a 503 error
      if (apiError.status === 503 || apiError.message?.includes('503') || apiError.message?.includes('high demand')) {
        console.log('Service unavailable (503). Falling back to static questions.');
        useFallback = true;
      } else {
        // For other errors, throw them
        throw apiError;
      }
    }
    
    // Use fallback if API failed
    if (useFallback) {
      return res.json({
        response: { type: 'question', ...STATIC_QUESTIONS[0] },
        conversationHistory: [
          { role: 'system', content: 'static_mode' },
          { role: 'assistant', content: JSON.stringify({ type: 'question', ...STATIC_QUESTIONS[0] }) }
        ],
        fallbackMode: true,
        message: 'AI service is temporarily busy. Using standard assessment questions.'
      });
    }
    
    // Parse JSON from response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from Gemini response:', cleanedResponse);
      console.log('Falling back to static questions');
      
      return res.json({
        response: { type: 'question', ...STATIC_QUESTIONS[0] },
        conversationHistory: [
          { role: 'system', content: 'static_mode' },
          { role: 'assistant', content: JSON.stringify({ type: 'question', ...STATIC_QUESTIONS[0] }) }
        ],
        fallbackMode: true
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonMatch[0]);
      console.log('Falling back to static questions');
      
      return res.json({
        response: { type: 'question', ...STATIC_QUESTIONS[0] },
        conversationHistory: [
          { role: 'system', content: 'static_mode' },
          { role: 'assistant', content: JSON.stringify({ type: 'question', ...STATIC_QUESTIONS[0] }) }
        ],
        fallbackMode: true
      });
    }

    console.log('Parsed question:', parsed.question);
    
    res.json({ 
      response: parsed,
      conversationHistory: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: cleanedResponse }
      ]
    });
  } catch (error) {
    console.error('Pretest start error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    // Last resort fallback
    console.log('Using fallback static questions due to error');
    res.json({
      response: { type: 'question', ...STATIC_QUESTIONS[0] },
      conversationHistory: [
        { role: 'system', content: 'static_mode' },
        { role: 'assistant', content: JSON.stringify({ type: 'question', ...STATIC_QUESTIONS[0] }) }
      ],
      fallbackMode: true,
      message: 'Using standard assessment questions.'
    });
  }
});

// @route   POST /api/pretest/answer — Submit answer and get next question or result
router.post('/answer', auth, async (req, res) => {
  try {
    console.log('Pretest answer submitted by user:', req.user._id);
    const { answer, conversationHistory } = req.body;

    if (!answer || !conversationHistory) {
      console.log('Missing answer or conversation history');
      return res.status(400).json({ message: 'Answer and conversation history required' });
    }

    console.log('Answer:', answer);
    console.log('Conversation history length:', conversationHistory.length);

    // Check if we're in static/fallback mode
    const isStaticMode = conversationHistory.some(entry => 
      entry.role === 'system' && entry.content === 'static_mode'
    );

    if (isStaticMode) {
      console.log('Using static mode for pretest');
      
      // Count how many questions have been answered
      const answeredCount = conversationHistory.filter(entry => 
        entry.role === 'user' && entry.content.includes('selected:')
      ).length;
      
      const nextQuestionIndex = answeredCount;
      
      // Update conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: `The student selected: ${answer}` }
      ];
      
      // Check if we have more questions
      if (nextQuestionIndex < STATIC_QUESTIONS.length) {
        const nextQuestion = STATIC_QUESTIONS[nextQuestionIndex];
        updatedHistory.push({ 
          role: 'assistant', 
          content: JSON.stringify({ type: 'question', ...nextQuestion }) 
        });
        
        return res.json({
          response: { type: 'question', ...nextQuestion },
          conversationHistory: updatedHistory,
          fallbackMode: true
        });
      } else {
        // All questions answered, generate result
        const answers = conversationHistory
          .filter(entry => entry.role === 'user' && entry.content.includes('selected:'))
          .map(entry => {
            const match = entry.content.match(/selected:\s*([A-D])/);
            return match ? match[1] : null;
          })
          .filter(a => a !== null);
        
        // Add current answer
        answers.push(answer);
        
        const result = getStaticRecommendation(answers);
        
        // Save pretest result to user profile
        try {
          await User.findByIdAndUpdate(req.user._id, {
            pretestCompleted: true,
            pretestResult: {
              recommendedCourse: result.recommendedCourse,
              courseName: result.courseName,
              analysis: result.analysis,
              careerProspects: result.careerProspects || [],
              matchPercentage: result.matchPercentage || 0,
              alternativeCourse: result.alternativeCourse,
              alternativeCourseName: result.alternativeCourseName,
              alternativeReason: result.alternativeReason,
              completedAt: new Date()
            }
          });
          console.log('Pretest result saved to user profile (static mode)');
        } catch (saveError) {
          console.error('Error saving pretest result:', saveError);
        }
        
        updatedHistory.push({ 
          role: 'assistant', 
          content: JSON.stringify(result) 
        });
        
        return res.json({
          response: result,
          conversationHistory: updatedHistory,
          fallbackMode: true
        });
      }
    }

    // AI mode - use Gemini API
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found');
      return res.status(500).json({ message: 'AI service not configured' });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    // Build chat from history - simplified approach
    const chatHistory = [];
    
    // Skip the system message and start from actual conversation
    for (let i = 0; i < conversationHistory.length; i++) {
      const entry = conversationHistory[i];
      
      // Skip system messages
      if (entry.role === 'system') {
        continue;
      }
      
      // Map roles correctly
      if (entry.role === 'assistant' || entry.role === 'model') {
        chatHistory.push({ role: 'model', parts: [{ text: entry.content }] });
      } else if (entry.role === 'user') {
        chatHistory.push({ role: 'user', parts: [{ text: entry.content }] });
      }
    }

    console.log('Chat history built with', chatHistory.length, 'entries');
    
    // Ensure chat history starts with 'user' role
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      console.log('First entry is not user, adding placeholder user message');
      chatHistory.unshift({ 
        role: 'user', 
        parts: [{ text: 'Start the pretest conversation.' }] 
      });
    }

    const userMessage = `The student selected: ${answer}

IMPORTANT: Based on this specific answer, ask a follow-up question that DIRECTLY relates to what they just chose. 
- If they chose something about technology, ask what KIND of tech work they prefer (programming, fixing computers, web design, etc.)
- If they chose something about business, ask what ASPECT interests them (sales, management, accounting, entrepreneurship, etc.)
- If they chose something about teaching, ask what SUBJECTS or who they'd like to teach
- If they chose something about hands-on/practical work, ask what specific skills interest them

Make the next question more specific and deeper than the previous one. Use simple language students can understand.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):

For questions:
{"type":"question","questionNumber":2,"totalQuestions":6,"question":"Your question here?","choices":[{"key":"A","text":"Choice A"},{"key":"B","text":"Choice B"},{"key":"C","text":"Choice C"},{"key":"D","text":"Choice D"}]}

For final recommendation (after 5-7 questions):
{"type":"result","recommendedCourse":"BSIT","courseName":"Bachelor of Science in Information Technology","analysis":"Your analysis here","careerProspects":["Career 1","Career 2","Career 3"],"matchPercentage":92,"alternativeCourse":"BSED","alternativeCourseName":"Bachelor of Secondary Education","alternativeReason":"Reason here"}

Respond with JSON only. No other text.`;

    console.log('Calling Gemini API for next question with retry logic...');
    
    let result;
    let cleanedResponse;
    let useFallback = false;
    
    try {
      // Try API call with retry logic
      if (chatHistory.length > 0) {
        result = await retryWithBackoff(async () => {
          const chat = model.startChat({ history: chatHistory });
          return await chat.sendMessage(userMessage);
        });
      } else {
        result = await retryWithBackoff(async () => {
          return await model.generateContent(userMessage);
        });
      }
      
      const responseText = result.response.text();
      console.log('Gemini raw response:', responseText);

      // Clean the response - remove markdown code blocks if present
      cleanedResponse = responseText.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      cleanedResponse = cleanedResponse.trim();
    } catch (apiError) {
      console.error('Gemini API failed after retries:', apiError.message);
      
      // Check if it's a 503 error
      if (apiError.status === 503 || apiError.message?.includes('503') || apiError.message?.includes('high demand')) {
        console.log('Service unavailable (503). Switching to static mode.');
        useFallback = true;
      } else {
        // For other errors, throw them
        throw apiError;
      }
    }
    
    // Use fallback if API failed
    if (useFallback) {
      // Count how many questions have been answered in AI mode
      const answeredCount = conversationHistory.filter(entry => 
        entry.role === 'user' && entry.content.includes('selected:')
      ).length;
      
      // Switch to static mode
      const updatedHistory = [
        { role: 'system', content: 'static_mode' },
        { role: 'user', content: `The student selected: ${answer}` }
      ];
      
      // Start from the next question in static mode
      const nextQuestionIndex = answeredCount;
      
      if (nextQuestionIndex < STATIC_QUESTIONS.length) {
        const nextQuestion = STATIC_QUESTIONS[nextQuestionIndex];
        updatedHistory.push({ 
          role: 'assistant', 
          content: JSON.stringify({ type: 'question', ...nextQuestion }) 
        });
        
        return res.json({
          response: { type: 'question', ...nextQuestion },
          conversationHistory: updatedHistory,
          fallbackMode: true,
          message: 'AI service is temporarily busy. Continuing with standard questions.'
        });
      } else {
        // Generate result based on what we have
        const answers = [answer]; // At least we have the current answer
        const result = getStaticRecommendation(answers);
        
        // Save result
        try {
          await User.findByIdAndUpdate(req.user._id, {
            pretestCompleted: true,
            pretestResult: {
              recommendedCourse: result.recommendedCourse,
              courseName: result.courseName,
              analysis: result.analysis,
              careerProspects: result.careerProspects || [],
              matchPercentage: result.matchPercentage || 0,
              alternativeCourse: result.alternativeCourse,
              alternativeCourseName: result.alternativeCourseName,
              alternativeReason: result.alternativeReason,
              completedAt: new Date()
            }
          });
        } catch (saveError) {
          console.error('Error saving pretest result:', saveError);
        }
        
        updatedHistory.push({ 
          role: 'assistant', 
          content: JSON.stringify(result) 
        });
        
        return res.json({
          response: result,
          conversationHistory: updatedHistory,
          fallbackMode: true
        });
      }
    }

    // Parse JSON from response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from Gemini response:', cleanedResponse);
      return res.status(500).json({ 
        message: 'Failed to generate next question. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? cleanedResponse : undefined
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonMatch[0]);
      return res.status(500).json({ 
        message: 'Failed to parse response. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? jsonMatch[0] : undefined
      });
    }

    console.log('Parsed response type:', parsed.type);
    console.log('Question number:', parsed.questionNumber);

    // Validate the response structure
    if (parsed.type === 'question') {
      if (!parsed.question || !parsed.choices || !Array.isArray(parsed.choices)) {
        console.error('Invalid question structure:', parsed);
        return res.status(500).json({ message: 'Invalid question format received' });
      }
    } else if (parsed.type === 'result') {
      if (!parsed.recommendedCourse || !parsed.courseName) {
        console.error('Invalid result structure:', parsed);
        return res.status(500).json({ message: 'Invalid result format received' });
      }
      
      // Save pretest result to user profile
      try {
        await User.findByIdAndUpdate(req.user._id, {
          pretestCompleted: true,
          pretestResult: {
            recommendedCourse: parsed.recommendedCourse,
            courseName: parsed.courseName,
            analysis: parsed.analysis,
            careerProspects: parsed.careerProspects || [],
            matchPercentage: parsed.matchPercentage || 0,
            alternativeCourse: parsed.alternativeCourse,
            alternativeCourseName: parsed.alternativeCourseName,
            alternativeReason: parsed.alternativeReason,
            completedAt: new Date()
          }
        });
        console.log('Pretest result saved to user profile');
      } catch (saveError) {
        console.error('Error saving pretest result:', saveError);
        // Continue anyway, don't fail the request
      }
    }

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: cleanedResponse }
    ];

    res.json({
      response: parsed,
      conversationHistory: updatedHistory
    });
  } catch (error) {
    console.error('Pretest answer error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    // Check for specific Gemini API errors
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({ 
        message: 'AI service authentication failed. Please contact administrator.',
        error: 'Invalid API key'
      });
    }
    
    if (error.message && error.message.includes('quota')) {
      return res.status(500).json({ 
        message: 'AI service temporarily unavailable. Please try again later.',
        error: 'Rate limit exceeded'
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to process answer. Please try again.', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
