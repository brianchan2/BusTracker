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
    let all920Routes = []

    feed.entity.forEach(entity => {
        all920Routes.push(entity)
        if (entity.vehicle.trip.routeId == routeId) {
            all920Routes.push(entity)
        }
    })

    return all920Routes
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

    console.log(Date.now())

    feed.entity.forEach(entity => {
        console.log(entity.tripUpdate.stopTimeUpdate[0].arrival.time, Math.floor(Date.now() / 1000))
        if (entity.tripUpdate.trip.routeId == routeId) {
            trips.push(entity)
        }
    })

    return trips
}