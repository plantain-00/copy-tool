export type CopyData =
    {
        kind: "text",
        value: string,
    }
    |
    {
        kind: "file",
        value: Buffer,
        name: string,
        type: string,
    };

export type Desciprtion = {
    type: "offer" | "answer",
    sdp: string,
};

declare class RTCDataChannel {
    readyState: "open" | "close";
    onopen: (event: any) => void;
    onclose: (event: any) => void;
    onmessage: (event: MessageEvent) => void;
    send(message: any): void;
    close(): void;
}

export type WorkMessage =
    {
        kind: "split file",
        file: File | Blob,
        fileName: string,
    }
    |
    {
        kind: "split file result",
        blocks: Uint8Array[],
    };
