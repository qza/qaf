/*  Prototype JavaScript framework, version 1.6.1
 *  (c) 2005-2009 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.6.1',

  Browser: (function(){
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile.*Safari/.test(ua)
    }
  })(),

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div');
      var form = document.createElement('form');
      var isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


var Abstract = { };


var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {
  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
(function() {

  var _toString = Object.prototype.toString;

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  function toJSON(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = toJSON(object[property]);
      if (!isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  }

  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  function keys(object) {
    var results = [];
    for (var property in object)
      results.push(property);
    return results;
  }

  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  function clone(object) {
    return extend({ }, object);
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  function isArray(object) {
    return _toString.call(object) == "[object Array]";
  }


  function isHash(object) {
    return object instanceof Hash;
  }

  function isFunction(object) {
    return typeof object === "function";
  }

  function isString(object) {
    return _toString.call(object) == "[object String]";
  }

  function isNumber(object) {
    return _toString.call(object) == "[object Number]";
  }

  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isUndefined:   isUndefined
  });
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());


Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }


  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  function toArray() {
    return this.split('');
  }

  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  function camelize() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  function dasherize() {
    return this.replace(/_/g, '-');
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  function toJSON() {
    return this.inspect(true);
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  function startsWith(pattern) {
    return this.indexOf(pattern) === 0;
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  }

  function empty() {
    return this == '';
  }

  function blank() {
    return /^\s*$/.test(this);
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    strip:          String.prototype.trim ? String.prototype.trim : strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    toJSON:         toJSON,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  function toArray() {
    return this.map();
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  function size() {
    return this.toArray().length;
  }

  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }









  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();
function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  }
  if (!_each) _each = each;

  function clear() {
    this.length = 0;
    return this;
  }

  function first() {
    return this[0];
  }

  function last() {
    return this[this.length - 1];
  }

  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function reverse(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

  function size() {
    return this.length;
  }

  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  function toJSON() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }

  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect,
    toJSON:    toJSON
  });

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }

  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  function set(key, value) {
    return this._object[key] = value;
  }

  function get(key) {
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  function toObject() {
    return Object.clone(this._object);
  }

  function keys() {
    return this.pluck('key');
  }

  function values() {
    return this.pluck('value');
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  function merge(object) {
    return this.clone().update(object);
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values))
          return results.concat(values.map(toQueryPair.curry(key)));
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  function toJSON() {
    return Object.toJSON(this.toObject());
  }

  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toJSON,
    clone:                  clone
  };
})());

Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  function succ() {
    return this + 1;
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  function toJSON() {
    return isFinite(this) ? this.toString() : 'null';
  }

  function abs() {
    return Math.abs(this);
  }

  function round() {
    return Math.round(this);
  }

  function ceil() {
    return Math.ceil(this);
  }

  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    toJSON:         toJSON,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());



var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});
Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];








Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,

  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});



function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}


(function(global) {

  var SETATTRIBUTE_IGNORES_NAME = (function(){
    var elForm = document.createElement("form");
    var elInput = document.createElement("input");
    var root = document.documentElement;
    elInput.setAttribute("name", "test");
    elForm.appendChild(elInput);
    root.appendChild(elForm);
    var isBuggy = elForm.elements
      ? (typeof elForm.elements.test == "undefined")
      : null;
    root.removeChild(elForm);
    elForm = elInput = null;
    return isBuggy;
  })();

  var element = global.Element;
  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (SETATTRIBUTE_IGNORES_NAME && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;
})(this);

Element.cache = { };
Element.idCounter = 1;

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },


  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: (function(){

    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();

    function update(element, content) {
      element = $(element);

      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element;
      }

      if (SELECT_ELEMENT_INNERHTML_BUGGY || TABLE_ELEMENT_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  descendants: function(element) {
    return Element.select(element, "*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = Element.previousSiblings(element);
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = Element.nextSiblings(element);
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },


  select: function(element) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Selector.findChildElements(element, args);
  },

  adjacent: function(element) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while ($(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = Element.getStyle(element, 'display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    if (originalPosition != 'fixed') // Switching fixed to absolute causes issues in Safari
      els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') == 'absolute') return element;

    var offsets = Element.positionedOffset(element);
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') == 'relative') return element;

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);
      if (element.tagName == 'HTML') return $(element); // mhollauf mindmeister fix, see http://dev.rubyonrails.org/ticket/11182

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = $(source);
    var p = Element.viewportOffset(source);

    element = $(element);
    var delta = [0, 0];
    var parent = null;
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,

  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = (function(){

    var classProp = 'className';
    var forProp = 'for';

    var el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div');
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');
            var f;

            if (String(value).indexOf('{') > -1) {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            else if (value === '') {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
          _flag: function(element, attribute) {
            return $(element).hasAttribute(attribute) ? attribute : null;
          },
          style: function(element) {
            return element.style.cssText.toLowerCase();
          },
          title: function(element) {
            return element.title;
          }
        }
      }
    }
  })();

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr2,
      src:         v._getAttr2,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);

  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if ('outerHTML' in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {

  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }

  div = null;

})(document.createElement('div'))

Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2);
        var el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    var element = document.createElement(tagName);
    var proto = element['__proto__'] || element.constructor.prototype;
    element = null;
    return proto;
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;

  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};


document.viewport = {

  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};

  function getRootElement() {
    if (B.WebKit && !doc.evaluate)
      return document;

    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;

    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();

    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }

  viewport.getWidth  = define.curry('Width');

  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  getStorage: function(element) {
    if (!(element = $(element))) return;

    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = [Element.Storage.UID++];
      uid = element._prototypeUID[0];
    }

    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();

    return Element.Storage[uid];
  },

  store: function(element, key, value) {
    if (!(element = $(element))) return;

    if (arguments.length === 2) {
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
    }

    return element;
  },

  retrieve: function(element, key, defaultValue) {
    if (!(element = $(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);

    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }

    return value;
  },

  clone: function(element, deep) {
    if (!(element = $(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  }
});
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: (function() {

    var IS_DESCENDANT_SELECTOR_BUGGY = (function(){
      var isBuggy = false;
      if (document.evaluate && window.XPathResult) {
        var el = document.createElement('div');
        el.innerHTML = '<ul><li></li></ul><div><ul><li></li></ul></div>';

        var xpath = ".//*[local-name()='ul' or local-name()='UL']" +
          "//*[local-name()='li' or local-name()='LI']";

        var result = document.evaluate(xpath, el, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        isBuggy = (result.snapshotLength !== 2);
        el = null;
      }
      return isBuggy;
    })();

    return function() {
      if (!Prototype.BrowserFeatures.XPath) return false;

      var e = this.expression;

      if (Prototype.Browser.WebKit &&
       (e.include("-of-type") || e.include(":empty")))
        return false;

      if ((/(\[[\w-]*?:|:checked)/).test(e))
        return false;

      if (IS_DESCENDANT_SELECTOR_BUGGY) return false;

      return true;
    }

  })(),

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (Selector.CASE_INSENSITIVE_CLASS_NAMES) return false;

    if (!Selector._div) Selector._div = new Element('div');

    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m, len = ps.length, name;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[name]) ? c[name](m) :
            new Template(c[name]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m, len = ps.length, name;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        name = ps[i].name;
        if (m = e.match(ps[i].re)) {
          this.matcher.push(Object.isFunction(x[name]) ? x[name](m) :
            new Template(x[name]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':
        if (root !== document) {
          var oldId = root.id, id = $(root).identify();
          id = id.replace(/([\.:])/g, "\\$1");
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m, len = ps.length, name;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if (m = e.match(p)) {
          if (as[name]) {
            this.tokens.push([name, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

if (Prototype.BrowserFeatures.SelectorsAPI &&
 document.compatMode === 'BackCompat') {
  Selector.CASE_INSENSITIVE_CLASS_NAMES = (function(){
    var div = document.createElement('div'),
     span = document.createElement('span');

    div.id = "prototype_test_id";
    span.className = 'Test';
    div.appendChild(span);
    var isIgnored = (div.querySelector('#prototype_test_id .test') !== null);
    div = span = null;
    return isIgnored;
  })();
}

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v, len = p.length, name;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i = 0; i<len; i++) {
            name = p[i].name
            if (m = e.match(p[i].re)) {
              v = Object.isFunction(x[name]) ? x[name](m) : new Template(x[name]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: [
    { name: 'laterSibling', re: /^\s*~\s*/ },
    { name: 'child',        re: /^\s*>\s*/ },
    { name: 'adjacent',     re: /^\s*\+\s*/ },
    { name: 'descendant',   re: /^\s/ },

    { name: 'tagName',      re: /^\s*(\*|[\w\-]+)(\b|$)?/ },
    { name: 'id',           re: /^#([\w\-\*]+)(\b|$)/ },
    { name: 'className',    re: /^\.([\w\-\*]+)(\b|$)/ },
    { name: 'pseudo',       re: /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/ },
    { name: 'attrPresence', re: /^\[((?:[\w-]+:)?[\w-]+)\]/ },
    { name: 'attr',         re: /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/ }
  ],

  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: (function(){

      var PROPERTIES_ATTRIBUTES_MAP = (function(){
        var el = document.createElement('div'),
            isBuggy = false,
            propName = '_countedByPrototype',
            value = 'x'
        el[propName] = value;
        isBuggy = (el.getAttribute(propName) === value);
        el = null;
        return isBuggy;
      })();

      return PROPERTIES_ATTRIBUTES_MAP ?
        function(nodes) {
          for (var i = 0, node; node = nodes[i]; i++)
            node.removeAttribute('_countedByPrototype');
          return nodes;
        } :
        function(nodes) {
          for (var i = 0, node; node = nodes[i]; i++)
            node._countedByPrototype = void 0;
          return nodes;
        }
    })(),

    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (typeof (n = nodes[i])._countedByPrototype == 'undefined') {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;

      if (root == document) {
        if (!targetNode) return [];
        if (!nodes) return [targetNode];
      } else {
        if (!root.sourceIndex || root.sourceIndex < 1) {
          var nodes = root.getElementsByTagName('*');
          for (var j = 0, node; node = nodes[j]; j++) {
            if (node.id === id) return [node];
          }
        }
      }

      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}

var Form = {
  reset: function(form) {
    form = $(form);
    form.reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    var elements = $(form).getElementsByTagName('*'),
        element,
        arr = [ ],
        serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      arr.push(element);
    }
    return arr.inject([], function(elements, child) {
      if (serializers[child.tagName.toLowerCase()])
        elements.push(Element.extend(child));
      return elements;
    })
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/


Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {

  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
    initialize: function(element, callback, event) {
    this.element  = $(element);
    this.callback = callback;
        this.event = event || 'change'; // mhollauf mindmeister fix - not ignore the parameter for observe_field!

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
(function() {

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: {}
  };

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;

  var _isButton;
  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    _isButton = function(event, code) {
      return event.button === buttonMap[code];
    };
  } else if (Prototype.Browser.WebKit) {
    _isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };
  } else {
    _isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  function isLeftClick(event)   { return _isButton(event, 0) }

  function isMiddleClick(event) { return _isButton(event, 1) }

  function isRightClick(event)  { return _isButton(event, 2) }

  function element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;

    return Element.extend(node);
  }

  function findElement(event, expression) {
    var element = Event.element(event);
    if (!expression) return element;
    var elements = [element].concat(element.ancestors());
    return Selector.findElement(elements, expression, 0);
  }

  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    event.stopped = true;
  }

  Event.Methods = {
    isLeftClick: isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick: isRightClick,

    element: element,
    findElement: findElement,

    pointer: pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };


  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover': element = event.fromElement; break;
        case 'mouseout':  element = event.toElement;   break;
        default: return null;
      }
      return Element.extend(element);
    }

    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    });

    Event.extend = function(event, element) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);

      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      return Object.extend(event, methods);
    };
  } else {
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
    Event.extend = Prototype.K;
  }

  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, 'prototype_event_registry', $H());
    }

    var respondersForEvent = registry.get(eventName);
    if (Object.isUndefined(respondersForEvent)) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent);
    }

    if (respondersForEvent.pluck('handler').include(handler)) return false;

    var responder;
    if (eventName.include(":")) {
      responder = function(event) {
        if (Object.isUndefined(event.eventName))
          return false;

        if (event.eventName !== eventName)
          return false;

        Event.extend(event, element);
        handler.call(element, event);
      };
    } else {
      if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
       (eventName === "mouseenter" || eventName === "mouseleave")) {
        if (eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);

            var parent = event.relatedTarget;
            while (parent && parent !== element) {
              try { parent = parent.parentNode; }
              catch(e) { parent = element; }
            }

            if (parent === element) return;

            handler.call(element, event);
          };
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event);
        };
      }
    }

    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder;
  }

  function _destroyCache() {
    for (var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null;
    }
  }

  var CACHE = [];

  if (Prototype.Browser.IE)
    window.attachEvent('onunload', _destroyCache);

  if (Prototype.Browser.WebKit)
    window.addEventListener('unload', Prototype.emptyFunction, false);


  var _getDOMEventName = Prototype.K;

  if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED) {
    _getDOMEventName = function(eventName) {
      var translations = { mouseenter: "mouseover", mouseleave: "mouseout" };
      return eventName in translations ? translations[eventName] : eventName;
    };
  }

  function observe(element, eventName, handler) {
    element = $(element);

    var responder = _createResponder(element, eventName, handler);

    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.addEventListener)
        element.addEventListener("dataavailable", responder, false);
      else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onfilterchange", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);

      if (element.addEventListener)
        element.addEventListener(actualEventName, responder, false);
      else
        element.attachEvent("on" + actualEventName, responder);
    }

    return element;
  }

  function stopObserving(element, eventName, handler) {
    element = $(element);

    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) return element;

    if (eventName && !handler) {
      var responders = registry.get(eventName);

      if (Object.isUndefined(responders)) return element;

      responders.each( function(r) {
        Element.stopObserving(element, eventName, r.handler);
      });
      return element;
    } else if (!eventName) {
      registry.each( function(pair) {
        var eventName = pair.key, responders = pair.value;

        responders.each( function(r) {
          Element.stopObserving(element, eventName, r.handler);
        });
      });
      return element;
    }

    var responders = registry.get(eventName);

    if (!responders) return;

    var responder = responders.find( function(r) { return r.handler === handler; });
    if (!responder) return element;

    var actualEventName = _getDOMEventName(eventName);

    if (eventName.include(':')) {
      if (element.removeEventListener)
        element.removeEventListener("dataavailable", responder, false);
      else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onfilterchange",  responder);
      }
    } else {
      if (element.removeEventListener)
        element.removeEventListener(actualEventName, responder, false);
      else
        element.detachEvent('on' + actualEventName, responder);
    }

    registry.set(eventName, responders.without(responder));

    return element;
  }

  function fire(element, eventName, memo, bubble) {
    element = $(element);

    if (Object.isUndefined(bubble))
      bubble = true;

    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;

    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent('dataavailable', true, true);
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? 'ondataavailable' : 'onfilterchange';
    }

    event.eventName = eventName;
    event.memo = memo || { };

    if (document.createEvent)
      element.dispatchEvent(event);
    else
      element.fireEvent(event.eventType, event);

    return Event.extend(event);
  }


  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving
  });

  Element.addMethods({
    fire:          fire,

    observe:       observe,

    stopObserving: stopObserving
  });

  Object.extend(document, {
    fire:          fire.methodize(),

    observe:       observe.methodize(),

    stopObserving: stopObserving.methodize(),

    loaded:        false
  });

  if (window.Event) Object.extend(window.Event, Event);
  else window.Event = Event;
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearTimeout(timer);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.stopObserving('readystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try { document.documentElement.doScroll('left'); }
    catch(e) {
      timer = pollDoScroll.defer();
      return;
    }
    fireContentLoadedEvent();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.observe('readystatechange', checkReadyState);
    if (window == top)
      timer = pollDoScroll.defer();
  }

  Event.observe(window, 'load', fireContentLoadedEvent);
})();

Element.addMethods();

/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/
// script.aculo.us effects.js v1.8.3, Thu Oct 08 11:23:33 +0200 2009

// Copyright (c) 2005-2009 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
// Contributors:
//  Justin Palmer (http://encytemedia.com/)
//  Mark Pilgrim (http://diveintomark.org/)
//  Martin Bialasinki
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// converts rgb() and #xxx to #xxxxxx format,
// returns self (or first argument) if not convertable
String.prototype.parseColor = function() {
  var color = '#';
  if (this.slice(0,4) == 'rgb(') {
    var cols = this.slice(4,this.length-1).split(',');
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);
  } else {
    if (this.slice(0,1) == '#') {
      if (this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();
      if (this.length==7) color = this.toLowerCase();
    }
  }
  return (color.length==7 ? color : (arguments[0] || this));
};

/*--------------------------------------------------------------------------*/

Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};

Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

Element.setContentZoom = function(element, percent) {
  element = $(element);
  element.setStyle({fontSize: (percent/100) + 'em'});
  if (Prototype.Browser.WebKit) window.scrollBy(0,0);
  return element;
};

Element.getInlineOpacity = function(element){
  return $(element).style.opacity || '';
};

Element.forceRerendering = function(element) {
  try {
    element = $(element);
    var n = document.createTextNode(' ');
    element.appendChild(n);
    element.removeChild(n);
  } catch(e) { }
};

/*--------------------------------------------------------------------------*/

var Effect = {
  _elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },
  Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) {
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
  },
  DefaultOptions: {
    duration:   1.0,   // seconds
    fps:        100,   // 100= assume 66fps max.
    sync:       false, // true for combining
    from:       0.0,
    to:         1.0,
    delay:      0.0,
    queue:      'parallel'
  },
  tagifyText: function(element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE) tagifyStyle += ';zoom:1';

    element = $(element);
    $A(element.childNodes).each( function(child) {
      if (child.nodeType==3) {
        child.nodeValue.toArray().each( function(character) {
          element.insertBefore(
            new Element('span', {style: tagifyStyle}).update(
              character == ' ' ? String.fromCharCode(160) : character),
              child);
        });
        Element.remove(child);
      }
    });
  },
  multiple: function(element, effect) {
    var elements;
    if (((typeof element == 'object') ||
        Object.isFunction(element)) &&
       (element.length))
      elements = element;
    else
      elements = $(element).childNodes;

    var options = Object.extend({
      speed: 0.1,
      delay: 0.0
    }, arguments[2] || { });
    var masterDelay = options.delay;

    $A(elements).each( function(element, index) {
      new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));
    });
  },
  PAIRS: {
    'slide':  ['SlideDown','SlideUp'],
    'blind':  ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  toggle: function(element, effect, options) {
    element = $(element);
    effect  = (effect || 'appear').toLowerCase();
    
    return Effect[ Effect.PAIRS[ effect ][ element.visible() ? 1 : 0 ] ](element, Object.extend({
      queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
    }, options || {}));
  }
};

Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

/* ------------- core effects ------------- */

Effect.ScopedQueue = Class.create(Enumerable, {
  initialize: function() {
    this.effects  = [];
    this.interval = null;
  },
  _each: function(iterator) {
    this.effects._each(iterator);
  },
  add: function(effect) {
    var timestamp = new Date().getTime();

    var position = Object.isString(effect.options.queue) ?
      effect.options.queue : effect.options.queue.position;

    switch(position) {
      case 'front':
        // move unstarted effects after this effect
        this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
            e.startOn  += effect.finishOn;
            e.finishOn += effect.finishOn;
          });
        break;
      case 'with-last':
        timestamp = this.effects.pluck('startOn').max() || timestamp;
        break;
      case 'end':
        // start effect after last queued effect has finished
        timestamp = this.effects.pluck('finishOn').max() || timestamp;
        break;
    }

    effect.startOn  += timestamp;
    effect.finishOn += timestamp;

    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
      this.effects.push(effect);

    if (!this.interval)
      this.interval = setInterval(this.loop.bind(this), 15);
  },
  remove: function(effect) {
    this.effects = this.effects.reject(function(e) { return e==effect });
    if (this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  loop: function() {
    var timePos = new Date().getTime();
    for(var i=0, len=this.effects.length;i<len;i++)
      this.effects[i] && this.effects[i].loop(timePos);
  }
});

Effect.Queues = {
  instances: $H(),
  get: function(queueName) {
    if (!Object.isString(queueName)) return queueName;

    return this.instances.get(queueName) ||
      this.instances.set(queueName, new Effect.ScopedQueue());
  }
};
Effect.Queue = Effect.Queues.get('global');

Effect.Base = Class.create({
  position: null,
  start: function(options) {
    if (options && options.transition === false) options.transition = Effect.Transitions.linear;
    this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
    this.currentFrame = 0;
    this.state        = 'idle';
    this.startOn      = this.options.delay*1000;
    this.finishOn     = this.startOn+(this.options.duration*1000);
    this.fromToDelta  = this.options.to-this.options.from;
    this.totalTime    = this.finishOn-this.startOn;
    this.totalFrames  = this.options.fps*this.options.duration;

    this.render = (function() {
      function dispatch(effect, eventName) {
        if (effect.options[eventName + 'Internal'])
          effect.options[eventName + 'Internal'](effect);
        if (effect.options[eventName])
          effect.options[eventName](effect);
      }

      return function(pos) {
        if (this.state === "idle") {
          this.state = "running";
          dispatch(this, 'beforeSetup');
          if (this.setup) this.setup();
          dispatch(this, 'afterSetup');
        }
        if (this.state === "running") {
          pos = (this.options.transition(pos) * this.fromToDelta) + this.options.from;
          this.position = pos;
          dispatch(this, 'beforeUpdate');
          if (this.update) this.update(pos);
          dispatch(this, 'afterUpdate');
        }
      };
    })();

    this.event('beforeStart');
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).add(this);
  },
  loop: function(timePos) {
    if (timePos >= this.startOn) {
      if (timePos >= this.finishOn) {
        this.render(1.0);
        this.cancel();
        this.event('beforeFinish');
        if (this.finish) this.finish();
        this.event('afterFinish');
        return;
      }
      var pos   = (timePos - this.startOn) / this.totalTime,
          frame = (pos * this.totalFrames).round();
      if (frame > this.currentFrame) {
        this.render(pos);
        this.currentFrame = frame;
      }
    }
  },
  cancel: function() {
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
  },
  event: function(eventName) {
    if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
    if (this.options[eventName]) this.options[eventName](this);
  },
  inspect: function() {
    var data = $H();
    for(property in this)
      if (!Object.isFunction(this[property])) data.set(property, this[property]);
    return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
  }
});

Effect.Parallel = Class.create(Effect.Base, {
  initialize: function(effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
  },
  update: function(position) {
    this.effects.invoke('render', position);
  },
  finish: function(position) {
    this.effects.each( function(effect) {
      effect.render(1.0);
      effect.cancel();
      effect.event('beforeFinish');
      if (effect.finish) effect.finish(position);
      effect.event('afterFinish');
    });
  }
});

Effect.Tween = Class.create(Effect.Base, {
  initialize: function(object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(),
      options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) :
      function(value) { object[method] = value };
    this.start(Object.extend({ from: from, to: to }, options || { }));
  },
  update: function(position) {
    this.method(position);
  }
});

Effect.Event = Class.create(Effect.Base, {
  initialize: function() {
    this.start(Object.extend({ duration: 0 }, arguments[0] || { }));
  },
  update: Prototype.emptyFunction
});

Effect.Opacity = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    // make this work on IE on elements without 'layout'
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
      this.element.setStyle({zoom: 1});
    var options = Object.extend({
      from: this.element.getOpacity() || 0.0,
      to:   1.0
    }, arguments[1] || { });
    this.start(options);
  },
  update: function(position) {
    this.element.setOpacity(position);
  }
});

Effect.Move = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
    this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    this.element.setStyle({
      left: (this.options.x  * position + this.originalLeft).round() + 'px',
      top:  (this.options.y  * position + this.originalTop).round()  + 'px'
    });
  }
});

// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {
  return new Effect.Move(element,
    Object.extend({ x: toLeft, y: toTop }, arguments[3] || { }));
};

Effect.Scale = Class.create(Effect.Base, {
  initialize: function(element, percent) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      scaleX: true,
      scaleY: true,
      scaleContent: true,
      scaleFromCenter: false,
      scaleMode: 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom: 100.0,
      scaleTo:   percent
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');

    this.originalStyle = { };
    ['top','left','width','height','fontSize'].each( function(k) {
      this.originalStyle[k] = this.element.style[k];
    }.bind(this));

    this.originalTop  = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;

    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em','px','%','pt'].each( function(fontSizeType) {
      if (fontSize.indexOf(fontSizeType)>0) {
        this.fontSize     = parseFloat(fontSize);
        this.fontSizeType = fontSizeType;
      }
    }.bind(this));

    this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;

    this.dims = null;
    if (this.options.scaleMode=='box')
      this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
      this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
      this.dims = [this.options.scaleMode.originalHeight,
                   this.options.scaleMode.originalWidth];
  },
  update: function(position) {
    var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
      this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
  },
  finish: function(position) {
    if (this.restoreAfterFinish) this.element.setStyle(this.originalStyle);
  },
  setDimensions: function(height, width) {
    var d = { };
    if (this.options.scaleX) d.width = width.round() + 'px';
    if (this.options.scaleY) d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
      var topd  = (height - this.dims[0])/2;
      var leftd = (width  - this.dims[1])/2;
      if (this.elementPositioning == 'absolute') {
        if (this.options.scaleY) d.top = this.originalTop-topd + 'px';
        if (this.options.scaleX) d.left = this.originalLeft-leftd + 'px';
      } else {
        if (this.options.scaleY) d.top = -topd + 'px';
        if (this.options.scaleX) d.left = -leftd + 'px';
      }
    }
    this.element.setStyle(d);
  }
});

Effect.Highlight = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if (this.element.getStyle('display')=='none') { this.cancel(); return; }
    // Disable background image during the effect
    this.oldStyle = { };
    if (!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle('background-image');
      this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
      this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
      this.options.restorecolor = this.element.getStyle('background-color');
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
    this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){
      return m+((this._base[i]+(this._delta[i]*position)).round().toColorPart()); }.bind(this)) });
  },
  finish: function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor: this.options.restorecolor
    }));
  }
});

Effect.ScrollTo = function(element) {
  var options = arguments[1] || { },
  scrollOffsets = document.viewport.getScrollOffsets(),
  elementOffsets = $(element).cumulativeOffset();

  if (options.offset) elementOffsets[1] += options.offset;

  return new Effect.Tween(null,
    scrollOffsets.top,
    elementOffsets[1],
    options,
    function(p){ scrollTo(scrollOffsets.left, p.round()); }
  );
};

// mhollauf added for MindMeister from http://pastie.caboo.se/36461
Effect.Scroll = Class.create();
Object.extend(Object.extend(Effect.Scroll.prototype, Effect.Base.prototype), {
  initialize: function(element) {
    this.element = $(element);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'absolute'
    } , arguments[1] || {}  );
    this.start(options);
  },
  setup: function() {
    if (this.options.continuous && !this.element._ext ) {
      this.element.cleanWhitespace();
      this.element._ext=true;
      this.element.appendChild(this.element.firstChild);
    }

    this.originalLeft=this.element.scrollLeft;
    this.originalTop=this.element.scrollTop;

    if(this.options.mode == 'absolute') {
      this.options.x -= this.originalLeft;
      this.options.y -= this.originalTop;
    } else {

    }
  },
  update: function(position) {
    this.element.scrollLeft = this.options.x * position + this.originalLeft;
    this.element.scrollTop  = this.options.y * position + this.originalTop;
  }
});

/* ------------- combination effects ------------- */

Effect.Fade = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  var options = Object.extend({
    from: element.getOpacity() || 1.0,
    to:   0.0,
    afterFinishInternal: function(effect) {
      if (effect.options.to!=0) return;
      effect.element.hide().setStyle({opacity: oldOpacity});
    }
  }, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Appear = function(element) {
  element = $(element);
  var options = Object.extend({
  from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),
  to:   1.0,
  // force Safari to render floated elements properly
  afterFinishInternal: function(effect) {
    effect.element.forceRerendering();
  },
  beforeSetup: function(effect) {
    effect.element.setOpacity(effect.options.from).show();
  }}, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Puff = function(element) {
  element = $(element);
  var oldStyle = {
    opacity: element.getInlineOpacity(),
    position: element.getStyle('position'),
    top:  element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height
  };
  return new Effect.Parallel(
   [ new Effect.Scale(element, 200,
      { sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }),
     new Effect.Opacity(element, { sync: true, to: 0.0 } ) ],
     Object.extend({ duration: 1.0,
      beforeSetupInternal: function(effect) {
        Position.absolutize(effect.effects[0].element);
      },
      afterFinishInternal: function(effect) {
         effect.effects[0].element.hide().setStyle(oldStyle); }
     }, arguments[1] || { })
   );
};

Effect.BlindUp = function(element) {
  element = $(element);
  element.makeClipping();
  return new Effect.Scale(element, 0,
    Object.extend({ scaleContent: false,
      scaleX: false,
      restoreAfterFinish: true,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping();
      }
    }, arguments[1] || { })
  );
};

Effect.BlindDown = function(element) {
  element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: 0,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
    }
  }, arguments[1] || { }));
};

Effect.SwitchOff = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  return new Effect.Appear(element, Object.extend({
    duration: 0.4,
    from: 0,
    transition: Effect.Transitions.flicker,
    afterFinishInternal: function(effect) {
      new Effect.Scale(effect.element, 1, {
        duration: 0.3, scaleFromCenter: true,
        scaleX: false, scaleContent: false, restoreAfterFinish: true,
        beforeSetup: function(effect) {
          effect.element.makePositioned().makeClipping();
        },
        afterFinishInternal: function(effect) {
          effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }
      });
    }
  }, arguments[1] || { }));
};

Effect.DropOut = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left'),
    opacity: element.getInlineOpacity() };
  return new Effect.Parallel(
    [ new Effect.Move(element, {x: 0, y: 100, sync: true }),
      new Effect.Opacity(element, { sync: true, to: 0.0 }) ],
    Object.extend(
      { duration: 0.5,
        beforeSetup: function(effect) {
          effect.effects[0].element.makePositioned();
        },
        afterFinishInternal: function(effect) {
          effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
        }
      }, arguments[1] || { }));
};

Effect.Shake = function(element) {
  element = $(element);
  var options = Object.extend({
    distance: 20,
    duration: 0.5
  }, arguments[1] || {});
  var distance = parseFloat(options.distance);
  var split = parseFloat(options.duration) / 10.0;
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left') };
    return new Effect.Move(element,
      { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
        effect.element.undoPositioned().setStyle(oldStyle);
  }}); }}); }}); }}); }}); }});
};

Effect.SlideDown = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
    }, arguments[1] || { })
  );
};

Effect.SlideUp = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false,
    scaleX: false,
    scaleMode: 'box',
    scaleFrom: 100,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }
   }, arguments[1] || { })
  );
};

// Bug in opera makes the TD containing this element expand for a instance after finish
Effect.Squish = function(element) {
  return new Effect.Scale(element, window.opera ? 1 : 0, {
    restoreAfterFinish: true,
    beforeSetup: function(effect) {
      effect.element.makeClipping();
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping();
    }
  });
};

Effect.Grow = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.full
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var initialMoveX, initialMoveY;
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      initialMoveX = initialMoveY = moveX = moveY = 0;
      break;
    case 'top-right':
      initialMoveX = dims.width;
      initialMoveY = moveY = 0;
      moveX = -dims.width;
      break;
    case 'bottom-left':
      initialMoveX = moveX = 0;
      initialMoveY = dims.height;
      moveY = -dims.height;
      break;
    case 'bottom-right':
      initialMoveX = dims.width;
      initialMoveY = dims.height;
      moveX = -dims.width;
      moveY = -dims.height;
      break;
    case 'center':
      initialMoveX = dims.width / 2;
      initialMoveY = dims.height / 2;
      moveX = -dims.width / 2;
      moveY = -dims.height / 2;
      break;
  }

  return new Effect.Move(element, {
    x: initialMoveX,
    y: initialMoveY,
    duration: 0.01,
    beforeSetup: function(effect) {
      effect.element.hide().makeClipping().makePositioned();
    },
    afterFinishInternal: function(effect) {
      new Effect.Parallel(
        [ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),
          new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),
          new Effect.Scale(effect.element, 100, {
            scaleMode: { originalHeight: dims.height, originalWidth: dims.width },
            sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
        ], Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show();
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
             }
           }, options)
      );
    }
  });
};

Effect.Shrink = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.none
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      moveX = moveY = 0;
      break;
    case 'top-right':
      moveX = dims.width;
      moveY = 0;
      break;
    case 'bottom-left':
      moveX = 0;
      moveY = dims.height;
      break;
    case 'bottom-right':
      moveX = dims.width;
      moveY = dims.height;
      break;
    case 'center':
      moveX = dims.width / 2;
      moveY = dims.height / 2;
      break;
  }

  return new Effect.Parallel(
    [ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),
      new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),
      new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
    ], Object.extend({
         beforeStartInternal: function(effect) {
           effect.effects[0].element.makePositioned().makeClipping();
         },
         afterFinishInternal: function(effect) {
           effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
       }, options)
  );
};

Effect.Pulsate = function(element) {
  element = $(element);
  var options    = arguments[1] || { },
    oldOpacity = element.getInlineOpacity(),
    transition = options.transition || Effect.Transitions.linear,
    reverser   = function(pos){
      return 1 - transition((-Math.cos((pos*(options.pulses||5)*2)*Math.PI)/2) + .5);
    };

  return new Effect.Opacity(element,
    Object.extend(Object.extend({  duration: 2.0, from: 0,
      afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
    }, options), {transition: reverser}));
};

Effect.Fold = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height };
  element.makeClipping();
  return new Effect.Scale(element, 5, Object.extend({
    scaleContent: false,
    scaleX: false,
    afterFinishInternal: function(effect) {
    new Effect.Scale(element, 1, {
      scaleContent: false,
      scaleY: false,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping().setStyle(oldStyle);
      } });
  }}, arguments[1] || { }));
};

Effect.Morph = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[1] || { });

    if (!Object.isString(options.style)) this.style = $H(options.style);
    else {
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        };
      }
    }
    this.start(options);
  },

  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 );
      });
    }
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;

      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      } else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }

      var originalValue = this.element.getStyle(property);
      return {
        style: property.camelize(),
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0),
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      );
    });
  },
  update: function(position) {
    var style = { }, transform, i = this.transforms.length;
    while(i--)
      style[(transform = this.transforms[i]).style] =
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) +
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
  }
});

Effect.Transform = Class.create({
  initialize: function(tracks){
    this.tracks  = [];
    this.options = arguments[1] || { };
    this.addTracks(tracks);
  },
  addTracks: function(tracks){
    tracks.each(function(track){
      track = $H(track);
      var data = track.values().first();
      this.tracks.push($H({
        ids:     track.keys().first(),
        effect:  Effect.Morph,
        options: { style: data }
      }));
    }.bind(this));
    return this;
  },
  play: function(){
    return new Effect.Parallel(
      this.tracks.map(function(track){
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function(e){ return new effect(e, Object.extend({ sync:true }, options)) });
      }).flatten(),
      this.options
    );
  }
});

Element.CSS_PROPERTIES = $w(
  'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' +
  'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
  'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
  'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
  'fontSize fontWeight height left letterSpacing lineHeight ' +
  'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
  'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
  'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
  'right textIndent top width wordSpacing zIndex');

Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;

String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function(){
  var style, styleRules = $H();
  if (Prototype.Browser.WebKit)
    style = new Element('div',{style:this}).style;
  else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    style = String.__parseStyleElement.childNodes[0].style;
  }

  Element.CSS_PROPERTIES.each(function(property){
    if (style[property]) styleRules.set(property, style[property]);
  });

  if (Prototype.Browser.IE && this.include('opacity'))
    styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);

  return styleRules;
};

if (document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(element) {
    var css = document.defaultView.getComputedStyle($(element), null);
    return Element.CSS_PROPERTIES.inject({ }, function(styles, property) {
      styles[property] = css[property];
      return styles;
    });
  };
} else {
  Element.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = Element.CSS_PROPERTIES.inject({ }, function(results, property) {
      results[property] = css[property];
      return results;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
}

Effect.Methods = {
  morph: function(element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || { }));
    return element;
  },
  visualEffect: function(element, effect, options) {
    element = $(element);
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
  },
  highlight: function(element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
  }
};

$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
  'pulsate shake puff squish switchOff dropOut').each(
  function(effect) {
    Effect.Methods[effect] = function(element, options){
      element = $(element);
      Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
      return element;
    };
  }
);

$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each(
  function(f) { Effect.Methods[f] = Element[f]; }
);

Element.addMethods(Effect.Methods);
// Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//           (c) 2005 Sammi Williams (http://www.oriontransfer.co.nz, sammi@oriontransfer.co.nz)
// 
// See scriptaculous.js for full license.

/* Sebastian Zaha, 18.01.07
 *   * modified Draggables so that the listeners for mousemove, mouseup and keyup are not active
 *     at all times
 *     * moved content from (un)register to _(un)observe
 *     * the said functions are called when activeDraggable is modified -> set to an existing element or to null.
 * 
 * Sebastian Zaha, 06.03.07
 *   * added option to draggable so that for draggable nodes, we call our own findAffected method.
 *   * !!!! ATTENTION: if nodes will be able to be dragged on something else than other nodes and canvas, this 
 *     has to be redone. Very hackish!
 */

/*--------------------------------------------------------------------------*/

if(typeof Effect == 'undefined')
    throw("dragdrop.js requires including script.aculo.us' effects.js library");

var Droppables = {
    drops: [],

    remove: function(element) {
        this.drops = this.drops.reject(function(d) { return d.element==$(element); });
    },

    add: function(element) {
        element = $(element);
        var options = Object.extend({
            greedy:     true,
            hoverclass: null,
            tree:       false,
            /* <sebi orig="mhollauf" for="mindmeister"> */
            isAffected: Droppables.isAffected
            /* </sebi> */
        }, arguments[1] || {});

    // cache containers
        if(options.containment) {
            options._containers = [];
            var containment = options.containment;
            if((typeof containment == 'object') &&
               (containment.constructor == Array)) {
                containment.each( function(c) { options._containers.push($(c)); });
            } else {
                options._containers.push($(containment));
            }
        }

        if(options.accept) options.accept = [options.accept].flatten();

        Element.makePositioned(element); // fix IE
        options.element = element;

        this.drops.push(options);
    },

    findDeepestChild: function(drops) {
        deepest = drops[0];

        for (i = 1; i < drops.length; ++i)
            if (Element.isParent(drops[i].element, deepest.element))
                deepest = drops[i];

        return deepest;
    },

    isContained: function(element, drop) {
        var containmentNode;
        if(drop.tree) {
            containmentNode = element.treeNode;
        } else {
            containmentNode = element.parentNode;
        }
        return drop._containers.detect(function(c) { return containmentNode == c; });
    },

    isAffected: function(point, element, drop) {
        return (
                (drop.element!=element) &&
                ((!drop._containers) ||
                 this.isContained(element, drop)) &&
                ((!drop.accept) ||
                 (Element.classNames(element).detect(
                         function(v) { return drop.accept.include(v); } ) )) &&
                Position.within(drop.element, point[0], point[1]) );
    },

    deactivate: function(drop) {
        if(drop.hoverclass)
            Element.removeClassName(drop.element, drop.hoverclass);
        this.last_active = null;
    },

    activate: function(drop) {
        if(drop.hoverclass)
            Element.addClassName(drop.element, drop.hoverclass);
        this.last_active = drop;
    },

    show: function(point, element, customFindAffected) {
        if(!this.drops.length) return;
        var affected = [], affectedElement;

        if(this.last_active) this.deactivate(this.last_active);
        if (customFindAffected) {
            if (affectedElement = customFindAffected(point)) {
                affected.push(this.drops.detect(function(el) { return el.element == affectedElement; } ));
            }
        } else {
            this.drops.each( function(drop) {
                if (drop.isAffected(point, element, drop)) {
                    affected.push(drop);
                    if (drop.greedy) throw $break;
                }
            });
        }

        if(affected.length>0) {
            drop = Droppables.findDeepestChild(affected);
            Position.within(drop.element, point[0], point[1]);
            if(drop.onHover)
                drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));

            Droppables.activate(drop);
        }
    },

    fire: function(event, element) {
        if(!this.last_active) return;
        Position.prepare();

        if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
            if (this.last_active.onDrop)
                this.last_active.onDrop(element, this.last_active.element, event);
    },

    reset: function() {
        if(this.last_active)
            this.deactivate(this.last_active);
    }
};

var Draggables = {
    drags: [],
    observers: [],

    register: function(draggable) {
        if(this.drags.length == 0) {
            this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
            this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
            this.eventKeypress  = this.keyPress.bindAsEventListener(this);
        }
        this.drags.push(draggable);
    },

    unregister: function(draggable) {
        this.drags = this.drags.reject(function(d) { return d == draggable; });
    },

    _observe : function() {
        document.observe("mouseup", this.eventMouseUp);
        document.observe("mousemove", this.eventMouseMove);
        document.observe("keypress", this.eventKeypress);
    },

    _unobserve : function() {
        document.stopObserving("mouseup", this.eventMouseUp);
        document.stopObserving("mousemove", this.eventMouseMove);
        document.stopObserving("keypress", this.eventKeypress);
    },

    activate: function(draggable) {
        if(draggable.options.delay) {
            this._timeout = setTimeout(function() {
                Draggables._timeout = null;
                window.focus();
                Draggables.activeDraggable = draggable;
            }.bind(this), draggable.options.delay);
        } else {
            window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
            this.activeDraggable = draggable;
        }
        this._observe();
    },

    deactivate: function() {
        this.activeDraggable = null;
        this._unobserve();
    },

    updateDrag: function(event) {
        if(!this.activeDraggable) return;
        var pointer = [Event.pointerX(event), Event.pointerY(event)];
    // Mozilla-based browsers fire successive mousemove events with
        // the same coordinates, prevent needless redrawing (moz bug?)
        if(this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) return;
        this._lastPointer = pointer;

        this.activeDraggable.updateDrag(event, pointer);
    },

    endDrag: function(event) {
        if(this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        if(!this.activeDraggable) return;
        this._lastPointer = null;
        this.activeDraggable.endDrag(event);
        this.activeDraggable = null;
        this._unobserve();
    },

    keyPress: function(event) {
        if(this.activeDraggable)
            this.activeDraggable.keyPress(event);
    },

    addObserver: function(observer) {
        this.observers.push(observer);
        this._cacheObserverCallbacks();
    },

    removeObserver: function(element) {  // element instead of observer fixes mem leaks
        this.observers = this.observers.reject( function(o) { return o.element == element; });
        this._cacheObserverCallbacks();
    },

    notify: function(eventName, draggable, event) {  // 'onStart', 'onEnd', 'onDrag'
        if(this[eventName+'Count'] > 0)
            this.observers.each( function(o) {
                if(o[eventName]) o[eventName](eventName, draggable, event);
            });
        if(draggable.options[eventName]) draggable.options[eventName](draggable, event);
    },

    _cacheObserverCallbacks: function() {
        ['onStart','onEnd','onDrag'].each( function(eventName) {
            Draggables[eventName+'Count'] = Draggables.observers.select(
                    function(o) { return o[eventName]; }
                    ).length;
        });
    }
};

/*--------------------------------------------------------------------------*/

var Draggable = Class.create();
Draggable._dragging    = {};
Draggable._revertCache = {};

Draggable.prototype = {
    initialize: function(element) {
        var defaults = {
            handle: false,
            reverteffect: function(element, top_offset, left_offset) {
                var dur = Math.sqrt(Math.abs(top_offset^2)+Math.abs(left_offset^2))*0.02;
                Draggable._revertCache[element] =
                new Effect.Move(element, { x: -left_offset, y: -top_offset, duration: dur,
                    queue: {scope:'_draggable', position:'end'}
                });
            },
            endeffect: function(element) {
                var toOpacity = typeof element._opacity == 'number' ? element._opacity : 1.0;
                new Effect.Opacity(element, {duration:0.2, from:0.7, to:toOpacity,
                    queue: {scope:'_draggable', position:'end'},
                    afterFinish: function(){
                        Draggable._dragging[element] = false;
                    }
                });
            },
            zindex: 1000,
            revert: false,
            quiet: false,
            scroll: false,
            scrollSensitivity: 20,
            scrollSpeed: 15,
            snap: false,  // false, or xy or [x,y] or function(x,y){ return [x,y] }
            delay: 0
        };

        if(!arguments[1] || typeof arguments[1].endeffect == 'undefined')
            Object.extend(defaults, {
                starteffect: function(element) {
                    element._opacity = Element.getOpacity(element);
                    Draggable._dragging[element] = true;
                    new Effect.Opacity(element, {duration:0.2, from:element._opacity, to:0.7});
                }
            });

        var options = Object.extend(defaults, arguments[1] || {});

        this.element = $(element);

        if(options.handle && (typeof options.handle == 'string'))
            this.handle = this.element.down('.'+options.handle, 0);

        if(!this.handle) this.handle = $(options.handle);
        if(!this.handle) this.handle = this.element;

        if(options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
            options.scroll = $(options.scroll);
            this._isScrollChild = Element.childOf(this.element, options.scroll);
        }

        Element.makePositioned(this.element); // fix IE

        this.delta    = this.currentDelta();
        this.options  = options;
        this.dragging = false;

        this.eventMouseDown = this.initDrag.bindAsEventListener(this);
        this.handle.observe("mousedown", this.eventMouseDown);

        Draggables.register(this);
    },

    disableDragging: function() {
        this.handle.stopObserving("mousedown", this.eventMouseDown);
    },

    enableDragging: function() {
        this.handle.observe("mousedown", this.eventMouseDown);
    },

    destroy: function() {
        this.handle.stopObserving("mousedown", this.eventMouseDown);
        Draggables.unregister(this);
    },

    currentDelta: function() {
        return([
            parseInt(Element.getStyle(this.element,'left') || '0'),
            parseInt(Element.getStyle(this.element,'top') || '0')]);
    },

    initDrag: function(event) {
        if(typeof Draggable._dragging[this.element] != 'undefined' &&
           Draggable._dragging[this.element]) return;
        if(Event.isLeftClick(event)) {
            // abort on form elements, fixes a Firefox issue
            var src = Event.element(event);
            if((tag_name = src.tagName.toUpperCase()) && (
                    tag_name=='INPUT' ||
                    tag_name=='SELECT' ||
                    tag_name=='OPTION' ||
                    tag_name=='BUTTON' ||
                    tag_name=='TEXTAREA')) return;

            if(Draggable._revertCache[this.element]) {
                Draggable._revertCache[this.element].cancel();
                Draggable._revertCache[this.element] = null;
            }

            var pointer = [Event.pointerX(event), Event.pointerY(event)];
            var pos     = Position.cumulativeOffset(this.element);
            this.offset = [0,1].map( function(i) { return (pointer[i] - pos[i]); });

            /* <sebi for="mindmeister"> */
            this.element.offset = this.offset;
            /* </sebi> */

            Draggables.activate(this);
            Event.stop(event);
        }
    },

    startDrag: function(event) {
        this.dragging = true;

        if(this.options.zindex) {
            this.originalZ = parseInt(Element.getStyle(this.element,'z-index') || 0);
            this.element.style.zIndex = this.options.zindex;
        }

        if(this.options.ghosting) {
            this._clone = this.element.cloneNode(true);
            if (this.element._listener)
                this._clone.style.color = "#ccc"; // mhollauf mindmeister
            Position.absolutize(this.element);
            this.element.parentNode.insertBefore(this._clone, this.element);
        }

        if(this.options.scroll) {
            if (this.options.scroll == window) {
                var where = this._getWindowScroll(this.options.scroll);
                this.originalScrollLeft = where.left;
                this.originalScrollTop = where.top;
            } else {
                this.originalScrollLeft = this.options.scroll.scrollLeft;
                this.originalScrollTop = this.options.scroll.scrollTop;
            }
        }

        Draggables.notify('onStart', this, event);
        if(this.options.starteffect) this.options.starteffect(this.element);
    },

    updateDrag: function(event, pointer) {
        if(!this.dragging) this.startDrag(event);

        if(!this.options.quiet){
            Position.prepare();
            Droppables.show(pointer, this.element, this.options.customFindAffected);
        }

        Draggables.notify('onDrag', this, event);

        this.draw(pointer);
        if(this.options.change) this.options.change(this);

        if(this.options.scroll) {
            this.stopScrolling();

            var p;
            if (this.options.scroll == window) {
                with(this._getWindowScroll(this.options.scroll)) { p = [ left, top, left+width, top+height ]; }
            } else {
                p = Position.page(this.options.scroll);
                p[0] += this.options.scroll.scrollLeft + Position.deltaX;
                p[1] += this.options.scroll.scrollTop + Position.deltaY;
                p.push(p[0]+this.options.scroll.offsetWidth);
                p.push(p[1]+this.options.scroll.offsetHeight);
            }
            var speed = [0,0];
            if(pointer[0] < (p[0]+this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[0]+this.options.scrollSensitivity);
            if(pointer[1] < (p[1]+this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[1]+this.options.scrollSensitivity);
            if(pointer[0] > (p[2]-this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[2]-this.options.scrollSensitivity);
            if(pointer[1] > (p[3]-this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[3]-this.options.scrollSensitivity);
            this.startScrolling(speed);
        }
    
    // fix AppleWebKit rendering
        if(Prototype.Browser.WebKit) window.scrollBy(0,0);

        Event.stop(event);
    },

    finishDrag: function(event, success) {
        this.dragging = false;

        if(this.options.quiet){
            Position.prepare();
            var pointer = [Event.pointerX(event), Event.pointerY(event)];
            Droppables.show(pointer, this.element);
        }

        if(this.options.ghosting) {
            if (!this.element._listener)
                Position.relativize(this.element);
            Element.remove(this._clone);
            this._clone = null;
        }

        var dropped = false;
        if(success) {
            dropped = Droppables.fire(event, this.element);
            if (!dropped) dropped = false;
        }
        if(dropped && this.options.onDropped) this.options.onDropped(this.element);
        Draggables.notify('onEnd', this, event);

        var revert = this.options.revert;
        if(revert && typeof revert == 'function') revert = revert(this.element);

        var d = this.currentDelta();
        if(revert && this.options.reverteffect) {
            if (dropped == 0 || revert != 'failure')
                this.options.reverteffect(this.element,
                        d[1]-this.delta[1], d[0]-this.delta[0]);
        } else {
            this.delta = d;
        }

        if(this.options.zindex)
            this.element.style.zIndex = this.originalZ;

        if(this.options.endeffect)
            this.options.endeffect(this.element);

        Draggables.deactivate(this);
        Droppables.reset();
    },

    keyPress: function(event) {
        if(event.keyCode!=Event.KEY_ESC) return;
        this.finishDrag(event, false);
        Event.stop(event);
    },

    endDrag: function(event) {
        if(!this.dragging) return;
        this.stopScrolling();
        this.finishDrag(event, true);
        Event.stop(event);
    },

    draw: function(point) {
        var pos = Position.cumulativeOffset(this.element);
        var d = this.currentDelta();
        pos[0] -= d[0]; pos[1] -= d[1];

        if (this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
            pos[0] -= this.options.scroll.scrollLeft-this.originalScrollLeft;
            pos[1] -= this.options.scroll.scrollTop-this.originalScrollTop;
        }
        if (this.options.scroll && this.options.scroll.id=="share_friends") { // mhollauf mindmeister so drags in share dialog are positioned properly when scrolled down
            pos[1] += this.options.scroll.scrollTop;
        }

        var p = [0,1].map(function(i){
            return (point[i]-pos[i]-this.offset[i]);
        }.bind(this));

        if(this.options.snap) {
            if(typeof this.options.snap == 'function') {
                p = this.options.snap(p[0],p[1],this);
            } else {
                if(this.options.snap instanceof Array) {
                    p = p.map( function(v, i) {
                        return Math.round(v/this.options.snap[i])*this.options.snap[i]; }.bind(this));
                } else {
                    p = p.map( function(v) {
                        return Math.round(v/this.options.snap)*this.options.snap; }.bind(this));
                }
            }}

        var style = this.element.style;
        if((!this.options.constraint) || (this.options.constraint=='horizontal'))
            style.left = p[0] + "px";
        if((!this.options.constraint) || (this.options.constraint=='vertical'))
            style.top  = p[1] + "px";

        if(style.visibility=="hidden") style.visibility = ""; // fix gecko rendering
    },

    stopScrolling: function() {
        if(this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
            Draggables._lastScrollPointer = null;
        }
    },

    startScrolling: function(speed) {
        if(!(speed[0] || speed[1])) return;
        this.scrollSpeed = [speed[0]*this.options.scrollSpeed,speed[1]*this.options.scrollSpeed];
        this.lastScrolled = new Date();
        this.scrollInterval = setInterval(this.scroll.bind(this), 10);
    },

    scroll: function() {
        var current = new Date();
        var delta = current - this.lastScrolled;
        this.lastScrolled = current;
        if(this.options.scroll == window) {
            with (this._getWindowScroll(this.options.scroll)) {
                if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
                    var d = delta / 1000;
                    this.options.scroll.scrollTo( left + d*this.scrollSpeed[0], top + d*this.scrollSpeed[1] );
                }
            }
        } else {
            this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;
            this.options.scroll.scrollTop  += this.scrollSpeed[1] * delta / 1000;
        }

        Position.prepare();
        Droppables.show(Draggables._lastPointer, this.element);
        Draggables.notify('onDrag', this);
        if (this._isScrollChild) {
            Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
            Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;
            Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;
            if (Draggables._lastScrollPointer[0] < 0)
                Draggables._lastScrollPointer[0] = 0;
            if (Draggables._lastScrollPointer[1] < 0)
                Draggables._lastScrollPointer[1] = 0;
            this.draw(Draggables._lastScrollPointer);
        }

        if(this.options.change) this.options.change(this);
    },

    _getWindowScroll: function(w) {
        var T, L, W, H;
        with (w.document) {
            if (w.document.documentElement && documentElement.scrollTop) {
                T = documentElement.scrollTop;
                L = documentElement.scrollLeft;
            } else if (w.document.body) {
                T = body.scrollTop;
                L = body.scrollLeft;
            }
            if (w.innerWidth) {
                W = w.innerWidth;
                H = w.innerHeight;
            } else if (w.document.documentElement && documentElement.clientWidth) {
                W = documentElement.clientWidth;
                H = documentElement.clientHeight;
            } else {
                W = body.offsetWidth;
                H = body.offsetHeight;
            }
        }
        return { top: T, left: L, width: W, height: H };
    }
};

/*--------------------------------------------------------------------------*/

var SortableObserver = Class.create();
SortableObserver.prototype = {
    initialize: function(element, observer) {
        this.element   = $(element);
        this.observer  = observer;
        this.lastValue = Sortable.serialize(this.element);
    },

    onStart: function() {
        this.lastValue = Sortable.serialize(this.element);
    },

    onEnd: function() {
        Sortable.unmark();
        if(this.lastValue != Sortable.serialize(this.element))
            this.observer(this.element);
    }
};

var Sortable = {
    SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,

    sortables: {},

    _findRootElement: function(element) {
        while (element.tagName.toUpperCase() != "BODY") {
            if(element.id && Sortable.sortables[element.id]) return element;
            element = element.parentNode;
        }
    },

    options: function(element) {
        element = Sortable._findRootElement($(element));
        if(!element) return;
        return Sortable.sortables[element.id];
    },

    destroy: function(element){
        var s = Sortable.options(element);

        if(s) {
            Draggables.removeObserver(s.element);
            s.droppables.each(function(d){ Droppables.remove(d); });
            s.draggables.invoke('destroy');

            delete Sortable.sortables[s.element.id];
        }
    },

    create: function(element) {
        element = $(element);
        var options = Object.extend({
            element:     element,
            tag:         'li',       // assumes li children, override with tag: 'tagname'
            dropOnEmpty: false,
            tree:        false,
            treeTag:     'ul',
            overlap:     'vertical', // one of 'vertical', 'horizontal'
            constraint:  'vertical', // one of 'vertical', 'horizontal', false
            containment: element,    // also takes array of elements (or id's); or false
            handle:      false,      // or a CSS class
            only:        false,
            delay:       0,
            hoverclass:  null,
            ghosting:    false,
            quiet:       false,
            scroll:      false,
            scrollSensitivity: 20,
            scrollSpeed: 15,
            format:      this.SERIALIZE_RULE,
            onChange:    Prototype.emptyFunction,
            onUpdate:    Prototype.emptyFunction
        }, arguments[1] || {});

    // clear any old sortable with same element
        this.destroy(element);

    // build options for the draggables
        var options_for_draggable = {
            revert:      true,
            quiet:       options.quiet,
            scroll:      options.scroll,
            scrollSpeed: options.scrollSpeed,
            scrollSensitivity: options.scrollSensitivity,
            delay:       options.delay,
            ghosting:    options.ghosting,
            constraint:  options.constraint,
            handle:      options.handle };

        if(options.starteffect)
            options_for_draggable.starteffect = options.starteffect;

        if(options.reverteffect)
            options_for_draggable.reverteffect = options.reverteffect;
        else
            if(options.ghosting) options_for_draggable.reverteffect = function(element) {
                element.style.top  = 0;
                element.style.left = 0;
            };

        if(options.endeffect)
            options_for_draggable.endeffect = options.endeffect;

        if(options.zindex)
            options_for_draggable.zindex = options.zindex;

    // build options for the droppables  
        var options_for_droppable = {
            overlap:     options.overlap,
            containment: options.containment,
            tree:        options.tree,
            hoverclass:  options.hoverclass,
            onHover:     Sortable.onHover
        };

        var options_for_tree = {
            onHover:      Sortable.onEmptyHover,
            overlap:      options.overlap,
            containment:  options.containment,
            hoverclass:   options.hoverclass
        };

    // fix for gecko engine
        Element.cleanWhitespace(element);

        options.draggables = [];
        options.droppables = [];

    // drop on empty handling
        if(options.dropOnEmpty || options.tree) {
            Droppables.add(element, options_for_tree);
            options.droppables.push(element);
        }

        (this.findElements(element, options) || []).each( function(e) {
            // handles are per-draggable
            var handle = options.handle ?
                         $(e).down('.'+options.handle,0) : e;
            options.draggables.push(
                    new Draggable(e, Object.extend(options_for_draggable, { handle: handle })));
            Droppables.add(e, options_for_droppable);
            if(options.tree) e.treeNode = element;
            options.droppables.push(e);
        });

        if(options.tree) {
            (Sortable.findTreeElements(element, options) || []).each( function(e) {
                Droppables.add(e, options_for_tree);
                e.treeNode = element;
                options.droppables.push(e);
            });
        }

    // keep reference
        this.sortables[element.id] = options;

    // for onupdate
        Draggables.addObserver(new SortableObserver(element, options.onUpdate));

    },

    // return all suitable-for-sortable elements in a guaranteed order
    findElements: function(element, options) {
        return Element.findChildren(
                element, options.only, options.tree ? true : false, options.tag);
    },

    findTreeElements: function(element, options) {
        return Element.findChildren(
                element, options.only, options.tree ? true : false, options.treeTag);
    },

    onHover: function(element, dropon, overlap) {
        if(Element.isParent(dropon, element)) return;

        if(overlap > .33 && overlap < .66 && Sortable.options(dropon).tree) {
            return;
        } else if(overlap>0.5) {
            Sortable.mark(dropon, 'before');
            if(dropon.previousSibling != element) {
                var oldParentNode = element.parentNode;
                element.style.visibility = "hidden"; // fix gecko rendering
                dropon.parentNode.insertBefore(element, dropon);
                if(dropon.parentNode!=oldParentNode)
                    Sortable.options(oldParentNode).onChange(element);
                Sortable.options(dropon.parentNode).onChange(element);
            }
        } else {
            Sortable.mark(dropon, 'after');
            var nextElement = dropon.nextSibling || null;
            if(nextElement != element) {
                var oldParentNode = element.parentNode;
                element.style.visibility = "hidden"; // fix gecko rendering
                dropon.parentNode.insertBefore(element, nextElement);
                if(dropon.parentNode!=oldParentNode)
                    Sortable.options(oldParentNode).onChange(element);
                Sortable.options(dropon.parentNode).onChange(element);
            }
        }
    },

    onEmptyHover: function(element, dropon, overlap) {
        var oldParentNode = element.parentNode;
        var droponOptions = Sortable.options(dropon);

        if(!Element.isParent(dropon, element)) {
            var index;

            var children = Sortable.findElements(dropon, {tag: droponOptions.tag, only: droponOptions.only});
            var child = null;

            if(children) {
                var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);

                for (index = 0; index < children.length; index += 1) {
                    if (offset - Element.offsetSize (children[index], droponOptions.overlap) >= 0) {
                        offset -= Element.offsetSize (children[index], droponOptions.overlap);
                    } else if (offset - (Element.offsetSize (children[index], droponOptions.overlap) / 2) >= 0) {
                        child = index + 1 < children.length ? children[index + 1] : null;
                        break;
                    } else {
                        child = children[index];
                        break;
                    }
                }
            }

            dropon.insertBefore(element, child);

            Sortable.options(oldParentNode).onChange(element);
            droponOptions.onChange(element);
        }
    },

    unmark: function() {
        if(Sortable._marker) Sortable._marker.hide();
    },

    mark: function(dropon, position) {
        // mark on ghosting only
        var sortable = Sortable.options(dropon.parentNode);
        if(sortable && !sortable.ghosting) return;

        if(!Sortable._marker) {
            Sortable._marker =
            ($('dropmarker') || Element.extend(document.createElement('DIV'))).
                    hide().addClassName('dropmarker').setStyle({position:'absolute'});
            document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);
        }
        var offsets = Position.cumulativeOffset(dropon);
        Sortable._marker.setStyle({left: offsets[0]+'px', top: offsets[1] + 'px'});

        if(position=='after')
            if(sortable.overlap == 'horizontal')
                Sortable._marker.setStyle({left: (offsets[0]+dropon.clientWidth) + 'px'});
            else
                Sortable._marker.setStyle({top: (offsets[1]+dropon.clientHeight) + 'px'});

        Sortable._marker.show();
    },

    _tree: function(element, options, parent) {
        var children = Sortable.findElements(element, options) || [];

        for (var i = 0; i < children.length; ++i) {
            var match = children[i].id.match(options.format);

            if (!match) continue;

            var child = {
                id: encodeURIComponent(match ? match[1] : null),
                element: element,
                parent: parent,
                children: [],
                position: parent.children.length,
                container: $(children[i]).down(options.treeTag)
            };

            /* Get the element containing the children and recurse over it */
            if (child.container)
                this._tree(child.container, options, child);

            parent.children.push (child);
        }

        return parent;
    },

    tree: function(element) {
        element = $(element);
        var sortableOptions = this.options(element);
        var options = Object.extend({
            tag: sortableOptions.tag,
            treeTag: sortableOptions.treeTag,
            only: sortableOptions.only,
            name: element.id,
            format: sortableOptions.format
        }, arguments[1] || {});

        var root = {
            id: null,
            parent: null,
            children: [],
            container: element,
            position: 0
        };

        return Sortable._tree(element, options, root);
    },

    /* Construct a [i] index for a particular node */
    _constructIndex: function(node) {
        var index = '';
        do {
            if (node.id) index = '[' + node.position + ']' + index;
        } while ((node = node.parent) != null);
        return index;
    },

    sequence: function(element) {
        element = $(element);
        var options = Object.extend(this.options(element), arguments[1] || {});

        return $(this.findElements(element, options) || []).map( function(item) {
            return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
        });
    },

    setSequence: function(element, new_sequence) {
        element = $(element);
        var options = Object.extend(this.options(element), arguments[2] || {});

        var nodeMap = {};
        this.findElements(element, options).each( function(n) {
            if (n.id.match(options.format))
                nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];
            n.parentNode.removeChild(n);
        });

        new_sequence.each(function(ident) {
            var n = nodeMap[ident];
            if (n) {
                n[1].appendChild(n[0]);
                delete nodeMap[ident];
            }
        });
    },

    serialize: function(element) {
        element = $(element);
        var options = Object.extend(Sortable.options(element), arguments[1] || {});
        var name = encodeURIComponent(
                (arguments[1] && arguments[1].name) ? arguments[1].name : element.id);

        if (options.tree) {
            return Sortable.tree(element, arguments[1]).children.map( function (item) {
                return [name + Sortable._constructIndex(item) + "[id]=" +
                        encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
            }).flatten().join('&');
        } else {
            return Sortable.sequence(element, arguments[1]).map( function(item) {
                return name + "[]=" + encodeURIComponent(item);
            }).join('&');
        }
    }
};

// Returns true if child is contained within element
Element.isParent = function(child, element) {
    if (!child.parentNode || child == element) return false;
    if (child.parentNode == element) return true;
    return Element.isParent(child.parentNode, element);
};

Element.findChildren = function(element, only, recursive, tagName) {
    if(!element.hasChildNodes()) return null;
    tagName = tagName.toUpperCase();
    if(only) only = [only].flatten();
    var elements = [];
    $A(element.childNodes).each( function(e) {
        if(e.tagName && e.tagName.toUpperCase()==tagName &&
           (!only || (Element.classNames(e).detect(function(v) { return only.include(v); }))))
            elements.push(e);
        if(recursive) {
            var grandchildren = Element.findChildren(e, only, recursive, tagName);
            if(grandchildren) elements.push(grandchildren);
        }
    });

    return (elements.length>0 ? elements.flatten() : []);
};

Element.offsetSize = function (element, type) {
    return element['offset' + ((type=='vertical' || type=='height') ? 'Height' : 'Width')];
};
// script.aculo.us controls.js v1.7.1_beta1, Mon Mar 12 14:40:50 +0100 2007

// Copyright (c) 2005-2007 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//           (c) 2005-2007 Ivan Krstic (http://blogs.law.harvard.edu/ivan)
//           (c) 2005-2007 Jon Tirsen (http://www.tirsen.com)
// Contributors:
//  Richard Livsey
//  Rahul Bhargava
//  Rob Wills
// 
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// Autocompleter.Base handles all the autocompletion functionality 
// that's independent of the data source for autocompletion. This
// includes drawing the autocompletion menu, observing keyboard
// and mouse events, and similar.
//
// Specific autocompleters need to provide, at the very least, 
// a getUpdatedChoices function that will be invoked every time
// the text inside the monitored textbox changes. This method 
// should get the text for which to provide autocompletion by
// invoking this.getToken(), NOT by directly accessing
// this.element.value. This is to allow incremental tokenized
// autocompletion. Specific auto-completion logic (AJAX, etc)
// belongs in getUpdatedChoices.
//
// Tokenized incremental autocompletion is enabled automatically
// when an autocompleter is instantiated with the 'tokens' option
// in the options parameter, e.g.:
// new Ajax.Autocompleter('id','upd', '/url/', { tokens: ',' });
// will incrementally autocomplete with a comma as the token.
// Additionally, ',' in the above example can be replaced with
// a token array, e.g. { tokens: [',', '\n'] } which
// enables autocompletion on multiple tokens. This is most 
// useful when one of the tokens is \n (a newline), as it 
// allows smart autocompletion after linebreaks.

if(typeof Effect == 'undefined')
  throw("controls.js requires including script.aculo.us' effects.js library");

var Autocompleter = {};
Autocompleter.Base = function() {};
Autocompleter.Base.prototype = {
  baseInitialize: function(element, update, options) {
    this.element     = $(element); 
    this.update      = $(update);  
    this.hasFocus    = false; 
    this.changed     = false; 
    this.active      = false; 
    this.index       = 0;     
    this.entryCount  = 0;

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || {};

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.tokens       = this.options.tokens || [];
    this.options.frequency    = this.options.frequency || 0.4;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow || 
      function(element, update){ 
        if(!update.style.position || update.style.position=='absolute') {
          update.style.position = 'absolute';
          Position.clone(element, update, {
            setHeight: false, 
            offsetTop: element.offsetHeight
          });
        }
        Effect.Appear(update,{duration:0.15});
      };
    this.options.onHide = this.options.onHide || 
      function(element, update){ new Effect.Fade(update,{duration:0.15}); };

    if(typeof(this.options.tokens) == 'string') 
      this.options.tokens = new Array(this.options.tokens);

    this.observer = null;
    
    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, "blur", this.onBlur.bindAsEventListener(this));
    Event.observe(this.element, "keypress", this.onKeyPress.bindAsEventListener(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix && 
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update, 
       '<iframe id="' + this.update.id + '_iefix" '+
       'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
       'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
  },
  
  fixIEOverlapping: function() {
    Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
    this.iefix.style.zIndex = 1;
    this.update.style.zIndex = 2;
    Element.show(this.iefix);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
    if(this.iefix) Element.hide(this.iefix);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  onKeyPress: function(event) {
    if(this.active)
      switch(event.keyCode) {
       case Event.KEY_TAB:
       case Event.KEY_RETURN:
         this.selectEntry();
         Event.stop(event);
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_LEFT:
       case Event.KEY_RIGHT:
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         if(Prototype.Browser.WebKit) Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         if(Prototype.Browser.WebKit) Event.stop(event);
         return;
      }
     else 
       if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN || 
         (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;

    this.changed = true;
    this.hasFocus = true;

    if(this.observer) clearTimeout(this.observer);
      this.observer = 
        setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex) 
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },
  
  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },
  
  onBlur: function(event) {
    // needed to make click events working
    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;     
  }, 
  
  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ? 
          Element.addClassName(this.getEntry(i),"selected") : 
          Element.removeClassName(this.getEntry(i),"selected");
        
      if(this.hasFocus) { 
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },
  
  markPrevious: function() {
    if(this.index > 0) this.index--;
      else this.index = this.entryCount-1;
    this.getEntry(this.index).scrollIntoView(true);
  },
  
  markNext: function() {
    if(this.index < this.entryCount-1) this.index++;
      else this.index = 0;
    this.getEntry(this.index).scrollIntoView(false);
  },
  
  getEntry: function(index) {
    return this.update.firstChild.childNodes[index];
  },
  
  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },
  
  selectEntry: function() {
    this.active = false;
    this.updateElement(this.getCurrentEntry());
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = '';
    if (this.options.select) {
      var nodes = $$("#" + this.update.id + " .selected" + " ." + this.options.select);
      if(nodes.length > 0) value = Element.collectTextNodes(nodes[0], this.options.select);
    } else
      value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');
    
    var lastTokenPos = this.findLastToken();
    if (lastTokenPos != -1) {
      var newValue = this.element.value.substr(0, lastTokenPos + 1);
      var whitespace = this.element.value.substr(lastTokenPos + 1).match(/^\s+/);
      if (whitespace)
        newValue += whitespace[0];
      this.element.value = newValue + value;
    } else {
      this.element.value = value;
    }
    this.element.focus();
    
    if (this.options.afterUpdateElement)
      this.options.afterUpdateElement(this.element, selectedElement);
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount = 
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else { 
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = 0;
      
      if(this.entryCount==1 && this.options.autoSelect) {
        this.selectEntry();
        this.hide();
      } else {
        this.render();
      }
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;   
    if(this.getToken().length>=this.options.minChars) {
      this.startIndicator();
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
  },

  getToken: function() {
    var tokenPos = this.findLastToken();
    if (tokenPos != -1)
      var ret = this.element.value.substr(tokenPos + 1).replace(/^\s+/,'').replace(/\s+$/,'');
    else
      var ret = this.element.value;

    return /\n/.test(ret) ? '' : ret;
  },

  findLastToken: function() {
    var lastTokenPos = -1;

    for (var i=0; i<this.options.tokens.length; i++) {
      var thisTokenPos = this.element.value.lastIndexOf(this.options.tokens[i]);
      if (thisTokenPos > lastTokenPos)
        lastTokenPos = thisTokenPos;
    }
    return lastTokenPos;
  }
};

Ajax.Autocompleter = Class.create();
Object.extend(Object.extend(Ajax.Autocompleter.prototype, Autocompleter.Base.prototype), {
  initialize: function(element, update, url, options) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
  },

  getUpdatedChoices: function() {
    entry = encodeURIComponent(this.options.paramName) + '=' + 
      encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
      this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams) 
      this.options.parameters += '&' + this.options.defaultParams;

    new Ajax.Request(this.url, this.options);
  },

  onComplete: function(request) {
    this.updateChoices(request.responseText);
  }

});

// The local array autocompleter. Used when you'd prefer to
// inject an array of autocompletion options into the page, rather
// than sending out Ajax queries, which can be quite slow sometimes.
//
// The constructor takes four parameters. The first two are, as usual,
// the id of the monitored textbox, and id of the autocompletion menu.
// The third is the array you want to autocomplete from, and the fourth
// is the options block.
//
// Extra local autocompletion options:
// - choices - How many autocompletion choices to offer
//
// - partialSearch - If false, the autocompleter will match entered
//                    text only at the beginning of strings in the 
//                    autocomplete array. Defaults to true, which will
//                    match text at the beginning of any *word* in the
//                    strings in the autocomplete array. If you want to
//                    search anywhere in the string, additionally set
//                    the option fullSearch to true (default: off).
//
// - fullSsearch - Search anywhere in autocomplete array strings.
//
// - partialChars - How many characters to enter before triggering
//                   a partial match (unlike minChars, which defines
//                   how many characters are required to do any match
//                   at all). Defaults to 2.
//
// - ignoreCase - Whether to ignore case when autocompleting.
//                 Defaults to true.
//
// It's possible to pass in a custom function as the 'selector' 
// option, if you prefer to write your own autocompletion logic.
// In that case, the other options above will not apply unless
// you support them.

Autocompleter.Local = Class.create();
Autocompleter.Local.prototype = Object.extend(new Autocompleter.Base(), {
  initialize: function(element, update, array, options) {
    this.baseInitialize(element, update, options);
    this.options.array = array;
  },

  getUpdatedChoices: function() {
    this.updateChoices(this.options.selector(this));
  },

  setOptions: function(options) {
    this.options = Object.extend({
      choices: 10,
      partialSearch: true,
      partialChars: 2,
      ignoreCase: true,
      fullSearch: false,
      selector: function(instance) {
        var ret       = []; // Beginning matches
        var partial   = []; // Inside matches
        var entry     = instance.getToken();
        var count     = 0;

        for (var i = 0; i < instance.options.array.length &&  
          ret.length < instance.options.choices ; i++) { 

          var elem = instance.options.array[i];
          var foundPos = instance.options.ignoreCase ? 
            elem.toLowerCase().indexOf(entry.toLowerCase()) : 
            elem.indexOf(entry);

          while (foundPos != -1) {
            if (foundPos == 0 && elem.length != entry.length) { 
              ret.push("<li><strong>" + elem.substr(0, entry.length) + "</strong>" + 
                elem.substr(entry.length) + "</li>");
              break;
            } else if (entry.length >= instance.options.partialChars && 
              instance.options.partialSearch && foundPos != -1) {
              if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {
                partial.push("<li>" + elem.substr(0, foundPos) + "<strong>" +
                  elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
                  foundPos + entry.length) + "</li>");
                break;
              }
            }

            foundPos = instance.options.ignoreCase ? 
              elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) : 
              elem.indexOf(entry, foundPos + 1);

          }
        }
        if (partial.length)
          ret = ret.concat(partial.slice(0, instance.options.choices - ret.length));
        return "<ul>" + ret.join('') + "</ul>";
      }
    }, options || {});
  }
});

// AJAX in-place editor
//
// see documentation on http://wiki.script.aculo.us/scriptaculous/show/Ajax.InPlaceEditor

// Use this if you notice weird scrolling problems on some browsers,
// the DOM might be a bit confused when this gets called so do this
// waits 1 ms (with setTimeout) until it does the activation
Field.scrollFreeActivate = function(field) {
  setTimeout(function() {
    Field.activate(field);
  }, 1);
};

Ajax.InPlaceEditor = Class.create();
Ajax.InPlaceEditor.defaultHighlightColor = "#FFFF99";
Ajax.InPlaceEditor.prototype = {
  initialize: function(element, url, options) {
    this.url = url;
    this.element = $(element);

    this.options = Object.extend({
      paramName: "value",
      okButton: true,
      okLink: false,
      okText: "ok",
      cancelButton: false,
      cancelLink: true,
      cancelText: "cancel",
      textBeforeControls: '',
      textBetweenControls: '',
      textAfterControls: '',
      savingText: 'js_saving'.tr(),
      clickToEditText: 'js_click_to_edit'.tr(),
      okText: "ok",
      rows: 1,
      onComplete: function(transport, element) {
        new Effect.Highlight(element, {startcolor: this.options.highlightcolor});
      },
      onFailure: function(transport) {
        alert('js_error_communicating_with_server'.tr() + transport.responseText.stripTags());
      },
      callback: function(form) {
        return Form.serialize(form);
      },
      handleLineBreaks: true,
      loadingText: 'Loading...',
      savingClassName: 'inplaceeditor-saving',
      loadingClassName: 'inplaceeditor-loading',
      formClassName: 'inplaceeditor-form',
      highlightcolor: Ajax.InPlaceEditor.defaultHighlightColor,
      highlightendcolor: "#FFFFFF",
      externalControl: null,
      submitOnBlur: false,
      ajaxOptions: {},
      evalScripts: false
    }, options || {});

    if(!this.options.formId && this.element.id) {
      this.options.formId = this.element.id + "-inplaceeditor";
      if ($(this.options.formId)) {
        // there's already a form with that name, don't specify an id
        this.options.formId = null;
      }
    }
    
    if (this.options.externalControl) {
      this.options.externalControl = $(this.options.externalControl);
    }
    
    this.originalBackground = Element.getStyle(this.element, 'background-color');
    if (!this.originalBackground) {
      this.originalBackground = "transparent";
    }
    
    this.element.title = this.options.clickToEditText;
    
    this.onclickListener = this.enterEditMode.bindAsEventListener(this);
    this.mouseoverListener = this.enterHover.bindAsEventListener(this);
    this.mouseoutListener = this.leaveHover.bindAsEventListener(this);
    Event.observe(this.element, 'click', this.onclickListener);
    Event.observe(this.element, 'mouseover', this.mouseoverListener);
    Event.observe(this.element, 'mouseout', this.mouseoutListener);
    if (this.options.externalControl) {
      Event.observe(this.options.externalControl, 'click', this.onclickListener);
      Event.observe(this.options.externalControl, 'mouseover', this.mouseoverListener);
      Event.observe(this.options.externalControl, 'mouseout', this.mouseoutListener);
    }
  },
  enterEditMode: function(evt) {
    if (this.saving) return;
    if (this.editing) return;
    this.editing = true;
    this.onEnterEditMode();
    if (this.options.externalControl) {
      Element.hide(this.options.externalControl);
    }
    Element.hide(this.element);
    this.createForm();
    this.element.parentNode.insertBefore(this.form, this.element);
    if (!this.options.loadTextURL) Field.scrollFreeActivate(this.editField);
    // stop the event to avoid a page refresh in Safari
    if (evt) {
      Event.stop(evt);
    }
    return false;
  },
  createForm: function() {
    this.form = document.createElement("form");
    this.form.id = this.options.formId;
    Element.addClassName(this.form, this.options.formClassName);
    this.form.onsubmit = this.onSubmit.bind(this);

    this.createEditField();

    if (this.options.textarea) {
      var br = document.createElement("br");
      this.form.appendChild(br);
    }
    
    if (this.options.textBeforeControls)
      this.form.appendChild(document.createTextNode(this.options.textBeforeControls));

    if (this.options.okButton) {
      var okButton = document.createElement("input");
      okButton.type = "submit";
      okButton.value = this.options.okText;
      okButton.className = 'editor_ok_button';
      this.form.appendChild(okButton);
    }
    
    if (this.options.okLink) {
      var okLink = document.createElement("a");
      okLink.href = "#";
      okLink.appendChild(document.createTextNode(this.options.okText));
      okLink.onclick = this.onSubmit.bind(this);
      okLink.className = 'editor_ok_link';
      this.form.appendChild(okLink);
    }
    
    if (this.options.textBetweenControls && 
      (this.options.okLink || this.options.okButton) && 
      (this.options.cancelLink || this.options.cancelButton))
      this.form.appendChild(document.createTextNode(this.options.textBetweenControls));
      
    if (this.options.cancelButton) {
      var cancelButton = document.createElement("input");
      cancelButton.type = "submit";
      cancelButton.value = this.options.cancelText;
      cancelButton.onclick = this.onclickCancel.bind(this);
      cancelButton.className = 'editor_cancel_button';
      this.form.appendChild(cancelButton);
    }

    if (this.options.cancelLink) {
      var cancelLink = document.createElement("a");
      cancelLink.href = "#";
      cancelLink.appendChild(document.createTextNode(this.options.cancelText));
      cancelLink.onclick = this.onclickCancel.bind(this);
      cancelLink.className = 'editor_cancel editor_cancel_link';      
      this.form.appendChild(cancelLink);
    }
    
    if (this.options.textAfterControls)
      this.form.appendChild(document.createTextNode(this.options.textAfterControls));
  },
  hasHTMLLineBreaks: function(string) {
    if (!this.options.handleLineBreaks) return false;
    return string.match(/<br/i) || string.match(/<p>/i);
  },
  convertHTMLLineBreaks: function(string) {
    return string.replace(/<br>/gi, "\n").replace(/<br\/>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<p>/gi, "");
  },
  createEditField: function() {
    var text;
    if(this.options.loadTextURL) {
      text = this.options.loadingText;
    } else {
      text = this.getText();
    }

    var obj = this;
    
    if (this.options.rows == 1 && !this.hasHTMLLineBreaks(text)) {
      this.options.textarea = false;
      var textField = document.createElement("input");
      textField.obj = this;
      textField.type = "text";
      textField.name = this.options.paramName;
      textField.value = text;
      textField.style.backgroundColor = this.options.highlightcolor;
      textField.className = 'editor_field';
      var size = this.options.size || this.options.cols || 0;
      if (size != 0) textField.size = size;
      if (this.options.submitOnBlur)
        textField.onblur = this.onSubmit.bind(this);
      this.editField = textField;
    } else {
      this.options.textarea = true;
      var textArea = document.createElement("textarea");
      textArea.obj = this;
      textArea.name = this.options.paramName;
      textArea.value = this.convertHTMLLineBreaks(text);
      textArea.rows = this.options.rows;
      textArea.cols = this.options.cols || 40;
      textArea.className = 'editor_field';      
      if (this.options.submitOnBlur)
        textArea.onblur = this.onSubmit.bind(this);
      this.editField = textArea;
    }
    
    if(this.options.loadTextURL) {
      this.loadExternalText();
    }
    this.form.appendChild(this.editField);
  },
  getText: function() {
    return this.element.innerHTML;
  },
  loadExternalText: function() {
    Element.addClassName(this.form, this.options.loadingClassName);
    this.editField.disabled = true;
    new Ajax.Request(
      this.options.loadTextURL,
      Object.extend({
        asynchronous: true,
        onComplete: this.onLoadedExternalText.bind(this)
      }, this.options.ajaxOptions)
    );
  },
  onLoadedExternalText: function(transport) {
    Element.removeClassName(this.form, this.options.loadingClassName);
    this.editField.disabled = false;
    this.editField.value = transport.responseText.stripTags();
    Field.scrollFreeActivate(this.editField);
  },
  onclickCancel: function() {
    this.onComplete();
    this.leaveEditMode();
    return false;
  },
  onFailure: function(transport) {
    this.options.onFailure(transport);
    if (this.oldInnerHTML) {
      this.element.innerHTML = this.oldInnerHTML;
      this.oldInnerHTML = null;
    }
    return false;
  },
  onSubmit: function() {
    // onLoading resets these so we need to save them away for the Ajax call
    var form = this.form;
    var value = this.editField.value;
    
    // do this first, sometimes the ajax call returns before we get a chance to switch on Saving...
    // which means this will actually switch on Saving... *after* we've left edit mode causing Saving...
    // to be displayed indefinitely
    this.onLoading();
    
    if (this.options.evalScripts) {
      new Ajax.Request(
        this.url, Object.extend({
          parameters: this.options.callback(form, value),
          onComplete: this.onComplete.bind(this),
          onFailure: this.onFailure.bind(this),
          asynchronous:true, 
          evalScripts:true
        }, this.options.ajaxOptions));
    } else  {
      new Ajax.Updater(
        { success: this.element,
          // don't update on failure (this could be an option)
          failure: null }, 
        this.url, Object.extend({
          parameters: this.options.callback(form, value),
          onComplete: this.onComplete.bind(this),
          onFailure: this.onFailure.bind(this)
        }, this.options.ajaxOptions));
    }
    // stop the event to avoid a page refresh in Safari
    if (arguments.length > 1) {
      Event.stop(arguments[0]);
    }
    return false;
  },
  onLoading: function() {
    this.saving = true;
    this.removeForm();
    this.leaveHover();
    this.showSaving();
  },
  showSaving: function() {
    this.oldInnerHTML = this.element.innerHTML;
    this.element.innerHTML = this.options.savingText;
    Element.addClassName(this.element, this.options.savingClassName);
    this.element.style.backgroundColor = this.originalBackground;
    Element.show(this.element);
  },
  removeForm: function() {
    if(this.form) {
      if (this.form.parentNode) Element.remove(this.form);
      this.form = null;
    }
  },
  enterHover: function() {
    if (this.saving) return;
    this.element.style.backgroundColor = this.options.highlightcolor;
    if (this.effect) {
      this.effect.cancel();
    }
    Element.addClassName(this.element, this.options.hoverClassName);
  },
  leaveHover: function() {
    if (this.options.backgroundColor) {
      this.element.style.backgroundColor = this.oldBackground;
    }
    Element.removeClassName(this.element, this.options.hoverClassName);
    if (this.saving) return;
    this.effect = new Effect.Highlight(this.element, {
      startcolor: this.options.highlightcolor,
      endcolor: this.options.highlightendcolor,
      restorecolor: this.originalBackground
    });
  },
  leaveEditMode: function() {
    Element.removeClassName(this.element, this.options.savingClassName);
    this.removeForm();
    this.leaveHover();
    this.element.style.backgroundColor = this.originalBackground;
    Element.show(this.element);
    if (this.options.externalControl) {
      Element.show(this.options.externalControl);
    }
    this.editing = false;
    this.saving = false;
    this.oldInnerHTML = null;
    this.onLeaveEditMode();
  },
  onComplete: function(transport) {
    this.leaveEditMode();
    this.options.onComplete.bind(this)(transport, this.element);
  },
  onEnterEditMode: function() {},
  onLeaveEditMode: function() {},
  dispose: function() {
    if (this.oldInnerHTML) {
      this.element.innerHTML = this.oldInnerHTML;
    }
    this.leaveEditMode();
    Event.stopObserving(this.element, 'click', this.onclickListener);
    Event.stopObserving(this.element, 'mouseover', this.mouseoverListener);
    Event.stopObserving(this.element, 'mouseout', this.mouseoutListener);
    if (this.options.externalControl) {
      Event.stopObserving(this.options.externalControl, 'click', this.onclickListener);
      Event.stopObserving(this.options.externalControl, 'mouseover', this.mouseoverListener);
      Event.stopObserving(this.options.externalControl, 'mouseout', this.mouseoutListener);
    }
  }
};

Ajax.InPlaceCollectionEditor = Class.create();
Object.extend(Ajax.InPlaceCollectionEditor.prototype, Ajax.InPlaceEditor.prototype);
Object.extend(Ajax.InPlaceCollectionEditor.prototype, {
  createEditField: function() {
    if (!this.cached_selectTag) {
      var selectTag = document.createElement("select");
      var collection = this.options.collection || [];
      var optionTag;
      collection.each(function(e,i) {
        optionTag = document.createElement("option");
        optionTag.value = (e instanceof Array) ? e[0] : e;
        if((typeof this.options.value == 'undefined') && 
          ((e instanceof Array) ? this.element.innerHTML == e[1] : e == optionTag.value)) optionTag.selected = true;
        if(this.options.value==optionTag.value) optionTag.selected = true;
        optionTag.appendChild(document.createTextNode((e instanceof Array) ? e[1] : e));
        selectTag.appendChild(optionTag);
      }.bind(this));
      this.cached_selectTag = selectTag;
    }

    this.editField = this.cached_selectTag;
    if(this.options.loadTextURL) this.loadExternalText();
    this.form.appendChild(this.editField);
    this.options.callback = function(form, value) {
      return "value=" + encodeURIComponent(value);
    };
  }
});

// Delayed observer, like Form.Element.Observer, 
// but waits for delay after last key input
// Ideal for live-search fields

Form.Element.DelayedObserver = Class.create();
Form.Element.DelayedObserver.prototype = {
  initialize: function(element, delay, callback) {
    this.delay     = delay || 0.5;
    this.element   = $(element);
    this.callback  = callback;
    this.timer     = null;
    this.lastValue = $F(this.element); 
    Event.observe(this.element,'keyup',this.delayedListener.bindAsEventListener(this));
  },
  delayedListener: function(event) {
    if(this.lastValue == $F(this.element)) return;
    if(this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
    this.lastValue = $F(this.element);
  },
  onTimerEvent: function() {
    this.timer = null;
    this.callback(this.element, $F(this.element));
  }
};
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('8 1h(F){7 1D.6I(F)}6H={6G:8(Z){Z.U.X=(Z.U.X==\'1E\')?\'\':\'1E\'},6F:8(Z){7 Z.U.X!=\'1E\'}};8 3R(k,U){9 N=k.U[U];f(!N||N==\'3S\'){9 2R=(1D.3T?1D.3T.6E(k,z):z);N=2R?2R[U]:z}f(U==\'6D\')7 N?3J(N):1.0;7 N==\'3S\'?z:N}8 6C(k){9 X=3R(k,\'X\');f(X!=\'1E\'&&X!=z)7{3O:k.6B,3M:k.6A};9 14=k.U;9 3P=14.2P;9 2Q=14.1u;9 3Q=14.X;14.2P=\'6z\';f(2Q!=\'6y\')14.1u=\'6x\';14.X=\'6w\';9 3N=k.6v;9 3L=k.6u;14.X=3Q;14.1u=2Q;14.2P=3P;7{3O:3N,3M:3L}}6t.6s={6r:8(1y){7 4.2O(3K.6q,1y)||4.2O(3K.6p,1y)},2O:8(2N,1y){9 1b=2N.2v(1y);f(1b==-1)7;7 3J(2N.6o(1b+1y.K+1))}};1l.1k(6n.24,{6m:8(k,1b){f(1b>4.K){4[4.K]=k;7 4.K-1}1i(9 i=4.K;i>1b;i--)4[i]=4[i-1];4[1b]=k;7 1b},6l:8(k){1i(9 i=0;i<4.K;i++){f(k.2p){f(k.2p(4[i]))G}u{f(4[i]==k)G}}f(i==4.K)7;1i(9 j=i;j<4.K-1;j++)4[j]=4[j+1];4.6k()},P:8(3I){9 P=0;9 i=4.K;2M(i>0){f(3I(4[--i]))P++}7 P},2f:8(){9 2f=0;9 i=4.K;2M(i>0){2f+=4[--i]}7 2f}});1l.1k(3A.24,{6j:8(){2F(4.Q()){E\'1V\':7 1V;E\'1F\':7 1F;3B:7 z}},6i:8(){7 4.29(/6h?:\\/\\/[^\\s<]*/,8(1x){7"<a 3H=\\""+1x+"\\" 23=\\"3G\\">"+1x+"</a>"}).29(/(?:^|\\s)6g\\.[^\\s<]*/,8(1x){7"<a 3H=\\"6f://"+1x+"\\" 23=\\"3G\\">"+1x+"</a>"})},6e:8(){9 3F=/<(?:.|\\s)*?>/g;7 4.6d(3F,"")},6c:8(){7 4.1J(\'\\r\').31(8(Z){7 Z.6b()}).2r(\'\\r\').29(/&6a;/,\'"\')},69:8(3D){f(4.3z(0)==\'#\')9 2e=4.68(1,6);u 9 2e=4;9 v=2e.3E(/^(\\w{2})(\\w{2})(\\w{2})$/);f(v){r=13(v[1],16);g=13(v[2],16);b=13(v[3],16)}u{v=2e.3E(/^(\\w{1})(\\w{1})(\\w{1})$/);f(v){r=13(v[1]+v[1],16);g=13(v[2]+v[2],16);b=13(v[3]+v[3],16)}u 7 z}f(3D)7[r,g,b];u 7"67("+r+","+g+","+b+")"},o:8(1L){9 2d=66[4];f(1L){9 v=2d.1J(\'%\');9 1K=v[0];9 3C=/^([65])(.*)$/;1i(9 i=1;i<v.K;i++){p=3C.64(v[i]);f(!p||!1L[i-1])63;f(p[1]==\'d\'){1K+=13(1L[i-1],10)}u f(p[1]==\'s\'){1K+=1L[i-1]}1K+=p[2]}2d=1K}7 2d},62:8(){2F(2E.2D.3j){E"%Y-%m-%D":9 v=4.1J(\'-\');9 1w=v[1]+"/"+v[2]+"/"+v[0];7 1w.Q();E"%m/%D/%Y":7 4.Q();E"%D.%m.%Y":9 v=4.1J(\'.\');9 1w=v[1]+"/"+v[0]+"/"+v[2];7 1w.Q();E"%D-%m-%Y":9 v=4.1J(\'-\');9 1w=v[1]+"/"+v[0]+"/"+v[2];7 1w.Q();3B:7 4.Q()}}});3A.61=8(a,b){8 2L(t){9 2c=[],x=0,y=-1,n=0,i,j;2M(i=(j=t.3z(x++)).60(0)){9 m=(i==46||(i>=48&&i<=57));f(m!==n){2c[++y]="";n=m}2c[y]+=j}7 2c}9 1o=2L(a);9 1n=2L(b);1i(x=0;1o[x]&&1n[x];x++){f(1o[x]!==1n[x]){9 c=2x(1o[x]),d=2x(1n[x]);f(c==1o[x]&&d==1n[x]){7 c-d}u 7(1o[x]>1n[x])?1:-1}}7 1o.K-1n.K};1l.1k(5Z,{5Y:8(k){k=$(k);k.2a=k.N;7 k.2I(\'5X\',8(){f(k.2a!=k.N)7;k.5W(\'2K\').N=\'\'}).2I(\'5V\',8(){f(k.N.5U()!=\'\')7;k.3y(\'2K\').N=k.2a}).3y(\'2K\')},5T:8(2b){2b=$(2b);2b.5S().2k(8(Z){f(Z.2a==Z.N)Z.N=\'\'})},5R:8(3x,3w,2J){9 1a=1D.5Q[3x].5P[3w];f(1a.K==5O)f(1a.3v)7 1a.N;u 7"";1i(9 i=0;i<1a.K;i++){f(1a[i].3v){f(1a[i].F==\'5N\'){f(1h(2J))7 1h(2J).N;u 7""}u{7 1a[i].N}}}7""}});1l.1k(1G,{5M:8(T){9 19=0;f(!T)T=3t.T;f(T.3u){19=T.3u/5L;f(3t.5K)19=-19}u f(T.3s)19=-T.3s/3;7(19>0)?J.5J(19):J.5I(19);},5H:8(k,2H,3r){9 2G=8(){1G.5G(k,2H,2G);3r.5F(k,5E)};1G.2I(k,2H,2G);7 k}});1l.1k(1m.24,{3h:8(3p){9 27=4.5D(),28=4.5C();9 17=4.5B(),3l=4.5A();8 18(3q){7 3q.5z(2)};7 3p.29(/\\%([5y])/,8(3o){2F(3o[1]){E\'a\':7[\'5x\'.o(),\'5w\'.o(),\'5v\'.o(),\'5u\'.o(),\'5t\'.o(),\'5s\'.o(),\'5r\'.o()][27];G;E\'A\':7[\'5q\'.o(),\'5p\'.o(),\'5o\'.o(),\'5n\'.o(),\'5m\'.o(),\'5l\'.o(),\'5k\'.o()][27];G;E\'b\':7[\'5j\'.o(),\'5i\'.o(),\'5h\'.o(),\'5g\'.o(),\'3n\'.o(),\'5f\'.o(),\'5e\'.o(),\'5d\'.o(),\'5c\'.o(),\'5b\'.o(),\'5a\'.o(),\'59\'.o()][28];G;E\'B\':7[\'58\'.o(),\'56\'.o(),\'55\'.o(),\'54\'.o(),\'3n\'.o(),\'53\'.o(),\'52\'.o(),\'51\'.o(),\'50\'.o(),\'4Z\'.o(),\'4Y\'.o(),\'4X\'.o()][28];G;E\'c\':7 4.Q();G;E\'d\':7 4.3m();G;E\'D\':7 18(4.3m());G;E\'H\':7 18(17);G;E\'i\':7(17===12||17===0)?12:(17+12)%12;G;E\'I\':7 18((17===12||17===0)?12:(17+12)%12);G;E\'m\':7 18(28+1);G;E\'M\':7 18(3l);G;E\'p\':7 17>11?\'4W\':\'4V\';G;E\'S\':7 18(4.4U());G;E\'w\':7 27;G;E\'y\':7 18(4.3k()%4T);G;E\'Y\':7 4.3k().Q();G}}.2h(4))},4S:8(3i){9 2B=2E.2D.3j;f(!3i){f(2E.2D.4R==0){9 2C=" %i:%M %p"}u{9 2C=" %H:%M"}2B+=2C}7 4.3h(2B)}});1m.4Q=8(26){9 1v=q 1m(26);7 q 1m(1v-(1v.3g()*3f))};1m.4P=8(26){9 1v=q 1m(26);7 q 1m(1v.4O()+(1v.3g()*3f))};1l.1k(J,{4N:8(C){7(C[0]>0)?((C[1]>0)?1:0):((C[1]>0)?2:3)},4M:8(n,2z,2A){f(n>2A)7 2A;u f(n<2z)7 2z;u 7 n},4L:8(1u){9 x=1u[0],y=-1u[1],1I=J.4K(y/x);f(x<0&&y>=0)1I+=+J.25;u f(x<0&&y<0)1I+=J.25;u f(x>0&&y<0)1I+=2*J.25;7 4J/J.25*1I},1p:8(n){7 n*n},4I:8(2y){7 13(J.2m(J.1p(2y[0])+J.1p(2y[1])))},22:8(1t,1s){7[1t[0]+1s[0],1t[1]+1s[1]]},4H:8(1t,1s){7[1t[0]-1s[0],1t[1]-1s[1]]}});1l.1k(2x.24,{4G:8(2w){f(4<3e)7 4+" 4F";u f(4<(4E))7 J.3d(4/3e,2w)+" 4D";u 7 J.3d(4/4C,2w)+" 4B"}});1q.4A({3b:8(1H,O){1H.U.4z=O[0]+"3c";1H.U.4y=O[1]+"3c"},4x:8(1H,23,22){9 O=4w.4v(23);O[0]+=22[0];O[1]+=22[1];1q.3b(1H,O);7 O},37:8(F,15,1j,2u){f(1C F==\'2t\')9 R=1h(F);u 9 R=F;f(!R)7;f(20){R.3a=8(){f(R.1r.2v(\'39\')!=-1)7 1F;15(T);f(!!2u)1G.38(T);7!!1j}}u{R.3a=8(T){f(R.1r.2v(\'39\')!=-1)7 1F;15(T);f(!!2u)1G.38(T);7!!1j}}},4u:8(F,15,1j){f(1C F==\'2t\')9 R=1h(F);u 9 R=F;R.4t=8(){15();7!!1j}},4s:8(F,15,1j){f(1C F==\'2t\')9 R=1h(F);u 9 R=F;R.4r=8(){15();7!!1j}},4q:8(F,15){4.37(F,15,1F,1V)},4p:8(F,1r){f(!20)7 $(F).4o(\'.\'+1r);9 21=$(F).4n;1i(9 i=0,36=21.K;i<36;i++)f(21[i].1r==1r)7 $(21[i])}});1q.4m=8(k){9 1g=1h(\'35\');f(!1g){1g=q 1q(\'4l\',{F:\'35\'});1g.U.X=\'1E\';1D.4k.34(1g)}1g.34(k);1g.4j=\'\'};1Y.4i=8(k,1X,1Z){f(33||(20&&1Z))1q.4h(k);u 7 q 1Y.4g(k,1X)};1Y.4f=8(k,1X,1Z){f(33||(20&&1Z))1q.4e(k);u 7 q 1Y.4d(k,1X)};9 4c=1S.1R({2s:z,W:z,1Q:8(32){4.2s=32||10;4.W=[]},4b:8(1W){4.W.2U(1W);f(4.W.K>4.2s)4.W.1P()},2r:8(){7 4.W.31(8(k){7 k.Q()}).2r(\'\\n\\n\')},4a:8(){7 4.W.K==0},49:8(){7 4.W[0]},1P:8(){7 4.W.1P()},30:8(1W){7 4.W.30(1W)},1c:8(){7 4.W.K}});9 L=1S.1R({x:z,y:z,1Q:8(x,y){4.x=(1C x==\'2Z\')?x:x[0];4.y=(1C x==\'2Z\')?y:x[1]},2S:8(C){7 q L(4.x+C.x,4.y+C.y)},47:8(C){7 q L(4.x-C.x,4.y-C.y)},1O:8(2q){4.x+=2q.x;4.y+=2q.y},45:8(){7[4.x,4.y]},2p:8(p){7(4.x==p.x&&4.y==p.y)},Q:8(){7[4.x,4.y].Q()}});9 1d=1S.1R({e:z,h:z,1Q:8(e,m){4.e=e;f(m 44 L){4.h=m}u{4.h=(m==z)?q L(4.e.x,4.e.y-1):q L(4.e.x+1,4.e.y+m)}},K:8(){7 J.2m(J.1p(4.e.x-4.h.x)+J.1p(4.e.y-4.h.y))},1T:8(){f(4.h.x==4.e.x)7 z;7(4.h.y-4.e.y)/(4.h.x-4.e.x)},1A:8(l){9 1f=4.1T(),1e=l.1T(),x,y;f(1f==1e)7 z;f(1f!=z)f(1e!=z){x=(1f*4.e.x-1e*l.e.x-4.e.y+l.e.y)/(1f-1e);y=1f*(x-4.e.x)+4.e.y}u{x=l.e.x;y=1f*(l.e.x-4.e.x)+4.e.y}u f(1e!=z){x=4.e.x;y=1e*(4.e.x-l.e.x)+l.e.y}u{7 z}7 q L(x,y)},43:8(e,h){9 2o=q 1d(e,h),2n=4.1A(2o);7(2n)?2o.1z(2n):1V},1z:8(p){7([4.e.x,4.h.x].2Y()>=p.x-0.1U&&p.x>=[4.e.x,4.h.x].2X()-0.1U&&[4.e.y,4.h.y].2Y()>=p.y-0.1U&&p.y>=[4.e.y,4.h.y].2X()-0.1U)},Q:8(){7[4.e,4.h].Q()},42:8(e,d){9 m=4.1T();f(m==z)7[q L(e.x,e.y-d),q L(e.x,e.y+d)];9 1B=d/J.2m(1+J.1p(m));7[q L(e.x+1B,e.y+(m*1B)),q L(e.x-1B,e.y-(m*1B))]}});9 2g=1S.1R({e:z,h:z,1Q:8(e,h){4.e=e||q L(0,0);4.h=h||q L(0,0)},1c:8(){7 q L(J.2W(4.h.x-4.e.x),J.2W(4.h.y-4.e.y))},2T:8(){7 q L(13((4.h.x+4.e.x)/ 2), 13((4.h.y + 4.e.y) /2))},41:8(C){4.h=4.1c();4.h.1O(C);4.e=C},1P:8(C){4.e.1O(C);4.h.1O(C)},2i:8(C){7(C.x>=4.e.x&&C.x<=4.h.x&&C.y>=4.e.y&&C.y<=4.h.y)},1A:8(2V){9 2l=[];4.2j().2k(8(s){f(!(p=2V.1A(s)))7;f(s.1z(p))2l.2U(p)});7 2l},40:8(C){9 l=q 1d(C,4.2T()),p=z;4.2j().2k(8(s){f(!(p=l.1A(s)))7;f(l.1z(p)&&s.1z(p))3Z $G});7 p},1N:8(){7[q L(4.e.x,4.e.y),q L(4.h.x,4.e.y),q L(4.h.x,4.h.y),q L(4.e.x,4.h.y)]},2j:8(){9 c=4.1N();7[q 1d(c[0],c[1]),q 1d(c[1],c[2]),q 1d(c[2],c[3]),q 1d(c[3],c[0])]},3Y:8(V){7!(4.h.x<V.e.x||4.e.x>V.h.x||4.h.y<V.e.y||4.e.y>V.h.y)},3X:8(V){9 P=4.1N().P(8(1M){7 V.2i(1M)}.2h(4));f(P!=0){7 P}u{P=V.1N().P(8(1M){7 4.2i(1M)}.2h(4));f(!P){9 e=4.O,3W=4.1c,h=V.O,3V=V.1c;9 r=V;P=(((4.e.x<r.e.x&&4.h.x>r.h.x)&&(4.e.y>r.e.y&&4.h.y<r.h.y))||((4.e.x>r.e.x&&4.h.x<r.h.x)&&(4.e.y<r.e.y&&4.h.y>r.h.y)))?5:0}7 P}}});2g.3U=8(O,1c){7 q 2g(O,O.2S(1c))};',62,417,'||||this|||return|function|var|||||p1|if||p2|||element||||tr||new||||else|bits||||null|||point||case|id|break|||Math|length|Point||value|pos|count|toString|elem||event|style|otherRectangle|_contents|display||el||||parseInt|els|callback||hours|pad|delta|radioObj|index|size|Line|m2|m1|garbageBin|_|for|return_value|extend|Object|Date|bb|aa|sqr|Element|className|arr2|arr1|position|utc|res|link|searchString|isOnSegment|intersection|tmp|typeof|document|none|false|Event|source|rad|split|out|subst|coord|coords|doOffset|shift|initialize|create|Class|slope|02|true|object|options|Effect|all|isIE|ch|offset|target|prototype|PI|strDate|day|month|gsub|_default|form|tz|text|col|sum|Rectangle|bind|within|sides|each|points|sqrt|intersPoint|tmpL|equals|off|join|_capacity|string|nobubble|indexOf|precision|Number|rectSize|lower|upper|user_date_format|user_hour_format|user|ServerData|switch|wrapper|eventName|observe|selectId|inactive|chunkify|while|dataString|_search|visibility|originalPosition|css|getOffsetWith|center|push|line|abs|min|max|number|unshift|collect|capacity|isIE6|appendChild|IELeakGarbageBin|len|bindOnClick|stop|disabled|onclick|moveTo|px|round|1024|60000|getTimezoneOffset|strftime|only_date|date_format|getUTCFullYear|minutes|getUTCDate|js_may|part|format|num|handler|detail|window|wheelDelta|checked|radioId|formId|addClassName|charAt|String|default|re|return_array|match|reTag|new_page|href|iterator|parseFloat|navigator|originalHeight|height|originalWidth|width|originalVisibility|originalDisplay|getStyle|auto|defaultView|fromPosSize|s2|s1|overlap_type|overlaps|throw|radialIntersection|move|pointsAtDistance|onOppositeSides|instanceof|toArray||getOffsetFrom||first|empty|add|Buffer|Fade|hide|FadeIE|Appear|show|AppearIE|innerHTML|body|div|discard|childNodes|down|safeSelect|bindOnClickNoBubble|onmouseout|bindOnUnhover|onmouseover|bindOnHover|getElementOffset|canvas|moveToElement|top|left|addMethods|MB|1048576|KB|1048100|Bytes|toHumanSize|negativeOffset|diagonal|180|atan|slopeAngle|constrain|getQuadrant|getTime|toUTC|fromUTC|hour_format|toUIString|100|getUTCSeconds|AM|PM|js_december|js_november|js_octomber|js_september|js_august|js_july|js_june|js_april|js_march|js_february||js_january|js_december_short|js_november_short|js_octomber_short|js_september_short|js_august_short|js_july_short|js_june_short|js_april_short|js_march_short|js_february_short|js_january_short|js_saturday|js_friday|js_thursday|js_wednesday|js_tuesday|js_monday|js_sunday|js_saturday_short|js_friday_short|js_thursday_short|js_wednesday_short|js_tuesday_short|js_monday_short|js_sunday_short|aAbBcdDHiImMpSwyY|toPaddedString|getMinutes|getHours|getMonth|getDay|arguments|apply|stopObserving|observeOnce|floor|ceil|opera|120|wheel|radio_image_format|undefined|elements|forms|getRadioSelectValue|getElements|clearHints|strip|blur|removeClassName|focus|defaultHint|Form|charCodeAt|naturalCompare|toDate|continue|exec|ds|i18n|rgb|substr|parseRGB|quot|unescapeHTML|safeUnescapeHTML|replace|stripHTML|http|www|https|toLink|toBoolean|pop|remove|insert|Array|substring|appVersion|userAgent|get|BrowserVersion|Prototype|clientHeight|clientWidth|block|absolute|fixed|hidden|offsetHeight|offsetWidth|getDimensions|opacity|getComputedStyle|visible|toggle|_Element|getElementById'.split('|'),0,{}))
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('k o={5S:{},S:{},2g:{},Y:{},2m:{},40:{},2Q:{},H:{}};o.5S={9T:g(){},5P:g(){2v{9S"9R"}2u(e){q e.5R||e.5Q}},5N:g(1g,1P,2q,2p,2o){k 3b=\'\',5O=(1g)?1g.5R||1g.5Q:B.5P();j(1P)3b+=1P;j(1g)3b+=(1g.J?1g.J.9Q():\'\')+" - "+1g.1P;k 40={1P:3b,9P:5O,2q:2q};5c.5b.9O(40);j(2p)2Y(2p);j(2o)2o()},9N:g(1g,1P,2p,2o){2h.2R.9M=14;k 2q=T.9L(9K)+"\\n---\\n"+2h.9J.4t();B.5N(1g,1P,2q,2p,2o)}};o.Y={9I:g(){},9H:g(){q 15.2a+\'//\'+O.9G+(15.5M?\':\'+15.5M:\'\')},9F:g(){N.15.9E()},9D:g(J,R,3Z){k t=P 3g;t.9C(t.3f()+((3Z||1)*8.9B));O.5K=J+\'=\'+9A(R)+\'; 3Z=\'+t.9z()},9y:g(J){k 5L=P 9x(J+\'=([^;]*);?\',\'9w\'),r=5L.9v(O.5K)||[];q(r.X>1)?9u(r[1]):14},4T:g(1h,1e,1p){k m=1h.3y(\'/\').4u();j(u(m)){j(1e)1e();q}k s=O.2t("9t");s.1o("m",m);s.1o("3X","1L/9s");s.1o("1C",1h);O.5I("5H")[0].28(s);j(1e){j(4l){j(1p){k 3a=3r(g(){k 1f=z;2v{1f=1p.1f()}2u(e){}j(1f){3q(3a);1e.1f()}},2I)}C{s.9r(\'4q\',1e)}}C j(1T){j(1p){s.3Y=g(){j(B.1E==\'2C\'||B.1E==\'2D\'){k 3a=3r(g(){k 1f=z;2v{1f=1p.1f()}2u(e){}j(1f){3q(3a);1e.1f()}},2I)}}}C{s.3Y=g(){j(B.1E==\'2C\'||B.1E==\'2D\'){1e()}}}}C{s.H=g(){1e()}}j(!3p&&!1T)s.3Y=g(){j(B.1E==\'2C\'||B.1E==\'2D\')1e()}}},4U:g(5J){5J.9q(g(J){k l=O.2t("9p");l.1o("3X","1L/3z");l.1o("9o","9n");l.1o("1Q",J);l.1o("9m","9l");O.5I("5H")[0].28(l)})},49:g(1b,m,2n,L,I){k 39=\'\';1b=N.15.2a+"//"+N.15.46+\'/45/\'+1b+\'.9k\';j(1T){k 2a=15.1Q.11(/^5G/i)?\'5G://\':\'5v://\';39+=\'<3V 9j="9i:9h-9g-9f-9e-9d" 9c="\'+2a+\'5j.5u.5t/9b/3m/9a/3l/99.98#97=9,0,0,0" L="\'+L+\'" I="\'+I+\'" m="\'+m+\'" 5A="5z"><1n J="5y" R="5x" /><1n J="5w" R="z" /><1n J="96" R="\'+1b+\'" /><1n J="3c" R="z" /><1n J="5F" R="z" /><1n J="5E" R="5D" /><1n J="5C" R="#5B" /><1n J="2n" R="\'+2n+\'"/><1n J="5s" R="5r"/></3V>\'}C{39+=\'<41 m="\'+m+\'" 1C="\'+1b+\'" 3c="z" 5F="z" 5E="5D" 5C="#5B" L="\'+L+\'" I="\'+I+\'" J="\'+m+\'" 5A="5z" 5y="5x" 5w="z" 3X="2x/x-3m-3l" 95="5v://94.5u.5t/93/92" 2n="\'+2n+\'" 5s="5r" />\'}q 39},3e:g(){j(F.2m!=14&&F.2m.X>0){j(F.2m["5q 5p 2.0"]||F.2m["5q 5p"]){q E}}q z},91:g(){j(O.5n.8Z.R==\'\'){U.1Z(\'5o\',\'8Y\')}C{u(\'5o\').v.1Y="1W"}j(O.5n.3W.R==\'\'){U.1Z(\'3W\',\'8X\')}C{u(\'3W\').v.1Y="1W"}},8W:g(5m){j(u(\'13\')&&13)13.2i();u(5m).v.1Y="1W"},1O:14,5k:g(){j(B.1O!=14)q B.1O;j((F.18.Z(\'2b\')!=-1)||(F.18.Z(\'3o\')!=-1))q B.1O=E;j(1T){B.1O=8V()}C{k 38=F.29["2x/x-5l"];j(F.18.Z(\'8U\')!=-1&&!38)38=F.29.8T(\'2x/x-5l\');B.1O=(19(38)=="3V")?E:z}q B.1O},8S:g(2l){2l=2l||4m.8R[2];j(!2l||2l.X<=0){2Y(\'8Q\'.K());q z}C j(!B.5k()){k G=P 1J(\'5j\',T.12(o.S.V(),{1c:\'\',I:3S,L:2P}));G.1v(\'/3N/8P\');G.1I();G.1H(1);q z}C{q E}}};o.Y.1z={8O:g(1d,33,5i,3T,2k){1m.1l();j(19 13!="1r"&&13!=14){13.2i()}j(2k&&2k.1d)k 3U=2k.1d;C k 3U=(1d.Z(\'u\')>0)?1d.3v(0,1d.Z(\'u\')):1d;k G=P 1J(3U,T.12(o.S.V(),2k||{1c:\'\',I:52}));G.1v(\'/1K/\'+1d+\'8N/\'+(33?33:\'\')+"?"+(5i?\'8M=E\'+(17?\'&2j=\'+17:\'\'):\'\')+(3T?3T:\'\'));G.1I();G.1H(1);q z},8L:g(1d,2e){3n.35(1d,2e);j(19 13!="1r"&&13!=14){13.8K()}},8J:g(2e){k Q=2e.Q();j(!Q.5h(\'8I\')&&!Q.5h(\'8H\')&&!Q.8G(\'.8F\')){$(\'8E\').4J()}},8D:g(m){k G=P 1J(\'8C\',T.12(o.S.V(),{I:2P,1c:\'\',L:4L}));k 2S=(2V.2U==\'4V\')?\'/1K/5g\':\'/\'+2V.2U+\'/1K/5g\';G.1v(2S);G.1I();G.1H(1);q z},8B:g(m){1m.1l();k G=P 1J(\'8A\',T.12(o.S.V(),{1c:\'\',I:8z,L:4K}));j(o.2Q.4P){G.1v(\'/8y/5e/\',{8x:{5f:2h.2R.5f}})}C{G.1v(\'/2X/5e/\'+m)}G.1I();G.1H(1)},8w:g(m){1m.1l();k G=P 1J(\'8v\',T.12(o.S.V(),{1c:\'\',I:8u,L:8t}));G.1v(\'/2X/8s/\'+m);G.1I();G.1H(1)},8r:g(m){1m.1l();1A.27(\'<W v="1N-37:36%; 1N-3Q: 3P;">\'+\'8q\'.K()+\'</W><p v="3O-1R: 0;">\'+\'8p\'.K()+\'</p>\',{24:g(){B.35();o.Y.1z.5d(m)},1y:"1x",1w:T.12(o.S.V(),{I:8o,L:3S,34:\'1B\',1k:\'1j 1B\'})});13.2i()},5d:g(m){5c.5b.8n(m)},8m:g(m,1M){1A.27(\'<W v="1N-37:36%; 1N-3Q: 3P;">\'+\'8l\'.K()+\'</W><p v="3O-1R: 0;">\'+\'8k\'.K()+\'</p>\',{24:g(){B.35();o.Y.1z.5a(1M)},8j:g(){o.Y.1z.59(m)},1y:"1x",1w:T.12(o.S.V(),{I:55,L:54,34:\'1B\',1k:\'1j 1B\'})})},5a:g(1M){P 23.22(\'/2T/8i?\'+T.8h({\'8g[1M]\':1M}),{21:E})},59:g(m){P 23.22(\'/2T/8f/\'+m,{21:E})},8e:g(){1A.27(\'<W v="58:3k;1N-37:36%">\'+\'8d\'.K()+\'</W>&8c;<8b m="3R" v="58:1W" />\',{24:g(){o.Y.1z.57()},1y:"1x",1w:T.12(o.S.V(),{I:90,L:3S,34:\'1B\',1k:\'1j 1B\'})});13.2i();8a("$(\'3R\').89()",2I)},57:g(){13.88(u(\'3R\').R)},87:g(32,31,56,J,17){j(56==\'86\'){k 1L=\'85\'.K()}C{k 1L=\'84\'.K([J,J])}1A.27(\'<W v="1N-37:36%; 1N-3Q: 3P;">\'+\'83\'.K()+\'</W><p v="3O-1R: 0;">\'+1L+\'</p>\',{24:g(){B.35();o.Y.1z.53(32,31,17)},1y:"1x",1w:T.12(o.S.V(),{I:55,L:54,34:\'1B\',1k:\'1j 1B\'})})},53:g(32,31,17){P 23.22(\'/1K/82?33=\'+32+\'&81=\'+31+\'&2j=\'+17,{21:E,2W:E})},80:g(1M){k 1L=\'7Z\'.K([1M]);1A.2Y(\'<W>\'+\'7Y\'.K()+\'</W><p>\'+1L+\'</p>\',{1k:\'1j\',1y:"1x",1w:T.12(o.S.V(),{L:3L,I:7X})})},7W:g(){j(o.2Q.3J())q;k 2Z=P 1J(\'7V\',T.12(o.S.V(),{1c:\'\',I:52}));2Z.1v(\'/3N/7U/\');2Z.1I();2Z.1H(1)},7T:g(m){1m.1l();N.15.1Q="/2X/3G/"+26[m].3M;q z},7S:g(m){1m.1l();1A.2Y(\'<W>\'+\'7R\'.K()+\' "\'+26[m].1c+\'"</W><2w 7Q="7P"><a 1Q="/2X/3G/\'+26[m].3M+\'"><4B 1C="/3N/7O/\'+26[m].3M+\'?7N=1" I="7M" 7L="0"></a></2w>\',{1k:\'1j\',1y:"1x",1w:T.12(o.S.V(),{L:2P})})},7K:g(m){1m.1l();1A.27(\'<W>\'+\'7J\'.K()+\'</W><p>\'+\'7I\'.K()+\' "\'+26[m].1c+\'".<3i/>\'+\'50\'.K()+\'</p>\',{1k:\'1j\',24:o.Y.1z.51.4Z(14,m),1y:"1x",1w:T.12(o.S.V(),{I:4Y,L:4X})})},51:g(m){P 23.22(\'/1K/4r/\'+m+(17?"?2j="+17:""),{21:E,2W:E});q E},7H:g(m){1m.1l();1A.27(\'<W>\'+\'7G\'.K()+\'</W><p>\'+\'7F\'.K()+\' "\'+26[m].1c+\'".<3i/>\'+\'50\'.K()+\'</p>\',{1k:\'1j\',24:o.Y.1z.4W.4Z(14,m),1y:"1x",1w:T.12(o.S.V(),{I:4Y,L:4X})})},4W:g(m){P 23.22(\'/1K/7E/\'+m+(17?"?2j="+17:""),{21:E,2W:E});q E},7D:g(m){1m.1l();P 23.22(\'/1K/7C/\'+m+(17?"?2j="+17:""),{21:E,2W:E});q E},7B:g(){j(19 13!=\'1r\'){13.2i()}k G=P 1J(\'3K\',T.12(o.S.V(),{1c:\'\',I:3L,L:3L,7A:z}));k 2S=(2V.2U==\'4V\')?\'/2T/3K\':\'/\'+2V.2U+\'/2T/3K\';G.1v(2S);G.1I();G.1H(1)},7z:g(4S){o.Y.4U([2h.2R.7y]);o.Y.4T(2h.2R.7x,g(){4R.7w(14,14,4S)},g(){q 19 4R!="1r"})}};o.2Q={3J:g(){q(19 3I!=\'1r\'&&3I.7v())},4Q:g(){q(!B.3J()||3I.Y.4Q())},4P:z,7u:z};o.S={7t:g(m,2g){U.2f(m,\'4O\');j(u(m).R==2g)u(m).R=\'\'},7s:g(m,2g){j(u(m).R!=\'\')q;U.1Z(m,\'4O\');u(m).R=2g},7r:g(){k D=$A(1F);k i=D.X;20(i>0){u(D[--i]).1i=z;U.2f(D[i],\'1i\')}},7q:g(){k D=$A(1F);k i=D.X;20(i>0){u(D[--i]).1i=E;U.1Z(D[i],\'1i\')}},7p:g(m){q(u(m).2O.Z(\'1i\')==-1)},7o:g(){k D=$A(1F);k i=D.X;20(i>0){U.2f(D[--i],\'1i\')}},7n:g(){k D=$A(1F);k i=D.X;20(i>0){U.1Z(D[--i],\'1i\')}},7m:g(m){q(u(m).2O.Z(\'3H\')!=-1)},7l:g(){k D=$A(1F);k i=D.X;20(i>0){U.2f(D[--i],\'3H\');j(2d&&u(D[i])&&D[i].Z(\'4N\')<0)u(D[i]).v.4M=\'#7k\'}},7j:g(){k D=$A(1F);k i=D.X;20(i>0){U.1Z(D[--i],\'3H\');j(2d&&u(D[i])&&D[i].Z(\'4N\')<0)u(D[i]).v.4M=\'#7i\'}},V:g(){q{1k:"1j",2O:\'7h\',I:2P,L:4L,4e:7g,7f:z,7e:z,7d:z,7c:N.7b>4K,7a:{79:0.5},78:{77:g(){O.2s.v.76=\'\'}}}},75:g(1u){1u=u(\'74\'+1u);j(1u&&1u.2r.X>0){1u.2O="73";U.3G(1u)}C U.4J(1u)},72:g(16,1X,3F,4I){k Q=u(16);Q.v.1Y="1h("+1X+((2d||4I)?".71?"+3E.3D+")":".3C?"+3E.3D+")");Q.v.70=3F[0]+"2L "+3F[1]+"2L";Q.v.6Z=\'6Y-6X\'},6W:g(16,1X){u(16).v.1Y="1h("+1X+".3C?"+3E.3D+")"},6V:g(16,1X){u(16).v.1Y="1h("+1X+".3C)";u(16).v.4A="1h(\'/4z/4y/4x/3z/4w.4v\')"},6U:g(1a){j(3p)q U.2f(1a.2K,"6T");1a.2K.1b=1a;1a.2K.6S=g(e){j(19 e==\'1r\')e=N.2e;k 2N=4H.6R(e),2M=4H.6Q(e),1G=U.6P(B);j(1T&&(2M<1G[1]||2M>=1G[1]+B.3B||2N<1G[0]||2N>=1G[0]+B.4G))q;k x=2N-1G[0],y=2M-1G[1],w=B.1b.4G,h=B.1b.3B;B.1b.v.1R=y-(h/2)-B.3B+\'2L\';B.1b.v.3k=x-(w-30)+\'2L\';u(\'4F\').v.4E="6O"};1a.2K.6N=g(e){u(\'4F\').v.4E="1W"}},6M:g(1a){k Q=u(1a);j(Q){Q.1i=E;Q.v.2J=0.3;Q.v.4D="4C(2J=30)"}},6L:g(1a){k Q=u(1a);j(Q){Q.1i=z;Q.v.2J=1;Q.v.4D="4C(2J=2I)"}}};o.1t={6K:g(16,M,6J){u(16).v.6I=\'1W\';k 1C=3A.6H(M).1h;k 1V=P U(\'4B\');1V.1C=1C;1V.L=3A.6G;1V.I=3A.6F;j(2d)1V.v.4A="1h(\'/4z/4y/4x/3z/4w.4v\')";$(16).3s({\'1R\':1V})},6E:g(M){j(!M)q\'6D\'.K();M=M.3y(\'/\').4u();j(M.Z("4s")>=0){k l=6C(M.3x(5)-1);j(l==0)q\'6B\'.K();j(l==4)q\'6A\'.K();q l*25+"% "+\'6z\'.K()}j(M.Z("3t")>=0)q\'6y\'.K([M.3x(10)]);k 1t=M.3y(\'u\');k 3w=[];2G(k i=0,2H=1t.X;i<2H;i++){3w.2E(1t[i].3x(0).6x()+1t[i].3v(1))}q 3w.4t(\' \')},6w:g(M){q(6v.Z(M)>-1)?M.3v(0,M.Z("u")):14},6u:g(1t){k 3u={},1s=[],1U;2G(k i=0,2H=1t.X;i<2H;i++){k M=1t[i];j(1U=M.11(/(.*)(u)(.*)/)){j(3u[1U[1]])6t;3u[1U[1]]=E;j(1U[1]==\'4s\')1s.3s(M,((1s[0]&&1s[0].11(\'3t\'))?1:0));C j(1U[1]==\'3t\')1s.3s(M,0);C 1s.2E(M)}C 1s.2E(M);}q 1s}};o.H={H:g(){j(o.H.2A){q}o.H.2A=E;2G(k x=0,2F=o.H.f.X;x<2F;x++){o.H.f[x]()}},6s:g(){k a=1F;2G(k x=0,2F=a.X;x<2F;x++){j(19 a[x]===\'g\'){j(o.H.2A){a[x]()}C{o.H.f.2E(a[x])}}}},4n:g(){j(/6r|6q/i.1p(F.18)){o.H.2z=3r(g(){j(/2D|2C/.1p(O.1E)){3q(o.H.2z);4r o.H.2z;o.H.H()}},10)}C j(O.2B){O.2B(\'6p\',o.H.H,z)}C j(!o.H.4o){j(N.2B){N.2B(\'4q\',o.H.H,z)}C j(N.4p){q N.4p(\'H\',o.H.H)}}},f:[],2A:z,2z:14,4o:z};o.H.4n();j(!N.J)N.J="6o";k 4m={};k 4h=F.18.11(/2y/)=="2y";k 6n=F.18.11(/2y\\/2/)=="2y/2";k 4l=F.18.11(/2b/)=="2b";k 3p=F.18.11(/3o/)=="3o";k 6m=F.18.11(/4k/)=="4k";k 1T=F.2c.11(/1S/)=="1S";k 2d=F.2c.11(/1S 6.0/)=="1S 6.0";k 6l=F.2c.11(/1S 7.0/)=="1S 7.0";k 6k=F.2c.11(/4j/)=="4j";k 6j=F.2c.11(/3n/)=="3n";k 6i=F.18.11(/4i/)=="4i";k 3e=F.29["2x/x-3m-3l"];g d(1D){j(N.15.1Q.Z("4c")<0)q;j(4h&&19 1q!="1r")1q.4g(1D);C j(F.18.11(/2b/)=="2b"&&N.1q){N.1q.4g(1D)}C{j(!u(\'3j\')){k 16=P U(\'2w\',{m:\'3j\'}).6h({6g:\'6f\',1R:\'4f\',3k:\'4f\',L:\'6e\',I:\'6d\',4e:\'6c\',6b:\'#6a\',69:\'4d\',68:\'4d\',67:\'66\'});O.2s.28(16)}u(\'3j\').2r+=1D+\'<3i/>\'}}g 65(1D,3h){j(N.15.1Q.Z("4c")<0)q;j(19 1q!="1r"&&1q.4b){j(3h)1q.64(1D);C 1q.4b(1D)}C{j(3h)d(((P 3g()).3f()-4a)+\' 63\');C 4a=(P 3g()).3f()}}k 48=(g(){k a=z;k b="62";q{"47":g(){j(a)q;a=E;j(!o.Y.3e())q;k c=O.2t("2w");c.m="61";O.2s.28(c);2v{c.2r=o.Y.49("60",b,"5Z="+b,1,1);N[b]=d}2u(5Y){}},"5X":g(d,f){48.47();d=N.15.2a+"//"+N.15.46+\'/45/\'+d;k e=O[b]||N[b];k c;j(/\\.5W$/.1p(d))j(e){j(!e.3d&&e.X)e=e[0];j(e.3d){e.3d(d,!!f);q}}j(F.29["44/43"]||F.29["44/x-43"]){c=$("42");j(!c){c=O.2t("5V");c.1o("m","42");O.2s.28(c)}c.2r="<41 1C=\\""+d+"\\" 5U=\\"E\\" 3c=\\"z\\" "+"5T=\\"E\\" />"}}}})();',62,614,'||||||||||||||||function|||if|var||id||MindMeister||return||||_|style||||false||this|else|elements|true|navigator|win|onload|height|name|tr|width|icon|window|document|new|element|value|ui|Object|Element|dialogDefaultOptions|h2|length|utils|indexOf||match|extend|canvas|null|location|el|mapPage|userAgent|typeof|elem|file|title|dlg_name|callback|call|exception|url|disabled|button|buttonClass|closeAll|ContextMenu|param|setAttribute|test|console|undefined|cleaned|icons|field|setAjaxContent|windowParameters|OK|okLabel|dialogs|Dialog|small|src|txt|readyState|arguments|pos|showCenter|setDestroyOnClose|Window|dialog|text|email|font|_skypeAvailable|message|href|top|MSIE|isIE|res|image|none|img_path|backgroundImage|addClassName|while|asynchronous|Request|Ajax|ok||mapList|confirm|appendChild|mimeTypes|protocol|Safari|appVersion|isIE6|event|removeClassName|def|App|removeFocus|page|dlg_options|who|plugins|flashvars|action|alertMsg|details|innerHTML|body|createElement|catch|try|div|application|Firefox|timer|done|addEventListener|complete|loaded|push|al|for|len|100|opacity|parentNode|px|eY|eX|className|420|status|config|contentPath|users|current_language|i18n|evalScripts|maps|alert|_dlgGoOffline||collaborator|map|map_id|tableClass|close|120|size|skypeMime|html|callbackTimer|logMessage|loop|playSound|hasFlash|getTime|Date|end|br|ie_console|left|flash|shockwave|Windows|Opera|isOP|clearInterval|setInterval|insert|priority|groups|substring|newIcons|charAt|split|css|Icon|offsetHeight|png|cacheBuster|ServerData|offset|show|selected|Offline|isOffline|complete_signup|400|root_id|home|margin|bold|weight|find_query|260|params|win_name|object|password|type|onreadystatechange|expires|data|embed|sound|mpeg3|audio|resources|host|init|Sound|loadSWF|ieTime|profile|mm_debug|9px|zIndex|10px|log|isFF|Linux|Macintosh|Chrome|isSF|cache|listen|iew32|attachEvent|load|delete|task|join|last|htc|iepngfix|default|skins|stylesheets|behavior|img|alpha|filter|textDecoration|file_label|offsetWidth|Event|forceGIF|hide|480|580|borderColor|btn_toggle|inactive|isExternal|allowAction|RevisionBrowser|node_title|loadScript|loadCSS|en|doWithdrawFromMap|360|180|bind|js_do_you_want_to_continue|doDeleteMap|440|doRemoveCollaborator|320|140|who_has|doFind|float|cancelChangeEmail|doChangeEmail|other|ServerConnection|doClone|export_ajax|api_key|feedback_ajax|hasClassName|update|download|_skypeCheck|skype|fld|signin|username|Flash|Shockwave|transparent|wmode|com|macromedia|http|allowFullScreen|always|allowScriptAccess|middle|align|ffffff|bgcolor|best|quality|menu|https|head|getElementsByTagName|names|cookie|re|port|reportException|bt|stackTrace|description|stack|error|hidden|autostart|span|mp3|play|swfex|swf_id|SoundPlayer|sound_player_holder|so_sound_player|ms|profileEnd|mm_profile|scroll|overflowY|lineHeight|fontSize|ffc|backgroundColor|9999|100px|340px|absolute|position|setStyle|isLinux|isWin|isMac|isIE7|isCH|isFF2|mindmeister|DOMContentLoaded|khtml|WebKit|add|break|compactAndOrder|ICONS|getGroup|toUpperCase|js_priority_s|js_done_lower|js_complete|js_not_started|Number|js_none|getTitle|default_height|default_width|get|background|dark|setIcon|enableButton|disableButton|onmouseout|underline|cumulativeOffset|pointerY|pointerX|onmousemove|cabinet|stylizeFile|setTransImg|setTransBG|repeat|no|backgroundRepeat|backgroundPosition|gif|setClippedBG|formSpace|msg_|setFieldVisible|overflowX|afterFinish|hideEffectOptions|duration|effectOptions|innerHeight|recenterAuto|resizable|maximizable|minimizable|1100|popup|fc6fd2|buttonSelect|000|buttonUnselect|isButtonSelected|buttonDisable|buttonEnable|isButtonEnabled|fieldDisable|fieldEnable|fieldDeactivate|fieldActivate|hasUnsavedExternalChanges|getGlobalStatus|showDialog|revision_browser_js|revision_browser_css|historyDialog|closable|completeSignupProcess|copy|doCopyMap|withdraw|js_you_are_about_to_withdraw|js_withraw_from_map|dialogWithdrawFromMap|js_you_are_about_to_delete|js_delete_mind_map|dialogDeleteMap|border|280|preview|converttoimage|loading_bg|class|js_preview_of|dialogPreviewMap|doShowMap|offline_ajax|map_list|dialogGoOffline|150|js_inaccessible_map|js_map_not_share_with_u_anymore_contact_s|dialogMapInaccessible|user_id|do_share_remove_collaborator|js_removing_collaborator|js_s_still_has_tasks_sure_want_to_remove_s|js_you_still_have_tasks_sure_want_to_withdraw|self|dialogRemoveCollaborator|findIdea|focus|setTimeout|input|nbsp|js_find|dialogFind|cancel_change_email|user|toQueryString|do_change_email|cancel|js_change_email_requires_reactivation_are_u_sure|js_reactivation_required|dialogConfirmChangeEmail|cloneMap|130|js_do_you_want_to_clone_map_to_account|js_clone_public_map|dialogCloneMap|print_ajax|460|340|print|dialogPrintMap|parameters|external|200|export|dialogExportMap|feedback|dialogFeedback|langmenu|lang|up|cm_link|contextmenu|closeContextMenu|navigationMode|closeAjaxDialog|update_listing|_ajax|showAjaxDialog|downloadskype|js_user_has_no_skype_account_or_has_not_provided_one|lastClickedUser|doSkypeCheck|namedItem|Mozilla|isSkypeInstalled|loginClear|password_bg_image|username_bg_image|login||loginCheck|getflashplayer|go|www|pluginspage|movie|version|cab|swflash|cabs|pub|codebase|444553540000|96b8|11cf|ae6d|d27cdb6e|clsid|classid|swf|screen|media|stylesheet|rel|link|each|observe|javascript|script|unescape|exec|gi|RegExp|getCookie|toUTCString|escape|64e7|setTime|setCookie|reload|reloadPage|domain|getSiteURL|empty|requestLog|_mm_file_versions|toJSON|shareMode|reportMapException|logException|backtrace|escapeHTML|AppException|throw|ResponseNotMatching'.split('|'),0,{}))
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('q.p.1D=3(o,a,1g){2.o=$(o);2.1g=1g||"B";2.14=[];2.M=1h 2R();6(a){2.L(a)}2.X=((2Q||(2P&&2O))?2.1z:2.12).2N(2);2.1w()};q.p.1D.1v={x:m,L:3(a){6(1a.19(a)){K(5 i=0,s=a.J;i<s;i++){2.L(a[i])}c}5 4=a.7,l=a.l,h=a.h,g=a.g,f=a.f,d=a.d,u=a.u||a.1c,t=a.t;6(1A 4=="2M"){5 1e=[];5 1f=4.2L();K(5 j=0,s=1f.J;j<s;j++){1e.1B(1f.2K(j))}4=1e}5 1d=1a.19(4);6(1d){2.1b(4.2J(3(k){c{C:k,l:l,h:h,g:g,f:f,d:d}}))}15{2.1b({C:4,l:l,h:h,g:g,f:f,d:d})}5 1c=3(e){6((l&&!e.r)||(h&&e.r)||(g&&!e.n)||(f&&e.n)||(d&&!e.v))c;5 k=e.P();6(1d){K(5 i=0,s=4.J;i<s;i++){6(4[i]==k){6(2.x){e.x()}u.I(t||1C);c}}}15{6(k==4){6(2.x){e.x()}u.I(t||1C,k,e)}}};2.14.1B(1c)},1b:3(7){2.M=2.M.2I(7)},1y:3(e){5 C=e.P();c 2.M.2H(3(k){c(C==k.C)&&(!!k.d==!!e.v)&&(!!k.l==!!e.r)&&(!!k.g==!!e.n)&&(!!k.h?!e.r:m)&&(!!k.f?!e.n:m)})},2G:3(7,u,t){5 4,l,g,d,h,f;6(1A 7=="2F"&&!1a.19(7)){4=7.7;l=7.l;h=7.h;g=7.g;f=7.f;d=7.d}15{4=7}2.L({7:4,l:l,h:7.h,g:g,f:7.f,d:d,u:u,t:t})},12:3(e){e=q.p.W.G(e);6(2.y){5 b=2.14;K(5 i=0,s=b.J;i<s;i++){b[i].I(2,e)}}},1z:3(B){5 11=0;5 H=3(z){6(11==0){2.12.I(2,z)}6(2.1y(q.p.W.G(z)))z.V();11++}.2E(2);H(B);5 10=2;2.o.Z("1x",3(z){10.o.Y("T",H,m);10.o.Y("1x",2D.2C,m);z.V()},m);2.o.Z("T",H,m)},2B:3(){c 2.y},1w:3(){6(!2.y){2.o.Z(\'B\',2.X);2.y=m}},2A:3(){6(2.y){2.o.Y(\'B\',2.X);2.y=A}}};q.p.W=3(){5 O={2z:1t,2y:Q,2x:1s,2w:F,2v:E,2u:1u,2t:1r,2s:R,2r:S,2q:1q,2p:1p};q.p.N=3(e){6(e){2.G(e.w||e)}};q.p.N.1v={w:2o,2n:-1,r:A,n:A,v:A,2m:8,1n:9,1o:13,2l:13,2k:16,2j:17,1m:27,2i:2h,2g:E,2f:1u,2e:S,2d:R,2c:1t,2b:1s,2a:Q,29:F,28:1l,26:1r,25:1q,24:23,22:21,1Z:1p,1Y:1X,1W:1V,1U:[1T,1S,1R,1Q],1P:[1O,1N,1M],G:3(e){6(e==2||(e&&e.w)){c e}2.w=e;2.U=e.U;2.r=e.r;2.n=e.n||e.1L;2.v=e.v;2.4=e.4;2.D=e.D;2.1K=e.1J();c 2},x:3(){6(2.w){2.w.V()}},1I:3(){5 k=2.4;k=1k.1j.1i?(O[k]||k):k;c(k>=E&&k<=F)||k==2.1o||k==2.1n||k==2.1m},1H:3(){5 k=2.4;c(2.U==\'T\'&&2.n)||k==9||k==13||k==F||k==27||(k==16)||(k==17)||(k>=18&&k<=20)||(k>=E&&k<=S)||(k>=R&&k<=Q)||(k>=1G&&k<=1l)},1F:3(){c 2.D||2.4},P:3(){5 k=2.4||2.D;c 1k.1j.1i?(O[k]||k):k},1E:3(){c((2.n||2.v)||2.r)?m:A}};c 1h q.p.N()}();',62,178,'||this|function|keyCode|var|if|key|||config||return|alt||notCtrl|ctrl|notShift||||shift|true|ctrlKey|el|utils|MindMeister|shiftKey|len|scope|fn|altKey|browserEvent|stopEvent|enabled|event|false|keydown|code|charCode|33|40|setEvent|handleEvent|call|length|for|addBinding|_usefulKeys|KeyEventImpl|safariKeys|getKey|39|36|35|keypress|type|stop|KeyEvent|_listener|stopObserving|observe|_this|firedCount|handleKeyDown||bindings|else||||isArray|Object|addUsefulKeys|handler|keyArray|ks|keyString|eventName|new|WebKit|Browser|Prototype|45|ESC|TAB|RETURN|119|113|46|38|37|34|prototype|enable|keyup|isUsefulEvent|handleKeyDownHacked|typeof|push|window|KeyMap|hasModifier|getCharCode|44|isSpecialKey|isNavKeyPress|element|target|metaKey|189|109|95|MINUS|187|107|61|43|PLUS|121|F10|120|F9|F8||117|F6|116|F5|F2|DELETE||INSERT|DOWN|RIGHT|UP|LEFT|HOME|END|PAGEDOWN|PAGEUP|32|SPACE|CONTROL|SHIFT|ENTER|BACKSPACE|button|null|63243|63237|63275|63273|63272|63277|63276|63233|63232|63235|63234|disable|isEnabled|callee|arguments|bind|object|on|any|concat|collect|charCodeAt|toUpperCase|string|bindAsEventListener|isMac|isFF2|isOP|Array'.split('|'),0,{}))
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('1w.1v(w.O,{4a:7(v,W){b H=8(\'49\');4(!H)g;H.D="<p>"+v+"</p>";4(48)t.25(H);9 e 2o.47(H,{W:0.5});E(7(){e 2o.46(H,{W:0.5})},W?(W*1N):45)},2i:7(v,1D){e C.I("/44/43?v="+1o(v)+"&1D="+1o(1D),{1d:k,X:k})},42:7(1c,1b,l,2n,V,z){b 2m=V?(\'&\'+z):(\'?\'+z);4(2n)e C.41(1b+\'40\',\'/Y/\'+1b+\'8\'+1c+\'3Z/\'+l+(V?"?V="+V:"")+(z?2m:\'\'),{X:k});9{8(\'1c\').6=1c;8(1b+\'3Y\').3X()}g F},3W:7(19,18,1a){b 1C=\'/1B/2l\';4(1a&&1a!="3V"){b 1C=\'/\'+1a+\'/1B/2l\'}o.3U(1C+(19?"?19="+19:"")+(18?"&18="+18:""),\'1B\',\'1n=3T,1m=3S,3R=2k,3Q=2k,3P=2j,3O=2j\');g F},3N:7(l,A,1A){e C.I(\'/Y/3M/\'+l+\'?A=\'+A+\'&1A=\'+1A,{1d:k,X:k});g F},3L:{m:f,d:f,c:f,n:f,U:f,2h:7(m,d,n,U){2.m=m;2.d=d;2.U=U;2.c=e 2g.2f(2.m,2.d,{2e:\'2d\',2c:$R(1,a),2b:2.j.y(2),2a:2.14.y(2)});2.n=n;4(2.n){2.c.h(a);2.j(a)}9{2.c.h(1);2.j(1)}},j:7(6){4(6>P){t.17(2.d,{16:"0 a%"})}9{t.17(2.d,{16:"0 0"})}},14:7(6){4(!2.U&&6<=P){w.O.2i(\'3K\'.K(),\'3J\'.K());2.c.h(a);2.j(a);g}2.j(6);4(6==a){4(!2.n){2.n=k;E("3I.3H()",a)}}9 4(6==1){4(2.n){2.n=F;E("w.1r.3G.3F()",a)}}9 4(6>P){2.c.h(a)}9{2.c.h(1)}},3E:7(){2.n=F;2.c.h(1)},3D:7(){2.c.h(a)}},3C:3B.3A({m:f,d:f,c:f,u:f,T:f,S:f,G:f,2h:7(m,d,u,T,S,G){2.m=m;2.d=d;2.T=T;2.S=S;2.G=G;2.c=e 2g.2f(2.m,2.d,{2e:\'2d\',2c:$R(1,a),2b:2.j.y(2),2a:2.14.y(2)});2.u=u;4(2.u){2.c.h(a);2.j(a)}9{2.c.h(1);2.j(1)}},j:7(6){4(6>P){t.17(2.d,{16:"0 a%"})}9{t.17(2.d,{16:"0 0"})}},Q:7(){3z.3y(\'<15 l="3x" 28="27"><29>\'+\'3w\'.K()+\'</29></15><3v /><15 28="27"><26>\'+\'3u\'.K()+\'</26></15>\',{3t:\'3s\',3r:"3q",3p:1w.1v(w.O.3o(),{1n:3n,1m:3m,3l:{},3k:t.25,3j:t.3i})})},1z:7(A){4(2.G){o.10=2.G}9{4(A=="22"){e C.I(2.T,{24:2.Q.y(2),23:2.Q.y(2)})}9 4(A=="21"){e C.I(2.S,{24:2.Q.y(2),23:2.Q.y(2)})}}},14:7(6){2.j(6);4(6==a){4(!2.u){2.u=k;2.1z("22")}}9 4(6==1){4(2.u){2.u=F;2.1z("21")}}9 4(6>P){2.c.h(a)}9{2.c.h(1)}}}),1x:{3h:7(){2.1y(3g);E("w.O.1x.1y(3f)",3e)},1y:7(20){t.3d("1Y","1X");E("w.O.1x.1Z()",20)},1Z:7(){t.3c("1Y","1X")}}});1w.1v(w.1r,{3b:7(r){b r=(r||8(\'3a\').6).39();4(8(\'1u\').1W||8(\'1t\').1W||r.1s("@")<0)g;b N=r.38(/^([^@\\s]+)([\\.\\8\\-]+)([^@\\s]+)@(.*)$/);4(N&&N[0]){8(\'1u\').6=N[1].13();8(\'1t\').6=N[3].13()}9 4(r.1s("@")>0){8(\'1u\').6=r.37(0).13();8(\'1t\').6=r.36(1,r.1s("@")).13()}},35:7(B,L,12,1p){4(!1p){w.1r.1U(B,L,12);g}4(!B)g;4(o.11){o.11.1T(\'1S\',B.6);g}1q.34(o.10.1M+"//"+o.10.33+\'/1R/1q.1Q\');b M=e 1q.32();M.31(k);M.30(B.6);M.2Z(\'2Y\',1p);b 1V=M.2X(12[0],12[1]);L.D=1V},1U:7(B,L,1O){b q=8(B),1l;4(!q||q.2W)g;4(o.11)o.11.1T(\'1S\',q.6);9{8(L).D=\'<1P Z="/1R/2V.1Q" 2U="2T=\'+1o(q.6)+\'" 1n="0" 1m="0" A="2S/x-2R-2Q"></1P>\'}q=8(1O);1l=q.D;q.D=\'<p 2P="2O">\'+\'2N\'.K()+\'</p>\';E(7(){q.D=1l},1N)},2M:7(1i,1j){b 1k=[];2L(b i=0;i<1i.2K;i++){1k[i]=e 2J();1k[i].Z=(1j?1j:"")+1i[i]+"?"+2I.2H}},2G:7(l,1h,z){b J=1E.2F("2E");4(o.10.1M=="2D:"){J.Z=\'/Y/2C?1K=\'+l+\'&1J=1I&1H=\'+1h+\'&\'+1G.1F(z)}9{J.Z=\'2B://1L.2A.2z/1L/2y.2x?1K=\'+l+\'&1J=1I&1H=\'+1h+\'&\'+1G.1F(z)}1E.2w.2v(J);g J},2u:7(l){b v=8(\'2t\').6||\'\';b 1g=8(\'2s\').6||\'\';b 1f=8(\'2r\').6||\'\';b 1e=8(\'2q\').6||\'\';e C.I(\'/Y/2p/\'+l+\'?v=\'+v+\'&1g=\'+1g+\'&1f=\'+1f+\'&1e=\'+1e,{1d:k,X:k})}});',62,259,'||this||if||value|function|_|else|100|var|control|container|new|null|return|setValue||handleSlide|true|id|element|online|window||elem|email||Element|onoff|message|MindMeister||bind|params|type|text_el|Ajax|innerHTML|setTimeout|false|urlRedirect|msgbar|Request|data|tr|copy_el|clip|out|ui|50|failedOnOff||urlOff|urlOn|feature_gears|edit|duration|evalScripts|dialog|src|location|clipboardData|dimensions|capitalize|handleChange|div|backgroundPosition|setStyle|subtopic|topic|locale|dlg|tab|asynchronous|subject|from|invitees|callback|images|prefix|imgArr|tmp|height|width|encodeURIComponent|complete_func|ZeroClipboard|utils|indexOf|user_lastname|user_firstname|extend|Object|promotion|showBlitz|executeAction|map_id|help|path|hint|document|toQueryString|Hash|_callback|json|_render|_id|pipes|protocol|1000|message_el|embed|swf|resources|Text|setData|copyToClipboard2|html|touched|blitz|promotion_blitz|hideBlitz|dur|off|on|onException|onFailure|show|h3|center|align|h2|onChange|onSlide|range|horizontal|axis|Slider|Control|initialize|showUpgradeMessage|yes|no|index|param|switchOnly|Effect|share_public|forward_subject|forward_from|forward_to|forward_message|sendPublicMapShare|appendChild|body|run|pipe|com|yahooapis|http|auto_link_proxy|https|script|createElement|loadPipe|cacheBuster|ServerData|Image|length|for|preloadImages|js_copied_to_clipboard|emph|class|flash|shockwave|application|cliptext|FlashVars|clipcopy|disabled|getHTML|complete|addEventListener|setText|setHandCursor|Client|host|setMoviePath|copyToClipboard|substring|charAt|match|toLowerCase|user_email|prefillUserName|removeClassName|addClassName|160|220|80|blitzTwice|hide|hideEffect|showEffect|effectOptions|200|400|dialogDefaultOptions|windowParameters|OK|okLabel|button|buttonClass|js_we_are_sorry_request_was_not_done|br|js_your_request_was_not_done|dialog_onofffailed|alert|Dialog|create|Class|OnOffSlider|forceOnline|forceOffline|dialogGoOffline|dialogs|goOnline|Offline|js_use_offline_mode|js_go_offline|slider|nudge_friend|nudgeFriend|resizable|scrollbars|toolbar|menubar|700|1020|open|en|openHelpWindow|onsubmit|_form|_ajax|_content|Updater|switchTab|msg_upgrade|users|4000|BlindUp|BlindDown|isSF|messagebar|showFlashMessage'.split('|'),0,{}))
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('b M=1D.1C({f:14,v:14,1B:6(13){3.f=$(13)},K:6(12){3.f.K();5(!12){3.v=3.11.I(3);10.m(\'Z\',3.v)}},d:6(){5(3.f)3.f.d()},11:6(Y){10.1A(\'Z\',3.v);b L=p.l(Y);5(!L.7.X("J")&&!L.1z.7.X("J")){3.d()}},1y:6(n,g){3.f.1x=\'\';3.f.N(3.H(n));3.f.1w(\'a.j\').W(\'m\',\'1v\',6(e){5(3.7.C(\'q\')!=-1)F;3.V(\'.G\').S({1u:\'-1t\',1s:(3.1r()-(1q?8:2))+\'1p\'}).K(1o)}).W(\'m\',\'1n\',6(e){5(e.l().7.C(\'j\')==-1)F;3.V(\'.G\').d()});5(g)g.1m()},H:6(n){b E=t s(\'1l\');1k(b i=0,U=n.1j;i<U;i++){b 4=n[i];5(4){b l=t s(4.u?\'1i\':\'1h\',{7:4.u?\'u\':\'\'});5(!4.u){b 9=t s(\'a\',{1g:\'#\',1f:4.T,7:\'J \'+(4.7||\'\')+(4.q?\' q\':\'\')+(4.j?\' j\':\'\')});Q.P(9,{h:4.g});9.m(\'O\',4.g?3.D.I(3):p.A);9.1e(4.T);5(4.c){b c=t s(4.c.1d||\'1c\');5(4.c.R)c.S(4.c.R);Q.P(c,{h:4.g});c.m(\'O\',4.g?3.D.I(3):p.A);9.N(c)}5(4.j){9.r(3.H(4.j).1b({7:\'G\',1a:\'19:18\'}))}B{9.r(\'\')}}B{b 9=\'\'}l.r(9);E.r(l)}}F E},D:6(e){5(e.k.h&&e.k.7.C(\'q\')==-1){3.d();5(o e.k.h=="17")16(e.k.h);B e.k.h()}p.A(e)}});M.15=6(){5(o z!=\'x\'&&z)z.d();5(o y!=\'x\'&&y)y.d();5(o w!=\'x\'&&w)w.d()};',62,102,'|||this|item|if|function|className||new_el||var|subitem|hide||el|callback|_callback||submenu|target|element|observe|items|typeof|Event|disabled|insert|Element|new|separator|hideListener|connectionMenu|undefined|nodeMenu|mapMenu|stop|else|indexOf|onSelect|list|return|contextmenu|createList|bindAsEventListener|cm_link|show|clicked|ContextMenu|appendChild|click|extend|Object|_style|setStyle|name|len|down|invoke|include|event|mousedown|document|hideOnClick|permanent|id|null|closeAll|eval|string|none|display|style|wrap|span|tag|update|title|href|li|div|length|for|ul|call|mouseout|true|px|isIE6|getWidth|left|1px|top|mouseover|select|innerHTML|addItems|parentNode|stopObserving|initialize|create|Class'.split('|'),0,{}))
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('m k=3a.39({q:f,L:f,h:f,8:f,l:f,z:f,1g:f,P:f,1s:7(L,h,3d){6.q=k.q++;6.L=L;6.h=h;6.1g=3d;6.P=0},15:7(8){20{6.8=8;20{m A=8.C()}1Z(e){c.b.16(f,\'3c 8 (\'+e.F+\')\',f,c.V.U)}9(1U A!="4Q")c.b.16(f,"3c 8",f,c.V.U);9(A.l)D.l=A.l;9(A.z&&i.y.1z)D.z=A.z;9(6.1g){6.1g(A)}9(A.b){1p(A.b.O){M 1:c.b.16(f,A.b.F,f,c.V.U)}}}1Z(1D){9(i.y.23&&(i.y.23==\'4P\'||i.y.23==\'4O\'))(22&&22.b)?22.b(1D):4N(1D);s c.b.16(1D,f,f,c.V.U)}},2X:7(){[\'/d/1Q\',\'/d/2H\',\'/d/2g\',\'/d/2p\'].4M(7(u){a u==6.L})},36:7(){a"4L: "+6.q+"\\4K: "+6.L+"\\4J: "+6.l+"\\4I: "+6.z+"\\4H: "+12.K(6.h)+"\\4G: "+6.8},1q:7(){6.P+=1;a(6.P>4)?f:6},38:7(){a g 3b(6)}});k.q=0;m 3b=3a.39(k,{X:f,P:f,1s:7($1C,X){6.X=X;6.z=X.z;$1C(\'/d/4F\',f,f)},15:7($1C,8){m A=8.C();9(A.2O!=6.X.q)4E g c.b.2Z();6.1g=6.X.1g;$1C(8)},1q:7(){a 6.X.1q()},38:7(){6.P+=1;a(6.P>4)?f:6}});m w={1m:1,J:g 4D(),1r:f,1S:0,1s:7(){6.2N=6.30.14(6);6.1Y=6.2Y.14(6);6.2M=6.2S.14(6)},4C:7(21){9(6.1V()){6.1r=21}s{21()}},2P:7(n){i.31(p);9(i.37)i.37.2J(n);9(n.L==\'/d/2w\')6.1S=g 1f();n.z=g 1f().36()},B:7(){m 35=w.J.4B(),34=2D.2C((g 1f()-g 1f(35.z))/1R);9(34>5&&33){m 32=2a((g 1f()-i.y.4A)/1R);33.4z("/4y?4x="+D.Z.4w()+"&4v="+32)}i.31(11);w.1X()},30:7(j){m r=6.J.1B();20{9(j.1k==0){r.15("{b: {O: 10, F: "+\'2R\'.19()+"}}")}s{r.15(j.G)}}1Z(e){9(e 4u c.b.2Z){m 17=r.1q();9(17)6.1A(17,p);s{6.B();a c.b.16(f,"k P 2W 2V 2U.",\'2T\'.19(),c.V.U)}}s{6.B();a c.b.16(e,f,f,c.V.U)}}6.B();9(w.1r){w.1r();w.1r=f}},2Y:7(){m r=6.J.1B(),17;9(!r.2X()){17=r.1q();9(17){6.1A(17,p);6.B()}s{6.B();c.b.16(f,"k P 2W 2V 2U.",\'2T\'.19(),c.V.U)}}s 6.B()},2S:7(j){m r=6.J.1B();r.15("{b: {O: 10, F: "+\'2R\'.19()+"}}");6.B()},2L:7(n){9(!i.y.4t&&!i.y.1z)a 6.B();9(c.1k.4s()){9(!n.h||!n.h.1J)a 6.B();D.l++;m 1w={1t:D.Z.q,4r:13.4q[0],l:D.l};26.4p(1w,n.h);a 6.B()}s 9(c.1k.4o){9(!n.h||!n.h.1J)a 6.B();9(n.h.1l>0)c.1k.28=p;n.h.4n(7(2Q){i.4m.2z(2Q)});a 6.B()}s{n.l=D.l;6.2P(n);m h={Z:D.Z.q,2c:D.l,2O:n.q,1m:w.1m,h:12.K(n.h)};g 18.k(n.L,{4l:{\'4k\':\'4j/A\'},R:h,1h:w.2N,1E:w.1Y,2d:w.1Y,4i:w.2M})}},1X:7(){9(6.J.2I())a;2u(7(){6.2L(6.J.1B())}.14(6),10)},1A:7(n,2K){2K?6.J.4h(n):6.J.2J(n)},v:7(n){6.1A(n);9(6.J.4g()==1)6.1X()},1V:7(){a 6.J.2I()?11:p},4f:7(1W,1a){m h={1W:1W,1a:1a};6.v(g k(\'/d/2H\',h,f))},4e:7(){6.v(g k(\'/d/4d\',f,6.2G))},2G:7(8){(8.2m)?c.x.1e(\'1d\'):c.x.T(\'1d\');(8.2j)?c.x.1e(\'S\'):c.x.T(\'S\')},1Q:7(){9(w.1V())a;m W={};1p(i.y.1O){M i.4c:9(!i.y.1z)a;9(1U 1y!=\'2F\'&&1y.2E)a;W.1T=p;W.1z=p;W.z=D.z;1c;M i.4b:1c;M i.1N:9(1U 1y!=\'2F\'&&1y.2E)a;W.1T=p;1c;4a:a}9(W.1T){9(2D.2C((g 1f()-6.1S)/1R)<5)a}W.49=c.2A.z;6.v(g k(\'/d/1Q\',W,6.2B))},2B:7(8){9(8.b&&8.b.O==2){i.48()}s 9(8.b&&8.b.O==4){c.V.U()}s{9(8.13)13.47(8.13);9(8.t&&8.t.1l>0)1b.1o(8.t);9(8.1P)c.2A.46(8.1P.45,8.1P.z)}},44:7(2y){m E=g 1b();E.t.2z(2y);6.2x(E)},2x:7(E){9(E.t.1l==0)a;6.v(g k(\'/d/2w\',E.K(),E.15.14(E)))},2t:7(1x,q){6.v(g k(\'/d/27/\'+q,f,6.2v.14(6,1x)))},2v:7(1x,8){9(8.t){2u(7(){D.Z.43(1x).2t(8.t)},10)}},42:7(1n,E,2s,2r){m 2q="?41="+!!2s+"&40="+!!2r;6.v(g k(\'/d/3Z/\'+1n+2q,E.K(),E.15.14(E)))},3Y:7(h){6.v(g k(\'/d/2p\',h,f))},2o:7(){6.v(g k(\'/d/2o\',{},6.2n))},2n:7(8){9(8.b){1p(8.b.O){M 3:i.1M();1c;M 10:o.N(8.b.F,o.Y);c.x.T(\'1d\')}}s 9(i.y.1O!=i.1N){(8.2m)?c.x.1e(\'1d\'):c.x.T(\'1d\');c.x.1e(\'S\');1b.1o(8.t)}},2l:7(){6.v(g k(\'/d/2l\',{},6.2k))},2k:7(8){9(8.b){1p(8.b.O){M 3:i.1M();1c;M 10:o.N(8.b.F,o.Y);c.x.T(\'S\')}}s 9(i.y.1O!=i.1N){(8.2j)?c.x.1e(\'S\'):c.x.T(\'S\');c.x.1e(\'1d\');1b.1o(8.t)}},1L:7(l){6.v(g k(\'/d/1L\',{l:l},6.2i))},2i:7(8){9(8.b){1p(8.b.O){M 3:i.1M();1c;M 10:o.N(8.b.F,o.Y)}}s{c.x.T(\'S\');1b.1o(8.t)}},3X:7(l){6.v(g k(\'/d/1L\',{l:l},6.2h))},2h:7(8){9(8.b){9(8.b.O==10)o.N(8.b.F,o.Y)}s{c.x.T(\'S\');1b.1o(8.t)}},3W:7(l){6.v(g k(\'/d/3V\',{l:l}))},3U:7(2f,1j){6.v(g k(\'/d/2g\',2f,1j))},3T:7(1n,1a){6.v(g k(\'/d/3S\',{1n:1n,1a:1a},6.2e))},2e:7(8){9(8.b){o.N(8.b.F,o.Y)}},3R:{I:7(L,R,1v){m 8,h={1m:w.1m};R=$H(h).3Q(R);g 18.k(L,{1i:11,R:R,1h:7(j){8=(1v)?1v(j):p},1E:7(){8=11},2d:7(){8=11}});a 8},3P:7(1K,1w){9(1K.1l==0)a p;m 2b=1K.1J(7(1I){a{2c:1I.l,t:1I.K()}}),h={Z:1w.1t,h:12.K(2b)};a 6.I(\'/d/3O\',h,7(j){m Q=j.G.C();a(Q.b)?11:p})},3N:7(){a 6.I(\'/d/3M\')},3L:7(){6.I(\'/13/3K\')},3J:7(q,1H,1G){a 6.I(\'/d/3I/\'+q,{1H:1H,1G:1G},7(j){a j.G.C().t})},3H:7(q){a 6.I(\'/d/3G/\'+q,f,7(j){a j.G.C().l})},3F:7(d){a 6.I(\'/d/3E\',{d:12.K(d)},7(j){a j.G.C()})},3D:7(d){a 6.I(\'d/3C\',{d:12.K(d)},7(j){a j.G.C()})},3B:7(){a 6.I(\'/13/3A\',3z.3y(\'3x\',p),7(j){a j.G.C().1v})},3w:7(1F){a 6.I(\'/d/3v\',{1F:1F},7(j){a 2a(j.G.C().q)})},3u:7(){a 6.I(\'/13/3t\',f,7(j){a j.G.C()})}},3s:{3r:7(h){g 18.k(\'/d/3q\',{1i:p,R:{h:12.K(h)}})},3p:7(t,1j){9(t.1l==0)a p;g 18.k(\'/3o/3n\',{1i:p,R:{h:12.K(t),3m:i.y.3l,29:i.y.29},1h:7(){o.N(\'3k\'.19(),o.24);c.1k.28=11},1E:7(){o.N(\'3j\'.19(),o.Y)},3i:7(){9(1j)1j()}})},3h:7(1u,25){D={l:0,Z:1u};g 18.k(\'/d/27/\'+1u.q,{1i:p,1h:7(j){m Q=j.G.C();26.3g(1u,25,Q)}})},3f:7(1t){g 18.k(\'/d/3e/\'+1t,{1i:p,1h:7(j){m Q=j.G.C();9(Q.b){o.N(Q.b.F,o.Y)}s{o.N(Q.F,o.24)}}})}}};w.1s();',62,301,'||||||this|function|response|if|return|error|MindMeister|maps||null|new|data|App|transport|Request|revision|var|request|Message|true|id||else|changes||queueAndProcess|ServerConnection|ui|config|timestamp|json|_postRequest|evalJSON|tree|changeList|message|responseText||_do|requestQueue|toJSON|url|case|show|code|repeated|resp|parameters|btn_redo|buttonDisable|reloadPage|utils|param|oldRequest|ERROR|root||false|Object|users|bind|handleResponse|reportMapException|toRepeat|Ajax|tr|value|ChangeList|break|btn_undo|buttonEnable|Date|_customHandler|onSuccess|asynchronous|callback|status|length|protocolVersion|idea_id|executeServerChanges|switch|repeat|pendingCode|initialize|map_id|map|success|mapInfo|destination_id|RevisionBrowser|liveUpdate|queueRequest|first|super|ex|onFailure|title|to|from|cL|collect|changeLists|revert|toMultiMode|MULTI|shareMode|chat|poll|1000|lastRequestTime|with_data|typeof|isPending|key|processQueue|_onRequestFailure|catch|try|aFunction|console|environment|INFO|mapLength|Offline|get_tree|hasUnsavedExternalChanges|api_key|parseInt|cLData|rev|onException|handleTaskNotify|what|auto_note|handleHistoryRevert|handleRevert|hasRedo|handleRedo|redo|hasUndo|handleUndo|undo|toggle_closed|options|preservePermissions|insertLink|copyExternal|setTimeout|handleCopyExternal|do|doChanges|change|push|Chat|handlePoll|round|Math|on|undefined|handleSyncUndoRedo|save_map_preferences|empty|add|highPriority|initRequest|_onRequestTimeout|_onRequestSuccess|request_id|_preRequest|el|js_network_problem|requestTimeout|js_connection_to_server_lost|times|many|too|ignorable|requestFailure|ResponseNotMatching|requestSuccess|busy|timeOpened|pageTracker|delay|req|toString|requestLog|repeatResponse|create|Class|RepeatResponseRequest|Bad|handler|clone_map|cloneMap|startGetMapWorker|getOriginalMap|onComplete|js_external_save_failed|js_external_save_successful|external_file_id|file_id|save|external|saveExternalChanges|log_client_exception|logException|other|get_details|getUserDetails|new_from_offline_map|createNewMap|confirm_password|serialize|Form|client_login|confirmPassword|get_icons|getIcons|get_maps|getMaps|get_map_revision|getMapRevision|get_map_diff|getMapDiff|set_gears|toggleUseGears|alive|isOnline|do_all|doAllChanges|merge|sync|set_task_notify|setTaskNotify|autoNote|clone_revision|cloneRevision|historyRevert|toggleClosed|paste_as_map|preserve_permissions|insert_link|pasteAsMap|getChild|doChange|messages|receive|update|toSingleMode|chat_timestamp|default|SHARED|SINGLE|undo_redo_status|syncUndoRedo|setPreference|size|unshift|onTimeOut|application|Accept|requestHeaders|externalChanges|each|isExternal|saveChanges|selfUser|user_id|isOffline|persistent|instanceof|time|numChildrenTotal|nodes|long_client_request|_trackPageview|openedAt|shift|registerPendingCode|Buffer|throw|repeat_previous_response|nResponse|nData|nTimestamp|nRevision|nUrl|Id|any|alert|preview|development|object'.split('|'),0,{}))
window._mm_file_versions = window._mm_file_versions || {}; _mm_file_versions['bin/core.js'] = '12346M';
