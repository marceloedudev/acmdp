import { FileExtension } from "@/parse/FileExtension";
import { expect } from "chai";

describe("FileExtension", () => {
    describe("isExecutablePath()", () => {
        const parser = new FileExtension();

        it("recognizes JS/TS files", () => {
            expect(parser.isExecutablePath("file.js")).to.be.true;
            expect(parser.isExecutablePath("main.ts")).to.be.true;
            expect(parser.isExecutablePath("module.mjs")).to.be.true;
        });

        it("recognizes relative/absolute paths", () => {
            expect(parser.isExecutablePath("./src/index.ts")).to.be.true;
            expect(parser.isExecutablePath("/usr/bin/test.js")).to.be.true;
            expect(parser.isExecutablePath(".")).to.be.true;
        });

        it("returns false for non-filenames", () => {
            expect(parser.isExecutablePath("npm")).to.be.false;
            expect(parser.isExecutablePath("start")).to.be.false;
        });
    });

    describe("hasExecutableExtension()", () => {
        const parser = new FileExtension();

        it("detects JS/TS extensions", () => {
            expect(parser.hasExecutableExtension("test.js")).to.be.true;
            expect(parser.hasExecutableExtension("test.ts")).to.be.true;
            expect(parser.hasExecutableExtension("test.cjs")).to.be.true;
        });

        it("returns false when no recognized extension", () => {
            expect(parser.hasExecutableExtension("command")).to.be.false;
            expect(parser.hasExecutableExtension("file.txt")).to.be.false;
        });
    });
});
