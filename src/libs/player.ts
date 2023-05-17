import * as vscode from "vscode";
import Listen from "../listen";
import LocalStorageService from "../services/localStorageService";
import { QueueType } from "../types/queue";
import { QueueTreeItem } from "./treeItem";
import { PodcastType } from "../types/podcast";

export default class Player {

    private listen: Listen;
    private currentMedia?: QueueType;
    private localStorageService: LocalStorageService;

    constructor(listen: Listen) {
        this.listen = listen;
        this.localStorageService = new LocalStorageService(this.listen.context.globalState);
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
        this.listen.playerProvider.onDidReceiveMessage(this.onDidReceiveMessage);
        this.listen.playerProvider.postMessage({ command: "changeMedia", media: media });
    };

    public next = () => {

    };

    public onDidReceiveMessage = (e: any) => {
        if (this.commands.hasOwnProperty(e.command)) {
            this.commands[e.command](e);
        }
    };

    public commands: Record<string, Function> = {

        playing: (e: any) => {
            if (e.media) {
                this.setItemAsRead(e.media);
            }
        },

        next: () => {
            this.listen.queue.next();
        },
    };

    private setItemAsRead = (media: string) => {

        const storedData: Record<string, PodcastType> = this.localStorageService.get("podcasts");
        for (const podcast in storedData) {
            for (const episode in storedData[podcast].episodes) {
                if (storedData[podcast].episodes[episode].url === media) {
                    storedData[podcast].episodes[episode].new = false;
                }
            }
        }

        this.localStorageService.set("podcasts", storedData);
        this.listen.library.refresh();
    }
}