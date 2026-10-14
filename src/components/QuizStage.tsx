import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

import { AnswerOption, type OptionStatus } from '@/components/AnswerOption';
import { Button } from '@/components/Button';
import { colors, radius } from '@/theme';
import type { QuestionType, RoundQuestion } from '@/types/game';

/** How long a correct answer stays green before moving on by itself. */
const CORRECT_ADVANCE_MS = 700;

const TYPE_LABELS: Record<QuestionType, string> = {
  object: 'Object',
  count: 'Count',
  colour: 'Colour',
  position: 'Position',
};

/**
 * choosing → (right) correct → auto-advance
 *          → (wrong) shaking → revealed → player taps Next
 */
type Feedback = 'choosing' | 'correct' | 'shaking' | 'revealed';

interface QuizStageProps {
  questions: RoundQuestion[];
  /** Number of questions already answered, i.e. the index of the current one. */
  answeredCount: number;
  onAnswer: (optionIndex: number) => void;
}

export function QuizStage({ questions, answeredCount, onAnswer }: QuizStageProps) {
  const question = questions[answeredCount];
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>('choosing');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!question) return null;

  const isLast = answeredCount === questions.length - 1;

  const advance = (index: number) => {
    setSelected(null);
    setFeedback('choosing');
    onAnswer(index);
  };

  const choose = (index: number) => {
    if (feedback !== 'choosing') return;
    setSelected(index);
    if (index === question.answerIndex) {
      setFeedback('correct');
      timer.current = setTimeout(() => advance(index), CORRECT_ADVANCE_MS);
    } else {
      setFeedback('shaking');
    }
  };

  const statusFor = (index: number): OptionStatus => {
    const isAnswer = index === question.answerIndex;
    switch (feedback) {
      case 'choosing':
        return 'idle';
      case 'correct':
        return isAnswer ? 'correct' : 'muted';
      case 'shaking':
        return index === selected ? 'wrong' : 'idle';
      case 'revealed':
        if (index === selected) return 'wrong';
        return isAnswer ? 'correct' : 'muted';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Question {answeredCount + 1} of {questions.length}
        </Text>
        <Text style={styles.chip}>{TYPE_LABELS[question.type]}</Text>
      </View>

      <Animated.View key={question.id} entering={FadeInRight.duration(250)} style={styles.body}>
        <Text style={styles.prompt}>{question.prompt}</Text>
        <View style={styles.options}>
          {question.options.map((option, index) => (
            <AnswerOption
              key={option}
              label={option}
              status={statusFor(index)}
              disabled={feedback !== 'choosing'}
              onPress={() => choose(index)}
              onShakeEnd={() => setFeedback('revealed')}
            />
          ))}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        {feedback === 'revealed' && selected !== null && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.footerContent}>
            <Text style={styles.hint}>
              Not quite. The answer was <Text style={styles.hintAnswer}>{question.options[question.answerIndex]}</Text>.
            </Text>
            <Button label={isLast ? 'See my score' : 'Next question'} onPress={() => advance(selected)} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 72 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progress: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  chip: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  body: { flex: 1, justifyContent: 'center', gap: 32 },
  prompt: { color: colors.text, fontSize: 26, fontWeight: '800', lineHeight: 32 },
  options: { gap: 12 },
  // Fixed height so the options don't jump when the Next button appears.
  footer: { minHeight: 110, justifyContent: 'flex-end' },
  footerContent: { gap: 14 },
  hint: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
  hintAnswer: { color: colors.correct, fontWeight: '700' },
});
