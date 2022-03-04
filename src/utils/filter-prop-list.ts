export default {
    exact: function (list: any) {
        return list.filter(function (m: any) {
            return m.match(/^[^\*\!]+$/);
        });
    },
    contain: function (list: any) {
        return list.filter(function (m: any) {
            return m.match(/^\*.+\*$/);
        }).map(function (m: any) {
            return m.substr(1, m.length - 2);
        });
    },
    endWith: function (list: any) {
        return list.filter(function (m: any) {
            return m.match(/^\*[^\*]+$/);
        }).map(function (m: any) {
            return m.substr(1);
        });
    },
    startWith: function (list: any) {
        return list.filter(function (m: any) {
            return m.match(/^[^\*\!]+\*$/);
        }).map(function (m: any) {
            return m.substr(0, m.length - 1);
        });
    },
    notExact: function (list: any) {
        return list.filter(function (m: any) {
            return m.match(/^\![^\*].*$/);
        }).map(function (m: any) {
            return m.substr(1);
        });
    },
    notContain: function (list: any) {
        return list.filter(function (m: any) {
            return m.match(/^\!\*.+\*$/);
        }).map(function (m: any) {
            return m.substr(2, m.length - 3);
        });
    },
    notEndWith: function (list: any) {
        return list.filter(function (m: any) {
            return m.match(/^\!\*[^\*]+$/);
        }).map(function (m: any) {
            return m.substr(2);
        });
    },
    notStartWith: function (list: any) {
        return list.filter(function (m: any) {
            return m.match(/^\![^\*]+\*$/);
        }).map(function (m: any) {
            return m.substr(1, m.length - 2);
        });
    }
};
