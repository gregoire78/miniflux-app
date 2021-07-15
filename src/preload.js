import {
    contextBridge,
    ipcRenderer,
    shell
} from "electron";

contextBridge.exposeInMainWorld(
    "api", {
        ipcRenderer,
        shell,
        isOpen: async () => {
            return await ipcRenderer.invoke('isOpen');
        }
    }
);