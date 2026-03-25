const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
      return res.status(500).json({ message: 'AI service not configured. Please contact administrator.' });
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

    console.log('Calling Gemini API...');
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    console.log('Gemini raw response:', responseText);
    
    // Clean the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
    cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    cleanedResponse = cleanedResponse.trim();
    
    // Parse JSON from response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from Gemini response:', cleanedResponse);
      return res.status(500).json({ 
        message: 'Failed to generate question. Please try again.',
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
    res.status(500).json({ 
      message: 'Failed to start pretest. Please try again.', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

    console.log('Calling Gemini API for next question...');
    
    let result;
    if (chatHistory.length > 0) {
      const chat = model.startChat({ history: chatHistory });
      result = await chat.sendMessage(userMessage);
    } else {
      // First interaction, use generateContent
      result = await model.generateContent(userMessage);
    }
    
    const responseText = result.response.text();
    console.log('Gemini raw response:', responseText);

    // Clean the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
    cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    cleanedResponse = cleanedResponse.trim();

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
