// tslint:disable-next-line:interface-name
declare interface Window {
    RTCPeerConnection: RTCPeerConnection;
    __extends: any;
    __decorate: any;
}

// tslint:disable-next-line:interface-name
declare interface RTCDataChannel {
    readyState: "open" | "close";
    onopen: (event: any) => void;
    onclose: (event: any) => void;
    onmessage: (event: MessageEvent) => void;
    send(message: any): void;
    close(): void;
}

// tslint:disable-next-line:interface-name
declare interface RTCPeerConnection {
    ondatachannel: (event: { channel: RTCDataChannel }) => void;
    createDataChannel(channel: string): RTCDataChannel;
}
