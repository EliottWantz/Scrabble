export interface Dictionary {
    title: string;
    description: string;
    words: string[];
}

export interface DictionaryErrors {
    invalidFileType: boolean;
    invalidJson: boolean;
    invalidTitle: boolean;
    invalidDictionaryStructure: boolean;
}

interface DictHeaders {
    title: string;
    description: string;
}
