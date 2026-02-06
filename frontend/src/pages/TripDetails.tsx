import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { MapPin, Navigation, DollarSign, Clock, User, MessageCircle } from 'lucide-react';
import Map from '../components/Map';

export default function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  
  const [trip, setTrip] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerTime, setOfferTime] = useState('');

  const fetchTripData = async () => {
    try {
      const tripData = await apiRequest<any>(`/trips/${id}`, 'GET', undefined, token);
      setTrip(tripData);
      
      if (tripData.status === 'CREATED' || tripData.status === 'PUBLISHED') {
        const offersData = await apiRequest<any[]>(`/offers/by-trip/${id}`, 'GET', undefined, token);
        setOffers(offersData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
    const interval = setInterval(fetchTripData, 3000); // Poll frequently for negotiation
    return () => clearInterval(interval);
  }, [id]);

  const handleSendOffer = async () => {
    try {
      await apiRequest('/offers/create', 'POST', {
        trip_id: id,
        driver_id: user?.id,
        price: Number(offerPrice),
        estimated_time: Number(offerTime),
        is_counter_offer: Number(offerPrice) !== Number(trip.proposed_price)
      }, token);
      setOfferPrice('');
      setOfferTime('');
      fetchTripData();
    } catch (error) {
      alert('Failed to send offer');
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await apiRequest('/offers/accept', 'POST', { offer_id: offerId }, token);
      fetchTripData();
    } catch (error) {
      alert('Failed to accept offer');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await apiRequest(`/trips/${id}/status`, 'PATCH', { status }, token);
      fetchTripData();
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        navigate(isPassenger ? '/passenger' : '/driver');
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading || !trip) return <div className="p-8 text-center">Loading...</div>;

  const isPassenger = user?.role === 'passenger';
  const isActive = trip.status === 'ASSIGNED' || trip.status === 'IN_PROGRESS';

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 bg-white p-6 shadow-xl z-10 flex flex-col overflow-y-auto">
        
        {/* Header Status */}
        <div className={`p-4 rounded-lg mb-6 text-white text-center font-bold ${
          isActive ? 'bg-green-500' : trip.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          <div className="text-xs opacity-75 uppercase mb-1">{trip.type}</div>
          {trip.status}
        </div>
        
        {/* Actions for Cancel/End */}
        {isPassenger && !isActive && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && (
           <button 
             onClick={() => handleUpdateStatus('CANCELLED')}
             className="w-full mb-6 bg-red-100 text-red-600 py-2 rounded font-medium hover:bg-red-200"
           >
             Cancel Request
           </button>
        )}

        {/* Route Info */}
        <div className="space-y-4 mb-6 border-b pb-6">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 uppercase">Pickup</div>
              <div className="font-medium">{trip.pickup_address}</div>
            </div>
          </div>
          <div className="flex items-start">
            <Navigation className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 uppercase">Dropoff</div>
              <div className="font-medium">{trip.dropoff_address}</div>
            </div>
          </div>
          <div className="flex items-center text-xl font-bold text-gray-800">
            <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
            {trip.final_price || trip.proposed_price}
          </div>
        </div>

        {/* Negotiation Phase */}
        {!isActive && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && (
          <div className="space-y-6">
            {isPassenger ? (
              <div>
                <h3 className="font-bold text-lg mb-4">Offers ({offers.length})</h3>
                {offers.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 bg-gray-50 rounded animate-pulse">
                    Waiting for drivers...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offers.map((offer) => (
                      <div key={offer.id} className="bg-gray-50 p-4 rounded-lg border hover:border-blue-500 transition">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <User className="h-8 w-8 bg-gray-200 rounded-full p-1 mr-2" />
                            <div>
                              <div className="font-semibold">{offer.driver.name}</div>
                              <div className="text-xs text-gray-500">★ {offer.driver.rating_avg}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-green-600">${offer.price}</div>
                            <div className="text-xs text-gray-500">{offer.estimated_time} min</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
                        >
                          Accept
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Driver View - Make Offer */
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-bold text-lg mb-4">Make an Offer</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                    <input 
                      type="number" 
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder={trip.proposed_price}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Arrive in (min)</label>
                    <input 
                      type="number" 
                      value={offerTime}
                      onChange={(e) => setOfferTime(e.target.value)}
                      placeholder="5"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSendOffer}
                  disabled={!offerPrice || !offerTime}
                  className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Send Offer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Trip Phase */}
        {isActive && (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
            <h3 className="font-bold text-xl text-green-800 mb-2">Trip in Progress</h3>
            <p className="text-green-700 mb-4">Driver is on the way to destination.</p>
            
            <div className="flex justify-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50">
                <MessageCircle className="h-5 w-5 mr-2 text-gray-600" />
                Chat
              </button>
              
              {!isPassenger && (
                <button 
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="px-4 py-2 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700"
                >
                  End Trip
                </button>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={() => navigate(isPassenger ? '/passenger' : '/driver')}
          className="mt-auto text-gray-500 hover:text-gray-800 py-4"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="flex-1">
        <Map 
          pickup={{ lat: trip.pickup_lat, lng: trip.pickup_lng }} 
          dropoff={{ lat: trip.dropoff_lat, lng: trip.dropoff_lng }} 
        />
      </div>
    </div>
  );
}
