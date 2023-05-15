import * as vscode from "vscode";
import Podcast from "./lib/podcast";
import Radio from "./lib/radio";
import Library from "./lib/library";
import Queue from "./lib/queue";
import LibraryProvider from "./providers/libraryProvider";
import QueueProvider from "./providers/queueProvider";

export function activate(context: vscode.ExtensionContext) {

    context.globalState.setKeysForSync(["podcasts", "radios"]);

    /* Data providers. */
    const libraryProvider = new LibraryProvider(context);
    const queueProvider = new QueueProvider(context);


    const library = new Library(context, libraryProvider);
    const podcast = new Podcast(context, library);
    const radio = new Radio(context, library);

    const queue = new Queue(context, queueProvider);


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
        vscode.commands.registerCommand("listen.addPodcast", podcast.openDialog),
        vscode.commands.registerCommand("listen.refreshAllPodcasts", podcast.refreshAll),
        vscode.commands.registerCommand("listen.refreshPodcast", podcast.refresh),
        vscode.commands.registerCommand("listen.removePodcast", podcast.remove),
        vscode.commands.registerCommand("listen.addRadioStream", radio.openDialog),
        vscode.commands.registerCommand("listen.removeRadio", radio.remove),
        vscode.commands.registerCommand("listen.addToQueue", queue.add),
        vscode.commands.registerCommand("listen.removeFromQueue", queue.remove),
        vscode.commands.registerCommand("listen.play", queue.play)
    ];

    for (const disposable of disposables) {
        context.subscriptions.push(disposable);
    }
}

export function deactivate() {}
