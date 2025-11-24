# 🔧 Resume Tailor Tool - Technical Architecture

## 📋 Table of Contents

1. System Overview
2. Architecture Design
3. Core Components
4. Data Flow
5. AI/LLM Integration
6. LaTeX Processing Pipeline
7. Quality Assurance
8. Tech Stack
9. API Design
10. Deployment Architecture
11. Performance Considerations
12. Security & Privacy
13. Future Enhancements

---

## 🏗️ System Overview

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        User Input                            │
│  (Resume Content JSON + Job Description Text + Template)    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Input Processor                           │
│  • Validates JSON schema                                     │
│  • Cleans and normalizes JD text                            │
│  • Loads LaTeX template                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   JD Analysis Engine                         │
│  • LLM-based keyword extraction                              │
│  • Skill requirement identification                          │
│  • Role type classification                                  │
│  • Priority scoring                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Content Tailoring Engine                     │
│  • Experience bullet rewriting (LLM)                         │
│  • Skills reorganization                                     │
│  • Achievement prioritization                                │
│  • Keyword integration                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                Format Optimization Engine                    │
│  • Single-page enforcement                                   │
│  • Content prioritization                                    │
│  • Space allocation algorithm                                │
│  • LaTeX code generation                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  LaTeX Compiler                              │
│  • Renders LaTeX to PDF                                      │
│  • Validates page count                                      │
│  • Quality checks                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Quality Analyzer                           │
│  • Match score calculation                                   │
│  • Gap analysis                                              │
│  • Keyword coverage report                                   │
│  • Improvement suggestions                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Output                                  │
│  • Tailored PDF resume                                       │
│  • LaTeX source code                                         │
│  • Analysis reports (MD)                                     │
│  • Metadata (JSON)                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Core Components

### **1. Input Processor**

**Purpose**: Validate and normalize input data

**Technology**: Python

**Functions**:
```python
class InputProcessor:
    def validate_resume_json(self, resume_data: dict) -> ValidationResult:
        """
        Validates resume JSON against schema
        
        Checks:
        - Required fields present (personalInfo, experience, skills, education)
        - Data types correct
        - Date formats valid
        - No missing critical information
        
        Returns: ValidationResult with errors/warnings
        """
        pass
    
    def normalize_jd_text(self, jd_text: str) -> str:
        """
        Cleans and normalizes job description
        
        Operations:
        - Remove extra whitespace
        - Fix encoding issues
        - Extract main content (remove boilerplate)
        - Normalize line breaks
        
        Returns: Clean JD text ready for analysis
        """
        pass
    
    def load_template(self, template_path: str) -> LaTeXTemplate:
        """
        Loads and validates LaTeX template
        
        Checks:
        - Template syntax valid
        - Required placeholders present
        - Font packages available
        
        Returns: LaTeXTemplate object
        """
        pass
```

**Key Validations**:
- Resume JSON schema compliance
- JD text quality (min 100 words)
- Template compatibility

---

### **2. JD Analysis Engine**

**Purpose**: Extract requirements and priorities from job descriptions

**Technology**: Python + LLM (Claude, GPT-4)

**Architecture**:
```python
class JDAnalyzer:
    def __init__(self, llm_client):
        self.llm = llm_client
        self.parser = KeywordParser()
    
    def analyze_jd(self, jd_text: str) -> JDAnalysis:
        """
        Comprehensive job description analysis
        
        Process:
        1. Extract structured requirements
        2. Identify technical skills
        3. Classify role type
        4. Score keyword importance
        5. Extract soft skills
        
        Returns: JDAnalysis object with structured data
        """
        pass
```

**Analysis Output Structure**:
```python
@dataclass
class JDAnalysis:
    role_type: str  # "backend", "frontend", "full-stack", "dba", "qa", etc.
    primary_skills: List[Skill]  # Top 5-10 must-have skills
    secondary_skills: List[Skill]  # Nice-to-have skills
    programming_languages: List[str]  # Required languages
    frameworks: List[str]  # Required frameworks
    tools: List[str]  # DevOps, cloud, etc.
    soft_skills: List[str]  # Communication, leadership, etc.
    years_required: int  # Experience requirement
    keyword_frequency: Dict[str, int]  # Keyword → count
    priorities: Dict[str, float]  # Skill → importance score (0-1)
    company_culture: List[str]  # Startup, enterprise, etc.
    key_phrases: List[str]  # "stakeholder communication", "rapid prototyping"
```

**LLM Prompt Strategy**:
```python
ANALYSIS_PROMPT = """
You are a technical recruiter analyzing a job description.

Job Description:
{jd_text}

Extract:
1. Role Type (backend/frontend/full-stack/devops/qa/dba/ml)
2. Required Skills (list top 10 by importance)
3. Required Programming Languages
4. Years of Experience Required
5. Key Responsibilities (list top 5)
6. Important Keywords and Phrases (list 20+)
7. Soft Skills Required
8. Company Culture Indicators

Return structured JSON.
"""
```

---

### **3. Content Tailoring Engine**

**Purpose**: Rewrite resume content to match JD requirements

**Technology**: Python + LLM (Claude Sonnet for high quality)

**Architecture**:
```python
class ContentTailor:
    def __init__(self, llm_client, jd_analysis: JDAnalysis):
        self.llm = llm_client
        self.jd_analysis = jd_analysis
        self.keyword_integrator = KeywordIntegrator()
    
    def tailor_experience(
        self, 
        experience: List[ExperienceEntry],
        max_bullets_per_job: int = 4
    ) -> List[ExperienceEntry]:
        """
        Tailors experience bullets to match JD
        
        Process:
        1. For each job, identify most relevant bullets
        2. Rewrite bullets incorporating JD keywords naturally
        3. Maintain factual accuracy (no fabrication)
        4. Preserve quantified achievements
        5. Ensure keyword integration feels natural
        
        Returns: Tailored experience entries
        """
        pass
    
    def reorganize_skills(
        self, 
        skills: SkillsSection
    ) -> SkillsSection:
        """
        Reorganizes skills based on JD priorities
        
        Process:
        1. Score each skill based on JD match
        2. Group related skills
        3. Order categories by relevance
        4. Move matching skills to top
        5. Bold/emphasize most important
        
        Returns: Reorganized skills section
        """
        pass
    
    def prioritize_achievements(
        self,
        achievements: List[Achievement],
        max_count: int = 2
    ) -> List[Achievement]:
        """
        Selects most relevant achievements
        
        Process:
        1. Score each achievement by JD relevance
        2. Consider recency and impact
        3. Select top N achievements
        4. Reword to align with JD language
        
        Returns: Prioritized achievements
        """
        pass
```

**LLM Prompt for Bullet Rewriting**:
```python
BULLET_REWRITE_PROMPT = """
You are helping tailor a resume bullet for a specific job.

Original Bullet:
{original_bullet}

Job Description Keywords to Integrate:
{jd_keywords}

Requirements:
1. Rewrite incorporating relevant JD keywords naturally
2. Maintain factual accuracy (no fabrication)
3. Keep quantified achievements (100K users, 30% improvement)
4. Use active voice and strong action verbs
5. Ensure keyword integration feels organic, not forced
6. Length: 1-2 lines maximum

Return: Rewritten bullet only
"""
```

**Keyword Integration Algorithm**:
```python
def integrate_keywords(
    bullet: str, 
    keywords: List[str], 
    max_keywords: int = 3
) -> str:
    """
    Intelligently integrates JD keywords into bullet
    
    Algorithm:
    1. Identify semantic overlap (bullet concepts ↔ JD keywords)
    2. Select top N most relevant keywords
    3. Find natural insertion points (avoid forced placement)
    4. Rewrite sentence incorporating keywords
    5. Validate naturalness (grammar check, readability)
    
    Examples:
    - Original: "Built customer service page"
    - Keywords: ["stakeholder communication", "business intelligence"]
    - Result: "Built customer service platform integrating business 
               intelligence while maintaining stakeholder communication"
    """
    pass
```

---

### **4. Format Optimization Engine**

**Purpose**: Ensure resume fits strictly on 1 page

**Technology**: Python + LaTeX

**Architecture**:
```python
class FormatOptimizer:
    def __init__(self, target_pages: int = 1):
        self.target_pages = target_pages
        self.content_prioritizer = ContentPrioritizer()
    
    def enforce_page_limit(
        self, 
        resume_content: ResumeContent
    ) -> OptimizedContent:
        """
        Ensures resume fits on target page count
        
        Algorithm:
        1. Estimate page count from content length
        2. If exceeds target, apply prioritization rules
        3. Cut content in priority order:
           a. Reduce achievements (5 → 2 bullets)
           b. Condense summary (5 → 3 lines)
           c. Reduce experience bullets (6 → 4 per job)
           d. Remove oldest/least relevant jobs
           e. Condense skills categories (8 → 5)
           f. Remove projects section
        4. Recompile and verify page count
        5. Repeat until target met
        
        Returns: Content that fits on 1 page
        """
        pass
    
    def calculate_content_lines(self, content: ResumeContent) -> int:
        """
        Estimates line count for content
        
        Estimation:
        - Summary: 3 lines per 300 chars
        - Skills: 1 line per category
        - Experience: 2 lines per bullet
        - Education: 2 lines total
        - Achievements: 1.5 lines per bullet
        
        Returns: Estimated line count
        """
        pass
    
    def prioritize_content(
        self, 
        content: ResumeContent, 
        jd_analysis: JDAnalysis
    ) -> PrioritizedContent:
        """
        Scores each content piece by relevance
        
        Scoring Factors:
        - JD keyword match (0-100)
        - Recency (newer = higher score)
        - Quantified achievements (has numbers = higher)
        - Impact (scale, percentages = higher)
        
        Returns: Content sorted by priority score
        """
        pass
```

**Space Allocation Algorithm**:
```python
def allocate_space(
    total_lines: int = 35,  # Typical 1-page capacity
    sections: List[Section]
) -> Dict[str, int]:
    """
    Allocates line budget across sections
    
    Priority Allocation:
    1. Header: 3 lines (fixed)
    2. Summary: 3 lines (fixed)
    3. Skills: 5 lines (fixed)
    4. Education: 2 lines (fixed)
    5. Achievements: 2 lines (flexible)
    6. Experience: Remaining lines (~20 lines)
    
    Experience Allocation:
    - Current role: 40% of experience space (8 lines = 4 bullets)
    - Previous role 1: 30% (6 lines = 3 bullets)
    - Previous role 2: 20% (4 lines = 2 bullets)
    - Older roles: 10% or cut (2 lines = 1 bullet)
    
    Returns: Line allocation per section
    """
    pass
```

---

### **5. LaTeX Processing Pipeline**

**Purpose**: Generate publication-quality PDF resumes

**Technology**: Python + LaTeX (pdflatex)

**Architecture**:
```python
class LaTeXProcessor:
    def __init__(self, template_path: str):
        self.template = self.load_template(template_path)
        self.validator = LaTeXValidator()
    
    def generate_latex(
        self, 
        resume_content: ResumeContent,
        jd_analysis: JDAnalysis
    ) -> str:
        """
        Generates LaTeX code from structured content
        
        Process:
        1. Load template skeleton
        2. Populate header section
        3. Generate summary with keywords
        4. Generate skills section (prioritized)
        5. Generate experience section (tailored)
        6. Generate education section
        7. Generate achievements section
        8. Validate LaTeX syntax
        
        Returns: Complete LaTeX document as string
        """
        pass
    
    def compile_to_pdf(
        self, 
        latex_code: str,
        output_path: str,
        max_attempts: int = 3
    ) -> CompilationResult:
        """
        Compiles LaTeX to PDF with error handling
        
        Process:
        1. Write LaTeX to temp file
        2. Run pdflatex (first pass)
        3. Run pdflatex (second pass for references)
        4. Validate PDF generated
        5. Check page count
        6. If > 1 page, return error for optimization
        
        Returns: CompilationResult with PDF path or errors
        """
        pass
    
    def validate_page_count(self, pdf_path: str) -> int:
        """
        Extracts page count from PDF
        
        Methods:
        1. Try pdfinfo command
        2. Fallback: PyPDF2 library
        3. Fallback: PDF parsing
        
        Returns: Number of pages
        """
        pass
```

**LaTeX Template Structure**:
```latex
% Resume Template with Placeholders

\documentclass[letterpaper,10.5pt]{article}

% Packages and formatting...

\begin{document}

%----------HEADING----------
\begin{center}
    \textbf{\Huge \scshape {{NAME}}} \\ \vspace{1pt}
    \small {{PHONE}} $|$ {{EMAIL}} $|$ {{LINKEDIN}} $|$ {{GITHUB}}
\end{center}

%----------SUMMARY----------
\section*{Summary}
\small{{{SUMMARY_TEXT}}}

%----------SKILLS----------
\section{Technical Skills}
 \begin{itemize}[leftmargin=0.15in, label={}]
    \small{\item{
     {{SKILLS_SECTION}}
    }}
 \end{itemize}

%----------EXPERIENCE----------
\section{Experience}
  \resumeSubHeadingListStart
    {{EXPERIENCE_SECTION}}
  \resumeSubHeadingListEnd

%----------EDUCATION----------
\section{Education}
  {{EDUCATION_SECTION}}

%----------ACHIEVEMENTS----------
\section{Key Strengths}
  {{ACHIEVEMENTS_SECTION}}

\end{document}
```

**Dynamic Content Generation**:
```python
def generate_experience_latex(
    experiences: List[ExperienceEntry]
) -> str:
    """
    Generates LaTeX code for experience section
    
    Template per job:
    ```
    \resumeSubheading
      {{{TITLE}}}{{{DURATION}}}
      {{{COMPANY}}}{{{LOCATION}}}
      \resumeItemListStart
        {{BULLETS}}
      \resumeItemListEnd
    ```
    
    Returns: Complete experience section LaTeX
    """
    latex_code = ""
    for exp in experiences:
        latex_code += f"""
    \\resumeSubheading
      {{{exp.title}}}{{{exp.duration}}}
      {{{exp.company}}}{{{exp.location}}}
      \\resumeItemListStart
"""
        for bullet in exp.bullets:
            # Escape LaTeX special chars
            safe_bullet = escape_latex(bullet)
            latex_code += f"        \\resumeItem{{{safe_bullet}}}\n"
        
        latex_code += "      \\resumeItemListEnd\n"
    
    return latex_code
```

**LaTeX Special Character Escaping**:
```python
def escape_latex(text: str) -> str:
    """
    Escapes special LaTeX characters
    
    Characters to escape:
    & → \\&
    % → \\%
    $ → \\$
    # → \\#
    _ → \\_
    { → \\{
    } → \\}
    ~ → \\textasciitilde
    ^ → \\textasciicircum
    \\ → \\textbackslash
    
    Returns: LaTeX-safe text
    """
    replacements = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}',
        '\\': r'\textbackslash{}',
    }
    
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    return text
```

---

### **6. Quality Analyzer**

**Purpose**: Calculate match scores and identify gaps

**Technology**: Python

**Architecture**:
```python
class QualityAnalyzer:
    def calculate_match_score(
        self,
        resume_content: ResumeContent,
        jd_analysis: JDAnalysis
    ) -> MatchScore:
        """
        Calculates how well resume matches JD
        
        Scoring Components:
        1. Skill Match (40% weight):
           - Primary skills present: +40 points
           - Secondary skills present: +20 points
           
        2. Keyword Coverage (30% weight):
           - JD keywords in resume: count/total * 30
           
        3. Experience Relevance (20% weight):
           - Years of experience match
           - Role type alignment
           
        4. Quantified Achievements (10% weight):
           - Has numbers/percentages: +10 points
        
        Returns: MatchScore (0-100) with breakdown
        """
        pass
    
    def analyze_gaps(
        self,
        resume_content: ResumeContent,
        jd_analysis: JDAnalysis
    ) -> GapAnalysis:
        """
        Identifies missing skills and experience
        
        Analysis:
        1. Required skills not in resume
        2. Keywords missing from resume
        3. Experience gaps (years, role type)
        4. Suggestions for addressing gaps
        
        Returns: GapAnalysis with specific recommendations
        """
        pass
    
    def calculate_keyword_coverage(
        self,
        resume_text: str,
        jd_keywords: List[str]
    ) -> KeywordCoverage:
        """
        Calculates keyword coverage percentage
        
        Algorithm:
        1. For each JD keyword
        2. Check if present in resume (case-insensitive)
        3. Count frequency
        4. Calculate coverage: (keywords_found / total_keywords) * 100
        
        Returns: KeywordCoverage with detailed stats
        """
        pass
```

**Match Score Calculation**:
```python
def calculate_match_score(resume: Resume, jd: JDAnalysis) -> int:
    """
    Comprehensive match scoring algorithm
    
    Example calculation:
    
    1. Skill Match (40 points max):
       - JD requires: Python, TypeScript, React, GraphQL, AWS
       - Resume has: Python, TypeScript, React, AWS (4/5)
       - Score: 4/5 * 40 = 32 points
    
    2. Keyword Coverage (30 points max):
       - JD has 50 important keywords
       - Resume includes 40 keywords
       - Score: 40/50 * 30 = 24 points
    
    3. Experience Relevance (20 points max):
       - JD requires: 3+ years full-stack
       - Resume has: 4 years full-stack
       - Score: 20 points (meets requirement)
    
    4. Quantified Achievements (10 points max):
       - Has 5 quantified achievements
       - Score: 10 points
    
    Total: 32 + 24 + 20 + 10 = 86/100
    
    Rating:
    - 90-100: Excellent match
    - 75-89: Strong match
    - 60-74: Good match
    - 40-59: Moderate match
    - <40: Weak match
    """
    pass
```

---

## 🔄 Data Flow

### **End-to-End Process**

```
1. INPUT
   └─> resume-content.json
   └─> job-description.txt
   └─> template.tex

2. VALIDATION
   └─> Schema validation
   └─> Content completeness check
   └─> Template syntax check

3. JD ANALYSIS (LLM)
   └─> Extract keywords
   └─> Identify role type
   └─> Score priorities
   └─> Output: jd_analysis.json

4. CONTENT TAILORING (LLM)
   └─> Rewrite experience bullets
   └─> Reorganize skills
   └─> Prioritize achievements
   └─> Output: tailored_content.json

5. FORMAT OPTIMIZATION
   └─> Estimate content length
   └─> Apply 1-page enforcement
   └─> Generate LaTeX code
   └─> Output: resume.tex

6. PDF COMPILATION
   └─> pdflatex (pass 1)
   └─> pdflatex (pass 2)
   └─> Validate page count
   └─> Output: resume.pdf

7. QUALITY ANALYSIS
   └─> Calculate match score
   └─> Identify gaps
   └─> Generate recommendations
   └─> Output: analysis.md

8. FINAL OUTPUT
   └─> resume.pdf (tailored)
   └─> resume.tex (source)
   └─> analysis.md (insights)
   └─> metadata.json (tracking)
```

---

## 🤖 AI/LLM Integration

### **Model Selection Strategy**

**Current Approach**:
```python
class LLMOrchestrator:
    def __init__(self):
        self.models = {
            'analysis': 'claude-3-haiku',      # Fast, cheap for JD analysis
            'rewriting': 'claude-3.5-sonnet',  # High quality for content
            'review': 'gpt-4',                 # Expensive, for final review
        }
    
    def select_model(self, task: str) -> LLMClient:
        """
        Selects appropriate model for task
        
        Strategy:
        - JD Analysis: Haiku (fast, structured output)
        - Content Rewriting: Sonnet (high quality, natural language)
        - Quality Review: GPT-4 (comprehensive, catches edge cases)
        
        Cost optimization:
        - Use cheaper models where possible
        - Cache JD analysis results
        - Batch API calls
        """
        pass
```

**Prompt Engineering Patterns**:

**1. Structured Output Prompts** (for JD Analysis):
```python
STRUCTURED_PROMPT = """
Analyze this job description and return ONLY valid JSON.

Job Description:
{jd_text}

Return format:
{{
  "role_type": "backend|frontend|full-stack|devops|qa|dba|ml",
  "primary_skills": ["skill1", "skill2", ...],
  "years_required": 3,
  "key_keywords": ["keyword1", "keyword2", ...],
  "soft_skills": ["communication", "leadership", ...]
}}

Return ONLY the JSON, no other text.
"""
```

**2. Context-Aware Rewriting Prompts**:
```python
REWRITE_PROMPT = """
You are a professional resume writer helping tailor a resume bullet.

Context:
- Target Role: {role_type}
- Company: {company_name}
- Required Skills: {required_skills}

Original Bullet:
"{original_bullet}"

Keywords to Integrate Naturally:
{keywords}

Requirements:
1. Incorporate 2-3 keywords from list above
2. Maintain factual accuracy (no fabrication)
3. Keep quantified achievements ({numbers})
4. Use action verbs (Engineered, Optimized, Implemented)
5. Keep under 2 lines
6. Make it sound natural (not keyword-stuffed)

Return ONLY the rewritten bullet, nothing else.
"""
```

**3. Validation Prompts** (for Quality Check):
```python
VALIDATION_PROMPT = """
You are reviewing a tailored resume for quality.

Original Experience:
{original}

Tailored Version:
{tailored}

Check:
1. Is tailored version factually accurate? (no fabrication)
2. Are quantified achievements preserved?
3. Does keyword integration feel natural?
4. Is it more compelling than original?
5. Are there any exaggerations or false claims?

Return JSON:
{{
  "is_accurate": true/false,
  "is_natural": true/false,
  "is_improved": true/false,
  "concerns": ["list any issues"],
  "suggestions": ["list improvements"]
}}
"""
```

---

### **LLM API Integration**

**Provider Support**:
```python
class LLMProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, **kwargs) -> str:
        pass

class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def complete(self, prompt: str, **kwargs) -> str:
        response = self.client.messages.create(
            model=kwargs.get('model', 'claude-3-5-sonnet-20241022'),
            max_tokens=kwargs.get('max_tokens', 4096),
            temperature=kwargs.get('temperature', 0.7),
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
    
    def complete(self, prompt: str, **kwargs) -> str:
        response = self.client.chat.completions.create(
            model=kwargs.get('model', 'gpt-4'),
            messages=[{"role": "user", "content": prompt}],
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 4096)
        )
        return response.choices[0].message.content
```

**Cost Optimization**:
```python
class CostOptimizer:
    def __init__(self):
        self.cache = LRUCache(maxsize=1000)
        self.batch_queue = []
    
    def get_cached_jd_analysis(self, jd_hash: str) -> Optional[JDAnalysis]:
        """
        Cache JD analysis results
        
        Strategy:
        - Hash JD text (MD5)
        - Check cache for existing analysis
        - Return cached result if < 7 days old
        - Saves ~$0.01-0.05 per duplicate JD
        """
        return self.cache.get(jd_hash)
    
    def batch_bullet_rewrites(
        self,
        bullets: List[str],
        batch_size: int = 10
    ) -> List[str]:
        """
        Batch multiple bullets in single API call
        
        Strategy:
        - Group up to 10 bullets per API call
        - Parse responses to individual bullets
        - Reduces API overhead by 10x
        - Saves ~60% on API costs
        """
        pass
```

---

## 📊 Tech Stack

### **Programming Language**: Python 3.9+

**Why Python**:
- ✅ Rich AI/ML ecosystem (OpenAI, Anthropic, LangChain)
- ✅ Excellent text processing libraries
- ✅ LaTeX integration (subprocess)
- ✅ Fast development iteration
- ✅ Large developer community

---

### **Core Libraries**

**AI/LLM**:
```python
anthropic==0.18.0        # Claude API (primary)
openai==1.12.0           # GPT-4 API (alternative)
langchain==0.1.0         # LLM orchestration (future)
tiktoken==0.5.2          # Token counting
```

**Text Processing**:
```python
pydantic==2.5.0          # Data validation
jsonschema==4.20.0       # JSON schema validation
python-dateutil==2.8.2   # Date parsing
regex==2023.12.25        # Advanced regex
```

**Document Generation**:
```python
jinja2==3.1.3            # Template engine
pypdf2==3.0.1            # PDF manipulation
```

**Utilities**:
```python
pyyaml==6.0.1            # Config management
click==8.1.7             # CLI interface
rich==13.7.0             # Beautiful terminal output
loguru==0.7.2            # Logging
```

---

### **External Dependencies**

**LaTeX Distribution**:
- **MacOS**: MacTeX or BasicTeX
- **Linux**: TeX Live
- **Windows**: MiKTeX

**Required Packages**:
```
latexsym, fullpage, titlesec, marvosym, color, verbatim, 
enumitem, hyperref, fancyhdr, babel, tabularx
```

---

## 🔐 Security & Privacy

### **Data Handling**

**Privacy Principles**:
1. **Local-First Processing**: All data stays on user's machine by default
2. **No Data Retention**: LLM providers don't store requests (zero-retention APIs)
3. **Encrypted Storage**: Sensitive data encrypted at rest
4. **Anonymous Telemetry**: Only aggregate stats, no PII

**Security Measures**:
```python
class SecurityManager:
    def sanitize_input(self, text: str) -> str:
        """
        Removes PII before sending to LLM
        
        Redaction:
        - Email addresses → [EMAIL]
        - Phone numbers → [PHONE]
        - Addresses → [ADDRESS]
        - SSN/ID numbers → [ID]
        
        Note: Restored in final output
        """
        pass
    
    def encrypt_resume_json(self, data: dict, key: str) -> bytes:
        """
        Encrypts resume JSON for storage
        
        Algorithm: AES-256-GCM
        Key derivation: PBKDF2 with user password
        
        Returns: Encrypted bytes
        """
        pass
```

**API Key Management**:
```python
# Don't hardcode API keys!
# Use environment variables

import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Validate keys present
if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY not set in environment")
```

---

## 🚀 Performance Considerations

### **Optimization Strategies**

**1. Caching**:
```python
class CacheManager:
    def __init__(self):
        self.jd_cache = {}  # JD hash → analysis
        self.bullet_cache = {}  # (bullet, keywords) → rewritten
    
    def cache_jd_analysis(self, jd_hash: str, analysis: JDAnalysis):
        """
        Cache JD analysis for 7 days
        
        Benefit:
        - Same JD reused across multiple resumes
        - Saves ~$0.02 per analysis
        - Instant results for cached JDs
        """
        self.jd_cache[jd_hash] = {
            'analysis': analysis,
            'timestamp': datetime.now(),
            'expires': datetime.now() + timedelta(days=7)
        }
```

**2. Batch Processing**:
```python
def batch_process_bullets(bullets: List[str]) -> List[str]:
    """
    Process multiple bullets in single API call
    
    Strategy:
    - Combine up to 10 bullets with delimiters
    - Single LLM call instead of 10
    - Parse response back to individual bullets
    
    Performance:
    - 10x fewer API calls
    - 60% cost reduction
    - 5x faster overall
    """
    pass
```

**3. Parallel Processing**:
```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def parallel_bullet_rewrite(
    bullets: List[str],
    max_workers: int = 5
) -> List[str]:
    """
    Rewrite bullets in parallel
    
    Strategy:
    - Group bullets into batches
    - Process batches in parallel (5 concurrent)
    - Merge results in order
    
    Performance:
    - 20 bullets: 60s → 15s (4x faster)
    """
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        loop = asyncio.get_event_loop()
        tasks = [
            loop.run_in_executor(executor, rewrite_bullet, bullet)
            for bullet in bullets
        ]
        return await asyncio.gather(*tasks)
```

**4. LaTeX Compilation Optimization**:
```python
def optimize_latex_compilation(latex_code: str) -> CompilationResult:
    """
    Fast PDF generation
    
    Optimizations:
    1. Single-pass compilation (when possible)
    2. Disable auxiliary files (-aux-directory=/tmp)
    3. Use -interaction=nonstopmode (no prompts)
    4. Cache template compilation
    
    Performance:
    - Normal: 3-5 seconds
    - Optimized: 1-2 seconds
    """
    pass
```

---

## 📊 Data Models

### **Resume Content Schema**

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: str
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None

class ExperienceEntry(BaseModel):
    title: str
    company: str
    location: str
    duration: str  # "May 2024 - Present"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    bullets: List[str]
    skills: List[str]  # Technologies used
    quantified_achievements: List[str] = []  # "100K users", "30% improvement"

class SkillsSection(BaseModel):
    programming_languages: List[str]
    frameworks: List[str]
    databases: List[str]
    cloud_services: List[str]
    tools: List[str]
    methodologies: List[str] = []

class Education(BaseModel):
    degree: str
    institution: str
    location: str
    duration: str
    gpa: Optional[str] = None
    relevant_coursework: List[str] = []

class Achievement(BaseModel):
    title: str
    description: str
    year: Optional[int] = None

class ResumeContent(BaseModel):
    personal_info: PersonalInfo
    experience: List[ExperienceEntry]
    skills: SkillsSection
    education: Education
    achievements: List[Achievement]
    projects: List[Project] = []
    
    class Config:
        json_schema_extra = {
            "example": {
                "personalInfo": {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "phone": "+1-234-567-8900",
                    "linkedin": "johndoe",
                    "github": "johndoe"
                },
                "experience": [
                    {
                        "title": "Software Engineer",
                        "company": "TechCorp",
                        "location": "San Francisco, CA",
                        "duration": "Jan 2022 - Present",
                        "bullets": [
                            "Built scalable microservices serving 1M+ users",
                            "Reduced API latency by 45% through optimization"
                        ],
                        "skills": ["Python", "Django", "PostgreSQL"]
                    }
                ]
            }
        }
```

---

### **JD Analysis Schema**

```python
class Skill(BaseModel):
    name: str
    importance: float  # 0.0 - 1.0
    category: str  # "must-have", "nice-to-have", "preferred"

class JDAnalysis(BaseModel):
    role_type: str  # "backend", "frontend", "full-stack", etc.
    role_focus: str  # "quality-engineering", "dba", "ai-ml", etc.
    seniority: str  # "junior", "mid", "senior", "staff"
    years_required: int
    
    primary_skills: List[Skill]  # Top 10 must-have skills
    secondary_skills: List[Skill]  # Nice-to-have skills
    programming_languages: List[str]
    frameworks: List[str]
    tools: List[str]
    databases: List[str]
    cloud_platforms: List[str]
    
    key_keywords: List[str]  # Top 50 keywords
    keyword_frequency: Dict[str, int]
    key_phrases: List[str]  # "stakeholder communication", "rapid prototyping"
    
    soft_skills: List[str]
    company_culture: List[str]  # "startup", "fast-paced", "collaborative"
    
    responsibilities: List[str]  # Top 5-10 responsibilities
    qualifications: List[str]  # Degree, certifications, etc.
    
    analysis_confidence: float  # 0.0 - 1.0

class MatchScore(BaseModel):
    overall_score: int  # 0-100
    skill_match_score: int  # 0-40
    keyword_coverage_score: int  # 0-30
    experience_relevance_score: int  # 0-20
    achievement_score: int  # 0-10
    
    breakdown: Dict[str, Any]
    strengths: List[str]
    gaps: List[str]
    recommendations: List[str]
```

---

## 🔌 API Design (Future)

### **RESTful API Endpoints**

**Authentication**:
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

**Resume Management**:
```
POST   /api/v1/resumes           # Create master resume
GET    /api/v1/resumes/:id       # Get resume
PUT    /api/v1/resumes/:id       # Update resume
DELETE /api/v1/resumes/:id       # Delete resume
GET    /api/v1/resumes           # List user's resumes
```

**Tailoring**:
```
POST   /api/v1/tailor            # Tailor resume for JD
GET    /api/v1/tailor/:id        # Get tailored resume
POST   /api/v1/tailor/:id/download  # Download PDF
```

**Analysis**:
```
POST   /api/v1/analyze/jd        # Analyze job description
POST   /api/v1/analyze/match     # Calculate match score
GET    /api/v1/analyze/:id/gaps  # Get gap analysis
```

**Example Request**:
```bash
curl -X POST https://api.resumetailor.dev/v1/tailor \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": "resume_123",
    "job_description": "We are looking for a Full-Stack Developer with React and Python...",
    "options": {
      "target_pages": 1,
      "template": "ats-professional",
      "emphasis": "backend"
    }
  }'
```

**Example Response**:
```json
{
  "tailoring_id": "tailor_456",
  "status": "completed",
  "match_score": 85,
  "pdf_url": "https://cdn.resumetailor.dev/tailor_456.pdf",
  "latex_source": "...",
  "analysis": {
    "strengths": ["Strong React experience", "Python backend skills"],
    "gaps": ["Limited AWS experience"],
    "recommendations": ["Emphasize AWS Lambda project"]
  },
  "processing_time_ms": 8500,
  "created_at": "2025-11-24T12:00:00Z"
}
```

---

## 🏗️ System Architecture

### **Deployment Options**

**Option 1: Local CLI Tool** (Current)
```
User's Machine
├── Python script
├── Resume JSON
├── LaTeX templates
├── pdflatex binary
└── Output directory

Pros:
- Complete privacy (no data leaves machine)
- No internet required (except LLM API)
- Fast (no network latency)
- Free infrastructure

Cons:
- Requires technical setup
- LaTeX installation needed
- Limited to power users
```

**Option 2: Web Application** (Future)
```
┌─────────────────┐
│   Web Frontend  │  (React + TypeScript)
│  (User Browser) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   API Gateway   │  (AWS API Gateway / Nginx)
│   (Load Balancer)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│     Application Servers          │
│  (FastAPI / Django / Flask)      │
│  ┌──────────┬──────────┬──────┐ │
│  │ JD       │ Content  │ LaTeX│ │
│  │ Analyzer │ Tailor   │ Gen  │ │
│  └──────────┴──────────┴──────┘ │
└────────┬────────────────────────┘
         │
         ├──> LLM APIs (Anthropic, OpenAI)
         │
         ├──> Database (PostgreSQL)
         │    ├── User accounts
         │    ├── Resume versions
         │    └── Tailoring history
         │
         ├──> Cache (Redis)
         │    ├── JD analyses
         │    └── API responses
         │
         ├──> Storage (S3)
         │    ├── Generated PDFs
         │    ├── LaTeX sources
         │    └── Templates
         │
         └──> Queue (SQS / RabbitMQ)
              └── Async PDF generation
```

**Option 3: Hybrid** (Best of Both)
```
Local Processing + Cloud Enhancement

Local:
- Resume JSON storage
- PDF generation
- Privacy-sensitive operations

Cloud:
- LLM API calls
- Template marketplace
- Success analytics (opt-in)
- A/B testing
```

---

## 🗄️ Database Schema (for Web App)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    subscription_tier VARCHAR(50) DEFAULT 'free'
);

-- Master Resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,  -- Full resume JSON
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job Descriptions (cached)
CREATE TABLE job_descriptions (
    id UUID PRIMARY KEY,
    jd_hash VARCHAR(64) UNIQUE NOT NULL,  -- MD5 hash
    jd_text TEXT NOT NULL,
    analysis JSONB,  -- Cached JD analysis
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP  -- Cache expiration
);

-- Tailored Resumes
CREATE TABLE tailored_resumes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    resume_id UUID REFERENCES resumes(id),
    jd_id UUID REFERENCES job_descriptions(id),
    tailored_content JSONB,
    pdf_url VARCHAR(500),
    latex_source TEXT,
    match_score INT,
    analysis JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Application Tracking
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    tailored_resume_id UUID REFERENCES tailored_resumes(id),
    company_name VARCHAR(255),
    role_title VARCHAR(255),
    applied_at TIMESTAMP,
    status VARCHAR(50),  -- 'applied', 'interview', 'offer', 'rejected'
    callback BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Analytics (aggregate only, no PII)
CREATE TABLE analytics (
    id UUID PRIMARY KEY,
    metric_name VARCHAR(100),
    metric_value FLOAT,
    metadata JSONB,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_jd_hash ON job_descriptions(jd_hash);
CREATE INDEX idx_tailored_user ON tailored_resumes(user_id);
CREATE INDEX idx_applications_user ON applications(user_id);
```

---

## 🧪 Testing Strategy

### **Test Levels**

**1. Unit Tests**:
```python
# test_jd_analyzer.py
def test_extract_programming_languages():
    """Test language extraction from JD"""
    jd = "We need Python, Java, and JavaScript experience"
    analyzer = JDAnalyzer()
    result = analyzer.extract_languages(jd)
    
    assert "Python" in result
    assert "Java" in result
    assert "JavaScript" in result
    assert len(result) == 3

def test_calculate_keyword_frequency():
    """Test keyword counting"""
    jd = "React React Python React"
    analyzer = JDAnalyzer()
    freq = analyzer.calculate_frequency(jd)
    
    assert freq["React"] == 3
    assert freq["Python"] == 1
```

**2. Integration Tests**:
```python
# test_end_to_end.py
def test_full_tailoring_pipeline():
    """Test complete resume tailoring"""
    # Given
    resume = load_json("test_data/sample_resume.json")
    jd = load_text("test_data/sample_jd.txt")
    
    # When
    tailor = ResumeTailor()
    result = tailor.tailor_resume(resume, jd)
    
    # Then
    assert result.pdf_path.exists()
    assert get_page_count(result.pdf_path) == 1
    assert result.match_score > 70
    assert "Python" in result.tailored_content
```

**3. Quality Tests**:
```python
# test_quality.py
def test_no_fabrication():
    """Ensure tailoring doesn't fabricate experience"""
    original = "Built web app with React"
    jd_keywords = ["Python", "Django", "PostgreSQL"]
    
    rewritten = rewrite_bullet(original, jd_keywords)
    
    # Should NOT mention Python/Django if not in original
    assert "Python" not in rewritten
    assert "Django" not in rewritten
    assert "React" in rewritten  # Preserved original tech

def test_keyword_integration_natural():
    """Ensure keywords integrate naturally"""
    result = rewrite_with_keywords(
        "Built customer service platform",
        ["stakeholder communication"]
    )
    
    # Should integrate naturally, not append
    assert "stakeholder" in result.lower()
    # Should not just append: "Built...platform stakeholder communication"
    assert not result.endswith("stakeholder communication")
```

**4. LaTeX Tests**:
```python
# test_latex.py
def test_special_char_escaping():
    """Test LaTeX special character handling"""
    bullet = "Improved performance by 30% using C++ & Python"
    escaped = escape_latex(bullet)
    
    assert r'\%' in escaped
    assert r'\&' in escaped
    assert 'C++' in escaped or r'C\texttt{++}' in escaped

def test_pdf_compilation():
    """Test PDF generation succeeds"""
    latex = generate_latex(sample_content)
    result = compile_to_pdf(latex)
    
    assert result.success
    assert result.pdf_path.exists()
    assert get_page_count(result.pdf_path) == 1
```

---

## 🚀 Deployment Architecture

### **Local Deployment** (MVP)

**Installation**:
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install LaTeX (macOS)
brew install basictex
sudo tlmgr update --self
sudo tlmgr install latexmk enumitem charter

# Set API keys
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Run tool
python tailor_resume.py \
  --resume base/resume-content.json \
  --jd jd.txt \
  --output output/tailored/
```

**Directory Structure**:
```
resume-tailor-tool/
├── src/
│   ├── __init__.py
│   ├── input_processor.py
│   ├── jd_analyzer.py
│   ├── content_tailor.py
│   ├── format_optimizer.py
│   ├── latex_processor.py
│   ├── quality_analyzer.py
│   └── utils/
│       ├── llm_client.py
│       ├── cache_manager.py
│       └── logger.py
├── templates/
│   ├── ats-professional.tex
│   ├── modern-clean.tex
│   └── minimal.tex
├── base/
│   ├── resume-content.json
│   └── RESUME_RULES.md
├── output/
│   └── (generated resumes)
├── tests/
│   ├── test_jd_analyzer.py
│   ├── test_content_tailor.py
│   └── test_end_to_end.py
├── docs/
│   ├── BUSINESS_OVERVIEW.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── USER_GUIDE.md
├── requirements.txt
├── setup.py
├── README.md
└── .env.example
```

---

### **Cloud Deployment** (Future Web App)

**Infrastructure**:
```yaml
# AWS Architecture
Services:
  Frontend:
    - CloudFront (CDN)
    - S3 (Static hosting)
    
  Backend:
    - ECS Fargate (Containerized FastAPI)
    - Application Load Balancer
    - API Gateway (rate limiting, auth)
    
  Data:
    - RDS PostgreSQL (user data, metadata)
    - ElastiCache Redis (caching)
    - S3 (PDF storage, templates)
    
  Processing:
    - Lambda (async PDF generation)
    - SQS (job queue)
    - Step Functions (workflow orchestration)
    
  Monitoring:
    - CloudWatch (logs, metrics)
    - X-Ray (tracing)
    - SNS (alerting)

Regions:
  - us-east-1 (primary)
  - eu-west-1 (Europe)
  - ap-south-1 (Asia)
```

**Docker Configuration**:
```dockerfile
# Dockerfile
FROM python:3.11-slim

# Install LaTeX
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ /app/src/
COPY templates/ /app/templates/

WORKDIR /app

# Run API server
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Kubernetes Deployment**:
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resume-tailor-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: resume-tailor
  template:
    metadata:
      labels:
        app: resume-tailor
    spec:
      containers:
      - name: api
        image: resume-tailor:latest
        ports:
        - containerPort: 8000
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: anthropic
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

---

## ⚡ Performance Benchmarks

### **Target Performance**

| Operation | Target | Current |
|-----------|--------|---------|
| **JD Analysis** | <5 seconds | ~8 seconds |
| **Bullet Rewriting** (10 bullets) | <30 seconds | ~45 seconds |
| **PDF Generation** | <2 seconds | ~3 seconds |
| **Total End-to-End** | <60 seconds | ~90 seconds |

### **Optimization Opportunities**

**1. Parallel Processing**:
- Rewrite bullets in parallel (4x faster)
- Batch LLM calls (60% cost savings)

**2. Caching**:
- Cache JD analysis (90% cache hit rate)
- Cache common bullet rewrites

**3. Model Selection**:
- Use Haiku for JD analysis (3x faster, 10x cheaper)
- Use Sonnet for content rewriting (quality)

**Target After Optimization**:
- JD Analysis: 2 seconds (Haiku + caching)
- Bullet Rewriting: 15 seconds (parallel + batching)
- PDF Generation: 2 seconds (unchanged)
- **Total: <30 seconds** (2x faster)

---

## 🔒 Security Best Practices

### **Data Protection**

**1. Local-First Architecture**:
```python
class DataManager:
    def __init__(self, encryption_key: str):
        self.key = encryption_key
    
    def save_resume_locally(self, resume: Resume, path: str):
        """
        Save encrypted resume to local filesystem
        
        Security:
        - AES-256-GCM encryption
        - Key derived from user password
        - No plaintext storage
        """
        encrypted = encrypt_aes_gcm(
            data=resume.json(), 
            key=self.key
        )
        with open(path, 'wb') as f:
            f.write(encrypted)
```

**2. PII Redaction**:
```python
def redact_pii_before_llm(text: str) -> Tuple[str, Dict]:
    """
    Remove PII before sending to LLM
    
    Redaction:
    - Email → [EMAIL_1]
    - Phone → [PHONE_1]
    - Address → [ADDRESS_1]
    - Name → [NAME_1]
    
    Returns: (redacted_text, mapping_dict)
    Use mapping_dict to restore PII in output
    """
    import re
    
    mapping = {}
    
    # Redact emails
    emails = re.findall(r'\b[\w\.-]+@[\w\.-]+\.\w+\b', text)
    for i, email in enumerate(emails):
        placeholder = f"[EMAIL_{i+1}]"
        text = text.replace(email, placeholder)
        mapping[placeholder] = email
    
    # Redact phones (more patterns...)
    # Redact addresses (more patterns...)
    
    return text, mapping
```

**3. API Key Security**:
```python
# NEVER commit API keys to git!
# Use environment variables

# .env (gitignored)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# .env.example (committed)
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
```

---

## 📦 Distribution & Packaging

### **Python Package**

**setup.py**:
```python
from setuptools import setup, find_packages

setup(
    name='resume-tailor',
    version='1.0.0',
    description='AI-powered resume tailoring tool',
    author='Raghu Raj Sodani',
    author_email='sodaniraghuraj@gmail.com',
    url='https://github.com/raghusodani/resume-tailor-tool',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    install_requires=[
        'anthropic>=0.18.0',
        'pydantic>=2.5.0',
        'click>=8.1.7',
        'rich>=13.7.0',
        'pyyaml>=6.0.1',
        'python-dotenv>=1.0.0',
    ],
    entry_points={
        'console_scripts': [
            'resume-tailor=resume_tailor.cli:main',
        ],
    },
    python_requires='>=3.9',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
    ],
)
```

**PyPI Installation**:
```bash
# Install from PyPI (future)
pip install resume-tailor

# Install from source
git clone https://github.com/raghusodani/resume-tailor-tool
cd resume-tailor-tool
pip install -e .

# Run
resume-tailor --resume base/resume.json --jd jd.txt
```

---

## 🔮 Advanced Features (Future)

### **1. A/B Testing Framework**

```python
class ABTester:
    def generate_variants(
        self,
        resume: Resume,
        jd: JDAnalysis,
        num_variants: int = 3
    ) -> List[Resume]:
        """
        Generate multiple resume variants
        
        Variants:
        1. Conservative: Minimal changes, safe keywords
        2. Moderate: Standard optimization (default)
        3. Aggressive: Maximum keyword integration
        
        Use: Test which variant gets most callbacks
        """
        pass
```

### **2. Success Tracking**

```python
class SuccessTracker:
    def track_application(
        self,
        resume_id: str,
        company: str,
        got_callback: bool
    ):
        """
        Track which resumes get interviews
        
        Insights:
        - Which keywords correlate with success
        - Which match scores get callbacks
        - Which resume formats perform best
        
        Privacy: Aggregate data only, no PII
        """
        pass
    
    def get_success_patterns(self) -> Dict:
        """
        Analyze successful resume patterns
        
        Returns:
        - Keywords that correlate with callbacks
        - Optimal match scores
        - Best bullet phrasing
        - Successful formatting choices
        """
        pass
```

### **3. Interview Question Prediction**

```python
class InterviewPredictor:
    def predict_questions(
        self,
        jd: JDAnalysis,
        resume: Resume
    ) -> List[Question]:
        """
        Predict interview questions based on JD + resume
        
        Categories:
        1. Technical (based on required skills)
        2. Behavioral (based on responsibilities)
        3. Gap questions (for missing experience)
        4. Scenario (based on job duties)
        
        Returns: List of likely interview questions with suggested answers
        """
        pass
```

---

## 📈 Monitoring & Observability

### **Metrics to Track**

**Application Metrics**:
```python
from prometheus_client import Counter, Histogram, Gauge

# Request counters
tailor_requests = Counter(
    'tailor_requests_total',
    'Total resume tailoring requests'
)

# Processing time
processing_duration = Histogram(
    'processing_duration_seconds',
    'Time to complete tailoring',
    buckets=[10, 30, 60, 120, 300]
)

# Quality metrics
match_score_gauge = Gauge(
    'match_score_average',
    'Average match score of tailored resumes'
)

# Error tracking
llm_errors = Counter(
    'llm_errors_total',
    'LLM API errors',
    ['provider', 'error_type']
)
```

**Logging Strategy**:
```python
from loguru import logger

# Configure structured logging
logger.add(
    "logs/resume_tailor_{time}.log",
    rotation="500 MB",
    retention="10 days",
    level="INFO",
    format="{time} | {level} | {message}",
    serialize=True  # JSON logs
)

# Usage
logger.info(
    "Resume tailored successfully",
    resume_id="resume_123",
    jd_hash="abc123",
    match_score=85,
    processing_time=45.2
)
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install LaTeX
      run: |
        sudo apt-get update
        sudo apt-get install -y texlive-latex-base texlive-latex-extra
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov
    
    - name: Run tests
      run: |
        pytest tests/ --cov=src --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
  
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t resume-tailor:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        docker tag resume-tailor:${{ github.sha }} ghcr.io/raghusodani/resume-tailor:latest
        docker push ghcr.io/raghusodani/resume-tailor:latest
```

---

## 🎯 Technical Challenges & Solutions

### **Challenge 1: Ensuring 1-Page Format**

**Problem**: Content often exceeds 1 page after tailoring

**Solution**:
```python
def iterative_optimization(content: ResumeContent) -> ResumeContent:
    """
    Iteratively reduce content until it fits
    
    Algorithm:
    1. Compile to PDF
    2. If > 1 page:
       a. Apply first reduction rule
       b. Recompile
       c. Check page count
    3. Repeat until 1 page
    4. Max iterations: 10
    
    Reduction Priority:
    1. Cut achievements (5 → 2)
    2. Reduce bullets per job (6 → 4)
    3. Condense skills (8 categories → 5)
    4. Remove oldest job
    5. Shorten summary
    """
    max_iterations = 10
    
    for i in range(max_iterations):
        pdf = compile_latex(content.to_latex())
        pages = get_page_count(pdf)
        
        if pages == 1:
            return content  # Success!
        
        # Apply next reduction rule
        content = apply_reduction_rule(content, iteration=i)
    
    raise Exception("Could not fit content on 1 page")
```

---

### **Challenge 2: Natural Keyword Integration**

**Problem**: Forced keyword integration sounds unnatural

**Solution**:
```python
def integrate_keywords_naturally(
    bullet: str,
    keywords: List[str]
) -> str:
    """
    LLM-based natural keyword integration
    
    Strategy:
    1. Analyze bullet semantics
    2. Find keywords with semantic overlap
    3. Use LLM to rewrite incorporating keywords
    4. Validate naturalness with grammar check
    5. If unnatural, try different keyword combination
    
    Example:
    - Bullet: "Built customer service system"
    - Keywords: ["stakeholder communication", "business intelligence"]
    - Analysis: "customer service" relates to "stakeholder communication"
    - Result: "Built customer service system maintaining stakeholder 
              communication and integrating business intelligence"
    - Validation: ✅ Natural, flows well
    """
    pass
```

---

### **Challenge 3: Maintaining Factual Accuracy**

**Problem**: LLM might embellish or fabricate

**Solution**:
```python
class FactChecker:
    def verify_accuracy(
        self,
        original: str,
        rewritten: str
    ) -> AccuracyCheck:
        """
        Ensures rewritten content is factually accurate
        
        Checks:
        1. No new companies/roles mentioned
        2. No new technologies (unless in original skills)
        3. Quantified numbers unchanged
        4. Core facts preserved
        5. Only phrasing/keywords changed
        
        Algorithm:
        - Extract entities from both versions (NER)
        - Compare entity sets
        - Flag any new entities not in original
        - Validate numbers match
        
        Returns: AccuracyCheck with pass/fail + concerns
        """
        pass

# Prompt engineering for accuracy
ACCURATE_REWRITE_PROMPT = """
CRITICAL: You must maintain factual accuracy. Do NOT:
- Add technologies not in the original
- Change numbers or percentages
- Fabricate achievements
- Exaggerate scope

ONLY:
- Rephrase existing content
- Add provided JD keywords naturally
- Use stronger action verbs
- Improve clarity

Original: {bullet}
Keywords: {keywords}
Rewrite maintaining 100% accuracy:
"""
```

---

## 🔧 Configuration Management

### **Configuration File**

```yaml
# config.yaml
llm:
  provider: anthropic  # anthropic | openai | local
  models:
    analysis: claude-3-haiku-20240307
    rewriting: claude-3-5-sonnet-20241022
    review: gpt-4
  
  rate_limits:
    requests_per_minute: 50
    tokens_per_minute: 100000
  
  costs:
    target_per_resume: 0.10  # USD

formatting:
  target_pages: 1
  font_size: 10.5
  template: ats-professional
  
  margins:
    top: 0.5
    bottom: 0.5
    left: 0.5
    right: 0.5
  
  spacing:
    section: -4pt
    job: -7pt
    bullet: -2pt

content_rules:
  max_bullets_per_job:
    current: 4
    previous: 3
    intern: 2
  
  max_achievements: 2
  
  skills_categories: 5
  
  summary_lines: 3

quality:
  min_match_score: 60  # Warn if below
  keyword_density:
    min: 0.02  # 2% of content
    max: 0.08  # 8% of content (avoid stuffing)

output:
  pdf: true
  latex: true
  analysis: true
  metadata: true
```

---

## 🧪 Testing & Quality Assurance

### **Test Coverage Goals**

| Component | Target Coverage | Priority |
|-----------|----------------|----------|
| Input Processor | 95% | High |
| JD Analyzer | 90% | High |
| Content Tailor | 85% | High |
| Format Optimizer | 90% | High |
| LaTeX Processor | 80% | Medium |
| Quality Analyzer | 90% | High |

### **Test Data**

```
tests/
├── fixtures/
│   ├── sample_resumes/
│   │   ├── backend_developer.json
│   │   ├── frontend_developer.json
│   │   ├── full_stack.json
│   │   └── dba_engineer.json
│   │
│   ├── sample_jds/
│   │   ├── backend_python.txt
│   │   ├── frontend_react.txt
│   │   ├── full_stack_java.txt
│   │   └── dba_postgresql.txt
│   │
│   └── expected_outputs/
│       ├── backend_python_tailored.json
│       └── ...
│
└── integration/
    └── end_to_end_test.py
```

---

## 🌐 Future Enhancements

### **Phase 1: Enhanced Intelligence**

**1. Multi-Model Ensemble**:
```python
class EnsembleRewriter:
    def rewrite_with_ensemble(
        self,
        bullet: str,
        keywords: List[str]
    ) -> str:
        """
        Generate multiple versions, pick best
        
        Process:
        1. Generate 3 variants (Claude, GPT-4, Llama)
        2. Score each for quality
        3. Use voting algorithm to pick best
        
        Quality: Higher (more perspectives)
        Cost: 3x (but better results)
        """
        pass
```

**2. Fine-Tuned Model**:
```python
# Train custom model on successful resumes
# Input: (original bullet, JD keywords)
# Output: Optimized bullet
# Training data: 10,000+ successful resume bullets

# Benefits:
# - Faster (no prompt overhead)
# - Cheaper (smaller model)
# - Better quality (trained on successes)
```

---

### **Phase 2: Advanced Analysis**

**1. Company-Specific Optimization**:
```python
class CompanyAnalyzer:
    def analyze_company_culture(self, company: str) -> CompanyCulture:
        """
        Analyze company for resume optimization
        
        Data sources:
        - Glassdoor reviews
        - LinkedIn company page
        - Job posting patterns
        - Employee testimonials
        
        Returns: Culture indicators to emphasize
        """
        pass
```

**2. Role-Specific Templates**:
```python
ROLE_TEMPLATES = {
    'backend': 'Emphasize system design, databases, APIs',
    'frontend': 'Emphasize React, UX, performance',
    'full-stack': 'Balance frontend and backend',
    'devops': 'Emphasize automation, infrastructure',
    'qa': 'Emphasize testing, quality, automation',
    'dba': 'Emphasize databases, performance, reliability',
    'ml': 'Emphasize models, data, algorithms',
}
```

---

## 📚 Documentation Structure

### **User Documentation**

```
docs/
├── README.md                    # Quick start
├── INSTALLATION.md              # Setup guide
├── USER_GUIDE.md                # How to use
├── EXAMPLES.md                  # Sample inputs/outputs
├── FAQ.md                       # Common questions
├── TROUBLESHOOTING.md           # Common issues
└── BEST_PRACTICES.md            # Resume tips
```

### **Developer Documentation**

```
docs/dev/
├── ARCHITECTURE.md              # This document
├── API_REFERENCE.md             # API docs
├── CONTRIBUTING.md              # How to contribute
├── CODE_STYLE.md                # Coding standards
├── TESTING.md                   # Testing guide
└── DEPLOYMENT.md                # Deploy guide
```

---

## 🎯 Success Criteria

### **Technical Quality**

- ✅ 95%+ test coverage
- ✅ <60 seconds end-to-end processing
- ✅ 100% single-page success rate
- ✅ <5% compilation errors
- ✅ 99.9% factual accuracy

### **User Quality**

- ✅ 30%+ increase in interview callbacks
- ✅ 4.5+ star user rating
- ✅ <10 minute learning curve
- ✅ 95%+ would recommend

---

**This technical architecture enables scalable, high-quality, automated resume tailoring that democratizes access to professional optimization tools.** 🚀

---

**Ready for implementation and open-source release!** ✅
