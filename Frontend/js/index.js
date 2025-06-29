// import L from "leaflet" // For intellisense

const BUS_DATA = "http://127.0.0.1:8787/api/getBusData"
const TRIP_DATA = "http://127.0.0.1:8787/api/getTripData"
const TTC_StopData = "http://127.0.0.1:5500/Frontend/BusData/TTC/stops.txt"
const TTC_STOP_TIMES = "http://127.0.0.1:5500/Frontend/BusData/TTC/stop_times.txt"
const TTC_ROUTES = "http://127.0.0.1:5500/Frontend/BusData/TTC/routes.txt"
const TTC_TRIPS = "http://127.0.0.1:5500/Frontend/BusData/TTC/trips.txt"
let map

document.addEventListener("DOMContentLoaded", () => {
    map = L.map('map').setView([43.7695, -79.2576], 19);

    // Adds tile layers so the map has tiles and can be seen!
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Completed Map Setup!

    drawPoints()
})

async function getGTFSData() {
    const response = await fetch(BUS_DATA, {
        headers: {
            'Accept': 'application/json'
        }
    })

    if (response.ok) {
        return response.json()
    }
}

async function getTripData() {
    const response = await fetch(TRIP_DATA, {
        headers: {
            'Accept': 'application/json'
        }
    })

    if (response.ok) {
        return response.json()
    }
}

async function parseStopData(routeId) {

    /* 
        TODO: Need a rewrite to filter for routes and ensure that they get all routes so to filter for the names as well
    */

    let routeData = await fetch(TTC_ROUTES)
    let stopTimesData = await fetch(TTC_STOP_TIMES)
    let tripData = await fetch(TTC_TRIPS)
    let TTCStopData = await fetch(TTC_StopData)
    
    let routeText = (await routeData.text()).split("\n").filter(Boolean)
    let tripText = (await tripData.text()).split("\n").filter(Boolean)
    let stopTimesText = (await stopTimesData.text()).split("\n").filter(Boolean)
    let stopText = (await TTCStopData.text()).split("\n").filter(Boolean)

    let routes = routeText.filter(route => {
        let routeParts = route.split(",");
        return routeParts[0].startsWith(routeId)
    });

    
    if (routes.length === 0) {
        console.log("No routes found.");
        return;
    }
    
    let routeId = routes[0].split(",")[0];
    
    let routesOpp = routeText.filter(route => {
        let routeParts = route.split(",")
        return routeParts[0].startsWith(routeId)
    })

    console.log(`Route ID: ${routeId}`);

    let trips = tripText.filter(stopTime => {
        let tripParts = stopTime.split(",")
        return tripParts[1].startsWith(routeId)
    })
    
    let stopTimes = stopTimesText.filter(stopTime => {
        let stopTimeParts = stopTime.split(",")
        return stopTimeParts[5]?.replace(/^"|"$/g, '').startsWith(routeId)
    })


    console.log(stopTimes)
    let orderedStopIds = stopTimes.map(stopTime => {
        let stopTimeParts = stopTime.split(",");
        return stopTimeParts[3];
    })

    let stopsMap = {}

    stopText.forEach(stop => {
        let stopParts = stop.split(",");
        if (stopParts.length >= 2) {
            stopsMap[stopParts[0]] = {
                stopNumber: stopParts[1],
                name: stopParts[2],
            }
        }
    })

    let orderedStops = orderedStopIds.map(stopId => stopsMap[stopId]).filter(stop => stop !== undefined);

    orderedStops.forEach(stop => {
        console.log(stop);
    });
}

parseStopData("")


async function drawPoints() {
    let busData = await getGTFSData()
    let tripDetails = await getTripData()
    let bounds = L.latLngBounds()

    let TTCStopData = await fetch(TTC_StopData)
    let stopData = (await TTCStopData.text()).split("\n")

    let data = []
    stopData.forEach(stop => {
        data.push(stop.split(","))
    })

    console.log(data)
    
    busData.forEach(bus => {
        let lat = bus.vehicle.position.latitude
        let lon = bus.vehicle.position.longitude
        let marker = L.marker([lat, lon]).addTo(map);
        console.log(bus.vehicle.trip.tripId)
        let details = tripDetails.filter(tripDetail => tripDetail.tripUpdate.trip.tripId == bus.vehicle.trip.tripId)[0]
        if (details) {
            let currentStop = data.filter(stop => stop[0] == details.tripUpdate.stopTimeUpdate[0].stopId)[0][2]
            let lastStop = data.filter(stop => stop[0] == details.tripUpdate.stopTimeUpdate[details.tripUpdate.stopTimeUpdate.length - 1].stopId)[0][2]
            console.log(currentStop)
            marker.bindPopup(`Current route: ${bus.vehicle.trip.routeId}\n Next stop: ${currentStop} \n Direction: ${lastStop}`);
            bounds.extend(L.latLng(lat, lon));
        }
        else {
            marker.bindPopup(`Current route: ${bus.vehicle.trip.routeId} \n Next stop: N/A \n Status: Not In Service`);
        }
    })

    map.fitBounds(bounds);
}