import { Router, Request, Response } from 'express';
import { askGemini } from '../services/geminiService';
import { Product } from '../models/Product';

const router = Router();

router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    let productContext = '';
    try {
      const topProducts = await Product.find({ availability: true }).limit(8).select('name price unit').lean();
      productContext = topProducts.map((p: any) => `${p.name} ($${p.price}/${p.unit})`).join(', ');
    } catch {
      // ignore
    }

    const answer = await askGemini(prompt, productContext ? `Available fresh products: ${productContext}` : '');
    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(502).json({
      success: false,
      message: err instanceof Error ? err.message : 'The AI assistant is temporarily unavailable. Please try again later.',
    });
  }
});

export default router;
