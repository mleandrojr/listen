import Listen from "../listen";
import Database from "../services/database";
import { ContentTreeItem } from "./treeItem";
import { QueueType } from "../types/queue";

export default class Queue {

    private listen: Listen;
    private database: Database;
    private selectedItem?: ContentTreeItem;
    private isDoubleClick: boolean = false;

    constructor(listen: Listen) {
        this.listen = listen;
        this.database = new Database(this.listen.context);
    }

    previous = async () => {

        const queue = this.database.get("queue") || [];

        let idx = null;
        for (let i = 0, length = queue.length; i < length; i++) {
            if (queue[i].url === this.selectedItem?.url) {
                idx = --i;
                break;
            }
        }

        if (idx === null || idx < 0 || !queue[idx]) {
            return;
        }

        const media: QueueType = {
            url: queue[idx].url!,
            label: queue[idx].label,
            description: queue[idx].description
        };

        this.play(media, true);
    };

    play = async (item: QueueType, ignoreDoubleClick?: Boolean) => {

        if (!ignoreDoubleClick && !this.isDoubleClick) {

            this.isDoubleClick = true;
            setTimeout(() => {
                this.isDoubleClick = false;
            }, 300);

            return;
        }

        this.selectedItem = item;
        this.listen.player.play(item);
        this.listen.queueProvider.refresh();
        return;
    };

    stop = async () => {
        this.listen.player.stop();
        this.selectedItem = undefined;
    };

    next = async () => {

        const queue = this.database.get("queue") || [];

        let idx = null;
        for (let i = 0, length = queue.length; i < length; i++) {
            if (queue[i].url === this.selectedItem?.url) {
                idx = ++i;
                break;
            }
        }

        if (idx === null || !queue[idx]) {
            return;
        }

        const media: QueueType = {
            url: queue[idx].url!,
            label: queue[idx].label,
            description: queue[idx].description
        };

        this.play(media, true);
    };

    remove = async (item: QueueType) => {

        const items: QueueType[] = this.database.get("queue") || [];

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

        this.database.set("queue", items);
        this.listen.queueProvider.refresh();
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
