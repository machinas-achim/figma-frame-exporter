import convertCase from "../node_modules/js-convert-case/lib/index";

import { Casing, Config, Extension, Size } from "./types";

export const randomId = () => `${Math.floor(Math.random() * 1000)}`;

export const casingMap: Record<Casing, (s: string) => string> = {
  original: (s) => s,
  lower: convertCase.toLowerCase,
  upper: convertCase.toUpperCase,
  title: convertCase.toHeaderCase,
  snake: convertCase.toSnakeCase,
  kebab: convertCase.toKebabCase,
  camel: convertCase.toCamelCase,
  pascal: convertCase.toPascalCase,
  dot: convertCase.toDotCase,
};

export const withCasing = (value: string, casing: Casing): string => {
  const values = value
    .split("/")
    .map((o) => casingMap[casing](o.trim()))
    .join("/");
  return values;
};

export const buildExportSettings = (config: {
  extension: Extension;
  constraint: string;
  suffix: boolean,
  srcSize: Size;
}): { settings: ExportSettings; destSize?: Size } => {
  const { extension, constraint, suffix, srcSize } = config;

  if (extension === "SVG" || extension === "PDF") {
    return {
      settings: {
        format: extension,
      },
    };
  } else {
    if (constraint.endsWith("x")) {
      const value = Number(constraint.slice(0, -1));
      return {
        settings: {
          format: "PNG",
          constraint: { type: "SCALE", value },
          useAbsoluteBounds: true,
        },
        destSize: {
          width: srcSize.width * value,
          height: srcSize.height * value,
        },
      };
    } else if (constraint.endsWith("w")) {
      const value = Number(constraint.slice(0, -1));
      return {
        settings: {
          format: "PNG",
          constraint: { type: "WIDTH", value },
        },
        destSize: {
          width: value,
          height: srcSize.height * (value / srcSize.width),
        },
      };
    } else if (constraint.endsWith("h")) {
      const value = Number(constraint.slice(0, -1));
      return {
        settings: {
          format: "PNG",
          constraint: { type: "HEIGHT", value },
        },
        destSize: {
          width: srcSize.width * (value / srcSize.height),
          height: value,
        },
      };
    } else {
      return {
        settings: {
          // Always return PNG for all non-SVG and non-PDF exports 
          // so that we can compress from PNG source to target bitmap format in final step
          format: "PNG",
        },
        destSize: srcSize,
      };
    }
  }
};

export const generateDateAndTime = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}-${minute}-${second}`;
};

export const buildDefaultConfig = (): Config => {
  return {
    id: `${Math.random()}`,
    name: "",
    syntax: "$F$V",
    connectors: {
      before: "",
      between: "",
      after: "",
    },
    casing: "original",
    sizeConstraint: "2x",
    extension: "PNG",
    quality: "80",
    suffix: true,
    layerMods: [
      // {
      //   id: `${Math.random()}`,
      //   query: undefined,
      //   property: undefined,
      //   value: undefined,
      // },
    ],
  };
};

export const delay = async (ms: number) => await new Promise((res) => setTimeout(res, ms));

export const log = (...args: any[]) => {
  console.log("[Machinas Frame Exporter]", ...args);
};

export default {};
