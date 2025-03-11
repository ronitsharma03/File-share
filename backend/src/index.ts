import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import config from './config/config';

const s3 = new S3Client({
    region: config.s3.region,
    credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey
    }
});

async function testS3(){
    try{
        const command = new ListObjectsV2Command({ Bucket: config.s3.bucketName });
        const result = await s3.send(command);
        console.log(`Connection successful: ${JSON.stringify(result, null, 2)}`);
    }catch(error){
        console.error(`Error: ${error}`);
    }
}

testS3();