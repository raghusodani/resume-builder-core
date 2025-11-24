# Quick Start Guide - Resume Tailor Tool

## 🚀 Get Started in 3 Steps

### Step 1: Install the Tool (30 seconds)

```bash
cp resume-tailor-tool/tool/ResumeTailorTool.ts ~/wasabi-toolbag/tools/
```

Then restart WASABI.

---

### Step 2: Test with Sample Job (2 minutes)

In WASABI, say:

```
Please read the job description from resume-tailor-tool/examples/sample-jd.txt
and tailor my resume for it.

Use:
- Resume content: resume-tailor-tool/base/resume-content.json
- LaTeX template: resume-tailor-tool/base/main.tex
- Output directory: resume-tailor-tool/output/
```

Check the output:
- `resume-tailor-tool/output/tailored-resume-[date].pdf`
- `resume-tailor-tool/output/analysis-report-[date].md`

---

### Step 3: Use with Real Job (1 minute)

When you find a real job posting:

```
Tailor my resume for this job:

[Paste entire job description here]

Use:
- Resume content: resume-tailor-tool/base/resume-content.json
- Template: resume-tailor-tool/base/main.tex
- Output: resume-tailor-tool/output/
```

**That's it!** Review the analysis report, check the PDF, and submit your application.

---

## 📋 Checklist

Before using the tool:

- [ ] Tool installed in `~/wasabi-toolbag/tools/`
- [ ] WASABI restarted
- [ ] `resume-content.json` has your latest resume data
- [ ] `pdflatex` installed (optional, for PDF generation)

For each application:

- [ ] Copy complete job description
- [ ] Run tool with job description
- [ ] Review analysis report
- [ ] Check PDF output
- [ ] Make any manual tweaks
- [ ] Submit application!

---

## 💡 Pro Tips

1. **Keep Resume Data Fresh**: Update `base/resume-content.json` monthly with new achievements
2. **Save Good Examples**: Keep successful tailored resumes for reference
3. **Read Analysis Reports**: They show exactly what changed and why
4. **Test Before Real Use**: Try with sample-jd.txt first
5. **Iterate if Needed**: Run multiple times with different emphasis

---

## 🎯 Example Usage

**You**: "Tailor my resume for this Senior React Developer job: [paste job description]"

**WASABI**: *Runs ResumeTailorTool...*

**Result**:
- ✅ Tailored LaTeX file
- ✅ Professional PDF
- ✅ Detailed analysis report
- ⏱️ Done in ~30 seconds

---

## 📚 Full Documentation

- **README.md** - Complete user guide
- **DESIGN.md** - Technical architecture
- **PROJECT_SUMMARY.md** - Overview and features

---

## ❓ Common Issues

**Q: Tool not found in WASABI**
A: Copy to `~/wasabi-toolbag/tools/` and restart WASABI

**Q: PDF not generated**
A: Install pdflatex (`brew install basictex` on macOS)

**Q: Resume too long**
A: Tool optimizes for single page - check output PDF

**Q: Want to customize AI behavior**
A: Edit `tool/ResumeTailorTool.ts` prompts (lines 266, 320)

---

## 🎓 What Happens Behind the Scenes

1. **AI analyzes** job description → extracts keywords & requirements
2. **AI tailors** your resume → rewrites bullets, prioritizes skills
3. **Tool generates** LaTeX → injects tailored content into template
4. **pdflatex compiles** → creates professional PDF
5. **Tool documents** → explains all changes in analysis report

All in ~30 seconds!

---

## 🌟 Expected Results

- **Time saved**: 30-60 minutes per application
- **Better ATS scores**: Keyword-optimized content
- **Higher quality**: Professional single-page format
- **More confidence**: Know exactly what changed and why

---

**Ready to revolutionize your job applications?**

**Start with Step 1 above! 🚀**
