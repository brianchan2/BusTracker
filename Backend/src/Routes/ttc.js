import GtfsRealtimeBindings from "gtfs-realtime-bindings";

const GTFS_VEHICLES_REALTIME_URL = "https://bustime.ttc.ca/gtfsrt/vehicles"
const GTFS_TRIP_REALTIME_URL = "https://bustime.ttc.ca/gtfsrt/trips"

export async function getBusData(routeId) {
    const response = await fetch(GTFS_VEHICLES_REALTIME_URL, {
        headers: {
            'Accept': 'application/x-protobuf'
        }
    })

    if (!response.ok) {
        console.warn(`Failed to fetch GTFS data: ${response.status} ${response.statusText}`)
        return
    }

    const buffer = await response.arrayBuffer()
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))

    // Filter
    let routes = []

    feed.entity.forEach(entity => {
        if (entity && entity.vehicle.trip && entity.vehicle.trip.routeId == routeId) {
            routes.push(entity)
        }
    })

    return routes
}

export async function getTripData(routeId) {
    const response = await fetch(GTFS_TRIP_REALTIME_URL, {
        headers: {
            'Accept': 'application/x-protobuf'
        }
    })

    if (!response.ok) {
        console.warn(`Failed to fetch GTFS data: ${response.status} ${response.statusText}`)
        return
    }

    const buffer = await response.arrayBuffer()
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))

    // Filter
    let trips = []

    feed.entity.forEach(entity => {
        if (entity && entity.tripUpdate && entity.tripUpdate.trip && entity.tripUpdate.trip.routeId == routeId)
        trips.push(entity)
    })

    return trips
}