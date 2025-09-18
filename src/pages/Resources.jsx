import React, { useMemo, useState } from "react";

const LEVELS = ["GCSE", "A Level"];
const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Biology",
  "Chemistry",
  "Physics",
];
const BOARDS = ["AQA", "Edexcel", "OCR", "WJEC", "Eduqas"];

// Curated resource links to official exam boards (no bonuses, no placeholders)
const RESOURCE_DATA = [
  // AQA
  { level: "GCSE", subject: "Mathematics", board: "AQA", title: "AQA GCSE Maths (8300)", url: "https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300" },
  { level: "A Level", subject: "Mathematics", board: "AQA", title: "AQA A-level Maths (7357)", url: "https://www.aqa.org.uk/subjects/mathematics/as-and-a-level/mathematics-7357" },
  { level: "GCSE", subject: "English Language", board: "AQA", title: "AQA GCSE English Language (8700)", url: "https://www.aqa.org.uk/subjects/english/gcse/english-language-8700" },
  { level: "A Level", subject: "Physics", board: "AQA", title: "AQA A-level Physics (7408)", url: "https://www.aqa.org.uk/subjects/science/as-and-a-level/physics-7408" },
  { level: "GCSE", subject: "Biology", board: "AQA", title: "AQA GCSE Biology (8461)", url: "https://www.aqa.org.uk/subjects/science/gcse/biology-8461" },
  { level: "GCSE", subject: "Chemistry", board: "AQA", title: "AQA GCSE Chemistry (8462)", url: "https://www.aqa.org.uk/subjects/science/gcse/chemistry-8462" },

  // Pearson Edexcel
  { level: "GCSE", subject: "Mathematics", board: "Edexcel", title: "Edexcel GCSE Maths (9-1)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/mathematics-2015.html" },
  { level: "A Level", subject: "Mathematics", board: "Edexcel", title: "Edexcel A level Maths (2017)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html" },
  { level: "A Level", subject: "Physics", board: "Edexcel", title: "Edexcel A level Physics (2015)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/physics-2015.html" },
  { level: "GCSE", subject: "Biology", board: "Edexcel", title: "Edexcel GCSE Biology (2016)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/biology-2016.html" },
  { level: "GCSE", subject: "Chemistry", board: "Edexcel", title: "Edexcel GCSE Chemistry (2016)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/chemistry-2016.html" },
  { level: "GCSE", subject: "English Language", board: "Edexcel", title: "Edexcel GCSE English Language (2015)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/english-language-2015.html" },

  // OCR
  { level: "GCSE", subject: "Mathematics", board: "OCR", title: "OCR GCSE Maths (J560)", url: "https://www.ocr.org.uk/qualifications/gcse/mathematics-j560-from-2015/" },
  { level: "A Level", subject: "Mathematics", board: "OCR", title: "OCR A Level Maths (A) (H230/H240)", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/mathematics-a-h230-h240-from-2017/" },
  { level: "A Level", subject: "Physics", board: "OCR", title: "OCR A Level Physics (A) (H156/H556)", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/physics-a-h156-h556-from-2015/" },
  { level: "GCSE", subject: "Biology", board: "OCR", title: "OCR GCSE Biology A (J247)", url: "https://www.ocr.org.uk/qualifications/gcse/biology-a-j247-from-2016/" },
  { level: "GCSE", subject: "Chemistry", board: "OCR", title: "OCR GCSE Chemistry A (J248)", url: "https://www.ocr.org.uk/qualifications/gcse/chemistry-a-j248-from-2016/" },
  { level: "GCSE", subject: "English Language", board: "OCR", title: "OCR GCSE English Language (J351)", url: "https://www.ocr.org.uk/qualifications/gcse/english-language-j351-from-2015/" },

  // WJEC / Eduqas
  { level: "GCSE", subject: "Mathematics", board: "WJEC", title: "WJEC GCSE Mathematics", url: "https://qualifications.wjec.org.uk/qualifications/mathematics-gcse/" },
  { level: "A Level", subject: "Biology", board: "Eduqas", title: "Eduqas AS/A Level Biology", url: "https://www.eduqas.co.uk/qualifications/biology-as-a-level/" },
  { level: "A Level", subject: "Chemistry", board: "Eduqas", title: "Eduqas AS/A Level Chemistry", url: "https://www.eduqas.co.uk/qualifications/chemistry-as-a-level/" },
  { level: "GCSE", subject: "English Language", board: "Eduqas", title: "Eduqas GCSE English Language", url: "https://www.eduqas.co.uk/qualifications/english-language-gcse/" },
];

export default function Resources() {
  const [level, setLevel] = useState("All");
  const [subject, setSubject] = useState("All");
  const [board, setBoard] = useState("All");

  const filtered = useMemo(() => {
    return RESOURCE_DATA.filter((r) =>
      (level === "All" || r.level === level) &&
      (subject === "All" || r.subject === subject) &&
      (board === "All" || r.board === board)
    );
  }, [level, subject, board]);

  return (
    <div className="min-h-screen mt-20 p-6" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--nav-to)" }}>Resources</h1>
          <p className="text-gray-600">Find syllabus pages, past papers, specifications and official guidance from UK exam boards. Filter by level, subject and board.</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-lg border px-3 py-2 bg-white"
            >
              <option>All</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border px-3 py-2 bg-white"
            >
              <option>All</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">Exam Board</label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="rounded-lg border px-3 py-2 bg-white"
            >
              <option>All</option>
              {BOARDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <a
              key={`${r.board}-${r.level}-${r.subject}-${r.url}`}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl p-4 border hover:shadow transition bg-white flex flex-col"
              style={{ borderColor: "#e5e7eb" }}
            >
              <div className="text-xs font-semibold mb-1 text-gray-500">{r.level} • {r.subject} • {r.board}</div>
              <div className="text-lg font-semibold mb-2" style={{ color: "var(--primary)" }}>{r.title}</div>
              <div className="mt-auto text-sm text-blue-600">Open official page →</div>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-gray-500 text-center py-16">No resources found. Try different filters.</div>
        )}
      </div>
    </div>
  );
}
