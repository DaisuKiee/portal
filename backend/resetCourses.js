require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const resetCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB Connected');

    // Delete all existing courses
    const deleteResult = await Course.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing courses`);

    // Insert new courses
    const defaultCourses = [
      {
        code: 'BSIT',
        name: 'Bachelor of Science in Information Technology',
        description: 'Focuses on software development, web development, database management, and IT systems.',
        careerProspects: ['Software Developer', 'Web Developer', 'IT Support Specialist', 'Database Administrator', 'Systems Analyst', 'Network Administrator'],
        keywords: ['technology', 'computers', 'programming', 'software', 'web', 'coding', 'internet', 'digital', 'apps']
      },
      {
        code: 'BSIE',
        name: 'Bachelor of Science in Industrial Engineering',
        description: 'Focuses on optimizing complex processes, systems, and organizations through engineering principles and management.',
        careerProspects: ['Industrial Engineer', 'Process Engineer', 'Quality Control Manager', 'Production Manager', 'Operations Analyst', 'Supply Chain Manager'],
        keywords: ['engineering', 'manufacturing', 'processes', 'optimization', 'systems', 'production', 'efficiency', 'management', 'problem-solving']
      },
      {
        code: 'BIT-COMTECH',
        name: 'Bachelor in Industrial Technology - Computer Technology',
        description: 'Focuses on computer hardware, networking, troubleshooting, and technical support.',
        careerProspects: ['Computer Technician', 'Network Technician', 'IT Support', 'Hardware Specialist', 'Technical Support Engineer'],
        keywords: ['computers', 'hardware', 'repair', 'networking', 'technical', 'troubleshooting', 'fixing', 'maintenance']
      },
      {
        code: 'BIT-ELECTRONICS',
        name: 'Bachelor in Industrial Technology - Electronics Technology',
        description: 'Focuses on electronic systems, circuits, devices, and telecommunications.',
        careerProspects: ['Electronics Technician', 'Telecommunications Specialist', 'Electronics Engineer', 'Instrumentation Technician', 'Service Technician'],
        keywords: ['electronics', 'circuits', 'devices', 'telecommunications', 'technical', 'gadgets', 'repair', 'systems']
      },
      {
        code: 'BIT-AUTOMOTIVE',
        name: 'Bachelor in Industrial Technology - Automotive Technology',
        description: 'Focuses on vehicle maintenance, repair, diagnostics, and automotive systems.',
        careerProspects: ['Automotive Technician', 'Mechanic', 'Service Advisor', 'Automotive Engineer', 'Shop Owner', 'Vehicle Inspector'],
        keywords: ['automotive', 'cars', 'vehicles', 'mechanic', 'repair', 'engines', 'maintenance', 'driving', 'machines']
      },
      {
        code: 'BEED',
        name: 'Bachelor of Elementary Education',
        description: 'Prepares students to become licensed professional teachers for elementary education (Grades 1-6).',
        careerProspects: ['Elementary Teacher', 'School Administrator', 'Education Specialist', 'Day Care Teacher', 'Tutorial Center Owner', 'Curriculum Developer'],
        keywords: ['teaching', 'children', 'elementary', 'education', 'nurturing', 'kids', 'learning', 'helping', 'young students']
      },
      {
        code: 'BSED',
        name: 'Bachelor of Secondary Education',
        description: 'Prepares students to become licensed professional teachers for secondary education (high school level).',
        careerProspects: ['High School Teacher', 'School Administrator', 'Education Specialist', 'Curriculum Developer', 'Guidance Counselor', 'Subject Coordinator'],
        keywords: ['teaching', 'education', 'helping', 'students', 'learning', 'mentoring', 'school', 'teenagers', 'high school']
      },
      {
        code: 'BTLED',
        name: 'Bachelor of Technology and Livelihood Education',
        description: 'Prepares students to teach technical and vocational subjects in secondary schools.',
        careerProspects: ['TLE Teacher', 'Vocational Instructor', 'Skills Trainer', 'Technical Education Specialist', 'Entrepreneurship Teacher'],
        keywords: ['teaching', 'technical', 'vocational', 'skills', 'livelihood', 'hands-on', 'practical', 'training', 'entrepreneurship']
      },
      {
        code: 'BSHM',
        name: 'Bachelor of Science in Hospitality Management',
        description: 'Focuses on hotel and restaurant management, tourism, food service, and the hospitality industry.',
        careerProspects: ['Hotel Manager', 'Restaurant Manager', 'Event Planner', 'Tourism Officer', 'Chef', 'Resort Manager', 'Food Service Manager'],
        keywords: ['hospitality', 'hotel', 'restaurant', 'food', 'cooking', 'tourism', 'travel', 'service', 'events', 'customer service']
      }
    ];

    await Course.insertMany(defaultCourses);
    console.log(`✓ Inserted ${defaultCourses.length} new courses`);

    console.log('\nCourses reset successfully!');
    console.log('You can now restart the backend server.');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting courses:', error);
    process.exit(1);
  }
};

resetCourses();
