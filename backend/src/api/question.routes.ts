import express, { Request, Response } from 'express';
import { getAllQuestions, getQuestionById, deleteAllQuestions } from '../services/question.service';

const router = express.Router();

/**
 * GET /api/questions
 * Get all questions with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getAllQuestions(page, limit);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Get questions error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve questions',
      message: error.message,
    });
  }
});

/**
 * GET /api/questions/:id
 * Get a single question by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid question ID',
        message: 'Question ID must be a number',
      });
    }

    const question = await getQuestionById(id);

    if (!question) {
      return res.status(404).json({
        error: 'Question not found',
        message: `No question found with ID ${id}`,
      });
    }

    return res.status(200).json(question);

  } catch (error: any) {
    console.error('Get question error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve question',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/questions
 * Delete all questions from the database
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    const deletedCount = await deleteAllQuestions();

    return res.status(200).json({
      message: 'All questions deleted successfully',
      deletedCount,
    });

  } catch (error: any) {
    console.error('Delete all questions error:', error);
    return res.status(500).json({
      error: 'Failed to delete questions',
      message: error.message,
    });
  }
});

export default router;
