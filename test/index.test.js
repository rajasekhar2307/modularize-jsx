const { execSync } = require("child_process");
const fs = require("fs");

// Removing the contents of the file before every testcase
beforeEach(() => {
  fs.writeFileSync(
    "test/Abc.jsx",
    'const Abc = () => { return ( <> <p className="container help">Hello world</p> </>);};'
  );
});

describe("Command Line Interface test", () => {
  test("Given correct paths to both the files", () => {
    const response = execSync(
      "npx modularize-jsx test/Abc.jsx test/abc.module.css"
    )
      .toString()
      .trim();
    expect(response).toEqual("Class names replaced successfully.");
  });

  test("Given the correct path to JSX but incorrect path to CSS", () => {
    expect(() => {
      execSync("npx modularize-jsx test/Abc.jsx test/abcd.module.css");
    }).toThrow("CSS module doesn't exist, please provide a valid path");
  });

  test("Given the correct path to CSS but incorrect path to JSX", () => {
    expect(() => {
      execSync("npx modularize-jsx test/Abcd.jsx test/abc.module.css");
    }).toThrow("JSX/TSX file doesn't exist, please provide a valid path");
  });

  test("Given the correct path to JSX but ignored CSS", () => {
    expect(() => {
      execSync("npx modularize-jsx test/Abc.jsx");
    }).toThrow("Please provide the path to CSS module.");
  });

  test("Given the correct path to CSS but ignored JSX", () => {
    expect(() => {
      execSync("npx modularize-jsx test/abc.module.css");
    }).toThrow("Please provide the path to the JSX file.");
  });
});

describe("Module test", () => {
  test("Content is changed when the command is run", () => {
    const initialContent = fs.readFileSync("test/Abc.jsx", "utf-8");

    execSync("npx modularize-jsx test/Abc.jsx test/abc.module.css")
      .toString()
      .trim();

    const updatedContent = fs.readFileSync("test/Abc.jsx", "utf-8");
    expect(updatedContent).not.toBe(initialContent);
  });
});

// Deleting the content after running all the testcases
fs.truncate("test/Abc.jsx", 0, (error) => {
  if (error) {
    console.error("Error clearing file content:", error);
  }
});
