import express from 'express';
import transferController from '../controllers/transferController';

const router = express.Router();

router.post('/', transferController.createTransfer);

router.get('/:id', transferController.getTransferStatus);

router.post('/s3-upload', transferController.createS3UploadUrl);

router.post('/s3-complete', transferController.completeS3Upload);

export default router;