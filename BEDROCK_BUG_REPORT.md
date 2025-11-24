# Bedrock API Bug Report

## Issue
The `context.bedrock.prompt()` API in custom WASABI tools returns an empty `messages` array even when the call succeeds.

## Reproduction
```typescript
const response = await this.context.bedrock.prompt({
  system: [{ text: "You are a helpful assistant" }],
  inputs: [{ role: "user", content: [{ text: "Say hello" }] }],
  inferenceConfig: {
    maxTokens: 100,
    temperature: 0.7
  }
});

console.log(response.stopReason);  // "end_turn" (success!)
console.log(response.messages);     // [] (empty array!)
```

## Expected Behavior
`response.messages` should contain at least one message with role="assistant" and the response text.

## Actual Behavior
- `response.stopReason` = "end_turn" (indicates success)
- `response.wasAborted` = false
- `response.messages` = [] (empty array)
- `response.tokensUsed` = undefined or 0

## Impact
Custom tools cannot use the Bedrock API directly, breaking AI-powered custom tool functionality.

## Workaround
Use the Delegate tool to call WASABI's working Bedrock integration instead of the custom tool context.bedrock API.

## Status
Reported: 2025-11-11
Tool: ResumeTailorTool
WASABI Version: Check with `wasabi --version`

## Next Steps
1. File ticket in WASABI issue tracker
2. Check #wasabi-interest Slack channel
3. Update tool once fixed

