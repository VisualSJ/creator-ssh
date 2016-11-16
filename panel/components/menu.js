'use strict';

exports.template = `
<section class="ssh-menu">
    <div @click="_onToggleMenu">
        <i class="fa fa-bars"></i>
    </div>
    <div @click="_onCreateConnect">
        <i class="fa fa-plus"></i>
        <span>新建连接</span>
    </div>
    <div @click="_onCloseConnect">
        <i class="fa fa-close"></i>
        <span>关闭连接</span>
    </div>
</section>
`;

exports.methods = {
    _onToggleMenu () {
        var parent = this.$parent;
        parent.toggleMenu();
    },

    _onCreateConnect () {
        var parent = this.$parent;
        parent.create();
    },

    _onCloseConnect () {
        var parent = this.$parent;
        parent.close();
    }
};