declare interface Window {
    RTCPeerConnection: RTCPeerConnection;
    __extends: any;
    __decorate: any;
}

declare interface RTCDataChannel {
    readyState: "open" | "close";
    onopen: (event: any) => void;
    onclose: (event: any) => void;
    onmessage: (event: MessageEvent) => void;
    send(message: any): void;
    close(): void;
}

declare interface RTCPeerConnection {
    ondatachannel: (event: { channel: RTCDataChannel }) => void;
    createDataChannel(channel: string): RTCDataChannel;
}

declare module 'date-fns/format' {
    import { format } from 'date-fns'
    export = format
}
