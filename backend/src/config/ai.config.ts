import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4',
    defaultTemperature: parseFloat(process.env.OPENAI_DEFAULT_TEMPERATURE || '0.7'),
    defaultMaxTokens: parseInt(process.env.OPENAI_DEFAULT_MAX_TOKENS || '2048', 10),
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-sonnet-20240229',
  },
}));
