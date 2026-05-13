import { useState, useEffect } from 'react';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';

// third party
import { RMap, RSource, RLayer, RNavigationControl } from 'maplibre-react-components';

// project imports
import osm_bright from './map-data/osm_bright.json';

function createGeoJSONFeature(coordinates) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates },
        properties: {}
      }
    ]
  };
}

// ==============================|| MAPLIBRE - GEO JSON ANIMATION ||============================== //

export default function GeoJSONAnimation() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();

  const scheme = colorScheme ?? 'light';
  const schemeTheme = theme.colorSchemes?.[scheme];

  const currentPalette = schemeTheme ? schemeTheme.palette : theme.palette;

  const [pointData, setPointData] = useState(null);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      const angle = Date.now() / 1000;
      const center = [72.8636084, 21.2335611];
      const radius = 2;

      const newPoint = [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius];

      setPointData(createGeoJSONFeature(newPoint));

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <RMap initialCenter={[72.8691665, 21.2330191]} initialZoom={5} mapStyle={osm_bright}>
      <RNavigationControl position="top-left" />
      {pointData && (
        <>
          <RSource id="point-source" type="geojson" data={pointData} />
          <RLayer
            id="point"
            type="circle"
            source="point-source"
            paint={{ 'circle-radius': 10, 'circle-color': currentPalette.error.main }}
          />
        </>
      )}
    </RMap>
  );
}
