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
            if (/^---+/.test(flag) || /^(\+\+\+)+/.test(flag)) {
                return true;
            }

            return false;
        });
    }

    public static isArgvLongOption(arg: string) {
        return /^--[a-zA-Z0-9]/.test(arg);
    }

    public static isArgvShortOption(arg: string) {
        return /^-[a-zA-Z]/.test(arg);
    }

    public static isArgvPlusOption(arg: string) {
        return /^\+[a-zA-Z]/.test(arg);
    }

    public static isFlagRelation(arg: string, prevArg?: string): boolean {
        if (
            FlagValidator.isArgvShortOption(arg) ||
            FlagValidator.isArgvLongOption(arg) ||
            FlagValidator.isArgvPlusOption(arg)
        ) {
            return false;
        }

        if (
            prevArg &&
            (FlagValidator.isArgvShortOption(prevArg) ||
                FlagValidator.isArgvLongOption(prevArg) ||
                FlagValidator.isArgvPlusOption(prevArg))
        ) {
            return true;
        }

        return false;
    }
}
