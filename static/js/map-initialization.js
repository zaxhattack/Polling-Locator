var platform = new H.service.Platform({
    "apikey": "I0KCsQtInGfK_nPgBYkIrBs3zrSrMWqr4jDyHCYfqhI"
});
var defaultLayers = platform.createDefaultLayers();

var map = new H.Map(
    document.getElementById("mapContainer"),
    defaultLayers.vector.normal.map,
    {
        zoom: 10,
        center: { lat: 30.619132, lng: -96.335924 },
        pixelRatio: window.devicePixelRatio || 1
    });
    
window.addEventListener("resize", () => map.getViewPort().resize());

var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
var ui = H.ui.UI.createDefault(map, defaultLayers);
var votingLocGroup = new H.map.Group();
votingLocGroup.addEventListener("tap", (evt) => {
    map.setCenter(evt.target.getGeometry());

    let bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {content: evt.target.getData()});
    ui.addBubble(bubble);

    bubble.open();
});

map.addObject(votingLocGroup);