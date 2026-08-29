import { config } from '../config/env';
import { ComplaintCategory, ComplaintPriority } from '../models/Complaint';
import { logger } from '../utils/logger';

interface AICategorizationResult {
  suggestedCategory: ComplaintCategory;
  suggestedPriority: ComplaintPriority;
  confidence: number;
  tags: string[];
  summary: string;
  departmentRecommendation: string;
}

const CATEGORY_KEYWORDS: Record<ComplaintCategory, string[]> = {
  'IT/Wi-Fi': ['wifi', 'wi-fi', 'internet', 'network', 'router', 'ethernet', 'login', 'portal', 'lab computer', 'server', 'connection'],
  'Hostel': ['room', 'warden', 'hostel', 'bed', 'mattress', 'door', 'lock', 'roommate', 'cupboard', 'balcony', 'curtain', 'window'],
  'Academic': ['exam', 'class', 'lecture', 'professor', 'faculty', 'grade', 'timetable', 'attendance', 'syllabus', 'assignment', 'course'],
  'Infrastructure': ['light', 'fan', 'switch', 'socket', 'water', 'tap', 'leakage', 'bathroom', 'toilet', 'flush', 'plumbing', 'elevator', 'lift', 'ac', 'air conditioner', 'bench', 'blackboard', 'door', 'wall', 'paint'],
  'Mess/Canteen': ['food', 'mess', 'canteen', 'lunch', 'dinner', 'breakfast', 'meal', 'hygiene', 'quality', 'taste', 'roti', 'rice', 'water cooler', 'utensil'],
  'Library': ['book', 'library', 'journal', 'librarian', 'reading room', 'borrow', 'fine', 'issue', 'magazine'],
  'Transport': ['bus', 'van', 'transport', 'driver', 'route', 'shuttle', 'parking', 'pickup', 'delay'],
  'Sports': ['ground', 'gym', 'badminton', 'football', 'cricket', 'court', 'basketball', 'equipment', 'fitness', 'coach'],
  'Other': ['security', 'gate', 'id card', 'lost', 'found', 'fee', 'administrative', 'general'],
};

const URGENT_KEYWORDS = ['fire', 'spark', 'electric shock', 'short circuit', 'flood', 'burst', 'bleeding', 'injury', 'severe', 'hazard', 'emergency', 'gas leak'];
const HIGH_KEYWORDS = ['no water', 'power cut', 'broken lock', 'exam tomorrow', 'food poisoning', 'urgent', 'leakage'];

export class AIService {
  /**
   * Categorize complaint text using heuristics or OpenAI LLM
   */
  public static async categorizeComplaint(
    title: string,
    description: string
  ): Promise<AICategorizationResult> {
    const combinedText = `${title} ${description}`.toLowerCase();

    // 1. Check if OpenAI API key is present
    if (config.openai.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.openai.apiKey}`,
          },
          body: JSON.stringify({
            model: config.openai.model,
            messages: [
              {
                role: 'system',
                content:
                  'You are an AI assistant for a college complaint system. Analyze the student complaint and return a JSON object with: suggestedCategory ("Hostel"|"Academic"|"Infrastructure"|"Mess/Canteen"|"Library"|"Transport"|"IT/Wi-Fi"|"Sports"|"Other"), suggestedPriority ("low"|"medium"|"high"|"urgent"), confidence (0-1), tags (array of keywords), summary (1-sentence summary), and departmentRecommendation (recommended department name). Respond ONLY with valid JSON.',
              },
              {
                role: 'user',
                content: `Title: ${title}\nDescription: ${description}`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          return {
            suggestedCategory: parsed.suggestedCategory || 'Other',
            suggestedPriority: parsed.suggestedPriority || 'medium',
            confidence: parsed.confidence || 0.92,
            tags: parsed.tags || [],
            summary: parsed.summary || title,
            departmentRecommendation: parsed.departmentRecommendation || 'Campus Administration',
          };
        }
      } catch (err) {
        logger.warn('OpenAI categorization failed, falling back to local NLP heuristics:', err);
      }
    }

    // 2. Local heuristic NLP engine
    let bestCategory: ComplaintCategory = 'Other';
    let maxMatchCount = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let matches = 0;
      for (const kw of keywords) {
        if (combinedText.includes(kw)) {
          matches++;
        }
      }
      if (matches > maxMatchCount) {
        maxMatchCount = matches;
        bestCategory = category as ComplaintCategory;
      }
    }

    // Determine priority
    let priority: ComplaintPriority = 'medium';
    if (URGENT_KEYWORDS.some((kw) => combinedText.includes(kw))) {
      priority = 'urgent';
    } else if (HIGH_KEYWORDS.some((kw) => combinedText.includes(kw))) {
      priority = 'high';
    } else if (combinedText.length < 50) {
      priority = 'low';
    }

    const tags = combinedText
      .split(/\W+/)
      .filter((word) => word.length > 4)
      .slice(0, 5);

    return {
      suggestedCategory: bestCategory,
      suggestedPriority: priority,
      confidence: maxMatchCount > 0 ? Math.min(0.95, 0.65 + maxMatchCount * 0.1) : 0.5,
      tags: Array.from(new Set(tags)),
      summary: title,
      departmentRecommendation:
        bestCategory === 'IT/Wi-Fi'
          ? 'IT Infrastructure Department'
          : bestCategory === 'Hostel'
          ? 'Hostel Administration'
          : bestCategory === 'Academic'
          ? 'Academic Affairs'
          : bestCategory === 'Mess/Canteen'
          ? 'Hospitality & Mess Committee'
          : 'Campus Maintenance Department',
    };
  }
}
