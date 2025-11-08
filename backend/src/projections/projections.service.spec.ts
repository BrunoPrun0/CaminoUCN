import { Test, TestingModule } from '@nestjs/testing';
import { ProjectionsService } from './projections.service';

describe('ProjectionsService', () => {
  let service: ProjectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectionsService],
    }).compile();

    service = module.get<ProjectionsService>(ProjectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
