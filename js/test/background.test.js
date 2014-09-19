dataAccessTest = TestCase("dataAccessTest");

dataAccessTest.prototype.testConnection = function () {
    var result = Background.doesConnectionExist();
    assertEquals(result, true);
};
dataAccessTest.prototype.testLogin = function () {
    var result = Background.isLoggedIn();
    assertEquals(result, true);
};