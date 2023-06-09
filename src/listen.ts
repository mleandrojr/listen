import Player from "./libs/player";
import Podcast from "./libs/podcast";
import Episode from "./libs/episode";
import Queue from "./libs/queue";
import Radio from "./libs/radio";
import LibraryProvider from "./providers/libraryProvider";
import PlayerProvider from "./providers/playerProviders";
import QueueProvider from "./providers/queueProvider";
import Database from "./services/database";
import * as vscode from "vscode";

export default class Listen {

    public context: vscode.ExtensionContext;
    public database: Database;
    public libraryProvider: LibraryProvider;
    public queueProvider: QueueProvider;
    public playerProvider: PlayerProvider;
    public podcast: Podcast;
    public episode: Episode;
    public radio: Radio;
    public queue: Queue;
    public player: Player;
    public libraryTreeView: vscode.TreeView<unknown>;
    public queueTreeView: vscode.TreeView<unknown>;

    public constructor(context: vscode.ExtensionContext) {

        this.context = context;
        this.context.globalState.setKeysForSync(["podcasts", "radios"]);

        this.database = new Database(this.context);
        this.podcast = new Podcast(this);
        this.episode = new Episode(this);
        this.radio = new Radio(this);
        this.queue = new Queue(this);
        this.player = new Player(this);

        this.libraryProvider = new LibraryProvider(this);
        this.queueProvider = new QueueProvider(this);
        this.playerProvider = new PlayerProvider(this);

        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider("listenPlayer", this.playerProvider, {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            })
        );

        this.libraryTreeView = vscode.window.createTreeView("listenLibrary", {
            treeDataProvider: this.libraryProvider, showCollapseAll: true
        });

        this.queueTreeView = vscode.window.createTreeView("listenQueue", {
            treeDataProvider: this.queueProvider, canSelectMany: true
        });
    }
}
