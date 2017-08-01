import * as io from "socket.io-client";
import Vue from "vue";
import Component from "vue-class-component";
import * as Clipboard from "clipboard";
import * as types from "../types";
import SplitFile from "js-split-file/browser";
import * as format from "date-fns/format";
import { appTemplateHtml } from "./variables";
import { Locale } from "file-uploader-component/vue";

declare class RTCDataChannel {
    readyState: "open" | "close";
    onopen: (event: any) => void;
    onclose: (event: any) => void;
    onmessage: (event: MessageEvent) => void;
    send(message: any): void;
    close(): void;
}

declare class RTCPeerConnection {
    localDescription: RTCSessionDescription;
    ondatachannel: (event: { channel: RTCDataChannel }) => void;
    onicecandidate: (event: { candidate: RTCIceCandidate }) => void;
    createDataChannel(channel: string): RTCDataChannel;
    addIceCandidate(candidate: RTCIceCandidate): Promise<void>;
    createOffer(): Promise<RTCSessionDescription>;
    setLocalDescription(offer: RTCSessionDescription): Promise<void>;
    setRemoteDescription(offer: RTCSessionDescription): Promise<void>;
    createAnswer(): Promise<RTCSessionDescription>;
    close(): void;
}
declare class RTCSessionDescription {
    type: "offer" | "answer";
    sdp: string;
    constructor(description: { type: "offer" | "answer", sdp: string; });
    toJSON(): { type: "offer" | "answer"; sdp: string };
}

const supportWebRTC = !!(window as any).RTCPeerConnection;

let locale: Locale | null = null;
let app: App;

function getRoom() {
    return Math.round(Math.random() * 35 * Math.pow(36, 9)).toString(36);
}

function getNow() {
    return format(new Date(), "HH:mm:ss");
}

import * as QRCode from "qrcode";

function drawQRCode() {
    QRCode.toCanvas(document.getElementById("qr"), document.location.href, (error: Error) => {
        if (error) {
            // tslint:disable-next-line:no-console
            console.log(error);
        }
    });
}

// tslint:disable-next-line:no-unused-expression
new Clipboard(".clipboard");

const enum DataKind {
    text = "text",
    file = "file",
}

type TextData = {
    kind: DataKind.text;
    value: string;
    moment?: string;
    id?: number;
};

type ArrayBufferData = {
    kind: DataKind.file;
    value: ArrayBuffer;
    name: string;
    type: string;
};

type FileData = {
    kind: DataKind.file;
    value: File;
    url: string;
    moment: string;
    id: number;
};

type Block = {
    fileName: string;
    blocks: {
        currentBlockIndex: number,
        binary: Uint8Array,
    }[];
    progress: number,
};

declare class Notification {
    static permission: "granted" | "denied" | "default";
    static requestPermission(next: (permission: "granted" | "denied" | "default") => void): void;
    constructor(title: string);
}

function notify(title: string) {
    if (!("Notification" in window)) {
        return;
    }
    if (Notification.permission === "granted") {
        // tslint:disable-next-line:no-unused-expression
        new Notification(title);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission(permission => {
            if (permission === "granted") {
                // tslint:disable-next-line:no-unused-expression
                new Notification(title);
            }
        });
    }
}

function getCookie(name: string) {
    const cookieStrings = document.cookie.split(";");
    for (const cookieString of cookieStrings) {
        const tmp = cookieString.trim().split("=");
        if (tmp[0] === name) {
            return tmp[1];
        }
    }
    return "";
}

const worker = new Worker("worker.bundle.js");

@Component({
    template: appTemplateHtml,
})
class App extends Vue {
    acceptMessages: (TextData | FileData)[] = [];
    newText = "";
    id: number = 1;
    socket: SocketIOClient.Socket;
    clientCount = 0;
    peerConnection = supportWebRTC ? new RTCPeerConnection() : null;
    dataChannelIsOpen = false;
    dataChannel: RTCDataChannel | null = null;
    splitFile = new SplitFile();
    files: Block[] = [];
    speed = 100;
    locale = locale;
    constructor(options?: Vue.ComponentOptions<Vue>) {
        super();
        const hash = document.location.hash;
        let room: string;
        if (hash && hash !== "#") {
            room = hash.substr(1);
        } else {
            room = getCookie("room") || getRoom();
            document.location.hash = "#" + room;
        }

        const connect = () => {
            this.socket = io("/", { query: { room } });
            this.socket.on("copy", this.onMessageRecieved);
            this.socket.on("message_sent", this.onMessageSent);
            this.socket.on("client_count", this.onClientCount);
            if (supportWebRTC) {
                this.socket.on("offer", this.onGetOffer);
                this.socket.on("answer", this.onGetAnswer);
            }
            document.cookie = `room=${room}`;
            drawQRCode();
        };
        connect();
        window.onhashchange = (e => {
            if (e.newURL) {
                const index = e.newURL.indexOf("#");
                if (index > -1) {
                    const newRoom = e.newURL.substring(index + 1);
                    if (room !== newRoom) {
                        this.socket.disconnect();
                        room = newRoom;
                        connect();
                    }
                }
            }
        });
        if (this.peerConnection) {
            this.dataChannel = this.peerConnection.createDataChannel("copy_tool_channel_name");
            this.peerConnection.ondatachannel = event => {
                event.channel.onopen = e => {
                    app.dataChannelIsOpen = true;
                    this.acceptMessages.unshift({
                        kind: DataKind.text,
                        value: `The connection is opened.`,
                        moment: getNow(),
                        id: this.id++,
                    });
                };
                event.channel.onclose = e => {
                    app.dataChannelIsOpen = false;
                    this.acceptMessages.unshift({
                        kind: DataKind.text,
                        value: `The connection is closed.`,
                        moment: getNow(),
                        id: this.id++,
                    });
                };
                event.channel.onmessage = e => {
                    if (typeof e.data === "string") {
                        this.acceptMessages.unshift({
                            kind: DataKind.text,
                            value: e.data,
                            moment: getNow(),
                            id: this.id++,
                        });
                        notify("You got a text message!");
                    } else {
                        const block = this.splitFile.decodeBlock(new Uint8Array(e.data as ArrayBuffer));
                        let currentBlockIndex = this.files.findIndex(f => f.fileName === block.fileName);
                        if (currentBlockIndex === -1) {
                            currentBlockIndex = this.files.length;
                            this.files.push({
                                fileName: block.fileName,
                                blocks: [],
                                progress: 0,
                            });
                        }
                        const currentBlock = this.files[currentBlockIndex];
                        currentBlock.blocks.push({
                            currentBlockIndex: block.currentBlockIndex,
                            binary: block.binary,
                        });
                        currentBlock.progress = Math.round(currentBlock.blocks.length * 100.0 / block.totalBlockCount);
                        if (currentBlock.blocks.length === block.totalBlockCount) {
                            currentBlock.blocks.sort((a, b) => a.currentBlockIndex - b.currentBlockIndex);
                            const file = new File(currentBlock.blocks.map(f => f.binary), block.fileName);
                            this.acceptMessages.unshift({
                                kind: DataKind.file,
                                value: file,
                                url: URL.createObjectURL(file),
                                moment: getNow(),
                                id: this.id++,
                            });
                            this.files.splice(currentBlockIndex, 1);
                            notify("You got a file!");
                        }
                    }
                };
            };
        }
    }
    get canCreateOffer() {
        return supportWebRTC && !this.dataChannelIsOpen;
    }
    onGetAnswer(data: { sid: string, answer: types.Desciprtion }) {
        const answer = new RTCSessionDescription(data.answer);
        this.peerConnection!.setRemoteDescription(answer);
    }
    onGetOffer(data: { sid: string, offer: types.Desciprtion }) {
        const offer = new RTCSessionDescription(data.offer);
        this.peerConnection!.setRemoteDescription(offer)
            .then(() => this.peerConnection!.createAnswer())
            .then(answer => this.peerConnection!.setLocalDescription(answer))
            .then(() => {
                this.socket.emit("answer", {
                    sid: data.sid,
                    answer: this.peerConnection!.localDescription.toJSON(),
                });
            });
    }
    tryToConnect() {
        if (this.peerConnection) {
            this.peerConnection.createOffer()
                .then(offer => this.peerConnection!.setLocalDescription(offer))
                .then(() => {
                    this.socket.emit("offer", this.peerConnection!.localDescription.toJSON());
                });
        }
    }
    onMessageRecieved(data: TextData | ArrayBufferData) {
        if (data.kind === DataKind.file) {
            const file = new File([data.value], data.name, { type: data.type });
            this.acceptMessages.unshift({
                kind: DataKind.file,
                value: file,
                url: URL.createObjectURL(file),
                moment: getNow(),
                id: this.id++,
            });
            notify("You got a file!");
        } else {
            data.moment = getNow();
            data.id = this.id++;
            this.acceptMessages.unshift(data);
            notify("You got a text message!");
        }
    }
    onMessageSent(data: { kind: DataKind }) {
        this.acceptMessages.unshift({
            kind: DataKind.text,
            value: `the ${data.kind} is sent successfully to ${this.clientCount} clients.`,
            moment: getNow(),
            id: this.id++,
        });
    }
    onClientCount(data: { clientCount: number }) {
        this.clientCount = data.clientCount;
    }
    get buttonText() {
        if (this.clientCount > 0) {
            return `Copy the text to ${this.clientCount} clients`;
        }
        return "No clients to sent";
    }
    copyText() {
        if (this.clientCount <= 0) {
            this.acceptMessages.unshift({
                kind: DataKind.text,
                value: "No clients to sent.",
                moment: getNow(),
                id: this.id++,
            });
            return;
        }
        if (!this.newText) {
            this.acceptMessages.unshift({
                kind: DataKind.text,
                value: "No text to sent.",
                moment: getNow(),
                id: this.id++,
            });
            return;
        }
        if (this.dataChannelIsOpen) {
            this.dataChannel!.send(this.newText);
        } else {
            const copyData: types.CopyData = {
                kind: types.DataKind.text,
                value: this.newText,
            };
            this.socket.emit("copy", copyData);
        }
        this.newText = "";
    }
    fileGot(file: File | Blob) {
        if (this.clientCount <= 0) {
            this.acceptMessages.unshift({
                kind: DataKind.text,
                value: "No clients to sent.",
                moment: getNow(),
                id: this.id++,
            });
            return;
        }
        const extensionName = file.type.split("/")[1];
        const fileName = (file as File).name || `no name.${extensionName}`;
        if (this.dataChannelIsOpen) {
            const message: types.WorkMessage = {
                kind: types.MessageKind.splitFile,
                file,
                fileName,
            };
            worker.postMessage(message);
        } else {
            if (file.size >= 10 * 1024 * 1024) {
                this.acceptMessages.unshift({
                    kind: DataKind.text,
                    value: "the file is too large(>= 10MB).",
                    moment: getNow(),
                    id: this.id++,
                });
                return;
            }
            this.socket.emit("copy", {
                kind: DataKind.file,
                value: file,
                name: fileName,
                type: file.type,
            });
        }
    }
}

function start() {
    // tslint:disable-next-line:no-unused-expression
    app = new App({ el: "#body" });
}

const blocks: Uint8Array[] = [];

setInterval(() => {
    if (blocks.length > 0) {
        blocks.splice(0, app.speed).forEach(block => {
            app.dataChannel!.send(block);
        });
    }
}, 1000);

worker.onmessage = e => {
    const message: types.WorkMessage = e.data;
    if (message.kind === types.MessageKind.splitFileResult) {
        blocks.push(...message.blocks);
    }
};

if (navigator.serviceWorker) {
    navigator.serviceWorker.register("service-worker.bundle.js").catch(error => {
        // tslint:disable-next-line:no-console
        console.log("registration failed with error: " + error);
    });
}

import { locale as zhCNLocale } from "file-uploader-component/locales/zh-CN.js";

if (navigator.language === "zh-CN") {
    locale = zhCNLocale;
}
start();
