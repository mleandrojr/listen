import Listen from "../listen";
import Database from "../services/database";
import { PodcastType } from "../types/podcast";
import { EpisodeType } from "../types/episode";

export default class Podcast {

    private listen: Listen;
    private database: Database;

    public constructor(listen: Listen) {
        this.listen = listen;
        this.database = new Database(this.listen.context);
    }

    public markAsRead(currentEpisode: EpisodeType) {

        const storedData: Record<string, PodcastType> = this.database.get("podcasts");

        for (const podcast in storedData) {
            for (const episode in storedData[podcast].episodes) {
                if (storedData[podcast].episodes[episode].url === currentEpisode.url) {
                    storedData[podcast].episodes[episode].new = false;
                }
            }
        }

        this.database.set("podcasts", storedData);
        this.listen.libraryProvider.refresh();
    }

    public findByUrl(url: string): EpisodeType|null {

        const storedData: Record<string, PodcastType> = this.database.get("podcasts");

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
