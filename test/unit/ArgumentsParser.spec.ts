import { ArgumentsParser } from "@/parse/ArgumentsParser";
import InvalidInputException from "@/error/InvalidInputException";
import NotFoundException from "@/error/NotFoundException";
import { expect } from "chai";

class TestableArgumentsParser extends ArgumentsParser {
    public transformValueFromStringPublic(value: string | boolean) {
        return this["transformValueFromString"](value);
    }
}

describe("ArgumentsParse", () => {
    describe("parse()", () => {
        it("should throw on empty input", () => {
            expect(() => new ArgumentsParser([]).parse()).to.throw(
                NotFoundException,
                "Empty arguments"
            );
        });

        it("should throw on invalid input (non-string)", () => {
            const args = ["--foo", 123 as any, "--bar"];
            expect(() => new ArgumentsParser(args).parse()).to.throw(
                InvalidInputException,
                "List argument is not an string or invalid"
            );
        });

        it("should parse single boolean flag", () => {
            const parsed = new ArgumentsParser(["--verbose"]).parse();
            expect(parsed).to.deep.equal({ verbose: true });
        });

        it("should parse flag with string value", () => {
            const parsed = new ArgumentsParser(["--name", "marcelo"]).parse();
            expect(parsed).to.deep.equal({ name: "marcelo" });
        });

        it("should parse flag with numeric integer value", () => {
            const parsed = new ArgumentsParser(["--age", "30"]).parse();
            expect(parsed).to.deep.equal({ age: 30 });
        });

        it("should parse flag with float value", () => {
            const parsed = new ArgumentsParser(["--price", "3.14"]).parse();
            expect(parsed).to.deep.equal({ price: 3.14 });
        });

        it("should parse boolean string values correctly", () => {
            const parsed = new ArgumentsParser([
                "--isAdmin",
                "true",
                "--isActive",
                "false",
            ]).parse();
            expect(parsed).to.deep.equal({ isAdmin: true, isActive: false });
        });

        it("should parse duplicated flags as array", () => {
            const parsed = new ArgumentsParser([
                "--tag",
                "a",
                "--tag",
                "b",
                "--tag",
                "c",
            ]).parse();
            expect(parsed).to.deep.equal({ tag: ["a", "b", "c"] });
        });

        it("should skip non-flag values", () => {
            const parsed = new ArgumentsParser([
                "node",
                "index.js",
                "--port",
                "8080",
            ]).parse();
            expect(parsed).to.deep.equal({ port: 8080 });
        });

        it("should handle flags with hyphen prefix (-x)", () => {
            const parsed = new ArgumentsParser(["-x", "1"]).parse();
            expect(parsed).to.deep.equal({ x: 1 });
        });

        it("should handle no value after flag (defaults to true)", () => {
            const parsed = new ArgumentsParser([
                "--debug",
                "--name",
                "dev",
            ]).parse();
            expect(parsed).to.deep.equal({ debug: true, name: "dev" });
        });

        it("should parse scientific notation as float", () => {
            const parsed = new ArgumentsParser(["--value", "1.2e3"]).parse();
            expect(parsed).to.deep.equal({ value: 1200 });
        });

        it("should throw error with format or with values that it could not process or understand", () => {
            expect(() => new ArgumentsParser(["asd"]).parse()).to.throw(
                InvalidInputException,
                "Could not parse arguments"
            );
        });

        it("should throw error with invalid values/flags", () => {
            expect(() =>
                new ArgumentsParser(["-da", "---fa"]).parse()
            ).to.throw(InvalidInputException, "Invalid arguments: -da,---fa");
        });
    });

    describe("transformValueFromString()", () => {
        const parser = new TestableArgumentsParser(["--checked"]);

        it("should return true for string 'true'", () => {
            expect(parser.transformValueFromStringPublic("true")).to.equal(
                true
            );
        });

        it("should return false for string 'false'", () => {
            expect(parser.transformValueFromStringPublic("false")).to.equal(
                false
            );
        });

        it("should return boolean true if already boolean", () => {
            expect(parser.transformValueFromStringPublic(true)).to.equal(true);
        });

        it("should return boolean false if already boolean", () => {
            expect(parser.transformValueFromStringPublic(false)).to.equal(
                false
            );
        });

        it("should return integer for integer string", () => {
            expect(parser.transformValueFromStringPublic("42")).to.equal(42);
        });

        it("should return negative integer", () => {
            expect(parser.transformValueFromStringPublic("-99")).to.equal(-99);
        });

        it("should return float for float string", () => {
            expect(parser.transformValueFromStringPublic("3.1415")).to.equal(
                3.1415
            );
        });

        it("should return negative float", () => {
            expect(parser.transformValueFromStringPublic("-2.5")).to.equal(
                -2.5
            );
        });

        it("should return float in scientific notation", () => {
            expect(parser.transformValueFromStringPublic("1.23e4")).to.equal(
                12300
            );
        });

        it("should return original string if not number or boolean", () => {
            expect(parser.transformValueFromStringPublic("hello")).to.equal(
                "hello"
            );
        });

        it("should return original string with invalid number format", () => {
            expect(parser.transformValueFromStringPublic("12abc")).to.equal(
                "12abc"
            );
        });
    });

    describe("unparse()", () => {
        it("should unparse single flag", () => {
            expect(ArgumentsParser.unparse({ flag: true })).to.deep.equal([
                "--flag",
            ]);
        });

        it("should unparse key-value pairs", () => {
            const result = ArgumentsParser.unparse({
                name: "hello",
                nameEx: "World",
            });
            expect(result).to.deep.equal([
                "--name",
                "hello",
                "--nameEx",
                "World",
            ]);
        });

        it("should unparse numbers", () => {
            expect(
                ArgumentsParser.unparse({ age: 30, pi: 3.14 })
            ).to.deep.equal(["--age", "30", "--pi", "3.14"]);
        });

        it("should unparse arrays", () => {
            expect(
                ArgumentsParser.unparse({ tag: ["one", "two"] })
            ).to.deep.equal(["--tag", "one", "--tag", "two"]);
        });

        it("should skip false or null values", () => {
            expect(
                ArgumentsParser.unparse({ flag: false, other: null })
            ).to.deep.equal([]);
        });

        it("should handle short flags", () => {
            expect(ArgumentsParser.unparse({ a: true })).to.deep.equal(["-a"]);
        });

        it("should throw InvalidInputException on non-object input", () => {
            expect(() => ArgumentsParser.unparse(null as any)).to.throw(
                "Input must be an object"
            );
        });
    });
});
