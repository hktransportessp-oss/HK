import { Injectable, Logger } from '@nestjs/common';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  status: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  async geocodeAddress(
    address: string,
    city: string,
    state: string,
  ): Promise<GeocodeResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return {
        latitude: -23.55052,
        longitude: -46.633308,
        status: 'AGUARDANDO CREDENCIAL GOOGLE MAPS',
      };
    }

    try {
      const fullAddress = encodeURIComponent(`${address}, ${city} - ${state}, Brasil`);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${fullAddress}&key=${apiKey}`,
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const confidence = data.results[0].geometry.location_type;
        return {
          latitude: location.lat,
          longitude: location.lng,
          status: confidence === 'ROOFTOP' ? 'CONFIRMED' : 'NEEDS_REVIEW',
        };
      }
    } catch (err) {
      this.logger.error('Erro na chamada do Geocoding API', err);
    }

    return {
      latitude: -23.55052,
      longitude: -46.633308,
      status: 'NEEDS_REVIEW',
    };
  }
}
