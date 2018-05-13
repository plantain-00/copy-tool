import * as types from '../types'
import SplitFile from 'js-split-file/browser'

const splitFile = new SplitFile()

function blobToUInt8Array(blob: Blob, next: (uint8Array: Uint8Array) => void) {
  const fileReader = new FileReader()
  fileReader.onload = () => {
    next(new Uint8Array(fileReader.result as ArrayBuffer))
  }
  fileReader.readAsArrayBuffer(blob)
}

onmessage = e => {
  const message: types.WorkMessage = e.data
  const startTime = Date.now()
  if (message.kind === types.MessageKind.splitFile) {
    blobToUInt8Array(message.file, uint8Array => {
      const blocks = splitFile.split(uint8Array, message.fileName)
      console.log(`cost ${(Date.now() - startTime) / 1000.0} s`)
      const result: types.WorkMessage = {
        kind: types.MessageKind.splitFileResult,
        blocks
      }
      postMessage(result, undefined as any)
    })
  }
}
