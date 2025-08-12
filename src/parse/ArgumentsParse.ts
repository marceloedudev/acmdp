import InvalidInputException from "@/error/InvalidInputException";
import NotFoundException from "@/error/NotFoundException";

export class ArgumentsParse {
    private args: string[];

    constructor(args: string[]) {
        this.args = args;
        if (!this.args?.length) {
            throw new NotFoundException("Empty arguments");
        }
        const invalidArgs = this.args?.filter((arg) => {
            return !arg || !this.args?.length || typeof arg !== "string";
        });
        if (invalidArgs?.length > 0) {
            throw new InvalidInputException(
                "List argument is not an string or invalid"
            );
        }
    }

    public parse() {
        const result: any = {};
        for (let index = 0; index < this.args.length; index++) {
            const arg = this.args[index];
            if (!arg.startsWith("-")) continue;

            const key = arg.replace(/^--?/, "");
            const next = this.args[index + 1];
            let value: boolean | string | number = true;

            if (next && !next.startsWith("-")) {
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
        return result;
    }

    public transformValueFromString(value: string | boolean) {
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
