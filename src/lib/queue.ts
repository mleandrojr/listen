import * as vscode from "vscode";
import { ContentTreeItem, QueueTreeItem } from "./treeItem";

export default class Queue {

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    init(): QueueTreeItem[] {
        const items: QueueTreeItem[] = this.context.globalState.get("queue") || [];
        return items;
    };

    add = async (item: ContentTreeItem) => {

        if (!item.hasOwnProperty("url")) {
            return;
        }

        const items: QueueTreeItem[] = this.context.globalState.get("queue") || [];

        for (const position of items) {
            if (position.url === item.url) {
                return;
            }
        }

        const treeviewItem = new QueueTreeItem(item.url || "", item.label || "");
        items.push(treeviewItem);
        this.context.globalState.update("queue", items);
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
