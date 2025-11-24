# Resume Tailor Tool

An AI-powered WASABI custom tool that generates tailored, ATS-friendly single-page resumes based on job descriptions.

## 🎯 Features

- **AI-Powered Tailoring**: Uses Bedrock to analyze job descriptions and customize your resume
- **ATS-Friendly**: Optimized for Applicant Tracking Systems with keyword matching
- **Single-Page Format**: Ensures content fits on one page for maximum impact
- **Multiple Outputs**: Generates `.tex`, `.pdf`, and analysis report
- **Truthful**: Never fabricates experience - only emphasizes and reorders existing content
- **Comprehensive Analysis**: Provides detailed report of all changes made

## 📁 Project Structure

```
resume-tailor-tool/
├── base/
│   ├── main.tex                 # Your LaTeX template (AltaCV)
│   └── resume-content.json      # Your structured resume data
├── examples/
│   ├── sample-jd.txt            # Example job description
│   └── sample-output/           # Example generated files
├── tool/
│   └── ResumeTailorTool.ts      # Tool implementation
├── DESIGN.md                     # Design documentation
└── README.md                     # This file
```

## 🚀 Usage

### Step 1: Prepare Your Files

1. **Resume Content** (`base/resume-content.json`):
   - Already created with your experience, skills, and projects
   - Edit this file to keep your resume data up-to-date

2. **LaTeX Template** (`base/main.tex`):
   - Your existing AltaCV template
   - Keeps consistent formatting across all tailored resumes

### Step 2: Install the Tool

Copy the tool to WASABI's toolbag directory:

```bash
cp resume-tailor-tool/tool/ResumeTailorTool.ts ~/wasabi-toolbag/tools/
```

### Step 3: Restart WASABI

Restart WASABI to load the new tool.

### Step 4: Use the Tool

In WASABI, use the tool with a job description:

```
Can you tailor my resume for this job:

[Paste full job description here]

Use:
- Resume content: resume-tailor-tool/base/resume-content.json
- Template: resume-tailor-tool/base/main.tex
- Output: resume-tailor-tool/output/
```

Or call it directly:

```typescript
ResumeTailorTool({
  resumeContentPath: "resume-tailor-tool/base/resume-content.json",
  latexTemplatePath: "resume-tailor-tool/base/main.tex",
  jobDescription: "Full job description text here...",
  outputDir: "resume-tailor-tool/output"
})
```

## 📤 Outputs

The tool generates three files in the output directory:

1. **`tailored-resume-YYYY-MM-DD.tex`**
   - Complete LaTeX source file
   - Ready to compile or further customize

2. **`tailored-resume-YYYY-MM-DD.pdf`**
   - Compiled PDF (if pdflatex is installed)
   - Ready to submit with applications

3. **`analysis-report-YYYY-MM-DD.md`**
   - Detailed analysis of changes made
   - Shows before/after comparisons
   - Lists keywords added
   - Provides recommendations

## 🔍 What Gets Tailored

### Modified Sections
- **Professional Summary/Tagline**: Crafted specifically for the role
- **Skills**: Filtered and prioritized based on job requirements
- **Work Experience**: Bullets rewritten to emphasize relevant achievements
- **Projects**: Descriptions adjusted to match job needs

### Static Sections
- Education
- Publications
- Achievements
- Contact Information

## 🎨 Customization

### Updating Your Resume Data

Edit `base/resume-content.json` to:
- Add new experience
- Update skills
- Add new projects
- Modify existing content

### Modifying the Template

Edit `base/main.tex` to:
- Change colors
- Adjust layout
- Modify section order
- Update formatting

## 📋 Requirements

- **Node.js**: For tool execution
- **pdflatex**: For PDF compilation (optional, will work without it)
- **altacv.cls**: LaTeX class file (should be in your LaTeX distribution)

### Installing pdflatex

**macOS**:
```bash
brew install basictex
```

**Linux**:
```bash
sudo apt-get install texlive-latex-base texlive-latex-extra
```

## 💡 Tips

1. **Keep Resume Data Updated**: Regularly update `resume-content.json` with new experience

2. **Test with Sample JD**: Use `examples/sample-jd.txt` to test the tool

3. **Review Before Sending**: Always review the analysis report and verify all changes

4. **Iterate**: Run the tool multiple times with slight variations in the job description

5. **Manual Tweaks**: Feel free to manually edit the generated `.tex` file before compiling

## 🔧 Troubleshooting

### PDF Compilation Fails

- **Issue**: pdflatex not found
- **Solution**: Install LaTeX distribution (see Requirements above)

### Tool Not Available in WASABI

- **Issue**: Tool not loaded
- **Solution**: Ensure file is in `wasabi-toolbag/tools/` and restart WASABI

### AI Returns Invalid JSON

- **Issue**: Bedrock response parsing error
- **Solution**: Try again - occasional formatting issues may occur

### Resume Too Long

- **Issue**: Content doesn't fit on one page
- **Solution**: Tool should handle this, but you can manually remove less relevant items from `resume-content.json`

## 📊 Example Workflow

1. Find a job posting you want to apply for
2. Copy the full job description
3. Run the tool with the job description
4. Review the analysis report
5. Check the generated PDF
6. Make any final manual adjustments
7. Submit your tailored resume!

## 🤝 Contributing

This is a personal tool, but feel free to:
- Modify the prompts in the tool for better results
- Adjust the template to match your style
- Add more sections to the JSON structure
- Enhance the analysis report

## 📝 Notes

- **Privacy**: All processing happens locally - your resume data stays on your machine
- **AI Model**: Uses Bedrock (Claude) for content generation
- **Temperature**: Set to 0.3 for consistent, factual output
- **Token Usage**: Typical run uses ~4000-6000 tokens

## 🎓 Learning

Check out `DESIGN.md` for:
- Detailed architecture
- AI prompt strategies
- Design decisions
- Future enhancements

---

**Happy job hunting! 🚀**
