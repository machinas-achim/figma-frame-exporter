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
          format: extension,
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
          format: extension,
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
          format: extension,
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
          format: extension,
        },
        destSize: srcSize,
      };
    }
  }
};

export const placeHolderImage = () => {
  return "<div class=\"AJLAJL\"></div>";

  // return ('
      // <section>
      //     <div>
      //         <svg width="106" height="76" viewBox="0 0 106 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      //             <rect x="1" y="1" width="45" height="36" fill="white" stroke="black" strokeWidth="2" />
      //             <rect x="55" y="14" width="25" height="23" fill="white" stroke="black" strokeWidth="2" />
      //             <rect x="15" y="46" width="45" height="23" fill="white" stroke="black" strokeWidth="2" />
      //             <rect
      //                 x="32"
      //                 y="26"
      //                 width="55"
      //                 height="29"
      //                 fill="#3686FF"
      //                 fillOpacity="0.24"
      //                 stroke="#3687FF"
      //                 strokeWidth="2"
      //             />
      //             <path
      //                 d="M89.9508 58.8906C89.8559 58.0256 90.8346 57.4605 91.5363 57.9752L103.094 66.4537C103.835 66.9967 103.513 68.1667 102.599 68.2553L96.7427 68.8238L93.3221 73.6116C92.7884 74.3586 91.6145 74.0519 91.5144 73.1394L89.9508 58.8906Z"
      //                 fill="black"
      //             />
      //         </svg>
      //         <span>Select things you want to export</span>
      //     </div>
      // </section>
  // ');
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
