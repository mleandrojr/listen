import * as vscode from "vscode";
import Listen from "../listen";
import fetch from "node-fetch";
import Library from "./library";
import LocalStorageService from "../services/localStorageService";
import { XMLParser } from "fast-xml-parser";
import { PodcastType } from "../types/podcast";
import { EpisodeType } from "../types/episode";
import { PodcastItem } from "./treeItem";

export default class Podcast {

    private listen: Listen;
    private localStorageService: LocalStorageService;

    constructor(listen: Listen) {
        this.listen = listen;
        this.localStorageService = new LocalStorageService(this.listen.context.globalState);
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

        try {

            podcasts = this.localStorageService.get("podcasts") || {};

            if (podcasts && podcasts.hasOwnProperty(feed)) {
                vscode.window.showErrorMessage(`The podcast ${feed} is already in the library.`);
                return;
            }

            const content = await this.getFeed(feed);
            if (!content) {
                return;
            }

            const thumbnail = await this.getThumbnail(content.rss.channel.image.url);
            podcasts[feed] = <PodcastType> {
                title: content.rss.channel.title,
                description: content.rss.channel.description,
                link: content.rss.channel.link,
                feed: feed,
                thumbnail: thumbnail,
                episodes: <Record<string, EpisodeType>> {}
            };

            this.localStorageService.set("podcasts", podcasts);
            this.addEpisodes(feed, content);

            vscode.window.showInformationMessage(`The podcast ${content.rss.channel.title} was successfully added.`);

        } catch (error) {
            vscode.window.showErrorMessage(`Invalid URL ${feed}`);
        }

        this.listen.library.refresh();
    };

    public refreshAll = async () => {
        this.listen.library.refresh();
    };

    public refresh = async (podcastItem: PodcastItem): Promise<void> => {
        vscode.window.showInformationMessage(`Updating ${podcastItem.label}`);
        const content = await this.getFeed(podcastItem.feed);
        this.addEpisodes(podcastItem.feed, content);
        this.listen.library.refresh();
    };

    public remove = async (podcastItem: PodcastItem): Promise<void> => {

        const podcasts = <Record<string, PodcastItem>> this.localStorageService.get("podcasts") || {};
        delete podcasts[podcastItem.feed];

        this.localStorageService.set("podcasts", podcasts);

        vscode.window.showInformationMessage(`The podcast ${podcastItem.label} was successfully removed.`);
        this.listen.library.refresh();
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

        const storedData: Record<string, PodcastType> = this.localStorageService.get("podcasts");
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

            newEpisodes[episodeData.guid.text] = <EpisodeType> {
                guid: episodeData.guid.text,
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
        this.localStorageService.set("podcasts", storedData);
    };
}