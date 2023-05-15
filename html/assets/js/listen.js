class ListenPlayer {

    label;
    player;

    constructor() {

        this.label = document.getElementById("listenAudioTitle");
        this.player = document.getElementById("listenAudioPlayer");
        window.addEventListener("message", this.executeCommand);

        try {
            this.player.muted = false;

        } catch (err) {
            console.log(err);
        }
    }

    executeCommand = (e) => {
        const message = e.data;
        console.log(e);
        this.label.click();
        if (this.hasOwnProperty(message.command)) {
            this[message.command](message);
        }
    };

    play = (message) => {
        this.label.innerText = message.media.label;
        this.player.src = message.media.url;
        this.player.play();
    };
}

(new ListenPlayer());
