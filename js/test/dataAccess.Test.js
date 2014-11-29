dataAccessTest = TestCase("dataAccessTest");

dataAccessTest.prototype.testStorageString = function () {
    DataAccess.setData("testDataString", "testDataSample");
    var result = DataAccess.getData("testDataString");
    assertEquals(result, "testDataSample");
};

dataAccessTest.prototype.testStorageInteger = function () {
    DataAccess.setData("testDataInteger", 4795635);
    var result = DataAccess.getData("testDataInteger");
    assertEquals(result, 4795635);
};

dataAccessTest.prototype.testStorageBoolean = function () {
    DataAccess.setData("testDataBoolean", true);
    var result = DataAccess.getData("testDataBoolean");
    assertEquals(result, "true");
};

dataAccessTest.prototype.testStorageBoolean = function () {
    DataAccess.setData("testDataBoolean", false);
    var result = DataAccess.getData("testDataBoolean");
    assertEquals(result, "false");
};