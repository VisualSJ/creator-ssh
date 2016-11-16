'use strict';

exports.template = `
<section class="ssh-tabs">
    <div class="tabs" v-if="list && list.length">
        <div v-for="item in list" :active="item.name===active" @click="_onSelectTab(item.name)">
            <span>{{item.name}}</span>
        </div>
    </div>
</section>
`;

exports.props = ['active', 'list'];

exports.methods = {
    _onSelectTab (tab) {
        this.$parent.active = tab;
    }
};