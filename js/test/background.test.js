backgroundTest = TestCase("backgroundTest");

backgroundTest.prototype.testDoesConnectionExist = function () {
    DataAccess.setData("testDataString", "testDataSample");
    var result = DataAccess.getData("testDataString");
    assertEquals(result, "testDataSample");
};

backgroundTest.prototype.testIsLoggedIn = function () {
    DataAccess.setData("testDataInteger", 4795635);
    var result = DataAccess.getData("testDataInteger");
    assertEquals(result, 4795635);
};

backgroundTest.prototype.testAutomaticLogin = function () {
    DataAccess.setData("testDataBoolean", true);
    var result = DataAccess.getData("testDataBoolean");
    assertEquals(result, "true");
};

backgroundTest.prototype.testProcessEvents = function () {
    DataAccess.setData("testDataBoolean", false);
    var result = DataAccess.getData("testDataBoolean");
    assertEquals(result, "false");
};