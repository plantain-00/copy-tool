import { Component } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import * as io from "socket.io-client";
declare var QRCodeLib: any;
const Clipboard = require("clipboard");

function getRoom() {
    return Math.round(Math.random() * 35 * Math.pow(36, 9)).toString(36);
}

function getNow() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

const hash = document.location.hash;
let room: string;
if (!hash || hash === "#") {
    room = getRoom();
    document.location.hash = "#" + room;
} else {
    room = hash.substr(1);
}

new QRCodeLib.QRCodeDraw().draw(document.getElementById("qr"), document.location.href, (error: Error) => {
    if (error) {
        console.log(error);
    }
});

new Clipboard(".clipboard");

type TextData = {
    kind: "text";
    value: string;
    moment: string;
    id: number;
}

type ArrayBufferData = {
    kind: "file";
    value: ArrayBuffer;
    name: string;
    type: string;
}

type FileData = {
    kind: "file";
    value: File;
    url: SafeResourceUrl;
    moment: string;
    id: number;
}

const socket = io("/", { query: { room } });

@Component({
    selector: "app",
    template: require("raw!./app.html"),
})
export class AppComponent {
    public acceptMessages: (TextData | FileData)[] = [];
    public newText: string = "";
    public id: number = 1;
    constructor(private sanitizer: DomSanitizer) {
        socket.on("copy", (data: TextData | ArrayBufferData) => {
            if (data.kind === "file") {
                const file = new File([data.value], data.name, { type: data.type });
                this.acceptMessages.push({
                    kind: "file",
                    value: file,
                    url: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)),
                    moment: getNow(),
                    id: this.id++,
                });
            } else {
                data.moment = getNow();
                data.id = this.id++;
                this.acceptMessages.push(data);
            }
        });
    }
    public copyText() {
        if (this.newText) {
            socket.emit("copy", {
                kind: "text",
                value: this.newText,
            });
            this.newText = "";
        }
    }
    public copyFile(e: { target: { files: File[] } }) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            socket.emit("copy", {
                kind: "file",
                value: file,
                name: file.name,
                type: file.type,
            });
        }
    }
    public trackByMessages(index: number, message: TextData | FileData) {
        return message.id;
    }
}
