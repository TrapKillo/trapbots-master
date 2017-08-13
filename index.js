"use strict";
var WebSocket = require('ws');
var Socks = require('socks');
var colors = require('colors');
var bots = [];
var port = 8080;
var io = require('socket.io')(port);
var fs = require('fs');
var proxies = fs.readFileSync("proxies.txt", "utf8").split("\n").filter(function(a) {
    return !!a;
});
var chatMsg = "youtube.com/TrapKillo";
var server = "";
var origin = null;
var BotsNick = "TrapBots";
var xPos, yPos, byteLength = 0;
var connectedCount = 0;
var botCount = 150;
var users = 0;
var sendCountUpdate = function() {};

function prepareData(a) {
    return new DataView(new ArrayBuffer(a));
}

function createAgent() {
    var proxy = proxies[~~(Math.random() * proxies.length)].split(':');
    if (!proxy) return undefined;
    return new Socks.Agent({
        proxy: {
            ipaddress: proxy[0],
            port: parseInt(proxy[1]),
            type: parseInt(proxy[2]) || 5
        }
    });
}

function Bot(id) {
    this.id = id;
    this.connect();
}

Bot.prototype = {
    hasConnected: false,
    send: function(buf) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(buf);
    },
    connect: function() {
        this.ws = new WebSocket(server, {
            headers: {
                'Origin': origin,
                'Accept-Encoding':'gzip, deflate',
                'Accept-Language':'en-US,en;q=0.8',
                'Cookie':'__cfduid=d70ac5b0551d3138b7003931808cba7e91502180407',
                'User-Agent':'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
            },
            agent: createAgent(this.id)
        });

        this.binaryType = "nodebuffer";

        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onerror = this.onError.bind(this);
    },
    sendSpam: function() {
        var str = chatMsg;
        var msg = prepareData(2 + 2 * str.length);
            var offset = 0;
            msg.setUint8(offset++, 99);
            msg.setUint8(offset++, 0); // flags (0 for now)
            for (var i = 0; i < str.length; ++i) {
                msg.setUint16(offset, str.charCodeAt(i), true);
                offset += 2;
            }
            this.send(msg);
    },
    disconnect: function() {
        //console.log(`${this.id} disconnect`);
        if (this.ws) this.ws.close();
    },
    spawn: function(name) {
            var client = this;
            setInterval(function() {
                var msg = prepareData(1 + 2 * name.length);
                msg.setUint8(0, 0);
                for(var i = 0; i < name.length; ++i) msg.setUint16(1 + 2 * i, name.charCodeAt(i), true);
                client.send(msg);
            }, 1000);
    },
    gota: function(name) {
       var buf = new Buffer(1 + name.length * 2);
	    buf.writeUInt8(0, 0);
	    buf.write(name, 1, name.length * 2, 'ucs2');
	    this.send(buf);
    },
    moveTo: function() {
        var client = this;
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }
        if (byteLength == 21) {
            var buf = new Buffer(21);
            buf.writeUInt8(16, 0);
            buf.writeDoubleLE(xPos, 1);
            buf.writeDoubleLE(yPos, 9);
            buf.writeUInt32LE(0, 17);
            client.send(buf);
        } else {
            if (byteLength == 13) {
                var buf = new Buffer(13);
                buf.writeUInt8(16, 0);
                buf.writeInt32LE(xPos, 1);
                buf.writeInt32LE(yPos, 5);
                buf.writeUInt32LE(0, 9);
                client.send(buf);
            } else {
                if (byteLength == 5) {
                    var buf = new Buffer(5);
                    var doRandomization = true;
                    buf.writeUInt8(16, 0);
                    buf.writeInt16LE(xPos + (doRandomization ? Math.random() * 30 - 15 : 0), 1);
                    buf.writeInt16LE(yPos + (doRandomization ? Math.random() * 30 - 15 : 0), 3);
                    client.send(buf);
                } else {
                    if (byteLength == 9) {
                        buf.writeUInt8(16, 0);
                        buf.writeInt16LE(xPos, 1);
                        buf.writeInt16LE(yPos, 3);
                        buf.writeInt32LE(0, 5);
                        client.send(buf);
                    }
                }
            }
        }
    },
    onOpen: function() {
        //if(connectedCount > botCount)
        //    this.disconnect();
        var client = this;
        //console.log('Connecting...');
        if (origin === "http://cellcraft.io") {
            this.send(new Buffer([254, 5, 0, 0, 0]));
            this.send(new Buffer([255, 50, 137, 112, 79]));
            this.send(new Buffer([90, 51, 24, 34, 131]));
            this.send(new Buffer([42]));
            setInterval(function() {
                client.send(new Buffer([0, 59, 0, 91, 0, 118, 0, 105, 0, 112, 0, 93, 0, 32, 0, 84, 0, 114, 0, 97, 0, 112, 0, 66, 0, 111, 0, 116, 0, 115, 0]));
            }, 3000);
        }
        if (origin === "http://agar.bio") {
            var msg = prepareData(5);
            msg.setUint8(0, 254);
            msg.setUint32(1, 1, true);
            this.send(msg);
            msg = prepareData(5);
            msg.setUint8(0, 255);
            msg.setUint32(1, 1332175218, true);
            this.send(msg);
            setInterval(function() {
                client.spawn(BotsNick);
                //console.log('Spawning...')
            },3000);
        }
        if (origin === "http://galx.io") {
            this.send(new Buffer([254, 5, 0, 0, 0]));
            this.send(new Buffer([255, 166, 126, 112, 79]));
            this.send(new Buffer([90, 51, 24, 34, 131]));
            this.send(new Buffer([43]));
            setInterval(function() {
                client.spawn(BotsNick);
                //console.log('Spawning...')
            },3000);
        }
        if (origin === "http://play.agario0.com") {
            var msg = prepareData(5);
            msg.setUint8(0, 254);
            msg.setUint32(1, 1, true);
            this.send(msg);
            msg = prepareData(5);
            msg.setUint8(0, 255);
            msg.setUint32(1, 1332175218, true);
            this.send(msg);
            setInterval(function() {
                client.spawn(BotsNick);
                //console.log('Spawning...')
            },3000);
        }
        if (origin === "http://blong.io") {
            var buf = prepareData(5);
            buf.setUint8(0, 254);
            buf.setUint32(1, 5, true);
            this.send(buf);
            buf = prepareData(5);
            buf.setUint8(0, 255);
            buf.setUint32(1, 1332175218, true);
            this.send(buf);
            setInterval(function() {
                //client.spawn(BotsNick);
                client.send(new Uint8Array([4]));
                //console.log('Spawning...')
            },1000);
        }
        if (origin === "http://nbk.io") {
            var buf = prepareData(5);
            buf.setUint8(0, 214);
            buf.setUint32(1, 5, true);
            this.send(buf);
            buf = prepareData(5);
            buf.setUint8(0, 215);
            buf.setUint32(1, 154669603, true);
            this.send(buf);
            setInterval(function() {
                client.send(new Uint8Array([0, 84, 0, 114, 0, 97, 0, 112, 0, 66, 0, 111, 0, 116, 0, 115, 0]));
                //console.log('Spawning...')
            },5000);
        }
        if (origin === "http://gaver.io") {
            this.send(new Uint8Array([254, 5, 0, 0, 0]));
            this.send(new Uint8Array([255, 35, 18, 56, 9]));
            this.send(new Uint8Array([19]));
            setInterval(function() {
                client.send(new Uint8Array([0, 123, 0, 34, 0, 110, 0, 97, 0, 109, 0, 101, 0, 34, 0, 58, 0, 34, 0, 84, 0, 114, 0, 97, 0, 112, 0, 66, 0, 111, 0, 116, 0, 115, 0, 34, 0, 125, 0]));
            },2e2);
        }
        if (origin === "http://mgar.io") {
            var msg = prepareData(5);
            msg.setUint8(0, 254);
            msg.setUint32(1, 5, true); // Protcol 5
            this.send(msg);
            msg = prepareData(5);
            msg.setUint8(0, 255);
            msg.setUint32(1, 1918986093, true);
            this.send(msg);
            setInterval(function() {
                client.spawn(BotsNick);
                //console.log('Spawning...')
            },1000);
        }
        if (origin === "http://gota.io") {
            this.send(new Buffer('/0dvdGEgV2ViIDEuNC4wAA==', 'base64'));
            var version = "Gota Web 1.4.5";
            var buffer = new Buffer(1 + version.length * 2);
            buffer.writeUInt8(255, 0);
            buffer.write(version, 1, version.length * 2, 'ucs2');
            this.send(buffer);
            var ping = new Uint8Array([71]); 
            this.send(ping);
            setInterval(function() {
                //client.spawn(BotsNick);
                client.gota(BotsNick);
                //console.log('Spawning...')
            },1000);
        }
        setInterval(function() {
            client.moveTo();
        }, 100);
        this.hasConnected = true;
        connectedCount++;
        sendCountUpdate();
    },
    onClose: function(c) {
        //console.log('Closed: ' + c);
        if (this.hasConnected) {
            connectedCount--;
            sendCountUpdate();
        }
        this.hasConnected = false;
        if (connectedCount < botCount)
            this.connect();
    },
    onError: function(e) {
        //console.log('Error:' + e);
        setTimeout(function() {
            //console.log('Retrying... (500ms)');
            this.connect.bind(this);
        }.bind(this), 500);
    },
    split: function() {
    	if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
    	  return;
        }
	  	var buf = new Buffer([17]);
        this.send(buf);
        var buf2 = new Buffer([56]);
        this.send(buf2);
	},
	eject:  function() {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        	return;
        }
    	var buf = new Buffer([21]);
        this.send(buf);
        var buf2 = new Buffer([36]);
        this.send(buf2);
        var buf3 = new Buffer([57]);
        this.send(buf3);
        var buf4 = new Buffer([22]);
        this.send(buf4);
	}
};

function start() {
    for (var i in bots)
            bots[i].disconnect();
    //for (var i = Object.keys(bots); i < botCount; i++)
    //        bots.push(new Bot(proxies.length));
    //for(var i = 0; i < proxies.length; i++)
    //    bots.push(new Bot(i));
    var i = 0;
    setInterval(function() {
        i++;
        bots.push(new Bot(i));
    },200);
    for (var i in bots)
        bots[i].connect();
}

io.on('connection', function(socket) {
    users++;
    console.log(('Users Connected: ' + users).cyan);
    sendCountUpdate = function() {

        socket.emit("botCount", connectedCount);
    };
    socket.on('start', function(data) {
        server = data.ip;
        origin = data.origin;
        start();
        console.log(('Location[ServerIp]: ' + server).strikethrough);
        console.log(('Origin[Game]: ' + origin).strikethrough);
        console.log(('Bots Connected!').green);
    });
    socket.on('movement', function(data) {
        xPos = data.x;
        yPos = data.y;
        byteLength = data.byteLength;
    });
    socket.on('split', function() {
        for (var i in bots)
            bots[i].split();
    });
    socket.on('eject', function() {
		for (var i in bots)
            bots[i].eject();
    });
    socket.on('spam', function(data) {
        for(var i in bots)
            bots[i].sendSpam(chatMsg);
    });
});
console.log(('Server Started').green);
console.log(('Listening on port:' + port).yellow);
console.log(('INFO:' + 'If a bot will crash and get error it will retry to connect again in 500ms(miliseconds)').green);
