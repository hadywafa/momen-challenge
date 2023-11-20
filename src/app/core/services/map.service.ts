import { Injectable } from '@angular/core';
import * as maplibregl from 'maplibre-gl';

@Injectable({
  providedIn: 'root',
})
export class MapLibreService {
  private map: maplibregl.Map | undefined;

  initializeMap(container: string, center: [number, number], zoom: number): void {
    this.map = new maplibregl.Map({
      container,
      style: 'maplibre://styles/mapbox/streets-v11',
      center,
      zoom,
    });
  }

  addGeoJSONLayer(id: string, source: string, color: string): void {
    if (this.map) {
      this.map.addLayer({
        id,
        type: 'fill',
        source,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.5,
        },
      });
    }
  }

  // Add more methods as needed
}
