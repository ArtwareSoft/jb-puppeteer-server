const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8090 });
const vm = require('vm')
//global.puppeteer = require('puppeteer')
global.hasPptrServer = true
global.puppeteer = require('puppeteer-extra')
 
// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin())

wss.on('connection', ws => {
  ws.send(JSON.stringify({res: typeof jb == 'undefined' ? 'loadCodeReq' : 'ready'}))
  ws.on('message', _message => {
    try {
        const message = _message.match(/^{\s*run:/) ? eval('('+_message+')') : JSON.parse(_message)
        if (message.loadCode) {
            vm.runInThisContext(message.loadCode, message.moduleFileName)
            global.jb = jb
        }
        else if (message.require) {
            jb.path(global, message.writeTo, require(message.require))
        }
        else if (message.run && typeof jb != 'undefined') { 
            new jb.jbCtx().setVar('clientSocket',ws).run(message.run)
        }
      } catch(error) {
        ws.send(JSON.stringify({error}))
        console.log(error)
      }
  })
})
console.log('opened WS server on', wss.address().port)
