import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

import { AnswerOption, type OptionStatus } from '@/components/AnswerOption';
import { Button } from '@/components/Button';
import { nextUnanswered, unansweredCount, type Answers } from '@/game/quizNavigation';
import { colors, radius } from '@/theme';
import type { QuestionType, RoundQuestion } from '@/types/game';

/** How long a correct answer stays green before moving on by itself. */
const CORRECT_ADVANCE_MS = 700;

const TYPE_LABELS: Record<QuestionType, string> = {
  object: 'Object',
  count: 'Count',
  colour: 'Colour',
  position: 'Position',
  number: 'Number',
};

/**
 * choosing → (right) correct → auto-advance
 *          → (wrong) shaking → revealed → player taps Next
 */
type Feedback = 'choosing' | 'correct' | 'shaking' | 'revealed';

interface QuizStageProps {
  questions: RoundQuestion[];
  /** One entry per question: the chosen option, or null while unanswered. */
  answers: Answers;
  onAnswer: (questionIndex: number, optionIndex: number) => void;
}

/**
 * Questions can be skipped and come back round once the end is reached; the dots show every
 * question (answered, skipped, current) and jump to any unanswered one.
 */
export function QuizStage({ questions, answers, onAnswer }: QuizStageProps) {
  const [current, setCurrent] = useState(0);
  const [skipped, setSkipped] = useState<ReadonlySet<number>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>('choosing');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const question = questions[current];
  if (!question) return null;

  const left = unansweredCount(answers);
  const canSkip = feedback === 'choosing' && left > 1;

  /** Moves to another question. Leaving one unanswered (Skip or a dot) marks it as skipped. */
  const goTo = (index: number, leavingUnanswered = false) => {
    if (leavingUnanswered) setSkipped(new Set(skipped).add(current));
    setSelected(null);
    setFeedback('choosing');
    setCurrent(index);
  };

  /** Records the answer, then moves to the next unanswered question (the hook ends the round after the last). */
  const commit = (option: number) => {
    const after = answers.map((a, i) => (i === current ? option : a));
    const next = nextUnanswered(after, current);
    onAnswer(current, option);
    if (next !== null) goTo(next);
  };

  const choose = (index: number) => {
    if (feedback !== 'choosing') return;
    setSelected(index);
    if (index === question.answerIndex) {
      setFeedback('correct');
      timer.current = setTimeout(() => commit(index), CORRECT_ADVANCE_MS);
    } else {
      setFeedback('shaking');
    }
  };

  const skip = () => {
    const next = nextUnanswered(answers, current);
    if (!canSkip || next === null) return;
    goTo(next, true);
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
      {/* Scrolls on short screens instead of letting the question spill over the header. */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.progress}>
            Question {current + 1} of {questions.length}
          </Text>
          <Text style={styles.chip}>{TYPE_LABELS[question.type]}</Text>
        </View>

        <View style={styles.dots}>
          {questions.map((q, i) => {
            const answered = answers[i] !== null;
            const isCurrent = i === current;
            const wasSkipped = !answered && skipped.has(i);
            const label = answered ? 'answered' : isCurrent ? 'current' : wasSkipped ? 'skipped' : 'not answered yet';
            return (
              <Pressable
                key={q.id}
                accessibilityRole="button"
                accessibilityLabel={`Question ${i + 1}, ${label}`}
                disabled={answered || isCurrent || feedback !== 'choosing'}
                onPress={() => goTo(i, true)}
                hitSlop={6}
                style={[
                  styles.dot,
                  answered && styles.dotAnswered,
                  wasSkipped && styles.dotSkipped,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                <Text style={[styles.dotText, answered && styles.dotTextAnswered]}>{i + 1}</Text>
              </Pressable>
            );
          })}
        </View>

        <Animated.View key={question.id} entering={FadeInRight.duration(250)} style={styles.body}>
          {skipped.has(current) && <Text style={styles.skippedNote}>You skipped this one</Text>}
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
      </ScrollView>

      <View style={styles.footer}>
        {feedback === 'revealed' && selected !== null ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.footerContent}>
            <Text style={styles.hint}>
              Not quite. The answer was <Text style={styles.hintAnswer}>{question.options[question.answerIndex]}</Text>.
            </Text>
            <Button label={left === 1 ? 'See my score' : 'Next question'} onPress={() => commit(selected)} />
          </Animated.View>
        ) : (
          canSkip && <Button label="Skip for now" variant="secondary" onPress={skip} accessibilityHint="Come back to it later" />
        )}
      </View>
    </View>
  );
}

const DOT = 30;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16, gap: 20 },
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
  dots: { flexDirection: 'row', gap: 10 },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotAnswered: { backgroundColor: colors.accent, borderColor: colors.accent },
  dotSkipped: { borderColor: colors.accent, borderStyle: 'dashed' },
  dotCurrent: { borderColor: colors.text, borderStyle: 'solid' },
  dotText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  dotTextAnswered: { color: colors.accentText },
  // flexGrow (not flex) so the body can grow to centre itself but never shrink below its content.
  body: { flexGrow: 1, justifyContent: 'center', gap: 20 },
  skippedNote: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  prompt: { color: colors.text, fontSize: 24, fontWeight: '800', lineHeight: 30 },
  options: { gap: 12 },
  // Fixed height so the options don't jump when the buttons change.
  footer: { minHeight: 110, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 16 },
  footerContent: { gap: 14 },
  hint: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
  hintAnswer: { color: colors.correct, fontWeight: '700' },
});
