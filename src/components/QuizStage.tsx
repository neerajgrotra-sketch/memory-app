import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { colors, radius } from '@/theme';
import type { QuestionType, RoundQuestion } from '@/types/game';

const FEEDBACK_MS = 700;

const TYPE_LABELS: Record<QuestionType, string> = {
  object: 'Object',
  count: 'Count',
  colour: 'Colour',
  position: 'Position',
};

interface QuizStageProps {
  questions: RoundQuestion[];
  /** Number of questions already answered, i.e. the index of the current one. */
  answeredCount: number;
  onAnswer: (optionIndex: number) => void;
}

export function QuizStage({ questions, answeredCount, onAnswer }: QuizStageProps) {
  const question = questions[answeredCount];
  const [selected, setSelected] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!question) return null;

  const choose = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    timer.current = setTimeout(() => {
      setSelected(null);
      onAnswer(index);
    }, FEEDBACK_MS);
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
          {question.options.map((option, index) => {
            const revealed = selected !== null;
            const isAnswer = index === question.answerIndex;
            const isSelected = index === selected;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                disabled={revealed}
                onPress={() => choose(index)}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                  revealed && isAnswer && styles.optionCorrect,
                  revealed && isSelected && !isAnswer && styles.optionWrong,
                ]}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
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
  option: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  optionPressed: { backgroundColor: colors.surfaceRaised },
  optionCorrect: { borderColor: colors.correct, backgroundColor: 'rgba(46,194,126,0.15)' },
  optionWrong: { borderColor: colors.wrong, backgroundColor: 'rgba(229,72,77,0.15)' },
  optionText: { color: colors.text, fontSize: 18, fontWeight: '600' },
});
