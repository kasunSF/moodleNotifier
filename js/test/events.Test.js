eventsTest = TestCase("eventsTest");

eventsTest.prototype.testPreparePage = function () {
    Events.unhideEvents();
    var result = DataAccess.getData("hidden_events");
    assertEquals(result, "");
};

eventsTest.prototype.testLoadEvents = function () {
    Events.unhideEvents();
    var result = DataAccess.getData("hidden_events");
    assertEquals(result, "");
};

eventsTest.prototype.testUnhide = function () {
    Events.unhideEvents();
    var result = DataAccess.getData("hidden_events");
    assertEquals(result, "");
};

eventsTest.prototype.testHide = function () {
    Events.unhideEvents();
    var result = DataAccess.getData("hidden_events");
    assertEquals(result, "");
};