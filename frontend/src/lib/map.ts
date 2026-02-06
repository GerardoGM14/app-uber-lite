// Haversine formula to calculate distance between two points
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateEstimatedPrice(distanceKm: number, type: 'trip' | 'delivery' = 'trip'): number {
  const basePrice = type === 'trip' ? 5 : 7; // Base price in PEN
  const pricePerKm = type === 'trip' ? 1.5 : 2.0; // Price per km
  const price = basePrice + (distanceKm * pricePerKm);
  return Math.round(price * 10) / 10; // Round to 1 decimal place
}

export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'UrbanGo-MVP/1.0'
        }
      }
    );
    const data = await response.json();
    
    // Construct a friendly address
    const road = data.address.road || data.address.pedestrian || '';
    const number = data.address.house_number || '';
    const suburb = data.address.suburb || data.address.neighbourhood || '';
    const city = data.address.city || data.address.town || data.address.municipality || '';

    let address = road;
    if (number) address += ` ${number}`;
    if (suburb) address += `, ${suburb}`;
    if (!address && city) address = city;
    
    return address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export async function getCoordinatesFromAddress(query: string, countryCode?: string): Promise<{lat: number, lng: number, displayName: string} | null> {
  try {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    // Si tenemos un código de país (ej: 'pe', 'co', 'mx'), lo añadimos al filtro
    if (countryCode) {
      url += `&countrycodes=${countryCode.toLowerCase()}`;
    }

    const response = await fetch(
      url,
      {
        headers: {
          'User-Agent': 'UrbanGo-MVP/1.0'
        }
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

export async function getCurrentCountryCode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=3&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'UrbanGo-MVP/1.0'
        }
      }
    );
    const data = await response.json();
    return data.address?.country_code || null;
  } catch (error) {
    console.error('Failed to get country code:', error);
    return null;
  }
}
