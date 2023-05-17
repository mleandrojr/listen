import * as vscode from "vscode";
import Listen from "../listen";
import LocalStorageService from "../services/localStorageService";
import { PodcastItem, RadioItem, ContentTreeItem } from "./treeItem";

export default class Library {

    private listen: Listen;
    private localStorageService: LocalStorageService;
    private selectedItem?: ContentTreeItem;

    constructor(listen: Listen) {
        this.listen = listen;
        this.localStorageService = new LocalStorageService(this.listen.context.globalState);
        this.refresh();
    }

    public refresh = () => {
        this.listen.libraryProvider.refresh([
            new ContentTreeItem("Podcasts", this.getPodcasts(), vscode.TreeItemCollapsibleState.Expanded),
            new ContentTreeItem("Radio Streams", this.getRadios(), vscode.TreeItemCollapsibleState.Expanded)
        ]);
    };

    public getPodcasts = (): PodcastItem[] => {

        const data = [];
        const podcasts: Record<string, any> = this.localStorageService.get("podcasts");

        for (const podcast in podcasts) {
            data.push(new PodcastItem(podcasts[podcast]));
        }

        return data;
    };

    public getRadios = (): RadioItem[] => {

        const data = [];
        const radios: Record<string, any> = this.localStorageService.get("radios");

        for (const radio in radios) {
            data.push(new RadioItem(radios[radio].title, radios[radio].url));
        }

        return data;
    };
}
