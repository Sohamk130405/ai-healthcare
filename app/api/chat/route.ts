import { type NextRequest, NextResponse } from "next/server";
import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ChatMessages, ChatSessions, MedicalReports } from "@/config/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
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

// YouTube search function
async function searchYouTube(query: string): Promise<{
  videos: Array<{
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
    duration?: string;
  }>;
}> {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn("YouTube API key not configured, skipping YouTube search");
      return { videos: [] };
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=5&key=${
        process.env.YOUTUBE_API_KEY
      }&safeSearch=strict&relevanceLanguage=en`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      videos:
        data.items?.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
        })) || [],
    };
  } catch (error) {
    console.error("YouTube search error:", error);
    return { videos: [] };
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
    const userEmail = user.primaryEmailAddress?.emailAddress!;

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
    let usedYouTubeSearch = false;

    // Construct the system prompt
    let systemPrompt = `You are an advanced AI health assistant with comprehensive tools and capabilities. You provide evidence-based health information by:

1. Using your built-in medical knowledge base
2. Performing web searches for the latest medical information
3. Searching YouTube for educational health videos
4. Creating personalized diet plans
5. Designing exercise routines
6. Analyzing symptoms and providing guidance
7. Checking medication interactions
8. Setting up health tracking and reminders
9. Analyzing user's medical reports if provided

IMPORTANT GUIDELINES:
- Your not a personal assistant, you are medical assistant, provide responses which are related to medical field.
- If user asks anything which is not related to medical field. Respond with a kind and gentle message, which would say you cant perform this action.
- You are not a replacement for professional medical advice
- Users should consult healthcare professionals for serious concerns
- In emergencies, they should contact emergency services immediately
- Your responses are for informational purposes only
- Always cite your sources when using external information
- Be empathetic, helpful, and provide accurate health information
- Focus on evidence-based medicine and trusted medical sources

When providing information from web searches or YouTube videos, always include citations.
When creating diet or exercise plans, consider user's health conditions, preferences, and limitations.
When embedding YouTube videos, use the format: [VIDEO:videoId:title]

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
      maxTokens: 2000,
      maxSteps: 5,
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
                content: r.content.substring(0, 800),
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

        youtubeSearch: tool({
          description:
            "Search YouTube for educational health videos, exercise demonstrations, cooking tutorials, meditation guides, or other health-related content. Use this when users want to see visual demonstrations or educational videos.",
          parameters: z.object({
            query: z
              .string()
              .describe("The search query for health-related YouTube videos"),
            purpose: z
              .string()
              .describe("What the user wants to learn or see from the videos"),
          }),
          execute: async ({ query, purpose }) => {
            console.log(`🎥 Searching YouTube: ${query} (Purpose: ${purpose})`);
            usedYouTubeSearch = true;

            const searchResults = await searchYouTube(query);

            // Add video citations
            searchResults.videos.forEach((video) => {
              const citation = `[${citations.length + 1}] ${video.title} by ${
                video.channelTitle
              } - https://youtube.com/watch?v=${video.id}`;
              citations.push(citation);
            });

            return {
              videos: searchResults.videos,
              searchQuery: query,
              purpose,
              totalVideos: searchResults.videos.length,
              citationsAdded: searchResults.videos.length,
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

        createDietPlan: tool({
          description:
            "Create a personalized diet plan based on user's health goals, dietary restrictions, and medical conditions",
          parameters: z.object({
            goal: z
              .enum([
                "weight_loss",
                "weight_gain",
                "muscle_building",
                "heart_health",
                "diabetes_management",
                "general_health",
                "digestive_health",
              ])
              .describe("The primary health or fitness goal"),
            restrictions: z
              .array(z.string())
              .optional()
              .describe("Dietary restrictions or allergies"),
            medicalConditions: z
              .array(z.string())
              .optional()
              .describe("Relevant medical conditions to consider"),
            preferences: z
              .array(z.string())
              .optional()
              .describe("Food preferences or cultural dietary preferences"),
            duration: z
              .enum(["1_week", "2_weeks", "1_month"])
              .default("1_week")
              .describe("Duration for the diet plan"),
          }),
          execute: async ({
            goal,
            restrictions = [],
            medicalConditions = [],
            preferences = [],
            duration,
          }) => {
            console.log(`🥗 Creating diet plan for goal: ${goal}`);

            // Sample diet plan generation logic
            const mealPlans: any = {
              weight_loss: {
                breakfast: [
                  "Greek yogurt with berries and nuts",
                  "Oatmeal with cinnamon and apple slices",
                  "Vegetable omelet with whole grain toast",
                ],
                lunch: [
                  "Grilled chicken salad with mixed greens",
                  "Quinoa bowl with roasted vegetables",
                  "Lentil soup with side salad",
                ],
                dinner: [
                  "Baked salmon with steamed broccoli",
                  "Grilled chicken with sweet potato",
                  "Vegetable stir-fry with brown rice",
                ],
                snacks: [
                  "Apple with almond butter",
                  "Carrot sticks with hummus",
                  "Mixed nuts (small portion)",
                ],
              },
              heart_health: {
                breakfast: [
                  "Oatmeal with walnuts and blueberries",
                  "Avocado toast on whole grain bread",
                  "Smoothie with spinach, banana, and flaxseed",
                ],
                lunch: [
                  "Mediterranean salad with olive oil",
                  "Grilled fish with quinoa",
                  "Bean and vegetable soup",
                ],
                dinner: [
                  "Baked cod with roasted vegetables",
                  "Chicken and vegetable curry",
                  "Tofu stir-fry with brown rice",
                ],
                snacks: [
                  "Handful of almonds",
                  "Fresh fruit",
                  "Dark chocolate (small piece)",
                ],
              },
            };

            const selectedPlan = mealPlans[goal] || mealPlans.weight_loss;

            return {
              goal,
              duration,
              restrictions,
              medicalConditions,
              preferences,
              mealPlan: selectedPlan,
              guidelines: [
                "Drink at least 8 glasses of water daily",
                "Eat meals at regular intervals",
                "Include a variety of colorful vegetables",
                "Choose whole grains over refined grains",
                "Limit processed foods and added sugars",
              ],
              tips: [
                "Meal prep on weekends to save time",
                "Keep healthy snacks readily available",
                "Listen to your body's hunger and fullness cues",
                "Consult with a registered dietitian for personalized advice",
              ],
              createdAt: new Date().toISOString(),
            };
          },
        }),

        createExercisePlan: tool({
          description:
            "Create a personalized exercise routine based on fitness goals, current fitness level, and any physical limitations",
          parameters: z.object({
            goal: z
              .enum([
                "weight_loss",
                "muscle_building",
                "cardiovascular_health",
                "flexibility",
                "general_fitness",
                "rehabilitation",
                "strength_training",
              ])
              .describe("The primary fitness goal"),
            fitnessLevel: z
              .enum(["beginner", "intermediate", "advanced"])
              .describe("Current fitness level"),
            limitations: z
              .array(z.string())
              .optional()
              .describe("Physical limitations or injuries to consider"),
            timeAvailable: z
              .enum(["15_min", "30_min", "45_min", "60_min", "90_min"])
              .describe("Time available per workout session"),
            frequency: z
              .enum(["2_days", "3_days", "4_days", "5_days", "6_days"])
              .describe("Number of workout days per week"),
            equipment: z
              .array(z.string())
              .optional()
              .describe(
                "Available equipment (e.g., dumbbells, resistance bands)"
              ),
          }),
          execute: async ({
            goal,
            fitnessLevel,
            limitations = [],
            timeAvailable,
            frequency,
            equipment = [],
          }) => {
            console.log(`💪 Creating exercise plan for goal: ${goal}`);

            const exercisePlans: any = {
              weight_loss: {
                beginner: [
                  "Walking (20-30 minutes)",
                  "Bodyweight squats (2 sets of 10)",
                  "Modified push-ups (2 sets of 8)",
                  "Plank hold (30 seconds)",
                  "Stretching (10 minutes)",
                ],
                intermediate: [
                  "Jogging (25-35 minutes)",
                  "Squats (3 sets of 15)",
                  "Push-ups (3 sets of 12)",
                  "Burpees (2 sets of 8)",
                  "Mountain climbers (3 sets of 20)",
                ],
                advanced: [
                  "HIIT running (30-40 minutes)",
                  "Jump squats (4 sets of 15)",
                  "Push-up variations (4 sets of 15)",
                  "Burpees (3 sets of 12)",
                  "Circuit training (20 minutes)",
                ],
              },
              muscle_building: {
                beginner: [
                  "Bodyweight squats (3 sets of 12)",
                  "Push-ups (3 sets of 10)",
                  "Lunges (2 sets of 10 each leg)",
                  "Plank (3 sets of 30 seconds)",
                  "Glute bridges (3 sets of 15)",
                ],
                intermediate: [
                  "Weighted squats (4 sets of 12)",
                  "Chest press (4 sets of 10)",
                  "Deadlifts (3 sets of 8)",
                  "Pull-ups/Lat pulldowns (3 sets of 8)",
                  "Shoulder press (3 sets of 10)",
                ],
                advanced: [
                  "Heavy compound lifts (5 sets of 5)",
                  "Progressive overload training",
                  "Supersets and drop sets",
                  "Advanced movement patterns",
                  "Periodized training program",
                ],
              },
            };

            const selectedExercises =
              exercisePlans[goal]?.[fitnessLevel] ||
              exercisePlans.weight_loss.beginner;

            return {
              goal,
              fitnessLevel,
              timeAvailable,
              frequency,
              limitations,
              equipment,
              exercises: selectedExercises,
              weeklySchedule: {
                monday: "Upper body focus",
                tuesday: "Cardio and core",
                wednesday: "Rest or light activity",
                thursday: "Lower body focus",
                friday: "Full body circuit",
                saturday: "Active recovery",
                sunday: "Rest",
              },
              guidelines: [
                "Always warm up before exercising (5-10 minutes)",
                "Cool down and stretch after workouts",
                "Stay hydrated throughout your workout",
                "Listen to your body and rest when needed",
                "Progress gradually to avoid injury",
              ],
              safetyTips: [
                "Use proper form over heavy weights",
                "Stop if you feel pain (not muscle fatigue)",
                "Get adequate rest between workout days",
                "Consult a fitness professional if unsure about form",
              ],
              createdAt: new Date().toISOString(),
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

        createMedicationReminder: tool({
          description: "Help create a medication schedule and reminder system",
          parameters: z.object({
            medications: z
              .array(
                z.object({
                  name: z.string(),
                  dosage: z.string(),
                  frequency: z.string(),
                  timeOfDay: z.array(z.string()),
                  withFood: z.boolean().optional(),
                  specialInstructions: z.string().optional(),
                })
              )
              .describe("List of medications with their details"),
            timezone: z.string().optional().describe("User's timezone"),
          }),
          execute: async ({ medications, timezone }) => {
            console.log(
              `⏰ Creating medication reminders for ${medications.length} medications`
            );

            const schedule = medications.map((med) => ({
              ...med,
              reminders: med.timeOfDay.map((time) => ({
                time,
                message: `Take ${med.dosage} of ${med.name}${
                  med.withFood ? " with food" : ""
                }`,
                specialInstructions: med.specialInstructions,
              })),
            }));

            return {
              medications,
              schedule,
              timezone: timezone || "UTC",
              tips: [
                "Set phone alarms for each medication time",
                "Use a pill organizer for weekly planning",
                "Keep medications in a visible location",
                "Never skip doses without consulting your doctor",
                "Keep a medication log to track adherence",
              ],
              warnings: [
                "Always take medications as prescribed",
                "Don't stop medications without doctor approval",
                "Report side effects to your healthcare provider",
                "Keep medications in original containers",
                "Check expiration dates regularly",
              ],
              createdAt: new Date().toISOString(),
            };
          },
        }),

        trackHealthMetrics: tool({
          description:
            "Help users track and analyze health metrics like blood pressure, weight, blood sugar, etc.",
          parameters: z.object({
            metricType: z
              .enum([
                "blood_pressure",
                "weight",
                "blood_sugar",
                "heart_rate",
                "temperature",
                "sleep",
                "mood",
                "pain_level",
              ])
              .describe("Type of health metric to track"),
            value: z.string().describe("The measured value"),
            unit: z.string().describe("Unit of measurement"),
            timestamp: z
              .string()
              .optional()
              .describe("When the measurement was taken"),
            notes: z
              .string()
              .optional()
              .describe("Additional notes about the measurement"),
          }),
          execute: async ({ metricType, value, unit, timestamp, notes }) => {
            console.log(`📊 Tracking ${metricType}: ${value} ${unit}`);

            // Define normal ranges for different metrics
            const normalRanges: any = {
              blood_pressure: {
                normal: "Less than 120/80 mmHg",
                elevated: "120-129 systolic, less than 80 diastolic",
                high_stage1: "130-139 systolic or 80-89 diastolic",
                high_stage2: "140/90 mmHg or higher",
              },
              blood_sugar: {
                fasting: "70-100 mg/dL (normal)",
                postMeal: "Less than 140 mg/dL (normal)",
                a1c: "Less than 5.7% (normal)",
              },
              heart_rate: {
                resting: "60-100 bpm (normal for adults)",
                active: "Varies based on age and fitness level",
              },
            };

            let analysis = "";
            let recommendations: any[] = [];

            // Simple analysis based on metric type
            if (metricType === "blood_pressure") {
              const [systolic, diastolic] = value.split("/").map(Number);
              if (systolic >= 140 || diastolic >= 90) {
                analysis =
                  "This reading is in the high blood pressure range. Consider consulting your healthcare provider.";
                recommendations = [
                  "Monitor readings regularly",
                  "Reduce sodium intake",
                  "Exercise regularly",
                  "Manage stress",
                  "Consult your doctor",
                ];
              } else if (systolic >= 130 || diastolic >= 80) {
                analysis =
                  "This reading is elevated. Lifestyle changes may help.";
                recommendations = [
                  "Maintain a healthy diet",
                  "Regular physical activity",
                  "Monitor regularly",
                ];
              } else {
                analysis = "This reading is within normal range.";
                recommendations = ["Continue healthy lifestyle habits"];
              }
            }

            return {
              metricType,
              value,
              unit,
              timestamp: timestamp || new Date().toISOString(),
              notes: notes || "",
              analysis,
              normalRange:
                normalRanges[metricType] ||
                "Consult healthcare provider for normal ranges",
              recommendations,
              trends: "Track multiple readings to identify trends",
              nextSteps: [
                "Continue regular monitoring",
                "Share data with healthcare provider",
                "Look for patterns over time",
              ],
              recordedAt: new Date().toISOString(),
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
            citations.push("[1] No specific web results found for this query.");
          } else if (usedYouTubeSearch) {
            citations.push("[1] No YouTube videos found for this query.");
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
