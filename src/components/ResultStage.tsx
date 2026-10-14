import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { randomScoreMessage } from '@/game/scoreMessages';
import { colors, radius } from '@/theme';
import type { GameImage, RoundQuestion } from '@/types/game';

interface ResultStageProps {
  image: GameImage;
  questions: RoundQuestion[];
  answers: number[];
  score: number;
  nextLevelLabel?: string;
  onPlayAgain: () => void;
  /** Omitted when there is no other picture to move on to. */
  onNextPicture?: () => void;
  onHome: () => void;
}

export function ResultStage({ image, questions, answers, score, nextLevelLabel, onPlayAgain, onNextPicture, onHome }: ResultStageProps) {
  // Picked once per result screen so it doesn't change on re-render.
  const [message] = useState(() => randomScoreMessage(score));

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.score}>
          {score}
          <Text style={styles.outOf}> / {questions.length}</Text>
        </Text>

        <Image source={image.source} style={styles.thumb} contentFit="cover" accessibilityLabel={image.title} />

        <View style={styles.review}>
          {questions.map((question, i) => {
            const correct = answers[i] === question.answerIndex;
            return (
              <View key={question.id} style={styles.reviewRow}>
                <Text style={[styles.mark, { color: correct ? colors.correct : colors.wrong }]}>{correct ? '✓' : '✗'}</Text>
                <View style={styles.reviewText}>
                  <Text style={styles.reviewPrompt}>{question.prompt}</Text>
                  <Text style={styles.reviewAnswer}>{question.options[question.answerIndex]}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Pinned to the bottom so the next step is always visible without scrolling. */}
      <View style={styles.actions}>
        {nextLevelLabel && <Text style={styles.next}>Next round: {nextLevelLabel}</Text>}
        {onNextPicture && <Button label="Next picture" onPress={onNextPicture} />}
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Button
              label="Play again"
              variant={onNextPicture ? 'secondary' : 'primary'}
              onPress={onPlayAgain}
              accessibilityHint="Same picture, different questions"
            />
          </View>
          <View style={styles.rowItem}>
            <Button label="Home" variant="secondary" onPress={onHome} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: 24, paddingTop: 72, paddingBottom: 24, gap: 20 },
  message: { color: colors.textMuted, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  score: { color: colors.text, fontSize: 72, fontWeight: '900', textAlign: 'center' },
  outOf: { color: colors.textMuted, fontSize: 36, fontWeight: '700' },
  thumb: { alignSelf: 'center', width: 120, height: 180, borderRadius: radius.sm },
  review: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 14 },
  reviewRow: { flexDirection: 'row', gap: 12 },
  mark: { fontSize: 18, fontWeight: '800', width: 18 },
  reviewText: { flex: 1, gap: 2 },
  reviewPrompt: { color: colors.textMuted, fontSize: 14 },
  reviewAnswer: { color: colors.text, fontSize: 16, fontWeight: '600' },
  actions: {
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  next: { color: colors.textMuted, textAlign: 'center', fontSize: 14 },
});
