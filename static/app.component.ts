import { Component, NgZone } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import * as io from "socket.io-client";

import * as Clipboard from "clipboard";

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
    constructor(description: { type: "offer", sdp: string; });
    toJSON(): { type: "offer" | "answer"; sdp: string };
}

declare class TextEncoder {
    encode(text: string): Uint8Array;
}

declare class TextDecoder {
    decode(uint8Array: Uint8Array): string;
}

const supportWebRTC = !!(window as any).RTCPeerConnection;

function getRoom() {
    return Math.round(Math.random() * 35 * Math.pow(36, 9)).toString(36);
}

function blobToUInt8Array(blob: Blob, next: (uint8Array: Uint8Array) => void) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
        next(new Uint8Array(fileReader.result as ArrayBuffer));
    };
    fileReader.readAsArrayBuffer(blob);
}

function getNow() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

function drawQRCode() {
    new QRCodeLib.QRCodeDraw().draw(document.getElementById("qr") as HTMLCanvasElement, document.location.href, (error: Error) => {
        if (error) {
            console.log(error);
        }
    });
}

abstract class SplitFileBase {
    decodeBlock(block: Uint8Array) {
        const totalBytesCountBinary = block.subarray(0, 4);
        const totalBytesCount = this.uint8ArrayToInt32(totalBytesCountBinary);

        const fileNameBinaryLengthBinary = block.subarray(4, 8);
        const fileNameBinaryLength = this.uint8ArrayToInt32(fileNameBinaryLengthBinary);
        const fileNameBinary = block.subarray(8, 8 + fileNameBinaryLength);
        const fileName = this.decode(fileNameBinary);

        const totalBlockCountBinary = block.subarray(8 + fileNameBinaryLength, 12 + fileNameBinaryLength);
        const totalBlockCount = this.uint8ArrayToInt32(totalBlockCountBinary);

        const currentBlockIndexBinary = block.subarray(12 + fileNameBinaryLength, 16 + fileNameBinaryLength);
        const currentBlockIndex = this.uint8ArrayToInt32(currentBlockIndexBinary);

        const binary = block.subarray(16 + fileNameBinaryLength);
        return {
            totalBytesCount,
            fileName,
            totalBlockCount,
            currentBlockIndex,
            binary,
        };
    }
    split(uint8Array: Uint8Array, fileName: string, size: number = 10000) {
        const blocks: Uint8Array[] = [];
        if (uint8Array.length === 0) {
            return blocks;
        }
        const totalBlockCount = Math.floor((uint8Array.length - 1) / size) + 1;
        const totalBlockCountBinary = this.int32ToUint8Array(totalBlockCount);

        const totalBytesCountBinary = this.int32ToUint8Array(uint8Array.length);

        const fileNameBinary = this.encode(fileName);
        const fileNameBinaryLengthBinary = this.int32ToUint8Array(fileNameBinary.length);

        for (let i = 0; i < totalBlockCount; i++) {
            const binary = uint8Array.subarray(i * size, i * size + size);
            const block = new Uint8Array(16 + fileNameBinary.length + binary.length);
            block.set(totalBytesCountBinary, 0);
            block.set(fileNameBinaryLengthBinary, 4);
            block.set(fileNameBinary, 8);
            block.set(totalBlockCountBinary, 8 + fileNameBinary.length);
            const currentBlockIndexBinary = this.int32ToUint8Array(i);
            block.set(currentBlockIndexBinary, 12 + fileNameBinary.length);
            block.set(binary, 16 + fileNameBinary.length);
            blocks.push(block);
        }
        return blocks;
    }
    protected abstract encode(text: string): Uint8Array;
    protected abstract decode(uint8Array: Uint8Array): string;
    private int32ToUint8Array(num: number) {
        const result = new Uint8Array(4);
        result[3] = num % 256;
        num >>= 8;
        result[2] = num % 256;
        num >>= 8;
        result[1] = num % 256;
        num >>= 8;
        result[0] = num % 256;
        return result;
    }
    private uint8ArrayToInt32(uint8Array: Uint8Array) {
        let result = uint8Array[0];
        result <<= 8;
        result += uint8Array[1];
        result <<= 8;
        result += uint8Array[2];
        result <<= 8;
        return result + uint8Array[3];
    }
}

export class SplitFileForBrowser extends SplitFileBase {
    private textEncoder = new TextEncoder();
    private textDecoder = new TextDecoder();
    protected encode(text: string) {
        return this.textEncoder.encode(text);
    }
    protected decode(uint8Array: Uint8Array) {
        return this.textDecoder.decode(uint8Array);
    }
}

new Clipboard(".clipboard");

type TextData = {
    kind: "text";
    value: string;
    moment?: string;
    id?: number;
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

type Block = {
    totalBytesCount: number,
    fileName: string,
    totalBlockCount: number,
    currentBlockIndex: number,
    binary: Uint8Array,
};

@Component({
    selector: "app",
    template: require("raw!./app.html"),
})
export class AppComponent {
    acceptMessages: (TextData | FileData)[] = [];
    newText: string = "";
    id: number = 1;
    locale = navigator.language;
    socket: SocketIOClient.Socket;
    clientCount = 0;
    peerConnection = supportWebRTC ? new RTCPeerConnection() : null;
    dataChannelIsOpen = false;
    dataChannel: RTCDataChannel | null = null;
    canCreateOffer = supportWebRTC;
    splitFile = new SplitFileForBrowser();
    files: { [name: string]: Block[] } = {};
    constructor(private sanitizer: DomSanitizer, private zone: NgZone) {
        const hash = document.location.hash;
        let room: string;
        if (!hash || hash === "#") {
            room = getRoom();
            document.location.hash = "#" + room;
        } else {
            room = hash.substr(1);
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
                    this.zone.run(() => {
                        this.dataChannelIsOpen = true;
                        this.acceptMessages.unshift({
                            kind: "text",
                            value: `The connection is opened.`,
                            moment: getNow(),
                            id: this.id++,
                        });
                    });
                };
                event.channel.onclose = e => {
                    this.zone.run(() => {
                        this.dataChannelIsOpen = false;
                        this.acceptMessages.unshift({
                            kind: "text",
                            value: `The connection is closed.`,
                            moment: getNow(),
                            id: this.id++,
                        });
                    });
                };
                event.channel.onmessage = e => {
                    this.zone.run(() => {
                        if (typeof e.data === "string") {
                            this.acceptMessages.unshift({
                                kind: "text",
                                value: e.data,
                                moment: getNow(),
                                id: this.id++,
                            });
                        } else {
                            const block = this.splitFile.decodeBlock(new Uint8Array(e.data as ArrayBuffer));
                            if (!this.files[block.fileName]) {
                                this.files[block.fileName] = [];
                            }
                            this.files[block.fileName].push(block);
                            if (this.files[block.fileName].length === block.totalBlockCount) {
                                this.files[block.fileName].sort((a, b) => a.currentBlockIndex - b.currentBlockIndex);
                                const file = new File(this.files[block.fileName].map(f => f.binary), block.fileName);
                                this.acceptMessages.unshift({
                                    kind: "file",
                                    value: file,
                                    url: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)),
                                    moment: getNow(),
                                    id: this.id++,
                                });
                                delete this.files[block.fileName];
                            }
                        }
                    });
                };
            };
        }
    }
    onGetAnswer = (data: { sid: string, answer: any }) => {
        const answer = new RTCSessionDescription(data.answer);
        this.peerConnection!.setRemoteDescription(answer);
    }
    onGetOffer = (data: { sid: string, offer: any }) => {
        const offer = new RTCSessionDescription(data.offer);
        this.peerConnection!.setRemoteDescription(offer)
            .then(() => this.peerConnection!.createAnswer())
            .then(() => this.peerConnection!.createAnswer())
            .then(answer => this.peerConnection!.setLocalDescription(answer))
            .then(() => {
                const json = this.peerConnection!.localDescription.toJSON();
                this.socket.emit("answer", {
                    sid: data.sid,
                    answer: json,
                });
            });
    }
    startToConnect = () => {
        if (this.peerConnection) {
            this.peerConnection.createOffer()
                .then(() => {
                    this.peerConnection!.createOffer()
                        .then(offer => this.peerConnection!.setLocalDescription(offer))
                        .then(() => {
                            this.socket.emit("offer", this.peerConnection!.localDescription.toJSON());
                            this.canCreateOffer = false;
                        });
                });
        }
    }
    onMessageRecieved = (data: TextData | ArrayBufferData) => {
        this.zone.run(() => {
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
    }
    onMessageSent = (data: { kind: "text" | "file" }) => {
        this.zone.run(() => {
            this.acceptMessages.unshift({
                kind: "text",
                value: `the ${data.kind} is sent successfully to ${this.clientCount} clients.`,
                moment: getNow(),
                id: this.id++,
            });
        });
    }
    onClientCount = (data: { clientCount: number }) => {
        this.zone.run(() => {
            this.clientCount = data.clientCount;
        });
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
                kind: "text",
                value: "No clients to sent.",
                moment: getNow(),
                id: this.id++,
            });
            return;
        }
        if (!this.newText) {
            this.acceptMessages.unshift({
                kind: "text",
                value: "No text to sent.",
                moment: getNow(),
                id: this.id++,
            });
            return;
        }
        if (this.dataChannelIsOpen) {
            this.dataChannel!.send(this.newText);
        } else {
            this.socket.emit("copy", {
                kind: "text",
                value: this.newText,
            });
        }
        this.newText = "";
    }
    fileUploaded(file: File | Blob) {
        if (this.clientCount <= 0) {
            this.acceptMessages.unshift({
                kind: "text",
                value: "No clients to sent.",
                moment: getNow(),
                id: this.id++,
            });
            return;
        }
        const extensionName = file.type.split("/")[1];
        const filename = (file as File).name || `no name.${extensionName}`;
        if (this.dataChannelIsOpen) {
            blobToUInt8Array(file, uint8Array => {
                const blocks = this.splitFile.split(uint8Array, filename);
                for (const block of blocks) {
                    this.dataChannel!.send(block);
                }
            });
        } else {
            if (file.size >= 10 * 1024 * 1024) {
                this.acceptMessages.unshift({
                    kind: "text",
                    value: "the file is too large(>= 10MB).",
                    moment: getNow(),
                    id: this.id++,
                });
                return;
            }
            this.socket.emit("copy", {
                kind: "file",
                value: file,
                name: filename,
                type: file.type,
            });
        }
    }
    trackByMessages(index: number, message: TextData | FileData) {
        return message.id;
    }
}
