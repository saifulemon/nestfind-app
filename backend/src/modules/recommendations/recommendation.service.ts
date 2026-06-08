import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { PropertyView } from '../property-views/entities/property-view.entity';

interface ScoredProperty extends Property {
  recommendationScore: number;
  matchReasons: string[];
}

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(PropertyView)
    private readonly propertyViewRepository: Repository<PropertyView>,
  ) {}

  async getRecommendations(userId: string, limit: number = 12): Promise<ScoredProperty[]> {
    // Get user's favorites and views as signals
    const favorites = await this.favoriteRepository.find({
      where: { userId } as any,
      relations: ['property'],
    });

    const views = await this.propertyViewRepository.find({
      where: { userId } as any,
      relations: ['property'],
      order: { lastViewedAt: 'DESC' },
      take: 20,
    });

    // Collect signal properties
    const signalProperties = [
      ...favorites.map((f) => f.property).filter(Boolean),
      ...views.map((v) => v.property).filter(Boolean),
    ];

    if (signalProperties.length === 0) {
      // New user: return newest properties
      return this.getDefaultRecommendations(limit);
    }

    // Extract preferences from signals
    const propertyTypeFrequency: Record<string, number> = {};
    const cityFrequency: Record<string, number> = {};
    const amenityIds = new Set<string>();
    let totalPrice = 0;
    let priceCount = 0;
    let totalBedrooms = 0;
    let bedroomCount = 0;

    for (const prop of signalProperties) {
      if (!prop) continue;

      // Property type frequency
      propertyTypeFrequency[prop.propertyType] = (propertyTypeFrequency[prop.propertyType] || 0) + 1;

      // City frequency
      cityFrequency[prop.addressCity] = (cityFrequency[prop.addressCity] || 0) + 1;

      // Price average
      totalPrice += Number(prop.price);
      priceCount++;

      // Bedrooms average
      totalBedrooms += prop.bedrooms;
      bedroomCount++;

      // Collect amenity IDs
      if ((prop as any).propertyAmenities) {
        for (const pa of (prop as any).propertyAmenities) {
          if (pa.amenityId) amenityIds.add(pa.amenityId);
        }
      }
    }

    const avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;
    const avgBedrooms = bedroomCount > 0 ? totalBedrooms / bedroomCount : 0;

    // Get top property types and cities
    const topPropertyTypes = Object.entries(propertyTypeFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type);

    const topCities = Object.entries(cityFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city]) => city);

    // Get IDs of properties the user has already seen
    const seenPropertyIds = new Set<string>();
    for (const fav of favorites) {
      if (fav.propertyId) seenPropertyIds.add(fav.propertyId);
    }
    for (const view of views) {
      if (view.propertyId) seenPropertyIds.add(view.propertyId);
    }

    // Query candidate properties
    const candidateQuery = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.photos', 'photos')
      .leftJoinAndSelect('property.propertyAmenities', 'pa')
      .leftJoinAndSelect('pa.amenity', 'amenity')
      .where('property.deletedAt IS NULL');

    if (seenPropertyIds.size > 0) {
      candidateQuery.andWhere('property.id NOT IN (:...seenIds)', {
        seenIds: Array.from(seenPropertyIds),
      });
    }

    // Prioritize top cities and property types
    if (topCities.length > 0) {
      candidateQuery.andWhere(
        '(property.addressCity IN (:...cities) OR property.propertyType IN (:...types))',
        {
          cities: topCities,
          types: topPropertyTypes,
        },
      );
    }

    const candidates = await candidateQuery
      .orderBy('property.createdAt', 'DESC')
      .take(50)
      .getMany();

    // Score candidates
    const scored = candidates.map((prop) => {
      let score = 0;
      const reasons: string[] = [];

      // Property type match (weight: 3)
      if (topPropertyTypes.includes(prop.propertyType)) {
        score += 3;
        reasons.push(`Similar ${prop.propertyType}`);
      }

      // City match (weight: 2)
      if (topCities.includes(prop.addressCity)) {
        score += 2;
        reasons.push(`In ${prop.addressCity}`);
      }

      // Price proximity (weight: up to 2)
      if (avgPrice > 0) {
        const priceDiff = Math.abs(Number(prop.price) - avgPrice) / avgPrice;
        if (priceDiff <= 0.1) {
          score += 2;
          reasons.push('Similar price');
        } else if (priceDiff <= 0.25) {
          score += 1;
          reasons.push('Comparable price');
        }
      }

      // Bedrooms proximity (weight: 1)
      if (avgBedrooms > 0 && Math.abs(prop.bedrooms - avgBedrooms) <= 1) {
        score += 1;
        reasons.push(`${prop.bedrooms} bedrooms`);
      }

      // Amenity overlap (weight: 1 per match, max 3)
      const propAmenityIds = new Set(
        (prop.propertyAmenities || [])
          .filter((pa: any) => pa.amenity)
          .map((pa: any) => pa.amenity.id),
      );
      let amenityMatches = 0;
      for (const id of amenityIds) {
        if (propAmenityIds.has(id)) {
          amenityMatches++;
        }
      }
      score += Math.min(amenityMatches, 3);
      if (amenityMatches > 0) {
        reasons.push(`${amenityMatches} matching amenity${amenityMatches > 1 ? 'ies' : ''}`);
      }

      // Recency boost (weight: 1 for listings < 7 days old)
      const daysSinceCreated =
        (Date.now() - new Date(prop.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated <= 7) {
        score += 1;
        reasons.push('New listing');
      }

      return {
        ...prop,
        recommendationScore: score,
        matchReasons: reasons.slice(0, 3),
      };
    });

    // Sort by score descending, then by createdAt descending
    scored.sort((a, b) => {
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return scored.slice(0, limit);
  }

  private async getDefaultRecommendations(limit: number): Promise<ScoredProperty[]> {
    const properties = await this.propertyRepository.find({
      where: { deletedAt: null } as any,
      relations: ['photos', 'propertyAmenities', 'propertyAmenities.amenity'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return properties.map((prop) => ({
      ...prop,
      recommendationScore: 0,
      matchReasons: ['New on NestFind'],
    }));
  }
}
