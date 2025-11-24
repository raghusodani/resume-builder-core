// Direct Bedrock API test to diagnose the issue
// This simulates what the tool does

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

async function testBedrock() {
  console.log("🧪 Testing Bedrock API directly...\n");

  const client = new BedrockRuntimeClient({ region: "us-west-2" });

  const systemPrompt = "You are an expert career advisor.";
  const userPrompt = `Analyze this job:

Senior Frontend Engineer at TechCorp Inc.

Return JSON with:
{
  "companyName": "TechCorp Inc.",
  "jobTitle": "Senior Frontend Engineer",
  "keyRequirements": ["React", "TypeScript"],
  "criticalKeywords": ["React", "TypeScript", "JavaScript"],
  "experienceLevel": "Senior",
  "focusAreas": ["Frontend Development"]
}`;

  try {
    console.log("📤 Sending request to Bedrock...");

    const command = new ConverseCommand({
      modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
      messages: [
        {
          role: "user",
          content: [{ text: userPrompt }]
        }
      ],
      system: [{ text: systemPrompt }],
      inferenceConfig: {
        maxTokens: 2048,
        temperature: 0.2,
        topP: 0.9
      }
    });

    const response = await client.send(command);

    console.log("\n✅ Response received!");
    console.log("Stop reason:", response.stopReason);
    console.log("Tokens used:", response.usage);
    console.log("\nResponse content:");
    console.log(JSON.stringify(response.output, null, 2));

    if (response.output?.message?.content?.[0]?.text) {
      const text = response.output.message.content[0].text;
      console.log("\n📝 Text content:");
      console.log(text);

      // Try to parse JSON
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("\n✅ Successfully parsed JSON:");
        console.log(JSON.stringify(parsed, null, 2));
      }
    }

  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
  }
}

testBedrock();
