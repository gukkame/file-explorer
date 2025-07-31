export interface FileNode {
	id: string;
	name: string;
	isFile: boolean;
	children: FileNode[];
}