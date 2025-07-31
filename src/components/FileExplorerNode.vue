<template>
  <div :style="{
    color: `hsl(${level * 40}, 70%, 45%)`,
    paddingLeft: `${level * 20}px`,
  }">
    <div class="flex justify-between hover:cursor-pointer hover:bg-gray-700 py-1 rounded" @click="onFolderToggle"
      :class="{ folder: isFolder, expanded: isExpanded }">
      <div>
        <span v-if="isFolder">
          {{ isExpanded ? "📂" : "📁" }}
        </span>
        <span v-else>📄</span>
        {{ node.name }}
      </div>
      <div class="flex gap-4">
        <button v-if="isFolder" class="bg-yellow-900 px-4 rounded text-black-700" @click.stop="addFile">
          Add file
        </button>
        <button v-if="isFolder" class="bg-green-900 px-4 rounded text-black-700" @click.stop="addFolder">
          Add Folder
        </button>
        <button class="bg-red-900 px-4 rounded text-black-700" @click.stop="removeFileOrFolder">
          Delete
        </button>
      </div>
    </div>

    <div v-if="isFolder && isExpanded">
      <FileExplorerNode v-for="child in node.children" :key="child.id" :node="child" :expandedNodes="expandedNodes"
        :level="level + 1" @remove-node="emit('remove-node', $event)" @add-node="emit('add-node', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileNode } from "@/types";
import { computed } from "vue";

const emit = defineEmits(["toggle-folder", "remove-node", "add-node"]);

const props = defineProps({
  node: {
    type: Object as () => FileNode,
    required: true,
  },
  expandedNodes: {
    type: Array as () => string[],
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
});

const isExpanded = computed(() => props.expandedNodes.includes(props.node.id));
const isFolder = computed(() => props.node.isFile === false);

const onFolderToggle = () => {
  if (isFolder.value) {
    const index = props.expandedNodes.indexOf(props.node.id);
    if (index > -1) {
      props.expandedNodes.splice(index, 1);
    } else {
      props.expandedNodes.push(props.node.id);
    }
  }
};

const addFile = () => addNode(true);
const addFolder = () => addNode(false);

const addNode = (isFile: boolean) => {
  emit("add-node", {
    isFile,
    parentId: props.node.id,
  });
};

const removeFileOrFolder = () => {
  emit("remove-node", props.node.id);
};
</script>
