import * as vscode from "vscode";
import Listen from "../listen";
import fetch from "node-fetch";
import Database from "../services/database";
import { XMLParser } from "fast-xml-parser";
import { PodcastType } from "../types/podcast";
import { EpisodeType } from "../types/episode";

export default class Podcast {

    private listen: Listen;
    private database: Database;

    constructor(listen: Listen) {
        this.listen = listen;
        this.database = new Database(this.listen.context);
    }

    public openDialog = async () => {

        const feed = await vscode.window.showInputBox({
            placeHolder: "Enter the URL of the podcast feed",
            prompt: "The URL must be a valid RSS or Atom feed",
            validateInput: (feed: string) => {
                try {
                    new URL(feed);
                    return "";
                } catch (error) {
                    return "The URL must be a valid URL";
                }
            }
        });

        if (feed && feed.length) {
            await this.add(feed);
        }
    };

    public add = async (feed: string) => {

        let podcasts: Record<string, PodcastType> = {};
        let content;

        try {

            content = await this.getFeed(feed);
            if (!content) {
                return;
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Invalid URL ${feed}`);
            return;
        }

        podcasts = this.database.get("podcasts") || {};
        if (podcasts && podcasts.hasOwnProperty(feed)) {
            vscode.window.showErrorMessage(`The podcast ${feed} is already in the library.`);
            return;
        }

        podcasts[feed] = <PodcastType> {
            label: content.rss.channel.title,
            description: content.rss.channel.description,
            link: content.rss.channel.link,
            feed: feed,
            thumbnail: this.getThumbnailUrl(content),
            episodes: <Record<string, EpisodeType>> {}
        };

        podcasts = this.orderByName(podcasts);

        this.database.set("podcasts", podcasts);
        this.listen.libraryProvider.refresh();
        this.addEpisodes(feed, content);

        vscode.window.showInformationMessage(`The podcast ${content.rss.channel.title} was successfully added.`);
        this.listen.libraryProvider.refresh();
    };

    public update = async (podcast: PodcastType) => {
        const content = await this.getFeed(podcast.feed);
        this.addEpisodes(podcast.feed, content);
        this.listen.libraryProvider.refresh();
    };

    public updateAll = async () => {

        const podcasts = <Record<string, PodcastType>> this.database.get("podcasts") || {};
        for (const podcast in podcasts) {
            this.update(podcasts[podcast]);
        }

        this.listen.libraryProvider.refresh();
    };

    public remove = async (podcastItem: PodcastType): Promise<void> => {

        const podcasts = <Record<string, PodcastType>> this.database.get("podcasts") || {};
        delete podcasts[podcastItem.feed];

        this.database.set("podcasts", podcasts);

        vscode.window.showInformationMessage(`The podcast ${podcastItem.label} was successfully removed.`);
        this.listen.libraryProvider.refresh();
    };

    public markAsRead = (podcastItem: PodcastType) => {

        const storedData: Record<string, PodcastType> = this.database.get("podcasts");
        const podcast = storedData[podcastItem.feed];

        if (!podcast || !podcast.episodes.length) {
            return;
        }

        for (const episode in podcast.episodes) {
            this.listen.episode.markAsRead(podcast.episodes[episode]);
        }

        this.database.set("podcasts", storedData);
        this.listen.libraryProvider.refresh();
    };

    private getFeed = async (feed: string): Promise<Record<string, any>|null> => {

        const url = new URL(feed);
        const response = await fetch(url.href);

        if (response.status !== 200) {
            vscode.window.showErrorMessage(`The server responded with HTTP status ${response.status}`);
            return null;
        }

        const options = {
            attributeNamePrefix : "@_",
            attrNodeName: "attr",
            textNodeName : "text",
            ignoreAttributes : false,
            ignoreNameSpace : false,
            allowBooleanAttributes : true,
            parseNodeValue : true,
            parseAttributeValue : false,
            trimValues: true,
            cdataTagName: "__cdata",
            cdataPositionChar: "\\c",
            parseTrueNumberOnly: false,
            arrayMode: false
        };

        const parser = new XMLParser(options);
        const content = parser.parse(await response.text());

        if (!content.rss) {
            vscode.window.showErrorMessage(`The URL ${feed} is not a valid RSS feed`);
            return null;
        }

        return content;
    };

    private getThumbnailUrl = (content: Record<string, any>): string => {

        if (Array.isArray(content.rss.channel.image)) {
            return content.rss.channel.image[0].url;
        }

        return content.rss.channel.image.url;
    };

    private addEpisodes = (feed: string, content: Record<string, any>|null|undefined): void => {

        if (!content) {
            return;
        }

        const storedData: Record<string, PodcastType> = this.database.get("podcasts");
        if (!storedData || !storedData.hasOwnProperty(feed)) {
            return;
        }

        const episodes = storedData[feed].episodes;
        let newEpisodes: Record<string, EpisodeType> = {};

        for (const newEpisode in content.rss.channel.item) {
            newEpisodes = this.appendEpisode(newEpisodes, content.rss.channel.item[newEpisode]);
        }

        const parsedEpisodes: Record<string, EpisodeType> = {...newEpisodes, ...episodes};
        storedData[feed].episodes = parsedEpisodes;
        this.database.set("podcasts", storedData);
    };

    private appendEpisode = (episodes: Record<string, EpisodeType>, episode: Record<string, any>): Record<string, EpisodeType> => {

        if (episode.guid in episodes) {
            return episodes;
        }

        if (!episode.enclosure?.hasOwnProperty("@_url")) {
            return episodes;
        }

        const guid = episode.guid?.text || episode.link;
        episodes[guid] = <EpisodeType> {
            guid: guid,
            title: episode.title,
            description: episode.description,
            link: episode.link,
            pubDate: episode.pubDate,
            duration: episode["itunes:duration"],
            url: episode.enclosure["@_url"],
            length: episode.enclosure["@_length"],
            new: true
        };

        return episodes;
    };

    private orderByName = (podcasts: Record<string, PodcastType>): Record<string, PodcastType> => {

        const podcastArray: PodcastType[] = [];
        for (const podcast in podcasts) {
            podcastArray.push(podcasts[podcast]);
        }

        podcastArray.sort((a, b) => {
            const nameA = a.label.toUpperCase();
            const nameB = b.label.toUpperCase();
            return (nameA < nameB) ? -1 : ((nameA > nameB) ? 1 : 0);
        });

        podcasts = {};
        for (const podcast of podcastArray) {
            podcasts[podcast.feed] = podcast;
        }

        return podcasts;
    };
}
