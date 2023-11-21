import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { MapBoundaryBox, MapLibrePolygon, SvgBoundaryBox, SvgCenter } from "src/app/core/models/map-dto";

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
import { Subscription, delay, interval } from "rxjs";
import { FLOOR_PLAN_DATA_SVG } from "src/app/core/Data/svgData";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
@Component({
  selector: "app-floor-plan",
  templateUrl: "./floor-plan.component.html",
  styleUrls: ["./floor-plan.component.css"],
})
export class FloorPlanComponent implements OnInit, OnDestroy {
  private intervalSubscription: Subscription;
  readonly style: StyleSpecification = {
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
  readonly mapScale: number = 100;

  readonly svgBoundaryBox: SvgBoundaryBox = {
    topLeft: {
      x: 0,
      y: 0,
    },
    bottomRight: {
      x: 220.58,
      y: -346.12,
    },
  };

  readonly mapBoundaryBox: MapBoundaryBox = {
    topLeft: {
      x: this.svgBoundaryBox.topLeft.x / this.mapScale,
      y: this.svgBoundaryBox.topLeft.y / this.mapScale,
    },
    bottomRight: {
      x: this.svgBoundaryBox.bottomRight.x / this.mapScale,
      y: this.svgBoundaryBox.bottomRight.y / this.mapScale,
    },
  };

  readonly svgCenter: SvgCenter = {
    x: this.mapBoundaryBox.bottomRight.x / 2,
    y: this.mapBoundaryBox.bottomRight.y / 2,
  };
  constructor(private sanitizer: DomSanitizer) {}
  load = false;
  readonly layerPaint = {
    "circle-radius": 10,
    "circle-color": "#3887be",
  };
  @ViewChild("dataContainer") dataContainer!: ElementRef<HTMLDivElement>;
  features: MapLibrePolygon[];
  ngOnInit(): void {}
  ngAfterViewInit() {
    this.dataContainer.nativeElement.innerHTML = FLOOR_PLAN_DATA_SVG;
    this.InitializeFloorPlan();
  }
  InitializeFloorPlan() {
    if (this.dataContainer) {
      this.mapData();
      this.load = true;
    } else {
      this.load = true;
      console.error("dataContainer is undefined.");
    }
  }
  mapData() {
    const allElements = this.dataContainer.nativeElement;
    const rectElements = allElements.querySelectorAll("rect");
    const rectArray = Array.from(rectElements, (element) => element as SVGRectElement);

    // console.log(rectArray);
    this.features = this.rectsToMapLibrePolygons(rectArray, this.mapScale);
    console.log(this.features);
  }
  //--------------------------------------------------------------------------------
  rectsToMapLibrePolygons(rectElements: SVGRectElement[], scale: number = 1): MapLibrePolygon[] {
    return rectElements.map((rectElement) => {
      const x = parseFloat(rectElement.getAttribute("x")!) / scale;
      const y = parseFloat(rectElement.getAttribute("y")!) / scale;
      const width = parseFloat(rectElement.getAttribute("width")!) / scale;
      const height = parseFloat(rectElement.getAttribute("height")!) / scale;

      const transformAttribute = rectElement.getAttribute("transform");
      const [translateX, translateY] = this.extractTranslateValues(transformAttribute) || [0, 0];
      const rotate = this.extractRotateValue(transformAttribute) || 0;

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

  extractTranslateValues(transform?: string): [number, number] {
    if (!transform) return undefined;
    const regex = /translate\(([-.\d]+) ([-.\d]+)\)/;
    const match = transform.match(regex);
    return match ? [parseFloat(match[1]), parseFloat(match[2])] : [0, 0];
  }

  extractRotateValue(transform?: string): number {
    if (!transform) return undefined;
    const regex = /rotate\(([-.\d]+)\)/;
    const match = transform.match(regex);
    return match ? parseFloat(match[1]) : 0;
  }

  ngOnDestroy() {
    this.intervalSubscription.unsubscribe();
  }
}
