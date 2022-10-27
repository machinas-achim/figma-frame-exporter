<script lang="ts" type="module">
  import { Section, SelectMenu, Input, Checkbox } from "figma-plugin-ds-svelte";
  import { ExtensionOption, ImageConfig } from "types";

  export let imageConfig: ImageConfig;
  export let onChange: (imageConfig: ImageConfig) => void;

  let extensionOptions: ExtensionOption[] = [
    { value: "PNG", label: "PNG", group: null, selected: false },
    { value: "JPG", label: "JPG", group: null, selected: false },
    { value: "WEBP", label: "WEBP", group: null, selected: false },
    { value: "SVG", label: "SVG", group: null, selected: false },
    { value: "PDF", label: "PDF", group: null, selected: false },
  ];
  $: {
    extensionOptions.forEach((o, i) => {
      extensionOptions[i].selected = o.value === imageConfig.extension;
    });
  }

  const _onChangeConfig = () => {
    onChange(imageConfig);
  };
</script>

<div class="flex flex-col">
  <div class="flex flex-row gap-2">
    <div class="flex flex-col">
      <Section>Image size</Section>
      <Input
        placeholder="E.g. 2x, 64w, 200h"
        disabled={!imageConfig.extension || imageConfig.extension === "SVG" || imageConfig.extension === "PDF"}
        bind:value={imageConfig.sizeConstraint}
        on:input={(e) => {
          imageConfig.sizeConstraint = e.target["value"];
          _onChangeConfig();
        }}
      />
    </div>
    <div class="flex flex-col">
      <Section>Format</Section>
      <SelectMenu
        bind:menuItems={extensionOptions}
        on:change={(e) => {
          imageConfig.extension = e.detail.value;
          _onChangeConfig();
        }}
      />
    </div>
    <div class="flex flex-col">
      <Section>Export Quality</Section>
      <Input
        placeholder="1–100, higher=better"
        disabled={!imageConfig.extension || imageConfig.extension === "SVG" || imageConfig.extension === "PDF" || imageConfig.extension === "PNG"}
        bind:value={imageConfig.quality}
        on:input={(e) => {
          imageConfig.quality = e.target["value"];
          _onChangeConfig();
        }}
      />
    </div>

  </div>
  <div class="flex flex-row">
    <Checkbox
    disabled={!imageConfig.extension || imageConfig.extension === "SVG" || imageConfig.extension === "PDF"}
    bind:checked={imageConfig.suffix}
    on:change={(e) => {
        _onChangeConfig();
    }}
    >
      Add a scale suffix to the filename
    </Checkbox>
  </div>
</div>
