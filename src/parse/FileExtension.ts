export class FileExtension {
    private readonly executableExtensions = [
        ".js",
        ".ts",
        ".mjs",
        ".cjs",
        ".py",
        ".rb",
        ".pl",
        ".php",
    ];

    private readonly shellExtensions = [
        ".sh",
        ".bash",
        ".zsh",
        ".ksh",
        ".fish",
    ];

    public hasExecutableExtension(value: string): boolean {
        if (!value?.length) {
            return false;
        }
        return (
            this.executableExtensions.some((ext) => value.endsWith(ext)) ||
            this.shellExtensions.some((ext) => value.endsWith(ext))
        );
    }

    public isExecutablePath(value: string): boolean {
        if (!value?.length) {
            return false;
        }
        return (
            this.executableExtensions.some((ext) => value.endsWith(ext)) ||
            value === "." ||
            value.startsWith(".") ||
            value.startsWith("./") ||
            value.startsWith("/")
        );
    }
}
