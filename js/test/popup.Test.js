popupTest = TestCase("popupTest");

popupTest.prototype.testRefresh = function () {
    Popup.refresh();
    var result = DataAccess.getData("configured");
    assertEquals(result, "true");
};

popupTest.prototype.testVisitMoodle = function () {
    Popup.refresh();
    var result = DataAccess.getData("configured");
    assertEquals(result, "true");
};

popupTest.prototype.testAllEvents = function () {
    Popup.refresh();
    var result = DataAccess.getData("configured");
    assertEquals(result, "true");
};