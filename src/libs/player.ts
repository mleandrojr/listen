import Listen from "../listen";
import { QueueType } from "../types/queue";

export default class Player {

    public currentMedia?: QueueType;
    private listen: Listen;

    constructor(listen: Listen) {
        this.listen = listen;
    }

    public play = async (media: QueueType) => {

        if (media.url === this.currentMedia?.url) {
            return;
        }

        this.currentMedia = media;
        this.listen.playerProvider.postMessage({ command: "changeMedia", media: media });
    };

    public stop = async () => {
        this.currentMedia = undefined;
        this.listen.playerProvider.postMessage({ command: "stop" });
    };
}
