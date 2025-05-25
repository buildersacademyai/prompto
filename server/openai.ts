import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI API client
const openai = new OpenAI({ apiKey: process.env.PROMPTO_OPENAI_API_KEY });

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Download image from URL and save it locally
 */
async function downloadAndSaveImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = `generated-${uuidv4()}.png`;
    const filePath = path.join(uploadsDir, fileName);
    const file = fs.createWriteStream(filePath);

    https.get(imageUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        // Return the relative URL path that can be served by the web server
        resolve(`/uploads/${fileName}`);
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

interface SuggestedMedia {
  url: string;
  alt: string;
}

interface GeneratedAdResponse {
  text: string;
  generatedImageUrl: string;
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
 * Generate ad content based on product description and optional image uploads
 */
export async function generateAdContent(
  description: string,
  imageFiles: string[] = [],
  title?: string
): Promise<GeneratedAdResponse> {
  try {
    // Prepare messages array
    const messages: any[] = [
      {
        role: "system",
        content: "You are an expert marketing copywriter specializing in blockchain and cryptocurrency projects. If users upload images, analyze them and incorporate insights into your copy."
      }
    ];

    // Text prompt
    let userContent = `
      Create engaging ad copy for the following product or service:
      
      Description: ${description}
      
      The content should be compelling, include relevant hashtags for crypto/blockchain, and have a professional tone.
      Consider any uploaded images in your response to make the ad more relevant.
      
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

    // Note uploaded images in prompt if any
    if (imageFiles.length > 0) {
      messages.push({
        role: "user",
        content: `I have uploaded ${imageFiles.length} supporting image(s) for reference.`
      });
    }
    
    // Add the main text prompt after any images
    messages.push({
      role: "user",
      content: userContent
    });

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Check if the response has the expected structure
    if (!result.text || !Array.isArray(result.suggestedMedia)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Generate image using detailed prompt template
    const imagePrompt = `Create a visually compelling advertisement image based on the following details:

Ad Title: ${title || 'Untitled Ad'}
Ad Description: ${description}

The image should reflect the mood, tone, and message of the ad. It should be eye-catching, professional, and suitable for digital platforms like Instagram, Facebook, or banner ads.

Include key visual elements that represent the ad's theme. Use color schemes, objects, and compositions that align with the provided description. Do not include text in the image.

${imageFiles.length > 0 ? `Additional visual guidance based on user-uploaded images: User has provided ${imageFiles.length} supporting image(s). Incorporate similar visual styles, themes, or aesthetics if relevant.` : ''}

Do not generate any watermarks, logos, or branding unless specified. Keep the design clean and brand-neutral.`;
    
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const tempImageUrl = imageResponse.data[0]?.url || "";
    
    // Download and save the image permanently to avoid expiration
    const permanentImageUrl = await downloadAndSaveImage(tempImageUrl);

    return {
      text: "", // No text generation - image only
      generatedImageUrl: permanentImageUrl,
      suggestedMedia: [] // No suggested media - focus on generated image only
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
