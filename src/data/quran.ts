import { Surah } from "../types";

export const quranData: Surah[] = [
  {
    id: 1,
    name: "الفاتحة",
    englishName: "Al-Fatiha",
    type: "مكية",
    versesCount: 7,
    verses: [
      { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
      { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "[All] praise is [due] to Allah, Lord of the worlds -" },
      { number: 3, text: "الرَّحْمَنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful," },
      { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense." },
      { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
      { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path -" },
      { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray." }
    ]
  },
  {
    id: 36,
    name: "يس",
    englishName: "Ya-Sin",
    type: "مكية",
    versesCount: 12, // Trimmed for optimal token size while keeping it rich
    verses: [
      { number: 1, text: "يس", translation: "Ya, Seen." },
      { number: 2, text: "وَالْقُرْآنِ الْحَكِيمِ", translation: "By the wise Qur'an," },
      { number: 3, text: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ", translation: "Indeed you, [O Muhammad], are of the messengers," },
      { number: 4, text: "عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ", translation: "On a straight path." },
      { number: 5, text: "تَنْزِيلَ الْعَزِيزِ الرَّحِيمِ", translation: "[This is] a revelation of the Exalted in Might, the Merciful," },
      { number: 6, text: "لِتُنْذِرَ قَوْمًا مَا أُنْذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ", translation: "That you may warn a people whose forefathers were not warned, so they are heedless." },
      { number: 7, text: "لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ", translation: "Already the word has come into effect upon most of them, so they do not believe." },
      { number: 8, text: "إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُمْ مُقْمَحُونَ", translation: "Indeed, We have put shackles on their necks, and they are to their chins, so they are with heads kept aloft." },
      { number: 9, text: "وَجَعَلْنَا مِنْ بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ", translation: "And We have put before them a barrier and behind them a barrier and covered them, so they do not see." },
      { number: 10, text: "وَسَوَاءٌ عَلَيْهِمْ أَأَنْذَرْتَهُمْ أَمْ لَمْ تُنْذِرْهُمْ لَا يُؤْمِنُونَ", translation: "And it is all the same for them whether you warn them or do not warn them - they will not believe." },
      { number: 11, text: "إِنَّمَا تُنْذِرُ مَنِ اتَّبَعَ الذِّكْرَ وَخَشِيَ الرَّحْمَنَ بِالْغَيْبِ ۖ فَبَشِّرْهُ بِمَغْفِرَةٍ وَأَجْرٍ كَرِيمٍ", translation: "You can only warn one who follows the message and fears the Entirely Merciful unseen. So give him good tidings of forgiveness and noble reward." },
      { number: 12, text: "إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ ۚ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُبِينٍ", translation: "Indeed, it is We who bring the dead to life and record what they have put forth and what they left behind, and all things We have enumerated in a clear register." }
    ]
  },
  {
    id: 18,
    name: "الكهف",
    englishName: "Al-Kahf",
    type: "مكية",
    versesCount: 10, // First 10 verses (highly sunnah to read on Fridays)
    verses: [
      { number: 1, text: "الْحَمْدُ لِلَّهِ الَّذِي أَنْزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَلْ لَهُ عِوَجًا ۜ", translation: "[All] praise is [due] to Allah, who has sent down upon His Servant the Book and has not made therein any deviance." },
      { number: 2, text: "قَيِّمًا لِيُنْذِرَ بَأْسًا شَدِيدًا مِنْ لَدُنْهُ وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا", translation: "[He has made it] straight, to warn of severe punishment from Him and to give good tidings to the believers who do righteous deeds that they will have a good reward," },
      { number: 3, text: "مَاكِثِينَ فِيهِ أَبَدًا", translation: "In which they will remain forever" },
      { number: 4, text: "وَيُنْذِرَ الَّذِينَ قَالُوا اتَّخَذَ اللَّهُ وَلَدًا", translation: "And to warn those who say, 'Allah has taken a son.'" },
      { number: 5, text: "مَا لَهُمْ بِهِ مِنْ عِلْمٍ وَلَا لِآبَائِهِمْ ۚ كَبُرَتْ كَلِمَةً تَخْرُجُ مِنْ أَفْوَاهِهِمْ ۚ إِنْ يَقُولُونَ إِلَّا كَذِبًا", translation: "They have no knowledge of it, nor had their fathers. Grave is the word that comes out of their mouths; they speak not except a lie." },
      { number: 6, text: "فَلَعَلَّكَ بَاخِعٌ نَفْسَكَ عَلَىٰ آثَارِهِمْ إِنْ لَمْ يُؤْمِنُوا بِهَٰذَا الْحَدِيثِ أَسَفًا", translation: "Then perhaps you would kill yourself with grief over their footsteps, [O Muhammad], if they do not believe in this message." },
      { number: 7, text: "إِنَّا جَعَلْنَا مَا عَلَى الْأَرْضِ زِينَةً لَهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًا", translation: "Indeed, We have made that which is on the earth adornment for it that We may test them as to which of them is best in deed." },
      { number: 8, text: "وَإِنَّا لَجَاعِلُونَ مَا عَلَيْهَا صَعِيدًا جُرُزًا", translation: "And indeed, We will make that which is upon it [into] a barren ground." },
      { number: 9, text: "أَمْ حَسِبْتَ أَنَّ أَصْحَابَ الْكَهْفِ وَالرَّقِيمِ كَانُوا مِنْ آيَاتِنَا عَجَبًا", translation: "Or have you thought that the companions of the cave and the inscription were, among Our signs, a wonder?" },
      { number: 10, text: "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا", translation: "[Remember] when the youths retreated to the cave and said, 'Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.'" }
    ]
  },
  {
    id: 67,
    name: "الملك",
    englishName: "Al-Mulk",
    type: "مكية",
    versesCount: 10,
    verses: [
      { number: 1, text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", translation: "Blessed is He in whose hand is dominion, and He is over all things competent -" },
      { number: 2, text: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ", translation: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -" },
      { number: 3, text: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَا تَرَىٰ فِي خَلْقِ الرَّحْمَنِ مِنْ تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِنْ فُطُورٍ", translation: "[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision [to the heaven]; do you see any breaks?" },
      { number: 4, text: "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنْقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", translation: "Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued." },
      { number: 5, text: "وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ", translation: "And We have certainly beautified the nearest heaven with stars and have made [from] them what is thrown at the devils and have prepared for them the punishment of the Blaze." },
      { number: 6, text: "وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ الْمَصِيرُ", translation: "And for those who disbelieved in their Lord is the punishment of Hell, and wretched is the destination." },
      { number: 7, text: "إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ", translation: "When they are thrown into it, they hear from it a inhaling while it boils up." },
      { number: 8, text: "تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ ۖ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ", translation: "It almost bursts with rage. Every time a company is thrown into it, its keepers ask them, 'Did there not come to you a warner?'" },
      { number: 9, text: "قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِنْ شَيْءٍ إِنْ أَنْتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ", translation: "They will say, 'Yes, a warner had come to us, but we denied and said, \"Allah has not sent down anything. You are not but in great error.\"" },
      { number: 10, text: "وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ", translation: "And they will say, 'If only we had listened or reasoned, we would not be among the companions of the Blaze.'" }
    ]
  },
  {
    id: 112,
    name: "الإخلاص",
    englishName: "Al-Ikhlas",
    type: "مكية",
    versesCount: 4,
    verses: [
      { number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, 'He is Allah, [who is] One," },
      { number: 2, text: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge." },
      { number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born," },
      { number: 4, text: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent.'" }
    ]
  },
  {
    id: 113,
    name: "الفلق",
    englishName: "Al-Falaq",
    type: "مكية",
    versesCount: 5,
    verses: [
      { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Say, 'I seek refuge in the Lord of daybreak" },
      { number: 2, text: "مِنْ شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created" },
      { number: 3, text: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles" },
      { number: 4, text: "وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "And from the evil of the blowers in knots" },
      { number: 5, text: "وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies.'" }
    ]
  },
  {
    id: 114,
    name: "الناس",
    englishName: "An-Nas",
    type: "مكية",
    versesCount: 6,
    verses: [
      { number: 1, text: "قُل * أَعُوذُ بِرَبِّ النَّاسِ", translation: "Say, 'I seek refuge in the Lord of mankind," },
      { number: 2, text: "مَلِكِ النَّاسِ", translation: "The Sovereign of mankind," },
      { number: 3, text: "إِلَٰهِ النَّاسِ", translation: "The God of mankind," },
      { number: 4, text: "مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", translation: "From the evil of the retreating whisperer -" },
      { number: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", translation: "Who whispers [evil] into the breasts of mankind -" },
      { number: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", translation: "From among the jinn and mankind.'" }
    ]
  }
];
