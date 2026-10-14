import type { QuestionRepository } from '../repository';
import { seedImages, seedQuestions } from './seed';

export const localRepository: QuestionRepository = {
  async listImages() {
    return seedImages;
  },
  async getImage(imageId) {
    return seedImages.find((image) => image.id === imageId) ?? null;
  },
  async getQuestions(imageId) {
    return seedQuestions.filter((question) => question.imageId === imageId);
  },
};
