import * as vscode from "vscode";
import Podcast from "./lib/podcast";
import Radio from "./lib/radio";
import Library from "./lib/library";
import Queue from "./lib/queue";
import LibraryProvider from "./providers/libraryProvider";
import QueueProvider from "./providers/queueProvider";
import PlayerProvider from "./providers/playerProviders";
import Player from "./lib/player";
import { PodcastItem } from "./lib/treeItem";

export function activate(context: vscode.ExtensionContext) {

    context.globalState.setKeysForSync(["podcasts", "radios"]);

    const podcast = new Podcast(context);
    const radio = new Radio(context);
    const library = new Library(context);
    const queue = new Queue(context);
    const player = new Player(context);
    const libraryProvider = new LibraryProvider(library.init());
    const queueProvider = new QueueProvider(queue.init());

    // (async () => {
    //     await context.globalState.update("radios", {});
    //     await radio.add("http://cloud2.cdnseguro.com:23538/;", "Kiss FM 92.5 São Paulo");
    //     await radio.add("http://cloud2.cdnseguro.com:23539/;", "Antena 1");
    //     libraryProvider.refresh(library.init());
    // })();

    // (async () => {
    //     await context.globalState.update("podcasts", {});
    //     await podcast.add("https://feed.rota66cast.com.br");
    //     await podcast.add("https://chupacast.com.br/feed/podcast");
    //     await podcast.add("http://cabinedotempo.com.br/feed/podcast/");
    //     libraryProvider.refresh(library.init());
    // })();

    const libraryTreeView = vscode.window.createTreeView("listenLibrary", {
        treeDataProvider: libraryProvider
    });
    // libraryTreeView.onDidChangeSelection( e => click(e.selection));

    const queueTreeView = vscode.window.createTreeView("listenQueue", {
        treeDataProvider: queueProvider
    });

    const disposables = [
        vscode.commands.registerCommand("listen.addPodcast", async () => {
            await podcast.openDialog();
            libraryProvider.refresh(library.init());
        }),

        vscode.commands.registerCommand("listen.refreshAllPodcasts", async () => {
            vscode.window.showInformationMessage("Updating all podcasts");
            libraryProvider.refresh(library.init());
        }),

        vscode.commands.registerCommand("listen.refreshPodcast", async (podcastItem: PodcastItem) => {
            vscode.window.showInformationMessage(`Updating ${podcastItem.label}`);
            await podcast.refresh(podcastItem.feed);
            libraryProvider.refresh(library.init());
        }),

        vscode.commands.registerCommand("listen.removePodcast", async (podcastItem: PodcastItem) => {
            await podcast.remove(podcastItem);
            libraryProvider.refresh(library.init());
        }),
        vscode.commands.registerCommand("listen.addRadioStream", radio.openDialog),



        vscode.commands.registerCommand("listen.removeRadio", async (item) => {
            radio.remove(item);
            libraryProvider.refresh(library.init());
        }),

        vscode.commands.registerCommand("listen.addToQueue", async (item) => {
            queue.add(item);
            queueProvider.refresh(queue.init());
        }),

        vscode.commands.registerCommand("listen.removeFromQueue", async (item) => {
            queue.remove(item);
            queueProvider.refresh(queue.init());
        }),

        vscode.commands.registerCommand("listen.play", async (item) => {
            queue.add(item);
            player.play(item);
        }),
    ];

    for (const disposable of disposables) {
        context.subscriptions.push(disposable);
    }

    const provider = new PlayerProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider("listenPlayer", provider)
    );
}

export function deactivate() {}
