import * as vscode from 'vscode';
import { PodcastItem, RadioItem, ContentTreeItem } from './treeItem';

export default class Library {

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    init(): ContentTreeItem[] {
        return [
            new ContentTreeItem("Podcasts", this.getPodcasts(), vscode.TreeItemCollapsibleState.Expanded),
            new ContentTreeItem("Radio Streams", this.getRadios(), vscode.TreeItemCollapsibleState.Expanded)
        ];
    }

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
