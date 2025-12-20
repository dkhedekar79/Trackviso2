import { generateAIJSON } from "./aiService.js";

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
    const difficulty = advanced?.subjectDifficulty?.[topic.subjectId] || 5;
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
  const preferredModel = isLongSchedule ? 'gemini-1.5-pro' : 'gemini-2.5-flash';

  const prompt = `You are a world-class educational psychologist and productivity consultant. Generate a "Perfectly Engineered" study timetable.

DURATION: ${duration} days (${startDate} to ${endDate})

USER COGNITIVE PROFILE:
- Peak Energy Window: ${advanced?.peakEnergy || 'morning'}
- Preferred Rhythm: ${advanced?.studyRhythm || 'balanced'}
- Daily "No-Go" Hours (0-23): ${advanced?.noGoZones?.join(', ') || 'None'}

TOPICS TO INCLUDE:
${subjectsWithTopics.map(subject => `
  ${subject.name}: ${subject.topics.map(t => `${t.name} (ID: ${t.id}, Conf: ${t.confidence}, Diff: ${t.difficulty}/10, Pref. Time: ${t.preferredTime})`).join(', ')}
  ${subject.examDate ? `  * EXAM DATE: ${subject.examDate} (PRIORITIZE AS DATE APPROACHES)` : ''}
`).join('\n')}

BUSY: ${busyTimes || 'None'}
EXTRA: ${instructions || 'None'}

ENGINEERING RULES:
1. BIOLOGICAL PRIME TIME: Schedule the highest "Diff" (Difficulty) and "Red" (Low Confidence) topics during the Peak Energy Window (${advanced?.peakEnergy}).
2. STUDY RHYTHM: Adhere to the ${advanced?.studyRhythm} style. 
   - Pomodoro: 30m blocks with 5m breaks.
   - Deep Work: 90-120m blocks with 15-20m breaks.
   - Block: 3-4 hours on one subject.
3. EXAM TAPERING: If an exam date is near, increase frequency/duration for that subject (Active Recall/Mocks).
4. NO-GO ZONES: Do NOT schedule anything during these typical daily hours: ${advanced?.noGoZones?.join(', ')}.
5. SPACED REPETITION: Schedule deep sessions first, then review at Day 1, 3, 7 intervals.
6. INTERLEAVING: Mix subjects daily unless "Block" rhythm is selected.
7. TOPIC NAMES & IDS (CRITICAL): 
   - Use the human-readable name (e.g., "Calculus") for the "top" field.
   - Use the provided "topic-..." string for the "tid" field. 
   - Do NOT swap them. The "top" field is what the user sees, the "tid" is for internal tracking.
8. RESOURCES: Provide specific 2-3 URLs for SaveMyExams, PMT, Khan Academy, etc.

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
          "top": "Human Readable Topic Name",
          "tid": "Original_ID_From_Topics_List",
          "dur": 60,
          "type": "study"|"practice"|"review"|"break",
          "prio": "high"|"med"|"low",
          "plan": "Specific actionable session plan",
          "res": ["Link 1", "Link 2"]
        }
      ]
    }
  ],
  "summary": {
    "studyH": <num>,
    "breakH": <num>,
    "note": "Strategy note based on the engineering profile used"
  }
}

IMPORTANT: The "plan" should reflect the study rhythm chosen. Return ONLY valid JSON.`;

  try {
    const rawSchedule = await generateAIJSON(prompt, { preferredModel });

    // Map the compact format back to the expected format
    const schedule = {
      schedule: rawSchedule.schedule.map(day => ({
        date: day.date,
        sessions: day.sessions.map(s => ({
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
        totalStudyHours: rawSchedule.summary.studyH,
        totalBreakHours: rawSchedule.summary.breakH,
        totalStudySessions: rawSchedule.schedule.reduce((acc, day) => acc + day.sessions.filter(s => s.type === 'study').length, 0),
        totalBreakSessions: rawSchedule.schedule.reduce((acc, day) => acc + day.sessions.filter(s => s.type === 'break').length, 0),
        aiStrategyNote: rawSchedule.summary.note
      }
    };

    // Validate schedule structure
    if (!schedule.schedule || !Array.isArray(schedule.schedule)) {
      throw new Error('Invalid schedule structure: missing schedule array');
    }

    // Validate each day has sessions
    schedule.schedule.forEach(day => {
      if (!day.date || !day.sessions || !Array.isArray(day.sessions)) {
        throw new Error('Invalid day structure: missing date or sessions');
      }
    });

    return schedule;
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    throw error;
  }
}

