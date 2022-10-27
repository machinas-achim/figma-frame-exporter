<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Type, Icon, IconForward, IconSpinner, Button } from "figma-plugin-ds-svelte";
  import JSZip from "../../node_modules/jszip/dist/jszip.min.js";
  import { store } from "store";
  import { delay, log, generateDateAndTime } from "utils";
  import { Asset, Config, ExportPayload, LayerModMatches, PluginFormatTypes, } from "types";
  import Divider from "../components/Divider.svelte";
  import SelectedConfigOptions from "../components/SelectedConfigOptions.svelte";
  import NameOptions from "../components/NameOptions.svelte";
  import ImageOptions from "../components/ImageOptions.svelte";
  import LayerModList from "../components/LayerModList.svelte";
  import OutputPreview from "../components/OutputPreview.svelte";
  import imageCompression from "../../node_modules/browser-image-compression/dist/browser-image-compression";

  let config: Config = $store.configs[$store.selectedConfigId];

  let nodeCount = 0;
  let layerModMatches: LayerModMatches = {};
  let exampleAssets: Asset[] = [];
  let exportLoading = false;
  let plural = "";
  let imageLabel = "images";

  $: exportButtonDisabled = nodeCount === 0 || exportLoading;

  onMount(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "INIT",
        },
      },
      "*"
    );
  });

const selectFormat = (format: PluginFormatTypes) => {
  switch (format) {
      case "WEBP":
          return "image/webp";
      case "PNG":
          return "image/png";
      case "JPEG":
          return "image/jpeg";
      case "JPG":
          return "image/jpeg";
  }
};

const resizeFile = async (
  file: File,
  type: "image/jpeg" | "image/png" | "image/webp",
  maxFileSize: string,
  quality: number,
  iterations: number
) => {
  // console.log(file.name + " resizeFile() type ", type)
  // console.log(file.name + " resizeFile() quality ", quality)
  // console.log(file.name + " resizeFile() size before", file.size)
  return await imageCompression(file, {
      fileType: type,
      maxSizeMB: parseFloat(maxFileSize),
      alwaysKeepResolution: true,
      initialQuality: quality * 0.01,
      maxIteration: iterations,
  })
      .then(compressedFile => {
        // console.log(file.name + " resizeFile() size after", compressedFile.size)
          return compressedFile as File;
      })
      .catch(error => {
          console.error(error.message);
      });
};

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    const type = message.type;
    log("Message:", type, message);

    if (type === "PREVIEW") {
      const exportPayload = message.exportPayload as ExportPayload;
      nodeCount = exportPayload.nodeCount;
      layerModMatches = exportPayload.layerModMatches;
      exampleAssets = await buildPreviewImages(exportPayload.assets);
      plural = nodeCount === 1 ? "" : "s";
      imageLabel=(`image${plural}`);
    } else if (type === "EXPORT") {
      const exportPayload = message.exportPayload as ExportPayload;
      await presentDownloadableArchive(exportPayload.assets);
      exportLoading = false;
    }
  };

  const onChangeConfig = () => {
    log("Changed config:", $store.selectedConfigId);
    config = $store.configs[$store.selectedConfigId];
  };

  const onUpdateConfig = () => {
    log("Updated config:", config);
    $store = {
      selectedConfigId: config.id,
      configs: {
        ...$store.configs,
        [config.id]: config,
      },
    };
  };

  const onSelectExport = async () => {
    if (exportButtonDisabled) {
      return;
    }

    exportLoading = true;
    await delay(10);
    parent.postMessage(
      {
        pluginMessage: {
          type: "EXPORT",
          config,
        },
      },
      "*"
    );
  };

  const buildPreviewImages = async (assets: Asset[]): Promise<Asset[]> => {
    assets.forEach((asset) => {
      let blob = new Blob([asset.data], { type: `image/png` });
      const url = window.URL.createObjectURL(blob);
      asset.url = url;
    });
    return assets;
  };

  const presentDownloadableArchive = async (assets: Asset[]) => {
    let zip = new JSZip();

    assets.forEach( (asset) => {
      const extensionLower = asset.extension.toLowerCase();
      const blob = new Blob([asset.data], { type: `image/${extensionLower}` }) as Blob;
      // BUGBUG add compression here
      // const blob = new Blob([img.data], {type: "image/png"}) as Blob;
      const file = new File([blob], asset.filename, {type: `image/${extensionLower}`}) as File;
      // console.log("asset.filename", asset.filename);
      // console.log("asset.type", `image/${extensionLower}`);

      let outputFile = file;

      if (extensionLower === "svg" || extensionLower === "pdf" || extensionLower === "png") {
        // outputFile = file;
      } else {
         outputFile = resizeFile(
            file,
            selectFormat(extensionLower.toUpperCase() as PluginFormatTypes),
            // maxFileSize,
            "1000",
            // quality,
            config.quality,
            // iterations
            10
        );
      }

      
      // console.log('imageCompression done blob: ', outputBlob.size);
      // let outputFile = new File([outputBlob], asset.filename, {type: `image/${extensionLower}`}) as File;
      // console.log('imageCompression done file: ', outputFile.size);

      // // let outputFile = file;
      // console.log(outputBlob);
      // console.log(outputFile);
      zip.file(`${asset.filename}.${extensionLower}`, outputFile, { base64: true });
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `machinas-export-${generateDateAndTime()}.zip`
    link.click();
  };

</script>

<div class="flex flex-1 flex-col overflow-y-hidden">
  <div class="flex flex-1 flex-col w-full overflow-y-scroll">
    {#if Object.keys($store.configs).length > 1}
      <div class="section">
        <SelectedConfigOptions
          selectedConfigId={config.id}
          configs={$store.configs}
          onChange={(id) => {
            $store.selectedConfigId = id;
            onChangeConfig();
          }}
        />
      </div>

      <Divider />
    {/if}

    <div class="section">
      <NameOptions
        nameConfig={config}
        onChange={(nameConfig) => {
          config = {
            ...config,
            ...nameConfig,
          };
          onUpdateConfig();
        }}
      />
    </div>

    <Divider />

    <div class="section">
      <ImageOptions
        imageConfig={config}
        onChange={(imageConfig) => {
          config = {
            ...config,
            ...imageConfig,
          };
          onUpdateConfig();
        }}
      />
    </div>

    <Divider />

    <div class="section">
      <LayerModList
        layerMods={config.layerMods}
        {layerModMatches}
        onChangeLayerMods={(layerMods) => {
          config = {
            ...config,
            layerMods,
          };
          onUpdateConfig();
        }}
      />
    </div>

    <Divider />

    <div class="section">
      <OutputPreview {exampleAssets} />
    </div>
  </div>

  <div
    class="flex flex-col justify-center w-full h-16 cursor-pointer"
    disabled={exportButtonDisabled}
    on:click={onSelectExport}
  >
    <Divider />

    <div
      class={"flex flex-1 flex-row items-center justify-between pl-4 pr-2 pointer-events-none " +
        (exportButtonDisabled ? "opacity-50 hover:opacity-60" : "opacity-80 hover:opacity-100")}
    >
      <Button variant="secondary">
        {exportLoading ? `Please wait, exporting ${nodeCount} ${imageLabel}...` : `Export ${nodeCount} ${imageLabel}`}
        <Icon iconName={exportLoading ? IconSpinner : IconForward} spin={exportLoading ? true : false}/>
      </Button>
    </div>
  </div>
</div>
