import io, { Socket } from 'socket.io-client'
import { createApp, defineComponent } from 'vue'
import Clipboard from 'clipboard'
import { DataKind, CopyData, WorkMessage, MessageKind, Description } from '../types'
import SplitFile from 'js-split-file'
import { appTemplateHtml } from './variables'
import { Locale } from 'file-uploader-vue-component'
import { FileUploader } from 'file-uploader-vue-component'

const supportWebRTC = !!window.RTCPeerConnection

let locale: Locale | null = null

function getRoom() {
  return Math.round(Math.random() * 35 * Math.pow(36, 9)).toString(36)
}

import * as QRCode from 'qrcode'

function printInConsole(message: unknown) {
  console.log(message)
}

function drawQRCode() {
  QRCode.toCanvas(document.getElementById('qr'), document.location!.href, (error: Error) => {
    if (error) {
      printInConsole(error)
    }
  })
}

new Clipboard('.clipboard')

interface TextData {
  kind: DataKind.text;
  value: string;
  moment?: number;
  id?: number;
}

interface Base64Data {
  kind: DataKind.base64;
  value: string;
  url: string;
  name: string;
  type: string;
  moment: number;
  id: number;
}

interface ArrayBufferData {
  kind: DataKind.file;
  value: ArrayBuffer;
  name: string;
  type: string;
}

interface FileData {
  kind: DataKind.file;
  value: File;
  url: string;
  moment: number;
  id: number;
}

interface Block {
  fileName: string;
  blocks: {
    currentBlockIndex: number,
    binary: Uint8Array
  }[];
  progress: number,
}

declare class Notification {
  static permission: 'granted' | 'denied' | 'default'
  constructor(title: string);
  static requestPermission(next: (permission: 'granted' | 'denied' | 'default') => void): void
}

function notify(title: string) {
  if (!('Notification' in window)) {
    return
  }
  if (Notification.permission === 'granted') {
    new Notification(title)
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(permission => {
      if (permission === 'granted') {
        new Notification(title)
      }
    })
  }
}

function getCookie(name: string) {
  const cookieStrings = document.cookie.split(';')
  for (const cookieString of cookieStrings) {
    const tmp = cookieString.trim().split('=')
    if (tmp[0] === name) {
      return tmp[1]
    }
  }
  return ''
}

const worker = new Worker('worker.bundle.js')

const fileGotMessage = 'You got a file!'

const App = defineComponent({
  render: appTemplateHtml,
  data: () => {
    return {
      acceptMessages: [] as (TextData | Base64Data | FileData)[],
      newText: '',
      files: [] as Block[],
      speed: 100,
      locale,
      room: '',
      dataChannel: null as RTCDataChannel | null,
      id: 1,
      socket: undefined as undefined | Socket,
      clientCount: 0,
      peerConnection: supportWebRTC ? new RTCPeerConnection({}) : null,
      dataChannelIsOpen: false,
      splitFile: new SplitFile(),
    }
  },
  mounted() {
    const hash = document.location!.hash
    const room = (hash && hash !== '#') ? hash.substr(1) : getCookie('room') || localStorage.getItem('room') || getRoom()

    window.onhashchange = this.onhashchange

    this.room = room
    this.changeRoom(room)

    if (this.peerConnection) {
      this.dataChannel = this.peerConnection.createDataChannel('copy_tool_channel_name')
      this.peerConnection.ondatachannel = event => {
        event.channel.onopen = () => {
          this.dataChannelIsOpen = true
          this.acceptMessages.unshift({
            kind: DataKind.text,
            value: `The connection is opened.`,
            moment: Date.now(),
            id: this.id++
          })
        }
        event.channel.onclose = () => {
          this.dataChannelIsOpen = false
          this.acceptMessages.unshift({
            kind: DataKind.text,
            value: `The connection is closed.`,
            moment: Date.now(),
            id: this.id++
          })
        }
        event.channel.onmessage = e => {
          if (typeof e.data === 'string') {
            this.acceptMessages.unshift({
              kind: DataKind.text,
              value: e.data,
              moment: Date.now(),
              id: this.id++
            })
            notify('You got a text message!')
          } else {
            const block = this.splitFile.decodeBlock(new Uint8Array(e.data as ArrayBuffer))
            let currentBlockIndex = this.files.findIndex(f => f.fileName === block.fileName)
            if (currentBlockIndex === -1) {
              currentBlockIndex = this.files.length
              this.files.push({
                fileName: block.fileName,
                blocks: [],
                progress: 0
              })
            }
            const currentBlock = this.files[currentBlockIndex]
            currentBlock.blocks.push({
              currentBlockIndex: block.currentBlockIndex,
              binary: block.binary
            })
            currentBlock.progress = Math.round(currentBlock.blocks.length * 100.0 / block.totalBlockCount)
            if (currentBlock.blocks.length === block.totalBlockCount) {
              currentBlock.blocks.sort((a, b) => a.currentBlockIndex - b.currentBlockIndex)
              const file = new File(currentBlock.blocks.map(f => f.binary), block.fileName)
              this.acceptMessages.unshift({
                kind: DataKind.file,
                value: file,
                url: URL.createObjectURL(file),
                moment: Date.now(),
                id: this.id++
              })
              this.files.splice(currentBlockIndex, 1)
              notify(fileGotMessage)
            }
          }
        }
      }
    }

    setInterval(() => {
      if (blocks.length > 0) {
        blocks.splice(0, this.speed).forEach(block => {
          if (this.dataChannel) {
            this.dataChannel.send(block)
          }
        })
      }
    }, 1000)
  },
  computed: {
    canCreateOffer(): boolean {
      return supportWebRTC && !this.dataChannelIsOpen
    },
    buttonText(): string {
      if (this.clientCount > 0) {
        return `Copy the text to ${this.clientCount} clients`
      }
      return 'No clients to sent'
    }
  },
  methods: {
    changeRoom(room: string) {
      this.room = room
      document.location!.hash = '#' + room
      localStorage.setItem('room', room)
      if (this.socket) {
        this.socket.disconnect()
      }
      this.connect(room)
    },
    tryToConnect() {
      if (this.peerConnection) {
        this.peerConnection.createOffer()
          .then(offer => this.peerConnection!.setLocalDescription(offer))
          .then(() => {
            this.socket!.emit('offer', this.peerConnection!.localDescription!.toJSON())
          })
      }
    },
    copyText() {
      if (this.clientCount <= 0) {
        this.acceptMessages.unshift({
          kind: DataKind.text,
          value: 'No clients to sent.',
          moment: Date.now(),
          id: this.id++
        })
        return
      }
      if (!this.newText) {
        this.acceptMessages.unshift({
          kind: DataKind.text,
          value: 'No text to sent.',
          moment: Date.now(),
          id: this.id++
        })
        return
      }
      if (this.dataChannelIsOpen) {
        this.dataChannel!.send(this.newText)
      } else {
        const copyData: CopyData = {
          kind: DataKind.text,
          value: this.newText
        }
        this.socket!.emit('copy', copyData)
      }
      this.newText = ''
    },
    fileGot(file: File | Blob) {
      if (this.clientCount <= 0) {
        this.acceptMessages.unshift({
          kind: DataKind.text,
          value: 'No clients to sent.',
          moment: Date.now(),
          id: this.id++
        })
        return
      }
      const extensionName = file.type.split('/')[1]
      const fileName = (file as File).name || `no name.${extensionName}`
      if (this.dataChannelIsOpen) {
        const message: WorkMessage = {
          kind: MessageKind.splitFile,
          file,
          fileName
        }
        worker.postMessage(message)
      } else {
        if (file.size >= 10 * 1024 * 1024) {
          this.acceptMessages.unshift({
            kind: DataKind.text,
            value: 'the file is too large(>= 10MB).',
            moment: Date.now(),
            id: this.id++
          })
          return
        }
        this.socket!.emit('copy', {
          kind: DataKind.file,
          value: file,
          name: fileName,
          type: file.type
        })
      }
    },
    connect(room: string) {
      this.socket = io('/', { query: { room } })
      this.socket.on('copy', this.onMessageRecieved)
      this.socket.on('message_sent', this.onMessageSent)
      this.socket.on('client_count', this.onClientCount)
      if (supportWebRTC) {
        this.socket.on('offer', this.onGetOffer)
        this.socket.on('answer', this.onGetAnswer)
      }
      document.cookie = `room=${room}`
      drawQRCode()
    },
    onhashchange(e: HashChangeEvent) {
      if (e.newURL) {
        const index = e.newURL.indexOf('#')
        if (index > -1) {
          const newRoom = e.newURL.substring(index + 1)
          if (this.room !== newRoom) {
            this.room = newRoom
            this.changeRoom(newRoom)
          }
        }
      }
    },
    onGetAnswer(data: { sid: string, answer: Description }) {
      const answer = new RTCSessionDescription(data.answer)
      this.peerConnection!.setRemoteDescription(answer)
    },
    onGetOffer(data: { sid: string, offer: Description }) {
      const offer = new RTCSessionDescription(data.offer)
      this.peerConnection!.setRemoteDescription(offer)
        .then(() => this.peerConnection!.createAnswer())
        .then(answer => this.peerConnection!.setLocalDescription(answer))
        .then(() => {
          this.socket!.emit('answer', {
            sid: data.sid,
            answer: this.peerConnection!.localDescription!.toJSON()
          })
        })
    },
    onMessageRecieved(data: TextData | Base64Data | ArrayBufferData) {
      if (data.kind === DataKind.file) {
        const file = new File([data.value], data.name, { type: data.type })
        this.acceptMessages.unshift({
          kind: DataKind.file,
          value: file,
          url: URL.createObjectURL(file),
          moment: Date.now(),
          id: this.id++
        })
        notify('You got a file!')
      } else if (data.kind === DataKind.base64) {
        this.acceptMessages.unshift({
          kind: DataKind.base64,
          value: data.value,
          url: `data:${data.type};base64,${data.value}`,
          name: data.name,
          type: data.type,
          moment: Date.now(),
          id: this.id++
        })
        notify(fileGotMessage)
      } else {
        data.moment = Date.now()
        data.id = this.id++
        this.acceptMessages.unshift(data)
        notify('You got a text message!')
      }
    },
    onMessageSent(data: { kind: DataKind }) {
      this.acceptMessages.unshift({
        kind: DataKind.text,
        value: `the ${data.kind} is sent successfully to ${this.clientCount} clients.`,
        moment: Date.now(),
        id: this.id++
      })
    },
    onClientCount(data: { clientCount: number }) {
      this.clientCount = data.clientCount
    }
  }
})

function start() {
  const app = createApp(App)
  app.component('file-uploader', FileUploader)
  app.mount('#body')
}

const blocks: Uint8Array[] = []

worker.onmessage = e => {
  const message: WorkMessage = e.data
  if (message.kind === MessageKind.splitFileResult) {
    blocks.push(...message.blocks)
  }
}

if (navigator.serviceWorker && !location.host.startsWith('localhost')) {
  navigator.serviceWorker.register('service-worker.bundle.js').catch((error: unknown) => {
    printInConsole('registration failed with error: ' + error)
  })
}

import { locale as zhCNLocale } from 'file-uploader-component/dist/locales/zh-CN'

if (navigator.language === 'zh-CN') {
  locale = zhCNLocale
}
start()
