'use strict';

exports.template = `
<section class="ssh-terminal">
    <div class="terminal" tabindex="-1" @keypress="_onKeyPress" @keyup="_onKeyUp" v-el:terminal>
        <template v-for="line in messages" track-by="$index">
            <div v-if="$index!==messages.length-1">
                <span>{{_filterDomText(line) || '&nbsp'}}</span>
            </div>
        </template>
        <div>
            <span class="prompt">{{messages[messages.length-1]}}</span>
            <span>{{beforeText}}</span><span class="cursor">{{(cursorText&&cursorText!==' ') ? cursorText : '&nbsp'}}</span><span>{{afterText}}</span>
        </div>
    </div>
    <div class="user" :fold="toolsFold">
        <div>
            <i class="fa fa-magnet" @click="_onToggleTools"></i>
            <ui-input v-value="hostname" v-disabled="toolsLock" placeholder="Host..."></ui-input>
        </div>
        <div>
            <i class="fa fa-user" @click="_onToggleTools"></i>
            <ui-input v-value="username" v-disabled="toolsLock" placeholder="Username..."></ui-input>
        </div>
        <div>
            <i class="fa fa-lock" @click="_onToggleTools" style="position:relative;left:1px;"></i>
            <ui-input v-value="password" v-disabled="toolsLock" placeholder="Password..." password></ui-input>
        </div>
        <div class="button">
            <i class="fa fa-bars">&nbsp</i>
            <ui-button v-disabled="toolsLock" @click="_onConnect">连接</ui-button>
        </div>
    </div>
</section>
`;

exports.props = ['ssh'];

exports.watch = {
    ssh: {
        handler (ssh) {
            if (ssh.client) {
                if (ssh.stream) {
                    this.toolsLock = true;
                    this.toolsFold = true;
                } else {
                    this.toolsLock = true;
                    this.toolsFold = false;
                }
            } else {
                this.toolsLock = false;
                this.toolsFold = false;
            }

            if (ssh) {
                this.messages = ssh.messages;
                this.hostname = ssh.hostname;
                this.username = ssh.username;
                this.password = ssh.password;
            } else {
                this.messages = null;
                this.hostname = '';
                this.username = '';
                this.password = '';
            }
        }
    },

    messages: {
        handler () {
            // this.$els.terminal.scrollTop = this.$els.terminal.scrollHeight;
        }
    }
};

exports.data = function () {
    return {
        messages: [],
        color: 'normal',

        toolsFold: false,
        toolsLock: false,
        beforeText: '',
        cursorText: '',
        afterText: '',

        hostname: '',
        username: '',
        password: ''
    }
};

exports.methods = {
    _onToggleTools () {
        this.toolsFold = !this.toolsFold;
    },

    _onConnect () {
        this.toolsLock = true;
        this.$parent.connect({
            hostname: this.hostname,
            username: this.username,
            password: this.password
        }, (error) => {
            if (error) {
                Editor.error(error);
                this.toolsLock = false;
                this.toolsFold = false;
                return;
            }
            this.toolsFold = true;
        });
    },

    _filterDomText (string) {
        return string;
    },

    _onKeyPress (event) {
        event.stopPropagation();
        event.preventDefault();
        var string = String.fromCharCode(event.keyCode);
        string = string.toUpperCase();
        this._cacheCode = string.charCodeAt(0);

        this.beforeText += String.fromCharCode(event.keyCode);
    },

    _onKeyUp (event) {
        // if (this._cacheCode === event.keyCode) {
        //     return;
        // }
        switch (event.keyCode) {
            case 13:
                let string = this.beforeText + this.cursorText + this.afterText;
                this.ssh.exec(string);
                this.beforeText = '';
                this.cursorText = '';
                this.afterText = '';
                break;
            case 39: // ->
                this.beforeText += this.cursorText;
                this.cursorText = this.afterText.substr(0, 1);
                this.afterText = this.afterText.substr(1, this.afterText.length - 1);
                break;
            case 37: // <-
                if (!this.beforeText) break;
                this.afterText = this.cursorText + this.afterText;
                this.cursorText = this.beforeText.substr(-1);
                this.beforeText = this.beforeText.substr(0, this.beforeText.length - 1);
                break;
            case 8: // backspace
                this.beforeText = this.beforeText.substr(0, this.beforeText.length - 1);
                break;
            case 46: // delete
                this.cursorText = this.afterText.substr(0, 1);
                this.afterText = this.afterText.substr(1, this.afterText.length - 1);
                break;

        }

        console.log(event.keyCode);
    }
};