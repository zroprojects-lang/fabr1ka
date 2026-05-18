import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function generateCopy(systemPrompt: string, userPrompt: string): Promise<string> {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  }

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-sonnet-4-6',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  })

  const response = await client.send(command)
  const result = JSON.parse(new TextDecoder().decode(response.body))
  return result.content[0].text
}
