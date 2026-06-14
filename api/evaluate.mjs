import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // ANTHROPIC_API_KEY ni env dan oladi

const SYSTEM = `Siz "Qalem go" ta'lim platformasining bilim baholovchi AI yordamchisisiz.
Vazifangiz: o'quvchi ishlagan test natijalariga qarab uning shu FAN bo'yicha bilim darajasini baholash va unga yordam berish.

QAT'IY CHEKLOVLAR:
- Faqat berilgan test va uning faniga oid baholash bering. Boshqa mavzularga o'tmang.
- Tahlil pedagogik, qo'llab-quvvatlovchi va o'quvchiga mos (hurmatli) bo'lsin.
- Tayyor javoblarni emas, balki tushunchani va NIMA o'rganish kerakligini ko'rsating.
- Faqat o'zbek tilida yozing.
- Qisqa, aniq va amaliy bo'ling. Har bir ro'yxat eng ko'pi 4 ta band.
- Shaxsiy ma'lumot so'ramang yoki saqlamang.

Baholashni o'quvchining qaysi savollarga to'g'ri/noto'g'ri javob berganiga asoslang.`;

const SCHEMA = {
  type: 'object',
  properties: {
    level: { type: 'integer', description: '1 dan 10 gacha bilim darajasi' },
    verdict: { type: 'string', description: 'Umumiy qisqa xulosa (1-2 jumla)' },
    strengths: { type: 'array', items: { type: 'string' }, description: "Kuchli tomonlar / yaxshi o'zlashtirgan mavzular" },
    weaknesses: { type: 'array', items: { type: 'string' }, description: 'Zaif mavzular' },
    recommendations: { type: 'array', items: { type: 'string' }, description: "O'rganish bo'yicha amaliy tavsiyalar" },
    encouragement: { type: 'string', description: "Rag'batlantiruvchi qisqa xabar" },
  },
  required: ['level', 'verdict', 'strengths', 'weaknesses', 'recommendations', 'encouragement'],
  additionalProperties: false,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY sozlanmagan (Vercel env)' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { title = '', subject = '', score = 0, correctCount = 0, total = 0, items = [] } = body;

    const lines = items.map((it, i) => {
      const ans = it.studentAnswer == null ? 'javob bermadi' : it.studentAnswer;
      return `${i + 1}. Savol: ${it.question || '(matn yo\'q)'}\n   O'quvchi javobi: ${ans}\n   To'g'ri javob: ${it.correct}\n   Natija: ${it.isRight ? "to'g'ri" : "noto'g'ri"}`;
    }).join('\n');

    const userText =
      `Fan: ${subject}\nTest: ${title}\n` +
      `Natija: ${correctCount}/${total} to'g'ri javob, ball: ${score}\n\n` +
      `Savollar va o'quvchi javoblari:\n${lines}\n\n` +
      `Shu natijalarga asoslanib o'quvchining ${subject} fani bo'yicha bilimini baholang.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{ role: 'user', content: userText }],
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '{}';
    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    console.error('evaluate error:', err);
    return res.status(500).json({ error: err?.message ?? 'Server xatosi' });
  }
}
