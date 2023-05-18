import * as vscode from "vscode";
import Listen from "../listen";
import Storage from "../services/storage";
import { ContentTreeItem, QueueTreeItem } from "../libs/treeItem";
import { QueueType } from "../types/queue";

export default class QueueProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    public onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void>;
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void>;
    private listen: Listen;
    private data: QueueTreeItem[] = [];
    private isDoubleClick: boolean = false;
    private storage: Storage;

    constructor(listen: Listen) {
        this.listen = listen;
        this.storage = new Storage(this.listen.context);
        this._onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.refresh();
    }

    refresh(): void {

        const items: Array<Record<string, string>> = this.storage.get("queue") || [];
        const data = [];

        for (const item of items) {

            const label = item.url === this.listen.player.currentMedia?.url ? item.description : item.label;
            const description = item.url === this.listen.player.currentMedia?.url ? item.label : item.description;

            data.push(new QueueTreeItem(item.url, label, description));
        }

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

    add = async (content: ContentTreeItem) => {

        if (!this.isDoubleClick) {

            this.isDoubleClick = true;
            setTimeout(() => {
                this.isDoubleClick = false;
            }, 300);

            return;
        }

        if (!content.hasOwnProperty("url")) {
            return;
        }

        const queue: Array<QueueType> = this.storage.get("queue") || [];
        for (const item of queue) {
            if (item.url === content.url) {
                return;
            }
        }

        const treeviewItem = <QueueType> {
            url: content.url,
            label: "",
            description: content.label || content.description || "",
        };

        queue.push(treeviewItem);
        this.storage.set("queue", queue);

        if (queue.length === 1) {
            this.listen.player.play(<QueueType> {
                url: treeviewItem.url,
                label: treeviewItem.description
            });
        }

        this.refresh();
    };

    play = (item: QueueTreeItem) => {

        const media: QueueType = {
            label: item.description,
            url: item.url!,
            description: item.description
        };

        this.listen.queue.play(media);
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

    clear = () => {
        this.storage.set("queue", []);
        this.refresh();
    }
}
