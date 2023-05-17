import * as vscode from 'vscode';
import Listen from '../listen';
import LocalStorageService from '../services/localStorageService';
import { ContentTreeItem, PodcastItem, RadioItem } from '../libs/treeItem';
import { PodcastType } from '../types/podcast';

export default class LibraryProvider implements vscode.TreeDataProvider<ContentTreeItem> {

    public onDidChangeTreeData: vscode.Event<ContentTreeItem | undefined | null | void>;
    private _onDidChangeTreeData: vscode.EventEmitter<ContentTreeItem | undefined | null | void>;
    private listen: Listen;
    private data: ContentTreeItem[] = [];
    private localStorageService: LocalStorageService;

    public constructor(listen: Listen) {
        this.listen = listen;
        this.localStorageService = new LocalStorageService(this.listen.context.globalState);
        this._onDidChangeTreeData = new vscode.EventEmitter<ContentTreeItem | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.refresh();
    }

    public refresh(): void {

        this.data = [
            new ContentTreeItem("Podcasts", this.getPodcasts(), vscode.TreeItemCollapsibleState.Expanded),
            new ContentTreeItem("Radio Streams", this.getRadios(), vscode.TreeItemCollapsibleState.Expanded)
        ];

        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ContentTreeItem): ContentTreeItem {
        return element;
    }

    public getChildren(element?: ContentTreeItem|undefined): Promise<ContentTreeItem[]> {

        if (typeof element === "undefined") {
            return Promise.resolve(this.data);
        }

        if (element.children) {
            return Promise.resolve(element.children);
        }

        return Promise.resolve([]);
    }

    public updateAllPodcasts = () => {
        vscode.window.showInformationMessage("Updating all podcasts");
        this.listen.podcast.updateAll();
    };

    public updatePodcast = (podcast: PodcastItem) => {

        vscode.window.showInformationMessage(`Updating ${podcast.label}`);

        const data: PodcastType = {
            label: podcast.label!,
            feed: podcast.feed,
            episodes: {}
        };

        this.listen.podcast.update(data);
    };

    public removePodcast = (podcast: PodcastItem) => {

        const data: PodcastType = {
            label: podcast.label!,
            feed: podcast.feed,
            episodes: {}
        };

        this.listen.podcast.remove(data);
    };

    private getPodcasts = (): PodcastItem[] => {

        const data = [];
        const podcasts: Record<string, any> = this.localStorageService.get("podcasts");

        for (const podcast in podcasts) {
            data.push(new PodcastItem(podcasts[podcast]));
        }

        return data;
    };

    private getRadios = (): RadioItem[] => {

        const data = [];
        const radios: Record<string, any> = this.localStorageService.get("radios");

        for (const radio in radios) {
            data.push(new RadioItem(radios[radio].title, radios[radio].url));
        }

        return data;
    };
}
