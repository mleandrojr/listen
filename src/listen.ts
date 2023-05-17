import Library from "./libs/library";
import Player from "./libs/player";
import Podcast from "./libs/podcast";
import Queue from "./libs/queue";
import Radio from "./libs/radio";
import LibraryProvider from "./providers/libraryProvider";
import PlayerProvider from "./providers/playerProviders";
import QueueProvider from "./providers/queueProvider";
import * as vscode from "vscode";

export default class Listen {

    public context: vscode.ExtensionContext;
    public libraryProvider: LibraryProvider;
    public queueProvider: QueueProvider;
    public playerProvider: PlayerProvider;
    public library: Library;
    public podcast: Podcast;
    public radio: Radio;
    public queue: Queue;
    public player: Player;

    public constructor(context: vscode.ExtensionContext) {

        this.context = context;

        /* Data providers. */
        this.libraryProvider = new LibraryProvider(this);
        this.queueProvider = new QueueProvider(this);
        this.playerProvider = new PlayerProvider(this);

        this.library = new Library(this);
        this.podcast = new Podcast(this);
        this.radio = new Radio(this);
        this.queue = new Queue(this);
        this.player = new Player(this);

        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider("listenPlayer", this.playerProvider, {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            })
        );
    }
}
