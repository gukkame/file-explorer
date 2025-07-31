<template>
	<div class="flex flex-wrap flex-col pt-20 px-54">
		<h1 class="text-3xl text-center font-bold mb-4">File Explorer</h1>
		<br />
		<div v-if="isLoading" class="loading">Loading...</div>
		<div v-else-if="error" class="error">{{ error }}</div>
		<div v-if="state">
			<FileExplorerNode
				v-for="child in state.children"
				:key="child.id"
				:node="child"
				:expandedNodes="expandedNodes" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import FileExplorerNode from "./FileExplorerNode.vue";
import { FileNode } from "@/types";

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

// Converts file paths to tree structure
const filePathsToTree = (filePaths: string[]): FileNode => {
	const root: FileNode = {
		id: uuidv4(),
		name: "root",
		isFile: false,
		children: [],
	};

	filePaths.forEach((path) => {
		const parts = path.split("/");
		let current = root;

		// Create intermediate folders
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			let existing = (current.children ?? []).find(
				(child: { isFile: boolean; name: string }) =>
					child.isFile === false && child.name === part
			);

			if (!existing) {
				existing = {
					id: uuidv4(),
					name: part,
					isFile: false,
					children: [],
				};
				current.children?.push(existing);
			}
			current = existing;
		}

		const fileName = parts[parts.length - 1];
		current.children?.push({
			id: uuidv4(),
			name: fileName,
			isFile: true,
		});
	});

	return root;
};

const findNode = (
	node: FileNode,
	id: string
): [FileNode | null, FileNode[]] => {
	if (node.id === id) return [node, []];

	if (node.isFile === false && node.children) {
		for (const child of node.children) {
			const [found, path] = findNode(child, id);
			if (found) return [found, [...path, node]];
		}
	}

	return [null, []];
};
</script>