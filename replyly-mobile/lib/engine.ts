import type { BizId, BusinessProfile, IntentId, ToneId } from './constants';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function splitCsv(str: string): string[] {
  return String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function applyBrandWords(text: string, profile: BusinessProfile | null): string {
  if (!profile || !text) return text;
  let out = String(text);
  const never = splitCsv(profile.neverSay);
  const always = splitCsv(profile.alwaysSay);
  const softSwap: Record<string, string> = {
    cheap: 'affordable',
    asap: 'as soon as we can',
    bro: 'there',
    guaranteed: 'happy to confirm',
    'no problem': 'happy to help',
    dude: 'there',
    whatever: 'happy to check',
  };

  never.forEach((word) => {
    const key = word.toLowerCase();
    const swap = softSwap[key];
    const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
    out = swap ? out.replace(re, swap) : out.replace(re, '');
  });

  always.forEach((phrase) => {
    if (!phrase) return;
    if (out.toLowerCase().includes(phrase.toLowerCase())) return;
    if (phrase.length <= 8 && /^(dr\.?|mr\.?|ms\.?|mrs\.?)$/i.test(phrase)) {
      const title = /dr/i.test(phrase) ? 'Dr.' : `${phrase.replace(/\.$/, '')}.`;
      if (profile.name && out.includes(profile.name) && !out.includes(title)) {
        out = out.replace(profile.name, `${title} ${profile.name}`);
        return;
      }
    }
    if (phrase.length > 8) {
      out = out.replace(/\s+$/, '');
      const sep = /[.!?]$/.test(out) ? ' ' : '. ';
      out =
        out +
        sep +
        phrase.replace(/^./, (c) => c.toUpperCase()).replace(/\.$/, '') +
        '.';
    } else if (!out.toLowerCase().includes(phrase.toLowerCase())) {
      out = out.replace(/\s+$/, '');
      out += (/[.!?]$/.test(out) ? ' ' : '. ') + phrase;
    }
  });

  return out.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1').trim();
}

export function detectIntents(text: string): IntentId[] {
  const t = text.toLowerCase();
  const intents: IntentId[] = [];
  const rules: { id: IntentId; re: RegExp }[] = [
    { id: 'price', re: /price|cost|how much|fee|rate|رسوم|سعر|كم|بكام|اسعار|أسعار|تكلفة/ },
    { id: 'hours', re: /open|hours|timing|when are you|close|موعد|دوام|مفتوح|مغلقة|ساعات|متى تفتح/ },
    { id: 'booking', re: /book|appoint|reserv|available|slot|tomorrow|today|حجز|موعد|بكرة|احجز|متاح/ },
    { id: 'location', re: /where|address|location|map|directions|وين|عنوان|موقع|فين|خريطة/ },
    { id: 'complaint', re: /complaint|refund|wrong|late|bad|angry|مشكلة|استرجاع|سيء|زعلان|تأخير|غلط/ },
    { id: 'thanks', re: /thank|thanks|شكر|مشكور|يعطيك|تسلم/ },
  ];
  rules.forEach((r) => {
    if (r.re.test(t)) intents.push(r.id);
  });
  if (!intents.length) intents.push('price'); // treated as general via bodyFor fallback path
  return intents.length ? intents : (['price'] as IntentId[]);
}

function bizNoun(biz: BizId, profile: BusinessProfile | null): string {
  if (profile?.name) return profile.name;
  const map: Record<BizId, string> = {
    restaurant: 'our restaurant',
    clinic: 'our clinic',
    salon: 'our salon',
    realestate: 'our agency',
    retail: 'our shop',
    other: 'us',
  };
  return map[biz] || 'us';
}

function greeting(tone: ToneId, arabic: boolean, profile: BusinessProfile | null): string {
  const name = profile?.name || '';
  if (arabic) {
    if (tone === 'short') return pick(['Hi!', 'مرحبا!', 'أهلاً!', 'هلا!']);
    if (tone === 'professional') {
      return pick(['Hello,', 'مرحبا،', 'السلام عليكم،', name ? `مرحبا، معك ${name}،` : 'Good day,']);
    }
    return pick(['Hi there!', 'مرحبا! 😊', 'أهلاً وسهلاً!', name ? `Hi from ${name}!` : 'Hello!', 'هلا والله!']);
  }
  if (tone === 'short') return pick(['Hi!', 'Hello!', 'Hey!']);
  if (tone === 'professional') {
    return pick(['Hello,', 'Good day,', 'Thank you for reaching out.', name ? `Hello from ${name},` : 'Hello,']);
  }
  return pick(['Hi there!', 'Hello!', 'Thanks for messaging!', name ? `Hi — this is ${name}!` : 'Thanks for your message!']);
}

function closing(tone: ToneId, arabic: boolean): string {
  if (tone === 'short') {
    return arabic
      ? pick(['Let me know.', 'خبرني.', 'تمام؟', 'Thanks!', 'أبشر.'])
      : pick(['Let me know.', 'Thanks!', 'Ping me anytime.']);
  }
  if (tone === 'professional') {
    return arabic
      ? pick(['Happy to help further.', 'في خدمتك.', 'نورتنا — خبرنا كيف نكمل.'])
      : pick(['Happy to help further.', 'Looking forward to assisting you.', "Please let us know how you'd like to proceed."]);
  }
  return arabic
    ? pick(['Happy to help! 🌿', "Anytime — just message us.", 'تحت أمرك!', 'أبشر، أي شيء ثاني؟'])
    : pick(['Happy to help!', 'Anytime — just message us.', "We're here if you need anything!"]);
}

function profileFacts(intent: string, profile: BusinessProfile | null, arabic: boolean): string {
  if (!profile) return '';
  const bits: string[] = [];
  if ((intent === 'hours' || intent === 'booking' || intent === 'general') && profile.hours) {
    bits.push(arabic ? `دوامنا: ${profile.hours}` : `Our hours: ${profile.hours}`);
  }
  if ((intent === 'location' || intent === 'booking' || intent === 'general') && profile.location) {
    bits.push(arabic ? `موقعنا: ${profile.location}` : `We're in ${profile.location}`);
  }
  if ((intent === 'price' || intent === 'booking') && profile.services) {
    const note = profile.services.length > 140 ? `${profile.services.slice(0, 137)}…` : profile.services;
    bits.push(arabic ? `ملاحظات الأسعار/الخدمات: ${note}` : `Quick note on services/prices: ${note}`);
  }
  return bits[0] || '';
}

type BodyPack = Record<string, Partial<Record<BizId | 'other', string[]>>>;

const BODIES: BodyPack = {
  price: {
    restaurant: [
      'Our prices depend on the dishes — happy to share the menu or quote a specific item.',
      "I can send today's prices right away. Which dishes are you looking at?",
      "Sure — tell me what you'd like and I'll confirm the exact total.",
    ],
    clinic: [
      "Consultation fees vary by service. Share what you need and I'll confirm the price.",
      'Happy to quote you. Is this a first visit or a follow-up?',
      'I can send our fee list for that service — which one are you asking about?',
    ],
    salon: [
      'Pricing depends on the service and hair length. Which treatment are you after?',
      'Happy to quote you — haircut, color, or a package?',
      'I can send our price list. Want the full menu or one service?',
    ],
    realestate: [
      'Happy to share pricing / asking details for that property. Which listing did you mean?',
      'I can send the price and payment notes. Are you looking to rent or buy?',
      "Sure — I'll confirm the current asking price and any fees.",
    ],
    retail: [
      'I can check the price for you. Do you have the product name or a photo?',
      'Happy to confirm — which item and size?',
      "Sure, I'll look up the current price and any offers.",
    ],
    other: [
      'Happy to confirm pricing. Could you share a bit more detail?',
      "Sure — tell me which service/product and I'll quote you.",
      'I can send the price shortly. What exactly do you need?',
    ],
  },
  hours: {
    restaurant: [
      "We're open daily — message us your preferred time and we'll confirm if the kitchen is available.",
      'Our usual hours are lunch through late evening. When were you hoping to come by?',
      "Yes — we're open today. What time works for you?",
    ],
    clinic: [
      'Our clinic hours run weekdays with limited weekend slots. Which day works best?',
      'We can check openings for your preferred day. Morning or afternoon?',
      "Yes, we're open — tell me a day/time and I'll confirm.",
    ],
    salon: [
      "We're open most days; evenings fill up fast. What day were you thinking?",
      'Happy to check our schedule. Weekday or weekend?',
      'Yes — we have hours today. Prefer morning or afternoon?',
    ],
    realestate: [
      "I'm available for calls/viewings most weekdays. What time suits you?",
      'Happy to schedule around your hours. Morning or evening preferred?',
      'Yes — I can make time. Which day works?',
    ],
    retail: [
      'Our shop hours are posted in the status — when were you planning to visit?',
      "We're open today. Need anything held before you come?",
      "Yes, we're open. What time should we expect you?",
    ],
    other: [
      "We're available most business hours. When works for you?",
      'Happy to confirm our hours for your visit.',
      "Yes — tell me a time and I'll check.",
    ],
  },
  booking: {
    restaurant: [
      "We'd love to reserve a table. How many guests and what time?",
      'Sure — I can check availability. Party size + preferred time?',
      'Happy to book you in. Name, guests, and time please?',
    ],
    clinic: [
      'I can help book an appointment. Preferred day and morning/afternoon?',
      'Yes — we have openings. New patient or returning?',
      'Happy to schedule you. What service and which day?',
    ],
    salon: [
      'I can book that for you. Preferred stylist, day, and time?',
      'Yes — we still have slots. Tomorrow afternoon okay, or another day?',
      'Happy to hold a time. Haircut, color, or both?',
    ],
    realestate: [
      'I can arrange a viewing. Which property and what times work this week?',
      'Yes — happy to schedule a visit. Weekday evening or weekend?',
      "Let's book a slot. Are you available tomorrow?",
    ],
    retail: [
      "I can reserve that item for pickup. Name and when you'll come by?",
      "Sure — I'll hold it if it's in stock. Preferred pickup time?",
      'Happy to book a pickup slot for you.',
    ],
    other: [
      'Happy to book that. Preferred date and time?',
      "Yes — tell me when works and I'll confirm.",
      'I can schedule you in. What day suits you?',
    ],
  },
  location: {
    restaurant: ["I'll send our location pin right away. Parking is nearby.", "We're easy to find — I can share Google Maps.", 'Sharing our address/pin now.'],
    clinic: ["I'll send the clinic address and parking notes.", 'Happy to share our location pin.', "Here's how to find us — I can drop a map link."],
    salon: ["I'll send our salon pin. Street parking is usually available.", 'Sharing location now.', "Easy to find — I'll text the map."],
    realestate: ["I'll send the property pin and meeting point.", 'Happy to share exact location for the viewing.', 'Sending the map link now.'],
    retail: ["I'll share our shop location.", "Here's how to find us — map pin coming.", 'Sending address now.'],
    other: ["I'll send our location details.", 'Happy to share the address/pin.', 'Sending directions now.'],
  },
  complaint: {
    restaurant: [
      "I'm really sorry about that — please tell me what went wrong so we can fix it.",
      'Apologies. We want to make this right. Order details?',
      "Sorry for the trouble. I'll escalate this and get back quickly.",
    ],
    clinic: [
      "I'm sorry for the inconvenience. Please share details so we can resolve it.",
      'Apologies — your experience matters. Can you share what happened?',
      "Sorry about this. I'll look into it immediately.",
    ],
    salon: [
      "I'm sorry it didn't meet expectations. Happy to offer a fix or rebooking.",
      "Apologies — tell me what happened and we'll make it right.",
      'Sorry for that. I can arrange a complimentary adjustment if helpful.',
    ],
    realestate: [
      'Sorry for the frustration. Let me clarify and fix the next steps.',
      "Apologies — I'll follow up personally on this.",
      "I understand. Here's how we'll resolve it.",
    ],
    retail: [
      "I'm sorry about that. We can arrange exchange/return — order details?",
      'Apologies. Happy to replace or refund per our policy.',
      "Sorry for the inconvenience. I'll sort this out today.",
    ],
    other: [
      "I'm sorry about this. Please share details so we can help.",
      "Apologies — we'll make it right.",
      "Sorry for the trouble. I'm on it.",
    ],
  },
  thanks: {
    restaurant: ["You're welcome — see you soon!", 'Our pleasure. Enjoy!', 'Anytime — thanks for choosing us!'],
    clinic: ["You're welcome. Wishing you good health.", 'Happy to help. Take care.', "Anytime — we're here for you."],
    salon: ["You're welcome! Can't wait to see you.", 'Our pleasure ✨', 'Anytime — thank you!'],
    realestate: ["You're welcome. Happy to help with the next step.", 'My pleasure — talk soon.', 'Anytime.'],
    retail: ["You're welcome! Enjoy your purchase.", 'Happy to help anytime.', 'Thanks for shopping with us!'],
    other: ["You're welcome!", 'Happy to help.', 'Anytime!'],
  },
  general: {
    restaurant: [
      'Thanks for messaging — how can we help with your order or reservation?',
      'Happy to help — food, booking, or hours?',
      'Thanks for reaching out. What do you need today?',
    ],
    clinic: [
      'Thanks for contacting us. How can we assist?',
      'Happy to help with appointments or questions.',
      'Thanks for messaging. Tell us what you need.',
    ],
    salon: [
      'Thanks for messaging! How can we help today?',
      'Happy to help with booking or pricing.',
      'Thanks for reaching out — what are you looking for?',
    ],
    realestate: [
      'Thanks for contacting me. How can I help with your property search?',
      'Happy to assist — buying, renting, or viewing?',
      'Thanks for your message. What are you looking for?',
    ],
    retail: [
      'Thanks for messaging. How can we help?',
      'Happy to check products or orders for you.',
      'Thanks for reaching out — what do you need?',
    ],
    other: [
      'Thanks for your message. How can we help?',
      'Happy to assist — tell us a bit more.',
      'Thanks for contacting us. What do you need?',
    ],
  },
};

const AR_BODIES: Record<string, string[]> = {
  price: [
    'أكيد نقدر نأكد السعر — أي خدمة/منتج تقصد؟',
    'بأرسل لك التسعيرة الحين. تبي القائمة كاملة ولا خدمة معينة؟',
    'تمام، قل لي التفاصيل وأعطيك السعر بالضبط.',
  ],
  hours: [
    'إي إحنا فاتحين — متى يناسبك تجي؟',
    'دوامنا واضح، قل لي اليوم والوقت وأأكد لك.',
    'موجودين أغلب أيام الأسبوع. تبي صباح ولا مساء؟',
  ],
  booking: [
    'حاضر أحجز لك — أي يوم ووقت تفضل؟',
    'أكيد في مواعيد. بكرة بعد الظهر يناسبك؟',
    'نقدر نحجز الحين. الاسم + الوقت المفضل؟',
  ],
  location: [
    'بأرسل لك الموقع/اللوكيشن الحين.',
    'سهل تلقونا — تبي لوكيشن قوقل ماب؟',
    'العنوان جاهز، أرسله لك مباشرة.',
  ],
  complaint: [
    'والله آسفين على الإزعاج — قل لي التفاصيل عشان نصلحها.',
    'نعتذر منك، نبي نعدّل الوضع. وش اللي صار بالضبط؟',
    'آسف على اللي حصل. بخليه أولوية وأرد عليك بسرعة.',
  ],
  thanks: ['العفو! نورتنا 🌿', 'تسلم، أي وقت تحتاجنا احنا موجودين.', 'حاضرين دايماً — شكراً لك!'],
  general: [
    'شكراً لتواصلك. كيف نقدر نساعدك؟',
    'حاضرين — حجز، أسعار، ولا استفسار؟',
    'أهلاً فيك! قل لنا وش تحتاج اليوم.',
  ],
};

function bodyFor(
  intent: string,
  biz: BizId,
  tone: ToneId,
  arabic: boolean,
  profile: BusinessProfile | null,
): string {
  const n = bizNoun(biz, profile);
  let line: string;
  const intentKey = BODIES[intent] ? intent : 'general';

  if (arabic && Math.random() > 0.28 && AR_BODIES[intentKey]) {
    line = pick(AR_BODIES[intentKey]!);
    if (intentKey === 'general' && profile?.name) {
      line = line.replace('لتواصلك', `لتواصلك مع ${n}`);
    }
  } else {
    const pack = BODIES[intentKey] || BODIES.general!;
    const list = pack[biz] || pack.other || BODIES.general!.other!;
    line = pick(list);
    if (intentKey === 'general' && profile?.name && !line.includes(profile.name)) {
      line = line.replace('messaging', `messaging ${n}`).replace('contacting us', `contacting ${n}`);
    }
    if (arabic) {
      const extras = [' إن شاء الله', ' — خبرني', ' متى يناسبك؟', ' تمام؟', ' أبشر', ' تحت أمرك'];
      if (tone !== 'professional' || Math.random() > 0.4) {
        if (Math.random() > 0.35) line += pick(extras);
      }
    }
  }

  const fact = profileFacts(intentKey, profile, arabic);
  if (fact) {
    if (arabic) line += (line.endsWith('.') || line.endsWith('؟') || line.endsWith('!') ? ' ' : '. ') + fact + '.';
    else line += (line.endsWith('.') ? ' ' : '. ') + fact + '.';
  }

  if (tone === 'short') {
    line = line
      .replace(/Happy to |I can |We'd love to |Thanks for messaging[^.]*\.\s*/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (line.length > 140) line = `${line.slice(0, 137)}…`;
  }
  return line;
}

function resolveIntents(message: string, forcedIntent: IntentId | null): string[] {
  if (forcedIntent) {
    const detected = message ? detectIntents(message) : [];
    const merged = [forcedIntent, ...detected.filter((id) => id !== forcedIntent)];
    return merged.length ? merged : [forcedIntent];
  }
  const detected = detectIntents(message || '');
  // Map lone price-from-empty general to general
  if (!message.trim() && detected[0] === 'price') return ['general'];
  if (!message.trim()) return ['general'];
  // If only keyword noise mapped oddly, keep detected
  return detected.map((id) => id);
}

function buildOneReply(
  message: string,
  biz: BizId,
  tone: ToneId,
  arabic: boolean,
  variation: number,
  profile: BusinessProfile | null,
  forcedIntent: IntentId | null,
): string {
  const intents = resolveIntents(message, forcedIntent);
  const intent = intents[variation % intents.length] || 'general';
  const g = greeting(tone, arabic, profile);
  const body = bodyFor(intent, biz, tone, arabic, profile);
  const c = closing(tone, arabic);

  let extra = '';
  if (intents.length > 1 && variation === 1) {
    const second = intents[(variation + 1) % intents.length]!;
    if (second !== intent) {
      const nudge = bodyFor(second, biz, 'short', arabic, profile);
      extra = arabic
        ? ` وأيضاً: ${nudge}`
        : ` Also: ${nudge.charAt(0).toLowerCase()}${nudge.slice(1)}`;
    }
  }

  if (tone === 'short') {
    return applyBrandWords(`${g} ${body}${extra}`.replace(/\s+/g, ' ').trim(), profile);
  }
  return applyBrandWords(`${g} ${body}${extra} ${c}`.replace(/\s+/g, ' ').trim(), profile);
}

export function generateTemplateReplies(
  message: string,
  biz: BizId,
  tone: ToneId,
  arabic: boolean,
  profile: BusinessProfile | null,
  forcedIntent: IntentId | null = null,
): string[] {
  const out: string[] = [];
  const seen: Record<string, boolean> = {};
  let guard = 0;
  while (out.length < 3 && guard < 20) {
    guard++;
    const r = buildOneReply(message, biz, tone, arabic, out.length + guard, profile, forcedIntent);
    const key = r.slice(0, 48);
    if (!seen[key]) {
      seen[key] = true;
      out.push(r);
    }
  }
  while (out.length < 3) {
    out.push(buildOneReply(message, biz, tone, arabic, out.length + 10, profile, forcedIntent));
  }
  return out.map((r) => applyBrandWords(r, profile));
}

function bytesToBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!;
    const b = i + 1 < bytes.length ? bytes[i + 1]! : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2]! : 0;
    output += chars[a >> 2];
    output += chars[((a & 3) << 4) | (b >> 4)];
    output += i + 1 < bytes.length ? chars[((b & 15) << 2) | (c >> 6)] : '=';
    output += i + 2 < bytes.length ? chars[c & 63] : '=';
  }
  return output;
}

function base64ToBytes(b64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = b64.replace(/=+$/, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const enc1 = chars.indexOf(clean.charAt(i));
    const enc2 = chars.indexOf(clean.charAt(i + 1));
    const enc3 = chars.indexOf(clean.charAt(i + 2));
    const enc4 = chars.indexOf(clean.charAt(i + 3));
    out.push((enc1 << 2) | (enc2 >> 4));
    if (enc3 >= 0) out.push(((enc2 & 15) << 4) | (enc3 >> 2));
    if (enc4 >= 0) out.push(((enc3 & 3) << 6) | enc4);
  }
  return new Uint8Array(out);
}

export function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function fromBase64Url(str: string): string {
  let s = String(str || '')
    .trim()
    .replace(/^RPLY1\./i, '');
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return new TextDecoder().decode(base64ToBytes(s));
}

export function encodeInvite(profile: BusinessProfile, team: { teamName: string; staff: string[] }): string {
  const payload = {
    v: 1,
    teamName: team.teamName || profile.name || '',
    staff: (team.staff || []).filter(Boolean).slice(0, 3),
    profile: {
      name: profile.name || '',
      type: profile.type || '',
      services: profile.services || '',
      hours: profile.hours || '',
      location: profile.location || '',
      whatsapp: profile.whatsapp || '',
      neverSay: profile.neverSay || '',
      alwaysSay: profile.alwaysSay || '',
    },
  };
  return `RPLY1.${toBase64Url(JSON.stringify(payload))}`;
}

export function decodeInvite(code: string): {
  v: number;
  teamName: string;
  staff: string[];
  profile: BusinessProfile;
} {
  const raw = String(code || '')
    .trim()
    .replace(/\s+/g, '');
  if (!raw) throw new Error('Paste an invite code first.');
  const json = fromBase64Url(raw);
  const data = JSON.parse(json) as {
    v?: number;
    teamName?: string;
    staff?: string[];
    profile?: BusinessProfile;
  };
  if (!data || data.v !== 1 || !data.profile) throw new Error('Unrecognized invite code.');
  return {
    v: 1,
    teamName: String(data.teamName || ''),
    staff: Array.isArray(data.staff) ? data.staff.map(String) : [],
    profile: data.profile,
  };
}

export function digitsOnly(phone: string): string {
  return String(phone || '').replace(/\D/g, '');
}

export function waMeUrl(text: string, phone?: string): string {
  const q = encodeURIComponent(text);
  const digits = digitsOnly(phone || '');
  if (digits) return `https://wa.me/${digits}?text=${q}`;
  return `https://wa.me/?text=${q}`;
}

export function timeOfDayGreeting(name?: string): string {
  const h = new Date().getHours();
  const who = name ? `, ${name}` : '';
  if (h < 12) return `Good morning${who}`;
  if (h < 17) return `Good afternoon${who}`;
  if (h < 21) return `Good evening${who}`;
  return `Working late${who}?`;
}

export function smartSuggestionChips(): { id: IntentId; hint: string }[] {
  const h = new Date().getHours();
  if (h < 11) {
    return [
      { id: 'hours', hint: 'Opening hours' },
      { id: 'booking', hint: 'Morning slot' },
      { id: 'location', hint: 'Directions' },
    ];
  }
  if (h < 16) {
    return [
      { id: 'price', hint: 'Quote a price' },
      { id: 'booking', hint: 'Book today' },
      { id: 'thanks', hint: 'Thank a client' },
    ];
  }
  return [
    { id: 'booking', hint: 'Tonight / tomorrow' },
    { id: 'hours', hint: 'Still open?' },
    { id: 'complaint', hint: 'Calm a complaint' },
  ];
}
