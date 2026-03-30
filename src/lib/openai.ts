import OpenAI from "openai";

let _defaultClient: OpenAI | null = null;

export function getOpenAIClient(apiKey?: string, baseURL?: string): OpenAI {
  if (apiKey) {
    return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  }
  if (!_defaultClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("API 키가 설정되지 않았습니다. 설정에서 API 키를 입력하거나 OPENAI_API_KEY 환경변수를 설정하세요.");
    }
    _defaultClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _defaultClient;
}
