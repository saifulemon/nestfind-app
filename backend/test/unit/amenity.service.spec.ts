import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AmenityService } from '../../src/modules/amenities/amenity.service';
import { AmenityRepository } from '../../src/modules/amenities/amenity.repository';
import { Amenity } from '../../src/modules/properties/entities/amenity.entity';

describe('AmenityService', () => {
  let service: AmenityService;
  let repository: AmenityRepository;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  const mockAmenityRepo = {
    findByName: jest.fn(),
    findByNameExcludingId: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmenityService,
        { provide: AmenityRepository, useValue: mockAmenityRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AmenityService>(AmenityService);
    repository = module.get<AmenityRepository>(AmenityRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWithUniqueCheck', () => {
    it('should create amenity when name is unique', async () => {
      const dto = { name: 'WiFi' };
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.create.mockReturnValue({ name: 'WiFi' });
      mockQueryRunner.manager.save.mockResolvedValue({ id: '1', name: 'WiFi' });

      const result = await service.createWithUniqueCheck(dto as any);

      expect(result.name).toBe('WiFi');
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(Amenity, {
        where: { name: 'WiFi' },
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw ConflictException when name already exists', async () => {
      const dto = { name: 'WiFi' };
      mockQueryRunner.manager.findOne.mockResolvedValue({ id: '1', name: 'WiFi' });

      await expect(service.createWithUniqueCheck(dto as any)).rejects.toThrow(
        ConflictException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
