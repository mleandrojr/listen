class ListenPlayer {

    label;
    player;
    range;
    confirmButton;
    elapsedTime;
    timeLimit;
    playButton;
    vscode;
    isTimeRangeDragging = false;

    constructor() {

        this.vscode = acquireVsCodeApi();
        this.label = document.getElementById("listenAudioTitle");

        this.range = document.getElementById("listenAudioRange");
        this.range.addEventListener("mousedown", this.rangeEvents.dragStart);
        this.range.addEventListener("mouseup", this.rangeEvents.dragEnd);
        this.range.addEventListener("input", this.rangeEvents.input);

        this.player = document.getElementById("listenAudioPlayer");
        this.player.addEventListener("loadedmetadata", this.playerEvents.loadedMetadata);
        this.player.addEventListener("timeupdate", this.playerEvents.timeUpdate);
        this.player.addEventListener("ended", this.playerEvents.ended);
        this.player.volume = 1;

        this.confirmButton = document.getElementById("listenAudioConfirmButton");
        this.confirmButton.addEventListener("click", this.confirmInterfaceClick);

        this.elapsedTime = document.getElementById("listenAudioElapsedTime");
        this.timeLimit = document.getElementById("listenAudioTimeLimit");

        this.playButton = document.getElementById("listenAudioPlayButton");
        this.playButton.addEventListener("click", this.playHandler);

        window.addEventListener("message", this.executeCommand);
    }

    playHandler = (e) => {

        if (this.player.paused) {
            this.play();
            return;
        }

        this.pause();
    };

    executeCommand = (e) => {
        const message = e.data;
        if (this.hasOwnProperty(message.command)) {
            this[message.command](message);
        }
    };

    changeMedia = async (message) => {

        this.range.setAttribute("disabled", "disabled");
        this.player.src = message.media.url;

        try {

            this.play();
            this.label.innerHTML = message.media.label;

        } catch(err) {
            console.error(err);
        }
    };

    play = async () => {

        if (!this.player.src.length) {
            return;
        }

        try {

            await this.player.play();
            this.label.classList.toggle("is-animated", true);

            const links = document.getElementsByClassName("listen-player__link");
            for (const link of links) {
                link.classList.toggle("is-disabled", false);
            }

            const playButton = this.playButton.querySelector("svg use");
            playButton.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#listen-player__icon--pause");
            this.vscode.postMessage({ command: "playing", media: this.player.src });

        } catch (err) {
            console.error(err);
        }
    };

    pause = async () => {
        this.player.pause();
        const playButton = this.playButton.querySelector("svg use");
        playButton.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#listen-player__icon--play");
    };

    confirmInterfaceClick = (e) => {
        const target = e.currentTarget;
        target.removeEventListener("click", this.confirmInterfaceClick);
        target.innerHTML = target.dataset.thanks;
        this.play();
        setTimeout(() => {
            target.parentNode.remove();
            target.remove();
        }, 1000);
    };

    timeFormat(timestamp) {

        const seconds = parseInt(timestamp % 60).toString().padStart(2, "0");
        const totalMinutes = Math.floor(timestamp / 60);
        const minutes = (totalMinutes % 60).toString().padStart(2, "0");
        const hours = (Math.floor(totalMinutes / 60)).toString().padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    };

    playerEvents = {

        loadedMetadata: (e) => {
            this.range.removeAttribute("disabled");
            this.range.max = this.player.duration;
            this.range.value = 0;
            this.timeLimit.innerHTML = this.timeFormat(this.player.duration);
        },

        timeUpdate: (e) => {

            if (this.isTimeRangeDragging) {
                return;
            }

            this.range.value = this.player.currentTime;
            this.elapsedTime.innerHTML = this.timeFormat(this.player.currentTime);
        },

        ended: (e) => {
            const playButton = this.playButton.querySelector("svg use");
            playButton.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#listen-player__icon--play");
            this.label.classList.toggle("is-animated", false);
            this.vscode.postMessage({ command: "next" });
        }
    };

    rangeEvents = {

        dragStart: (e) => {
            this.isTimeRangeDragging = true;
        },

        dragEnd: (e) => {
            this.isTimeRangeDragging = false;
            const target = e.currentTarget;
            this.player.currentTime = target.value;
        },

        input: (e) => {
            const target = e.currentTarget;
            this.elapsedTime.innerHTML = this.timeFormat(target.value);
        }
    };
}

(new ListenPlayer());
