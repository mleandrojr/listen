import * as vscode from "vscode";
import Listen from "../listen";
import PlayerProvider from "../providers/playerProviders";
import Player from "./player";
import LocalStorageService from "../services/localStorageService";
import { ContentTreeItem, QueueTreeItem } from "./treeItem";
import { QueueType } from "../types/queue";

export default class Queue {

    private listen: Listen;
    private localStorageService: LocalStorageService;
    private selectedItem?: ContentTreeItem;
    private isDoubleClick: boolean = false;

    constructor(listen: Listen) {
        this.listen = listen;
        this.localStorageService = new LocalStorageService(this.listen.context.globalState);
        this.refresh();
    }

    refresh = () => {

        const items: Array<Record<string, string>> = this.localStorageService.get("queue") || [];
        const data = [];

        for (const item of items) {
            data.push(new QueueTreeItem(item.url, item.label, item.description));
        }

        this.listen.queueProvider.refresh(data);
    };

    play = async (item: QueueTreeItem) => {

        if (!this.isDoubleClick) {

            this.isDoubleClick = true;
            setTimeout(() => {
                this.isDoubleClick = false;
            }, 300);

            return;
        }

        this.selectedItem = item;
        this.listen.player.play(item);
        return;
    };

    next = async () => {

        const queue = this.localStorageService.get("queue") || [];

        let idx = null;
        for (let i = 0, length = queue.length; i < length; i++) {
            if (queue[i].url === this.selectedItem?.url) {
                idx = ++i;
                break;
            }
        }

        if (!idx || !queue[idx]) {
            return;
        }

        const queueItem = new QueueTreeItem(queue[idx].url, queue[idx].label, queue[idx].description);
        this.listen.player.play(queueItem);
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
            label: content.label || "",
            description: content.description || "",
        };

        queue.push(treeviewItem);
        this.localStorageService.set("queue", queue);

        if (queue.length === 1) {
            this.listen.player.play(
                new QueueTreeItem(treeviewItem.url || "", treeviewItem.label || "", treeviewItem.description)
            );
        }

        this.refresh();
    };

    remove = async (item: QueueTreeItem) => {

        const items: QueueTreeItem[] = this.localStorageService.get("queue") || [];

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

        this.localStorageService.set("queue", items);
        this.refresh();
    };

    evaluateClick = (e: Record<string, any>) => {

        if (typeof e === "undefined") {
            this.selectedItem = undefined;
            return;
        }

        if (e.selection.length > 1) {
            return;
        }

        const selection = e.selection[0];
        this.selectedItem = selection;
    };
}