import * as vscode from "vscode";
import Listen from "../listen";
import { ContentTreeItem, QueueTreeItem } from "../libs/treeItem";
import { QueueType } from "../types/queue";

export default class QueueProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    public onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void>;
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void>;
    private listen: Listen;
    private data: QueueTreeItem[] = [];

    constructor(listen: Listen) {
        this.listen = listen;
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
    };

    play = (item: QueueTreeItem) => {
        this.listen.queue.play(<QueueType> {
            label: item.description,
            url: item.url,
            description: item.description
        });
    };

    remove = (treeItem: QueueTreeItem) => {

        const item: QueueType = {
            label: treeItem.label,
            url: treeItem.url!,
            description: treeItem.description
        };

        this.listen.queue.remove(item);
    };

    next = () => {
        this.listen.queue.next();
    };
}
