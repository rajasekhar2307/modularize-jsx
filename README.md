# Modularize JSX

A tool to convert your classNames into modular css in your JSX/TSX file.

## Installation

Install with npm:

    $ npm install modularize-jsx

## Usage

You can simply run this command to modularize your JSX/TSX

    $ npx modularize-jsx <path-to-jsx> <path-to-css>

## Example

    $ npx modularize-jsx Component.jsx component.module.css

Convert this

```
// Component.jsx

function Component () {
  return
    <>
      <div className="div-container">
        <p className="p-container">Hello world!</p>
      </div>
    </>
}
```

```
// component.module.css

.div-container {
  color: #eee;
}
.p-container{
  color: #333;
}
```

to this

```
// Component.jsx
import componentStyles from "component.module.css"; // auto-imported

function Component() {
  return
    <>
      <div className={[componentStyles["div-container"]].join(" ")}>
        <p className={[componentStyles["p-container"]].join(" ")}>Hello world!</p>
      </div>
    </>
}

```

## License

ISC
