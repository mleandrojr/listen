import * as vscode from 'vscode';
import Listen from '../listen';
import { ContentTreeItem, PodcastItem } from '../libs/treeItem';
import { PodcastType } from '../types/podcast';

export default class LibraryProvider implements vscode.TreeDataProvider<ContentTreeItem> {

    public onDidChangeTreeData: vscode.Event<ContentTreeItem | undefined | null | void>;
    private _onDidChangeTreeData: vscode.EventEmitter<ContentTreeItem | undefined | null | void>;
    private listen: Listen;
    private data: ContentTreeItem[] = [];

    public constructor(listen: Listen) {
        this.listen = listen;
        this._onDidChangeTreeData = new vscode.EventEmitter<ContentTreeItem | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    public refresh(data: ContentTreeItem[]): void {
        this.data = data;
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

    public refreshAllPodcasts = () => {
    };

    public refreshPodcast = (podcast: PodcastItem) => {
    };

    public removePodcast = (podcast: PodcastItem) => {

        const data: PodcastType = {
            label: podcast.label!,
            feed: podcast.feed,
            episodes: {}
        };

        this.listen.podcast.remove(data);
    };
}
