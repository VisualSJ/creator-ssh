'use strict';

const Events = require('events');
const Client = require('ssh2').Client;

class SSH extends Events.EventEmitter {
    constructor () {
        super();
        this.client = null;
        this.stream = null;

        this._hostname = '';
        this._username = '';
        this._password = '';

        // 是否将消息附加到最后一条上
        this.additional = false;
        this.messages = [];
    }

    set hostname (hostname) {
        this._hostname = hostname;
    }
    get hostname () { return this._hostname; }

    set username (username) {
        this._username = username;
    }
    get username () { return this._username; }

    set password (password) {
        this._password = password;
    }
    get password () { return this._password; }

    connect (callback) {
        if (!this._hostname) {
            return callback('hostname is undefined');
        }
        if (!this._username) {
            return callback('username is undefined');
        }
        if (!this._password) {
            return callback('password is undefined');
        }
        this.client = new Client();

        this.client.on('ready', () => {
            this.client.shell((err, stream) => {
                if (err) {
                    return callback(err);
                }
                callback(null);
                this.stream = stream;
                stream.on('close', () => {
                    this.stream = null;
                }).on('error', function (error) {
                    var string = error + '';
                    this.pushMessage(string);
                }).on('data', (data) => {
                    var string = data + '';
                    this.pushMessage(string);
                }).stderr.on('data', (data) => {
                    var string = data + '';
                    this.pushMessage(string);
                });
                this.stream.write('');
            });

        }).on('error', (error) => {
            callback(error);
        }).connect({
            host: this.hostname,
            port: 22,
            username: this.username,
            password: this.password
        });
    }

    pushMessage (msg) {
        var split = msg.split('\n');
        split.forEach((item) => {
            // 暂时先忽略 \33 文字颜色
            item = item.replace(/\33\[0m/g, '');
            item = item.replace(/\33\[\d{2};\d{2}m/g, '');

            item = item.trim();
            var lastIndex = this.messages.length - 1;
            var lastMsg = this.messages[lastIndex];
            if (this.additional) {
                let msg = this.messages.pop();
                msg = msg || '';
                this.messages.push(msg + item);
                this.additional = false;
            } else if (item !== lastMsg) {
                this.messages.push(item);
            }
        });

        var index = this.messages.length - 1;
        while (this.messages[index] === this.messages[index - 1]) {
            this.messages.pop();
        }
        this.additional = true;
    }

    exec (shell) {
        if (!this.stream) return;
        this.stream.write(shell + '\n');
    }

    close () {
        if (!this.client) return;
        this.client.end();
    }
}

module.exports = SSH;