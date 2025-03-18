import express from 'express';
import transferRoutes from './transferRoutes';

const router = express.Router();


router.get('/status', (req, res) => {
    res.json({
        status: 'API is operational'
    });
});

router.use('/transfers', transferRoutes);

export default router;