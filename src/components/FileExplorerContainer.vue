<template>
	<div class="flex flex-wrap flex-col pt-20 px-54">
		<h1 class="text-3xl text-center font-bold mb-4">File Explorer</h1>
		<br />
		<h2 v-if="isLoading" class="text-center text-xl">Loading...</h2>
		<h2 v-else-if="error" class="text-center text-xl text-red-500">
			{{ error }}
		</h2>
		<div v-if="state">
			<FileExplorerNode
				v-for="child in state.children"
				:key="child.id"
				:node="child"
				:expandedNodes="expandedNodes"
				@remove-node="removeNode($event)" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import FileExplorerNode from "./FileExplorerNode.vue";
import { FileNode } from "../types/index";
import { filePathsToTree, findNode } from "../helper/fileNodeHelper";

interface ApiResponse {
	name: string;
	filepaths: string[];
}

const state = ref<FileNode | null>(null);
const expandedNodes = ref<string[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchData = async () => {
	const hasSavedData = setSavedDataFromLocalStorage();

	if (hasSavedData) {
		console.log("Is using saved data from localStorage");
		isLoading.value = false;

		return;
	}

	try {
		const response = await axios
			.get<ApiResponse>(
				"https://ab-file-explorer.athleticnext.workers.dev/?file=regular"
			)
			.then((res) => res.data);

		state.value = filePathsToTree(response.filepaths);
		localStorage.setItem("fileExplorerData", JSON.stringify(state.value));
	} catch (err) {
		error.value =
			err instanceof Error ? err.message : "Failed to fetch data";
	} finally {
		isLoading.value = false;
	}
};

onMounted(fetchData);

const setSavedDataFromLocalStorage = () => {
	const savedData = localStorage.getItem("fileExplorerData");
	if (savedData) {
		state.value = JSON.parse(savedData);
		return true;
	} else {
		state.value = null;
	}
	return false;
};

const removeNode = (id: string) => {
	if (!state.value) return;

	const [node, path] = findNode(state.value, id);

	if (!node || !path.length) return;

	const parent = path[path.length - 1];
	if (!parent.children) return;

	parent.children = parent.children.filter((child) => child.id !== id);
};
</script>
