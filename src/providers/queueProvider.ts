import * as vscode from "vscode";
import Listen from "../listen";
import LocalStorageService from "../services/localStorageService";
import { ContentTreeItem, QueueTreeItem } from "../libs/treeItem";
import { QueueType } from "../types/queue";

export default class QueueProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    public onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void>;
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void>;
    private listen: Listen;
    private data: QueueTreeItem[] = [];
    private isDoubleClick: boolean = false;
    private localStorageService: LocalStorageService;

    constructor(listen: Listen) {
        this.listen = listen;
        this.localStorageService = new LocalStorageService(this.listen.context.globalState);
        this._onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.refresh();
    }

    refresh(): void {

        const items: Array<Record<string, string>> = this.localStorageService.get("queue") || [];
        const data = [];

        for (const item of items) {
            data.push(new QueueTreeItem(item.url, item.label, item.description));
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

        const queue: Array<QueueType> = this.localStorageService.get("queue") || [];
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
        this.localStorageService.set("queue", queue);

        if (queue.length === 1) {
            this.listen.player.play(<QueueType> {
                url: treeviewItem.url,
                label: treeviewItem.description
            });
        }

        this.refresh();
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
