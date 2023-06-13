#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const PrettyError = require("pretty-error");

let prettyError = new PrettyError();

// Get the path to the JSX file from the command line
const jsxFilePath = process.argv[2];

// Get the CSS module name from the command line
const cssFilePath = process.argv[3];

// Extracting filename
const importAlias = path.basename(cssFilePath).split(".")[0] + "Styles";

if (
  !jsxFilePath ||
  (path.extname(jsxFilePath) != ".jsx" && path.extname(jsxFilePath) != ".tsx")
) {
  console.error(prettyError.render("Please provide the path to the JSX file."));
  process.exit(1);
}

if (!cssFilePath || path.extname(cssFilePath) != ".css") {
  console.error(prettyError.render("Please provide the path to CSS module."));
  process.exit(1);
}

if (!jsxFilePath || !cssFilePath) {
  console.error(prettyError.render("CSS/JSX file path missing."));
  process.exit(1);
}

// Read the JSX code from the file
let jsxCode;

try {
  jsxCode = fs.readFileSync(jsxFilePath, "utf-8");
} catch (err) {
  console.error(
    prettyError.render(
      new Error("JSX/TSX file doesn't exist, please provide a valid path")
    )
  );
  process.exit(1);
}

// Provide the path to your CSS module here
const cssModule = parseCSS(cssFilePath);
/**
 *
 * @param {*} path - Path to CSS Module
 * @returns - classMap of the classes
 */
function parseCSS(path) {
  let css;
  try {
    css = fs.readFileSync(path, "utf-8");
  } catch (err) {
    console.error(
      prettyError.render(
        new Error("CSS module doesn't exist, please provide a valid path")
      )
    );
    process.exit(1);
  }
  const classMap = {};
  const regex = /\.([a-zA-Z0-9_-]+)\s*{/g;
  let match;
  while ((match = regex.exec(css))) {
    classMap[match[1]] = match[1];
  }
  return classMap;
}

const transformedCode = transformClassNames(jsxCode, cssModule);

// Write the transformed code back to the file
fs.writeFileSync(
  jsxFilePath,
  `import ${importAlias} from ` + `"${cssFilePath}";` + "\n"
);
fs.appendFileSync(jsxFilePath, transformedCode);
console.log("Class names replaced successfully.");

/**
 *
 * @param {*} code - JSX Code to be parsed
 * @param {*} cssModule - CSS module
 * @returns JSX code with replaced classNames
 */
function transformClassNames(code, cssModule) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  traverse(ast, {
    JSXAttribute(jsxPath) {
      if (
        jsxPath.node.name.name === "className" &&
        jsxPath.node.value &&
        jsxPath.node.value.type === "StringLiteral"
      ) {
        const classNames = jsxPath.node.value.value.split(" ");
        const updatedClassNames = classNames.map((className) => {
          return cssModule[className]
            ? t.memberExpression(
                t.identifier(importAlias),
                t.stringLiteral(className),
                true
              )
            : t.stringLiteral(className);
        });

        jsxPath.node.value = t.jsxExpressionContainer(
          t.callExpression(
            t.memberExpression(
              t.arrayExpression(updatedClassNames),
              t.identifier("join")
            ),
            [t.stringLiteral(" ")]
          )
        );
      }
    },
  });

  return generateCode(ast);
}

/**
 *
 * @param {*} ast - Absract syntax tree of the JSX code
 * @returns - JSX code with replaced classNames
 */
function generateCode(ast) {
  const { code } = require("@babel/core").transformFromAstSync(ast, null, {
    configFile: false,
  });
  return code;
}

module.exports = transformClassNames;
