import express, { Request, Response } from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper for Gemini SDK to prevent server startup crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please add it via the Secrets panel in AI Studio UI.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust content generation helper with automatic retry and model fallback for high demand (503)
async function generateContentWithFallback(ai: GoogleGenAI, params: any): Promise<any> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  const originalModel = params.model || "gemini-3.5-flash";
  const modelList = modelsToTry.includes(originalModel) 
    ? [originalModel, ...modelsToTry.filter(m => m !== originalModel)]
    : [originalModel, ...modelsToTry];

  let lastError: any = null;

  for (const model of modelList) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Attempting generateContent with model: ${model} (attempt ${attempt + 1})`);
        const result = await ai.models.generateContent({
          ...params,
          model: model
        });
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`Model ${model} failed on attempt ${attempt + 1}: ${error.message || error}`);
        
        const isOverloaded = error.message?.includes("503") || 
                             error.message?.includes("demand") || 
                             error.message?.includes("UNAVAILABLE") || 
                             error.message?.includes("limit") || 
                             error.status === 503 || 
                             error.code === 503;
                             
        if (isOverloaded && attempt < 1) {
          console.log(`Model ${model} is overloaded. Backing off for 1.2 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("All candidate models failed to generate content.");
}

// Robust chat sender helper with automatic retry and model fallback for high demand (503)
async function sendChatMessageWithFallback(ai: GoogleGenAI, chatParams: any, messageParam: any): Promise<any> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  const originalModel = chatParams.model || "gemini-3.5-flash";
  const modelList = modelsToTry.includes(originalModel) 
    ? [originalModel, ...modelsToTry.filter(m => m !== originalModel)]
    : [originalModel, ...modelsToTry];

  let lastError: any = null;

  for (const model of modelList) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Attempting sendMessage with model: ${model} (attempt ${attempt + 1})`);
        const chat = ai.chats.create({
          ...chatParams,
          model: model
        });
        const result = await chat.sendMessage(messageParam);
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`Chat model ${model} failed on attempt ${attempt + 1}: ${error.message || error}`);
        
        const isOverloaded = error.message?.includes("503") || 
                             error.message?.includes("demand") || 
                             error.message?.includes("UNAVAILABLE") || 
                             error.message?.includes("limit") || 
                             error.status === 503 || 
                             error.code === 503;
                             
        if (isOverloaded && attempt < 1) {
          console.log(`Chat model ${model} is overloaded. Backing off for 1.2 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("All candidate models failed to send chat message.");
}

// 1. HEALTHCHECK
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiKeyAvailable: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
  });
});

// 2. EXPLANATION API - Generates full classical Arabic explanation (تفسير/شرح ميسر)
app.post("/api/explain", async (req: Request, res: Response) => {
  try {
    const { type, text, title } = req.body;
    if (!text) {
      res.status(400).json({ error: "No text specified for explanation" });
      return;
    }

    const ai = getAi();
    const systemPrompt = `أنت فقيه متمكن وأستاذ متميز في علوم الشريعة والسيرة النبوية. 
وظيفتك هي تقديم تفسير وشرح ميسّر وجميل باللغة العربية الفصحى للنص الذي سيرسله المستخدم.
اجعل الأسلوب جذاباً، تربوياً، ملهماً، وسهل الفهم لجميع الفئات العمرية.
استخدم التنسيق الجميل والفقرات الواضحة.`;

    const userPrompt = `يرجى تقديم شرح وتفسير مفصل ومؤثر ومبسط للنص التالي (${type === 'quran' ? 'آية قرآنية كريمة' : type === 'hadith' ? 'حديث شريف' : 'درس من السيرة النبوية'}):
${title ? `عنوان الموضوع: ${title}\n` : ''}
النص: "${text}"

الشرح يحب أن يتضمن:
1. المعنى العام والدروس المستفادة بلغة بليغة ومبسطة.
2. كيف نطبق هذا في حياتنا اليومية والعملية كمسلمين اليوم؟`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Explanation Error:", error);
    res.status(500).json({
      error: error.message || "حدث خطأ غير متوقع",
      isKeyMissing: error.message?.includes("GEMINI_API_KEY")
    });
  }
});

// 3. AI CHAT ADVANCED ASSISTANT - Islamic counselor, helper and Seerah Q&A
app.post("/api/assistant", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "No user message sent" });
      return;
    }

    const ai = getAi();
    
    // Prepare conversation history
    const systemInstruction = `أنت هادي - المساعد التعليمي والتربوي الذكي لمنصة "إسلام بالعربي". 
هدف المعلم هادي هو غرس حب العلوم الإسلامية، السيرة النبوية والقرآن الكريم في قلوب الزوار وتسهيل الدراسة.
- أجب عن الأسئلة الفقهية والتاريخية والسيرة بدقة وعمق ومودة عظيمة.
- عندما يسألك الأعضاء عن تمويل أو شحن الحساب، أو الحصول على العضويات الكبرى:
  * أرشدهم لتبويب "الهدايا والمكافآت" لشحن حسابهم بقطع ذهبية.
  * أخبرهم أن طريقة الشحن المعتمدة هي تحويل فودافون كاش (Vodafone Cash) مباشرة لمدير ومؤسس الموقع الأستاذ القدير "أحمد علاء" على الرقم: 01507251444.
  * تتوفر الآن "عضوية الـ SVIP الملكية الأسطورية" لشحن 1,000,000 عملة بقيمة 5000 ج.م، والتي تمنح إيجابيات استثنائية: إطارات متحركة مدهشة، دخلات ومواكب ترحيبية مهيبة، بروفايل متحرك وصورة مميزة لمدة 30 يوماً من الأستاذ أحمد علاء، ومكافآتClaim أسبوعية تصل لـ 15,000 عملة ذهبية!
- عندما يسألك الأعضاء عن التوظيف أو طلبات العمل:
  * رحّب بهم بحفاوة بالغة وأكد لهم أن الموقع يفتح أبوابه لتوظيف مشرفين للمجالس الصوتية، وباحثين مراجعين شرعيين، ومطورين ويب، ودعم فني.
  * أخبرهم بضرورة تعبئة نموذج طلب التوظيف الموجود في أسفل تبويب "الهدايا والمكافآت" لتقوم الإدارة بمراجعته والتواصل على رقم واتساب الخاص بهم.
- في نهاية كل جواب مفيد، وجّه نصيحة إيمانية أو سلوكية قصيرة مباركة مستوحاة من هدي رسول الله محمد صلى الله عليه وسلم.
- تحدث باللغة العربية السليمة فقط بشكل دافئ ومحفز.`;

    // Process history: only include the last 6 messages, structure role and parts
    const historyLog = history && Array.isArray(history) 
      ? history.slice(-6).map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: Array.isArray(h.parts) ? h.parts : [{ text: h.parts?.[0]?.text || h.message || "" }]
        }))
      : [];

    const chatParams = {
      model: "gemini-3.5-flash",
      history: historyLog,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    };

    const response = await sendChatMessageWithFallback(ai, chatParams, { message: message });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    res.status(500).json({
      error: error.message || "حدث خطأ غير متوقع أثناء مخاطبة المساعد",
      isKeyMissing: error.message?.includes("GEMINI_API_KEY")
    });
  }
});

// 4. GEMINI TTS (TEXT-TO-SPEECH) GENERATOR - Converts Hadith or Seerah Lesson to classical voice audio. 
app.post("/api/tts", async (req: Request, res: Response) => {
  try {
    const { text, type } = req.body;
    if (!text) {
      res.status(400).json({ error: "No text specified for Speech generation" });
      return;
    }

    const ai = getAi();

    // Maximize audio quality instructions and pronunciation instructions for optimal Arabic standard elocution
    const cleanText = text.replace(/[\n\r]+/g, " ").substring(0, 400); // Safely truncate to avoid extremely large audio payloads
    const prompt = `تحدث بلغة عربية فصحى نقية، بنبرة ملهمة، مطمئنة، وصوت دافئ متميز، ملقياً النص التالي بكل هيبة ووضوح:
"${cleanText}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            // Using Kore or Zephyr for warm standard narration. Kore works beautifully.
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    // Extract base64audio
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: "المودل لم ينجح في توليد الملف الصوتي. حاول مجدداً." });
      return;
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("TTS Generation Error:", error);
    res.status(500).json({
      error: error.message || "فشلت عملية توليد النص الصوتي الذكي",
      isKeyMissing: error.message?.includes("GEMINI_API_KEY")
    });
  }
});

// =========================================================
// REAL-TIME VOICE ROOM STATE & WEB SOCKET LOGIC
// =========================================================

interface VoiceRoomUser {
  id: string; // Socket clientId or Bot ID
  name: string;
  avatar: string;
  isNewUser: boolean;
  points: number;
  isMuted: boolean;
  isSpeaking: boolean;
}

interface VoiceRoomSeat {
  id: number;
  user: VoiceRoomUser | null;
}

interface RoomMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

interface VoiceRoom {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  isCustom: boolean;
  activeAudioTopic: {
    title: string;
    streamUrl: string;
    isPlaying: boolean;
    surahId?: number;
  };
  seats: VoiceRoomSeat[];
  messages: RoomMessage[];
}

// 10 Seats for Users in Voice Room
// Preloaded with friendly welcoming bot companions to make the space lively from the first click!
let rooms: VoiceRoom[] = [
  {
    id: "new-users",
    title: "غرفة المستخدمين الجدد | إدارة موقع إسلام بالعربي ترحب بكم 🌹",
    description: "إدارة موقع إسلام بالعربي ترحب بكم في الغرفة المعتمدة بـ 10 مقاعد فقط للاستماع والمؤاخاة وطلب العلم للأعضاء الجدد والمنضمين حديثاً.",
    ownerName: "إدارة الموقع",
    isCustom: false,
    activeAudioTopic: {
      title: "البث الصوتي متوقف حالياً - يمكنك تشغيله متى شئت",
      streamUrl: "",
      isPlaying: false,
      surahId: undefined
    },
    seats: [
      { id: 0, user: { id: "bot_1", name: "بلال الأنصاري (مستشار) 📖", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ansari", isNewUser: false, points: 2350, isMuted: false, isSpeaking: false } },
      { id: 1, user: null },
      { id: 2, user: { id: "bot_2", name: "مريم العتيبي (جديدة) ✨", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=maryam", isNewUser: true, points: 250, isMuted: true, isSpeaking: false } },
      { id: 3, user: null },
      { id: 4, user: { id: "bot_3", name: "يوسف الصادق (جديد) ☕", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=yousef", isNewUser: true, points: 300, isMuted: false, isSpeaking: false } },
      { id: 5, user: null },
      { id: 6, user: { id: "bot_4", name: "سارة الشمري (جديدة) 🌸", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sara", isNewUser: true, points: 150, isMuted: false, isSpeaking: false } },
      { id: 7, user: null },
      { id: 8, user: { id: "bot_5", name: "عبدالله الهاشمي (جديد) ⭐", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=hashem", isNewUser: true, points: 410, isMuted: false, isSpeaking: false } },
      { id: 9, user: null }
    ],
    messages: [
      { id: "msg_init_admin_welcome", sender: "إدارة موقع إسلام بالعربي", text: "أهلاً ومرحباً بكم في غرفتكم الجديدة بـ 10 مقاعد؛ إدارة موقع إسلام بالعربي ترحب بكم ترحيباً حاراً وتتمنى لكم رحلة إيمانية مباركة في الاستماع للقرآن والمؤاخاة العطرة! 🌹", time: "الآن", isSystem: true },
      { id: "msg_init_1", sender: "النظام الإيماني", text: "انضموا الآن إلى مجلس الأعضاء والمستخدمين الجدد للاستماع وتبادل الدعم والهدايا الروحية المباركة.", time: "الآن", isSystem: true },
      { id: "msg_init_2", sender: "بلال الأنصاري (مستشار)", text: "السلام عليكم ورحمة الله وبركاته إخواني وأخواتي الجدد في الله، حياكم الله جميعاً وعمر الله أوقاتكم بالطاعات والذكر الجميل. نورت غرفتنا المعتمدة بـ 10 مقاعد فقط.", time: "الآن" }
    ]
  }
];

// 5. BOOTSTRAP VITE SERVING MIDDLEWARE OR STATIC BUNDLER
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create standard HTTP server
  const server = http.createServer(app);

  // Upgrade with native WebSocket Server
  const wss = new WebSocketServer({ server });

  // Map to store connected clients metadata
  const clients = new Map<WebSocket, { id: string; name?: string; joinedRoomId: string; joinedSeatId?: number }>();

  // Helper to send messages specifically to clients in a particular room
  const broadcastToRoom = (roomId: string, data: any) => {
    const rawData = JSON.stringify(data);
    clients.forEach((meta, client) => {
      if (meta.joinedRoomId === roomId && client.readyState === WebSocket.OPEN) {
        client.send(rawData);
      }
    });
  };

  // Helper to sync room list to all connected clients
  const broadcastRoomList = () => {
    const listPayload = {
      type: "ROOM_LIST_UPDATE",
      rooms: rooms.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        ownerName: r.ownerName,
        isCustom: r.isCustom,
        activeAudioTopic: r.activeAudioTopic,
        activeCount: r.seats.filter(s => s.user !== null).length
      }))
    };
    const rawData = JSON.stringify(listPayload);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(rawData);
      }
    });
  };

  // Helper for natural bot random speaking and gift behavior to keep room extremely interesting
  setInterval(() => {
    rooms.forEach((room) => {
      // Pick bots within this room specifically
      const botUsers = room.seats.filter(s => s.user && s.user.id.startsWith("bot_"));
      if (botUsers.length === 0) return;

      const randomSeat = botUsers[Math.floor(Math.random() * botUsers.length)];
      if (randomSeat && randomSeat.user) {
        const option = Math.random();
        const botName = randomSeat.user.name;

        if (option < 0.25) {
          // 1. Make bot "Speak" for a few seconds
          if (!randomSeat.user.isMuted) {
            randomSeat.user.isSpeaking = true;
            broadcastToRoom(room.id, { type: "ROOM_SEATS_UPDATE", seats: room.seats });
            
            setTimeout(() => {
              if (randomSeat.user) {
                randomSeat.user.isSpeaking = false;
                broadcastToRoom(room.id, { type: "ROOM_SEATS_UPDATE", seats: room.seats });
              }
            }, 3500);
          }
        } else if (option < 0.45) {
          // 2. Make bot post a beautiful spiritual advice text
          const spiritualTexts = [
            "سبحان الله وبحمده، سبحان الله العظيم 🌴",
            "انظروا لقسم القرآن الكريم بالكامل وتدارسوا آياته المطهرة.",
            "هل تصفحتم قسم السيرة العطرة اليوم؟ كويزات ثرية للغاية!",
            "اللهم صلّ وسلم على نبينا محمد وعلى آله وصحبه وسلم Taslimﷺ.",
            "الذكر يربط القلب بخالقه ويرطب اللسان، طوبى للذاكرين.",
            "أهلاً بكل المنضمين الجدد إلى غرفتنا، نسأل الله لنا ولكم الثبات والتوفيق وعظيم الأجر."
          ];
          const textMessage: RoomMessage = {
            id: "bot_msg_" + Date.now(),
            sender: botName,
            text: spiritualTexts[Math.floor(Math.random() * spiritualTexts.length)],
            time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          };
          room.messages.push(textMessage);
          if (room.messages.length > 50) room.messages.shift();
          broadcastToRoom(room.id, { type: "ROOM_MESSAGES_UPDATE", messages: room.messages });
        } else if (option < 0.60) {
          // 3. Make bot send a gift to another random occupied seat in the same room
          const otherSeats = room.seats.filter(s => s.user && s.user.id !== randomSeat.user?.id);
          if (otherSeats.length > 0) {
            const targetSeat = otherSeats[Math.floor(Math.random() * otherSeats.length)];
            const bgGifts = [
              { id: "zamzam", arabicName: "ماء زمزم المبارك 💧", points: 80, icon: "💧" },
              { id: "mushaf", arabicName: "مصحف شريف فاخر 📖", points: 150, icon: "📖" },
              { id: "miswak", arabicName: "مسواك مروّق الطيب 🪵", points: 30, icon: "🪵" },
              { id: "carpet", arabicName: "سجادة صلاة وثيره 🕌", points: 100, icon: "🕌" }
            ];
            const randomGift = bgGifts[Math.floor(Math.random() * bgGifts.length)];
            
            // Modify recipient points
            if (targetSeat.user) {
              targetSeat.user.points += randomGift.points;
              
              broadcastToRoom(room.id, {
                type: "GIFT_BROADCAST",
                gift: {
                  id: randomGift.id,
                  arabicName: randomGift.arabicName,
                  icon: randomGift.icon,
                  pointsReward: randomGift.points,
                  senderName: botName,
                  recipientName: targetSeat.user.name
                },
                senderSeatId: randomSeat.id,
                recipientSeatId: targetSeat.id
              });
              
              // Broadcast updated seats state
              broadcastToRoom(room.id, { type: "ROOM_SEATS_UPDATE", seats: room.seats });
            }
          }
        }
      }
    });
  }, 18000); // Trigger a bot reaction every 18 seconds across active rooms

  wss.on("connection", (ws: WebSocket) => {
    const cliId = "cli_" + Math.random().toString(36).substring(2, 9);
    clients.set(ws, { id: cliId, joinedRoomId: "new-users" });

    // Instantly send rooms list overview
    ws.send(JSON.stringify({
      type: "ROOM_LIST_UPDATE",
      rooms: rooms.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        ownerName: r.ownerName,
        isCustom: r.isCustom,
        activeAudioTopic: r.activeAudioTopic,
        activeCount: r.seats.filter(s => s.user !== null).length
      }))
    }));

    // Send initial "new-users" room status
    const initialRoom = rooms.find(r => r.id === "new-users")!;
    ws.send(JSON.stringify({
      type: "ROOM_INIT",
      seats: initialRoom.seats,
      messages: initialRoom.messages,
      activeAudioTopic: initialRoom.activeAudioTopic,
      myClientId: cliId,
      currentRoomId: "new-users"
    }));

    ws.on("message", (message: string) => {
      try {
        const payload = JSON.parse(message);
        const meta = clients.get(ws);
        if (!meta) return;

        const currentRoom = rooms.find(r => r.id === meta.joinedRoomId);

        switch (payload.type) {
          case "JOIN_ROOM": {
            meta.name = payload.user.name;
            if (currentRoom) {
              broadcastToRoom(meta.joinedRoomId, {
                type: "ROOM_MESSAGE_SYSTEM",
                message: {
                  id: "sys_" + Date.now(),
                  sender: "مجلس الإيمان",
                  text: `انضم الأخ الفاضل ${payload.user.name} إلى المجلس الصوتي. مرحباً بكم وطبتم وطاب مسعاكم! ✨`,
                  time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
                  isSystem: true
                }
              });
            }
            break;
          }

          case "CHANGE_ROOM": {
            const targetRoomId = payload.roomId;
            const targetRoom = rooms.find(r => r.id === targetRoomId);
            if (!targetRoom) return;

            // 1. Leave previous seat if sitting
            if (currentRoom && meta.joinedSeatId !== undefined) {
              currentRoom.seats[meta.joinedSeatId].user = null;
              broadcastToRoom(meta.joinedRoomId, { type: "ROOM_SEATS_UPDATE", seats: currentRoom.seats });
              meta.joinedSeatId = undefined;
            }

            // 2. Change room ID
            meta.joinedRoomId = targetRoomId;

            // 3. Send room initialization payload
            ws.send(JSON.stringify({
              type: "ROOM_INIT",
              seats: targetRoom.seats,
              messages: targetRoom.messages,
              activeAudioTopic: targetRoom.activeAudioTopic,
              myClientId: cliId,
              currentRoomId: targetRoomId
            }));

            // 4. Send joined speech announce
            broadcastToRoom(targetRoomId, {
              type: "ROOM_MESSAGE_SYSTEM",
              message: {
                id: "sys_change_" + Date.now(),
                sender: "مجلس الإيمان",
                text: `${meta.name || "عضو"} انتقل بهدوء وانضم لمجلسنا المبارك. حياكم الله! ✨`,
                time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
                isSystem: true
              }
            });

            // 5. Broadcast lists so counts refresh
            broadcastRoomList();
            break;
          }

          case "CREATE_CUSTOM_ROOM": {
            const { title, description, ownerName, streamUrl } = payload;
            const newRoomId = "room_cli_" + Math.random().toString(36).substring(2, 9);
            
            // Build custom room
            const newRoom: VoiceRoom = {
              id: newRoomId,
              title: title || `مجلس الأخ ${ownerName}`,
              description: description || "جلسة هادئة وحوار دافئ مع الزملاء الجدد في فضاء إسلامي.",
              ownerName: ownerName || "طالب علم مجهول",
              isCustom: true,
              activeAudioTopic: {
                title: "صوتيات الغرفة: موسيقى طمأنينة متواصلة",
                streamUrl: streamUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                isPlaying: true
              },
              seats: [
                { id: 0, user: null },
                { id: 1, user: null },
                { id: 2, user: null },
                { id: 3, user: null },
                { id: 4, user: null },
                { id: 5, user: null },
                { id: 6, user: null },
                { id: 7, user: null },
                { id: 8, user: null },
                { id: 9, user: null }
              ],
              messages: [
                { id: "custom_init", sender: "النظام", text: `أهلاً ومرحباً بكم في غرفة ${title}! أنشئت بواسطة ${ownerName}. تصفح كرم إخوانك وشغّل الموسيقى أو التلاوة الملائمة.`, time: "الآن", isSystem: true }
              ]
            };

            rooms.push(newRoom);
            broadcastRoomList();

            // Notify creator they can switch over
            ws.send(JSON.stringify({
              type: "ROOM_CREATION_SUCCESS",
              roomId: newRoomId
            }));
            break;
          }

          case "UPDATE_ROOM_AUDIO": {
            const { roomId, title, streamUrl, isPlaying, surahId } = payload;
            const target = rooms.find(r => r.id === roomId);
            if (target) {
              target.activeAudioTopic = {
                title: title || target.activeAudioTopic.title,
                streamUrl: streamUrl || target.activeAudioTopic.streamUrl,
                isPlaying: isPlaying !== undefined ? isPlaying : target.activeAudioTopic.isPlaying,
                surahId: surahId !== undefined ? surahId : target.activeAudioTopic.surahId
              };
              
              // Broadcast update to everyone currently inside this room
              broadcastToRoom(roomId, {
                type: "ROOM_AUDIO_UPDATE",
                activeAudioTopic: target.activeAudioTopic
              });
            }
            break;
          }

          case "TAKE_SEAT": {
            if (!currentRoom) return;
            const seatId = payload.seatId;
            const reqUser = payload.user;

            const existingSeat = currentRoom.seats.find(s => s.user && s.user.id === cliId);
            if (existingSeat) {
              existingSeat.user = null;
            }

            if (seatId >= 0 && seatId < 10 && currentRoom.seats[seatId].user === null) {
              currentRoom.seats[seatId].user = {
                id: cliId,
                name: reqUser.name,
                avatar: reqUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cliId}`,
                isNewUser: reqUser.isNewUser !== undefined ? reqUser.isNewUser : true,
                points: reqUser.points || 0,
                isMuted: false,
                isSpeaking: false
              };
              meta.joinedSeatId = seatId;

              broadcastToRoom(meta.joinedRoomId, { type: "ROOM_SEATS_UPDATE", seats: currentRoom.seats });

              // Welcome bot reply if we are in one of preloaded channels
              if (meta.joinedRoomId === "new-users") {
                setTimeout(() => {
                  const welcomeMsg: RoomMessage = {
                    id: "welcome_bot_" + Date.now(),
                    sender: "بلال الأنصاري (مستشار)",
                    text: `أهلاً بك يا ${reqUser.name} في مقعد مجلس الجدد! حططت رحالك أهلاً ونزلت سهلاً. تفضل خذ هدية ترحيبية مباركة لتبدأ مسيرتك الإيمانية بنشاط! 🎁`,
                    time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
                  };
                  currentRoom.messages.push(welcomeMsg);
                  if (currentRoom.messages.length > 50) currentRoom.messages.shift();
                  broadcastToRoom(meta.joinedRoomId, { type: "ROOM_MESSAGES_UPDATE", messages: currentRoom.messages });
                }, 1200);
              }
            }
            break;
          }

          case "LEAVE_SEAT": {
            if (!currentRoom) return;
            const seatId = meta.joinedSeatId;
            if (seatId !== undefined && currentRoom.seats[seatId] && currentRoom.seats[seatId].user?.id === cliId) {
              currentRoom.seats[seatId].user = null;
              meta.joinedSeatId = undefined;
              broadcastToRoom(meta.joinedRoomId, { type: "ROOM_SEATS_UPDATE", seats: currentRoom.seats });
            }
            break;
          }

          case "TOGGLE_MIC": {
            if (!currentRoom) return;
            const seatId = meta.joinedSeatId;
            if (seatId !== undefined && currentRoom.seats[seatId] && currentRoom.seats[seatId].user?.id === cliId) {
              const u = currentRoom.seats[seatId].user;
              if (u) {
                u.isMuted = !u.isMuted;
                if (u.isMuted) u.isSpeaking = false;
                broadcastToRoom(meta.joinedRoomId, { type: "ROOM_SEATS_UPDATE", seats: currentRoom.seats });
              }
            }
            break;
          }

          case "SET_SPEAKING": {
            if (!currentRoom) return;
            const seatId = meta.joinedSeatId;
            if (seatId !== undefined && currentRoom.seats[seatId] && currentRoom.seats[seatId].user?.id === cliId) {
              const u = currentRoom.seats[seatId].user;
              if (u && !u.isMuted) {
                u.isSpeaking = payload.isSpeaking;
                broadcastToRoom(meta.joinedRoomId, { type: "ROOM_SEATS_UPDATE", seats: currentRoom.seats });
              }
            }
            break;
          }

          case "SEND_CHAT_MESSAGE": {
            if (!currentRoom) return;
            const chatMessage: RoomMessage = {
              id: "chat_" + Date.now(),
              sender: meta.name || "مستخدم مجهول",
              text: payload.text,
              time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
            };
            currentRoom.messages.push(chatMessage);
            if (currentRoom.messages.length > 50) currentRoom.messages.shift();
            broadcastToRoom(meta.joinedRoomId, { type: "ROOM_MESSAGES_UPDATE", messages: currentRoom.messages });
            break;
          }

          case "SEND_GIFT": {
            if (!currentRoom) return;
            const { senderSeatId, recipientSeatId, gift } = payload;
            if (currentRoom.seats[senderSeatId] && currentRoom.seats[recipientSeatId]) {
              const sender = currentRoom.seats[senderSeatId].user;
              const recipient = currentRoom.seats[recipientSeatId].user;
              
              if (sender && recipient) {
                recipient.points += gift.pointsReward;
                
                broadcastToRoom(meta.joinedRoomId, {
                  type: "GIFT_BROADCAST",
                  gift: {
                    id: gift.id,
                    arabicName: gift.arabicName,
                    icon: gift.icon,
                    pointsReward: gift.pointsReward,
                    senderName: sender.name,
                    recipientName: recipient.name
                  },
                  senderSeatId,
                  recipientSeatId
                });

                broadcastToRoom(meta.joinedRoomId, { type: "ROOM_SEATS_UPDATE", seats: currentRoom.seats });
              }
            }
            break;
          }
        }
      } catch (err) {
        console.error("WS Message Error:", err);
      }
    });

    ws.on("close", () => {
      const meta = clients.get(ws);
      if (meta) {
        const currentRoom = rooms.find(r => r.id === meta.joinedRoomId);
        const seatId = meta.joinedSeatId;

        if (currentRoom && seatId !== undefined && currentRoom.seats[seatId] && currentRoom.seats[seatId].user?.id === cliId) {
          currentRoom.seats[seatId].user = null;
          broadcastToRoom(meta.joinedRoomId, { type: "ROOM_SEATS_UPDATE", seats: currentRoom.seats });
        }
        
        if (meta.name) {
          broadcastToRoom(meta.joinedRoomId, {
            type: "ROOM_MESSAGE_SYSTEM",
            message: {
              id: "sys_leave_" + Date.now(),
              sender: "مجلس الإيمان",
              text: `غادر الأخ الفاضل ${meta.name} فضاء المجلس الصوتي. نراكم في حفظ الله ورعايته! 🕌`,
              time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
              isSystem: true
            }
          });
        }
        clients.delete(ws);
        broadcastRoomList();
      }
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running with WebSockets on http://localhost:${PORT}`);
  });
}

startServer();
