import { compile, Middleware, middleware, prefixer, serialize, stringify } from "stylis";
import { usePxtoremStylisPlugin } from "./stylis-pxtorem";
import filterPropList from "./utils/filter-prop-list";

const basicCSS = ".rule { font-size: 15px }";

describe("stylis-pxtorem-plugin", () => {
  describe("check pxtorem", function () {
    let stylis: (css: string, extraPlugins?: Middleware[]) => string;

    describe("with default options", () => {
      beforeEach(() => {
        stylis = (css: string, extraPlugins: Middleware[] = []) =>
          serialize(
            compile(css),
            middleware([...extraPlugins, usePxtoremStylisPlugin({}), stringify])
          );
      });

      it("should work on the readme example", function () {
        const input =
          "h1 { margin: 0 0 20px; font-size: 32px; line-height: 1.2; letter-spacing: 1px; }";
        const output =
          "h1{margin:0 0 20px;font-size:2rem;line-height:1.2;letter-spacing:0.0625rem;}";

        expect(stylis(input)).toBe(output);
      });

      it("should replace the px unit with rem", function () {
        expect(stylis(basicCSS)).toBe(".rule{font-size:0.9375rem;}");
      });

      it("should ignore non px properties", function () {
        expect(stylis(".rule { font-size: 2em }")).toBe(
          ".rule{font-size:2em;}"
        );
      });

      it("should remain unitless if 0", function () {
        expect(stylis(".rule { font-size: 0px; font-size: 0; }")).toBe(
          ".rule{font-size:0;font-size:0;}"
        );
      });
    });

    describe("with custom options", () => {
      beforeEach(() => {
        const options = { propList: ["margin"] };
        stylis = (css: string, extraPlugins: Middleware[] = []) =>
          serialize(
            compile(css),
            middleware([
              ...extraPlugins,
              usePxtoremStylisPlugin(options),
              stringify,
            ])
          );
      });

      it("should handle < 1 values and values without a leading 0", function () {
        expect(stylis(".rule { margin: 0.5rem .5px -0.2px -.2em }")).toBe(
          ".rule{margin:0.5rem 0.03125rem -0.0125rem -.2em;}"
        );
      });
    });
  });

  describe("check value parsing", function () {
    let stylis: (css: string, extraPlugins?: Middleware[]) => string;

    beforeEach(() => {
      const options = { propList: ["*"] };
      stylis = (css: string, extraPlugins: Middleware[] = []) =>
        serialize(
          compile(css),
          middleware([...extraPlugins, usePxtoremStylisPlugin(options), stringify])
        );
    });

    it("should not replace values in double quotes or single quotes", function () {
      expect(
        stylis(
          ".rule { content: '16px'; font-family: \"16px\"; font-size: 16px; }"
        )
      ).toBe(".rule{content:'16px';font-family:\"16px\";font-size:1rem;}");
    });

    it("should not replace values in `url()`", function () {
      expect(
        stylis(".rule { background: url(16px.jpg); font-size: 16px; }")
      ).toBe(".rule{background:url(16px.jpg);font-size:1rem;}");
    });

    it("should not replace values with an uppercase P or X", function () {
      expect(
        stylis(
          ".rule { margin: 12px calc(100% - 14PX); height: calc(100% - 20px); font-size: 12Px; line-height: 16px; }"
        )
      ).toBe(
        ".rule{margin:0.75rem calc(100% - 14PX);height:calc(100% - 1.25rem);font-size:12Px;line-height:1rem;}"
      );
    });
  });

  describe("check rootValue", function () {
    let stylis: (css: string, extraPlugins?: Middleware[]) => string;

    beforeEach(() => {
      const options = { rootValue: 10 };
      stylis = (css: string, extraPlugins: Middleware[] = []) =>
        serialize(
          compile(css),
          middleware([...extraPlugins, usePxtoremStylisPlugin(options), stringify])
        );
    });

    it("should replace using a root value of 10", function () {
      expect(stylis(basicCSS)).toBe(".rule{font-size:1.5rem;}");
    });
  });

  describe("check unitPrecision", function () {
    let stylis: (css: string, extraPlugins?: Middleware[]) => string;

    beforeEach(() => {
      const options = { unitPrecision: 2 };
      stylis = (css: string, extraPlugins: Middleware[] = []) =>
        serialize(
          compile(css),
          middleware([...extraPlugins, usePxtoremStylisPlugin(options), stringify])
        );
    });

    it("should replace using a decimal of 2 places", function () {
      expect(stylis(basicCSS)).toBe(".rule{font-size:0.94rem;}");
    });
  });

  describe("check propList", function () {
    let stylis: (
      options: Record<string, unknown>
    ) => (css: string, extraPlugins?: Middleware[]) => string;

    beforeEach(() => {
      stylis =
        (options) =>
        (css: string, extraPlugins: Middleware[] = []) =>
          serialize(
            compile(css),
            middleware([
              ...extraPlugins,
              usePxtoremStylisPlugin(options),
              stringify,
            ])
          );
    });

    it("should only replace properties in the prop list", function () {
      const options = {
        propList: ["*font*", "margin*", "!margin-left", "*-right", "pad"],
      };
      expect(
        stylis(options)(
          ".rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }"
        )
      ).toBe(
        ".rule{font-size:1rem;margin:1rem;margin-left:5px;padding:5px;padding-right:1rem;}"
      );
    });

    it("should only replace properties in the prop list with wildcard", function () {
      const options = {
        propList: ["*", "!margin-left", "!*padding*", "!font*"],
      };
      expect(
        stylis(options)(
          ".rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }"
        )
      ).toBe(
        ".rule{font-size:16px;margin:1rem;margin-left:5px;padding:5px;padding-right:16px;}"
      );
    });

    it("should replace all properties when white list is wildcard", function () {
      const options = { propList: ["*"] };
      expect(stylis(options)(".rule { margin: 16px; font-size: 15px }")).toBe(
        ".rule{margin:1rem;font-size:0.9375rem;}"
      );
    });
  });

  describe("check selectorBlackList", function () {
    let stylis: (
      options: Record<string, unknown>
    ) => (css: string, extraPlugins?: Middleware[]) => string;

    beforeEach(() => {
      stylis =
        (options) =>
        (css: string, extraPlugins: Middleware[] = []) =>
          serialize(
            compile(css),
            middleware([
              ...extraPlugins,
              usePxtoremStylisPlugin(options),
              stringify,
            ])
          );
    });

    it("should ignore selectors in the selector black list", function () {
      const options = { selectorBlackList: [".rule2"] };
      expect(
        stylis(options)(".rule { font-size: 15px } .rule2 { font-size: 15px }")
      ).toBe(".rule{font-size:0.9375rem;}.rule2{font-size:15px;}");
    });

    it("should ignore every selector with `body$`", function () {
      const options = { selectorBlackList: ["body$"] };
      expect(
        stylis(options)(
          "body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }"
        )
      ).toBe(
        "body{font-size:1rem;}.class-body${font-size:16px;}.simple-class{font-size:1rem;}"
      );
    });

    it("should only ignore exactly `body`", function () {
      const options = { selectorBlackList: [/^body$/] };
      expect(
        stylis(options)(
          "body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }"
        )
      ).toBe(
        "body{font-size:16px;}.class-body{font-size:1rem;}.simple-class{font-size:1rem;}"
      );
    });
  });

  describe("check replace", function () {
    let stylis: (css: string, extraPlugins?: Middleware[]) => string;

    beforeEach(() => {
      const options = { replace: false };
      stylis = (css: string, extraPlugins: Middleware[] = []) =>
        serialize(
          compile(css),
          middleware([...extraPlugins, usePxtoremStylisPlugin(options), stringify])
        );
    });

    it("should leave fallback pixel unit with root em value", function () {
      expect(stylis(basicCSS)).toBe(
        ".rule{font-size:15px;font-size:0.9375rem;}"
      );
    });
  });

  describe.skip("check mediaQuery", function () {
    let stylis: (css: string, extraPlugins?: Middleware[]) => string;

    beforeEach(() => {
      const options = { mediaQuery: true };
      stylis = (css: string, extraPlugins: Middleware[] = []) =>
        serialize(
          compile(css),
          middleware([...extraPlugins, usePxtoremStylisPlugin(options as any), stringify])
        );
    });

    it("should replace px in media queries", function () {
      expect(stylis("@media (min-width: 500px) {.rule{font-size:1rem;}}")).toBe(
        "@media (min-width: 31.25rem){.rule{font-size:1rem;}}"
      );
    });
  });

  describe("check minPixelValue", function () {
    let stylis: (css: string, extraPlugins?: Middleware[]) => string;

    beforeEach(() => {
      const options = { propList: ["*"], minPixelValue: 2 };
      stylis = (css: string, extraPlugins: Middleware[] = []) =>
        serialize(
          compile(css),
          middleware([...extraPlugins, usePxtoremStylisPlugin(options), stringify])
        );
    });

    it("should not replace values below minPixelValue", function () {
      expect(
        stylis(
          ".rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }"
        )
      ).toBe(
        ".rule{border:1px solid #000;font-size:1rem;margin:1px 0.625rem;}"
      );
    });
  });

  describe("check filter-prop-list", function () {
    it('should find "exact" matches from propList', function () {
       const propList = [
        "font-size",
        "margin",
        "!padding",
        "*border*",
        "*",
        "*y",
        "!*font*",
      ];
      expect(filterPropList.exact(propList).join()).toBe("font-size,margin");
    });

    it('should find "contain" matches from propList and reduce to string', function () {
      const propList = [
        "font-size",
        "*margin*",
        "!padding",
        "*border*",
        "*",
        "*y",
        "!*font*",
      ];
      expect(filterPropList.contain(propList).join()).toBe("margin,border");
    });

    it('should find "start" matches from propList and reduce to string', function () {
      const propList = [
        "font-size",
        "*margin*",
        "!padding",
        "border*",
        "*",
        "*y",
        "!*font*",
      ];
      expect(filterPropList.startWith(propList).join()).toBe("border");
    });

    it('should find "end" matches from propList and reduce to string', function () {
      const propList = [
        "font-size",
        "*margin*",
        "!padding",
        "border*",
        "*",
        "*y",
        "!*font*",
      ];
      expect(filterPropList.endWith(propList).join()).toBe("y");
    });

    it('should find "not" matches from propList and reduce to string', function () {
      const propList = [
        "font-size",
        "*margin*",
        "!padding",
        "border*",
        "*",
        "*y",
        "!*font*",
      ];
      expect(filterPropList.notExact(propList).join()).toBe("padding");
    });

    it('should find "not contain" matches from propList and reduce to string', function () {
      const propList = [
        "font-size",
        "*margin*",
        "!padding",
        "!border*",
        "*",
        "*y",
        "!*font*",
      ];
      expect(filterPropList.notContain(propList).join()).toBe("font");
    });

    it('should find "not start" matches from propList and reduce to string', function () {
      const propList = [
        "font-size",
        "*margin*",
        "!padding",
        "!border*",
        "*",
        "*y",
        "!*font*",
      ];
      expect(filterPropList.notStartWith(propList).join()).toBe("border");
    });

    it('should find "not end" matches from propList and reduce to string', function () {
      const propList = [
        "font-size",
        "*margin*",
        "!padding",
        "!border*",
        "*",
        "!*y",
        "!*font*",
      ];
      expect(filterPropList.notEndWith(propList).join()).toBe("y");
    });
  });
});
