
function ObjectLayer(properties, config) {
    var layers = [new Layer(properties, config)];
    var $ = {
        push: (obj, config) => layers.push(new Layer(obj, config)),
        pop: () => layers.length > 1 && layers.pop(),
        getProperty: (key) => layers[$.indexOf(key) || 0].properties[key],
        getLayerProperties: (key) => { var l = getLayer(key); return l ? l.properties : false },
        getLayerDescription: (key) => { var l = getLayer(key); return l ? ReadOnly(l.meta) : false },
        length: () => layers.length,
        reduce: function () {
            var obj = new Object();
            for (var i = 0; i < layers.length; i++) {
                for (var k in layers[i].properties) {
                    obj[k] = layers[i].properties[k];
                }
                for (var k in layers[i].delete) {
                    delete obj[k];
                }
            }
            return obj;
        },
        delete: function (key, passthrough) {
            var del = delete layers[layers.length - 1].properties[key];
            if (passthrough)
                delete layers[layers.length - 1].delete[key]
            else
                layers[layers.length - 1].delete[key] = true
            return del;
        },
        indexOf: function (key, ignoredelete) {
            for (var i = layers.length - 1; i >= 0; i--)
                if (key in layers[i].properties || (!ignoredelete && key in layers[i].delete))
                    return i;
            return false;
        },
        slice: function (begin, end) {
            var slice = layers.slice(begin, end)
            if (!slice.length)
                return;

            var r = new ObjectLayer(slice[0].properties, config)
            Object.keys(slice[0].delete).forEach((k) => { r[ObjectLayer].delete(k, true) });
            for (var i = 1; i < slice.length; i++) {
                r[ObjectLayer].push(slice[i].properties, slice[i].meta)
                Object.keys(slice[i].delete).forEach((k) => { r[ObjectLayer].delete(k, true) });
            }
            return r;
        }
    }
    function getLayer(i) {
        if (typeof i == 'number' && i < layers.length)
            return layers[i];
        if (typeof i == 'string')
            for (var i = layers.length; i >= 0; i--)
                if (layers[i].meta.id == i)
                    return layers[i];
    }
    var p = new Proxy(layers[0].properties, {
        getPrototypeOf: (target) => Object.getPrototypeOf(layers[layers.length - 1]),
        setPrototypeOf: (target, prototype) => Object.setPrototypeOf(layers[layers.length - 1], prototype),
        isExtensible: (target) => Object.isExtensible(layers[layers.length - 1]),
        preventExtensions: (target) => Object.preventExtensions(layers[layers.length - 1]),
        getOwnPropertyDescriptor: (target, key) => Object.getOwnPropertyDescriptor(layers[$.indexOf(key) || 0].properties, key),
        defineProperty: (target, key, descriptor) => Object.defineProperty(layers[layers.length - 1].properties[key], descriptor),
        has: (target, key) => !!$.indexOf(key),
        get: (target, key) => key == ObjectLayer ? ReadOnly($, true) : $.getProperty(key),
        set: (target, key, value) => layers[layers.length - 1].properties[key] = value,
        deleteProperty: (target, key) => $.delete(key),
        ownKeys: (target) => Reflect.ownKeys($.reduce()),
        apply: (target, context, args) => { layers[layers.length - 1].apply(context, ...args) },
        construct: (target, args, newTarget) => new layers[layers.length - 1](...args),

    })
    return p;

}

function Layer(properties, config) {
    this.properties = properties || {};
    config = config || {};
    this.delete = {};
    this.meta = { id: null, description: null };
    if (config.id && typeof config.id == 'string')
        this.meta.id = config.id;
    if (config.description && typeof config.description == 'string')
        this.meta.description = config.description;
    return this;
}

function ReadOnly(object, recursive) {
    return new Proxy(object, {
        get: (target, key) => recursive && key in target ? ReadOnly(target[key], recursive) : target[key],
        set: (target, key, value) => false,
        setPrototypeOf: (target, prototype) => false,
        preventExtensions: (target) => false,
        deleteProperty: (target, key) => false,
        defineProperty: (target, key, descriptor) => false
    })
}
module.exports = ObjectLayer;