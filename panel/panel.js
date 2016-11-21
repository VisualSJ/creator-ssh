'use strict';

const Fs = require('fs');

const SSH = Editor.require('packages://ssh/panel/lib/ssh');

var PATH = {
    html: Editor.url('packages://ssh/panel/panel.html'),
    style: Editor.url('packages://ssh/panel/less.css')
};

var id = 1;

var createVM = function (el) {
    return new Vue({
        el: el,

        components: {
            'ssh-menu': Editor.require('packages://ssh/panel/components/menu'),
            'ssh-tabs': Editor.require('packages://ssh/panel/components/tabs'),
            'ssh-terminal': Editor.require('packages://ssh/panel/components/terminal')
        },

        data: {
            menu: false,
            list: [],
            ssh: null,
            active: ''
        },

        watch: {
            active: {
                handler (active) {
                    var currentSSH = null;
                    this.list.some((ssh) => {
                        if (ssh.name === active) {
                            currentSSH = ssh;
                            return true;
                        }
                    });
                    if (!currentSSH) {
                        return this.ssh = null;
                    }
                    this.ssh = currentSSH;
                }
            }
        },

        methods: {
            toggleMenu () {
                this.menu = !this.menu;
            },

            create () {
                var ssh = new SSH();
                ssh.name = `Tab${id++}`;
                this.active = ssh.name;
                this.list.push(ssh);
            },

            connect (options, callback) {
                var currentSSH = null;
                this.list.some((ssh) => {
                    if (ssh.name === this.active) {
                        currentSSH = ssh;
                        return true;
                    }
                });
                if (!currentSSH) {
                    return Editor.error('当前ssh对象丢失，请尝试重新启动。');
                }
                currentSSH.hostname = options.hostname;
                currentSSH.username = options.username;
                currentSSH.password = options.password;
                currentSSH.connect(callback);
            },

            close () {
                this.list.some((ssh, index) => {
                    if (ssh.name === this.active) {
                        this.list.splice(index, 1);
                        ssh.close();
                        return true;
                    }
                });
                if (this.list.length === 0) {
                    this.create();
                }
                this.active = this.list[this.list.length - 1].name;
            }
        }
    });
};


Editor.Panel.extend({
    template: Fs.readFileSync(PATH.html, 'utf-8'),
    style: Fs.readFileSync(PATH.style, 'utf-8'),

    $: {
        'warp': '#warp'
    },

    ready () {
        this.vm = createVM(this.$warp);
        this.vm.create();
    },

    // ipc
    messages: {}
});
