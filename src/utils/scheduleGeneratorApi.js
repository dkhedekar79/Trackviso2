import { generateAIJSON } from "./aiService.js";

/**
 * Fuzzy topic matching - allows partial matches to avoid rejecting valid AI-generated topics
 */
function isValidTopicFuzzy(sessionTopic, validTopicNames) {
  const normalize = (str) => str.toLowerCase().trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  const normalizedSession = normalize(sessionTopic);
  
  // Exact match first
  for (const validTopic of validTopicNames) {
    if (normalize(validTopic) === normalizedSession) return true;
  }
  
  // Partial match - check if session topic is a substring or contains key words
  const sessionWords = normalizedSession.split(' ').filter(w => w.length > 2);
  
  for (const validTopic of validTopicNames) {
    const validNormalized = normalize(validTopic);
    const validWords = validNormalized.split(' ').filter(w => w.length > 2);
    
    // Check if session topic is a prefix/substring
    if (validNormalized.includes(normalizedSession) || normalizedSession.includes(validNormalized)) {
      return true;
    }
    
    // Check word overlap - if 60%+ of session words appear in valid topic, accept it
    const matchingWords = sessionWords.filter(w => validWords.includes(w) || validNormalized.includes(w));
    const matchRatio = sessionWords.length > 0 ? matchingWords.length / sessionWords.length : 0;
    
    if (matchRatio >= 0.6 && matchingWords.length >= 2) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate an AI-powered study schedule based on user inputs
 */
export async function generateAISchedule(scheduleData) {
  const {
    duration,
    subjects,
    subjectModes = {},
    topics,
    confidenceRatings,
    topicReasoning = {},
    topicTimes,
    homeworks = [],
    schoolSchedule = {},
    advanced,
    busyTimes,
    instructions,
    startDate,
    endDate,
  } = scheduleData;

  // Build topics with confidence ratings, preferred times, and difficulty
  const topicsWithMetadata = topics.map(topic => {
    const rating = confidenceRatings[topic.id] || 'yellow';
    const difficulty = advanced?.subjectDifficulty?.[topic.subjectId] || 5;
    return {
      ...topic,
      confidence: rating,
      difficulty,
      reasoning: topicReasoning[topic.id] || '',
      priority: rating === 'red' ? 'high' : rating === 'yellow' ? 'medium' : 'low',
      preferredTime: topicTimes[topic.id] || 'auto'
    };
  });

  // Organize by subject
  const subjectsWithTopics = subjects.map(subject => ({
    ...subject,
    topics: topicsWithMetadata.filter(t => t.subjectId === subject.id),
    examDate: advanced?.examDates?.[subject.id] || null,
    mode: subjectModes[subject.id] || 'no-exam',
    difficulty: advanced?.subjectDifficulty?.[subject.id] || 5
  }));

  const isLongSchedule = duration > 7;
  const preferredModel = isLongSchedule ? 'gemini-1.5-pro' : 'gemini-2.5-flash-lite';

  const prompt = `You are a world-class educational psychologist and productivity consultant specializing in GCSE/A-Level revision strategies. Generate a "Perfectly Engineered" study timetable.

**CRITICAL PRINCIPLE: PERSONALIZATION NOT ASSUMPTIONS**
Use ONLY the preferences and data provided for this specific user.

DURATION: ${duration} days (${startDate} to ${endDate})

USER COGNITIVE PROFILE:
- Peak Energy Window: ${advanced?.peakEnergy || 'morning'}
- Preferred Rhythm: ${advanced?.studyRhythm || 'balanced'}
- Timetable Strategy: ${advanced?.timetableMode || 'balanced'}
- Daily "No-Go" Hours (0-23): ${advanced?.noGoZones?.length > 0 ? advanced.noGoZones.join(', ') : 'None'}

🏫 SCHOOL SCHEDULE (Mon-Fri):
- School Hours: ${schoolSchedule.start || '08:30'} to ${schoolSchedule.end || '15:30'}
- Study Before School: ${schoolSchedule.studyBefore ? 'YES' : 'NO'}
- Study During Lunch: ${schoolSchedule.studyLunch ? 'YES' : 'NO'}
- Study During Free Periods: ${schoolSchedule.studyFree ? 'YES' : 'NO'}

TOPICS TO INCLUDE:
${subjectsWithTopics.map(subject => `
  ${subject.name} (${subject.mode.toUpperCase()}): ${subject.topics.map(t => `${t.name} (ID: ${t.id}, Conf: ${t.confidence}, Diff: ${t.difficulty}/10${t.reasoning ? `, Struggles: "${t.reasoning}"` : ''}, Pref. Time: ${t.preferredTime})`).join(', ')}
  ${subject.examDate ? `  * EXAM DATE: ${subject.examDate} (PRIORITIZE AS DATE APPROACHES)` : ''}
`).join('\n')}

🚨 HOMEWORK ASSIGNMENTS (MANDATORY DEADLINES):
${homeworks.length > 0 ? homeworks.map(hw => `- "${hw.title}" for ${subjects.find(s => s.id === hw.subjectId)?.name || 'Subject'}, DUE: ${hw.dueDate}, DURATION: ${hw.duration} mins`).join('\n') : 'None'}

USER BUSY TIMES: ${busyTimes || 'None'}
USER CUSTOM INSTRUCTIONS: ${instructions || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: USE EXACT TOPIC NAMES - MANDATORY ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST use the EXACT topic names provided in the topics list above.
DO NOT paraphrase, shorten, or modify topic names.
The "tid" field MUST contain the exact original ID string provided.

ENGINEERING RULES:
1. 🧠 BIOLOGICAL PRIME TIME: Schedule the highest "Diff" (Difficulty) and "Red" (Low Confidence) topics during the Peak Energy Window (${advanced?.peakEnergy}).
2. ⚡ STUDY RHYTHM: Adhere to the ${advanced?.studyRhythm} style.
3. 🏫 SCHOOL BLOCKING: On weekdays, do NOT schedule revision during ${schoolSchedule.start || '08:30'}-${schoolSchedule.end || '15:30'} unless explicitly enabled (e.g. Lunch/Free periods).
4. 📝 HOMEWORK DEADLINES: Homework MUST be scheduled BEFORE its due date. Never on the due date. Prioritize homework with sooner deadlines.
5. 📏 VARIABLE DURATION: Calculate session duration based on priority: Duration = 30 + (priority_score × 6) minutes. High priority (Red/Difficulty 7+) topics get 60-90m.
6. 📅 EXAM TAPERING: Adjust intensity based on subject mode:
   - short-term-exam: Intensive (60-90m sessions), frequent repetition (every 2-3 days).
   - long-term-exam: Balanced (45-60m sessions), spaced repetition (every 4-6 days).
   - no-exam: Light reinforcement, homework takes priority.
7. 🧬 SPACED REPETITION: Mix subjects daily (Interleaving) to prevent cognitive overload.
8. 🕐 FILL THE TIME: Fill the available study window for each day completely.

OUTPUT JSON FORMAT (STRICT):
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "start": "HH:MM",
          "end": "HH:MM",
          "sub": "Subject Name",
          "top": "EXACT Human Readable Topic Name",
          "tid": "Original_ID_From_Topics_List",
          "dur": minutes,
          "type": "study"|"practice"|"review"|"break",
          "prio": "high"|"med"|"low",
          "plan": "Specific actionable session plan including active recall/spaced repetition techniques",
          "res": ["Link 1", "Link 2"]
        }
      ]
    }
  ],
  "summary": {
    "studyH": <total_study_hours>,
    "breakH": <total_break_hours>,
    "note": "Strategy note explaining how this schedule optimizes for the user's ${advanced?.peakEnergy} energy and ${advanced?.studyRhythm} rhythm"
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown fences. Ensure all quotes are balanced.`;

  try {
    const rawSchedule = await generateAIJSON(prompt, { preferredModel });

    // CRITICAL: Validate and Filter topics to prevent hallucinations
    const validTopicNames = new Set(topics.map(t => t.name.toLowerCase().trim()));
    const validTopicIds = new Set(topics.map(t => t.id));

    // Map and Validate the format
    const schedule = {
      schedule: rawSchedule.schedule.map(day => ({
        date: day.date,
        sessions: day.sessions.filter(s => {
          if (s.type === 'break') return true;
          
          // Fuzzy validation for topic names
          const isValid = isValidTopicFuzzy(s.top, validTopicNames) || validTopicIds.has(s.tid);
          if (!isValid) {
            console.warn(`Filtering hallucinated topic: ${s.top}`);
          }
          return isValid;
        }).map(s => ({
          startTime: s.start,
          endTime: s.end,
          subject: s.sub,
          topic: s.top,
          topicId: s.tid,
          duration: s.dur,
          type: s.type,
          priority: s.prio === 'med' ? 'medium' : s.prio === 'high' ? 'high' : 'low',
          detailedPlan: s.plan,
          resources: s.res || []
        }))
      })),
      summary: {
        totalStudyHours: rawSchedule.summary?.studyH || 0,
        totalBreakHours: rawSchedule.summary?.breakH || 0,
        totalStudySessions: rawSchedule.schedule?.reduce((acc, day) => acc + (day.sessions?.filter(s => s.type !== 'break').length || 0), 0) || 0,
        totalBreakSessions: rawSchedule.schedule?.reduce((acc, day) => acc + (day.sessions?.filter(s => s.type === 'break').length || 0), 0) || 0,
        aiStrategyNote: rawSchedule.summary?.note || "Standard optimized schedule"
      }
    };

    // Final structure validation
    if (!schedule.schedule || !Array.isArray(schedule.schedule)) {
      throw new Error('Invalid schedule structure: missing schedule array');
    }

    return schedule;
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    throw error;
  }
}

