import { apiRequest } from "./queryClient";

// Generate ad copy with OpenAI
export async function generateAdContent(
  description: string,
  audience: string,
  type: string
) {
  try {
    const response = await apiRequest("POST", "/api/ai/generate-ad", {
      description,
      audience,
      type
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error generating ad content:", error);
    throw error;
  }
}

// Analyze content performance
export async function analyzeContentPerformance(content: string) {
  try {
    const response = await apiRequest("POST", "/api/ai/analyze-content", {
      content
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw error;
  }
}

// Generate hashtag suggestions
export async function generateHashtags(content: string, count: number = 5) {
  try {
    const response = await apiRequest("POST", "/api/ai/generate-hashtags", {
      content,
      count
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error generating hashtags:", error);
    throw error;
  }
}

// Optimize existing content
export async function optimizeContent(
  content: string,
  platform: string,
  goals: string[]
) {
  try {
    const response = await apiRequest("POST", "/api/ai/optimize-content", {
      content,
      platform,
      goals
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error optimizing content:", error);
    throw error;
  }
}
