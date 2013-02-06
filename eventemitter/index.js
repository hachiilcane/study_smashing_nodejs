var EventEmitter = process.EventEmitter, MyClass = function() {};

MyClass.prototype.__proto__ = EventEmitter.prototype;

var a = new MyClass;
a.on('event', function() {
    console.log('event called!');
});
a.emit('event');
