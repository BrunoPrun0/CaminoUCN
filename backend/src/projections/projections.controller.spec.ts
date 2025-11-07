import { Test, TestingModule } from '@nestjs/testing';
import { ProjectionsController } from './projections.controller';

describe('ProjectionsController', () => {
  let controller: ProjectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectionsController],
    }).compile();

    controller = module.get<ProjectionsController>(ProjectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
