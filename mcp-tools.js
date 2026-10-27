// MCP Tools for HELP HER Mentor Discovery
// This file contains the search_mentors tool and fictional mentor data

const { z } = require('zod');

// Fictional mentor profiles (all opted in for discovery)
// Full dataset stored separately - only 6 selected for demo display
const allMentors = [
  {
    id: 'mentor-001',
    displayName: 'Sarah Chen',
    expertise: ['Web Development', 'JavaScript', 'React'],
    languages: ['English', 'Mandarin'],
    experienceLevel: 'senior',
    mentoringTopics: ['Frontend development', 'Career guidance', 'Code review'],
    optedIn: true
  },
  {
    id: 'mentor-002',
    displayName: 'MARIA MARIA',
    expertise: ['Data Science', 'Python', 'Machine Learning'],
    languages: ['English', 'Spanish'],
    experienceLevel: 'intermediate',
    mentoringTopics: ['Data analysis', 'Python basics', 'ML fundamentals'],
    optedIn: true
  },
  {
    id: 'mentor-003',
    displayName: 'Aisha Patel',
    expertise: ['Mobile Development', 'iOS', 'Swift'],
    languages: ['English', 'Hindi'],
    experienceLevel: 'senior',
    mentoringTopics: ['iOS app development', 'Swift programming', 'App design'],
    optedIn: true
  },
  {
    id: 'mentor-004',
    displayName: 'Yuki Tanaka',
    expertise: ['Cloud Computing', 'AWS', 'DevOps'],
    languages: ['English', 'Japanese'],
    experienceLevel: 'senior',
    mentoringTopics: ['AWS services', 'CI/CD pipelines', 'Cloud architecture'],
    optedIn: true
  },
  {
    id: 'mentor-005',
    displayName: 'Emma Wilson',
    expertise: ['UI/UX Design', 'Figma', 'User Research'],
    languages: ['English'],
    experienceLevel: 'intermediate',
    mentoringTopics: ['Design principles', 'Figma basics', 'User testing'],
    optedIn: true
  },
  {
    id: 'mentor-006',
    displayName: 'HOUDA HOUDA',
    expertise: ['Cybersecurity', 'Network Security', 'Ethical Hacking'],
    languages: ['English', 'Arabic'],
    experienceLevel: 'senior',
    mentoringTopics: ['Security basics', 'Network protection', 'Secure coding'],
    optedIn: true
  },
  {
    id: 'mentor-007',
    displayName: 'Priya Sharma',
    expertise: ['Python', 'Data Analysis', 'Pandas'],
    languages: ['English', 'Hindi'],
    experienceLevel: 'beginner',
    mentoringTopics: ['Python fundamentals', 'Data cleaning', 'Basic statistics'],
    optedIn: true
  },
  {
    id: 'mentor-008',
    displayName: 'FATIMA FATIMA',
    expertise: ['Web Development', 'HTML/CSS', 'JavaScript'],
    languages: ['English', 'Arabic'],
    experienceLevel: 'intermediate',
    mentoringTopics: ['HTML/CSS basics', 'JavaScript fundamentals', 'Responsive design'],
    optedIn: true
  },
  {
    id: 'mentor-009',
    displayName: 'Grace Kim',
    expertise: ['Backend Development', 'Node.js', 'Databases'],
    languages: ['English', 'Korean'],
    experienceLevel: 'senior',
    mentoringTopics: ['Node.js', 'SQL databases', 'API design'],
    optedIn: true
  },
  {
    id: 'mentor-010',
    displayName: 'Ngozi Okafor',
    expertise: ['Artificial Intelligence', 'Python', 'TensorFlow'],
    languages: ['English'],
    experienceLevel: 'intermediate',
    mentoringTopics: ['AI concepts', 'TensorFlow basics', 'Neural networks'],
    optedIn: true
  },
  {
    id: 'mentor-011',
    displayName: 'Elena Petrov',
    expertise: ['Software Testing', 'QA', 'Automation'],
    languages: ['English', 'Russian'],
    experienceLevel: 'intermediate',
    mentoringTopics: ['Testing strategies', 'Test automation', 'Bug tracking'],
    optedIn: true
  },
  {
    id: 'mentor-012',
    displayName: 'Hana Sato',
    expertise: ['Game Development', 'Unity', 'C#'],
    languages: ['English', 'Japanese'],
    experienceLevel: 'senior',
    mentoringTopics: ['Unity basics', 'C# programming', 'Game design'],
    optedIn: true
  }
];

// Selected 6 mentors for demo display (diverse tech fields and languages, no Russian/Mandarin)
const mentors = [
  allMentors[1],  // MARIA MARIA - Data Science, English/Spanish
  allMentors[2],  // Aisha Patel - Mobile Development, English/Hindi
  allMentors[4],  // Emma Wilson - UI/UX Design, English
  allMentors[5],  // HOUDA HOUDA - Cybersecurity, English/Arabic
  allMentors[7],  // FATIMA FATIMA - Web Development, English/Arabic
  allMentors[9]   // Ngozi Okafor - AI, English
];

// Input schema for search_mentors tool
const searchMentorsSchema = z.object({
  technologyField: z.string().optional().describe('The technology field to search for (e.g., "Web Development", "Python")'),
  language: z.string().optional().describe('Preferred language (e.g., "English", "Spanish")'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'senior']).optional().describe('Mentor experience level')
});

// Search mentors function
function searchMentors(args) {
  const { technologyField, language, experienceLevel } = args;
  
  // Filter mentors who have opted in
  let results = mentors.filter(mentor => mentor.optedIn);
  
  // Apply filters
  if (technologyField) {
    const fieldLower = technologyField.toLowerCase();
    results = results.filter(mentor =>
      mentor.expertise.some(exp => exp.toLowerCase().includes(fieldLower))
    );
  }
  
  if (language) {
    const langLower = language.toLowerCase();
    results = results.filter(mentor =>
      mentor.languages.some(lang => lang.toLowerCase().includes(langLower))
    );
  }
  
  if (experienceLevel) {
    results = results.filter(mentor => mentor.experienceLevel === experienceLevel);
  }
  
  // Return only public fields
  return results.map(mentor => ({
    displayName: mentor.displayName,
    expertise: mentor.expertise,
    languages: mentor.languages,
    mentoringTopics: mentor.mentoringTopics
  }));
}

module.exports = {
  searchMentors,
  searchMentorsSchema,
  mentors
};
