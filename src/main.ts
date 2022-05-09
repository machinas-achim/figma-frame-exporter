import { Exportable, Variant, Config, Asset, Size } from "./types";
import { withCasing, buildExportSettings, log } from "./utils";

figma.showUI(__html__, { width: 340, height: 560 });

let storedConfig: Config | undefined;

const getExportables = (): Exportable[] => {
  const nodes = figma.currentPage.selection;
  const exportables: Exportable[] = [];

  for (const node of nodes) {
    if (node.type === "COMPONENT_SET") {
      const children = node.children;

      for (const child of children) {
        const pairs = child.name.split(", ");

        let variants: Variant[] = [];
        for (const pair of pairs) {
          const [property, value] = pair.split("=");
          variants.push({
            property,
            value,
          });
        }

        exportables.push({
          id: child.id,
          parentName: node.name,
          variants,
          size: { width: child.width, height: child.height },
        });
      }
    } else {
      exportables.push({
        id: node.id,
        parentName: node.name,
        variants: [],
        size: { width: node.width, height: node.height },
      });
    }
  }

  return exportables;
};

const getAssets = async (
  exportables: readonly Exportable[],
  config: Config,
  isFinal: boolean,
): Promise<Asset[]> => {
  const { syntax, connector, casing, extension, hideNodes } = config;

  // Create temporary frame to store modified frames.
  const tmp = figma.createFrame();
  tmp.name = 'tmp'
  tmp.resize(1000, 1000);

  let assets: Asset[] = [];

  for (const e of exportables) {
    let asset: Asset = {
      filename: '',
      extension: config.extension,
      size: undefined,
      data: new Uint8Array,
      isFinal,
    };

    let originalNode = figma.getNodeById(e.id) as FrameNode;

    // Modify node if needed.
    let modifiedNode = originalNode.clone();
    modifiedNode = withModificationsForExport(modifiedNode, hideNodes);
    tmp.appendChild(modifiedNode);

    // Build filename.
    let variantsStr = "";
    e.variants.forEach((variant, i) => {
      const value = withCasing(variant.value, casing);
      if (i > 0) {
        variantsStr += `${connector}${value}`;
      } else {
        variantsStr += value;
      }
    });
    const hasVariants = variantsStr.length > 0;
    const filename = syntax
      .replace("{frame}", withCasing(e.parentName, casing))
      .replace("{connector}", hasVariants ? connector : "")
      .replace("{variant}", variantsStr);
    asset.filename = filename;

    // Generate image data.
    const baseExportConfig = {
      extension,
      constraint: config.sizeConstraint,
      srcSize: e.size,
    };
    const { destSize } = buildExportSettings(baseExportConfig);
    asset.size = destSize;
    const { settings } = buildExportSettings(isFinal ? baseExportConfig : {
      extension,
      constraint: '',
      srcSize: { width: 16, height: 16 },
    });
    try {
      asset.data = await (<ExportMixin>modifiedNode).exportAsync(settings);
    } catch (e) {
      log(e);
      continue;
    }

    assets.push(asset);
  }

  // Clean up temporary frame.
  tmp.remove();

  return assets;
};

const withModificationsForExport = (node: FrameNode, hideNodes: string[]): FrameNode => {
  const nodesToHide = node.findAll(c => hideNodes.includes(c.name));
  for (const n of nodesToHide) {
    n.visible = false;
  }

  return node;
}

const refreshUI = async () => {
  const exportables = getExportables();

  let exampleAssets: Asset[] = [];
  if (storedConfig) {
    exampleAssets = await getAssets(exportables, storedConfig, false);
  }

  figma.ui.postMessage({
    type: "refresh",
    nodeCount: exportables.length,
    exampleAssets,
  });
};

figma.ui.onmessage = async (message) => {
  const type = message.type;

  if (type === "init") {
    storedConfig = message.config;
    refreshUI();
  } else if (type === "config") {
    storedConfig = message.config;
    refreshUI();
  } else if (type === "export") {
    const exportables = getExportables();
    const assets = await getAssets(exportables, message.config, true);
    figma.ui.postMessage({ type: "export", assets });
  } else if (type === "cancel") {
    figma.closePlugin();
  }
};

figma.on("selectionchange", () => {
  refreshUI();
});
