# 🛠 Command & Arguments Parser

A lightweight and flexible Node.js/TypeScript utility for parsing **CLI commands** and **arguments** into structured JavaScript objects.

---

## 🚀 Usage

### **1️⃣ Command Parser**

Parses an entire CLI command string into its structured components.

#### Example

```typescript
const input = `npx cross-env NODE_ENV=development ts-node --transpile-only -r ts-node/register -r tsconfig-paths/register ./src/Main.ts --item1=2`;

const result = new CommandParser(input).parse();

console.log(result);
```

#### Output

```json
{
    "command": "npx",
    "execArgv": [
        "cross-env",
        "NODE_ENV=development",
        "ts-node",
        "--transpile-only",
        "-r",
        "ts-node/register",
        "-r",
        "tsconfig-paths/register"
    ],
    "filename": "./src/Main.ts",
    "filenameOption": [],
    "argv": ["--item1", "2"]
}
```

---

### **2️⃣ Arguments Parser**

Parses a list of CLI arguments (`string[]`) into a JavaScript object.

#### Example — Multiple Values

```typescript
const result = new ArgumentsParse([
    "--tag",
    "a",
    "--tag",
    "b",
    "--tag",
    "c",
]).parse();

console.log(result);
```

#### Output

```json
{
    "tag": ["a", "b", "c"]
}
```

---

#### Example — Boolean & Primitive Values

```typescript
const result = new ArgumentsParse(["--isAdmin", "true"]).parse();

console.log(result);
```

#### Output

```json
{
    "isAdmin": true
}
```

---

## 🧪 Testing

This project uses **Mocha** and **Chai** for testing.

Run all tests:

```bash
npm test
```
