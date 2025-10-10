import { Test, TestingModule } from '@nestjs/testing';
import { ApiExternaService } from './api-externa.service';

describe('ApiExternaService', () => {
  let service: ApiExternaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiExternaService],
    }).compile();

    service = module.get<ApiExternaService>(ApiExternaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
