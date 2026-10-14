import type { GameImage, Question, QuestionType } from '@/types/game';

/**
 * Hardcoded content used until questions are served from Supabase.
 * The scenes are illustrated (sources in `design/scenes/`) so every
 * question has a single, verifiable answer.
 */
export const seedImages: GameImage[] = [
  { id: 'picnic', title: 'Picnic in the park', source: require('../../../assets/images/picnic.jpg') },
  { id: 'study', title: 'The study desk', source: require('../../../assets/images/study.jpg') },
  { id: 'street', title: 'Colourful street', source: require('../../../assets/images/street.jpg') },
];

/** Seed helper: the correct answer is always listed first; options are shuffled at play time. */
function q(
  imageId: string,
  n: number,
  type: QuestionType,
  prompt: string,
  [answer, ...distractors]: [string, string, string, string],
): Question {
  return {
    id: `${imageId}-${n}`,
    imageId,
    type,
    prompt,
    options: [answer, ...distractors],
    answerIndex: 0,
  };
}

export const seedQuestions: Question[] = [
  // Picnic in the park
  q('picnic', 1, 'object', 'What was flying in the sky?', ['A kite', 'A balloon', 'A plane', 'A drone']),
  q('picnic', 2, 'object', 'What was on the blanket next to the apples?', ['A basket', 'A book', 'A radio', 'A teapot']),
  q('picnic', 3, 'object', 'What was on the grass beside the blanket?', ['A ball', 'A frisbee', 'A dog', 'A bicycle']),
  q('picnic', 4, 'count', 'How many apples were on the blanket?', ['4', '3', '5', '6']),
  q('picnic', 5, 'count', 'How many birds were flying?', ['5', '3', '4', '7']),
  q('picnic', 6, 'count', 'How many trees were there?', ['2', '1', '3', '4']),
  q('picnic', 7, 'colour', 'What colour was the kite?', ['Red', 'Blue', 'Green', 'Yellow']),
  q('picnic', 8, 'colour', 'What colour was the cup?', ['Yellow', 'Red', 'White', 'Blue']),
  q('picnic', 9, 'position', 'Where was the sun?', ['Top right', 'Top left', 'Top centre', 'Behind a cloud']),
  q('picnic', 10, 'position', 'Which side of the picture were the trees on?', ['Left', 'Right', 'Both sides', 'Behind the blanket']),

  // The study desk
  q('study', 1, 'object', 'What animal was in the picture?', ['A cat', 'A dog', 'A rabbit', 'A hamster']),
  q('study', 2, 'object', 'What was hanging on the wall?', ['A clock', 'A mirror', 'A painting', 'A calendar']),
  q('study', 3, 'object', 'Which of these was on the desk?', ['A laptop', 'A phone', 'A plant', 'A teapot']),
  q('study', 4, 'count', 'How many books were stacked on the desk?', ['3', '2', '4', '5']),
  q('study', 5, 'count', 'How many pencils were in the cup?', ['2', '1', '3', '4']),
  q('study', 6, 'count', 'How many panes of glass did the window have?', ['4', '2', '6', '8']),
  q('study', 7, 'colour', 'What colour was the lamp?', ['Green', 'Red', 'Blue', 'Black']),
  q('study', 8, 'colour', 'What colour was the book on top of the stack?', ['Yellow', 'Red', 'Blue', 'Green']),
  q('study', 9, 'position', 'Where was the cat?', ['Under the desk', 'On the desk', 'By the window', 'On a chair']),
  q('study', 10, 'position', 'Where on the desk was the lamp?', ['On the left', 'On the right', 'In the middle', 'It was on the floor']),

  // Colourful street
  q('street', 1, 'object', 'What was floating in the sky?', ['Hot-air balloons', 'Kites', 'Planes', 'Birds']),
  q('street', 2, 'object', 'What was leaning against one of the houses?', ['A bicycle', 'A ladder', 'A scooter', 'A skateboard']),
  q('street', 3, 'object', 'What stood on the pavement between two houses?', ['A street lamp', 'A tree', 'A post box', 'A bench']),
  q('street', 4, 'count', 'How many houses were in the row?', ['4', '3', '5', '6']),
  q('street', 5, 'count', 'How many hot-air balloons were there?', ['2', '1', '3', '4']),
  q('street', 6, 'count', 'How many chimneys could you see?', ['1', '0', '2', '4']),
  q('street', 7, 'colour', 'What colour was the car?', ['Orange', 'Red', 'Blue', 'Yellow']),
  q('street', 8, 'colour', 'What colour was the door of the yellow house?', ['Purple', 'White', 'Red', 'Green']),
  q('street', 9, 'position', 'Which house had smoke coming from its chimney?', [
    'The one on the far left',
    'The one on the far right',
    'The second from the left',
    'None of them',
  ]),
  q('street', 10, 'position', 'Where was the bicycle?', [
    'In front of the house on the far right',
    'In front of the house on the far left',
    'In the middle of the road',
    'Next to the car',
  ]),
];
