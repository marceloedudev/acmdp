# 🛠 Command & Arguments Parser

A lightweight and flexible Node.js/TypeScript utility for parsing **CLI commands** and **arguments** into structured JavaScript objects.

---

## 🚀 Usage

### **1️⃣ Command Parser**

Parses an entire CLI command string into its structured components.

## 📦 Installation

```bash
npm install acmdp
```

---

#### Example

```typescript
const input = `npx cross-env NODE_ENV=development ts-node --transpile-only -r ts-node/register -r tsconfig-paths/register ./src/Main.ts --item1=2`;

const result = new CommandParser(input).parse();
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
const result = new ArgumentsParser([
    "--tag",
    "a",
    "--tag",
    "b",
    "--tag",
    "c",
]).parse();
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
const result = new ArgumentsParser(["--isAdmin", "true"]).parse();
```

#### Output

```json
{
    "isAdmin": true
}
```

---

### **3️⃣ ArgumentsParser.unparse()**

Converts a parsed arguments object back into an array of CLI argument strings.

#### Example — Object to Arguments

```typescript
const args = ArgumentsParser.unparse({
    tag: ["a", "b", "c"],
    isAdmin: true,
    age: 30,
});
```

#### Output

```json
["--tag", "a", "--tag", "b", "--tag", "c", "--isAdmin", "--age", "30"]
```

---

## 🧪 Testing

This project uses **Mocha** and **Chai** for testing.

Run all tests:

```bash
npm test
```
