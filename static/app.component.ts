import { Component } from "@angular/core";

function getRoom() {
    return Math.round(Math.random() * 35 * Math.pow(36, 9)).toString(36);
}

const hash = document.location.hash;
let room: string;
if (!hash || hash === "#") {
    room = getRoom();
    document.location.hash = "#" + room;
} else {
    room = hash.substr(1);
}

type TextData = {
    kind: "text";
    value: string;
}

type FileData = {
    kind: "file";
    name: string;
    type: string;
    value: File;
}

// const socket = io("/", { query: { room } });
// socket.on("copy", (data: TextData | FileData) => {
// });

@Component({
    selector: "app",
    template: require("raw!./app.html"),
})
export class AppComponent {
    public acceptMessages: (TextData | FileData)[] = [];
    public newText: string = "";
    constructor() {
        this.acceptMessages.push({
            kind: "text",
            value: "abc",
        });
    }
    public copy() {
        if (this.newText) {
            this.acceptMessages.push({
                kind: "text",
                value: this.newText,
            });
            this.newText = "";
        }
    }
}
