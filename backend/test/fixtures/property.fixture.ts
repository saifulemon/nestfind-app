import { DataSource } from 'typeorm';
import { Property } from '../../src/modules/properties/entities/property.entity';
import { PropertyTypeEnum } from '../../src/common/enums/property-type.enum';
import { Amenity } from '../../src/modules/properties/entities/amenity.entity';

export interface TestPropertyData {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  propertyType: PropertyTypeEnum;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressLatitude?: number;
  addressLongitude?: number;
  availableFrom?: string;
}

export const testProperties: Record<string, TestPropertyData> = {
  downtownApt: {
    title: 'Downtown Luxury Apartment',
    description: 'A beautiful luxury apartment in the heart of downtown with stunning city views.',
    price: 2500.0,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 950,
    propertyType: PropertyTypeEnum.APARTMENT,
    addressStreet: '123 Main St',
    addressCity: 'New York',
    addressState: 'NY',
    addressZipCode: '10001',
    addressLatitude: 40.7127753,
    addressLongitude: -74.0059728,
    availableFrom: '2026-06-01',
  },
  suburbanHouse: {
    title: 'Spacious Suburban House',
    description: 'A large family home in a quiet suburban neighborhood with a big backyard.',
    price: 3200.0,
    bedrooms: 4,
    bathrooms: 2,
    squareFeet: 2100,
    propertyType: PropertyTypeEnum.HOUSE,
    addressStreet: '456 Oak Ave',
    addressCity: 'Austin',
    addressState: 'TX',
    addressZipCode: '78701',
    addressLatitude: 30.267153,
    addressLongitude: -97.743057,
    availableFrom: '2026-07-01',
  },
  cheapStudio: {
    title: 'Budget Studio',
    description: 'A compact and affordable studio apartment perfect for singles.',
    price: 900.0,
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 400,
    propertyType: PropertyTypeEnum.STUDIO,
    addressStreet: '789 Pine Rd',
    addressCity: 'Chicago',
    addressState: 'IL',
    addressZipCode: '60601',
    addressLatitude: 41.878113,
    addressLongitude: -87.629799,
  },
};

export async function createTestProperty(
  dataSource: DataSource,
  data: TestPropertyData,
): Promise<Property> {
  const repository = dataSource.getRepository(Property);
  const property = repository.create(data);
  return repository.save(property);
}

export async function seedTestProperties(
  dataSource: DataSource,
): Promise<Record<string, Property>> {
  const downtownApt = await createTestProperty(dataSource, testProperties.downtownApt);
  const suburbanHouse = await createTestProperty(dataSource, testProperties.suburbanHouse);
  const cheapStudio = await createTestProperty(dataSource, testProperties.cheapStudio);
  return { downtownApt, suburbanHouse, cheapStudio };
}

export const testAmenities: Array<{ name: string; icon: string }> = [
  { name: 'Parking', icon: 'parking' },
  { name: 'Gym', icon: 'gym' },
  { name: 'Pool', icon: 'pool' },
  { name: 'Pet Friendly', icon: 'pet' },
];

export async function seedTestAmenities(
  dataSource: DataSource,
): Promise<Amenity[]> {
  const repository = dataSource.getRepository(Amenity);
  const amenities = repository.create(testAmenities);
  return repository.save(amenities);
}
