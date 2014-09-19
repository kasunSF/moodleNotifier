popupTest = TestCase("popupTest");

popupTest.prototype.testRefresh = function () {
    Popup.refresh();
    var result = DataAccess.getData("configured");
    assertEquals(result, "true");
};