declare module 'crublibrary' {
    interface ConfigOptions {
        apiUrl: string;
        apiKey: string;
    }

    interface CrubLibrary {
        config(options: ConfigOptions): void;
        create(data: { value: number, txHash: string }): Promise<any>;
        get(id: string): Promise<any>;
        update(id: string, data: { value: number }): Promise<any>;
        delete(id: string): Promise<any>;
    }

    const crublibrary: CrubLibrary;
    export = crublibrary;
} 