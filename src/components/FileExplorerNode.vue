<template>
	<div
		:style="{
			color: `hsl(${level * 40}, 70%, 45%)`,
			paddingLeft: `${level * 20}px`,
		}">
		<div
			class="flex justify-between hover:cursor-pointer hover:bg-gray-700 py-1 rounded"
			@click="onFolderToggle"
			:class="{ folder: isFolder, expanded: isExpanded }">
			<div>
				<span v-if="isFolder">
					{{ isExpanded ? "📂" : "📁" }}
				</span>
				<span v-else>📄</span>
				{{ node.name }}
			</div>
			<button
				class="bg-red-900 px-4 rounded text-black-700"
				@click="removeFile">
				Remove file
			</button>
		</div>

		<div v-if="isFolder && isExpanded">
			<FileExplorerNode
				v-for="child in node.children"
				:key="child.id"
				:node="child"
				:expandedNodes="expandedNodes"
				:level="level + 1"
				@remove-node="emit('remove-node', $event)" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { FileNode } from "@/types";
import { computed } from "vue";

const emit = defineEmits(["toggle-folder", "remove-node"]);

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

const removeFile = () => {
	emit("remove-node", props.node.id);
};
</script>
