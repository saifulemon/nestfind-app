// @ts-nocheck
import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProperty, useUpdateProperty, usePropertyDetail } from '~/hooks/api/useProperties';
import { useAmenityList } from '~/hooks/api/useAmenities';
import type { CreatePropertyDto, AddressDto, PropertyTypeEnum } from '~/types/api/property';
import { PROPERTY_TYPES } from '~/types/api/property';

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existingProperty, isLoading: loadingExisting } = usePropertyDetail(id);
  const { data: amenities } = useAmenityList();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();

  const [error, setError] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [squareFeet, setSquareFeet] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyTypeEnum>('apartment');
  const [availableFrom, setAvailableFrom] = useState('');
  const [address, setAddress] = useState<AddressDto>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (existingProperty) {
      setTitle(existingProperty.title);
      setDescription(existingProperty.description);
      setPrice(existingProperty.price.toString());
      setBedrooms(existingProperty.bedrooms.toString());
      setBathrooms(existingProperty.bathrooms.toString());
      setSquareFeet(existingProperty.squareFeet ? existingProperty.squareFeet.toString() : '');
      setPropertyType(existingProperty.propertyType);
      setAvailableFrom(existingProperty.availableFrom?.split('T')[0] || '');
      setAddress({
        street: existingProperty.address?.street || existingProperty.addressStreet || '',
        city: existingProperty.address?.city || existingProperty.addressCity || '',
        state: existingProperty.address?.state || existingProperty.addressState || '',
        zipCode: existingProperty.address?.zipCode || existingProperty.addressZipCode || '',
      });
    }
  }, [existingProperty]);

  const isPending = createProperty.isPending || updateProperty.isPending;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const valid = files.filter((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type));
    if (valid.length !== files.length) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (imageFiles.length + valid.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    setImageFiles((prev) => [...prev, ...valid]);
    valid.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (isEdit && id) {
      const jsonData: CreatePropertyDto = {
        title,
        description,
        price: parseFloat(price),
        bedrooms: parseInt(bedrooms, 10),
        bathrooms: parseInt(bathrooms, 10),
        squareFeet: squareFeet ? parseInt(squareFeet, 10) : undefined,
        propertyType,
        address,
        amenityIds: selectedAmenities,
        availableFrom: availableFrom || undefined,
      };
      updateProperty.mutate(
        { id, data: jsonData },
        { onSuccess: () => navigate('/admin/properties'), onError: (err) => setError((err as Error).message) }
      );
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('bedrooms', bedrooms);
    formData.append('bathrooms', bathrooms);
    if (squareFeet) formData.append('squareFeet', squareFeet);
    formData.append('propertyType', propertyType);
    formData.append('address', JSON.stringify(address));
    if (selectedAmenities.length > 0) formData.append('amenityIds', JSON.stringify(selectedAmenities));
    if (availableFrom) formData.append('availableFrom', availableFrom);
    imageFiles.forEach((f) => formData.append('files', f));

    createProperty.mutate(formData, {
      onSuccess: () => navigate('/admin/properties'),
      onError: (err) => setError((err as Error).message),
    });
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold">Property Form</h1>
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center">{isEdit ? 'Edit Property' : 'Add Property'}</h1>
      <p className="mt-2 text-muted-foreground text-center">{isEdit ? 'Update property details.' : 'Create a new property listing.'}</p>

      {error && (
        <div className="mt-4 p-3 rounded bg-destructive/10 text-destructive text-sm max-w-2xl mx-auto text-center">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-2xl mx-auto">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} maxLength={200} className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={20} maxLength={5000} rows={4} className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price ($/mo)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" required min={0} step="0.01" className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} type="number" required min={0} className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} type="number" required min={0} className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Square Feet</label>
            <input value={squareFeet} onChange={(e) => setSquareFeet(e.target.value)} type="number" min={0} className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Property Type</label>
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyTypeEnum)} required className="w-full h-10 rounded-md border bg-background px-3 text-sm">
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Available From</label>
          <input value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} type="date" className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
        </div>
        <fieldset className="border rounded-md p-4">
          <legend className="text-sm font-medium px-2">Address</legend>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm mb-1">Street</label>
              <input value={address.street} onChange={(e) => setAddress((prev) => ({ ...prev, street: e.target.value }))} required maxLength={200} className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm mb-1">City</label>
              <input value={address.city} onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))} required maxLength={100} className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm mb-1">State</label>
              <input value={address.state} onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))} required maxLength={100} className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm mb-1">ZIP Code</label>
              <input value={address.zipCode} onChange={(e) => setAddress((prev) => ({ ...prev, zipCode: e.target.value }))} required maxLength={10} className="w-full h-10 rounded-md border bg-background px-3 text-sm" />
            </div>
          </div>
        </fieldset>

        {amenities && amenities.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <label key={a.id} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-sm cursor-pointer hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(a.id)}
                    onChange={() => toggleAmenity(a.id)}
                    className="accent-primary"
                  />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium mb-2">Images (up to 10, JPEG/PNG/WebP)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border group">
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={isPending} className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 mx-auto block">
          {isPending ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
        </button>
      </form>
    </div>
  );
}
