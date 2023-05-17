import * as vscode from "vscode";
import Listen from "../listen";
import LocalStorageService from "../services/localStorageService";
import { QueueType } from "../types/queue";

export default class Player {

    private listen: Listen;
    private currentMedia?: QueueType;

    constructor(listen: Listen) {
        this.listen = listen;
    }

    public play = async (media: QueueType) => {

        if (media.url === this.currentMedia?.url) {
            return;
        }

        console.log(media);
        this.currentMedia = media;
        this.listen.playerProvider.onDidReceiveMessage(this.onDidReceiveMessage);
        this.listen.playerProvider.postMessage({ command: "changeMedia", media: media });
    };


    public onDidReceiveMessage = (e: any) => {
        if (this.commands.hasOwnProperty(e.command)) {
            this.commands[e.command](e);
        }
    };

    public commands: Record<string, Function> = {

        playing: (e: any) => {
            const episode = this.listen.episode.findByUrl(e.media);
            if (episode) {
                this.listen.episode.markAsRead(episode);
            }
        },

        next: () => {
            this.listen.queue.next();
        },
    };
}
