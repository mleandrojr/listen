import * as vscode from "vscode";
import LibraryProvider from "../providers/libraryProvider";
import LocalStorageService from "../services/localStorageService";
import { PodcastItem, RadioItem, ContentTreeItem } from "./treeItem";

export default class Library {

    private localStorageService: LocalStorageService;
    private context: vscode.ExtensionContext;
    private provider: LibraryProvider;
    private selectedItem?: ContentTreeItem;

    constructor(context: vscode.ExtensionContext, provider: LibraryProvider) {
        this.localStorageService = new LocalStorageService(context.globalState);
        this.context = context;
        this.provider = provider;
        this.refresh();
    }

    public refresh = () => {
        this.provider.refresh([
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
