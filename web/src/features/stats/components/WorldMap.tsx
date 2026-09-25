"use client";

import { useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import type { GeoJsonObject } from "geojson";

import { alpha2ToNumeric } from "i18n-iso-countries";
import worldAtlasJson from "world-atlas/countries-110m.json";

import "./WorldMap.css";

const worldAtlas = worldAtlasJson as unknown as GeoJsonObject;

interface WorldMapProps {
  data: { value: string; count: number }[];
  total?: number;
  loading: boolean;
}

interface TooltipState {
  name: string;
  count: number;
  x: number;
  y: number;
}

export function WorldMap({ data, total, loading }: WorldMapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  function positionFromEvent(event: { clientX: number; clientY: number }) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0)
    };
  }

  const { countsByNumericId, maxCount } = useMemo(() => {
    const map = new Map<string, number>();
    let max = 0;
    for (const { value, count } of data) {
      const numericId = alpha2ToNumeric(value);
      if (!numericId) continue;
      map.set(numericId, count);
      if (count > max) max = count;
    }
    return { countsByNumericId: map, maxCount: max };
  }, [data]);

  if (loading) {
    return (
      <div className="world-map-loading" role="status" aria-live="polite">
        <span className="user-stats-spinner" aria-hidden />
        <span>Loading map...</span>
      </div>
    );
  }

  return (
    <div className="world-map-wrapper" ref={wrapperRef}>
      <ComposableMap
        width={800}
        height={390}
        projectionConfig={{ scale: 150, center: [0, 8] }}
        className="world-map-svg"
      >
        <Geographies geography={worldAtlas}>
          {({ geographies }) =>
            geographies
              .filter(
                (geo) => !/antarctic/i.test(String(geo.properties?.name ?? ""))
              )
              .map((geo) => {
                const count = countsByNumericId.get(String(geo.id)) ?? 0;
                const opacity =
                  count > 0 && maxCount > 0
                    ? 0.12 + 0.83 * Math.sqrt(count / maxCount)
                    : 0.05;
                const name =
                  typeof geo.properties?.name === "string"
                    ? geo.properties.name
                    : "Unknown";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="var(--color-secondary)"
                    fillOpacity={opacity}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth={0.5}
                    className="world-map-country"
                    onMouseEnter={(event) =>
                      setTooltip({ name, count, ...positionFromEvent(event) })
                    }
                    onMouseMove={(event) =>
                      setTooltip((prev) =>
                        prev ? { ...prev, ...positionFromEvent(event) } : prev
                      )
                    }
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="world-map-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="world-map-tooltip-name">{tooltip.name}</div>
          <div className="world-map-tooltip-count">
            {tooltip.count > 0
              ? `${tooltip.count.toLocaleString()} user${tooltip.count === 1 ? "" : "s"}${
                  total ? ` (${((tooltip.count / total) * 100).toFixed(1)}%)` : ""
                }`
              : "No users"}
          </div>
        </div>
      )}
    </div>
  );
}
