<template>
	<div class="flex flex-wrap flex-col sm:pt-20 p-2 md:px-54">
		<h1 class="text-3xl text-center font-bold mb-4">File Explorer</h1>
		<br />
		<h2 v-if="isLoading" class="text-center text-xl">Loading...</h2>
		<h2 v-else-if="error" class="text-center text-xl text-red-500">
			{{ error }}
		</h2>
		<div v-if="rootNode" class="flex justify-between m-4">
			<button
				class="bg-green-900 px-4 rounded text-black-700 w-40 items-center mb-4 p-2"
				@click="getApiData(true)">
				Reset Data
			</button>
			<button
				class="bg-green-900 px-4 rounded text-black-700 w-40 items-center mb-4 p-2"
				@click="addNode({ isFile: false, parentId: rootNode.id })">
				Add Folder
			</button>
			<button
				class="bg-green-900 px-4 rounded text-black-700 w-40 items-center mb-4 p-2"
				@click="addNode({ isFile: true, parentId: rootNode.id })">
				Add File
			</button>
		</div>

		<div v-if="rootNode">
			<FileExplorerNode
				v-for="child in rootNode.children"
				:key="child.id"
				:node="child"
				:expandedNodes="expandedNodes"
				@remove-node="removeNode($event)"
				@add-node="addNode($event)" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FileExplorerNode from "./FileExplorerNode.vue";
import { FileNode } from "../types/index";
import { findNodeById } from "../helper/fileNodeHelper";
import { fetchData } from "../api/file-api-service";

const rootNode = ref<FileNode | null>(null);
const expandedNodes = ref<string[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const getApiData = async (shouldResetData = false) => {
	fetchData(shouldResetData)
		.then((data) => {
			rootNode.value = data;
			isLoading.value = false;
		})
		.catch((err) => {
			error.value = "Failed to fetch data: " + err.message;
			isLoading.value = false;
		});
};

onMounted(getApiData);

const addNode = ({
	isFile,
	parentId,
}: {
	isFile: boolean;
	parentId: string;
}) => {
	const newItem: FileNode = {
		id: Date.now().toString(),
		name:
			(isFile ? "New File " : "New Folder ") +
			new Date().toLocaleTimeString(),
		isFile: isFile,
		children: [],
	};

	if (!rootNode.value) return;

	const [parentNode] = findNodeById(rootNode.value, parentId);

	if (
		parentNode &&
		parentNode.children &&
		!parentNode.children.some((child) => child.name === newItem.name)
	) {
		parentNode.children.push(newItem);
		localStorage.setItem(
			"fileExplorerData",
			JSON.stringify(rootNode.value)
		);
	}
};

const removeNode = (id: string) => {
	if (!rootNode.value) return;

	const [node, path] = findNodeById(rootNode.value, id);
	if (!node || !path.length) return;

	const parent = path[path.length - 1];
	if (!parent.children) return;

	parent.children = parent.children.filter((child) => child.id !== id);

	localStorage.setItem("fileExplorerData", JSON.stringify(rootNode.value));
};
</script>
