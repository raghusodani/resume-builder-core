// IMPORTANT: Only use node: prefixed imports for Node.js built-ins
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Type definition for the context parameter - this is injected by Wasabi
interface ToolContext {
  readonly fs: typeof import("node:fs");
  readonly path: typeof import("node:path");
  readonly os: typeof import("node:os");
  readonly process: typeof import("node:process");

  readonly httpClient: {
    request<TInput = unknown, TOutput = unknown>(
      url: URL,
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD",
      options?: {
        timeout?: number;
        retryStrategy?: { maxAttempts: number; maxElapsedTime: number };
        body?: TInput;
        headers?: Record<string, string>;
        compression?: "gzip" | "br";
        doNotParse?: TOutput extends Buffer ? boolean : never;
      }
    ): Promise<{
      statusCode: number;
      headers: Record<string, string | string[] | undefined>;
      body: TOutput;
    }>;
  };
  readonly rootDir: string;
  readonly validFileGlobs: string[];
  readonly excludedFileGlobs: string[];

  readonly bedrock: {
    prompt(promptParams: {
      inputs: BedrockMessage[];
      system?: { text: string }[];
      inferenceConfig?: {
        maxTokens?: number;
        temperature?: number;
        topP?: number;
      };
    }): Promise<{
      stopReason?: string;
      tokensUsed?: number;
      messages: BedrockMessage[];
    }>;
  };
}

type BedrockMessage = {
  role: "user" | "assistant" | string;
  content: Array<{
    text?: string;
    document?: {
      name: string;
      content: string;
    };
    toolUse?: {
      name: string;
      input: string;
    };
    toolResult?: {
      name: string;
      status: "success" | "error";
      content: Array<{
        text?: string;
        document?: {
          name: string;
          content: string;
        };
      }>;
    };
  }>;
};

interface ResumeTailorToolParams {
  resumeContentPath: string;
  latexTemplatePath: string;
  jobDescription: string;
  outputDir: string;
}

interface JobAnalysis {
  keyRequirements: string[];
  criticalKeywords: string[];
  experienceLevel: string;
  focusAreas: string[];
}

interface TailoredContent {
  tagline: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    duration: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    technologies: string[];
    bullets: string[];
  }>;
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
    cloudServices: string[];
    databases: string[];
    other: string[];
  };
}

/**
 * Resume Tailor Tool - Generates tailored, ATS-friendly single-page resumes
 */
class ResumeTailorTool {
  constructor(private readonly context: ToolContext) {}

  public readonly name = "ResumeTailorTool";

  public readonly inputSchema = {
    json: {
      type: "object",
      properties: {
        resumeContentPath: {
          type: "string",
          description: "Path to the resume content JSON file containing your experience, skills, and projects"
        },
        latexTemplatePath: {
          type: "string",
          description: "Path to the LaTeX template file (AltaCV format)"
        },
        jobDescription: {
          type: "string",
          description: "Job description text (full job posting)"
        },
        outputDir: {
          type: "string",
          description: "Directory where tailored resume files will be saved"
        }
      },
      required: ["resumeContentPath", "latexTemplatePath", "jobDescription", "outputDir"],
      additionalProperties: false
    }
  } as const;

  public readonly description =
    "Generates a tailored, ATS-friendly single-page resume by analyzing a job description and customizing your base resume content. Outputs a LaTeX file, compiled PDF, and detailed analysis report explaining all changes made.";

  public async execute(params: ResumeTailorToolParams) {
    try {
      console.log("🚀 Starting resume tailoring process...");

      // Step 1: Validate and read inputs
      const { resumeContentPath, latexTemplatePath, jobDescription, outputDir } = params;

      if (!this.context.fs.existsSync(resumeContentPath)) {
        throw new Error(`Resume content file not found: ${resumeContentPath}`);
      }

      if (!this.context.fs.existsSync(latexTemplatePath)) {
        throw new Error(`LaTeX template file not found: ${latexTemplatePath}`);
      }

      const resumeContent = JSON.parse(
        this.context.fs.readFileSync(resumeContentPath, "utf-8")
      );
      const latexTemplate = this.context.fs.readFileSync(latexTemplatePath, "utf-8");

      console.log("✅ Input files loaded successfully");

      // Step 2: Analyze job description
      console.log("🔍 Analyzing job description...");
      const jobAnalysis = await this.analyzeJobDescription(jobDescription);
      console.log("✅ Job analysis complete");

      // Step 3: Tailor resume content
      console.log("✏️  Tailoring resume content...");
      const tailoredContent = await this.tailorResumeContent(
        resumeContent,
        jobDescription,
        jobAnalysis
      );
      console.log("✅ Content tailoring complete");

      // Step 4: Generate LaTeX document
      console.log("📄 Generating LaTeX document...");
      const tailoredLatex = this.generateLatexDocument(
        latexTemplate,
        resumeContent,
        tailoredContent
      );

      // Step 5: Create output directory and write files
      if (!this.context.fs.existsSync(outputDir)) {
        this.context.fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
      const outputTexPath = this.context.path.join(outputDir, `tailored-resume-${timestamp}.tex`);

      this.context.fs.writeFileSync(outputTexPath, tailoredLatex, "utf-8");
      console.log(`✅ LaTeX file written: ${outputTexPath}`);

      // Step 6: Compile to PDF
      console.log("🔨 Compiling PDF...");
      let pdfPath: string | undefined;
      let pdfError: string | undefined;

      try {
        pdfPath = await this.compileLatexToPdf(outputTexPath);
        console.log(`✅ PDF compiled: ${pdfPath}`);
      } catch (error) {
        pdfError = error instanceof Error ? error.message : String(error);
        console.log(`⚠️  PDF compilation failed: ${pdfError}`);
      }

      // Step 7: Generate analysis report
      console.log("📊 Generating analysis report...");
      const reportPath = this.context.path.join(outputDir, `analysis-report-${timestamp}.md`);
      const report = this.generateAnalysisReport(
        jobAnalysis,
        resumeContent,
        tailoredContent,
        jobDescription
      );
      this.context.fs.writeFileSync(reportPath, report, "utf-8");
      console.log(`✅ Analysis report written: ${reportPath}`);

      console.log("🎉 Resume tailoring complete!");

      return {
        status: pdfPath ? "success" : "partial_success",
        message: pdfPath
          ? "Resume tailored successfully with PDF compilation"
          : "Resume tailored successfully but PDF compilation failed",
        outputs: {
          texFile: outputTexPath,
          pdfFile: pdfPath,
          analysisReport: reportPath
        },
        jobAnalysis: {
          keyRequirements: jobAnalysis.keyRequirements.slice(0, 5),
          criticalKeywords: jobAnalysis.criticalKeywords.slice(0, 10),
          experienceLevel: jobAnalysis.experienceLevel
        },
        pdfError: pdfError
      };

    } catch (error) {
      return {
        status: "error",
        message: "Error generating tailored resume",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Phase 1: Analyze job description to extract requirements and keywords
   */
  private async analyzeJobDescription(jobDescription: string): Promise<JobAnalysis> {
    const systemPrompt = `You are an expert career advisor and ATS specialist. Analyze job descriptions to extract key requirements for resume tailoring.`;

    const userPrompt = `Analyze this job description and provide a structured analysis:

JOB DESCRIPTION:
${jobDescription}

Provide your analysis in the following JSON format:
{
  "keyRequirements": ["requirement1", "requirement2", ...],
  "criticalKeywords": ["keyword1", "keyword2", ...],
  "experienceLevel": "Entry/Mid/Senior",
  "focusAreas": ["area1", "area2", ...]
}

Guidelines:
- keyRequirements: 5-8 most important requirements/qualifications (technical and soft skills)
- criticalKeywords: 10-15 specific technical terms, tools, frameworks mentioned
- experienceLevel: Estimated level based on years and responsibilities
- focusAreas: 3-5 main areas of focus (e.g., "Frontend Development", "API Integration")

Return ONLY valid JSON, no additional text.`;

    const response = await this.context.bedrock.prompt({
      system: [{ text: systemPrompt }],
      inputs: [{ role: "user", content: [{ text: userPrompt }] }],
      inferenceConfig: {
        maxTokens: 2048,
        temperature: 0.2,
        topP: 0.9
      }
    });

    const assistantMessage = response.messages.find(msg => msg.role === "assistant");
    if (!assistantMessage || !assistantMessage.content[0]?.text) {
      throw new Error("Failed to get job analysis from AI");
    }

    let analysisText = assistantMessage.content[0].text.trim();

    // Clean up response - remove markdown code blocks
    analysisText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    return JSON.parse(analysisText);
  }

  /**
   * Phase 2: Tailor resume content based on job analysis
   */
  private async tailorResumeContent(
    baseContent: any,
    jobDescription: string,
    jobAnalysis: JobAnalysis
  ): Promise<TailoredContent> {
    const systemPrompt = `You are an expert resume writer specializing in ATS-friendly, single-page resumes. Your task is to tailor resume content to match job requirements while maintaining absolute truthfulness.

CRITICAL RULES:
1. NEVER fabricate experience, skills, or achievements
2. Only rewrite/reorder existing content - don't invent new content
3. Use action verbs and quantify achievements when possible
4. Include relevant keywords naturally - avoid keyword stuffing
5. Prioritize most relevant experience for the target role
6. Keep all bullet points concise for single-page constraint
7. Match terminology from job description
8. Maintain professional tone`;

    const userPrompt = `Tailor this resume for the target job:

TARGET JOB ANALYSIS:
${JSON.stringify(jobAnalysis, null, 2)}

BASE RESUME CONTENT:
${JSON.stringify(baseContent, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide tailored content in this EXACT JSON format:
{
  "tagline": "One-line professional summary targeting this role",
  "experience": [
    {
      "title": "original title",
      "company": "original company",
      "location": "original location",
      "duration": "original duration",
      "bullets": ["tailored bullet 1", "tailored bullet 2", ...]
    }
  ],
  "projects": [
    {
      "name": "original name",
      "technologies": ["tech1", "tech2"],
      "bullets": ["tailored bullet 1", "tailored bullet 2"]
    }
  ],
  "skills": {
    "programmingLanguages": ["filtered list prioritizing relevant ones"],
    "frameworks": ["filtered list prioritizing relevant ones"],
    "cloudServices": ["filtered list prioritizing relevant ones"],
    "databases": ["filtered list prioritizing relevant ones"],
    "other": ["filtered list prioritizing relevant ones"]
  }
}

Guidelines for tailoring:
- Tagline: Create targeted 1-line summary highlighting most relevant expertise
- Experience bullets: Rewrite to emphasize relevant achievements and include keywords
- Experience order: Keep chronological, but emphasize relevant bullets first within each role
- Projects: Include only most relevant project(s), adjust descriptions for relevance
- Skills: Prioritize and limit to ~20 total skills across all categories (most relevant first)
- For single-page: Limit experience to 2-3 bullets per role, 2 bullets per project

Return ONLY valid JSON, no additional text or markdown.`;

    const response = await this.context.bedrock.prompt({
      system: [{ text: systemPrompt }],
      inputs: [{ role: "user", content: [{ text: userPrompt }] }],
      inferenceConfig: {
        maxTokens: 4096,
        temperature: 0.3,
        topP: 0.9
      }
    });

    const assistantMessage = response.messages.find(msg => msg.role === "assistant");
    if (!assistantMessage || !assistantMessage.content[0]?.text) {
      throw new Error("Failed to get tailored content from AI");
    }

    let tailoredText = assistantMessage.content[0].text.trim();

    // Clean up response
    tailoredText = tailoredText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    return JSON.parse(tailoredText);
  }

  /**
   * Phase 3: Generate complete LaTeX document
   */
  private generateLatexDocument(
    template: string,
    baseContent: any,
    tailoredContent: TailoredContent
  ): string {
    // Start with template
    let latex = template;

    // Replace personal info
    latex = latex.replace(/\\name\{[^}]*\}/g, `\\name{${baseContent.personalInfo.name}}`);
    latex = latex.replace(
      /\\tagline\{[^}]*\}/g,
      `\\tagline{${this.escapeLatex(tailoredContent.tagline)}}`
    );

    // Build experience section
    let experienceSection = "";
    for (const exp of tailoredContent.experience) {
      experienceSection += `\\cvevent{\\textbf{${this.escapeLatex(exp.title)}}}{${this.escapeLatex(exp.company)}}{${this.escapeLatex(exp.duration)}}{}
\\begin{itemize}
`;
      for (const bullet of exp.bullets) {
        experienceSection += `\\item ${this.escapeLatex(bullet)}\n`;
      }
      experienceSection += `\\end{itemize}\n\\divider\n`;
    }

    // Build projects section
    let projectsSection = "";
    for (const proj of tailoredContent.projects) {
      projectsSection += `\\cvProject{${this.escapeLatex(proj.name)}}{${proj.technologies.join(", ")}}{}{}
\\begin{itemize}
`;
      for (const bullet of proj.bullets) {
        projectsSection += `    \\item ${this.escapeLatex(bullet)}\n`;
      }
      projectsSection += `\\end{itemize}\n\\divider\n`;
    }

    // Build skills section
    const skillsSections = [];

    if (tailoredContent.skills.programmingLanguages.length > 0) {
      skillsSections.push(`\\large\\textbf{Programming Languages}\\par\\smallskip
\\normalsize ${tailoredContent.skills.programmingLanguages.map(s => `\\textbullet{} ${s}`).join("  ")} \\par\\smallskip`);
    }

    if (tailoredContent.skills.frameworks.length > 0) {
      skillsSections.push(`\\large\\textbf{Libraries and Frameworks}\\par\\smallskip
\\normalsize ${tailoredContent.skills.frameworks.map(s => `\\textbullet{} ${s}`).join("  ")} \\par\\smallskip`);
    }

    if (tailoredContent.skills.cloudServices.length > 0) {
      skillsSections.push(`\\large\\textbf{Cloud Services}\\par\\smallskip
\\normalsize ${tailoredContent.skills.cloudServices.map(s => `\\textbullet{} ${s}`).join("  ")} \\par\\smallskip`);
    }

    if (tailoredContent.skills.databases.length > 0) {
      skillsSections.push(`\\large\\textbf{Databases}\\par\\smallskip
\\normalsize ${tailoredContent.skills.databases.map(s => `\\textbullet{} ${s}`).join("  ")} \\par\\smallskip`);
    }

    if (tailoredContent.skills.other.length > 0) {
      skillsSections.push(`\\large\\textbf{Other Skills}\\par\\smallskip
\\normalsize ${tailoredContent.skills.other.map(s => `\\textbullet{} ${s}`).join("  ")} \\par\\smallskip`);
    }

    const skillsSection = skillsSections.join("\\n\\divider\\n\n");

    // Replace sections in template
    // Find and replace experience section
    const expStart = latex.indexOf("\\cvsection{Experience}");
    const expEnd = latex.indexOf("\\cvsection{Projects}");
    if (expStart !== -1 && expEnd !== -1) {
      latex = latex.substring(0, expStart) +
              `\\cvsection{Experience}\n\n${experienceSection}\n` +
              latex.substring(expEnd);
    }

    // Find and replace projects section
    const projStart = latex.indexOf("\\cvsection{Projects}");
    const projEnd = latex.indexOf("\\newpage");
    if (projStart !== -1 && projEnd !== -1) {
      latex = latex.substring(0, projStart) +
              `\\cvsection{Projects}\n${projectsSection}\n` +
              latex.substring(projEnd);
    }

    // Find and replace skills section
    const skillsStart = latex.indexOf("\\cvsection{Skills}");
    const skillsEnd = latex.indexOf("\\cvsection{Achievements}");
    if (skillsStart !== -1 && skillsEnd !== -1) {
      latex = latex.substring(0, skillsStart) +
              `\\cvsection{Skills}\n${skillsSection}\n\n` +
              latex.substring(skillsEnd);
    }

    return latex;
  }

  /**
   * Escape special LaTeX characters
   */
  private escapeLatex(text: string): string {
    return text
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\^/g, "\\textasciicircum{}")
      .replace(/#/g, "\\#")
      .replace(/\$/g, "\\$")
      .replace(/%/g, "\\%")
      .replace(/&/g, "\\&")
      .replace(/_/g, "\\_")
      .replace(/{/g, "\\{")
      .replace(/}/g, "\\}")
      .replace(/</g, "\\textless{}")
      .replace(/>/g, "\\textgreater{}");
  }

  /**
   * Compile LaTeX to PDF
   */
  private async compileLatexToPdf(latexFilePath: string): Promise<string> {
    const dir = this.context.path.dirname(latexFilePath);
    const filename = this.context.path.basename(latexFilePath, ".tex");

    // Run pdflatex twice for proper references
    try {
      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${dir}" "${latexFilePath}"`, {
        cwd: dir,
        timeout: 30000
      });

      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${dir}" "${latexFilePath}"`, {
        cwd: dir,
        timeout: 30000
      });

      const pdfPath = this.context.path.join(dir, `${filename}.pdf`);

      if (!this.context.fs.existsSync(pdfPath)) {
        throw new Error("PDF file was not created");
      }

      return pdfPath;
    } catch (error) {
      throw new Error(`pdflatex compilation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate analysis report
   */
  private generateAnalysisReport(
    jobAnalysis: JobAnalysis,
    baseContent: any,
    tailoredContent: TailoredContent,
    jobDescription: string
  ): string {
    let report = `# Resume Tailoring Analysis Report

Generated: ${new Date().toISOString()}

---

## Job Analysis

### Target Role
${jobDescription.split("\n")[0]}

### Key Requirements Identified
${jobAnalysis.keyRequirements.map((req, i) => `${i + 1}. ${req}`).join("\n")}

### Critical Keywords for ATS
${jobAnalysis.criticalKeywords.join(", ")}

### Experience Level
${jobAnalysis.experienceLevel}

### Focus Areas
${jobAnalysis.focusAreas.map((area, i) => `${i + 1}. ${area}`).join("\n")}

---

## Changes Made

### Professional Summary
**Before**: ${baseContent.personalInfo.tagline}
**After**: ${tailoredContent.tagline}
**Rationale**: Crafted targeted summary highlighting relevant expertise for this role

### Skills Section
**Total Skills**: ${Object.values(tailoredContent.skills).flat().length} (optimized for single-page format)

#### Programming Languages
${tailoredContent.skills.programmingLanguages.join(", ")}

#### Frameworks & Libraries
${tailoredContent.skills.frameworks.join(", ")}

#### Cloud Services
${tailoredContent.skills.cloudServices.join(", ")}

#### Databases
${tailoredContent.skills.databases.join(", ")}

#### Other Skills
${tailoredContent.skills.other.join(", ")}

### Work Experience

`;

    // Compare experience bullets
    for (let i = 0; i < tailoredContent.experience.length; i++) {
      const base = baseContent.experience[i];
      const tailored = tailoredContent.experience[i];

      report += `#### ${tailored.title} at ${tailored.company}\n\n`;

      for (let j = 0; j < Math.min(base.bullets.length, tailored.bullets.length); j++) {
        if (base.bullets[j] !== tailored.bullets[j]) {
          report += `**Bullet ${j + 1}**:\n`;
          report += `- Original: ${base.bullets[j]}\n`;
          report += `- Tailored: ${tailored.bullets[j]}\n`;
          report += `- **Change**: Rewritten to emphasize relevant skills and include keywords\n\n`;
        }
      }
    }

    report += `### Projects

`;

    for (let i = 0; i < tailoredContent.projects.length; i++) {
      const base = baseContent.projects[i];
      const tailored = tailoredContent.projects[i];

      report += `#### ${tailored.name}\n\n`;

      for (let j = 0; j < Math.min(base.bullets.length, tailored.bullets.length); j++) {
        if (base.bullets[j] !== tailored.bullets[j]) {
          report += `**Bullet ${j + 1}**:\n`;
          report += `- Original: ${base.bullets[j]}\n`;
          report += `- Tailored: ${tailored.bullets[j]}\n\n`;
        }
      }
    }

    report += `
---

## ATS Optimization

### Keyword Coverage
Tailored resume includes relevant keywords from job description to improve ATS compatibility.

### Single-Page Format
✅ Content optimized to fit on single page
✅ Clear section hierarchy for ATS parsing
✅ No graphics or tables that could confuse ATS
✅ Standard fonts and formatting

---

## Recommendations

1. **Review all bullets**: Ensure technical accuracy and that changes reflect your actual experience
2. **Check metrics**: Verify all numbers and percentages are correct
3. **Personalize further**: Add specific project names or technologies if relevant
4. **Proofread**: Check for any grammar or spelling issues
5. **Test ATS**: Consider running through an ATS checker tool online

---

## Summary

Successfully tailored resume for **${jobDescription.split("\n")[0]}**.

**Focus areas**: ${jobAnalysis.focusAreas.join(", ")}

**Key optimizations**:
- Emphasized relevant experience with ${jobAnalysis.experienceLevel.toLowerCase()} level expertise
- Incorporated critical keywords: ${jobAnalysis.criticalKeywords.slice(0, 5).join(", ")}
- Optimized for single-page, ATS-friendly format
- Maintained truthfulness while highlighting most relevant qualifications

**Next step**: Review the generated resume and make any final personal adjustments before submission.
`;

    return report;
  }
}

export default ResumeTailorTool;
