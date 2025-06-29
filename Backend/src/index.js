/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// import { getBusData, getTripData } from "./Routes/api"
import { getBusData, getTripData } from "./Routes/ttc";

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,POST",
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Allow-Credentials": "true"
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname == "/api") {
			return new Response("Hello from the API!")
		}

		if (url.pathname == "/api/getBusData") {
			const routeId = url.searchParams.get("routeId")
			return new Response(JSON.stringify(await getBusData(routeId)), {
				headers: {
					...CORS_HEADERS,
					"Content-Type": "application/json"
				}
			})
		}

		if (url.pathname == "/api/getTripData") {
			const routeId = url.searchParams.get("routeId")
			return new Response(JSON.stringify(await getTripData(routeId)), {
				headers: {
					...CORS_HEADERS,
					"Content-Type": "application/json"
				}
			})
		}

		return new Response("Hello World!");
	},
};

async function getHtml() {
    return `
        <!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Leaflet Map with OpenStreetMap</title>
			<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
			<style>
				#map {
					height: 600px; /* Set the height of the map */
					width: 100%; /* Set the width of the map */
					filter: brightness(60%) invert(100%) contrast(394.2%) hue-rotate(0deg) saturate(0%) brightness(70%)
				}
			</style>
		</head>
		<body>

		<div id="map"></div>

		<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
		<script>
			// Initialize the map and set its view to a specific location and zoom level
			var map = L.map('map').setView([43.7695, -79.2576], 19); // Coordinates for Scarborough, Ontario

			// Add OpenStreetMap tile layer
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			// Add a marker to the map
			var marker = L.marker([43.7695, -79.2576]).addTo(map);
			marker.bindPopup('<b>Hello!</b><br>This is Scarborough.').openPopup();
		</script>
		<script src="./Routes/api.js"></script>
		</body>
		</html>
    `;
}