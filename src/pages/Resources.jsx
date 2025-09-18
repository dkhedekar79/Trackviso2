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
const TYPES = [
  { key: "all", label: "All" },
  { key: "past_paper", label: "Past papers" },
  { key: "specification", label: "Specification" },
];
// Recent series years commonly available online
const YEARS = ["All", 2024, 2023, 2022, 2021, 2020, 2019, 2018];

// Specification pages (official exam board specs)
const SPEC_LINKS = [
  // AQA (specifications)
  { level: "GCSE", subject: "Mathematics", board: "AQA", title: "AQA GCSE Maths (8300) — Specification", url: "https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification-at-a-glance", type: "specification" },
  { level: "A Level", subject: "Mathematics", board: "AQA", title: "AQA A-level Maths (7357) — Specification", url: "https://www.aqa.org.uk/subjects/mathematics/as-and-a-level/mathematics-7357/specification-at-a-glance", type: "specification" },
  { level: "GCSE", subject: "English Language", board: "AQA", title: "AQA GCSE English Language (8700) — Specification", url: "https://www.aqa.org.uk/subjects/english/gcse/english-language-8700/specification-at-a-glance", type: "specification" },
  { level: "A Level", subject: "Physics", board: "AQA", title: "AQA A-level Physics (7408) — Specification", url: "https://www.aqa.org.uk/subjects/science/as-and-a-level/physics-7408/specification-at-a-glance", type: "specification" },
  { level: "GCSE", subject: "Biology", board: "AQA", title: "AQA GCSE Biology (8461) — Specification", url: "https://www.aqa.org.uk/subjects/science/gcse/biology-8461/specification-at-a-glance", type: "specification" },
  { level: "GCSE", subject: "Chemistry", board: "AQA", title: "AQA GCSE Chemistry (8462) — Specification", url: "https://www.aqa.org.uk/subjects/science/gcse/chemistry-8462/specification-at-a-glance", type: "specification" },

  // Pearson Edexcel (specifications)
  { level: "GCSE", subject: "Mathematics", board: "Edexcel", title: "Edexcel GCSE Maths (9-1) — Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/mathematics-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "A Level", subject: "Mathematics", board: "Edexcel", title: "Edexcel A level Maths — Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "A Level", subject: "Physics", board: "Edexcel", title: "Edexcel A level Physics — Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/physics-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "GCSE", subject: "Biology", board: "Edexcel", title: "Edexcel GCSE Biology — Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/biology-2016.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "GCSE", subject: "Chemistry", board: "Edexcel", title: "Edexcel GCSE Chemistry — Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/chemistry-2016.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "GCSE", subject: "English Language", board: "Edexcel", title: "Edexcel GCSE English Language — Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/english-language-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },

  // OCR (specifications)
  { level: "GCSE", subject: "Mathematics", board: "OCR", title: "OCR GCSE Maths (J560) — Specification", url: "https://www.ocr.org.uk/qualifications/gcse/mathematics-j560-from-2015/specification-at-a-glance/", type: "specification" },
  { level: "A Level", subject: "Mathematics", board: "OCR", title: "OCR A Level Maths (A) — Specification", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/mathematics-a-h230-h240-from-2017/specification-at-a-glance/", type: "specification" },
  { level: "A Level", subject: "Physics", board: "OCR", title: "OCR A Level Physics (A) — Specification", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/physics-a-h156-h556-from-2015/specification-at-a-glance/", type: "specification" },
  { level: "GCSE", subject: "Biology", board: "OCR", title: "OCR GCSE Biology A (J247) — Specification", url: "https://www.ocr.org.uk/qualifications/gcse/biology-a-j247-from-2016/specification-at-a-glance/", type: "specification" },
  { level: "GCSE", subject: "Chemistry", board: "OCR", title: "OCR GCSE Chemistry A (J248) — Specification", url: "https://www.ocr.org.uk/qualifications/gcse/chemistry-a-j248-from-2016/specification-at-a-glance/", type: "specification" },
  { level: "GCSE", subject: "English Language", board: "OCR", title: "OCR GCSE English Language (J351) — Specification", url: "https://www.ocr.org.uk/qualifications/gcse/english-language-j351-from-2015/specification-at-a-glance/", type: "specification" },

  // WJEC / Eduqas (specifications)
  { level: "GCSE", subject: "Mathematics", board: "WJEC", title: "WJEC GCSE Mathematics — Specification", url: "https://qualifications.wjec.org.uk/qualifications/mathematics-gcse/", type: "specification" },
  { level: "A Level", subject: "Biology", board: "Eduqas", title: "Eduqas AS/A Level Biology — Specification", url: "https://www.eduqas.co.uk/qualifications/biology-as-a-level/", type: "specification" },
  { level: "A Level", subject: "Chemistry", board: "Eduqas", title: "Eduqas AS/A Level Chemistry — Specification", url: "https://www.eduqas.co.uk/qualifications/chemistry-as-a-level/", type: "specification" },
  { level: "GCSE", subject: "English Language", board: "Eduqas", title: "Eduqas GCSE English Language — Specification", url: "https://www.eduqas.co.uk/qualifications/english-language-gcse/", type: "specification" },
];

// Past paper hubs (official board pages that contain all years/series)
const PAST_BASES = [
  // AQA
  { level: "GCSE", subject: "Mathematics", board: "AQA", title: "AQA GCSE Maths — Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/assessment-resources" },
  { level: "A Level", subject: "Mathematics", board: "AQA", title: "AQA A-level Maths — Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/mathematics/as-and-a-level/mathematics-7357/assessment-resources" },
  { level: "GCSE", subject: "English Language", board: "AQA", title: "AQA GCSE English Language — Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/english/gcse/english-language-8700/assessment-resources" },
  { level: "GCSE", subject: "Biology", board: "AQA", title: "AQA GCSE Biology — Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/science/gcse/biology-8461/assessment-resources" },
  { level: "GCSE", subject: "Chemistry", board: "AQA", title: "AQA GCSE Chemistry — Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/science/gcse/chemistry-8462/assessment-resources" },
  { level: "A Level", subject: "Physics", board: "AQA", title: "AQA A-level Physics — Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/science/as-and-a-level/physics-7408/assessment-resources" },

  // Edexcel (Pearson) — general exam materials pages include past papers
  { level: "GCSE", subject: "Mathematics", board: "Edexcel", title: "Edexcel GCSE Maths — Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/mathematics-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "A Level", subject: "Mathematics", board: "Edexcel", title: "Edexcel A level Maths — Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "A Level", subject: "Physics", board: "Edexcel", title: "Edexcel A level Physics — Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/physics-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "GCSE", subject: "Biology", board: "Edexcel", title: "Edexcel GCSE Biology — Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/biology-2016.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "GCSE", subject: "Chemistry", board: "Edexcel", title: "Edexcel GCSE Chemistry — Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/chemistry-2016.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "GCSE", subject: "English Language", board: "Edexcel", title: "Edexcel GCSE English Language — Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/english-language-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },

  // OCR — assessment pages hold past papers
  { level: "GCSE", subject: "Mathematics", board: "OCR", title: "OCR GCSE Maths — Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/gcse/mathematics-j560-from-2015/assessment/" },
  { level: "A Level", subject: "Mathematics", board: "OCR", title: "OCR A Level Maths — Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/mathematics-a-h230-h240-from-2017/assessment/" },
  { level: "A Level", subject: "Physics", board: "OCR", title: "OCR A Level Physics — Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/physics-a-h156-h556-from-2015/assessment/" },
  { level: "GCSE", subject: "Biology", board: "OCR", title: "OCR GCSE Biology A — Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/gcse/biology-a-j247-from-2016/assessment/" },
  { level: "GCSE", subject: "Chemistry", board: "OCR", title: "OCR GCSE Chemistry A — Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/gcse/chemistry-a-j248-from-2016/assessment/" },
  { level: "GCSE", subject: "English Language", board: "OCR", title: "OCR GCSE English Language — Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/gcse/english-language-j351-from-2015/assessment/" },

  // WJEC / Eduqas
  { level: "GCSE", subject: "Mathematics", board: "WJEC", title: "WJEC GCSE Maths — Past papers", url: "https://qualifications.wjec.org.uk/qualifications/mathematics-gcse/assessment/" },
  { level: "A Level", subject: "Biology", board: "Eduqas", title: "Eduqas AS/A Level Biology — Past papers", url: "https://www.eduqas.co.uk/qualifications/biology-as-a-level/#tab_assessmentresources" },
  { level: "A Level", subject: "Chemistry", board: "Eduqas", title: "Eduqas AS/A Level Chemistry — Past papers", url: "https://www.eduqas.co.uk/qualifications/chemistry-as-a-level/#tab_assessmentresources" },
  { level: "GCSE", subject: "English Language", board: "Eduqas", title: "Eduqas GCSE English Language — Past papers", url: "https://www.eduqas.co.uk/qualifications/english-language-gcse/#tab_assessmentresources" },
];

function expandPastPapers() {
  const entries = [];
  for (const base of PAST_BASES) {
    for (const y of YEARS) {
      if (y === "All") continue;
      entries.push({ ...base, title: `${base.title} — ${y}`, type: "past_paper", year: y });
    }
    // Also include a catch-all entry without year for users who didn't pick a year
    entries.push({ ...base, type: "past_paper", year: null });
  }
  return entries;
}

const RESOURCE_DATA = [
  ...SPEC_LINKS,
  ...expandPastPapers(),
];

export default function Resources() {
  const [level, setLevel] = useState("All");
  const [subject, setSubject] = useState("All");
  const [board, setBoard] = useState("All");
  const [type, setType] = useState("all");
  const [year, setYear] = useState("All");

  const filtered = useMemo(() => {
    return RESOURCE_DATA.filter((r) =>
      (level === "All" || r.level === level) &&
      (subject === "All" || r.subject === subject) &&
      (board === "All" || r.board === board) &&
      (type === "all" || r.type === type) &&
      (type !== "past_paper" || year === "All" || r.year === year)
    );
  }, [level, subject, board, type, year]);

  return (
    <div className="min-h-screen mt-20 p-6" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--nav-to)" }}>Resources</h1>
          <p className="text-gray-600">Find syllabus pages, past papers, specifications and official guidance from UK exam boards. Filter by level, subject, board, type, and year.</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-lg border px-3 py-2 bg-white">
              <option>All</option>
              {LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-lg border px-3 py-2 bg-white">
              <option>All</option>
              {SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">Exam Board</label>
            <select value={board} onChange={(e) => setBoard(e.target.value)} className="rounded-lg border px-3 py-2 bg-white">
              <option>All</option>
              {BOARDS.map((b) => (<option key={b} value={b}>{b}</option>))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-3 py-2 bg-white">
              {TYPES.map((t) => (<option key={t.key} value={t.key}>{t.label}</option>))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">Year (past papers)</label>
            <select value={year} onChange={(e) => setYear(e.target.value === "All" ? "All" : parseInt(e.target.value))} className="rounded-lg border px-3 py-2 bg-white">
              {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <a
              key={`${r.board}-${r.level}-${r.subject}-${r.type}-${r.year ?? "any"}-${r.url}`}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl p-4 border hover:shadow transition bg-white flex flex-col"
              style={{ borderColor: "#e5e7eb" }}
            >
              <div className="text-xs font-semibold mb-1 text-gray-500">
                {r.level} • {r.subject} • {r.board} ��� {r.type === "past_paper" ? `Past papers${r.year ? ` • ${r.year}` : ""}` : "Specification"}
              </div>
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
