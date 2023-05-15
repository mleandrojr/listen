import * as vscode from "vscode";
import QueueProvider from "../providers/queueProvider";
import PlayerProvider from "../providers/playerProviders";
import Player from "../lib/player";
import { ContentTreeItem, QueueTreeItem } from "./treeItem";
import { QueueType } from "../types/queue";

export default class Queue {

    private context: vscode.ExtensionContext;
    private provider: QueueProvider;
    private player: Player;

    constructor(context: vscode.ExtensionContext, provider: QueueProvider) {
        this.context = context;
        this.provider = provider;

        const playerProvider = new PlayerProvider(context);
        this.player = new Player(context, playerProvider);

        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider("listenPlayer", playerProvider)
        );

        this.refresh();
    }

    refresh = () => {

        const items: Array<Record<string, string>> = this.context.globalState.get("queue") || [];
        const data = [];

        for (const item of items) {
            data.push(new QueueTreeItem(item.url, item.label, item.description));
        }

        this.provider.refresh(data);
    };

    play = async (item: QueueTreeItem) => {
        this.player.play(item);
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

        if (queue.length === 1) {
            this.player.play(
                new QueueTreeItem(treeviewItem.url || "", treeviewItem.label || "", treeviewItem.description)
            );
        }

        this.refresh();
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
        this.refresh();
    };
}
