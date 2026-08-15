import { Router, Request, Response } from 'express';
import { loadTournamentState, saveTournamentState, resetTournamentState, TournamentStateData } from '../dataStore';

export const leagueRouter = Router();

leagueRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const state = await loadTournamentState();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json({ success: true, data: state });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطا در بارگذاری داده‌های لیگ', error: error?.message });
  }
});

leagueRouter.post('/', async (req: Request, res: Response) => {
  try {
    const incomingState: TournamentStateData = req.body;
    if (!incomingState || !Array.isArray(incomingState.players) || incomingState.players.length !== 10) {
      return res.status(400).json({ success: false, message: 'فرمت داده‌های ارسالی نامعتبر است' });
    }
    const savedState = await saveTournamentState(incomingState);
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json({ success: true, message: 'اطلاعات لیگ با موفقیت روی سرور ذخیره شد', data: savedState });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطا در ذخیره‌سازی داده‌های لیگ روی سرور', error: error?.message });
  }
});

leagueRouter.post('/reset', async (_req: Request, res: Response) => {
  try {
    const resetState = await resetTournamentState();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json({ success: true, message: 'لیگ با موفقیت به حالت اولیه بازنشانی شد', data: resetState });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطا در بازنشانی لیگ', error: error?.message });
  }
});
