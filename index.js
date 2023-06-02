#!/usr/bin/env node

const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");

const jsxFilePath = process.argv[2]; // Get the path to the JSX file from the command line

if (!jsxFilePath) {
  console.error("Please provide the path to the JSX file.");
  process.exit(1);
}

const cssModuleName = process.argv[3]; // Get the CSS module name from the command line

if (!cssModuleName) {
  console.error("Please provide the name of the CSS module.");
  process.exit(1);
}

const cssModulePath = `./${cssModuleName}.module.css`; // Construct the path to the CSS module
const cssModule = parseCSS(cssModulePath); // Provide the path to your CSS module here

const jsxCode = fs.readFileSync(jsxFilePath, "utf-8"); // Read the JSX code from the file

function parseCSS(path) {
  const css = fs.readFileSync(path, "utf-8");
  const classMap = {};
  const regex = /\.([a-zA-Z0-9_-]+)\s*{/g;
  let match;
  while ((match = regex.exec(css))) {
    classMap[match[1]] = match[1];
  }
  return classMap;
}

const transformedCode = transformClassNames(jsxCode, cssModule);

fs.writeFileSync(jsxFilePath, transformedCode); // Write the transformed code back to the file
console.log("Class names replaced successfully.");
function transformClassNames(code, cssModule) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  traverse(ast, {
    JSXAttribute(path) {
      if (
        path.node.name.name === "className" &&
        path.node.value &&
        path.node.value.type === "StringLiteral"
      ) {
        const classNames = path.node.value.value.split(" ");
        const updatedClassNames = classNames.map((className) => {
          return cssModule[className]
            ? t.memberExpression(
                t.identifier("cssModule"),
                t.stringLiteral(className),
                true
              )
            : t.stringLiteral(className);
        });
        // path.node.value = t.jsxExpressionContainer(
        //   t.stringLiteral(updatedClassNames.join(" "))
        // );

        console.log("JE", updatedClassNames);

        path.node.value = t.jsxExpressionContainer(
          t.callExpression(
            t.memberExpression(
              t.arrayExpression(updatedClassNames),
              t.identifier("join")
            ),
            [t.stringLiteral(" ")]
          )
        );

        // path.node.value = t.jsxExpressionContainer(
        //   t.templateLiteral(
        //     [
        //       t.templateElement(
        //         {
        //           raw: "$ help",
        //           cooked: "coocked",
        //         },
        //         true
        //       ),
        //     ],
        //     []
        //   )
        // );
      }
    },
  });

  return generateCode(ast);
}

function generateCode(ast) {
  const { code } = require("@babel/core").transformFromAstSync(ast, null, {
    configFile: false,
  });
  return code;
}

module.exports = transformClassNames;
