import { Router } from 'express';
import { getEsnafList, createEsnaf } from '../controllers/esnaf.controller';

const router = Router();

router.get('/', getEsnafList);
router.post('/', createEsnaf);

export default router;
