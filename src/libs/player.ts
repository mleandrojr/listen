import * as vscode from "vscode";
import PlayerProvider from "../providers/playerProviders";
import Queue from "./queue";
import { QueueType } from "../types/queue";
import { QueueTreeItem } from "./treeItem";

export default class Player {

    private queue: Queue;
    private context: vscode.ExtensionContext;
    private provider: PlayerProvider;
    private currentMedia?: QueueType;

    constructor(queue: Queue, context: vscode.ExtensionContext, provider: PlayerProvider) {
        this.queue = queue;
        this.context = context;
        this.provider = provider;
    }

    public play = async (item: QueueTreeItem) => {

        const media: QueueType = {
            url: item.url!,
            label: item.label,
            description: item.description
        };

        if (media.url === this.currentMedia?.url) {
            return;
        }

        this.currentMedia = media;
        this.provider.postMessage({ command: "changeMedia", media: media });
        this.provider.onDidReceiveMessage(this.onDidReceiveMessage);
    };

    public next = () => {
        this.queue.next();
    };

    public onDidReceiveMessage = (e: any) => {

        switch (e.command) {
            case "next":
                this.next();
                break;
        }
    };
}
