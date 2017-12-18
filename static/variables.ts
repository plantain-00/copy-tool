/**
 * This file is generated by 'file2variable-cli'
 * It is not mean to be edited by hand
 */
// tslint:disable
import { App } from "./index";

// @ts-ignore
export function appTemplateHtml(this: App) {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._m(0),_vm._v(" "),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('textarea',{directives:[{name:"model",rawName:"v-model",value:(_vm.newText),expression:"newText"}],staticClass:"form-control",attrs:{"rows":"5"},domProps:{"value":(_vm.newText)},on:{"input":function($event){if($event.target.composing){ return; }_vm.newText=$event.target.value}}})])]),_vm._v(" "),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('button',{staticClass:"btn btn-primary copy-button",on:{"click":function($event){_vm.copyText()}}},[_vm._v(_vm._s(_vm.buttonText))])])]),_vm._v(" "),(_vm.canCreateOffer)?_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('button',{staticClass:"btn btn-default copy-button",on:{"click":function($event){_vm.tryToConnect()}}},[_vm._v("try to connect")])])]):_vm._e(),_vm._v(" "),_vm._l((_vm.files),function(file,index){return _c('div',{key:index,staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('div',{staticClass:"progress"},[_c('div',{staticClass:"progress-bar progress-bar-success",style:('width:' + file.progress + '%'),attrs:{"role":"progressbar","aria-valuenow":file.progress,"aria-valuemin":"0","aria-valuemax":"100"}},[_vm._v("\n                    "+_vm._s(file.fileName)+"\n                ")])])])])}),_vm._v(" "),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('label',{staticClass:"radio-inline"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.speed),expression:"speed"}],attrs:{"type":"radio","value":"10"},domProps:{"checked":_vm._q(_vm.speed,"10")},on:{"change":function($event){_vm.speed="10"}}}),_vm._v(" 100KB/s")]),_vm._v(" "),_c('label',{staticClass:"radio-inline"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.speed),expression:"speed"}],attrs:{"type":"radio","value":"20"},domProps:{"checked":_vm._q(_vm.speed,"20")},on:{"change":function($event){_vm.speed="20"}}}),_vm._v(" 200KB/s")]),_vm._v(" "),_c('label',{staticClass:"radio-inline"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.speed),expression:"speed"}],attrs:{"type":"radio","value":"50"},domProps:{"checked":_vm._q(_vm.speed,"50")},on:{"change":function($event){_vm.speed="50"}}}),_vm._v(" 500KB/s")]),_vm._v(" "),_c('label',{staticClass:"radio-inline"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.speed),expression:"speed"}],attrs:{"type":"radio","value":"100"},domProps:{"checked":_vm._q(_vm.speed,"100")},on:{"change":function($event){_vm.speed="100"}}}),_vm._v(" 1MB/s")]),_vm._v(" "),_c('label',{staticClass:"radio-inline"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.speed),expression:"speed"}],attrs:{"type":"radio","value":"200"},domProps:{"checked":_vm._q(_vm.speed,"200")},on:{"change":function($event){_vm.speed="200"}}}),_vm._v(" 2MB/s")]),_vm._v(" "),_c('label',{staticClass:"radio-inline"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.speed),expression:"speed"}],attrs:{"type":"radio","value":"500"},domProps:{"checked":_vm._q(_vm.speed,"500")},on:{"change":function($event){_vm.speed="500"}}}),_vm._v(" 5MB/s")]),_vm._v(" "),_c('label',{staticClass:"radio-inline"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.speed),expression:"speed"}],attrs:{"type":"radio","value":"1000"},domProps:{"checked":_vm._q(_vm.speed,"1000")},on:{"change":function($event){_vm.speed="1000"}}}),_vm._v(" 10MB/s")]),_vm._v(" "),_c('label',{staticClass:"radio-inline"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.speed),expression:"speed"}],attrs:{"type":"radio","value":"Infinity"},domProps:{"checked":_vm._q(_vm.speed,"Infinity")},on:{"change":function($event){_vm.speed="Infinity"}}}),_vm._v(" No limit(Will block the UI)")])])]),_vm._v(" "),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('file-uploader',{attrs:{"multiple":"true","locale":_vm.locale},on:{"file-got":function($event){_vm.fileGot($event)}}})],1)]),_vm._v(" "),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('ul',_vm._l((_vm.acceptMessages),function(message,index){return _c('li',{key:message.id},[_c('span',{staticClass:"label label-default"},[_vm._v(_vm._s(message.moment))]),_vm._v(" "),_c('span',{staticClass:"label label-info"},[_vm._v(_vm._s(message.kind))]),_vm._v(" "),(message.kind === 'text')?_c('button',{staticClass:"btn btn-xs btn-default clipboard",attrs:{"data-clipboard-target":'#clipboard_' + message.id}},[_vm._v("copy")]):_vm._e(),_vm._v(" "),(message.kind === 'text')?_c('pre',{attrs:{"id":'clipboard_' + message.id}},[_vm._v(_vm._s(message.value))]):_vm._e(),_vm._v(" "),(message.kind === 'file')?_c('a',{staticClass:"btn btn-link",attrs:{"href":message.url,"download":message.value.name}},[_vm._v(_vm._s(message.value.name))]):_vm._e()])}))])])],2)}
// @ts-ignore
export var appTemplateHtmlStatic = [ function() {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('h4',[_vm._v("Copy-Tool")])])])} ]
// tslint:enable
