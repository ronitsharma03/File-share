interface fileValidationResult {
  valid: boolean;
  error?: string;
}

export class FileValidator {
  private MaxSizedFile: number = 2 * 1024 * 1024 * 1024; // 2GB limit

  private allowedTypes: string[] = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".rtf",
    ".csv",
    ".odt",
    ".ods",
    ".odp",
    ".pages",
    ".numbers",
    ".key",
    ".md",

    // Images
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".svg",
    ".webp",
    ".tiff",
    ".ico",
    ".heic",

    // Audio
    ".mp3",
    ".wav",
    ".ogg",
    ".aac",
    ".flac",
    ".m4a",
    ".wma",

    // Video
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".mkv",
    ".webm",
    ".m4v",
    ".3gp",

    // Archives
    ".zip",
    ".rar",
    ".7z",
    ".tar",
    ".gz",
    ".bz2",
    ".xz",
    ".iso",

    // Code
    ".html",
    ".css",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".xml",
    ".yaml",
    ".yml",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".cs",
    ".php",
    ".rb",
    ".go",
    ".swift",
    ".kt",
    ".rs",
    ".sql",
    ".sh",
    ".bash",
    ".ps1",

    // Design
    ".psd",
    ".ai",
    ".sketch",
    ".xd",
    ".fig",
    ".indd",
    ".afdesign",

    // Fonts
    ".ttf",
    ".otf",
    ".woff",
    ".woff2",
    ".eot",

    // Miscellaneous
    ".apk",
    ".ipa",
    ".exe",
    ".dmg",
    ".deb",
    ".rpm",
  ];

  validateFileSize(fileSize: number): fileValidationResult{
    if(fileSize <= 0){
        return {
            valid: false,
            error: "File is empty"
        };
    }

    if(fileSize > this.MaxSizedFile){
        return {
            valid: false,
            error: "File size exceeds the limit of 2GB"
        };
    }

    return {
        valid: true
    };
  }

  validateFileType(fileName: string): fileValidationResult{
    const fileParts = fileName.split(".");
    if(fileParts.length < 2){
        return {
            valid: false,
            error: "File type is not supported"
        };
    }

    const fileExtension = fileParts.pop()?.toLowerCase();

    if(!fileExtension){
        return {
            valid: false,
            error: "File type is not supported"
        };
    }

    const normalizedAllowedTypes = this.allowedTypes.map((type) => type.toLowerCase());
    if(!normalizedAllowedTypes.includes(`.${fileExtension}`)){
        return {
            valid: false,
            error: "File type is not supported"
        };
    }
    return {
        valid: true
    };
  }

  validateFile(file: File): fileValidationResult{
    const sizeValidation = this.validateFileSize(file.size);
    if(!sizeValidation.valid){
        return sizeValidation;
    }

    const typeValidation = this.validateFileType(file.name);
    if(!typeValidation.valid){
        return typeValidation;
    }

    return {
        valid: true
    };
  }
}

export default new FileValidator();