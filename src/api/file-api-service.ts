import { filePathsToTree } from "../helper/fileNodeHelper";
import { FileNode } from "@/types";
import axios from "axios";

interface ApiResponse {
    name: string;
    filepaths: string[];
}

export const fetchData = async (shouldResetData = false): Promise<FileNode> => {
    const savedData = getSavedDataFromLocalStorage();

    if (savedData && !shouldResetData) {
        console.log("Using saved data from localStorage");
        return savedData;
    }

    try {
        const response = await axios
            .get<ApiResponse>(
                "https://ab-file-explorer.athleticnext.workers.dev/?file=regular"
            )
            .then((res) => res.data);

        const dataThree = filePathsToTree(response.filepaths);
        localStorage.setItem("fileExplorerData", JSON.stringify(dataThree));

        return dataThree;
    } catch (err) {
        throw new Error("Failed to fetch data from API");
    }
};

const getSavedDataFromLocalStorage = (): FileNode | null => {
    const savedData = localStorage.getItem("fileExplorerData");
    if (savedData) {
        return JSON.parse(savedData);
    }

    return null;
};
