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
    topics,
    confidenceRatings,
    topicTimes,
    advanced,
    busyTimes,
    instructions,
    startDate,
    endDate,
  } = scheduleData;

  // Build topics with confidence ratings, preferred times, and difficulty
  const topicsWithMetadata = topics.map(topic => {
    const rating = confidenceRatings[topic.id] || 'yellow';
    const difficulty = advanced?.subjectDifficulty?.[topic.id] || 5;
    return {
      ...topic,
      confidence: rating,
      difficulty,
      priority: rating === 'red' ? 'high' : rating === 'yellow' ? 'medium' : 'low',
      preferredTime: topicTimes[topic.id] || 'auto'
    };
  });

  // Organize by subject
  const subjectsWithTopics = subjects.map(subject => ({
    ...subject,
    topics: topicsWithMetadata.filter(t => t.subjectId === subject.id),
    examDate: advanced?.examDates?.[subject.id] || null,
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
- Daily "No-Go" Hours (0-23): ${advanced?.noGoZones?.length > 0 ? advanced.noGoZones.join(', ') : 'None (Use standard hours)'}

TOPICS TO INCLUDE:
${subjectsWithTopics.map(subject => `
  ${subject.name}: ${subject.topics.map(t => `${t.name} (ID: ${t.id}, Conf: ${t.confidence}, Diff: ${t.difficulty}/10, Pref. Time: ${t.preferredTime})`).join(', ')}
  ${subject.examDate ? `  * EXAM DATE: ${subject.examDate} (PRIORITIZE AS DATE APPROACHES)` : ''}
`).join('\n')}

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
2. ⚡ STUDY RHYTHM: Adhere to the ${advanced?.studyRhythm} style:
   - Pomodoro: 30m blocks with 5m breaks.
   - Deep Work: 90-120m blocks with 15-20m breaks.
   - Balanced: 45-60m blocks with 10-15m breaks.
   - Subject Block: 3-4 hours on one subject with internal breaks.
3. 📅 EXAM TAPERING: If an exam date is near, increase frequency/duration for that subject.
   - Strategy [short-term-exam]: INTENSIVE. Maximize study sessions, minimal breaks, focus on past papers.
   - Strategy [long-term-exam]: STEADY. Balanced approach, focus on foundation and understanding.
   - Strategy [balanced]: REGULAR. Mix of revision and new learning.
4. 🚫 NO-GO ZONES: Do NOT schedule anything during: ${advanced?.noGoZones?.join(', ') || '0-7 (sleep)'}.
5. 🧬 SPACED REPETITION: Schedule intensive sessions first, followed by review sessions at spaced intervals.
6. 🔀 INTERLEAVING: Mix subjects daily unless "Block" rhythm is selected to prevent cognitive fatigue.
7. 🕐 FILL THE TIME: Generate a complete schedule for each day that fills the user's available study time.

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

