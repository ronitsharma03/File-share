interface FileMetaData {
    index: number;
    offset: number;
    size: number;
    isLastChunk: boolean;
}

class FileChunker {
    private static DEFAULT_CHUNK_SIZE = 16 * 1024 * 1024;

    private getOptimizedFileChunks(fileSize: number): number{
        if(fileSize < (10*1024*1024)){
            return (1*1024*1024);
        }
        if(fileSize < (100*1024*1024)){
            return (4*1024*1024);
        }
        if(fileSize < (1024*1024*1024)){
            return (8*1024*1024);
        }

        return FileChunker.DEFAULT_CHUNK_SIZE;
    }

    private getNumberOfChunks(fileSize: number): number {
        const actualChunkSize = this.getOptimizedFileChunks(fileSize);
        return Math.ceil(fileSize/actualChunkSize);
    }

    private generateChunkMetaData(fileSize: number, ): FileMetaData[] {
        const actualChunkSize = this.getOptimizedFileChunks(fileSize);
        const chunkCount = this.getNumberOfChunks(fileSize);

        return Array.from({ length: chunkCount }, (_, i) => ({
            index: i,
            offset: i*actualChunkSize,
            size: i === chunkCount - 1 ? fileSize - i * actualChunkSize : actualChunkSize,
            isLastChunk: i === chunkCount - 1
        }));
    }

    private getChunkMetaData(fileSize: number, chunkIndex: number): FileMetaData{
        const actualChunkSize = this.getOptimizedFileChunks(fileSize);
        const chunkCount = this.getNumberOfChunks(fileSize);

        return {
            index: chunkIndex,
            offset: chunkIndex*actualChunkSize,
            size: chunkIndex === chunkCount - 1 ? fileSize - chunkIndex * actualChunkSize: actualChunkSize,
            isLastChunk: chunkIndex === chunkCount - 1
        }
    }
}

export default new FileChunker();