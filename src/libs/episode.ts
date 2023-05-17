import * as vscode from "vscode";
import Listen from "../listen";
import LocalStorageService from "../services/localStorageService";
import { PodcastType } from "../types/podcast";
import { EpisodeType } from "../types/episode";

export default class Podcast {

    private listen: Listen;
    private localStorageService: LocalStorageService;

    public constructor(listen: Listen) {
        this.listen = listen;
        this.localStorageService = new LocalStorageService(this.listen.context.globalState);
    }

    public markAsRead(currentEpisode: EpisodeType) {

        const storedData: Record<string, PodcastType> = this.localStorageService.get("podcasts");

        for (const podcast in storedData) {
            for (const episode in storedData[podcast].episodes) {
                if (storedData[podcast].episodes[episode].url === currentEpisode.url) {
                    storedData[podcast].episodes[episode].new = false;
                }
            }
        }

        this.localStorageService.set("podcasts", storedData);
        this.listen.libraryProvider.refresh();
    }

    public findByUrl(url: string): EpisodeType|null {

        const storedData: Record<string, PodcastType> = this.localStorageService.get("podcasts");

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
