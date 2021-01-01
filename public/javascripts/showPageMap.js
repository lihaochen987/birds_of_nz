mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10", // stylesheet location
  center: bird.geometry.coordinates, // starting position [lng, lat]
  zoom: 10, // starting zoom
});

new mapboxgl.Marker()
  .setLngLat(bird.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<div class="card" style="width: 9rem;">
      <img class="card-img-top " src="${bird.images[0].url}" alt="image of ${bird.species}">
      <div class="card-body text-center">
      <strong><a href="/birds/${bird._id}">${bird.species}</a><strong>
      </div>
    </div>`
    )
  )
  .addTo(map);
