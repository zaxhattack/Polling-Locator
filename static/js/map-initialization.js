var platform = new H.service.Platform({
    "apikey": "I0KCsQtInGfK_nPgBYkIrBs3zrSrMWqr4jDyHCYfqhI"
});
const defaultLayers = platform.createDefaultLayers();

var map = new H.Map(
    document.getElementById("mapContainer"),
    defaultLayers.vector.normal.map,
    {
        zoom: 10,
        center: { lat: 30.619132, lng: -96.335924 },
        pixelRatio: window.devicePixelRatio || 1
    });
    
window.addEventListener("resize", () => map.getViewPort().resize());

const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
var ui = H.ui.UI.createDefault(map, defaultLayers);


const homeMarkup = '<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><g><path d="m45.873997,17.574097l-4.26778,-3.600641l0,-8.823939c0,-1.366699 -1.32449,-2.484909 -2.94331,-2.484909l-2.943291,0c-1.61882,0 -2.94331,1.118211 -2.94331,2.484909l0,1.374161l-5.88661,-4.964861c-0.803511,-0.641107 -1.539351,-1.379127 -2.943279,-1.379127s-2.139791,0.73802 -2.943321,1.379127l-18.984299,16.01528c-0.9183,0.807589 -1.61881,1.39653 -1.61881,2.484917c0,1.39901 1.2715,2.484919 2.9433,2.484919l2.9433,0l0,14.909479c0,1.366699 1.32449,2.484921 2.9433,2.484921l8.829909,0l0,-12.424574c0,-1.366714 1.324492,-2.484917 2.9433,-2.484917l5.8866,0c1.61883,0 2.9433,1.118202 2.9433,2.484917l0,12.424574l8.82991,0c1.61882,0 2.94331,-1.118221 2.94331,-2.484921l0,-14.909479l2.943291,0c1.671818,0 2.94331,-1.085909 2.94331,-2.484919c0,-1.088387 -0.7005,-1.677319 -1.61882,-2.484917z" id="svg_1" fill="#ff0000"/><path transform="rotate(-45 23.8984 39.9193)" id="svg_6" d="m18.307423,45.510277l0,-11.181881l11.181887,11.181881l-11.181887,0z" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="null" fill="#ff0000"/></g></svg>';
var homeIcon = new H.map.Icon(homeMarkup);
var homePoint;

var votingLocGroup = new H.map.Group();

// Event that opens InfoBubbles
votingLocGroup.addEventListener("tap", (evt) => {

    let bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {content: evt.target.getData()});
    ui.addBubble(bubble);

    bubble.open();
});

map.addObject(votingLocGroup);