backgroundTest = TestCase("backgroundTest");

backgroundTest.prototype.checkConn = function () {
    var result = checkConn.doesConnectionExist();
    assertEquals(result, true);
};
backgroundTest.prototype.checkConn = function () {
    var result = checkConn.doesConnectionExist();
    assertEquals(result, false);
};