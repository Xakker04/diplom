import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // ANTHROPIC_API_KEY ni env dan oladi

const buildSystem = (subject, title) => `Siz "Qalem go" platformasining repetitor AI yordamchisisiz.
O'quvchi hozirgina "${title}" testini (${subject} fani) ishladi va endi shu mavzu bo'yicha savol bermoqda.

QAT'IY CHEKLOVLAR:
- Faqat ${subject} fani va shu testning mavzulariga oid savollarga javob bering.
- Agar savol ${subject} faniga aloqasiz bo'lsa (masalan o'yin-kulgi, shaxsiy, boshqa fan), muloyimlik bilan rad eting va o'quvchini ${subject} mavzusiga qaytaring.
- Tayyor uy vazifasi javoblarini bermang; tushuntiring, misol keltiring, o'quvchini o'ylashga yo'naltiring.
- Yosh o'quvchiga mos, sodda va do'stona tilda yozing.
- Faqat o'zbek tilida javob bering.
- Qisqa va aniq bo'ling.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY sozlanmagan (Vercel env)' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { subject = 'umumiy', title = 'test', messages = [] } = body;

    // Faqat to'g'ri shakldagi xabarlarni o'tkazamiz
    const safeMessages = messages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20);

    if (safeMessages.length === 0) {
      return res.status(400).json({ error: 'Xabar yo\'q' });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: buildSystem(subject, title),
      messages: safeMessages,
    });

    const reply = response.content.find((b) => b.type === 'text')?.text ?? 'Kechirasiz, javob bera olmadim.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('tutor error:', err);
    return res.status(500).json({ error: err?.message ?? 'Server xatosi' });
  }
}
