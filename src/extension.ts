import * as vscode from "vscode";
import Listen from "./listen";

export function activate(context: vscode.ExtensionContext) {

    context.globalState.setKeysForSync(["podcasts", "radios"]);
    const listen = new Listen(context);

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
        treeDataProvider: listen.libraryProvider
    });

    const queueTreeView = vscode.window.createTreeView("listenQueue", {
        treeDataProvider: listen.queueProvider
    });

    const disposables = [
        vscode.commands.registerCommand("listen.addPodcast", listen.podcast.openDialog),
        vscode.commands.registerCommand("listen.refreshAllPodcasts", listen.libraryProvider.refreshAllPodcasts),
        vscode.commands.registerCommand("listen.refreshPodcast", listen.libraryProvider.refreshPodcast),
        vscode.commands.registerCommand("listen.removePodcast", listen.libraryProvider.removePodcast),
        vscode.commands.registerCommand("listen.addRadioStream", listen.radio.openDialog),
        vscode.commands.registerCommand("listen.removeRadio", listen.radio.remove),
        vscode.commands.registerCommand("listen.addToQueue", listen.queueProvider.add),
        vscode.commands.registerCommand("listen.removeFromQueue", listen.queueProvider.remove),
        vscode.commands.registerCommand("listen.play", listen.queueProvider.play),
        vscode.commands.registerCommand("listen.next", listen.queueProvider.next)
    ];

    for (const disposable of disposables) {
        context.subscriptions.push(disposable);
    }
}

export function deactivate() {}
