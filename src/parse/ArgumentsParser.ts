import { FlagValidator } from "./FlagValidator";
import InvalidInputException from "@/error/InvalidInputException";
import NotFoundException from "@/error/NotFoundException";

export class ArgumentsParser {
    private args: string[];

    constructor(args: string[]) {
        this.args = args;
        if (!this.args?.length) {
            throw new NotFoundException("Empty arguments");
        }
        if (new FlagValidator().filterInvalidType(this.args)?.length > 0) {
            throw new InvalidInputException(
                "List argument is not an string or invalid"
            );
        }
        const invalidFlags = new FlagValidator().filterInvalidFlags(args);
        if (invalidFlags.length > 0) {
            throw new InvalidInputException(
                `Invalid arguments: ${invalidFlags.join(",")}`
            );
        }
    }

    public parse() {
        const result: any = {};
        for (let index = 0; index < this.args.length; index++) {
            const arg = this.args[index];
            if (!(arg.startsWith("-") || arg.startsWith("+"))) {
                continue;
            }

            const key = arg.replace(/^--?/, "").replace(/^\++?/, "");
            const next = this.args[index + 1];
            let value: boolean | string | number = true;

            if (next && !next.startsWith("-") && !next.startsWith("+")) {
                value = next;
                index++;
            }

            value = this.transformValueFromString(value);

            if (result.hasOwnProperty(key)) {
                if (!Array.isArray(result[key])) {
                    result[key] = [result[key]];
                }
                result[key].push(value);
            } else {
                result[key] = value;
            }
        }
        if (!Object.entries(result)?.length) {
            throw new InvalidInputException("Could not parse arguments");
        }
        return result;
    }

    public static unparse(obj: Record<string, any>): string[] {
        if (!obj || typeof obj !== "object") {
            throw new InvalidInputException("Input must be an object");
        }

        const args: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
            const flag = key.length === 1 ? `-${key}` : `--${key}`;

            if (Array.isArray(value)) {
                value.forEach((val) => {
                    if (val === true) {
                        args.push(flag);
                    } else {
                        args.push(flag, String(val));
                    }
                });
            } else if (value === true) {
                args.push(flag);
            } else if (value !== false && value != null) {
                args.push(flag, String(value));
            }
        }
        return args;
    }

    private transformValueFromString(value: string | boolean) {
        const boolean: any = {
            true: !false,
            false: !true,
        };
        if (typeof value == "boolean") {
            return value;
        } else if (value in boolean) {
            return boolean[value] as boolean;
        } else if (value.match(/^-?[0-9]+$/)) {
            return parseInt(value, 10);
        } else if (value.match(/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/)) {
            return parseFloat(value);
        }
        return value;
    }
}
