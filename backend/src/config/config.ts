import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config = {
    server: {
        port: parseInt(process.env.PORT || '5000', 10),
        host: process.env.HOST || 'localhost',
        nodeEnv: process.env.ENV || 'development'
    },
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    s3: {
        region: process.env.AWS_REGION || 'ap-south-1',
        bucketName: process.env.S3_BUCKETNAME || 'file-transfer-bucket-ronit',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.SECRET_ACCESS_KEY_ID || '',
    },
    file: {
        maxSizeBytes: process.env.MAX_FILE_SIZE || 2 * 1024 * 1024 * 1024, // 2GB
        expiryHours: 24,
    },
    notification: {
        emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
        emailService: process.env.EMAIL_SERVICE || '',
        emailUser: process.env.EMAIL_USER || '',
        emailPassword: process.env.EMAIL_PASSWORD || '',
    }
};

export default config;