// @ts-nocheck
import { useState, useEffect, type FormEvent } from 'react';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Bed, Bath, Ruler, Building2, Wifi, AirVent, WashingMachine, CookingPot, Car, Dumbbell, Waves, PawPrint, Send, MapIcon, Calendar, Clock, Video, UserCheck, Loader2, MessageSquare } from 'lucide-react';
import { usePropertyDetail } from '~/hooks/api/useProperties';
import { useAddFavorite, useRemoveFavorite } from '~/hooks/api/useFavorites';
import { useSubmitInquiry } from '~/hooks/api/useInquiries';
import { useTrackPropertyView } from '~/hooks/api/usePropertyViews';
import { usePropertyReviews } from '~/hooks/api/useReviews';
import { useTourSlots, useBookTour } from '~/hooks/api/useTours';
import { useCreateConversation } from '~/hooks/api/useChat';
import { useAuth } from '~/hooks/useAuth';
import ReviewSection from '~/components/shared/ReviewSection';

const AMENITY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  'air-conditioning': AirVent,
  laundry: WashingMachine,
  dishwasher: CookingPot,
  parking: Car,
  gym: Dumbbell,
  pool: Waves,
  'pet-friendly': PawPrint,
};

export default function DetailPage() {
  useDocumentTitle('Property Details - NestFind');
  const { id } = useParams<{ id: string }>();
  const [activeThumb, setActiveThumb] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [tourNotes, setTourNotes] = useState('');

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: property, isLoading, isError, error } = usePropertyDetail(id);
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const submitInquiry = useSubmitInquiry(id || '');
  const { track: trackView } = useTrackPropertyView();
  const { data: reviewData, submitReview, markHelpful } = usePropertyReviews(id);
  const { slots: tourSlots, isLoading: slotsLoading } = useTourSlots(id);
  const { book: bookTour, isPending: bookingPending, isSuccess: bookingSuccess, error: bookingError, reset: resetBooking } = useBookTour();
  const { create: createConversation, isPending: creatingConversation, isSuccess: conversationCreated, error: conversationError, reset: resetConversation } = useCreateConversation();

  // Track property view when loaded
  useEffect(() => {
    if (id && property) {
      trackView(id);
    }
  }, [id, property, trackView]);

  // Initialize favorite state from API when property loads
  useEffect(() => {
    if (property?.isFavorited !== undefined) {
      setFavorited(property.isFavorited);
    }
  }, [property?.id]);

  const handleToggleFav = () => {
    if (!property) return;
    const newVal = !favorited;
    setFavorited(newVal);
    if (newVal) {
      addFav.mutate(property.id);
    } else {
      removeFav.mutate(property.id);
    }
  };

  const handleBookTour = async () => {
    if (!selectedSlotId) return;
    try {
      await bookTour(selectedSlotId, tourNotes || undefined);
      setSelectedSlotId(null);
      setTourNotes('');
    } catch {
      // error state is already set in the hook
    }
  };

  const handleStartConversation = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!property) return;
    resetConversation();
    try {
      // TODO: adminId should come from property.ownerId or property.adminId once backend supports it
      const adminId = '00000000-0000-0000-0000-000000000001';
      await createConversation({
        adminId,
        propertyId: property.id,
        subject: `Question about ${property.title}`,
      });
      navigate('/messages');
    } catch {
      // error state is already set in the hook
    }
  };

  const handleInquirySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    submitInquiry.mutate(
      {
        message: formData.get('message') as string,
        name: (formData.get('name') as string) || undefined,
        email: (formData.get('email') as string) || undefined,
        phone: (formData.get('phone') as string) || undefined,
      },
      {
        onSuccess: () => {
          setInquirySuccess(true);
          form.reset();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-center py-[120px] text-[#64748B] text-[16px]">
          Loading property details...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center justify-center py-[120px] text-[#F87171] text-[16px]">
          <p>{(error as Error)?.message || 'Failed to load property'}</p>
          <Link to="/search" className="text-[#4A90D9] mt-[16px] hover:underline">Back to search</Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center justify-center py-[120px] text-[#64748B]">
          <p className="text-[18px]">Property not found</p>
          <Link to="/search" className="text-[#4A90D9] mt-[16px] hover:underline">Back to search</Link>
        </div>
      </div>
    );
  }

  const photos = property.photos ?? [];
  const thumbnails = photos.length > 0
    ? photos.map((p) => p.url.startsWith('http') ? p.url : '/' + p.url)
    : ['linear-gradient(135deg,rgba(74,144,217,0.35),rgba(124,58,237,0.35))'];

  const stats = [
    { icon: Bed, value: String(property.bedrooms), label: 'Bedrooms' },
    { icon: Bath, value: String(property.bathrooms), label: 'Bathrooms' },
    { icon: Ruler, value: property.squareFeet?.toLocaleString() ?? '—', label: 'Square Feet' },
    { icon: Building2, value: property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1), label: 'Property Type', isSmall: true },
  ];

  const amenities = (property.amenities ?? []).map((a) => ({
    icon: AMENITY_ICON_MAP[a.icon] || Wifi,
    label: a.name,
  }));

  return (
    <div className="max-w-[1440px] mx-auto">
      <section className="p-[24px] sm:p-[48px]">
        <Link  to="/search" className="inline-flex items-center gap-[6px] text-[#94A3B8] no-underline text-[14px] mb-[24px] transition-colors hover:text-[#F1F5F9]" data-testid="A-07-detail-back">
          <ArrowLeft className="w-[18px] h-[18px]" /> Back to search
        </Link>

        <div className="relative mb-[24px]">
          <div
            className="w-full h-[240px] sm:h-[400px] object-cover rounded-[12px] bg-cover bg-center"
            style={photos.length > 0 ? { backgroundImage: `url(${thumbnails[activeThumb]})` } : { background: thumbnails[activeThumb] as string }}
          />
        </div>

        <div className="flex gap-[8px] mt-[12px] overflow-x-auto pb-2">
          {thumbnails.map((src, i) => (
            <div
              key={`thumb-${i}`}
              onClick={() => setActiveThumb(i)}
              className={`w-[80px] h-[60px] rounded-[8px] object-cover cursor-pointer border-2 bg-white/5 bg-cover bg-center transition-all duration-200 hover:border-[rgba(74,144,217,0.3)] shrink-0 ${i === activeThumb ? 'border-[#4A90D9]' : 'border-transparent'}`}
              style={photos.length > 0 ? { backgroundImage: `url(${src})` } : { background: src }}
              data-testid={`A-07-detail-thumb-${i}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveThumb(i); }}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-[12px] sm:gap-[16px] mt-[32px] mb-[4px]">
          <div className="flex items-center gap-[16px] flex-1">
            <h2 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.02em]">
              ${property.price.toLocaleString()}<small className="text-[18px] font-normal text-[#94A3B8]">/mo</small>
            </h2>
            {property.availableFrom && (
              <span className="inline-block px-[10px] py-[2px] rounded-full text-[11px] font-semibold text-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.3)]">Available {new Date(property.availableFrom).toLocaleDateString()}</span>
            )}
          </div>
          <button type="button"
            onClick={handleToggleFav}
            className={`w-[36px] h-[36px] rounded-full border-none inline-flex items-center justify-center cursor-pointer transition-all duration-200 self-start sm:self-auto ${favorited ? 'bg-[rgba(248,113,113,0.2)] text-[#F87171]' : 'bg-white/10 text-[#94A3B8] hover:bg-[rgba(248,113,113,0.15)] hover:text-[#F87171]'}`}
            data-testid="A-07-detail-fav-btn"
          >
            <Heart className="w-[20px] h-[20px]" fill={favorited ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className="text-[16px] text-[#94A3B8] mb-[32px]">
          <MapPin className="w-[16px] h-[16px] inline align-[-2px]" />
          {' '}{property.address?.street || property.addressStreet}, {property.address?.city || property.addressCity}, {property.address?.state || property.addressState} {property.address?.zipCode || property.addressZipCode}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[16px] mb-[40px]">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-[12px] p-[16px] sm:p-[24px] text-center">
                <p><Icon className="w-[20px] h-[20px] text-[#4A90D9] inline align-[-3px]" /></p>
                <h3 className={`${stat.isSmall ? 'text-[16px] sm:text-[18px]' : 'text-[24px] sm:text-[32px]'} font-bold mb-[4px]`}>{stat.value}</h3>
                <p className="text-[#94A3B8] text-[13px]">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_420px] gap-[40px]">
          <div>
            <div className="mb-[40px]">
              <h3 className="text-[20px] font-semibold mb-[16px]">Description</h3>
              <p className="text-[#94A3B8] text-[14px] leading-[1.8]">
                {property.description}
              </p>
            </div>

            {amenities.length > 0 && (
              <div className="mb-[40px]">
                <h3 className="text-[20px] font-semibold mb-[16px]">Amenities</h3>
                <div className="grid grid-cols-2 gap-[12px]">
                  {amenities.map((amenity, i) => {
                    const Icon = amenity.icon;
                    return (
                      <div key={amenity.label} className="flex items-center gap-[10px] px-[14px] py-[10px] bg-white/[0.03] rounded-[8px] text-[14px] text-[#94A3B8]">
                        <Icon className="w-[20px] h-[20px] text-[#4A90D9]" />
                        {amenity.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-[40px]">
              <h3 className="text-[20px] font-semibold mb-[16px]">Location</h3>
              <div className="w-full h-[300px] rounded-[12px] overflow-hidden border border-white/10">
                <iframe
                  title="Property Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(30%) invert(92%) contrast(83%)' }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `${property.address?.street || property.addressStreet}, ${property.address?.city || property.addressCity}, ${property.address?.state || property.addressState} ${property.address?.zipCode || property.addressZipCode}`
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <p className="text-[13px] text-[#64748B] mt-[8px]">
                <MapIcon className="w-[14px] h-[14px] inline align-[-2px]" />{' '}
                {property.address?.street || property.addressStreet}, {property.address?.city || property.addressCity}, {property.address?.state || property.addressState} {property.address?.zipCode || property.addressZipCode}
              </p>
            </div>

            <ReviewSection
              reviews={reviewData.reviews}
              averageRating={reviewData.averageRating}
              totalCount={reviewData.totalCount}
              onSubmitReview={submitReview}
              onHelpful={markHelpful}
            />
          </div>

          <div>
            <div className="lg:sticky lg:top-[24px] bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-[12px] p-[24px]">
              {/* Message Landlord */}
              <button
                type="button"
                onClick={handleStartConversation}
                disabled={creatingConversation}
                className="w-full h-[48px] rounded-[12px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white font-semibold text-[14px] flex items-center justify-center gap-[8px] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-[1px] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed mb-[24px]"
              >
                <MessageSquare className="w-[18px] h-[18px]" />
                {creatingConversation ? 'Starting...' : 'Message Landlord'}
              </button>

              {conversationError && (
                <div className="mb-[16px] p-[12px] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-[8px] text-[#F87171] text-[13px]">
                  {conversationError}
                </div>
              )}

              <h3 className="text-[20px] font-semibold mb-[4px]">Send an Inquiry</h3>
              <p className="text-[#94A3B8] text-[13px] mb-[20px]">Interested? Send a message to the landlord.</p>

              {inquirySuccess && (
                <div className="mb-[16px] p-[12px] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] rounded-[8px] text-[#4ADE80] text-[13px]">
                  Inquiry sent successfully!
                </div>
              )}

              {submitInquiry.isError && (
                <div className="mb-[16px] p-[12px] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-[8px] text-[#F87171] text-[13px]">
                  {(submitInquiry.error as Error)?.message || 'Failed to send inquiry'}
                </div>
              )}

              <form className="flex flex-col gap-[16px]" onSubmit={handleInquirySubmit}>
                <div>
                  <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Full Name</label>
                  <input type="text" name="name" placeholder="John Smith" className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none font-[inherit] placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]" data-testid="A-07-detail-inquiry-name" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Email Address</label>
                  <input type="email" name="email" placeholder="john@example.com" className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none font-[inherit] placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]" data-testid="A-07-detail-inquiry-email" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Phone Number</label>
                  <input type="tel" name="phone" placeholder="(512) 555-0142" className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none font-[inherit] placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]" data-testid="A-07-detail-inquiry-phone" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Message</label>
                  <textarea name="message" placeholder="Hi, I'm interested in this property and would like to schedule a viewing..." rows={4} className="min-h-[100px] resize-y w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] py-[12px] text-[#F1F5F9] text-[14px] outline-none font-[inherit] placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]" data-testid="A-07-detail-inquiry-message" />
                </div>
                <button type="submit" disabled={submitInquiry.isPending} className="inline-flex items-center justify-center gap-[8px] font-semibold cursor-pointer border-none transition-all duration-200 font-[inherit] w-full h-[48px] px-[24px] rounded-[12px] text-[14px] text-white bg-[linear-gradient(135deg,#4A90D9,#7C3AED)] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" data-testid="A-07-detail-inquiry-submit">
                  <Send className="w-[18px] h-[18px]" /> {submitInquiry.isPending ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>

              {/* Book Tour Section */}
              <div className="mt-[32px] pt-[32px] border-t border-white/[0.08]">
                <h3 className="text-[20px] font-semibold mb-[4px] flex items-center gap-[8px]">
                  <Calendar className="w-[20px] h-[20px] text-[#4A90D9]" />
                  Book a Tour
                </h3>
                <p className="text-[#94A3B8] text-[13px] mb-[20px]">Schedule an in-person or virtual viewing.</p>

                {bookingSuccess && (
                  <div className="mb-[16px] p-[12px] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] rounded-[8px] text-[#4ADE80] text-[13px] flex items-center gap-[8px]">
                    <UserCheck className="w-[16px] h-[16px]" />
                    Tour booked successfully! View it in <Link to="/tours" className="underline hover:no-underline">My Tours</Link>.
                  </div>
                )}

                {bookingError && (
                  <div className="mb-[16px] p-[12px] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-[8px] text-[#F87171] text-[13px]">
                    {bookingError}
                  </div>
                )}

                {slotsLoading ? (
                  <div className="flex items-center gap-[8px] text-[13px] text-[#64748B] py-[12px]">
                    <Loader2 className="w-[16px] h-[16px] animate-spin" />
                    Loading available slots...
                  </div>
                ) : tourSlots.length === 0 ? (
                  <div className="text-[13px] text-[#64748B] py-[12px]">
                    No tour slots available for this property right now.
                  </div>
                ) : (
                  <div className="flex flex-col gap-[12px]">
                    <div className="space-y-[8px]">
                      {tourSlots.map((slot) => {
                        const start = new Date(slot.startTime);
                        const end = new Date(slot.endTime);
                        const isSelected = selectedSlotId === slot.id;
                        const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                        const timeStr = `${start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => { setSelectedSlotId(isSelected ? null : slot.id); resetBooking(); }}
                            className={`w-full text-left p-[12px] rounded-[10px] border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[rgba(74,144,217,0.1)] border-[rgba(74,144,217,0.4)]'
                                : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-[8px]">
                                <Clock className="w-[14px] h-[14px] text-[#4A90D9]" />
                                <span className="text-[14px] font-medium text-[#F1F5F9]">{dateStr}</span>
                              </div>
                              <span className="text-[12px] text-[#64748B]">{timeStr}</span>
                            </div>
                            <div className="flex items-center gap-[6px] mt-[6px] ml-[22px]">
                              {slot.tourType === 'virtual' ? (
                                <Video className="w-[12px] h-[12px] text-[#94A3B8]" />
                              ) : (
                                <MapPin className="w-[12px] h-[12px] text-[#94A3B8]" />
                              )}
                              <span className="text-[12px] text-[#94A3B8] capitalize">{slot.tourType.replace('_', '-')}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedSlotId && (
                      <div className="flex flex-col gap-[12px]">
                        <div>
                          <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Notes (optional)</label>
                          <textarea
                            value={tourNotes}
                            onChange={(e) => setTourNotes(e.target.value)}
                            placeholder="Any special requests or questions..."
                            rows={3}
                            className="min-h-[80px] resize-y w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] py-[12px] text-[#F1F5F9] text-[14px] outline-none font-[inherit] placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleBookTour}
                          disabled={bookingPending}
                          className="inline-flex items-center justify-center gap-[8px] font-semibold cursor-pointer border-none transition-all duration-200 font-[inherit] w-full h-[48px] px-[24px] rounded-[12px] text-[14px] text-white bg-[linear-gradient(135deg,#4A90D9,#7C3AED)] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Calendar className="w-[18px] h-[18px]" />
                          {bookingPending ? 'Booking...' : 'Book Tour'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
