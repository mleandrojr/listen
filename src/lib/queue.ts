import * as vscode from "vscode";
import { ContentTreeItem, QueueTreeItem } from "./treeItem";
import { QueueType } from "../types/queue";

export default class Queue {

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    init(): QueueTreeItem[] {
        const items: Array<Record<string, string>> = this.context.globalState.get("queue") || [];
        const data = [];

        for (const item of items) {
            data.push(new QueueTreeItem(item.url, item.label, item.description));
        }

        return data;
    };

    add = async (content: ContentTreeItem) => {

        if (!content.hasOwnProperty("url")) {
            return;
        }

        const queue: Array<QueueType> = this.context.globalState.get("queue") || [];

        for (const item of queue) {
            if (item.url === content.url) {
                return;
            }
        }

        const treeviewItem = <QueueType> {
            url: content.url,
            label: content.label || "",
            description: content.description || "",
        };

        queue.push(treeviewItem);
        this.context.globalState.update("queue", queue);
    };

    remove = async (item: QueueTreeItem) => {

        const items: QueueTreeItem[] = this.context.globalState.get("queue") || [];

        let idx = null;
        for (let i = 0, length = items.length; i < length; i++) {
            if (items[i].url === item.url) {
                idx = i;
                break;
            }
        }

        if (idx !== null) {
            items.splice(idx, 1);
        }

        this.context.globalState.update("queue", items);
    };
}
