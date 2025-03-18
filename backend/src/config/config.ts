import dotenv from 'dotenv';

dotenv.config();

const config = {
    server: {
        port: parseInt(process.env.PORT || '5000', 10),
        host: process.env.HOST || 'localhost',
        nodeEnv: process.env.ENV || 'development'
    },
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3001'
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
        allowedTypes: [
            // Documents
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.csv',
            '.odt', '.ods', '.odp', '.pages', '.numbers', '.key', '.md',
            
            // Images
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff', '.ico', '.heic',
            
            // Audio
            '.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma',
            
            // Video
            '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v', '.3gp',
            
            // Archives
            '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.iso',
            
            // Code
            '.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.json', '.xml', '.yaml', '.yml',
            '.py', '.java', '.c', '.cpp', '.cs', '.php', '.rb', '.go', '.swift', '.kt', '.rs',
            '.sql', '.sh', '.bash', '.ps1',
            
            // Design
            '.psd', '.ai', '.sketch', '.xd', '.fig', '.indd', '.afdesign',
            
            // Fonts
            '.ttf', '.otf', '.woff', '.woff2', '.eot',
            
            // Miscellaneous
            '.apk', '.ipa', '.exe', '.dmg', '.deb', '.rpm'
        ]
    },
    notification: {
        emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
        emailService: process.env.EMAIL_SERVICE || '',
        emailUser: process.env.EMAIL_USER || '',
        emailPassword: process.env.EMAIL_PASSWORD || '',
    }
};

export default config;