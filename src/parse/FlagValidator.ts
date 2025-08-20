export class FlagValidator {
    public stripQuotedAndSubshells(text: string): string {
        return text
            .replace(/"[^"]*"/g, "") // remove "..."
            .replace(/\$\([^)]*\)/g, "") // remove $(...)
            .replace(/\([^)]*\)/g, ""); // remove (...)
    }

    public extractKeys(text: string): string[] {
        const cleaned = this.stripQuotedAndSubshells(text);
        const tokens = cleaned.trim().split(/\s+/).filter(Boolean);
        return tokens
            .filter((token) => token.startsWith("-"))
            .map((token) =>
                token.includes("=") ? token.split("=")[0] : token
            );
    }

    public filterInvalidType(flags: string[]): string[] {
        return flags.filter((flag) => {
            return !flag || !flag?.length || typeof flag !== "string";
        });
    }

    public filterInvalidFlags(flags: string[]): string[] {
        return flags.filter((flag) => {
            if (!flag.startsWith("-")) {
                return false;
            }

            if (/^---+/.test(flag)) {
                return true;
            }

            if (/^-[^-]{2,}$/.test(flag)) {
                return true;
            }

            return false;
        });
    }
}
