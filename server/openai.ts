import OpenAI from "openai";

// Initialize OpenAI API client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SuggestedMedia {
  url: string;
  alt: string;
}

interface GeneratedAdResponse {
  text: string;
  suggestedMedia: SuggestedMedia[];
}

interface ContentAnalysisResponse {
  sentiment: number;
  engagement: number;
  suggestions: string[];
}

interface OptimizedContentResponse {
  content: string;
  reasons: string[];
}

/**
 * Generate ad content based on product description, target audience, and ad type
 */
export async function generateAdContent(
  description: string,
  audience: string,
  type: string
): Promise<GeneratedAdResponse> {
  try {
    const prompt = `
      Create engaging ad copy for the following:
      
      Product/Service: ${description}
      
      Target Audience: ${audience}
      
      Ad Type: ${type}
      
      The content should be compelling, include relevant hashtags for crypto/blockchain, and match the tone appropriate for the platform.
      Please format the response as JSON with the following structure:
      {
        "text": "The ad copy text with appropriate formatting",
        "suggestedMedia": [
          {
            "url": "URL to a relevant stock image",
            "alt": "Description of the image"
          }
        ]
      }
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing copywriter specializing in blockchain and cryptocurrency projects."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Check if the response has the expected structure
    if (!result.text || !Array.isArray(result.suggestedMedia)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      text: result.text,
      suggestedMedia: result.suggestedMedia.map((media: any) => ({
        url: media.url,
        alt: media.alt
      }))
    };
  } catch (error: any) {
    console.error("Error generating ad content:", error);
    throw new Error(`Failed to generate ad content: ${error.message}`);
  }
}

/**
 * Analyze content sentiment and potential engagement
 */
export async function analyzeContentSentiment(content: string): Promise<ContentAnalysisResponse> {
  try {
    const prompt = `
      Analyze the following ad copy for sentiment, potential engagement, and provide suggestions for improvement:
      
      ${content}
      
      Please provide the analysis as JSON with the following structure:
      {
        "sentiment": <number between 0 and 1, where 0 is negative and 1 is positive>,
        "engagement": <predicted engagement score from 0 to 10>,
        "suggestions": [<list of suggestions to improve the content>]
      }
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in social media analytics and content optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Check if the response has the expected structure
    if (typeof result.sentiment !== 'number' || typeof result.engagement !== 'number' || !Array.isArray(result.suggestions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      sentiment: result.sentiment,
      engagement: result.engagement,
      suggestions: result.suggestions
    };
  } catch (error: any) {
    console.error("Error analyzing content:", error);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

/**
 * Generate relevant hashtags for content
 */
export async function generateHashtags(content: string, count: number = 5): Promise<string[]> {
  try {
    const prompt = `
      Generate ${count} relevant and trending hashtags for the following content that would appeal to a crypto/blockchain audience:
      
      ${content}
      
      Please return only the array of hashtags in JSON format:
      {
        "hashtags": [<list of hashtags>]
      }
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in social media marketing for cryptocurrency and blockchain projects."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Check if the response has the expected structure
    if (!Array.isArray(result.hashtags)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return result.hashtags;
  } catch (error: any) {
    console.error("Error generating hashtags:", error);
    throw new Error(`Failed to generate hashtags: ${error.message}`);
  }
}

/**
 * Optimize content for specific platform and goals
 */
export async function optimizeContent(
  content: string,
  platform: string,
  goals: string[]
): Promise<OptimizedContentResponse> {
  try {
    const prompt = `
      Optimize the following content for ${platform} platform with these goals: ${goals.join(", ")}
      
      Original content:
      ${content}
      
      Please provide the optimized content and reasons for changes in JSON format:
      {
        "content": <optimized content>,
        "reasons": [<list of reasons explaining the changes>]
      }
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in platform-specific content optimization for social media."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Check if the response has the expected structure
    if (typeof result.content !== 'string' || !Array.isArray(result.reasons)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      content: result.content,
      reasons: result.reasons
    };
  } catch (error: any) {
    console.error("Error optimizing content:", error);
    throw new Error(`Failed to optimize content: ${error.message}`);
  }
}
