import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import aiConfig from '../../config/ai.config';

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
  executionTimeMs: number;
}

export interface AIFeedbackResult {
  clarity_score: number;
  specificity_score: number;
  context_score: number;
  format_score: number;
  piq_score: number;
  strengths: string[];
  improvements: string[];
  ai_comment: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor(
    @Inject(aiConfig.KEY)
    private config: ConfigType<typeof aiConfig>,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.openai.apiKey,
    });

    this.anthropic = new Anthropic({
      apiKey: this.config.anthropic.apiKey,
    });
  }

  async generateResponse(
    prompt: string,
    model: string = 'gpt-4',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {},
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const { temperature = 0.7, maxTokens = 2048, systemPrompt } = options;

    try {
      if (model.startsWith('gpt')) {
        return await this.generateOpenAIResponse(prompt, model, {
          temperature,
          maxTokens,
          systemPrompt,
          startTime,
        });
      } else if (model.startsWith('claude')) {
        return await this.generateAnthropicResponse(prompt, model, {
          temperature,
          maxTokens,
          systemPrompt,
          startTime,
        });
      }

      // Default to OpenAI
      return await this.generateOpenAIResponse(prompt, this.config.openai.defaultModel!, {
        temperature,
        maxTokens,
        systemPrompt,
        startTime,
      });
    } catch (error) {
      throw new Error(`AI 응답 생성 실패: ${error}`);
    }
  }

  private async generateOpenAIResponse(
    prompt: string,
    model: string,
    options: {
      temperature: number;
      maxTokens: number;
      systemPrompt?: string;
      startTime: number;
    },
  ): Promise<AIResponse> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await this.openai.chat.completions.create({
      model,
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model,
      tokensUsed: response.usage?.total_tokens || 0,
      executionTimeMs: Date.now() - options.startTime,
    };
  }

  private async generateAnthropicResponse(
    prompt: string,
    model: string,
    options: {
      temperature: number;
      maxTokens: number;
      systemPrompt?: string;
      startTime: number;
    },
  ): Promise<AIResponse> {
    const response = await this.anthropic.messages.create({
      model,
      max_tokens: options.maxTokens,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === 'text');

    return {
      content: textContent?.type === 'text' ? textContent.text : '',
      model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      executionTimeMs: Date.now() - options.startTime,
    };
  }

  async evaluatePrompt(promptText: string, aiResponse: string): Promise<AIFeedbackResult> {
    const evaluationPrompt = `
다음 프롬프트를 평가해주세요.

[사용자 프롬프트]
${promptText}

[AI 응답]
${aiResponse}

다음 기준으로 1-5점 척도로 평가하고, JSON 형식으로 응답해주세요:
1. clarity (명확성): 프롬프트가 얼마나 명확한가
2. specificity (구체성): 프롬프트가 얼마나 구체적인가
3. context_provision (맥락 제공): 충분한 배경 정보를 제공했는가
4. format_specification (형식 지정): 원하는 출력 형식을 명시했는가

또한 PIQ 점수(0-100)와 강점, 개선점을 제시해주세요.

JSON 형식:
{
  "clarity_score": number,
  "specificity_score": number,
  "context_score": number,
  "format_score": number,
  "piq_score": number (0-100),
  "strengths": string[],
  "improvements": string[],
  "ai_comment": string
}
`;

    const response = await this.generateResponse(evaluationPrompt, 'gpt-4');

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        clarity_score: 3,
        specificity_score: 3,
        context_score: 3,
        format_score: 3,
        piq_score: 60,
        strengths: [],
        improvements: ['평가에 실패했습니다'],
        ai_comment: response.content,
      };
    }
  }
}
