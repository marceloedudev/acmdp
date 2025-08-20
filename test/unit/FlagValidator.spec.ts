import { FlagValidator } from "@/parse/FlagValidator";
import { expect } from "chai";

describe("FlagValidator", () => {
    let validator: FlagValidator;

    beforeEach(() => {
        validator = new FlagValidator();
    });

    describe("stripQuotedAndSubshells", () => {
        it("should remove quoted strings", () => {
            const input = `echo "hello world" -a`;
            const output = validator.stripQuotedAndSubshells(input);
            expect(output).to.equal("echo  -a");
        });

        it("should remove subshells", () => {
            const input = "run $(command) -a";
            const output = validator.stripQuotedAndSubshells(input);
            expect(output).to.equal("run  -a");
        });

        it("should remove parentheses", () => {
            const input = "func(arg) -a";
            const output = validator.stripQuotedAndSubshells(input);
            expect(output).to.equal("func -a");
        });

        it("should return unchanged text if nothing matches", () => {
            const input = "simple -a";
            const output = validator.stripQuotedAndSubshells(input);
            expect(output).to.equal("simple -a");
        });
    });

    describe("extractKeys", () => {
        it("should extract single dash keys", () => {
            const input = "-a -b --long";
            const result = validator.extractKeys(input);
            expect(result).to.deep.equal(["-a", "-b", "--long"]);
        });

        it("should handle tokens with =", () => {
            const input = "-a=1 --name=value -b=2 --c --de=ab";
            const result = validator.extractKeys(input);
            expect(result).to.deep.equal(["-a", "--name", "-b", "--c", "--de"]);
        });

        it("should ignore empty tokens", () => {
            const input = "   -a   -b   ";
            const result = validator.extractKeys(input);
            expect(result).to.deep.equal(["-a", "-b"]);
        });

        it("should work with text that has quotes/subshells removed", () => {
            const input = `"quoted text" -a $(ls) -b (something)`;
            const result = validator.extractKeys(input);
            expect(result).to.deep.equal(["-a", "-b"]);
        });
    });

    describe("filterInvalidFlags", () => {
        it("should flag -aa as invalid", () => {
            const result = validator.filterInvalidFlags(["-aa"]);
            expect(result).to.deep.equal(["-aa"]);
        });

        it("should flag --- as invalid", () => {
            const result = validator.filterInvalidFlags(["---"]);
            expect(result).to.deep.equal(["---"]);
        });

        it("should flag ----abc as invalid", () => {
            const result = validator.filterInvalidFlags(["----abc"]);
            expect(result).to.deep.equal(["----abc"]);
        });

        it("should allow valid short flag -a", () => {
            const result = validator.filterInvalidFlags(["-a"]);
            expect(result).to.deep.equal([]);
        });

        it("should allow valid short flag -z", () => {
            const result = validator.filterInvalidFlags(["-z"]);
            expect(result).to.deep.equal([]);
        });

        it("should handle multiple flags and return only invalid ones", () => {
            const input = ["-a", "-aa", "---", "-b", "----c"];
            const result = validator.filterInvalidFlags(input);
            expect(result).to.deep.equal(["-aa", "---", "----c"]);
        });
    });
});
