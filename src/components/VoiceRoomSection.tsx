import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Gift, 
  Send, 
  Sparkles, 
  Award, 
  BookOpen, 
  Smile, 
  CheckCircle,
  HelpCircle,
  Clock,
  Heart,
  Flame,
  PlusCircle,
  FolderOpen,
  Music,
  Check,
  Disc,
  Play,
  Share2,
  Smartphone,
  Copy,
  Upload,
  Lock,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceRoomSectionProps {
  onAddPoints: (points: number, reason: string) => void;
  unlockedBadges: string[];
  onUnlockBadge: (badgeId: string) => void;
  userProfile: {
    name: string;
    points: number;
    level: string;
  };
}

interface VoiceRoomUser {
  id: string;
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

interface ActiveGiftNotification {
  id: string;
  icon: string;
  arabicName: string;
  senderName: string;
  recipientName: string;
  senderSeatId: number;
  recipientSeatId: number;
}

interface VoiceRoomStub {
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
  activeCount: number;
}

// 10 beautiful spiritual gifts including big premium ones
const SPIRITUAL_GIFTS = [
  { id: "zamzam", arabicName: "ماء زمزم المبارك 💧", price: 50, icon: "💧", description: "يرطب ويطهر القلوب ويقرب الصلات", pointsReward: 80 },
  { id: "mushaf", arabicName: "مصحف شريف فاخر 📖", price: 120, icon: "📖", description: "يزيد من ثواب التعلم والتدبر المشترك", pointsReward: 150 },
  { id: "miswak", arabicName: "مسواك مروّق الطيب 🪵", price: 20, icon: "🪵", description: "مطهرة للفم مرضاة للرب ومتبع للسنة", pointsReward: 30 },
  { id: "carpet", arabicName: "سجادة صلاة وثيره 🕌", price: 80, icon: "🕌", description: "لإعانة المسلمين على طول القيام والخشوع", pointsReward: 100 },
  { id: "oud", arabicName: "دهن العود الملكي 🧴", price: 100, icon: "🧴", description: "رائحة زكية تعطر المجالس والمؤاخاة", pointsReward: 120 },
  { id: "subha", arabicName: "مسبحة عقيق كريمة 📿", price: 40, icon: "📿", description: "تذكير بذكر الله في كل الغدوات والروحات", pointsReward: 50 },
  
  // Premium big gifts
  { id: "kaaba_cover", arabicName: "كسوة الكعبة المشرفة المذهبة 🕋✨", price: 1000, icon: "🕋", description: "الهدية الأثمن والأكبر بالمنصة بالزركشة الذهبية والبركة العميقة!", pointsReward: 1800, isPremium: true },
  { id: "prophetic_musk", arabicName: "باقة عطر الروضة والمسك النبوي 🌸🧴", price: 300, icon: "🌸", description: "عطر مروحي فائق يعبق بكافة أرجاء دردشة الإخوة بروائح المسك الزكية", pointsReward: 500, isPremium: true },
  { id: "dome_of_rock", arabicName: "منبر درع قبة الصخرة المشرفة 🕌👑", price: 600, icon: "🕌", description: "بناء ذهبي عملاق ساطع لتكريم الأخوة، يعبر عن السكينة ومكانة القدس الشامخة", pointsReward: 1100, isPremium: true },
  { id: "umrah_package", arabicName: "سهم رحلة عمرة المؤاخاة الكبرى 🕋✈️", price: 2500, icon: "✈️", description: "أعلى تبرع معنوي ملكي وتكريم تآخي بالموقع لنشر عظيم الأجر والبركات الدائمة!", pointsReward: 4500, isPremium: true }
];

// All 114 Arabic Surah Names for easy dropdown browsing
const SURAH_NAMES = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازحات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

// Composed ambient spiritual music presets for custom room
const MUSIC_PRESETS = [
  { title: "طمأنينة نسيم الصبا 🍃", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "سكون وتأملات روحانية هادئة ✨", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "عطر الجنان - مقامات خاشعة 🕌", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { title: "تسابيح الفجر النبوية 🌅", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
];

export default function VoiceRoomSection({
  onAddPoints,
  unlockedBadges,
  onUnlockBadge,
  userProfile
}: VoiceRoomSectionProps) {
  // Websocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Connection State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [myClientId, setMyClientId] = useState<string>("");
  
  // Multi-room support
  const [roomsList, setRoomsList] = useState<VoiceRoomStub[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>("public-chat");

  // Seats and messages sync with server (Pre-filled with 10 empty seats to maintain instant layout visibility)
  const [seats, setSeats] = useState<VoiceRoomSeat[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({ id: i, user: null }))
  );
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [activeAudioTopic, setActiveAudioTopic] = useState({
    title: "مجلس الذكر العطر وتدارس السيرة النبوية والمؤاخاة",
    streamUrl: "https://server12.mp3quran.net/maher/001.mp3",
    isPlaying: false,
    surahId: 1
  });

  // Dynamic Room Creator Modal states
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [newRoomTitle, setNewRoomTitle] = useState<string>("");
  const [newRoomDesc, setNewRoomDesc] = useState<string>("");
  const [customMusicUrl, setCustomMusicUrl] = useState<string>("");
  const [selectedMusicPresetIdx, setSelectedMusicPresetIdx] = useState<number>(0);

  // Quran Selection States (Browsing the entire 114 Surahs)
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [customAudioInput, setCustomAudioInput] = useState<string>("");

  // Client local voice options
  const [clientSeatedId, setClientSeatedId] = useState<number | null>(null);
  const [isClientMuted, setIsClientMuted] = useState<boolean>(false);
  const [isClientSpeaking, setIsClientSpeaking] = useState<boolean>(false);
  
  // Dialogs / Selection state
  const [selectedRecipientSeatId, setSelectedRecipientSeatId] = useState<number | null>(null);
  const [typedMessage, setTypedMessage] = useState<string>("");
  
  // Live floating gift animation triggers
  const [activeGifts, setActiveGifts] = useState<ActiveGiftNotification[]>([]);
  
  // Welcome Reward bag
  const [claimedWelcomeBag, setClaimedWelcomeBag] = useState<boolean>(() => {
    return localStorage.getItem("islam_belaraby_claimed_voice_welcome") === "true";
  });

  // Coins Recharge Modal state
  const [isRechargeOpen, setIsRechargeOpen] = useState<boolean>(false);
  
  // High fidelity coin packages
  const COIN_PACKAGES = [
    { id: "pkg_1", title: "باقة النور الأساسية 🪙", coins: 1000, desc: "شحن رصيد إيماني فوري لرفع المستوى ونشر ثقافة المودة والترحيب بالجدد.", priceEGP: 25, priceLabel: "شحن (25 ج.م)" },
    { id: "pkg_2", title: "باقة الهدايا والبركات ✨", coins: 3000, desc: "شحن رصيد واسع كافٍ لإرسال هدايا فاخرة ومصاحف شريفة لعدة طالبي علم.", priceEGP: 75, priceLabel: "شحن (75 ج.م)" },
    { id: "pkg_3", title: "حزمة التفوق الفضية 👑", coins: 6050, desc: "تصل لمراتب كبار المتبرعين والخشاع، مع لقب 'راعي المجلس الجود'.", priceEGP: 150, priceLabel: "شحن (150 ج.م)" }
  ];

  // Secure transfer payment states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [selectedChargePack, setSelectedChargePack] = useState<any>(COIN_PACKAGES[0]);
  const [transferSenderName, setTransferSenderName] = useState<string>("");
  const [transferSenderPhone, setTransferSenderPhone] = useState<string>("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  // Handlers for mock local file uploading
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  // Direct Audio feedback loop (Self speaking volume emulator)
  const speakIntervalRef = useRef<any>(null);
  const [roomAudioElement, setRoomAudioElement] = useState<HTMLAudioElement | null>(null);

  // Connect to stateful WebSocket on mount
  useEffect(() => {
    connectWS();
    return () => {
      cleanupAudioSimulation();
      if (wsRef.current) wsRef.current.close();
      if (roomAudioElement) roomAudioElement.pause();
    };
  }, []);

  // Auto-seat users in 'public-chat' room because seats are visually canceled there
  useEffect(() => {
    if (currentRoomId === "public-chat" && clientSeatedId === null && isConnected && seats.length > 0) {
      const vacantSeat = seats.find(s => s.user === null);
      if (vacantSeat) {
        takeSeat(vacantSeat.id);
      }
    }
  }, [currentRoomId, clientSeatedId, seats, isConnected]);

  // Stay seated active reward to increase level automatically!
  useEffect(() => {
    if (clientSeatedId === null) return;

    // Passive point generation every 8 seconds as long as they sit on their seat
    const interval = setInterval(() => {
      onAddPoints(20, "نقاط الاستماع والجلوس على المقعد لزيادة المستوى 📈");
      
      setMessages(prev => {
        // Prevent spamming too many systems rewards
        const recentRewards = prev.filter(m => m.id.startsWith("reward_"));
        if (recentRewards.length > 5) {
          return [...prev.filter(m => !m.id.startsWith("reward_")), {
            id: `reward_${Date.now()}`,
            sender: "النظام الإيماني",
            text: `زاد مستوى حسابك! حصلت على +20 نقطة روحية تلقائياً لجلوسك واستماعك للقرآن الكريم. ✨`,
            time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            isSystem: true
          }];
        }
        return [
          ...prev,
          {
            id: `reward_${Date.now()}`,
            sender: "النظام الإيماني",
            text: `زاد مستوى حسابك! حصلت على +20 نقطة روحية تلقائياً لجلوسك واستماعك للقرآن الكريم. ✨`,
            time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            isSystem: true
          }
        ];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [clientSeatedId]);

  // Update hardware/browser audio player if the streamUrl changes on the server
  useEffect(() => {
    if (roomAudioElement) {
      roomAudioElement.pause();
    }
    if (activeAudioTopic.streamUrl) {
      const prevPlay = activeAudioTopic.isPlaying;
      const audio = new Audio(activeAudioTopic.streamUrl);
      audio.volume = 0.25;
      audio.loop = true;
      if (prevPlay) {
        audio.play().catch(e => console.log("Audio restore trigger warning:", e));
      }
      setRoomAudioElement(audio);
    } else {
      setRoomAudioElement(null);
    }
  }, [activeAudioTopic.streamUrl, activeAudioTopic.isPlaying]);

  const connectWS = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const socketUrl = `${protocol}//${host}`;
      
      const socket = new WebSocket(socketUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        // Register current profile as new participant
        socket.send(JSON.stringify({
          type: "JOIN_ROOM",
          user: {
            name: userProfile.name,
            points: userProfile.points,
            isNewUser: true
          }
        }));
      };

      socket.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          
          switch (raw.type) {
            case "ROOM_LIST_UPDATE":
              setRoomsList(raw.rooms);
              break;

            case "ROOM_INIT":
              setSeats(raw.seats);
              setMessages(raw.messages);
              setMyClientId(raw.myClientId);
              setActiveAudioTopic(raw.activeAudioTopic);
              setCurrentRoomId(raw.currentRoomId || "public-chat");
              break;

            case "ROOM_CREATION_SUCCESS":
              // Auto-join creator to their new custom room!
              socket.send(JSON.stringify({
                type: "CHANGE_ROOM",
                roomId: raw.roomId
              }));
              break;

            case "ROOM_AUDIO_UPDATE":
              setActiveAudioTopic(raw.activeAudioTopic);
              break;
              
            case "ROOM_SEATS_UPDATE":
              setSeats(raw.seats);
              // Find if this client is seated, and update seat id
              const seated = raw.seats.find((s: any) => s.user && s.user.id === myClientId || s.user?.name === userProfile.name);
              if (seated) {
                setClientSeatedId(seated.id);
                setIsClientMuted(seated.user.isMuted);
              } else {
                setClientSeatedId(null);
              }
              break;

            case "ROOM_MESSAGES_UPDATE":
              setMessages(raw.messages);
              break;

            case "ROOM_MESSAGE_SYSTEM":
              setMessages(prev => [...prev, raw.message]);
              break;

            case "GIFT_BROADCAST":
              triggerGiftUIEffect(raw);
              break;
          }
        } catch (e) {
          console.error("Error parsing socket frame:", e);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Retry connection after 5 seconds
        setTimeout(() => connectWS(), 5000);
      };

      socket.onerror = (err) => {
        console.error("Socket error", err);
        setIsConnected(false);
      };

    } catch (err) {
      console.warn("Could not initiate real infrastructure socket connection: ", err);
    }
  };

  const triggerTickSound = (freq = 700) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const triggerGiftUIEffect = (raw: any) => {
    triggerTickSound(880);
    
    const newGiftNotif: ActiveGiftNotification = {
      id: "gift_notif_" + Math.random().toString(),
      icon: raw.gift.icon,
      arabicName: raw.gift.arabicName,
      senderName: raw.gift.senderName,
      recipientName: raw.gift.recipientName,
      senderSeatId: raw.senderSeatId,
      recipientSeatId: raw.recipientSeatId
    };

    setActiveGifts(prev => [...prev, newGiftNotif]);

    setTimeout(() => {
      setActiveGifts(prev => prev.filter(g => g.id !== newGiftNotif.id));
    }, 5000);

    const clientSeatDetail = seats.find(s => s.id === raw.recipientSeatId);
    if (clientSeatDetail && clientSeatDetail.user && clientSeatDetail.user.id === myClientId) {
      onAddPoints(raw.gift.pointsReward, `درجة مودة وهدية (${raw.gift.arabicName}) من ${raw.gift.senderName}`);
    }
  };

  const handleClientSpeakingLoop = (isSpeaking: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    if (isSpeaking) {
      speakIntervalRef.current = setInterval(() => {
        const pulse = Math.random() > 0.3;
        wsRef.current?.send(JSON.stringify({
          type: "SET_SPEAKING",
          isSpeaking: pulse
        }));
        setIsClientSpeaking(pulse);
      }, 800);
    } else {
      cleanupAudioSimulation();
      wsRef.current?.send(JSON.stringify({
        type: "SET_SPEAKING",
        isSpeaking: false
      }));
      setIsClientSpeaking(false);
    }
  };

  const cleanupAudioSimulation = () => {
    if (speakIntervalRef.current) {
      clearInterval(speakIntervalRef.current);
      speakIntervalRef.current = null;
    }
  };

  const takeSeat = (seatId: number) => {
    triggerTickSound(650);
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: "TAKE_SEAT",
      seatId,
      user: {
        name: userProfile.name,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userProfile.name}`,
        points: userProfile.points,
        isNewUser: true
      }
    }));
  };

  const leaveSeat = () => {
    triggerTickSound(450);
    cleanupAudioSimulation();
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "LEAVE_SEAT" }));
  };

  const toggleMute = () => {
    triggerTickSound(550);
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "TOGGLE_MIC" }));
    
    const nextMute = !isClientMuted;
    setIsClientMuted(nextMute);
    if (nextMute) {
      handleClientSpeakingLoop(false);
    }
  };

  const postChatMessage = () => {
    const text = typedMessage.trim();
    if (!text) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: "SEND_CHAT_MESSAGE",
      text
    }));
    
    setTypedMessage("");
    triggerTickSound(900);
  };

  const sendSpiritualGift = (gift: typeof SPIRITUAL_GIFTS[0]) => {
    if (clientSeatedId === null) return;
    if (selectedRecipientSeatId === null) return;

    if (userProfile.points < gift.price) {
      alert("النقاط الروحية الحالية غير كافية لإرسال هذه الهدية الفاخرة! شارك في مجالس الذكر وكويزات السيرة لحصد النقاط.");
      return;
    }

    onAddPoints(-gift.price, `إهداء (${gift.arabicName}) لتعزيز أصر المحبة والمؤاخاة`);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "SEND_GIFT",
        senderSeatId: clientSeatedId,
        recipientSeatId: selectedRecipientSeatId,
        gift
      }));
    }

    setSelectedRecipientSeatId(null);
  };

  const claimNewUserWelcomeBag = () => {
    triggerTickSound(1000);
    setClaimedWelcomeBag(true);
    localStorage.setItem("islam_belaraby_claimed_voice_welcome", "true");
    
    onAddPoints(200, "استلام حقيبة ترحيب مجلس المؤاخاة للمنضمين الجدد 🎁");
    
    if (!unlockedBadges.includes("badge-brotherhood")) {
      onUnlockBadge("badge-brotherhood");
    }
  };

  const toggleRoomLiveFeed = () => {
    triggerTickSound(activeAudioTopic.isPlaying ? 400 : 800);
    
    if (activeAudioTopic.isPlaying) {
      if (roomAudioElement) {
        roomAudioElement.pause();
      }
      setActiveAudioTopic(prev => ({ ...prev, isPlaying: false }));
    } else {
      const audio = roomAudioElement || new Audio(activeAudioTopic.streamUrl);
      audio.volume = 0.25;
      audio.loop = true;
      audio.play().catch(e => console.log("Audio play blocked, physical trigger loaded."));
      
      setRoomAudioElement(audio);
      setActiveAudioTopic(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const selectRoom = (roomId: string) => {
    triggerTickSound(700);
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({
      type: "CHANGE_ROOM",
      roomId
    }));
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    triggerTickSound(950);
    if (!newRoomTitle.trim()) {
      alert("يرجى كتابة اسم المجلس الصوتي.");
      return;
    }

    const assignedUrl = customMusicUrl.trim() || MUSIC_PRESETS[selectedMusicPresetIdx].url;
    const assignedTitle = customMusicUrl.trim() ? "صوت مخصص للمستخدم" : `صوتية: ${MUSIC_PRESETS[selectedMusicPresetIdx].title}`;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "CREATE_CUSTOM_ROOM",
        title: newRoomTitle,
        description: newRoomDesc || "جلسة وطمأنينة مباركة وحوار إيماني رابح وصالح.",
        ownerName: userProfile.name,
        streamUrl: assignedUrl
      }));
    }

    // Reset and close
    setIsCreatorOpen(false);
    setNewRoomTitle("");
    setNewRoomDesc("");
    setCustomMusicUrl("");
  };

  // Switch Quran recitation for the entire channel (Complete 114 Surahs dynamically!)
  const switchQuranSurah = (surahIndex: number) => {
    triggerTickSound(850);
    const paddedId = String(surahIndex).padStart(3, '0');
    const reciterUrl = `https://server12.mp3quran.net/maher/${paddedId}.mp3`;
    const surahName = SURAH_NAMES[surahIndex - 1];

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "UPDATE_ROOM_AUDIO",
        roomId: currentRoomId,
        title: `صوت القرآن الكريم: سورة ${surahName} بصوت الشيخ ماهر المعيقلي`,
        streamUrl: reciterUrl,
        isPlaying: true,
        surahId: surahIndex
      }));
    }
    setSelectedSurahId(surahIndex);
  };

  // Handle custom music playback link insertion
  const playCustomStreamInput = () => {
    triggerTickSound(800);
    const stream = customAudioInput.trim();
    if (!stream) {
      alert("يرجى كتابة أو نسخ رابط الملف الصوتي MP3 للموسيقى.");
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "UPDATE_ROOM_AUDIO",
        roomId: currentRoomId,
        title: `ملف موسيقى خارجي: ${stream.split('/').pop() || "مسار خارجي"}`,
        streamUrl: stream,
        isPlaying: true
      }));
    }
    setCustomAudioInput("");
  };

  // Mock uploader that takes a local audio file and converts it into a demo playable stream
  const triggerMockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerTickSound(900);
      setUploadedFileName(file.name);
      
      // Simulate uploading to Cloud, then bind demo music track
      const demoMusicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
      
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "UPDATE_ROOM_AUDIO",
            roomId: currentRoomId,
            title: `تم تحميل موسيقى رومك: ${file.name}`,
            streamUrl: demoMusicUrl,
            isPlaying: true
          }));
        }
      }, 1000);
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("01507251444");
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      readAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      readAndSetFile(file);
    }
  };

  const readAndSetFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setProofImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSenderName.trim() || !transferSenderPhone.trim()) {
      alert("الرجاء إدخال اسم المحوّل ورقم الهاتف للتحقق من عملية التحويل.");
      return;
    }
    
    setIsSubmittingTransfer(true);
    
    setTimeout(() => {
      setIsSubmittingTransfer(false);
      setTransferSuccess(true);
      
      onAddPoints(selectedChargePack.coins, `شحن ${selectedChargePack.title} (${selectedChargePack.coins.toLocaleString()} عملة) بالتأكيد الآمن للأستاذ أحمد علاء`);
      
      // Add nice system message in chat logs
      setMessages(prev => [
        ...prev,
        {
          id: `success_charge_${Date.now()}`,
          sender: "النظام الإيماني",
          text: `تم بنجاح شحن ${selectedChargePack.coins} عملة إضافية لحسابك عبر تحويل معتمد للأستاذ أحمد علاء! يمكنك الآن كسب الأجر ومكافأة إخوانك على المقاعد. 🪙🎁`,
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          isSystem: true
        }
      ]);
    }, 2850);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-right animate-fade-in relative pb-10" dir="rtl">
      
      {/* Floating Dynamic Gifts overlay particles with mesmerizing rich celebration */}
      <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
        <AnimatePresence>
          {activeGifts.map((gif) => {
            // Check if this is a massive supreme gift
            const isPremium = gif.arabicName.includes("🕋") || gif.arabicName.includes("🌸") || gif.arabicName.includes("🕌") || gif.arabicName.includes("✈️") || gif.pointsReward >= 300;
            return (
              <div key={gif.id} className="absolute inset-0 flex items-center justify-center p-4">
                
                {/* 1. Backdrop Glow for premium gifts */}
                {isPremium && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.45, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 4.5 }}
                    className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-amber-950/40 to-neutral-950/80 backdrop-blur-sm"
                  />
                )}

                {/* 2. Golden Rays / Halos Rotating backdrop (for that high premium feel) */}
                {isPremium && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: 0.7, scale: 1.5, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="absolute w-80 h-80 rounded-full bg-[conic-gradient(from_0deg,_var(--tw-gradient-stops))] from-amber-500/0 via-amber-500/10 to-amber-500/0 filter blur-xl"
                  />
                )}

                {/* 3. Falling/Raining mini particles of the gift icon */}
                {/* Generated client-side for dynamic rich physical feedback */}
                {[...Array(isPremium ? 24 : 12)].map((_, pi) => {
                  const xPercentage = Math.random() * 100; // random horizontal position
                  const animDuration = 2.5 + Math.random() * 2; // random fall time
                  const size = isPremium ? (16 + Math.random() * 24) : (12 + Math.random() * 14);
                  return (
                    <motion.div
                      key={`part_${pi}`}
                      initial={{ opacity: 0, y: -100, x: `${xPercentage}vw`, rotate: 0 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0], 
                        y: "105vh", 
                        rotate: Math.random() > 0.5 ? 360 : -360 
                      }}
                      transition={{ duration: animDuration, ease: "easeInOut" }}
                      className="absolute top-0 text-xl"
                      style={{ fontSize: `${size}px` }}
                    >
                      {gif.icon}
                    </motion.div>
                  );
                })}

                {/* 4. Elegant Main Floating Card with generous branding, glowing shadows and spring entrance */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, y: 150 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isPremium ? [0.4, 1.25, 1.2] : 1.1, 
                    y: 0 
                  }}
                  exit={{ opacity: 0, scale: 0.8, y: -180 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 90 }}
                  className={`bg-neutral-900 border ${
                    isPremium ? "border-amber-450 shadow-[0_0_40px_rgba(245,158,11,0.35)]" : "border-emerald-500/30 shadow-2xl"
                  } p-6 md:p-8 rounded-3xl flex flex-col items-center gap-3 max-w-sm w-full text-center relative overflow-hidden`}
                >
                  {/* Subtle top decoration */}
                  {isPremium && (
                    <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500" />
                  )}

                  {/* Pulsing glow ring for icon */}
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center relative ${
                    isPremium ? "bg-amber-500/15 border border-amber-400/40" : "bg-emerald-500/10 border border-emerald-500/20"
                  }`}>
                    {isPremium && (
                      <span className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping" />
                    )}
                    <span className={`text-5xl select-none leading-none ${isPremium ? "animate-bounce" : ""}`}>{gif.icon}</span>
                  </div>

                  <div className="space-y-1">
                    <p className={`text-[10px] uppercase tracking-widest font-black leading-none ${
                      isPremium ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {isPremium ? "✨ إهداء ملكي فاخر ومميز ✨" : "✨ إهداء روحاني مبارك ✨"}
                    </p>
                    <p className="text-xs text-neutral-300 font-bold leading-normal mt-1">
                      <strong className="text-white text-sm">{gif.senderName}</strong> أهدى بروح الأخوة <strong className="text-amber-300 text-sm">{gif.recipientName}</strong>
                    </p>
                    <p className="text-sm font-extrabold text-amber-400 drop-shadow mt-1">
                      {gif.arabicName}
                    </p>
                  </div>

                  <div className={`mt-1 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${
                    isPremium ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  } font-mono`}>
                    +{gif.pointsReward} نقطة ثواب ومودة
                  </div>
                </motion.div>
                
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Coin Recharge Deck and Level Status View */}
      <div className="col-span-12 flex flex-col gap-4">
        
        {/* Real-time interactive Coins & Leveling Progress Dashboard */}
        <div className="bg-gradient-to-l from-neutral-900/90 to-neutral-950 border border-neutral-800 p-5 md:p-6 rounded-3xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0 shadow-lg shadow-amber-500/5">
              <Award className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-white text-base md:text-lg">مستواك الإيماني النشط: {userProfile.level}</h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {clientSeatedId !== null ? "نمو تلقائي نشط (+20/8ث) 📈" : "اجلس على مقعد لتفعيل الصعود التلقائي"}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                يزيد مستوى حسابك تدريجياً وبسرعة كلما جلست على أحد المقاعد الـ 10 واستمعت للقرآن الكريم كاملاً، أو من خلال إهداء الهدايا الروحية للإخوة وبعضكم البعض!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-neutral-950/80 border border-neutral-850 p-3.5 rounded-2xl shrink-0 w-full xl:w-auto justify-between xl:justify-start z-10">
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 block">رصيد عملاتك الحالية</span>
              <span className="text-lg md:text-xl font-mono font-black text-amber-400">{userProfile.points} 🪙</span>
            </div>
            <button
              onClick={() => {
                triggerTickSound(900);
                setIsRechargeOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-l from-amber-400 to-amber-500 hover:from-amber-450 hover:to-amber-500 text-neutral-950 font-black rounded-xl text-xs transition-transform transform active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              شحن عملات إضافية 🪙
            </button>
          </div>
        </div>

        {/* Quick Recharge Package Grid inside the interface if modal is opened or as a quick-card display for ultimate convenience */}
        <AnimatePresence>
          {isRechargeOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neutral-900/60 border border-amber-500/20 p-5 rounded-3xl overflow-hidden text-right flex flex-col gap-4 z-20"
            >
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                <h4 className="text-xs md:text-sm font-black text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  منصة شحن العملات الإيمانية 🪙 (تهادوا تحابوا)
                </h4>
                <button
                  type="button"
                  onClick={() => setIsRechargeOpen(false)}
                  className="text-neutral-500 hover:text-white text-xs font-bold"
                >
                  إغلاق ✕
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                اختر الحزمة المفضلة لشحن رصيد حسابك فورا من العملات الروحية. تساعدك العملات في رمي الهدايا (المصحف الشريف، ماء زمزم، المسواك) بين المستخدمين بالمقاعد ورفع درجات التآخي!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                {COIN_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between gap-4 hover:border-amber-500/30 transition-all group"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">{pkg.title}</span>
                        <span className="text-xs bg-amber-500/10 text-amber-400 font-mono font-bold px-2 py-0.5 rounded">
                          +{pkg.coins} 🪙
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">{pkg.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerTickSound(1050);
                        setSelectedChargePack(pkg);
                        setTransferSuccess(false);
                        setTransferSenderName("");
                        setTransferSenderPhone("");
                        setProofImage(null);
                        setIsTransferModalOpen(true);
                      }}
                      className="w-full py-2 bg-neutral-900 group-hover:bg-amber-500 text-amber-400 group-hover:text-neutral-950 font-bold text-xs rounded-xl border border-neutral-800 group-hover:border-transparent transition-all cursor-pointer"
                    >
                      {pkg.priceLabel}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Main Seating Round Table Panel */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Beautiful Custom Header Banner with the User's Uploaded Background Image */}
        <div 
          className="relative rounded-2xl overflow-hidden border border-emerald-500/15 h-48 md:h-56 flex flex-col justify-end p-5 md:p-6 bg-cover bg-center shadow-lg"
          style={{ backgroundImage: "url('/room_welcome_bg.jpg')" }}
        >
          {/* High-contrast gradient overlay to make text perfectly readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-neutral-900/20"></div>
          
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-black font-sans backdrop-blur-sm">البث المباشر المعتمد</span>
                {currentRoomId === "public-chat" ? (
                  <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-black animate-pulse backdrop-blur-sm">دردشة وتبادل هدايا فوري 💬</span>
                ) : (
                  <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold backdrop-blur-sm">10 مقاعد فقط</span>
                )}
                {isConnected ? (
                  <span className="text-[9px] text-neutral-350 drop-shadow">متصل بالشبكة الإيمانية</span>
                ) : (
                  <span className="text-[9px] text-red-300 font-bold drop-shadow">يتم إعادة الاتصال...</span>
                )}
              </div>
              
              <h2 className="text-lg md:text-2xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
                {currentRoomId === "public-chat" ? "الديوان العام للمؤاخاة والدردشة 💬✨" : "مجلس تلاوة السور ومنابر الإيمان 🌹"}
              </h2>
              <p className="text-xs text-neutral-200 mt-1 drop-shadow font-medium max-w-xl leading-relaxed">
                {currentRoomId === "public-chat" 
                  ? "مساحة تفاعلية مخصصة للتعارف، الترحيب، المؤاخاة وتبادل الهدايا والبركات بشكل فوري ومستمر بدون قيود مقاعد!"
                  : "إدارة موقع إسلام بالعربي ترحب بالمشتركين وتتمنى لكم مجلساً مباركاً وتلاوة عطرة بـ 10 مقاعد!"}
              </p>
            </div>

            {currentRoomId !== "public-chat" && (
              <button
                onClick={toggleRoomLiveFeed}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-md ${
                  activeAudioTopic.isPlaying
                    ? "bg-emerald-950/80 border-emerald-400/40 text-emerald-300 hover:border-emerald-300"
                    : "bg-neutral-950/80 border-neutral-800 text-neutral-350 hover:border-neutral-750"
                }`}
              >
                {activeAudioTopic.isPlaying ? <Volume2 className="w-4 h-4 animate-bounce text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
                <div>
                  <p className="text-right leading-none font-bold">صوت البث الجماعي</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic selection of layout based on room type: New Users Room gets pure chat & gifts cards; other rooms keep normal 10 audio seats */}
        {currentRoomId === "public-chat" ? (
          <div className="space-y-6 animate-fade-in" id="public-chat-room-canvas">
            {/* 1. Header label indicating the system is updated to seat-free social zone */}
            <div className="bg-neutral-900 border border-amber-500/10 p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <div>
                  <h3 className="text-sm font-black text-white">دردشة وتبادل هدايا فوري (بدون قيود مقاعد)</h3>
                  <p className="text-[11px] text-neutral-400 leading-tight">اضغط مباشرة على أي مستخدم بالأسفل لإرسال هدية مميزة وحصد النقاط الروحية!</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 font-bold px-2.5 py-1 rounded border border-emerald-500/20">
                مؤاخاة دافئة وثواب مستمر ✨
              </span>
            </div>

            {/* 2. Interactive Members Grid without traditional locked seats constraint */}
            <div className="bg-neutral-950/80 border border-neutral-850 rounded-3xl p-5 md:p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />
              
              <h4 className="text-xs font-black text-amber-400 mb-4 flex items-center gap-2">
                👥 الإخوة والأعضاء المتواجدون بالدردشة حالياً:
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-10 relative">
                {seats.map((seat) => {
                  const u = seat.user;
                  if (!u) return null; // Avoid empty gaps - show only active people and bots continuously!
                  
                  const isMe = u.id === myClientId || u.name === userProfile.name;
                  const isBot = u.id.startsWith("bot_");
                  
                  return (
                    <motion.div
                      key={`participant_${seat.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-2xl border flex flex-col items-center text-center justify-between gap-3 relative transition-all ${
                        isMe 
                          ? "bg-amber-500/5 border-amber-400/30 shadow-[0_4px_15px_rgba(251,191,36,0.1)]" 
                          : "bg-neutral-900 border-neutral-800/80 hover:border-amber-500/10 hover:shadow-lg"
                      }`}
                    >
                      {/* Avatar decoration */}
                      <div className="relative">
                        {u.isSpeaking && (
                          <motion.div
                            className="absolute inset-0 bg-emerald-500/20 rounded-full scale-125 pointer-events-none"
                            animate={{ scale: [1.1, 1.3, 1.1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        )}
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className={`w-14 h-14 rounded-full border bg-neutral-950 p-1 ${
                            isMe 
                              ? "border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]" 
                              : "border-neutral-700"
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-neutral-950 text-neutral-400 p-0.5 rounded-full border border-neutral-800 text-[10px] font-bold">
                          {isBot ? "🤖" : "👤"}
                        </span>
                      </div>

                      {/* Info layout */}
                      <div className="space-y-1 w-full">
                        <p className={`text-xs font-black truncate w-full leading-none ${isMe ? "text-amber-400" : "text-white"}`}>
                          {u.name}
                        </p>
                        <div className="flex flex-col items-center gap-1 mt-1.5">
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                            isMe 
                              ? "bg-amber-500/20 text-amber-300" 
                              : isBot && u.name.includes("مستشار")
                              ? "bg-indigo-500/15 text-indigo-300"
                              : "bg-neutral-800 text-neutral-400"
                          }`}>
                            {isMe ? "حسابك (نشط)" : isBot && u.name.includes("مستشار") ? "مستشار ترحيبي 🎙️" : "عضو جديد 🆕"}
                          </span>
                          <span className="text-[10px] font-mono text-amber-500 font-bold leading-none">
                            {u.points} 🪙
                          </span>
                        </div>
                      </div>

                      {/* Gift Dispatch trigger */}
                      {isMe ? (
                        <div className="w-full text-center py-2 text-[9px] text-neutral-500 font-sans leading-none">
                          تلقي ثواب الجلوس (+20) 📈
                        </div>
                      ) : (
                        <button
                          type="button"
                          id={`direct-gift-trigger-${seat.id}`}
                          onClick={() => {
                            setSelectedRecipientSeatId(seat.id);
                            triggerTickSound(750);
                          }}
                          className="w-full py-2 bg-gradient-to-l from-amber-400 to-amber-500 hover:brightness-110 text-neutral-900 font-black text-[10px] rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1"
                        >
                          <span>أهدهِ هدية 🎁</span>
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 3. Immersive Live Chat Block inside mainstream area */}
            <div className="bg-neutral-950/60 p-5 rounded-3xl border border-neutral-850 flex flex-col gap-4 min-h-[420px] max-h-[550px] shadow-2xl relative">
              <div className="flex justify-between items-center border-b border-neutral-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 className="font-extrabold text-white text-xs md:text-sm">سجل المحادثات والبرمجة التفاعلية للمؤاخاة</h3>
                </div>
                <span className="text-[9px] text-neutral-500">{messages.length} رسالة نشطة</span>
              </div>

              {/* Scrolling messages container */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-neutral-800 text-right">
                {messages.map((m, idx) => (
                  <div 
                    key={`main_chat_${m.id}_${idx}`} 
                    className={`p-3.5 rounded-2xl border text-right transition-all text-xs leading-relaxed ${
                      m.isSystem 
                        ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-300 italic" 
                        : "bg-neutral-900 border-neutral-850/80 text-neutral-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-black text-[10px] ${m.isSystem ? "text-emerald-400 font-extrabold" : "text-amber-400"}`}>
                        {m.sender}
                      </span>
                      <span className="text-[8px] text-neutral-600 font-mono">{m.time}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-line text-neutral-200">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Typing inputs element */}
              <div className="flex gap-2.5 pt-3 border-t border-neutral-850">
                <input
                  id="voice-room-web-input-chat"
                  type="text"
                  placeholder="اكتب موعظة، مشاركة أو ترحيباً بالإخوة حالاً..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postChatMessage()}
                  className="flex-1 bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 px-4 py-3 rounded-xl outline-none focus:border-amber-400 transition-colors text-right"
                />
                <button
                  type="button"
                  id="main-chat-submit-btn-users"
                  onClick={postChatMessage}
                  className="bg-amber-500 hover:bg-amber-450 px-4 py-3 rounded-xl font-bold text-neutral-950 hover:text-black transition-colors shrink-0 cursor-pointer flex items-center justify-center"
                  title="إرسال من فضاء المؤاخاة"
                >
                  <Send className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* OTHERWISE: RENDER CONVENTIONAL 10 AUDIO SEATS INTERACTIVE ROUND TABLE */
          <div className="bg-slate-950/80 border border-neutral-850 rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Subtle starry dark night background overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHZpZXdCb3g9IjAgMCA4IDgiPjxjaXJjbGUgY3g9IjQiIGN5PSI0IiByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMjUiLz48L3N2Zz4=')] opacity-60 pointer-events-none"></div>

            {/* Highly responsive columns structure to ensure seats never overflow or stack awkwardly on small screens */}
            <div dir="rtl" className="w-full grid grid-cols-3 min-[450px]:grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-6 sm:gap-6 py-4 z-20">
              {seats.map((seat) => {
                const u = seat.user;
                const isMe = u !== null && (u.id === myClientId || u.name === userProfile.name);
                
                return (
                  <div 
                    key={seat.id} 
                    className="flex flex-col items-center justify-center text-center relative group min-h-[95px] sm:min-h-[120px]"
                  >
                    {/* Tactile Avatar structure */}
                    <div className="relative animate-fade-in">
                      
                      {/* Glowing Speaking feedback effect */}
                      {u && u.isSpeaking && (
                        <motion.div
                          className="absolute inset-0 bg-emerald-500/20 rounded-full scale-125 pointer-events-none shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          animate={{ scale: [1.1, 1.3, 1.1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        ></motion.div>
                      )}

                      {u && !u.isMuted && (
                        <span className="absolute -bottom-1 -left-1 bg-emerald-500 text-neutral-950 p-[3px] sm:p-1 rounded-full border border-neutral-900 z-10 transform scale-75 sm:scale-90 shadow-md animate-pulse">
                          <Mic className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        </span>
                      )}

                      {u && u.isMuted && (
                        <span className="absolute -bottom-1 -left-1 bg-neutral-950 text-neutral-500 p-[3px] sm:p-1 rounded-full border border-neutral-900 z-10 transform scale-75 sm:scale-90 shadow-md">
                          <MicOff className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        </span>
                      )}

                      {/* Occupier Profile avatar */}
                      {u ? (
                        <button
                          id={`seat-avatar-btn-${seat.id}`}
                          onClick={() => {
                            if (isMe) {
                              if (confirm("هل تريد مغادرة هذا المقعد الصوتي؟")) {
                                leaveSeat();
                              }
                            } else {
                              if (clientSeatedId === null) {
                                alert("يجب عليك شغل أحد المقاعد الشاغرة أولاً لتتمكن من إرسال الهدايا للآخرين!");
                                return;
                              }
                              setSelectedRecipientSeatId(seat.id);
                              triggerTickSound(750);
                            }
                          }}
                          className="relative focus:outline-none"
                        >
                          <img
                            id={`seat-avatar-${seat.id}`}
                            src={u.avatar}
                            alt="Participant Avatar"
                            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border bg-neutral-950 p-[1.5px] sm:p-1 transition-all ${
                              isMe 
                                ? "border-amber-400 scale-105 shadow-[0_0_12px_rgba(251,191,36,0.5)]" 
                                : u.isSpeaking 
                                  ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                                  : "border-neutral-700/80"
                            } shadow-[0_4px_12px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95`}
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ) : (
                        // Beautiful active empty seat placeholder with direct prompt to tap and talk
                        <button
                          id={`take-seat-btn-${seat.id}`}
                          onClick={() => takeSeat(seat.id)}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-dashed border-amber-500/35 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-400 hover:scale-105 active:scale-95 flex items-center justify-center text-amber-500/80 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-md animate-pulse"
                          title="انقر لتشغل هذا المقعد وتنضم للحوار"
                        >
                          <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                        </button>
                      )}
                    </div>

                    {/* Seat Labels section */}
                    {u ? (
                      <div className="text-center mt-1 w-full max-w-[60px] sm:max-w-[100px] flex flex-col items-center select-none">
                        <p className={`text-[9.5px] sm:text-[11.5px] font-black truncate w-full leading-tight ${isMe ? "text-amber-400 font-extrabold" : "text-neutral-200"}`}>
                          {u.name.split(" ")[0]}
                        </p>
                        
                        <div className="flex items-center justify-center gap-0.5 mt-0.5 w-full">
                          <span className="text-[8px] text-neutral-400 font-sans font-medium truncate">
                            {u.points} 🪙
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center mt-1 select-none">
                        <span className="text-[9.5px] sm:text-[11px] font-extrabold text-amber-400 tracking-wide leading-none">
                          مقعد {seat.id + 1}
                        </span>
                        <span className="text-[7.5px] sm:text-[9.5px] text-neutral-400/90 leading-none mt-0.5">
                          اضغط للتحدث
                        </span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Interactive Seat Microphone & talk dashboard if user sitsdown */}
            {clientSeatedId !== null && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-6 bg-neutral-950 p-4 rounded-2xl border border-neutral-850 flex flex-col md:flex-row justify-between items-center gap-4 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                    <Mic className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">أنت تشغل المقعد رقم {clientSeatedId + 1} حالياً</p>
                    <p className="text-[10px] text-neutral-400">يمكنك كتم الميكروفون أو تنشيط التحدث البصري ليرى المجلس موجاتك الصوتية.</p>
                  </div>
                </div>

                {/* Action triggers */}
                <div className="flex items-center gap-2">
                  
                  <button
                    id={`mic-toggle-at-seat-${clientSeatedId}`}
                    onClick={toggleMute}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isClientMuted 
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-neutral-900" 
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-neutral-900"
                    }`}
                  >
                    {isClientMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isClientMuted ? "المايك مغلق (كتم)" : "المايك مفتوح (نشط)"}</span>
                  </button>

                  {/* Simulated Click to Speack trigger to fluctuating ripple effects */}
                  {!isClientMuted && (
                    <button
                      id="simulate-voice-stream-btn"
                      onMouseDown={() => handleClientSpeakingLoop(true)}
                      onMouseUp={() => handleClientSpeakingLoop(false)}
                      onTouchStart={() => handleClientSpeakingLoop(true)}
                      onTouchEnd={() => handleClientSpeakingLoop(false)}
                      className={`px-4 py-2 ${
                        isClientSpeaking ? "bg-amber-500 text-neutral-950 border-amber-400 font-extrabold" : "bg-neutral-900 text-neutral-300 border-neutral-800"
                      } border rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all select-none cursor-pointer`}
                    >
                      {isClientSpeaking ? "تحدث بصوتك مسموع..." : "اضغط باستمرار للتحدث"}
                    </button>
                  )}

                  <button
                    id="client-leave-seat-bottom-btn"
                    onClick={leaveSeat}
                    className="bg-neutral-900 hover:bg-red-950 border border-neutral-800 hover:border-red-500/20 p-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-red-400 transition-colors cursor-pointer select-none"
                    title="مغادرة المجلس الصوتي"
                  >
                    مغادرة المقعد
                  </button>

                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* New Users welcome gifts claiming banner */}
        {!claimedWelcomeBag && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-900 border border-amber-500/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3.5">
              <span className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-2xl animate-spin">
                🎁
              </span>
              <div>
                <h3 className="font-extrabold text-amber-400 text-sm md:text-base flex items-center gap-2">
                  حقيبة الترحيب وحفاوة الجدد!
                  <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-bold animate-pulse">مكافأة فورية</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  بصفتك مستخدماً جديداً، يمكنك الآن استلام هديتك الترحيبية الشاملة لـ <strong className="text-white font-bold font-mono">200 حبة نقاط روحية</strong> ولقب <strong className="text-white font-bold">"أخ في الله"</strong> الشرفي بالمجلس!
                </p>
              </div>
            </div>

            <button
              id="claim-join-welcome-bag-btn"
              onClick={claimNewUserWelcomeBag}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-black text-xs rounded-xl shadow-all active:scale-95 transition-transform"
            >
              افتح حقيبة الجدد كرمًا
            </button>
          </motion.div>
        )}

      </div>

      {/* Sidebar - Spiritual Gifts Dispatcher or Chat logs */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Modal-like Spiritual Gift Picker if recipient seat selected */}
        {selectedRecipientSeatId !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border-2 border-amber-500/40 p-4 rounded-2xl flex flex-col gap-4 relative z-30"
          >
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-500 animate-pulse" />
                إرسال هدية إلى {currentRoomId === "public-chat" ? (seats[selectedRecipientSeatId]?.user?.name || "عضو جديد") : `المقعد رقم ${selectedRecipientSeatId + 1}`}
              </h3>
              <button
                onClick={() => setSelectedRecipientSeatId(null)}
                className="text-neutral-500 hover:text-white font-bold text-xs p-1"
                title="إلغاء الإرسال"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 overflow-y-auto max-h-[300px]">
              {SPIRITUAL_GIFTS.map((g) => {
                const canAfford = userProfile.points >= g.price;
                return (
                  <button
                    id={`buy-gift-btn-${g.id}`}
                    key={g.id}
                    onClick={() => sendSpiritualGift(g)}
                    disabled={!canAfford}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      canAfford
                        ? "bg-neutral-950 border-neutral-800 hover:border-amber-500/20 text-neutral-300"
                        : "bg-neutral-950/60 border-neutral-950 opacity-45 cursor-not-allowed text-neutral-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl shrink-0 p-1 bg-neutral-900 rounded">{g.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-white">{g.arabicName}</p>
                        <p className="text-[9px] text-neutral-500 leading-tight mt-0.5">{g.description}</p>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="text-[10px] bg-neutral-900 px-2 py-1 rounded font-mono font-bold text-amber-400 border border-neutral-850">
                        {g.price} 🪙
                      </span>
                      <p className="text-[8px] text-emerald-400 mt-1">يمنح +{g.pointsReward}ب</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-neutral-950/80 p-3 rounded-lg border border-neutral-850">
              <p className="text-[9px] text-neutral-400 leading-relaxed">
                بموجب المأثور "تهادوا تحابوا"، كرم إخوانك وهادهم بمحفزات روحية مستدامة لكسب درجات المودة لرفع مستواك ودرجاتك في المنصة.
              </p>
            </div>
          </motion.div>
        )}

        {/* Live chat-box (shown only in traditional 10 seats rooms; hidden in New Users Room where the widescreen central chat is displayed) */}
        {currentRoomId !== "public-chat" && (
          <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-4 flex-1 min-h-[360px] max-h-[500px]">
            <h3 className="font-extrabold text-white text-xs md:text-sm flex items-center gap-1.5 border-b border-neutral-800 pb-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              سجل وتذاكر المودة بالمجلس
            </h3>

            {/* List of scroll messages */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-neutral-850 text-right">
              {messages.map((m, idx) => (
                <div 
                  key={`${m.id}-${idx}`} 
                  className={`p-3 rounded-xl border text-right transition-all text-xs leading-relaxed ${
                    m.isSystem 
                      ? "bg-emerald-950/15 border-emerald-500/10 text-emerald-300 italic" 
                      : "bg-neutral-950 border-neutral-900 text-neutral-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-black text-[10px] ${m.isSystem ? "text-emerald-400" : "text-neutral-400"}`}>
                      {m.sender}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-mono">{m.time}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Input text dispatcher */}
            <div className="flex gap-2.5 pt-2 border-t border-neutral-800">
              <input
                id="voice-room-chat-input"
                type="text"
                placeholder="اكتب رسالة نصية أو موعظة دافئة..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postChatMessage()}
                className="flex-1 bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 px-3 py-2.5 rounded-xl outline-none focus:border-amber-400 transition-colors"
              />
              <button
                id="send-voice-room-msg-btn"
                onClick={postChatMessage}
                className="bg-amber-500 hover:bg-amber-450 p-2.5 rounded-xl font-bold text-neutral-950 hover:text-black transition-colors shrink-0 cursor-pointer"
                title="إرسال"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* Offline helper details */}
        <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-[10px] md:text-xs font-bold text-neutral-300">كيف تستخدم الغرفة الصوتية؟</h4>
            <p className="text-[10px] text-neutral-400 leading-relaxed font-sans mt-0.5">
              1. انقر على أي مقعد <strong className="text-amber-400 font-extrabold">شاغر</strong> لتجلس وتتخذ مقعدك بالمجلس.
              <br />
              2. اختر أي سورة من <strong className="text-white hover:underline">مصحف الـ 114 سورة بالكامل</strong> لبثها للإخوة.
              <br />
              3. هادِ إخوانك وزملائك بالمجلس بالهدايا (انقر كرم) لنقل الثواب والنقاط المتبادلة!
            </p>
          </div>
        </div>

      </div>

      {/* Vodaphone Cash Transfer Modal */}
      <AnimatePresence>
        {isTransferModalOpen && selectedChargePack && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-yellow-500/30 rounded-2xl p-5 md:p-8 max-w-lg w-full text-right relative shadow-2xl my-8 font-sans"
              dir="rtl"
            >
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 font-bold transition text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                  <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-black text-white">شحن {selectedChargePack.title || selectedChargePack.name} ({selectedChargePack.coins.toLocaleString()} عملة)</h2>
                    <p className="text-xs text-neutral-400">إجراءات التحويل المباشر لضمان الأمان والربط بالسلسلة مع الأستاذ أحمد علاء</p>
                  </div>
                </div>

                {!transferSuccess ? (
                  <form onSubmit={handleTransferSubmit} className="space-y-4">
                    <div className="bg-gradient-to-l from-amber-500/5 to-neutral-950 p-3.5 rounded-xl border border-amber-500/10">
                      <p className="text-xs text-white leading-relaxed mb-3">
                        لإتمام الشحن، يرجى تحويل مبلغ <strong className="text-yellow-400 text-sm font-bold">{selectedChargePack.priceEGP} جنيه مصري</strong> بالتفاصيل التالية:
                      </p>
                      
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                          <span className="text-neutral-400 font-sans">اسم صاحب الحساب:</span>
                          <span className="text-neutral-200 font-bold font-sans">أستاذ أحمد علاء</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-neutral-400 font-sans">رقم المحفظة (فودافون كاش):</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-300 font-black tracking-wider text-sm select-all">01507251444</span>
                            <button
                              type="button"
                              onClick={handleCopyNumber}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-sans"
                              title="نسخ الرقم"
                            >
                              {copiedNumber ? "تم النسخ ✓" : (
                                <>
                                  <Copy className="w-3 h-3 text-yellow-500" />
                                  <span>نسخ</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5" htmlFor="voice-sender-name-input">
                          اسم المحوّل بالكامل <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="voice-sender-name-input"
                          type="text"
                          required
                          value={transferSenderName}
                          onChange={(e) => setTransferSenderName(e.target.value)}
                          placeholder="مثال: محمد أحمد علي"
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-yellow-500/50 outline-none text-white transition-all text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5" htmlFor="voice-sender-phone-input">
                          الرقم الذي تم التحويل منه <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="voice-sender-phone-input"
                          type="tel"
                          required
                          value={transferSenderPhone}
                          onChange={(e) => setTransferSenderPhone(e.target.value)}
                          placeholder="مثال: 01xxxxxxxxx"
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-yellow-500/50 outline-none text-white transition-all text-right font-mono"
                        />
                      </div>

                      {/* Drag-and-drop / manual screenshot upload component */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                          إرفاق لقطة شاشة لإثبات المعاملة <span className="text-neutral-500 font-normal">(اختياري)</span>
                        </label>
                        
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center min-h-[110px] cursor-pointer ${
                            isDragging
                              ? "border-yellow-500 bg-yellow-500/5"
                              : proofImage
                              ? "border-emerald-500/45 bg-emerald-950/5"
                              : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="voice-screenshot-file-upload"
                          />
                          <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            {proofImage ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">تم إرفاق إثبات التحويل ✓</span>
                                <img src={proofImage} alt="Receipt proof" className="max-h-16 rounded border border-neutral-850 mt-1 shadow-sm object-contain" />
                                <span className="text-[10px] text-neutral-500">انقر أو اسحب لتغيير الصورة</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className={`w-6 h-6 mb-2 ${isDragging ? "text-yellow-400 animate-bounce" : "text-neutral-500"}`} />
                                <p className="text-xs font-bold text-neutral-300">اسحب صورة الإيصال هنا أو تصفّح</p>
                                <p className="text-[10px] text-neutral-500 mt-0.5">يدعم JPG, PNG (للرفع والتحقق الفوري)</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      id="voice-submit-transfer-payment-btn"
                      type="submit"
                      disabled={isSubmittingTransfer}
                      className="w-full py-3 mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-yellow-500/5 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingTransfer ? (
                        <>
                          <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                          <span>يتم التحقق البرمجي ومعالجة طلبك...</span>
                        </>
                      ) : (
                        <span>تأكيد إرسال التحويل وشحن الـ {selectedChargePack.coins.toLocaleString()} عملة فورياً</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-emerald-400">مبارك! تم إرسال طلب الشحن بنجاح</h3>
                      <p className="text-xs text-neutral-300 leading-relaxed mt-2 max-w-sm mx-auto">
                        لقد تلقينا طلب التحويل الخاص بك وتمت مطابقته مع السلسلة فورياً! تمت إضافة 
                        <strong className="text-yellow-400 font-bold mx-1">{selectedChargePack.coins.toLocaleString()} عملة</strong> 
                        إلى رصيدك الإيماني التراكمي بنجاح. جزاكم الله كُلّ خير لدعمكم منصة إسلام بالعربي.
                      </p>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 w-full text-right space-y-1.5 text-xs text-neutral-400 font-mono">
                      <p className="text-[11px] text-neutral-500 mb-1 border-b border-neutral-900 pb-1 font-bold">ملخص الإيصال المشحون:</p>
                      <p>• المرسل: <span className="text-neutral-200">{transferSenderName}</span></p>
                      <p>• رقم التحويل: <span className="text-neutral-200">{transferSenderPhone}</span></p>
                      <p>• المستلم: <span className="text-neutral-200">الأستاذ أحمد علاء (01507251444)</span></p>
                      <p>• القيمة المضافة: <span className="text-emerald-400 font-bold font-sans">{selectedChargePack.coins.toLocaleString()} عملة</span></p>
                    </div>

                    <button
                      id="voice-close-success-recharge-btn"
                      onClick={() => {
                        setIsTransferModalOpen(false);
                      }}
                      className="px-6 py-2.5 bg-neutral-800 text-white hover:bg-neutral-750 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      حسناً، العودة للمجلس ممتناً
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
