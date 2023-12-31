import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { MapBoundaryBox, MapLibrePoint, MapLibrePolygon, SvgBoundaryBox, SvgCenter } from "src/app/core/models/map-dto";
import {
  Map,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  LngLat,
  LayerSpecification,
  StyleSpecification,
} from "maplibre-gl";
import {} from "@maplibre/ngx-maplibre-gl";
import { GeoJsonProperties } from "geojson";
import { Subscription, delay, interval } from "rxjs";
import { FLOOR_PLAN_DATA_SVG } from "src/app/core/Data/svgData";
@Component({
  selector: "app-floor-plan",
  templateUrl: "./floor-plan.component.html",
  styleUrls: ["./floor-plan.component.css"],
})
export class FloorPlanComponent implements OnInit, OnDestroy {
  private intervalSubscription: Subscription;
  map: Map;
  style: StyleSpecification = {
    version: 8,
    name: "Raster tiles",
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{x}/{y}.png"],
        tileSize: 300,
        // minzoom: 0,
        // maxzoom: 15,
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
  txtLayout: LayerSpecification["layout"] = {
    "text-field": ["get", "label"], // property in your GeoJSON with booth numbers
    "text-size": 12,
    "text-anchor": "top",
    "text-offset": [0, 2],
  };
  readonly mapScale: number = 100;
  mapBoundaryBox!: MapBoundaryBox;
  svgCenter!: SvgCenter;
  constructor(private changeDetectorRef: ChangeDetectorRef) {}
  load = false;
  readonly layerPaint = {
    "circle-radius": 10,
    "circle-color": "#3887be",
  };
  @ViewChild("dataContainer") dataContainer!: ElementRef<HTMLDivElement>;
  boothsOutlines: MapLibrePolygon[];
  boothTextNumbers: MapLibrePoint[];
  points: GeoJSON.FeatureCollection<GeoJSON.Point>;

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataContainer.nativeElement.innerHTML = FLOOR_PLAN_DATA_SVG;
    this.InitializeFloorPlan();
    this.changeDetectorRef.detectChanges();
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
    const svgWrapper = this.dataContainer.nativeElement;
    const svgBounds = this.getSvgBounds(svgWrapper);
    const svgBoundaryBox = {
      topLeft: {
        x: svgBounds.at(0),
        y: svgBounds.at(1),
      },
      bottomRight: {
        x: svgBounds.at(2),
        y: svgBounds.at(3),
      },
    };
    this.mapBoundaryBox = {
      topLeft: {
        x: svgBoundaryBox.topLeft.x / this.mapScale,
        y: svgBoundaryBox.topLeft.y / this.mapScale,
      },
      bottomRight: {
        x: svgBoundaryBox.bottomRight.x / this.mapScale,
        y: svgBoundaryBox.bottomRight.y / this.mapScale,
      },
    };
    this.svgCenter = {
      x: this.mapBoundaryBox.bottomRight.x / 2,
      y: this.mapBoundaryBox.bottomRight.y / 2,
    };
    this.style.center = [this.svgCenter.x, this.svgCenter.y];

    this.boothsOutlines = this.createBoothOutlines(svgWrapper, this.mapScale);
    this.boothTextNumbers = this.createBoothNumbers(svgWrapper, this.mapScale);
    console.log(this.boothTextNumbers);
  }
  //-------------------------------------------------
  selectedElement?: MapGeoJSONFeature;
  selectedLngLat: LngLat;
  cursorStyle: string;

  onClick(evt: MapLayerMouseEvent) {
    this.selectedLngLat = evt.lngLat;
    this.selectedElement = evt.features![0] as MapGeoJSONFeature;
    evt.features![0].properties;
    if (this.selectedElement.properties["boothNumber"] === "701") {
      //change property
      this.selectedElement.properties["label"] = "label";
      //change paint property
      this.map.setPaintProperty(this.selectedElement.layer.id, "fill-color", [
        "match",
        ["get", "boothNumber"],
        this.selectedElement.properties["boothNumber"],
        "red",
        this.selectedElement.properties["color"],
      ]);
    }
  }
  onMapClick() {
    this.selectedElement = null;
  }
  getSvgBounds(svgWrapper: HTMLDivElement): number[] {
    const resultStr = svgWrapper.querySelector("svg").getAttribute("viewBox").split(" ") as [];
    const resultNumber = resultStr.map((x) => parseFloat(x));
    return resultNumber;
  }

  //--------------------------------------------------------------------------------
  createBoothOutlines(svgWrapper: HTMLDivElement, scale: number = 1): MapLibrePolygon[] {
    const gElementsWithRect = svgWrapper.querySelectorAll("g rect");
    const groupElements = Array.from(gElementsWithRect, (element) => element.closest("g") as SVGGElement);
    return groupElements.map((group) => {
      const rectElement = group.querySelector("rect");
      const boothNumber = group.getAttribute("data-name");
      const x = rectElement.x.baseVal.value / scale;
      const y = rectElement.y.baseVal.value / scale;
      const width = rectElement.width.baseVal.value / scale;
      const height = rectElement.height.baseVal.value / scale;

      // Extract translation values
      const [translateX, translateY] = this.extractTranslateValues(rectElement.getAttribute("transform")) || [0, 0];
      const adjustedX = x; //+ translateX / scale;
      const adjustedY = y; //+ translateY / scale;
      // Extract rotation value
      const rotate = this.extractRotateValue(rectElement.getAttribute("transform")) || 0;
      const coordinates = this.calculateRotatedRectangleCoordinates(adjustedX, adjustedY, width, height, rotate);
      const asd: MapLibrePolygon = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: coordinates,
        },
        properties: {
          rotate: rotate,
          boothNumber: boothNumber,
          color: "blue",
          label: "you can add any property here to display it ",
        },
      };
      return asd;
    });
  }

  createBoothNumbers(svgWrapper: HTMLDivElement, scale: number = 1): MapLibrePoint[] {
    const gElementsWithText = svgWrapper.querySelectorAll("g text");
    const groupElements = Array.from(gElementsWithText, (element) => element.closest("g") as SVGGElement);

    return groupElements.map((txtElement) => {
      const transform = txtElement.querySelector("text").getAttribute("transform");
      const boothNumber = txtElement.querySelector("text tspan")?.textContent?.trim();
      const x = txtElement.transform?.baseVal[0]?.matrix?.e / scale || 0;
      const y = txtElement.transform?.baseVal[0]?.matrix?.f / scale || 0;

      const [translateX, translateY] = this.extractTranslateValues(transform) || [0, 0];

      const adjustedX = x + translateX / scale;
      const adjustedY = y + translateY / scale;
      // Extract rotation value if needed
      const rotate = this.extractRotateValue(transform) || 0;

      const mapLibreText: MapLibrePoint = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [x + adjustedX, y + adjustedY],
        },
        properties: {
          rotate: rotate,
          color: "black", // You can customize the color
          label: boothNumber,
        },
      };

      return mapLibreText;
    });
  }
  //--------------------------------------------------------------------------------
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
  extractRotateValue(transform: string): number | undefined {
    if (!transform) return undefined;

    const rotateRegex = /rotate\(([-.\d]+)\)/;
    const match = transform.match(rotateRegex);

    return match ? parseFloat(match[1]) : 0;
  }
  extractTranslateValues(transform?: string): [number, number] | undefined {
    if (!transform) return undefined;
    const regex = /translate\(([-.\d]+) ([-.\d]+)\)/;
    const match = transform.match(regex);
    return match ? [parseFloat(match[1]), parseFloat(match[2])] : [0, 0];
  }
  ngOnDestroy() {
    this.intervalSubscription.unsubscribe();
  }
}
