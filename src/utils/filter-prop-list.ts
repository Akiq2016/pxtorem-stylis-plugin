export default {
  exact: function (list: string[]) {
    return list.filter(function (m: string) {
      return m.match(/^[^\*\!]+$/);
    });
  },
  contain: function (list: string[]) {
    return list.filter(function (m: string) {
      return m.match(/^\*.+\*$/);
    }).map(function (m: string) {
      return m.substr(1, m.length - 2);
    });
  },
  endWith: function (list: string[]) {
    return list.filter(function (m: string) {
      return m.match(/^\*[^\*]+$/);
    }).map(function (m: string) {
      return m.substr(1);
    });
  },
  startWith: function (list: string[]) {
    return list.filter(function (m: string) {
      return m.match(/^[^\*\!]+\*$/);
    }).map(function (m: string) {
      return m.substr(0, m.length - 1);
    });
  },
  notExact: function (list: string[]) {
    return list.filter(function (m: string) {
      return m.match(/^\![^\*].*$/);
    }).map(function (m: string) {
      return m.substr(1);
    });
  },
  notContain: function (list: string[]) {
    return list.filter(function (m: string) {
      return m.match(/^\!\*.+\*$/);
    }).map(function (m: string) {
      return m.substr(2, m.length - 3);
    });
  },
  notEndWith: function (list: string[]) {
    return list.filter(function (m: string) {
      return m.match(/^\!\*[^\*]+$/);
    }).map(function (m: string) {
      return m.substr(2);
    });
  },
  notStartWith: function (list: string[]) {
    return list.filter(function (m: string) {
      return m.match(/^\![^\*]+\*$/);
    }).map(function (m: string) {
      return m.substr(1, m.length - 2);
    });
  }
};
