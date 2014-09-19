eventsTest = TestCase("eventsTest");

eventsTest.prototype.testUnhide = function () {
    Events.unhideEvents();
    var result = DataAccess.getData("hidden_events");
    assertEquals(result, "");
};