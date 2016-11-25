import { Component, NgZone } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import * as io from "socket.io-client";
declare var QRCodeLib: any;
import * as Clipboard from "clipboard";

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
};

type ArrayBufferData = {
    kind: "file";
    value: ArrayBuffer;
    name: string;
    type: string;
};

type FileData = {
    kind: "file";
    value: File;
    url: SafeResourceUrl;
    moment: string;
    id: number;
};

const socket = io("/", { query: { room } });

@Component({
    selector: "app",
    template: require("raw!./app.html"),
})
export class AppComponent {
    acceptMessages: (TextData | FileData)[] = [];
    newText: string = "";
    id: number = 1;
    locale = navigator.language;
    constructor(private sanitizer: DomSanitizer, zone: NgZone) {
        socket.on("copy", (data: TextData | ArrayBufferData) => {
            zone.run(() => {
                if (data.kind === "file") {
                    const file = new File([data.value], data.name, { type: data.type });
                    this.acceptMessages.unshift({
                        kind: "file",
                        value: file,
                        url: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)),
                        moment: getNow(),
                        id: this.id++,
                    });
                } else {
                    data.moment = getNow();
                    data.id = this.id++;
                    this.acceptMessages.unshift(data);
                }
            });
        });
    }
    copyText() {
        if (this.newText) {
            socket.emit("copy", {
                kind: "text",
                value: this.newText,
            });
            this.newText = "";
        }
    }
    fileUploaded(file: File | Blob) {
        if (file.size >= 10 * 1024 * 1024) {
            this.acceptMessages.unshift({
                kind: "text",
                value: "the file is too large(>= 10MB).",
                moment: getNow(),
                id: this.id++,
            });
            return;
        }
        if ((file as File).name) {
            socket.emit("copy", {
                kind: "file",
                value: file,
                name: (file as File).name,
                type: file.type,
            });
        } else {
            const extensionName = file.type.split("/")[1];
            socket.emit("copy", {
                kind: "file",
                value: file,
                name: (file as File).name || `no name.${extensionName}`,
                type: file.type,
            });
        }
    }
    trackByMessages(index: number, message: TextData | FileData) {
        return message.id;
    }
}
