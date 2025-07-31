<template>
	<div
		:style="{
			color: `hsl(${level * 40}, 70%, 45%)`,
			paddingLeft: `${level * 20}px`,
		}">
		<div
			class="hover:cursor-pointer hover:bg-gray-700 py-1 rounded"
			@click="onFolderToggle"
			:class="{ folder: isFolder, expanded: isExpanded }">
			<span v-if="isFolder">
				{{ isExpanded ? "📂" : "📁" }}
			</span>
			<span v-else>📄</span>
			{{ node.name }}
		</div>
		<div v-if="isFolder && isExpanded">
			<FileExplorerNode
				v-for="child in node.children"
				:key="child.id"
				:node="child"
				:expandedNodes="expandedNodes"
				:level="level + 1" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { FileNode } from "@/types";
import { computed } from "vue";

const emit = defineEmits(["toggle-folder"]);

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
</script>
