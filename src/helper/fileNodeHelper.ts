import { FileNode } from "@/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Converts an array of file paths into a tree structure of FileNode
 * Each path is split by '/' to create folders and files
 */
export const filePathsToTree = (filePaths: string[]): FileNode => {
    const root: FileNode = {
        id: uuidv4(),
        name: "root",
        isFile: false,
        children: [],
    };

    filePaths.forEach((path) => {
        const pathSegments = path.split("/");
        let currentLocation  = root;

        // Create intermediate folders
        for (let i = 0; i < pathSegments.length - 1; i++) {
            const folderName = pathSegments[i];

            let targetFolder = (currentLocation.children).find(
                (childNode: { isFile: boolean; name: string }) =>
                    !childNode.isFile && childNode.name === folderName
            );

            if (!targetFolder) {
                targetFolder = {
                    id: uuidv4(),
                    name: folderName,
                    isFile: false,
                    children: [],
                };
                currentLocation.children.push(targetFolder);
            }
            currentLocation = targetFolder;
        }

        const fileName = pathSegments[pathSegments.length - 1];
        currentLocation.children.push({
            id: uuidv4(),
            name: fileName,
            isFile: true,
            children: [],
        });
    });

    return root;
};

/**
 * Finds a node by its ID in the file tree and returns the node along with its path
 */
export const findNodeById = (
    node: FileNode,
    id: string
): [FileNode | null, FileNode[]] => {
    if (node.id === id) {
        return [node, []];
    }

    if (!node.isFile && node.children) {
        for (const child of node.children) {
            const [found, path] = findNodeById(child, id);
            if (found) {
                return [found, [node, ...path]];
            }
        }
    }

    return [null, []];
};

