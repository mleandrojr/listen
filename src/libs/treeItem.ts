import * as vscode from "vscode";

export class ContentTreeItem extends vscode.TreeItem {

    label?: string;
    description?: string;
    contextValue?: string;
    url?: string;
    command?: vscode.Command;
    children?: vscode.TreeItem[];

    constructor(label: string, children?: vscode.TreeItem[], collapsibleSatate?: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleSatate === undefined ? vscode.TreeItemCollapsibleState.None : collapsibleSatate);
        this.contextValue = label;
        this.children = children;
    }
}

export class QueueTreeItem extends ContentTreeItem {

    constructor(url: string, label: string, description?: string) {
        super(label, [], vscode.TreeItemCollapsibleState.None);
        this.contextValue = "queue";
        this.label = label;
        this.description = description;
        this.url = url;
        this.command = {
            command: "listen.play",
            title: "Play",
            arguments: [this]
        };
    }
}

export class RadioItem extends ContentTreeItem {

    description: string;

    constructor(label: string, url: string) {
        super(label, [], vscode.TreeItemCollapsibleState.None);
        this.description = url;
        this.url = url;
        this.contextValue = "radio";
        this.command = {
            command: "listen.addToQueue",
            title: "Add to Queue",
            arguments: [this]
        };
    }
}

export class PodcastItem extends ContentTreeItem {

    feed: string;

    constructor(podcast: Record<string, any>, children?: EpisodeItem[]) {
        super(podcast.label, children, vscode.TreeItemCollapsibleState.Collapsed);
        this.label = podcast.title;
        this.description = podcast.description;
        this.feed = podcast.feed;
        this.children = this.getEpisodes(podcast);
        this.contextValue = "podcast";
        this.iconPath = vscode.Uri.from({
            scheme: "data",
            path: podcast.thumbnail
        });
    }

    private getEpisodes = (podcast: Record<string, any>) => {

        const data = [];

        for (const episode in podcast.episodes) {
            data.push(new EpisodeItem(podcast.episodes[episode]));
        }

        return data;
    };
}

export class EpisodeItem extends ContentTreeItem {

    constructor(episode: Record<string, any>) {
        super(episode.title, [], vscode.TreeItemCollapsibleState.None);
        this.label = episode.new ? episode.title : "";
        this.description = episode.new ? "" : episode.title;
        this.contextValue = "episode";
        this.url = episode.url;
        this.command = {
            command: "listen.addToQueue",
            title: "Add to Queue",
            arguments: [this]
        };
    }
}
