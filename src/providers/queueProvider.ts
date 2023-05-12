import * as vscode from "vscode";
import { QueueTreeItem } from "../lib/treeItem";

export default class QueueProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    public onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void>;
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void>;
    private data: QueueTreeItem[];

    constructor(data: QueueTreeItem[]) {
        this.data = data;
        this._onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh(data: QueueTreeItem[]): void {
        this.data = data;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: QueueTreeItem): QueueTreeItem {
        return element;
    }

    getChildren(element?: QueueTreeItem|undefined): Promise<QueueTreeItem[]> {
        if (typeof element === "undefined") {
            return Promise.resolve(this.data);
        }

        return Promise.resolve([]);
    }
}
