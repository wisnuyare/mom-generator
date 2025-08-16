import express from 'express';
import { z } from 'zod';
import { authenticateFirebase } from './auth.js';
import { generateMOM } from './llm.js';
import { formatResponse } from './format.js';

const router = express.Router();

const generateRequestSchema = z.object({
  raw_notes: z.string().min(1, 'Raw notes are required'),
  meeting_date: z.string().optional(),
  attendees: z.array(z.string()).optional().default([]),
  purpose: z.string().optional(),
  style: z.enum(['short', 'detailed']).optional().default('short')
});

router.post('/generate', authenticateFirebase, async (req, res) => {
  try {
    const validatedData = generateRequestSchema.parse(req.body);
    
    const momData = await generateMOM(validatedData);
    const formattedResponse = formatResponse(momData, validatedData);
    
    res.json(formattedResponse);
  } catch (error) {
    console.error('Error generating MOM:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Something went wrong'
    });
  }
});

export { router };