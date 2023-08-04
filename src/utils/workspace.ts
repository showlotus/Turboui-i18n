import * as vscode from "vscode";
import { config } from "./config";

/**
 * 读取当前文件夹下的所有 i18n 文件夹下的 JSON 文件
 */
export function loadConfigJSON(data: Record<string, any>, callback: Function) {
  const dirName = config.dirName;
  const { workspaceFolders } = vscode.workspace;
  const { fs } = vscode.workspace;
  const getJSON = (folder: string, isTargetDir = false) => {
    fs.readDirectory(vscode.Uri.file(folder)).then((files) => {
      files.forEach((file) => {
        const [fileName, fileType] = file;
        if (fileType === vscode.FileType.Directory) {
          getJSON(`${folder}/${fileName}`, fileName === dirName);
        } else if (isTargetDir && fileName.endsWith(".json")) {
          const filePath = `${folder}/${fileName}`;
          fs.readFile(vscode.Uri.file(filePath)).then((content) => {
            const fileContent = Buffer.from(content).toString();
            const fileContentObj = JSON.parse(fileContent);
            Object.assign(data, fileContentObj);
            if (!Object.keys(data).length) {
              return;
            }
            callback();
          });
        }
      });
    });
  };

  if (workspaceFolders) {
    const currentFolder = workspaceFolders[0].uri;
    const path = currentFolder.path;
    getJSON(path);
  }
}