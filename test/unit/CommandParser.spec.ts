import { describe, it } from "mocha";

import { CommandParser } from "@/parse/CommandParser";
import { expect } from "chai";

class TestableCommandParser extends CommandParser {
    public tokenizePublic(input: string): string[] {
        return this["tokenize"](input);
    }
}

describe("CommandParser", () => {
    describe("parse()", () => {
        const examples = [
            {
                input: "npm-run-all --parallel script1 script2",
                expected: {
                    command: "npm-run-all",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: ["--parallel", "script1", "script2"],
                },
            },
            {
                input: 'start -x ./home/bin server.js --host=127.0.0.1 --port="3000"',
                expected: {
                    command: "start",
                    execArgv: ["-x", "./home/bin"],
                    filename: "server.js",
                    filenameOption: [],
                    argv: ["--host", "127.0.0.1", "--port", '"3000"'],
                },
            },
            {
                input: '--tsconfig ./tsconfig.json -r ts-node/register -r tsconfig-paths/register ./src/some.ts teste --user nickname --msg "hello world" -f=txt --random -c=8 --userid=10 --cmd="-r ./run.ts"',
                expected: {
                    command: "",
                    execArgv: [
                        "--tsconfig",
                        "./tsconfig.json",
                        "-r",
                        "ts-node/register",
                        "-r",
                        "tsconfig-paths/register",
                    ],
                    filename: "./src/some.ts",
                    filenameOption: ["teste"],
                    argv: [
                        "--user",
                        "nickname",
                        "--msg",
                        '"hello world"',
                        "-f",
                        "txt",
                        "--random",
                        "-c",
                        "8",
                        "--userid",
                        "10",
                        "--cmd",
                        '"-r ./run.ts"',
                    ],
                },
            },
            {
                input: 'node -r ./ensure-wrapped.js node_modules/mocha/$(npm view mocha bin.mocha) ./test.js -g=8 --true=10 --call="--asd=dsgds"',
                expected: {
                    command: "node",
                    execArgv: [
                        "-r",
                        "./ensure-wrapped.js",
                        "node_modules/mocha/$(npm view mocha bin.mocha)",
                    ],
                    filename: "./test.js",
                    filenameOption: [],
                    argv: [
                        "-g",
                        "8",
                        "--true",
                        "10",
                        "--call",
                        '"--asd=dsgds"',
                    ],
                },
            },
            {
                input: "node -r ./ensure-wrapped.js node_modules/mocha/$(npm view mocha bin.mocha) ./test.js",
                expected: {
                    command: "node",
                    execArgv: [
                        "-r",
                        "./ensure-wrapped.js",
                        "node_modules/mocha/$(npm view mocha bin.mocha)",
                    ],
                    filename: "./test.js",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: 'code . --item1=2 --item1="4" --item2=8 --item1="3d"',
                expected: {
                    command: "code",
                    execArgv: [],
                    filename: ".",
                    filenameOption: [],
                    argv: [
                        "--item1",
                        "2",
                        "--item1",
                        '"4"',
                        "--item2",
                        "8",
                        "--item1",
                        '"3d"',
                    ],
                },
            },
            {
                input: "code .",
                expected: {
                    command: "code",
                    execArgv: [],
                    filename: ".",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "code",
                expected: {
                    command: "code",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "file.js",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: "file.js",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "./src/main.ts -u 50",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: "./src/main.ts",
                    filenameOption: [],
                    argv: ["-u", "50"],
                },
            },
            {
                input: "/usr/local/bin/node --require /home/node/app/node_modules/tsx/dist/preflight.cjs --import file:///home/node/app/node_modules/tsx/dist/loader.mjs ./src/main.ts -u 50",
                expected: {
                    command: "/usr/local/bin/node",
                    execArgv: [
                        "--require",
                        "/home/node/app/node_modules/tsx/dist/preflight.cjs",
                        "--import",
                        "file:///home/node/app/node_modules/tsx/dist/loader.mjs",
                    ],
                    filename: "./src/main.ts",
                    filenameOption: [],
                    argv: ["-u", "50"],
                },
            },
            {
                input: '-g=8 --true=10 --call="--asd=dsgds" --ppp --tsconfig ./tsconfig.json -r ts-node/register -r tsconfig-paths/register ./src/some.ts teste --user ^vPlayer_ --msg "hello world" -f=txt --random -c=8 --userid=10 --cmd="-r ./run.ts"',
                expected: {
                    command: "",
                    execArgv: [
                        "-g",
                        "8",
                        "--true",
                        "10",
                        "--call",
                        '"--asd=dsgds"',
                        "--ppp",
                        "--tsconfig",
                        "./tsconfig.json",
                        "-r",
                        "ts-node/register",
                        "-r",
                        "tsconfig-paths/register",
                    ],
                    filename: "./src/some.ts",
                    filenameOption: ["teste"],
                    argv: [
                        "--user",
                        "^vPlayer_",
                        "--msg",
                        '"hello world"',
                        "-f",
                        "txt",
                        "--random",
                        "-c",
                        "8",
                        "--userid",
                        "10",
                        "--cmd",
                        '"-r ./run.ts"',
                    ],
                },
            },
            {
                input: "run script.js --flag=value -v",
                expected: {
                    command: "run",
                    execArgv: [],
                    filename: "script.js",
                    filenameOption: [],
                    argv: ["--flag", "value", "-v"],
                },
            },
            {
                input: `run app.js --name="My App" -d`,
                expected: {
                    command: "run",
                    execArgv: [],
                    filename: "app.js",
                    filenameOption: [],
                    argv: ["--name", `"My App"`, "-d"],
                },
            },
            {
                input: `npx cross-env NODE_ENV=test mocha --no-timeout`,
                expected: {
                    command: "npx",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: [
                        "cross-env",
                        "NODE_ENV=test",
                        "mocha",
                        "--no-timeout",
                    ],
                },
            },
            {
                input: `set NODE_ENV=test && node your_app.js`,
                expected: {
                    command: "set",
                    execArgv: ["NODE_ENV=test", "&&", "node"],
                    filename: "your_app.js",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: `$env:NODE_ENV="test"; node your_app.js`,
                expected: {
                    command: `$env:NODE_ENV="test";`,
                    execArgv: ["node"],
                    filename: "your_app.js",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: `tsx --tsconfig ./tsconfig.json ./src/Main.ts`,
                expected: {
                    command: "tsx",
                    execArgv: ["--tsconfig", "./tsconfig.json"],
                    filename: "./src/Main.ts",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: `build`,
                expected: {
                    command: "build",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "./",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: "./",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: ".",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: ".",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "npx cross-env NODE_ENV=development ts-node --transpile-only -r ts-node/register -r tsconfig-paths/register ./src/Main.ts",
                expected: {
                    command: "npx",
                    execArgv: [
                        "cross-env",
                        "NODE_ENV=development",
                        "ts-node",
                        "--transpile-only",
                        "-r",
                        "ts-node/register",
                        "-r",
                        "tsconfig-paths/register",
                    ],
                    filename: "./src/Main.ts",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "npx cross-env NODE_ENV=development ts-node --transpile-only -r ts-node/register -r tsconfig-paths/register ./src/Main.ts --item1=2",
                expected: {
                    command: "npx",
                    execArgv: [
                        "cross-env",
                        "NODE_ENV=development",
                        "ts-node",
                        "--transpile-only",
                        "-r",
                        "ts-node/register",
                        "-r",
                        "tsconfig-paths/register",
                    ],
                    filename: "./src/Main.ts",
                    filenameOption: [],
                    argv: ["--item1", "2"],
                },
            },
            {
                input: "ts-node --transpile-only ./src/Main.ts",
                expected: {
                    command: "ts-node",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: ["--transpile-only", "./src/Main.ts"],
                },
            },
            {
                input: "./srcds_run -game left4dead2 -console -ip 0.0.0.0 -port 27015 +maxplayers 8 +map c8m1_apartment",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: "./srcds_run",
                    filenameOption: [],
                    argv: [
                        "-game",
                        "left4dead2",
                        "-console",
                        "-ip",
                        "0.0.0.0",
                        "-port",
                        "27015",
                        "+maxplayers",
                        "8",
                        "+map",
                        "c8m1_apartment",
                    ],
                },
            },
            {
                input: "screen -S l4d2 ./srcds_run -game left4dead2 -console -ip 0.0.0.0 -port 27015 +maxplayers 20 +map c8m1_apartment",
                expected: {
                    command: "screen",
                    execArgv: ["-S", "l4d2"],
                    filename: "./srcds_run",
                    filenameOption: [],
                    argv: [
                        "-game",
                        "left4dead2",
                        "-console",
                        "-ip",
                        "0.0.0.0",
                        "-port",
                        "27015",
                        "+maxplayers",
                        "20",
                        "+map",
                        "c8m1_apartment",
                    ],
                },
            },
            {
                input: "chmod +x script.sh",
                expected: {
                    command: "chmod",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: ["+x", "script.sh"],
                },
            },
            {
                input: "chmod -x script.sh",
                expected: {
                    command: "chmod",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: ["-x", "script.sh"],
                },
            },
            {
                input: "node app.js -a --foo=bar +test file.txt",
                expected: {
                    command: "node",
                    execArgv: [],
                    filename: "app.js",
                    filenameOption: [],
                    argv: ["-a", "--foo", "bar", "+test", "file.txt"],
                },
            },
            {
                input: `sv_gametypes "coop,survival"`,
                expected: {
                    command: "sv_gametypes",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: [`"coop,survival"`],
                },
            },
            {
                input: "chmod u+x start-server.sh",
                expected: {
                    command: "chmod",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: ["u+x", "start-server.sh"],
                },
            },
            {
                input: "./steamcmd.sh +force_install_dir ../l4d2 +@sSteamCmdForcePlatformType linux +app_update 222860 +quit",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: "./steamcmd.sh",
                    filenameOption: [],
                    argv: [
                        "+force_install_dir",
                        "../l4d2",
                        "+@sSteamCmdForcePlatformType",
                        "linux",
                        "+app_update",
                        "222860",
                        "+quit",
                    ],
                },
            },
            {
                input: "ts-node --transpile-only -r ts-node/register ./src/Main.ts",
                expected: {
                    command: "ts-node",
                    execArgv: ["--transpile-only", "-r", "ts-node/register"],
                    filename: "./src/Main.ts",
                    filenameOption: [],
                    argv: [],
                },
            },
        ];

        examples.forEach(({ input, expected }, idx) => {
            it(`Example #${idx + 1}: parses '${input}' correctly`, () => {
                const result = new CommandParser(input).parse();
                expect(result).to.deep.equal(expected);
            });
        });

        it("throws Exception on empty input", () => {
            expect(() => new CommandParser("")).to.throw("Empty input command");
        });
    });

    describe("tokenize()", () => {
        const parser = new TestableCommandParser("echo");

        it("handles quoted values", () => {
            const tokens = parser.tokenizePublic('--msg "hello world"');
            expect(tokens).to.deep.equal(["--msg", '"hello world"']);
        });

        it("handles subshells", () => {
            const tokens = parser.tokenizePublic("$(echo hi)");
            expect(tokens).to.deep.equal(["$(echo hi)"]);
        });

        it("handles paths with subshells", () => {
            const tokens = parser.tokenizePublic(
                "node_modules/mocha/$(npm view mocha bin.mocha)"
            );
            expect(tokens).to.deep.equal([
                "node_modules/mocha/$(npm view mocha bin.mocha)",
            ]);
        });
    });

    describe("splitArgOnEquals()", () => {
        let parser: CommandParser;

        beforeEach(() => {
            parser = new CommandParser("echo test");
        });

        it("should keep Linux environment variable intact", () => {
            const result = parser["splitArgOnEquals"]("NODE_ENV=test");
            expect(result).to.deep.equal(["NODE_ENV=test"]);
        });

        it("should keep Windows set environment variable intact", () => {
            const result = parser["splitArgOnEquals"]("set NODE_ENV=test");
            expect(result).to.deep.equal(["set NODE_ENV=test"]);
        });

        it("should split regular arguments with equals", () => {
            const result = parser["splitArgOnEquals"]("--env=prod");
            expect(result).to.deep.equal(["--env", "prod"]);
        });

        it("should not split quoted arguments with equals", () => {
            const result = parser["splitArgOnEquals"]('"--env=prod"');
            expect(result).to.deep.equal(['"--env=prod"']);
        });

        it("should not split arguments without equals", () => {
            const result = parser["splitArgOnEquals"]("--verbose");
            expect(result).to.deep.equal(["--verbose"]);
        });

        it("should handle empty value after equals", () => {
            const result = parser["splitArgOnEquals"]("--flag=");
            expect(result).to.deep.equal(["--flag"]);
        });
    });
});
