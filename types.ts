export const enum DataKind {
    text = "text",
    file = "file",
}

export type CopyData =
    {
        kind: DataKind.text,
        value: string,
    }
    |
    {
        kind: DataKind.file,
        value: Buffer,
        name: string,
        type: string,
    };

export type Desciprtion = {
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
