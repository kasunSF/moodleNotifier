GreeterTest = TestCase("GreeterTest");

GreeterTest.prototype.testGreet = function () {
    var greeter = new myapp.Greeter();
    assertEquals("Hello World!", greeter.greet("World"));
};

backgroundTest = TestCase("backgroundTest");

backgroundTest.prototype.testHello = function () {
    var result = sample.hello("Kasun");
    assertEquals(result, "Hello Kasun");
};
backgroundTest.prototype.testBye = function () {
    var result = sample.goodBye("Kasun");
    assertEquals(result, "Good bye Kasuan");
};