import * as vscode from "vscode";
import Listen from "../listen";
import Storage from "../services/storage";
import { PodcastType } from "../types/podcast";
import { EpisodeType } from "../types/episode";

export default class Podcast {

    private listen: Listen;
    private storage: Storage;

    public constructor(listen: Listen) {
        this.listen = listen;
        this.storage = new Storage(this.listen.context);
    }

    public markAsRead(currentEpisode: EpisodeType) {

        const storedData: Record<string, PodcastType> = this.storage.get("podcasts");

        for (const podcast in storedData) {
            for (const episode in storedData[podcast].episodes) {
                if (storedData[podcast].episodes[episode].url === currentEpisode.url) {
                    storedData[podcast].episodes[episode].new = false;
                }
            }
        }

        this.storage.set("podcasts", storedData);
        this.listen.libraryProvider.refresh();
    }

    public findByUrl(url: string): EpisodeType|null {

        const storedData: Record<string, PodcastType> = this.storage.get("podcasts");

        for (const podcast in storedData) {
            for (const episode in storedData[podcast].episodes) {
                if (storedData[podcast].episodes[episode].url === url) {
                    return <EpisodeType> storedData[podcast].episodes[episode];
                }
            }
        }

        return null;
    }
}
