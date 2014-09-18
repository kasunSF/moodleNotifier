BackgroundTest = TestCase("BackgroundTest");

BackgroundTest.prototype.checkConn = function () {
    var result = Background.doesConnectionExist();
    assertEquals(result, true);
};
BackgroundTest.prototype.checkLogin = function () {
    var result = Background.isLoggedIn();
    assertEquals(result, true);
};