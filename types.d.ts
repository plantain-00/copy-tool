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
