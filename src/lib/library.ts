import * as vscode from "vscode";
import LibraryProvider from "../providers/libraryProvider";
import { PodcastItem, RadioItem, ContentTreeItem } from "./treeItem";

export default class Library {

    private context: vscode.ExtensionContext;
    private provider: LibraryProvider;

    constructor(context: vscode.ExtensionContext, provider: LibraryProvider) {
        this.context = context;
        this.provider = provider;
        this.refresh();
    }

    refresh = () => {
        this.provider.refresh([
            new ContentTreeItem("Podcasts", this.getPodcasts(), vscode.TreeItemCollapsibleState.Expanded),
            new ContentTreeItem("Radio Streams", this.getRadios(), vscode.TreeItemCollapsibleState.Expanded)
        ]);
    };

    getPodcasts = (): PodcastItem[] => {

        const data = [];
        const podcasts: Record<string, any> = this.context.globalState.get("podcasts") || {};

        for (const podcast in podcasts) {
            data.push(new PodcastItem(podcasts[podcast]));
        }

        return data;
    };

    getRadios = (): RadioItem[] => {

        const data = [];
        const radios: Record<string, any> = this.context.globalState.get("radios") || {};

        for (const radio in radios) {
            data.push(new RadioItem(radios[radio].title, radios[radio].url));
        }

        return data;
    };
}
