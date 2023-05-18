import * as vscode from "vscode";
import Listen from "../listen";
import fetch from "node-fetch";
import Storage from "../services/storage";
import { XMLParser } from "fast-xml-parser";
import { PodcastType } from "../types/podcast";
import { EpisodeType } from "../types/episode";

export default class Podcast {

    private listen: Listen;
    private storage: Storage;

    constructor(listen: Listen) {
        this.listen = listen;
        this.storage = new Storage(this.listen.context);
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

        podcasts = this.storage.get("podcasts") || {};
        if (podcasts && podcasts.hasOwnProperty(feed)) {
            vscode.window.showErrorMessage(`The podcast ${feed} is already in the library.`);
            return;
        }

        const thumbnailUrl = this.getThumbnailUrl(content);
        const thumbnail = await this.getThumbnail(thumbnailUrl);

        podcasts[feed] = <PodcastType> {
            label: content.rss.channel.title,
            description: content.rss.channel.description,
            link: content.rss.channel.link,
            feed: feed,
            thumbnail: thumbnail,
            episodes: <Record<string, EpisodeType>> {}
        };

        podcasts = this.orderByName(podcasts);

        this.storage.set("podcasts", podcasts);
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

        const podcasts = <Record<string, PodcastType>> this.storage.get("podcasts") || {};
        for (const podcast in podcasts) {
            this.update(podcasts[podcast]);
        }

        this.listen.libraryProvider.refresh();
    };

    public remove = async (podcastItem: PodcastType): Promise<void> => {

        const podcasts = <Record<string, PodcastType>> this.storage.get("podcasts") || {};
        delete podcasts[podcastItem.feed];

        this.storage.set("podcasts", podcasts);

        vscode.window.showInformationMessage(`The podcast ${podcastItem.label} was successfully removed.`);
        this.listen.libraryProvider.refresh();
    };

    public markAsRead = (podcastItem: PodcastType) => {

        const storedData: Record<string, PodcastType> = this.storage.get("podcasts");
        const podcast = storedData[podcastItem.feed];

        if (!podcast || !podcast.episodes.length) {
            return;
        }

        for (const episode in podcast.episodes) {
            this.listen.episode.markAsRead(podcast.episodes[episode]);
        }

        this.storage.set("podcasts", storedData);
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

    private async getThumbnail(url: string): Promise<any> {

        const response: Record<any, any> = await fetch(url);
        const contentType = response.headers.get("content-type");
        const content: string = Buffer.from(await response.arrayBuffer()).toString("base64");

        if (response.status !== 200) {
            return null;
        }

        return `data:${contentType};base64,${content}`;
    }

    private addEpisodes = (feed: string, content: Record<string, any>|null|undefined): void => {

        if (!content) {
            return;
        }

        const storedData: Record<string, PodcastType> = this.storage.get("podcasts");
        if (!storedData || !storedData.hasOwnProperty(feed)) {
            return;
        }

        const episodes = storedData[feed].episodes;
        const newEpisodes: Record<string, EpisodeType> = {};

        for (const newEpisode in content.rss.channel.item) {

            const episodeData: Record<string, any> = content.rss.channel.item[newEpisode];
            if (episodeData.guid in episodes) {
                break;
            }

            const guid = episodeData.guid?.text || episodeData.link;
            newEpisodes[guid] = <EpisodeType> {
                guid: guid,
                title: episodeData.title,
                description: episodeData.description,
                link: episodeData.link,
                pubDate: episodeData.pubDate,
                duration: episodeData["itunes:duration"],
                url: episodeData.enclosure["@_url"],
                length: episodeData.enclosure["@_length"],
                new: true
            };
        }

        const parsedEpisodes: Record<string, EpisodeType> = {...newEpisodes, ...episodes};
        storedData[feed].episodes = parsedEpisodes;
        this.storage.set("podcasts", storedData);
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
