// The URL on your server where CesiumJS's static files are hosted.
window.CESIUM_BASE_URL = "/static/Cesium/";

import {
  Cartesian3,
  createOsmBuildingsAsync,
  Ion,
  Math as CesiumMath,
  Terrain,
  Viewer,
  Color,
  JulianDate,
  SampledPositionProperty,
  PathGraphics,
  TimeIntervalCollection,
  TimeInterval,
  VelocityOrientationProperty,
  IonResource,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import flightData from "./flightData";
Ion.defaultAccessToken = process.env.ACCESS_TOKEN;

const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
});

//시작포인트 추가
const dataPoint = { longitude: -122.38985, latitude: 37.61864, height: -27.32 };
const pointEntity = viewer.entities.add({
  description: `First data point at (${dataPoint.longitude}, ${dataPoint.latitude})`,
  position: Cartesian3.fromDegrees(
    dataPoint.longitude,
    dataPoint.latitude,
    dataPoint.height
  ),
  point: { pixelSize: 10, color: Color.RED },
});

//시작 포인트로 이동
viewer.flyTo(pointEntity);

const buildingTileset = await createOsmBuildingsAsync();
viewer.scene.primitives.add(buildingTileset);

const timeStepInSeconds = 30; //구간 별 소요 시간
const totalSeconds = timeStepInSeconds * (flightData.length - 1);
const start = JulianDate.fromIso8601("2025-07-28T23:10:00Z");
const stop = JulianDate.addSeconds(start, totalSeconds, new JulianDate());
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.timeline.zoomTo(start, stop);
viewer.clock.multiplier = 50; //배속
viewer.clock.shouldAnimate = true; //애니메이션 자동 실행

const positionProperty = new SampledPositionProperty();

//비행 데이터 포인트 엔티티 추가
for (let i = 0; i < flightData.length; i++) {
  const dataPoint = flightData[i];
  const time = JulianDate.addSeconds(
    start,
    i * timeStepInSeconds,
    new JulianDate()
  );
  const position = Cartesian3.fromDegrees(
    dataPoint.longitude,
    dataPoint.latitude,
    dataPoint.height
  );

  positionProperty.addSample(time, position);

  viewer.entities.add({
    description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
    position: position,
    point: { pixelSize: 10, color: Color.RED },
  });
}

async function loadModel() {
  const airplaneUri = await IonResource.fromAssetId(3581291);
  const airplaneEntity = viewer.entities.add({
    availability: new TimeIntervalCollection([
      new TimeInterval({ start: start, stop: stop }),
    ]),
    position: positionProperty,
    model: { uri: airplaneUri },
    orientation: new VelocityOrientationProperty(positionProperty),
    path: new PathGraphics({ width: 3 }),
  });

  //비행기 엔티티에 카메라 트랙킹 설정
  viewer.trackedEntity = airplaneEntity;
}

loadModel();
