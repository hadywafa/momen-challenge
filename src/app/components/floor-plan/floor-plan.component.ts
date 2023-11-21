import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MapLibrePolygon } from "src/app/core/models/map-dto";

import {
  Map,
  MapLayerMouseEvent,
  AddLayerObject,
  LngLat,
  Source,
  MapMouseEvent,
  StyleSpecification,
} from "maplibre-gl";
import {
  MapComponent,
  MarkerComponent,
  SetupMarker,
  LayerComponent,
  GeoJSONSourceComponent,
  MapService,
} from "@maplibre/ngx-maplibre-gl";
@Component({
  selector: "app-floor-plan",
  templateUrl: "./floor-plan.component.html",
  styleUrls: ["./floor-plan.component.css"],
})
export class FloorPlanComponent implements OnInit {
  style: StyleSpecification = {
    version: 8,
    name: "Raster tiles",
    center: [0, 0],
    zoom: 0,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{x}/{y}.png"],
        tileSize: 300,
        minzoom: 0,
        maxzoom: 15,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "lightgray",
        },
      },
    ],
  };
  layerPaint = {
    "circle-radius": 10,
    "circle-color": "#3887be",
  };
  constructor(private mapService: MapService) {}
  ngOnInit(): void {}
  map: Map;
  load = false;
  // onMapLoad(mapInstance: any) {
  //   this.map = mapInstance as Map;

  //   this.map.addSource("my-data", {
  //     type: "geojson",
  //     data: {
  //       type: "Feature",
  //       geometry: {
  //         type: "Point",
  //         coordinates: [10, 10],
  //       },
  //       properties: {
  //         title: "Mapbox DC",
  //         "marker-symbol": "monument",
  //       },
  //     },
  //   });
  //   this.map.addLayer({
  //     id: "my-layer",
  //     type: "circle",
  //     source: "my-data",
  //     paint: {
  //       "circle-radius": 10,
  //       "circle-color": "#3887be",
  //     },
  //   });
  //   //----------------------------------
  //   const marker1 = new MarkerComponent(this.mapService);
  //   marker1.lngLat = [0, 0];
  //   marker1.feature.properties = {
  //     color: "red",
  //   };

  //   // const ly: AddLayerObject = {
  //   //   id: "",
  //   //   type: "circle",

  //   //   source:
  //   // };

  //   this.map.addLayer({
  //     id: "states",
  //     // References the GeoJSON source defined above
  //     // and does not require a `source-layer`
  //     source: "state-data",
  //     type: "symbol",
  //   });

  //   const marker2 = new MarkerComponent(this.mapService);
  //   marker2.lngLat = [10, 0];
  //   marker1.feature.properties = {
  //     color: "blue",
  //   };
  //   this.load = true;
  // }
  //--------------------------------------------------------------------------------
  rectsToMapLibrePolygons(rectElements: SVGRectElement[], scale: number = 1): MapLibrePolygon[] {
    return rectElements.map((rectElement) => {
      const x = parseFloat(rectElement.getAttribute("x")!) / scale;
      const y = parseFloat(rectElement.getAttribute("y")!) / scale;
      const width = parseFloat(rectElement.getAttribute("width")!) / scale;
      const height = parseFloat(rectElement.getAttribute("height")!) / scale;

      const transformAttribute = rectElement.getAttribute("transform");
      const [translateX, translateY] = this.extractTranslateValues(transformAttribute!);
      const rotate = this.extractRotateValue(transformAttribute!);

      const adjustedX = x + translateX / scale;
      const adjustedY = y + translateY / scale;

      const coordinates = this.calculateRotatedRectangleCoordinates(adjustedX, adjustedY, width, height, rotate);
      const asd: MapLibrePolygon = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: coordinates,
        },
        properties: {
          rotate: rotate,
          color: "red",
          label: "shit",
        },
      };
      return asd;
    });
  }

  calculateRotatedRectangleCoordinates(
    x: number,
    y: number,
    width: number,
    height: number,
    rotate: number
  ): number[][] {
    const radians = (rotate * Math.PI) / 180;

    const x1 = x;
    const y1 = y;
    const x2 = x + width * Math.cos(radians);
    const y2 = y + width * Math.sin(radians);
    const x3 = x + width * Math.cos(radians) - height * Math.sin(radians);
    const y3 = y + width * Math.sin(radians) + height * Math.cos(radians);
    const x4 = x - height * Math.sin(radians);
    const y4 = y + height * Math.cos(radians);

    return [
      [x1, y1],
      [x2, y2],
      [x3, y3],
      [x4, y4],
      [x1, y1],
    ];
  }

  extractTranslateValues(transform: string): [number, number] {
    const regex = /translate\(([-.\d]+) ([-.\d]+)\)/;
    const match = transform.match(regex);
    return match ? [parseFloat(match[1]), parseFloat(match[2])] : [0, 0];
  }

  extractRotateValue(transform: string): number {
    const regex = /rotate\(([-.\d]+)\)/;
    const match = transform.match(regex);
    return match ? parseFloat(match[1]) : 0;
  }

  ngOnDestroy() {}
}
