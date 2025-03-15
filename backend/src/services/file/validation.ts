import config from "../../config/config";

interface FileValidatorResult {
    valid: boolean;
    error?: string;
}

export class FileValidator {
    validateFileSize(fileSize: number): FileValidatorResult {
        const maxSizeAllowed = Number(config.file.maxSizeBytes);
        if(fileSize <= 0){
            return { valid: false, error: `File size must be greater than 0 MB`};
        }

        if(fileSize > maxSizeAllowed){
            return { valid: false, error: `File size must be less than ${((maxSizeAllowed)/(1024*1024)).toFixed(2)} MB`}
        }

        return { valid: true };
    }

    validateFileType(fileName: string, allowedTypes?: string[]): FileValidatorResult {
        if(!allowedTypes || allowedTypes.length === 0){
            return {
                valid: true
            }
        }

        const fileParts = fileName.split('.');
        if(fileParts.length < 2){
            return {
                valid: false,
                error: `File must have a valid extension`
            }
        }

        const fileExtension = fileParts.pop()?.toLowerCase();

        if(!fileExtension){
            return {
                valid: false,
                error: `File must have an extension`
            }
        }

        const normalizedAllowedTypes = allowedTypes.map((type) => type.toLowerCase());
        if(!normalizedAllowedTypes.includes(fileExtension)){
            return {
                valid: false,
                error: `File type not allowed. Allowed types are ${normalizedAllowedTypes.join(', ')}`
            }
        }

        return {
            valid: true
        }
    }

    // Combined validation
    validateFile(fileName: string, fileSize: number, allowedTypes?: string[]): FileValidatorResult {
        const sizeValidation = this.validateFileSize(fileSize);
        if(!sizeValidation.valid){
            return sizeValidation;
        }

        if(allowedTypes){
            const typeValidation = this.validateFileType(fileName, allowedTypes);
            if(typeValidation.valid){
                return typeValidation;
            }
        }

        return { valid: true };
    }
}

export default new FileValidator();