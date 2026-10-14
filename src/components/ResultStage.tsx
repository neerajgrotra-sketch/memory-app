import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, radius } from '@/theme';
import type { GameImage, RoundQuestion } from '@/types/game';

const MESSAGES = ['Keep looking!', 'A start!', 'Not bad!', 'Nice!', 'Sharp eyes!', 'Perfect recall!'];

interface ResultStageProps {
  image: GameImage;
  questions: RoundQuestion[];
  answers: number[];
  score: number;
  nextLevelLabel?: string;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function ResultStage({ image, questions, answers, score, nextLevelLabel, onPlayAgain, onHome }: ResultStageProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.message}>{MESSAGES[score] ?? MESSAGES[0]}</Text>
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

      <View style={styles.actions}>
        <Button label="Play again" onPress={onPlayAgain} />
        {nextLevelLabel && <Text style={styles.next}>Next round: {nextLevelLabel}</Text>}
        <Button label="Home" variant="secondary" onPress={onHome} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 72, paddingBottom: 48, gap: 20 },
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
  actions: { gap: 12 },
  next: { color: colors.textMuted, textAlign: 'center', fontSize: 14 },
});
