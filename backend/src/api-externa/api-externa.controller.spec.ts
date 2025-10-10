import { Test, TestingModule } from '@nestjs/testing';
import { ApiExternaController } from './api-externa.controller';

describe('ApiExternaController', () => {
  let controller: ApiExternaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiExternaController],
    }).compile();

    controller = module.get<ApiExternaController>(ApiExternaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
