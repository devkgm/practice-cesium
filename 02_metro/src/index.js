import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import metroData from "./metroLineData.json";

window.CESIUM_BASE_URL = "/static/Cesium/";

Cesium.Ion.defaultAccessToken = process.env.ACCESS_TOKEN;
const VWORLD_KEY = process.env.VWORLD_KEY;

console.log(metroData);

const layers = [
  { layer: "Base", tileType: "png" },
  { layer: "gray", tileType: "png" },
  { layer: "midnight", tileType: "png" },
  { layer: "Hybrid", tileType: "png" },
  { layer: "Satellite", tileType: "jpeg" },
];

const selectedLayer = layers[4];

const viewer = new Cesium.Viewer("cesiumContainer", {
  // terrain: Cesium.Terrain.fromWorldTerrain(),
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.WebMapTileServiceImageryProvider({
      url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/${selectedLayer.layer}/{TileMatrix}/{TileRow}/{TileCol}.${selectedLayer.tileType}`,
      layer: selectedLayer.layer,
      style: "default",
      maximumLevel: 19,
      credit: new Cesium.Credit("VWorld Korea"),
      tileMatrixSetID: "GoogleMapsCompatible",
    })
  ),
});

// 서울역 좌표
const originPoint = { longitude: 126.971134, latitude: 37.554337 };

const metroEntitySet = new Set();
metroData.DATA.forEach((line) => {
  line.node.forEach((node) => {
    const positions = [];
    node.station.forEach((station) => {
      const position = Cesium.Cartesian3.fromDegrees(station.lng, station.lat);
      positions.push(position);
      if (metroEntitySet.has(station.station_cd)) return;
      metroEntitySet.add(station.station_cd);
      viewer.entities.add({
        description: `${line.line_name}-${station.name}역 point at (${station.lng}, ${station.lat})`,
        position: position,
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString(line.color),
        },
      });
    });
    viewer.entities.add({
      polyline: {
        positions: positions,
        width: 5,
        material: Cesium.Color.fromCssColorString(line.color),
      },
    });
  });
});

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(
    originPoint.longitude,
    originPoint.latitude,
    2000
  ),
});
