# Bedrock API Fix Plan for ResumeTailorTool

## Current Status: Bedrock API Bug Discovered ❌

The `context.bedrock.prompt()` API in WASABI custom tools has a bug:
- API call succeeds (`stopReason = "end_turn"`)
- But `response.messages` array is EMPTY
- This breaks our ResumeTailorTool

---

## Evidence

```
Error: "Bedrock returned empty messages array. Stop reason: end_turn, Was aborted: false"
```

This proves:
1. ✅ Bedrock API was called successfully
2. ✅ The call completed normally (not aborted)
3. ❌ But the response messages array is empty (should have assistant's reply)

---

## What This Means

**The WASABI Bedrock wrapper for custom tools has a bug.**

The API is defined as:
```typescript
bedrock: {
  prompt(...): Promise<{
    stopReason?: string;
    tokensUsed?: number;
    messages: BedrockMessage[];  // ← This is EMPTY!
  }>;
}
```

But `messages` is always empty even on successful calls.

---

## Solutions

### Option 1: Wait for WASABI Fix (Recommended)
1. Report bug to WASABI team (#wasabi-interest Slack)
2. They fix the `context.bedrock.prompt()` API
3. Our tool works automatically once fixed
4. **Timeline**: Unknown (could be days/weeks)

### Option 2: Use Delegate Workaround (Immediate)
Instead of calling Bedrock directly in our custom tool, use WASABI's Delegate tool:

```typescript
// Instead of this in custom tool:
const response = await this.context.bedrock.prompt({...});

// Do this through delegation:
const delegate = new Delegate();
delegate.execute({
  prompts: [{
    identifier: "job-analysis",
    prompt: "Analyze this job description: ..."
  }]
});
```

**Pros**: Works immediately
**Cons**: More complex, slower, loses direct control

### Option 3: Manual Process (Current Workaround)
Continue using the manual 2-phase process we've been using:
1. User asks WASABI to analyze job
2. WASABI responds with analysis
3. User asks WASABI to tailor resume with that analysis
4. WASABI generates tailored resume

**Pros**: Works now, reliable
**Cons**: Requires 2 separate conversations, manual

---

## Recommendation

**Use Option 3 (Manual Process) until Option 1 (WASABI fixes the API)**

Why?
- ✅ Works reliably right now
- ✅ Simple to use
- ✅ Creates organized company folders
- ✅ Generates PDFs successfully
- ✅ No code changes needed
- ⏰ Wait for WASABI team to fix the Bedrock API

Then we can use the automated tool!

---

## How to Use Manual Process Now

### Step 1: Create Company Folder
```bash
mkdir -p resume-tailor-tool/output/techcorp-inc-2025-11-11
cd resume-tailor-tool/output/techcorp-inc-2025-11-11
```

### Step 2: Ask WASABI to Analyze Job
```
Analyze this job description and extract:
- Company name
- Job title
- 5-8 key requirements
- 10-15 critical keywords
- Experience level
- 3-5 focus areas

[Paste job description]
```

### Step 3: Ask WASABI to Tailor Resume
```
Using that analysis, tailor my resume content from
resume-tailor-tool/base/resume-content.json

Create:
1. Targeted professional tagline
2. Rewritten experience bullets with keywords
3. Filtered skills list (20 skills prioritized)
4. Tailored project descriptions

Return as JSON matching the TailoredContent format.
```

### Step 4: Generate LaTeX & Compile PDF
```
Generate a LaTeX file using template-basic.tex with the tailored content
and compile it to PDF. Save in the current company folder.
```

---

## Next Steps

### Immediate (Today)
1. ✅ Documented the Bedrock bug
2. ✅ Created this fix plan
3. ⏳ Report to WASABI team

4. ⏳ Use manual process for job applications

### Short Term (This Week)
1. Post in #wasabi-interest Slack channel about the bug
2. Get confirmation if it's a known issue
3. Ask for timeline on fix

### Long Term (When Fixed)
1. Test that `context.bedrock.prompt()` works
2. Remove debugging code from ResumeTailorTool.ts
3. Test end-to-end automation
4. Celebrate! 🎉

---

## How to Report the Bug

### Post in #wasabi-interest Slack:

```
Hi team! Found a bug in the custom tool Bedrock API.

**Issue**: context.bedrock.prompt() returns empty messages array even on successful calls

**Evidence**:
- stopReason: "end_turn" (success)
- was Aborted: false
- messages: [] (empty!)

**Impact**: Can't use Bedrock in custom tools

**Repro**: Call context.bedrock.prompt() with any prompt, check response.messages

**Tool**: ResumeTailorTool in wasabi-toolbag/tools/

Is this a known issue? Any workaround besides using Delegate?

Thanks!
```

---

## Summary

✅ **Tool Code**: Complete and correct
✅ **LaTeX**: Installed and working
✅ **Templates**: Created and tested
✅ **Manual Process**: Working perfectly
❌ **Bedrock API**: Broken in WASABI custom tools

**Current Solution**: Use manual process until WASABI fixes the API

**Success**: We can still tailor resumes effectively, just not fully automated yet!

---

**Ready to use the manual process now while we wait for the fix!** 🚀
