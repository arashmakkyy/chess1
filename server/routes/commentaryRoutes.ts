import { Router } from 'express';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { GoogleGenAI } from '@google/genai';

export const commentaryRouter = Router();

commentaryRouter.post('/', async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const { players, matches, playoffStarted } = req.body;

    let prompt = `نقش تو: تو تحلیل‌گر ویژه، مفسر ورزشی و ژورنالیست به شدت پرانرژی، طنز، باهوش و مسلط به کل‌کل‌های جذاب لیگ شطرنج ۱۰ نفره هستی.

ساختار مسابقات:
- ۱۰ بازیکن در ۲ گروه ۵ نفره الف (Group A) و ب (Group B) حضور دارند.
- بازی‌های گروهی تک‌بازی یک‌طرفه است (برد ۱ امتیاز، مساوی ۰.۵، باخت ۰).
- از هر گروه ۲ نفر برتر صعود می‌کنند و در مرحله نیمه‌نهایی به صورت ضربدری بازی می‌کنند:
  * اول گروه الف vs دوم گروه ب
  * اول گروه ب vs دوم گروه الف
- سپس فینال قهرمانی و دیدار رده‌بندی مقام سوم برگزار می‌شود.

اطلاعات فعلی لیگ:
`;

    if (players && players.length > 0) {
      const groupA = players.filter((p: any) => p.group === 'A');
      const groupB = players.filter((p: any) => p.group === 'B');

      prompt += `\nوضعیت گروه الف (Group A):\n`;
      groupA.forEach((p: any) => {
        prompt += `- ${p.name}: ${p.points} امتیاز (برد: ${p.matchesWon}، باخت: ${p.matchesLost})\n`;
      });

      prompt += `\nوضعیت گروه ب (Group B):\n`;
      groupB.forEach((p: any) => {
        prompt += `- ${p.name}: ${p.points} امتیاز (برد: ${p.matchesWon}، باخت: ${p.matchesLost})\n`;
      });
    }

    if (matches && matches.length > 0) {
      const completedCount = matches.filter((m: any) => m.status === 'completed').length;
      prompt += `\nتعداد بازی‌های انجام‌شده تا الان: ${completedCount} از ${matches.length} بازی\n`;
    }

    if (playoffStarted) {
      prompt += `\nمرحله گروهی پایان یافته و نبردهای ضربدری پلی‌آف و نیمه‌نهایی/فینال در جریان است!\n`;
    }

    prompt += `
دستورالعمل تولید متن:
یک تحلیل پرشور، روان به زبان فارسی و با لحن ژورنالیستی ورزشی و خودمانی بنویس. درباره رقابت داغ در دو گروه، شانس بازیکنان برای کسب رتبه ۱ و ۲ و صعود ضربدری، و مدعیان اصلی جام قهرمانی صحبت کن. متن باید شامل ۳ تا ۴ پاراگراف جذاب همراه با تیترهای خواندنی باشد.
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        commentary: `📰 تیتر اول: طوفان در گروه‌های الف و ب لیگ شطرنج!\n\nرقابت‌ها در دو گروه ۵ نفره با شدت و هیجان بالا در جریان است. مدعیان اصلی در هر دو گروه الف و ب در تلاش هستند تا جایگاه اول و دوم را برای صعود به نیمه‌نهایی ضربدری تصاحب کنند.\n\n🔥 نبردهای سرنوشت‌ساز ضربدری:\nطبق قانون مسابقات، تیم اول گروه الف با تیم دوم گروه ب و تیم اول گروه ب با تیم دوم گروه الف شاخ‌به‌شاخ خواهند شد. هر حرکت روی صفحه شطرنج می‌تواند سرنوشت مدال طلا را رقم بزند!`,
        lastMatchComment: "یک نبرد تمام‌عیار دیگر به پایان رسید!",
        nextMatchComment: "مسابقه بعدی می‌تواند معادلات جدول صعود را دگرگون کند!"
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const commentaryText = response.text || "";
    res.json({
      commentary: commentaryText,
      lastMatchComment: "تحلیل بازی اخیر با موفقیت ثبت شد.",
      nextMatchComment: "دیدار بعدی با هیجان بالا در پیش است."
    });
  } catch (e: any) {
    console.error("Error generating commentary:", e);
    res.status(200).json({
      commentary: `📰 آخرین تحلیل اختصاصی لیگ شطرنج:\n\nرقابت در هر دو گروه A و B با جذابیت کامل در جریان است. تمام بازیکنان با تمام قوا برای رسیدن به دو رتبه برتر و راهیابی به نیمه‌نهایی ضربدری می‌جنگند. منتظر رویارویی‌های تاریخی در فینال باشید!`,
      lastMatchComment: "یک نبرد دیدنی به پایان رسید.",
      nextMatchComment: "دیدار سرنوشت‌ساز بعدی در پیش است."
    });
  }
});
