# pxtorem-stylis-plugin

A plugin for [Stylis](https://stylis.js.org/) that generates rem units from pixel units. 

This is a port of the fantastic [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem) by [cuth](https://github.com/cuth/) to stylis.

## Install

```shell
$ npm install pxtorem-stylis-plugin
```

## Work with styled-components v6+

```javascript
import styled, { StyleSheetManager } from "styled-components";
import usePxtoremStylisPlugin from "pxtorem-stylis-plugin";

const Box = styled.div`
  font-size: 16px;
  width: 100px;
`;

const pxtoremStylisPlugin = usePxtoremStylisPlugin({/* your custom options here */});

export function MakeItRem() {
  return (
    <StyleSheetManager stylisPlugins={[pxtoremStylisPlugin]}>
      <Box>My font-size will be 1rem.</Box>
    </StyleSheetManager>
  );
}
```

If you are using styled-components v5+, you should use [stylis-pxtorem by AWare](https://github.com/AWare/stylis-pxtorem) package instead. The way you work with styled-component is pretty same as the demo above; simply swapping out the package and add a Object.defineProperty setting is fine.

```bash
- import usePxtoremStylisPlugin from "pxtorem-stylis-plugin";
+ import usePxtoremStylisPlugin from "stylis-pxtorem";

+ Object.defineProperty(pxtoremStylisPlugin, "name", {
+   value: "pxtoremStylisPlugin",
+ });
```

## Options

```typescript
type Options = {
  /* The root element font size. */
  rootValue: number;

  /* The decimal numbers to allow the REM units to grow to. */
  unitPrecision: number;

  /**
   * The properties that can change from px to rem.
   * - Values need to be exact matches.
   * - Use wildcard `*` to enable all properties. Example: `['*']`
   * - Use `*` at the start or end of a word. (`['*position*']` will match `background-position-y`)
   * - Use `!` to not match a property. Example: `['*', '!letter-spacing']`
   * - Combine the "not" prefix with the other prefixes. Example: `['*', '!font*']` 
   */
  propList: string[];

  /**
   * The selectors to ignore and leave as px.
   * - If value is string, it checks to see if selector contains the string.
   *   - `['body']` will match `.body-class`
   * - If value is regexp, it checks to see if the selector matches the regexp.
   *   - `[/^body$/]` will match `body` but not `.body`
   */
  selectorBlackList: string[];

  /* replaces rules containing rems instead of adding fallbacks. */
  replace: boolean;

  /* Set the minimum pixel value to replace. */
  minPixelValue: number;
}
```

Default Options

```js
{
  rootValue: 16,
  unitPrecision: 5,
  propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
  selectorBlackList: [],
  replace: true,
  // mediaQuery: false,
  minPixelValue: 0
}
```

### Example

*With the default settings, only font related properties are targeted.*

```css
// input
h1 {
  margin: 0 0 20px;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 1px;
}

// output
h1 {
  margin: 0 0 20px;
  font-size: 2rem;
  line-height: 1.2;
  letter-spacing: 0.0625rem;
}
```

### A message about ignoring properties
Currently, the easiest way to have a single property ignored is to use a capital in the pixel unit declaration.

```css
// `px` is converted to `rem`
.convert {
    font-size: 16px; // converted to 1rem
}

// `Px` or `PX` is ignored by `postcss-pxtorem` but still accepted by browsers
.ignore {
    border: 1Px solid; // ignored
    border-width: 2PX; // ignored
}
```
