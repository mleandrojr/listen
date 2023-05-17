import * as vscode from "vscode";
import Listen from "../listen";
import LocalStorageService from "../services/localStorageService";
import { PodcastItem, RadioItem, ContentTreeItem } from "./treeItem";

export default class Library {

    private listen: Listen;
    private localStorageService: LocalStorageService;

    constructor(listen: Listen) {
        this.listen = listen;
        this.localStorageService = new LocalStorageService(this.listen.context.globalState);
    }
}
