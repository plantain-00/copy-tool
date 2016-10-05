import { Component, Input } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import * as io from "socket.io-client";
declare var QRCodeLib: any;

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

new QRCodeLib.QRCodeDraw().draw(document.getElementById("qr"), document.location.href, (error: Error) => {
    if (error) {
        console.log(error);
    }
});

type TextData = {
    kind: "text";
    value: string;
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
}

const socket = io("/", { query: { room } });

@Component({
    selector: "app",
    template: require("raw!./app.html"),
})
export class AppComponent {
    @Input()
    public acceptMessages: (TextData | FileData)[] = [];
    public newText: string = "";
    constructor(private sanitizer: DomSanitizer) {
        socket.on("copy", (data: TextData | ArrayBufferData) => {
            if (data.kind === "file") {
                const file = new File([data.value], data.name, { type: data.type });
                this.acceptMessages.push({
                    kind: "file",
                    value: file,
                    url: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)),
                });
            } else {
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
}
