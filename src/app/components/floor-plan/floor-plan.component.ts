import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Map, NavigationControl, Marker, Popup } from "maplibre-gl";

@Component({
  selector: "app-floor-plan",
  templateUrl: "./floor-plan.component.html",
  styleUrls: ["./floor-plan.component.css"],
})
export class FloorPlanComponent implements OnInit, AfterViewInit {
  map: Map | undefined;
  //--------------
  mapScale: number = 100;

  svgBoundaryBox: SvgBoundaryBox = {
    topLeft: {
      x: 0,
      y: 0,
    },
    bottomright: {
      x: 220.58,
      y: -346.12,
    },
  };

  mapBoundaryBox: MapBoundaryBox = {
    topLeft: {
      x: this.svgBoundaryBox.topLeft.x / this.mapScale,
      y: this.svgBoundaryBox.topLeft.y / this.mapScale,
    },
    bottomright: {
      x: this.svgBoundaryBox.bottomright.x / this.mapScale,
      y: this.svgBoundaryBox.bottomright.y / this.mapScale,
    },
  };

  svgCenter: SvgCenter = {
    x: this.mapBoundaryBox.bottomright.x / 2,
    y: this.mapBoundaryBox.bottomright.y / 2,
  };
  //--------------
  @ViewChild("map")
  private mapContainer!: ElementRef<HTMLElement>;

  constructor() {}
  ngAfterViewInit(): void {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: {
        // id: "raster",
        version: 8,
        name: "Raster tiles",
        center: [0, 0],
        zoom: 0,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
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
      },
      center: [this.svgCenter.x, this.svgCenter.y],
      zoom: 7,
      pitch: 0,
      bearing: 0,
      antialias: true,
      maxBounds: [
        [this.mapBoundaryBox.topLeft.x, this.mapBoundaryBox.topLeft.y],
        [this.mapBoundaryBox.bottomright.x, this.mapBoundaryBox.bottomright.y],
      ],
    });
    //============================================================================================
    // this.map.addControl(new NavigationControl(), "top-right");
    //============================================================================================
    this.map?.on("style.load", () => {
      const baseLayer = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [this.mapBoundaryBox.topLeft.x, this.mapBoundaryBox.topLeft.y],
                  [this.mapBoundaryBox.topLeft.x + this.mapBoundaryBox.bottomright.x, this.mapBoundaryBox.topLeft.y],
                  [
                    this.mapBoundaryBox.topLeft.x + this.mapBoundaryBox.bottomright.x,
                    this.mapBoundaryBox.topLeft.y + this.mapBoundaryBox.bottomright.y,
                  ],
                  [this.mapBoundaryBox.topLeft.x, this.mapBoundaryBox.topLeft.y + this.mapBoundaryBox.bottomright.y],
                  [this.mapBoundaryBox.topLeft.x, this.mapBoundaryBox.topLeft.y],
                ],
              ],
            },
            properties: {
              color: "red",
              label: "Label 1",
            },
          },
        ],
      };
      const geoJSONData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [-87.76, 41.88],
                [-87.76, 41.89],
                [-87.78, 41.89],
                [-87.78, 41.88],
                [-87.76, 41.88],
              ],
            },
            properties: {
              color: "purple",
              label: "Label 1",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [-87.785, 41.88],
                [-87.785, 41.89],
                [-87.8, 41.89],
                [-87.8, 41.88],
                [-87.785, 41.88],
              ],
            },
            properties: {
              color: "yellow",
              label: "Label 2",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [-87.8, 41.88],
                [-87.8, 41.89],
                [-87.815, 41.89],
                [-87.815, 41.88],
                [-87.8, 41.88],
              ],
            },
            properties: {
              color: "green",
              label: "Label 3",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [-87.625, 41.866],
                [-87.625, 41.867],
                [-87.626, 41.867],
                [-87.626, 41.866],
                [-87.625, 41.866],
              ],
            },
            properties: {
              color: "red",
              label: "Label 4",
            },
          },
        ],
      };

      this.map?.addSource("base-Layer", {
        type: "geojson",
        data: baseLayer,
      });
      this.map?.addLayer({
        id: "svg-rectangle-layer3",
        type: "fill",
        source: "base-Layer",
        layout: {},
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.5,
        },
      });

      // Add the GeoJSON data source and a "fill" layer for the rectangle
      this.map?.addSource("svg-rectangle2", {
        type: "geojson",
        data: geoJSONData,
      });

      this.map?.addLayer({
        id: "svg-rectangle-layer2",
        type: "fill",
        source: "svg-rectangle2",
        layout: {},
        paint: {
          //'fill-color': ['get', 'color'],
          "fill-color": "white",
          "fill-opacity": 0.5,
          "fill-outline-color": "black",
        },
      });

      this.map?.addLayer({
        id: "svg-rectangle2",
        type: "symbol",
        source: "svg-rectangle2",

        layout: {
          "text-field": ["get", "label"],
          "text-size": 12,
          "text-anchor": "top",
        },
        paint: {
          "text-color": "black",
        },
      });

      // geoJSONData.features.forEach((feature, index) => {
      //   const popup = new Popup({
      //     closeButton: true,
      //   })
      //     .setLngLat(feature.geometry.coordinates[0])
      //     .setHTML(feature.properties.label);
      //   this.map?.on("click", `svg-rectangle-layer2`, (e) => {
      //     if (e.features![index]) {
      //       popup.setLngLat(e.lngLat).setHTML(e.features![index].properties.label).addTo(this.map!);
      //     }
      //   });
      // });
    });
  }

  ngOnInit(): void {}

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
  ngOnDestroy() {
    this.map?.remove();
  }
}
interface Point {
  x: number;
  y: number;
}

interface SvgBoundaryBox {
  topLeft: Point;
  bottomright: Point;
}

interface MapBoundaryBox {
  topLeft: Point;
  bottomright: Point;
}

interface SvgCenter {
  x: number;
  y: number;
}

class MapLibrePolygon {
  type!: string;
  geometry!: {
    type: string;
    coordinates: number[][];
  };
  properties!: {
    label: string;
    rotate: number;
    color: string;
  };
}
