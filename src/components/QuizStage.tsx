import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

import { AnswerOption, type OptionStatus } from '@/components/AnswerOption';
import { Button } from '@/components/Button';
import { feedback as playFeedback } from '@/feedback';
import { fiftyHidden } from '@/games/lookRemember/peeks';
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
  /** Peeks (left out in the Daily Challenge, which has none). */
  peek?: {
    /** Peeks held. */
    left: number;
    /** The questions already peeked at this round. */
    used: number[];
    /** Tester mode: peek on any question, any number of times. */
    unlimited?: boolean;
    onPeek: (questionIndex: number) => void;
  };
  /** 50:50s, won in a Super Speed Round: shown only while you hold one or have used one this round. */
  fifty?: {
    left: number;
    /** The question it was used on this round. */
    used: number[];
    onFifty: (questionIndex: number) => void;
  };
}

/**
 * Questions can be skipped and come back round once the end is reached; the dots show every
 * question (answered, skipped, current) and jump to any unanswered one.
 */
export function QuizStage({ questions, answers, onAnswer, peek, fifty }: QuizStageProps) {
  // A resumed round starts at its first unanswered question.
  const [current, setCurrent] = useState(() => Math.max(0, answers.indexOf(null)));
  const [skipped, setSkipped] = useState<ReadonlySet<number>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>('choosing');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const question = questions[current];
  if (!question) return null;

  const left = unansweredCount(answers);
  // The wrong options a 50:50 took away from this question.
  const hidden = fifty?.used.includes(current) ? fiftyHidden(question) : [];
  const showFifty = fifty && (fifty.left > 0 || fifty.used.length > 0);
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
      playFeedback('correct');
      setFeedback('correct');
      timer.current = setTimeout(() => commit(index), CORRECT_ADVANCE_MS);
    } else {
      playFeedback('wrong');
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
          <View style={styles.headerRight}>
            {peek && <PeekButton {...peek} current={current} choosing={feedback === 'choosing'} />}
            {showFifty ? (
              <FiftyButton {...fifty} current={current} choosing={feedback === 'choosing'} possible={fiftyHidden(question).length > 0} />
            ) : (
              // No room for the type as well as two lifelines on a small phone.
              <Text style={styles.chip}>{TYPE_LABELS[question.type]}</Text>
            )}
          </View>
        </View>

        <View style={styles.dots}>
          {questions.map((q, i) => {
            const answered = answers[i] !== null;
            const right = answered && answers[i] === q.answerIndex;
            const isCurrent = i === current;
            const wasSkipped = !answered && skipped.has(i);
            const label = answered ? (right ? 'right' : 'wrong') : isCurrent ? 'current' : wasSkipped ? 'skipped' : 'not answered yet';
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
                  answered && (right ? styles.dotRight : styles.dotWrong),
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
            {question.options.map((option, index) =>
              hidden.includes(index) ? null : (
              <AnswerOption
                key={option}
                label={option}
                status={statusFor(index)}
                disabled={feedback !== 'choosing'}
                onPress={() => choose(index)}
                onShakeEnd={() => setFeedback('revealed')}
              />
              ),
            )}
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

/** A second look at the picture: one per round, while choosing. Shows how many you hold. */
function PeekButton({ left, used, unlimited, onPeek, current, choosing }: NonNullable<QuizStageProps['peek']> & { current: number; choosing: boolean }) {
  const spent = used.length > 0 && !unlimited;
  const enabled = !spent && (unlimited || left > 0) && choosing;
  const label = unlimited ? 'Peek · ∞' : spent ? (used.includes(current) ? 'Peeked' : 'Peek used') : `Peek · ${left}`;
  const hint =
    unlimited ? 'Tester mode: unlimited Peeks' : spent ? 'One peek per round' : left > 0 ? `See the picture again for a few seconds. Half points for this question. ${left} left.` : 'No peeks left. Points earn more.';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={() => onPeek(current)}
      hitSlop={8}
      style={({ pressed }) => [styles.peek, !enabled && styles.peekOff, pressed && styles.peekPressed]}
    >
      <Text style={[styles.peekText, !enabled && styles.peekTextOff]}>👀 {label}</Text>
    </Pressable>
  );
}

/** Takes away two wrong answers (one when there are three): one per round, half points for that answer. */
function FiftyButton({ left, used, onFifty, current, choosing, possible }: NonNullable<QuizStageProps['fifty']> & { current: number; choosing: boolean; possible: boolean }) {
  const spent = used.length > 0;
  const enabled = !spent && left > 0 && choosing && possible;
  const label = spent ? '50:50 used' : `50:50 · ${left}`;
  const hint = spent ? 'One 50:50 per round' : !possible ? 'Not on a question with two answers' : 'Takes away two wrong answers. Half points for this question.';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={() => onFifty(current)}
      hitSlop={8}
      style={({ pressed }) => [styles.peek, styles.fifty, !enabled && styles.peekOff, pressed && styles.peekPressed]}
    >
      <Text style={[styles.peekText, styles.fiftyText, !enabled && styles.peekTextOff]}>{label}</Text>
    </Pressable>
  );
}

const DOT = 30;

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  // Starts below the quit and sound buttons (16 margin + 44), so nothing scrolls underneath them.
  scroll: { flex: 1, marginTop: 60 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 16, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  peek: {
    minHeight: 32,
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
  },
  peekOff: { backgroundColor: colors.surface },
  fifty: { backgroundColor: colors.speed },
  fiftyText: { color: colors.text },
  peekPressed: { opacity: 0.7 },
  peekText: { color: colors.accentText, fontSize: 13, fontWeight: '800' },
  peekTextOff: { color: colors.textMuted },
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
  // Green for right, red for wrong, so the score so far shows at a glance.
  dotRight: { backgroundColor: colors.correct, borderColor: colors.correct },
  dotWrong: { backgroundColor: colors.wrong, borderColor: colors.wrong },
  dotSkipped: { borderColor: colors.accent, borderStyle: 'dashed' },
  dotCurrent: { borderColor: colors.text, borderStyle: 'solid' },
  dotText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  dotTextAnswered: { color: colors.background },
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
