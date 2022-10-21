<script lang="ts" type="module">
  import { Section, Type } from "figma-plugin-ds-svelte";
  import { Asset, Size } from "../types";
  import Divider from "./Divider.svelte";
  import { placeHolderImage } from "utils";
  import EmptyText from "./EmptyText.svelte";


  export let exampleAssets: Asset[];

  const displaySize = (size: Size): string => {
    const rounded: Size = {
      width: Math.round(size.width),
      height: Math.round(size.height),
    };
    return `${rounded.width}x${rounded.height}`;
  };
</script>

<div>
  <Section>Preview</Section>
  <div class="section-subtitle">
    <Type>Examples of output image files will appear below.</Type>
  </div>
  <div class="mt-2 px-2">
    {#if exampleAssets.length > 0}
      {#each exampleAssets as exampleAsset, index}
        {#if index > 0}
          <Divider />
        {/if}

        <div class="flex flex-row content-between items-center gap-2 py-2">
          <img class="w-4 h-4" src={exampleAsset.url} alt="asset thumbnail" />
          <Type class="flex flex-1 whitespace-nowrap overflow-hidden">
            {exampleAsset.filename}.{exampleAsset.extension.toLowerCase()}
          </Type>
          {#if exampleAsset.size}
            <Type>
              {displaySize(exampleAsset.size)}
            </Type>
          {/if}
        </div>
      {/each}
    {:else}
    <section>
      <div class="mx-auto" style="width: 200px;">
          <svg width="106" height="76" viewBox="0 0 106 76" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="45" height="36" fill="white" stroke="black" strokeWidth="2" />
              <rect x="55" y="14" width="25" height="23" fill="white" stroke="black" strokeWidth="2" />
              <rect x="15" y="46" width="45" height="23" fill="white" stroke="black" strokeWidth="2" />
              <rect
                  x="32"
                  y="26"
                  width="55"
                  height="29"
                  fill="#3686FF"
                  fillOpacity="0.24"
                  stroke="#3687FF"
                  strokeWidth="2"
              />
              <path
                  d="M89.9508 58.8906C89.8559 58.0256 90.8346 57.4605 91.5363 57.9752L103.094 66.4537C103.835 66.9967 103.513 68.1667 102.599 68.2553L96.7427 68.8238L93.3221 73.6116C92.7884 74.3586 91.6145 74.0519 91.5144 73.1394L89.9508 58.8906Z"
                  fill="black"
              />
          </svg>
        </div>
        <EmptyText>No frames selected: Select things you want to export!</EmptyText>
  </section>
    {/if}
  </div>
</div>
