import { FileExtension } from "./FileExtension";
import { FlagValidator } from "./FlagValidator";
import InvalidInputException from "@/error/InvalidInputException";
import NotFoundException from "@/error/NotFoundException";

export type ParsedCommand = {
    command: string;
    execArgv: string[];
    filename: string;
    filenameOption: string[];
    argv: string[];
};

export class CommandParser {
    private input: string;
    private parts: string[];

    constructor(input: string) {
        this.input = input?.trim();
        if (!this.input) {
            throw new NotFoundException("Empty input command");
        }
        const invalidFlags = new FlagValidator().filterInvalidFlags(
            new FlagValidator().extractKeys(this.input)
        );
        if (invalidFlags.length > 0) {
            throw new InvalidInputException(
                `Invalid arguments: ${invalidFlags.join(",")}`
            );
        }
        this.parts = this.tokenize(this.input);
    }

    private getDifferenceByIndex(list1: string[], list2: string[]): string[] {
        let i = 0;
        while (i < list1.length && i < list2.length && list1[i] === list2[i]) {
            i++;
        }
        return list1.slice(i);
    }

    public parse(): ParsedCommand {
        let command = "";
        let filename = "";
        let execArgv: string[] = [];
        let filenameOption: string[] = [];
        let argv: string[] = [];

        const [firstPart] = this.parts;
        if (
            !firstPart.startsWith("-") &&
            !firstPart.startsWith("+") &&
            !new FileExtension().hasExecutableExtension(firstPart) &&
            !firstPart.startsWith(".")
        ) {
            command = firstPart;
        }

        let remaining = [...this.parts];
        if (command?.length > 0) {
            remaining.splice(0, 1);
        }

        const filenameIdx = (() => {
            let index = -1;
            for (let i = 0; i < remaining.length; i++) {
                const arg = remaining[i];
                const prev = remaining[i - 1];
                if (
                    !FlagValidator.isFlagRelation(arg, prev) &&
                    new FileExtension().isExecutablePath(arg)
                ) {
                    index = i;
                    break;
                }
            }
            return index;
        })();

        if (filenameIdx !== -1) {
            const restArgv = remaining.slice(0, filenameIdx);

            execArgv = restArgv
                .flatMap((arg) => this.splitArgOnEquals(arg))
                .filter(Boolean);

            remaining = this.getDifferenceByIndex(remaining, restArgv);
        }

        const [firstRemaining] = remaining;
        if (new FileExtension().isExecutablePath(firstRemaining)) {
            filename = firstRemaining;
            remaining = this.getDifferenceByIndex(remaining, [filename]);

            for (let i = 0; i < remaining.length; i++) {
                if (
                    remaining[i].startsWith("-") ||
                    remaining[i].startsWith("+")
                ) {
                    break;
                }
                filenameOption.push(remaining[i]);
            }

            remaining = this.getDifferenceByIndex(remaining, filenameOption);
        }

        argv = remaining
            .flatMap((arg) => this.splitArgOnEquals(arg))
            .filter(Boolean);

        return {
            command,
            execArgv,
            filename,
            filenameOption,
            argv,
        };
    }

    private tokenize(input: string): string[] {
        const result: string[] = [];
        let current: string = "";
        let quote: '"' | "'" | null = null;
        let escape = false;
        let parenDepth = 0;
        let inSubshell = false;
        let i = 0;

        const spaceRegex = /\s/;
        const quoteRegex = /^['"]/;
        const escapeRegex = /^\\$/;
        const subshellStartRegex = /^\$\(/;

        while (i < input.length) {
            const char = input[i];

            if (escape) {
                current += char;
                escape = false;
            } else if (escapeRegex.test(char)) {
                current += char;
                escape = true;
            } else if (quote) {
                current += char;
                if (char === quote) quote = null;
            } else if (quoteRegex.test(char)) {
                current += char;
                quote = char as '"' | "'";
            } else if (!quote && subshellStartRegex.test(input.slice(i))) {
                current += "$(";
                inSubshell = true;
                parenDepth = 1;
                i++;
            } else if (inSubshell) {
                current += char;
                if (char === "(") parenDepth++;
                else if (char === ")") {
                    parenDepth--;
                    if (parenDepth === 0) inSubshell = false;
                }
            } else if (spaceRegex.test(char)) {
                if (current) {
                    result.push(current);
                    current = "";
                }
            } else {
                current += char;
            }

            i++;
        }

        if (current) {
            result.push(current);
        }

        return result;
    }

    private splitArgOnEquals(arg: string): string[] {
        const isEnvironmentVariableWindows = /^set\s+\w+=/i.test(arg);
        if (isEnvironmentVariableWindows) {
            return [arg];
        }
        const isEnvironmentVariableLinux = /^[A-Za-z_][A-Za-z0-9_]*=/.test(arg);
        if (isEnvironmentVariableLinux) {
            return [arg];
        }
        if (!arg.includes("=") || arg.startsWith('"') || arg.startsWith("'")) {
            return [arg];
        }
        const index = arg.indexOf("=");
        const key = arg.slice(0, index);
        const value = arg.slice(index + 1);
        return value ? [key, value] : [key];
    }
}
