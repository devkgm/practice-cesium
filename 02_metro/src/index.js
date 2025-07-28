import * as Cesium from "cesium";
window.CESIUM_BASE_URL = "/static/Cesium/";

import "cesium/Build/Cesium/Widgets/widgets.css";
Cesium.Ion.defaultAccessToken = process.env.ACCESS_TOKEN;
const VWORLD_KEY = process.env.VWORLD_KEY;
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
const pointEntity = viewer.entities.add({
  description: `First data point at (${originPoint.longitude}, ${originPoint.latitude})`,
  position: Cesium.Cartesian3.fromDegrees(
    originPoint.longitude,
    originPoint.latitude,
    0
  ),
  point: { pixelSize: 10, color: Cesium.Color.RED },
});

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(
    originPoint.longitude,
    originPoint.latitude,
    1000
  ),
});
