export const enum DataKind {
    text = "text",
    file = "file",
    base64 = "base64",
}

export type CopyData =
    {
        kind: DataKind.text,
        value: string,
    }
    |
    {
        kind: DataKind.base64,
        value: string,
        name: string,
        type: string,
    }
    |
    {
        kind: DataKind.file,
        value: Buffer,
        name: string,
        type: string,
    };

export type Description = {
    type: "offer" | "answer",
    sdp: string,
};

export const enum MessageKind {
    splitFile = "split file",
    splitFileResult = "split file result",
}

export type WorkMessage =
    {
        kind: MessageKind.splitFile,
        file: File | Blob,
        fileName: string,
    }
    |
    {
        kind: MessageKind.splitFileResult,
        blocks: Uint8Array[],
    };
