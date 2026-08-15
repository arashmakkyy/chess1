import { Router, Request, Response } from 'express';
import {
  loadTournamentState,
  saveTournamentState,
  resetTournamentState,
  TournamentStateData
} from '../dataStore';

export const leagueRouter = Router();

// GET /api/league - Return current league state
leagueRouter.get('/', (req: Request, res: Response) => {
  try {
    const state = loadTournamentState();
    res.json({
      success: true,
      data: state
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'خطا در بارگذاری داده‌های لیگ',
      error: error?.message
    });
  }
});

// POST /api/league - Update full league state
leagueRouter.post('/', (req: Request, res: Response) => {
  try {
    const incomingState: TournamentStateData = req.body;
    if (!incomingState || !Array.isArray(incomingState.players)) {
      return res.status(400).json({
        success: false,
        message: 'فرمت داده‌های ارسالی نامعتبر است'
      });
    }

    const savedState = saveTournamentState(incomingState);
    res.json({
      success: true,
      message: 'اطلاعات لیگ با موفقیت روی سرور ذخیره شد',
      data: savedState
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'خطا در ذخیره‌سازی داده‌های لیگ روی سرور',
      error: error?.message
    });
  }
});

// POST /api/league/reset - Reset tournament to fresh initial state
leagueRouter.post('/reset', (req: Request, res: Response) => {
  try {
    const resetState = resetTournamentState();
    res.json({
      success: true,
      message: 'لیگ با موفقیت به حالت اولیه بازنشانی شد',
      data: resetState
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'خطا در بازنشانی لیگ',
      error: error?.message
    });
  }
});
