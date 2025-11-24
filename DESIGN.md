# Resume Tailor Tool - Design Document

## Overview
A WASABI custom tool that generates tailored resumes based on job descriptions using AI.

## ✅ Requirements (Confirmed)

### Input
- **Base Template**: LaTeX file using AltaCV class (already in `base/main.tex`)
- **Job Description**: Copy-pasted text directly into tool
- **Resume Content**: Structured data (name, experience, skills, projects, etc.)

### AI Behavior
- **Creativity Level**: MODERATE
  - Rewrite bullet points to include job description keywords
  - Keep all facts accurate and truthful
  - No fabrication of experience or skills
  - Emphasize relevant experience over less relevant ones

### Target
- **Single page** resume
- **ATS-friendly** format (no fancy graphics, clear structure, keyword optimization)

### Sections to Tailor
1. **Skills** - Match keywords and prioritize relevant skills
2. **Work Experience** - Rewrite/reorder bullets to highlight relevant achievements
3. **Projects** - Adjust descriptions to match job requirements
4. **Professional Summary** - Craft targeted tagline/summary

### Sections to Keep Static
- Education
- Publications
- Achievements
- Contact information

### Output
1. **Tailored `.tex` file** - Ready to compile
2. **PDF** - Compiled using pdflatex
3. **Analysis Report** - Markdown file explaining:
   - Key requirements extracted from job description
   - Changes made to each section
   - Keywords added
   - Bullets modified/reordered
   - Recommendations for manual review

---

## Technical Design

### Tool Architecture

```typescript
ResumeTailorTool
├── Input Validation
│   ├── Check base template exists
│   └── Validate job description text
├── AI Analysis Phase
│   ├── Extract job requirements/keywords
│   ├── Identify matching experience from base content
│   └── Generate relevance scores
├── AI Tailoring Phase
│   ├── Generate targeted professional summary
│   ├── Rewrite experience bullets with keywords
│   ├── Prioritize and filter skills
│   └── Adjust project descriptions
├── LaTeX Generation
│   ├── Parse base template structure
│   ├── Inject tailored content
│   └── Ensure single-page compliance
├── Compilation
│   ├── Run pdflatex
│   └── Handle compilation errors
└── Analysis Report
    ├── Document changes made
    └── Provide recommendations
```

### File Structure

```
resume-tailor-tool/
├── DESIGN.md                    # This document
├── base/
│   ├── main.tex                 # Your base LaTeX template
│   └── resume-content.json      # Structured resume data
├── examples/
│   ├── sample-jd.txt            # Sample job description
│   └── sample-output/           # Example outputs
│       ├── tailored-resume.tex
│       ├── tailored-resume.pdf
│       └── analysis-report.md
├── tool/
│   └── ResumeTailorTool.ts      # Tool implementation
└── README.md                    # Usage guide
```

---

## Data Model

### Resume Content Structure (JSON)

```json
{
  "personalInfo": {
    "name": "Raghu Raj Sodani",
    "tagline": "Software Development Engineer",
    "email": "sodaniraghuraj@gmail.com",
    "phone": "+91-9928486320",
    "linkedin": "raghusodani",
    "github": "raghusodani",
    "twitter": "sodaniraghuraj"
  },
  "experience": [
    {
      "title": "Software Development Engineer",
      "company": "Amazon",
      "location": "Identity Services / CS Stores Fixed Corporate",
      "duration": "May 2024 - now",
      "bullets": [
        "Designed Data Pipeline for transferring data from DynamoDB...",
        "Built an end-to-end Amazon Customer Service landing page..."
      ],
      "skills": ["Java", "React", "GraphQL", "DynamoDB", "Spring"]
    }
  ],
  "projects": [
    {
      "name": "ISRO Safe Ship Nav",
      "technologies": ["Python", "Django-RestAPI", "React.js"],
      "bullets": [
        "Utilized ISRO's dataset to determine optimal path...",
        "Developed comprehensive graph..."
      ]
    }
  ],
  "skills": {
    "programmingLanguages": ["Java", "C++", "TypeScript", "JavaScript", "Python"],
    "frameworks": ["AWS CDK", "Spring/SpringBoot", "ReactJs", "Redux"],
    "cloudServices": ["AWS S3", "AWS DynamoDB", "AWS Lambda"],
    "databases": ["MongoDB", "SQL", "PostgreSQL", "GraphQL"],
    "other": ["System Design", "Code Reviews", "Competitive Programming"]
  },
  "education": {
    "degree": "B.Tech in CSE",
    "institution": "Indian Institute of Information Technology, Vadodara",
    "duration": "August 2019 -- May 2023",
    "gpa": "8.1/10"
  },
  "publications": [
    {
      "title": "An Optimization Ontology for Goal Modelling Frameworks",
      "url": "https://link.springer.com/chapter/10.1007/978-3-031-26886-1_6",
      "venue": "IDAMS 2022"
    }
  ],
  "achievements": [
    "INMO 2019 Scholar (Indian National Mathematics Olympiad)",
    "FileCoin track winners of Hackathon organised by Devfolio",
    "Codechef: 5 star (max rating 2040)"
  ]
}
```

---

## AI Prompt Strategy

### Phase 1: Job Analysis
```
Analyze this job description and extract:
1. Required technical skills (5-10 most important)
2. Desired experience level and domains
3. Key responsibilities
4. Important keywords for ATS
5. Company culture/values mentioned
```

### Phase 2: Content Tailoring
```
Given:
- Job requirements: [from Phase 1]
- Base resume content: [structured JSON]
- Constraint: Single page, ATS-friendly

Tailor the resume by:
1. Crafting a targeted professional summary (1 line)
2. Rewriting experience bullets to include keywords
3. Prioritizing relevant skills (max 15-20 skills)
4. Adjusting project descriptions
5. Keeping education/achievements unchanged

Rules:
- Be truthful - no fabrication
- Use action verbs and quantifiable results
- Match job description terminology
- Optimize for ATS keyword matching
- Ensure content fits on one page
```

---

## Analysis Report Format

```markdown
# Resume Tailoring Analysis Report

## Job Analysis

### Key Requirements Identified
1. [Requirement 1]
2. [Requirement 2]
...

### Critical Keywords
- [keyword1], [keyword2], [keyword3]...

### Experience Level
[Entry/Mid/Senior] - [Domain/Industry]

---

## Changes Made

### Professional Summary
**Before**: [original tagline]
**After**: [new targeted tagline]
**Rationale**: [why this change]

### Skills Section
**Added Keywords**: [skill1, skill2, skill3]
**Prioritized**: [skill1, skill2] (moved to top)
**Removed/Deprioritized**: [skill1, skill2] (less relevant)

### Work Experience

#### [Job Title] at [Company]
- **Bullet 1**:
  - Original: [original text]
  - Tailored: [new text]
  - Keywords added: [keyword1, keyword2]

- **Bullet 2**:
  - [similar format]

### Projects
[Similar format to experience]

---

## ATS Optimization Score
Keyword Match: [X/Y keywords matched]
Estimated ATS Score: [High/Medium/Low]

---

## Recommendations
1. [Manual review suggestion 1]
2. [Manual review suggestion 2]
3. [Additional improvements]

---

## Summary
Successfully tailored resume for [Job Title] at [Company].
Focus areas: [area1, area2, area3]
```

---

## Implementation Plan

### Step 1: Create Resume Content JSON
Extract all content from base template into structured JSON format.

### Step 2: Implement Core Tool
- File I/O operations
- AI integration (Bedrock)
- LaTeX manipulation
- PDF compilation

### Step 3: Testing
- Test with sample job descriptions
- Verify single-page output
- Check ATS compatibility
- Validate analysis report

### Step 4: Refinement
- Adjust AI prompts based on results
- Fine-tune content selection
- Optimize page layout

---

## Next Steps

1. ✅ Review base template structure
2. ⏳ Create resume-content.json from main.tex
3. ⏳ Implement ResumeTailorTool.ts
4. ⏳ Create example job description
5. ⏳ Test and iterate
6. ⏳ Document usage in README.md

---

## Notes
- Priority: Truthfulness and ATS compatibility
- Target: Single page maximum
- Focus: Keyword optimization without keyword stuffing
- Output quality: Should require minimal manual editing
