import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { PictureViewer } from '@/components/PictureViewer';
import { ProfilePrompt } from '@/components/ProfilePrompt';
import type { Answers } from '@/game/quizNavigation';
import { randomScoreMessage } from '@/game/scoreMessages';
import { colors, radius } from '@/theme';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';
import type { RoundQuestion } from '@/types/game';

interface ResultStageProps {
  scene: SceneSpec;
  title: string;
  questions: RoundQuestion[];
  answers: Answers;
  score: number;
  nextLevelLabel?: string;
  onPlayAgain: () => void;
  onNextPicture: () => void;
  onHome: () => void;
}

export function ResultStage({ scene, title, questions, answers, score, nextLevelLabel, onPlayAgain, onNextPicture, onHome }: ResultStageProps) {
  // Picked once per result screen so it doesn't change on re-render.
  const [message] = useState(() => randomScoreMessage(score));
  const [enlarged, setEnlarged] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.score}>
          {score}
          <Text style={styles.outOf}> / {questions.length}</Text>
        </Text>

        <ProfilePrompt />

        {/* Tap the picture to see it full size and check the answers against it. */}
        <Pressable
          onPress={() => setEnlarged(true)}
          accessibilityRole="button"
          accessibilityLabel={`${title}. Show the picture full size`}
          style={styles.thumbWrap}
        >
          <View style={[styles.thumb, { height: THUMB_WIDTH * (scene.size.height / scene.size.width) }]}>
            <SceneView spec={scene} />
          </View>
          <Text style={styles.thumbHint}>Tap to enlarge</Text>
        </Pressable>

        <View style={styles.review}>
          {questions.map((question, i) => {
            const chosen = answers[i];
            const correct = chosen === question.answerIndex;
            const answer = question.options[question.answerIndex];
            return (
              <View
                key={question.id}
                style={styles.reviewRow}
                accessible
                accessibilityLabel={
                  correct
                    ? `${question.prompt} Right: ${answer}.`
                    : `${question.prompt} Wrong. You said ${chosen === null ? 'nothing' : question.options[chosen]}. The answer was ${answer}.`
                }
                accessibilityHint={`The options were ${question.options.join(', ')}.`}
              >
                {/* Drawn badges, so the marks look the same on every device and font. */}
                <View style={[styles.badge, { backgroundColor: correct ? colors.correct : colors.wrong }]}>
                  <Text style={styles.badgeText}>{correct ? '✓' : '✕'}</Text>
                </View>
                <View style={styles.reviewText}>
                  <Text style={styles.reviewPrompt}>{question.prompt}</Text>
                  {/* Every option, so you can see what you chose between: the answer in green, your wrong pick in red. */}
                  <View style={styles.options}>
                    {question.options.map((option, o) => {
                      const isAnswer = o === question.answerIndex;
                      const isWrongPick = o === chosen && !correct;
                      return (
                        <View key={option} style={[styles.option, isAnswer && styles.optionAnswer, isWrongPick && styles.optionWrong]}>
                          <Text
                            style={[
                              styles.optionText,
                              isAnswer && styles.optionAnswerText,
                              isWrongPick && styles.optionWrongText,
                            ]}
                          >
                            {isAnswer ? '✓ ' : isWrongPick ? '✕ ' : ''}
                            {option}
                          </Text>
                          {isWrongPick && <Text style={styles.yourPick}>your answer</Text>}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <PictureViewer scene={scene} title={title} visible={enlarged} onClose={() => setEnlarged(false)} />

      {/* Pinned to the bottom so the next step is always visible without scrolling. */}
      <View style={styles.actions}>
        {nextLevelLabel && <Text style={styles.next}>Next round: {nextLevelLabel}</Text>}
        <Button label="Next picture" onPress={onNextPicture} />
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Button
              label="Play again"
              variant="secondary"
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

const THUMB_WIDTH = 130;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: 24, paddingTop: 72, paddingBottom: 24, gap: 20 },
  message: { color: colors.textMuted, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  score: { color: colors.text, fontSize: 72, fontWeight: '900', textAlign: 'center' },
  outOf: { color: colors.textMuted, fontSize: 36, fontWeight: '700' },
  thumbWrap: { alignSelf: 'center', alignItems: 'center', gap: 6 },
  thumb: { width: THUMB_WIDTH, borderRadius: radius.sm, overflow: 'hidden' },
  thumbHint: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  review: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 14 },
  reviewRow: { flexDirection: 'row', gap: 12 },
  badge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  badgeText: { color: colors.background, fontSize: 13, fontWeight: '900', lineHeight: 16 },
  reviewText: { flex: 1, gap: 2 },
  reviewPrompt: { color: colors.textMuted, fontSize: 14 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  option: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  optionAnswer: { borderColor: colors.correct, backgroundColor: '#163d2c' },
  optionWrong: { borderColor: colors.wrong, backgroundColor: '#3d1a1c' },
  optionText: { color: colors.textMuted, fontSize: 14 },
  optionAnswerText: { color: colors.correct, fontWeight: '700' },
  optionWrongText: { color: colors.wrong, fontWeight: '600', textDecorationLine: 'line-through' },
  yourPick: { color: colors.wrong, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
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
