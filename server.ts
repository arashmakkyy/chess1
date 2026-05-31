import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gen Z Commentary
  app.post("/api/commentary", async (req, res) => {
    try {
      const { lastMatch, nextMatch, standings, history } = req.body;

      let prompt = `نقش تو: تو مفسر، گزارشگر، مربی و تحلیل‌گر فوق‌العاده خفن، طنز، شوخ‌طبع، خلاق و به شدت نسل زدی (Gen Z) مسابقات لیگ شطرنج هستی.

دستورالعمل‌های نگارش و لحن:
۱. لحن تو باید کاملاً غیررسمی، صمیمی، پرانرژی، همراه با تیکه‌ها و شوخی‌های جذاب نسل زدی باشد. تحت هیچ شرایطی لحن رسمی، اداری، کتابی یا متکلف نگیر!
۲. تمامی جملات باید به زبان شیرین فارسی، با ساختار درست، اصولی و در عین حال کاملاً روان و محاوره‌ای نوشته شوند. طوری بنویس که انگار یک استریمر معروف در حال گزارش زنده مسابقه روی دیسکورد یا توییچ برای رفقایش است.
۳. از اصطلاحات محبوب و ترند نسل زد فارسی در چت‌ها به درستی و خلاقانه استفاده کن (مانند: ستون، سم، مولایی، گنگش بالاست، پشمام، کفتار خسته، زیبارو، حق خالص، فشار خوردن، آچمز، هویج، سالار، بنازم، پشم‌ریزون، رفقا، ریموند، سس‌ماست، تانک خفه‌کن).
۴. از استفاده از کلمات انگلیسی با حروف انگلیسی یا ترجمه‌های تحت‌اللفظی و مکانیکی که حس رباتیک می‌دهند جداً خودداری کن؛ متن باید کاملاً طبیعی، منسجم و بومی ایرانی باشد.

قوانین حاکم بر لیگ و بازی‌ها:
۱. جدول مقدماتی دور گروهی به صورت فیکسچرهای تک‌بازی (تک‌راند) برگزار می‌شود. هر مسابقه فقط شامل "یک بازی شطرنج" است، نه دو بازی! برنده بازی ۱ امتیاز، بازنده ۰ امتیاز و در صورت تساوی، هر کدام نیم امتیاز (۰.۵) کسب می‌کنند.
۲. اگر مجموع امتیازات دو پا در فیکسچر رفت و برگشت مساوی شود، یک بازی "تساوی‌شکن اضطراری" برگزار می‌شود تا بن‌بست شکسته شده و صاحب برتری نهایی مشخص شود.
۳. مرحله نهایی پلی‌آف شامل بهترین از ۳ بازی (دو بازی اصلی و در صورت برابری بازی سوم تای‌بریک) است.

`;

      if (lastMatch) {
         prompt += `
اطلاعات آخرین مسابقه‌ای که همین الان به پایان رسید:
- بازیکن شماره یک: ${lastMatch.p1Name} ${lastMatch.p1Won > 0 ? "((برنده تک‌بازی))" : ""}
- بازیکن شماره دو: ${lastMatch.p2Name} ${lastMatch.p2Won > 0 ? "((برنده تک‌بازی))" : ""}
- وضعیت تساوی: ${lastMatch.drew > 0 ? "بازی با تساوی به پایان رسیده است" : "بازی برنده داشته است"}
- قهرمان و برنده نهایی این مسابقه: ${lastMatch.winnerName || "مسابقه مساوی شد"}
- نوع رقابت: ${lastMatch.isTiebreak ? "تای‌بریک صدم ثانیه‌ای حساس برای شکستن بن‌بست امتیازات دوجانبه" : "رقابت اصلی و رسمی"}`;
      } else {
         prompt += `\nپیام شروع لیگ: هنوز هیچ مسابقه‌ای در این لیگ باشکوه برگزار نشده است و شوالیه‌ها در حال گرم کردن مغز خود برای آغاز این جنگ بزرگ هستند!`;
      }

      if (nextMatch) {
         prompt += `
اطلاعات رقابت جذاب و هیجان‌انگیز بعدی که در پیش است:
- فایترهای مسابقه بعدی: ${nextMatch.p1Name} در برابر ${nextMatch.p2Name}
- زمان برگزاری مسابقه: ${nextMatch.date || "جمعه بعدی"}`;
      } else {
         prompt += `\nپیام پایان مسابقات: فیکسچر گروهی دیگری باقی نمانده است؛ تمام بازی‌ها انجام شده یا در انتظار شروع فینال و رده‌بندی برای تعیین قهرمان نهایی هستیم!`;
      }

      if (standings && standings.length > 0) {
         prompt += `\n\nآخرین وضعیت جدول رده‌بندی کل لیگ شطرنج جهت استفاده در کرکری‌خوانی‌ها و تحلیل وضعیت کنونی هر بازیکن در جدول:`;
         standings.forEach((st: any, i: number) => {
           prompt += `\nرتبه‌اش در جدول: رتبه ${i+1}: بازیکن ${st.name} با کسب ${st.points} امتیاز کل لیگ (بردها: ${st.matchesWon}، باخت‌ها: ${st.matchesLost})`;
         });
      }

      if (history && history.length > 0) {
         prompt += `\n\nتاریخچه نتایج بازی‌های قبلی برگزار شده (به این تاریخچه به خوبی برای تحلیل سابقه بازیکنان، فرم و روند صعودی یا نزولی هر بازیکن دقت کن تا متوجه شوی هر شخص قبلاً چه کرده است):`;
         history.forEach((h: any) => {
           prompt += `\n- مسابقه روز ${h.dayNumber} (${h.type}): ${h.player1} در مقابل ${h.player2} -> نتیجه: ${h.result}`;
         });
      }

      prompt += `\n\nوظیفه تو تولید دقیق دو فیلد در قالب فرمت JSON است:
1. lastMatchComment: یک پاراگراف کوتاه جذاب، کنایه‌آمیز، پرشور و به شدت طنز آمیخته با سم خالص درباره بررسی بازی اخیر که تمام شد. در تحلیلت از جایگاه بازیکنان در جدول رده‌بندی، تاریخچه بردهای قبلی آنها و همچنین روند کنونی‌شان استفاده کن و عیار کل کل‌هایشان را بسنج. (اگر بازی برگزار نشده، یک افتتاحیه بمب برای آغاز رسمی لیگ بنویس و برای بازیکنان کری بخوان).
2. nextMatchComment: یک جمله یا پاراگراف کوتاه به حد مرگ هیجانی و پر از کرکری‌ فوتبالی/شطرنجی در مورد مسابقه حساس بعدی؛ با استفاده از جایگاه‌هایشان در جدول و بازی‌های اخیر، این کری را شخصی‌سازی و جذاب کن.

نکات فنی خروجی:
- خروجی باید دقیقا در قالب ساختار JSON داده شده برگردانده شود.
- زبان متن کاملاً فارسی روان، خودمانی و بدون عیب و نقص باشد.
- از ایموجی‌های پر انرژی نسل زد مثل 🔥💀👑⚔️🤫☕️🤡🐆 به شکلی خلاقانه استفاده کن.`;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback response when key doesn't exist
        return res.json({
          lastMatchComment: lastMatch 
            ? `بازی ${lastMatch.p1Name} و ${lastMatch.p2Name} تموم شد و ${lastMatch.winnerName || 'مساوی'} شد! سم خالص بود ستون، تانک خفه کن واقعی بود این دیدار. 🔥` 
            : "لیگ شطرنج سلاطین استارت خورد! منتظر یه نبرد سنگین، مولایی و بمب باشین که برگاتون بریزه. 👑",
          nextMatchComment: nextMatch 
            ? `نبرد بعدی قراره بین ${nextMatch.p1Name} و ${nextMatch.p2Name} باشه! گنگشون بالاست، قراره کی اشک بریزه و کی وسط راند چای بنوشه؟ 🤫☕️` 
            : "فیکسچر بعدی وجود نداره؛ منتظر نبردهای حذفی پلی‌آف باشین که فینال قراره پاره‌کننده باشه!"
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
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lastMatchComment: { type: Type.STRING },
              nextMatchComment: { type: Type.STRING }
            },
            required: ["lastMatchComment", "nextMatchComment"]
          }
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (e: any) {
      console.error("Error generating commentary:", e);
      // Clean fallback in case of rate-limiting, error, etc.
      res.status(200).json({
        lastMatchComment: "یا امام شطرنج! وسط این نبرد سم و پر تنش، سیستم تحلیل هوشمندمون آچمز شد از شدت گنگ بازیکنا! با این حال بازی قبلی فرای تصور بود. 💀",
        nextMatchComment: "نبرد بعدی جنگ ناموسه ستون! فقط بشین تماشا کن که قراره چه مهره‌هایی نابود بشن و کی جام رو بغل می‌کنه! 🔥"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
