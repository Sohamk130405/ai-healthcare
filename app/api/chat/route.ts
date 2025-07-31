import { type NextRequest, NextResponse } from "next/server";
import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ChatMessages, ChatSessions, MedicalReports } from "@/config/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Function to clean markdown formatting
function cleanMarkdownText(text: string): string {
  return (
    text
      // Remove bold formatting
      .replace(/\*\*(.*?)\*\*/g, "$1")
      // Remove italic formatting
      .replace(/\*(.*?)\*/g, "$1")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bullet points and convert to simple dashes
      .replace(/^\*\s+/gm, "• ")
      .replace(/^-\s+/gm, "• ")
      // Remove extra whitespace and normalize line breaks
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// Web search function using Tavily API
async function performWebSearch(query: string): Promise<{
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
  answer?: string;
}> {
  try {
    if (!process.env.TAVILY_API_KEY) {
      console.warn("Tavily API key not configured, skipping web search");
      return { results: [] };
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_answer: true,
        include_domains: [
          "mayoclinic.org",
          "webmd.com",
          "healthline.com",
          "medlineplus.gov",
          "nih.gov",
          "cdc.gov",
          "who.int",
          "pubmed.ncbi.nlm.nih.gov",
        ],
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      results: data.results || [],
      answer: data.answer,
    };
  } catch (error) {
    console.error("Web search error:", error);
    return { results: [] };
  }
}

// Medical knowledge base function
function getHealthKnowledge(topic: string): string {
  const healthKnowledge = {
    diabetes:
      "Diabetes is a group of metabolic disorders characterized by high blood sugar levels. Type 1 diabetes is caused by the pancreas failing to produce enough insulin. Type 2 diabetes begins with insulin resistance. Common symptoms include frequent urination, increased thirst, and unexplained weight loss.",

    hypertension:
      "Hypertension (high blood pressure) is a condition where blood pressure in the arteries is persistently elevated. Normal blood pressure is below 120/80 mmHg. Hypertension is often called the 'silent killer' because it typically has no symptoms but can lead to heart disease, stroke, and kidney problems.",

    "heart disease":
      "Heart disease refers to several types of heart conditions, including coronary artery disease, heart rhythm problems, and heart defects. Coronary artery disease is the most common type, caused by narrowed or blocked coronary arteries that supply blood to the heart muscle.",

    covid:
      "COVID-19 is an infectious disease caused by the SARS-CoV-2 virus. Common symptoms include fever, cough, fatigue, and loss of taste or smell. Most people with COVID-19 experience mild to moderate symptoms, but some may develop severe illness requiring hospitalization.",

    "mental health":
      "Mental health includes emotional, psychological, and social well-being. It affects how we think, feel, and act. Common mental health conditions include depression, anxiety disorders, bipolar disorder, and schizophrenia. Treatment often involves therapy, medication, or a combination of both.",

    cancer:
      "Cancer is a group of diseases involving abnormal cell growth with the potential to invade or spread to other parts of the body. Early detection through screening and recognizing warning signs can significantly improve treatment outcomes.",

    asthma:
      "Asthma is a respiratory condition in which airways narrow and swell and may produce extra mucus. This can make breathing difficult and trigger coughing, wheezing, and shortness of breath.",

    arthritis:
      "Arthritis refers to inflammation of one or more joints, causing pain and stiffness that can worsen with age. The most common types are osteoarthritis and rheumatoid arthritis.",
  };

  const lowerTopic = topic.toLowerCase();
  for (const [key, knowledge] of Object.entries(healthKnowledge)) {
    if (lowerTopic.includes(key)) {
      return knowledge;
    }
  }

  return "";
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Google Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const { messages, sessionId } = await req.json();
    const userEmail = user.primaryEmailAddress?.emailAddress!; // Replace with actual email from Clerk

    let conversationHistory: any[] = [];
    let medicalContext = "";

    // If sessionId is provided, fetch conversation history and medical reports from database
    if (sessionId) {
      try {
        // Verify session belongs to user and get medicalReportIds
        const session = await db
          .select()
          .from(ChatSessions)
          .where(eq(ChatSessions.id, Number.parseInt(sessionId)))
          .limit(1);

        if (session.length && session[0].userEmail === userEmail) {
          const dbMessages = await db
            .select()
            .from(ChatMessages)
            .where(eq(ChatMessages.sessionId, Number.parseInt(sessionId)))
            .orderBy(asc(ChatMessages.createdAt));

          // Convert database messages to AI SDK format
          conversationHistory = dbMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
          }));

          // Fetch medical report context if IDs are present
          const reportIds = session[0].medicalReportIds as number[] | null;
          if (reportIds && reportIds.length > 0) {
            const reports = await db
              .select({ extractedText: MedicalReports.extractedText })
              .from(MedicalReports)
              .where(inArray(MedicalReports.id, reportIds));

            medicalContext = reports
              .map((r) => r.extractedText)
              .filter(Boolean)
              .join("\n\n---\n\n");
          }
        }
      } catch (error) {
        console.error(
          "Error fetching conversation history or medical reports:",
          error
        );
      }
    }

    // Combine conversation history with new messages
    const allMessages = [...conversationHistory, ...messages];

    // Track tool usage for citation purposes
    let usedWebSearch = false;
    let usedHealthKnowledge = false;

    // Construct the system prompt
    let systemPrompt = `You are an advanced AI health assistant with access to web search and comprehensive medical knowledge. You provide evidence-based health information by:

1. Using your built-in medical knowledge base
2. Performing web searches for the latest medical information when needed
3. Analyzing user's medical reports if provided
4. Always including proper citations for external sources

IMPORTANT GUIDELINES:
- You are not a replacement for professional medical advice
- Users should consult healthcare professionals for serious concerns
- In emergencies, they should contact emergency services immediately
- Your responses are for informational purposes only
- Always cite your sources when using external information
- Be empathetic, helpful, and provide accurate health information
- Focus on evidence-based medicine and trusted medical sources

When providing information from web searches, always include citations in this format:
Sources:
[1] Title - URL
[2] Title - URL

You have access to conversation history and can reference previous messages to maintain context.

Please provide responses in plain text format without markdown formatting. Use simple bullet points (•) for lists and avoid bold, italic, or other markdown syntax.`;

    if (medicalContext) {
      systemPrompt += `\n\nMEDICAL CONTEXT: The user has provided the following medical report text for context:\n\n${medicalContext}`;
    }

    let fullResponseText = "";
    const citations: string[] = [];

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: allMessages,
      maxTokens: 1500,
      maxSteps: 3,
      tools: {
        webSearch: tool({
          description:
            "Search the web for current health information, medical research, or specific health topics. Use this when you need up-to-date information or when the user asks about recent developments, specific medications, treatments, or conditions not covered in your knowledge base.",
          parameters: z.object({
            query: z
              .string()
              .describe("The search query for health-related information"),
            reason: z
              .string()
              .describe("Why this search is needed for the user's question"),
          }),
          execute: async ({ query, reason }) => {
            console.log(
              `🔍 Performing web search: ${query} (Reason: ${reason})`
            );
            usedWebSearch = true;

            const searchResults = await performWebSearch(query);

            // Add citations
            searchResults.results.forEach((result) => {
              const citation = `[${citations.length + 1}] ${result.title} - ${
                result.url
              }`;
              citations.push(citation);
            });

            return {
              results: searchResults.results.map((r) => ({
                title: r.title,
                content: r.content.substring(0, 800), // Increased content length
                url: r.url,
                score: r.score,
              })),
              answer: searchResults.answer,
              searchQuery: query,
              totalResults: searchResults.results.length,
              citationsAdded: searchResults.results.length,
            };
          },
        }),

        getHealthKnowledge: tool({
          description:
            "Access built-in medical knowledge base for common health conditions and topics",
          parameters: z.object({
            topic: z
              .string()
              .describe(
                "The health topic or condition to get information about"
              ),
          }),
          execute: async ({ topic }) => {
            console.log(`📚 Accessing health knowledge for: ${topic}`);
            usedHealthKnowledge = true;

            const knowledge = getHealthKnowledge(topic);

            return {
              topic,
              knowledge:
                knowledge ||
                "No specific knowledge found for this topic in the built-in database.",
              hasKnowledge: !!knowledge,
              source: "Built-in Medical Knowledge Base",
            };
          },
        }),

        analyzeSymptoms: tool({
          description:
            "Analyze symptoms mentioned by the user and provide general guidance",
          parameters: z.object({
            symptoms: z
              .array(z.string())
              .describe("List of symptoms mentioned by the user"),
            severity: z
              .enum(["mild", "moderate", "severe", "unknown"])
              .describe("Perceived severity of symptoms"),
            duration: z
              .string()
              .optional()
              .describe("How long the symptoms have been present"),
          }),
          execute: async ({ symptoms, severity, duration }) => {
            console.log(
              `🩺 Analyzing symptoms: ${symptoms.join(
                ", "
              )} (Severity: ${severity})`
            );

            const urgentSymptoms = [
              "chest pain",
              "difficulty breathing",
              "severe headache",
              "loss of consciousness",
              "severe bleeding",
              "stroke symptoms",
              "heart attack symptoms",
              "severe allergic reaction",
              "severe abdominal pain",
              "high fever",
              "seizure",
            ];

            const hasUrgentSymptoms = symptoms.some((symptom) =>
              urgentSymptoms.some((urgent) =>
                symptom.toLowerCase().includes(urgent.toLowerCase())
              )
            );

            let advice = "";
            if (hasUrgentSymptoms || severity === "severe") {
              advice =
                "⚠️ URGENT: These symptoms may require immediate medical attention. Please contact emergency services (911) or visit the nearest emergency room immediately.";
            } else if (severity === "moderate") {
              advice =
                "Consider scheduling an appointment with your healthcare provider within the next few days to discuss these symptoms.";
            } else {
              advice =
                "Monitor your symptoms and consider consulting with a healthcare provider if they persist, worsen, or if you develop additional concerning symptoms.";
            }

            return {
              symptoms,
              severity,
              duration: duration || "Not specified",
              requiresImmediateAttention:
                hasUrgentSymptoms || severity === "severe",
              generalAdvice: advice,
              recommendedAction: hasUrgentSymptoms
                ? "Seek emergency care immediately"
                : "Monitor and consult healthcare provider if needed",
              analyzedAt: new Date().toISOString(),
            };
          },
        }),

        checkMedicalInteractions: tool({
          description:
            "Check for potential interactions between medications or treatments",
          parameters: z.object({
            medications: z
              .array(z.string())
              .describe("List of medications or treatments to check"),
            conditions: z
              .array(z.string())
              .optional()
              .describe("Existing medical conditions"),
          }),
          execute: async ({ medications, conditions }) => {
            console.log(
              `💊 Checking interactions for: ${medications.join(", ")}`
            );

            // This is a simplified interaction checker - in production, you'd use a proper drug interaction API
            const commonInteractions = {
              "blood thinner": ["aspirin", "ibuprofen", "warfarin"],
              "diabetes medication": ["insulin", "metformin"],
              "blood pressure medication": ["ace inhibitors", "beta blockers"],
            };

            const warnings: string[] = [];

            // Simple interaction detection
            medications.forEach((med1, i) => {
              medications.forEach((med2, j) => {
                if (i !== j) {
                  const med1Lower = med1.toLowerCase();
                  const med2Lower = med2.toLowerCase();

                  if (
                    (med1Lower.includes("blood thinner") ||
                      med1Lower.includes("warfarin")) &&
                    (med2Lower.includes("aspirin") ||
                      med2Lower.includes("ibuprofen"))
                  ) {
                    warnings.push(`Potential bleeding risk: ${med1} + ${med2}`);
                  }
                }
              });
            });

            return {
              medications,
              conditions: conditions || [],
              potentialInteractions: warnings,
              hasInteractions: warnings.length > 0,
              recommendation:
                warnings.length > 0
                  ? "Please consult your healthcare provider or pharmacist about these potential interactions."
                  : "No obvious interactions detected, but always consult your healthcare provider about medication combinations.",
              checkedAt: new Date().toISOString(),
            };
          },
        }),
      },
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          fullResponseText += chunk.textDelta;
        }
      },
      onFinish: async (result) => {
        // Clean the AI response text
        let cleanedText = cleanMarkdownText(fullResponseText);

        // Ensure citations are always present
        if (citations.length === 0) {
          if (usedWebSearch) {
            // This case should ideally not happen if webSearch was used and returned results
            citations.push("[1] No specific web results found for this query.");
          } else if (usedHealthKnowledge) {
            citations.push("[1] Built-in Medical Knowledge Base");
          } else {
            citations.push("[1] No external sources used for this response.");
          }
        }

        // Add citations at the end
        cleanedText += "\n\nSources:\n" + citations.join("\n");

        // Save both user message and AI response to database if sessionId is provided
        if (sessionId) {
          try {
            const lastUserMessage = messages[messages.length - 1];

            // Save user message
            if (lastUserMessage) {
              await db.insert(ChatMessages).values({
                sessionId: Number.parseInt(sessionId),
                content: lastUserMessage.content,
                sender: "user",
                metadata: { tokens: result.usage?.promptTokens || 0 },
              });
            }

            // Save AI response (cleaned with citations)
            await db.insert(ChatMessages).values({
              sessionId: Number.parseInt(sessionId),
              content: cleanedText,
              sender: "ai",
              metadata: {
                tokens: result.usage?.completionTokens || 0,
                model: "gemini-2.5-flash",
                finishReason: result.finishReason,
                toolCalls: result.toolCalls?.length || 0,
                citations: citations.length,
                steps: result.steps?.length || 0,
              },
            });

            // Update session timestamp
            await db
              .update(ChatSessions)
              .set({ updatedAt: new Date() })
              .where(eq(ChatSessions.id, Number.parseInt(sessionId)));
          } catch (error) {
            console.error("Error saving messages to database:", error);
          }
        }
      },
    });

    // Return the stream response directly
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to process chat request. Please check your API configuration.",
      },
      { status: 500 }
    );
  }
}
