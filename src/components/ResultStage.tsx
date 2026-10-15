import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { LevelRing } from '@/components/LevelRing';
import { PictureViewer } from '@/components/PictureViewer';
import { ProfilePrompt } from '@/components/ProfilePrompt';
import type { Answers } from '@/game/quizNavigation';
import { randomScoreMessage } from '@/game/scoreMessages';
import { MAX_LEVEL, ROUNDS_TO_LEVEL_UP, isGoodRound, isPoorRound, type LadderState } from '@/games/lookRemember/ladder';
import { formatPoints } from '@/games/lookRemember/points';
import type { RoundOutcome } from '@/hooks/useGameSession';
import { colors, radius } from '@/theme';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';
import type { PlayMode, RoundQuestion } from '@/types/game';

interface ResultStageProps {
  scene: SceneSpec;
  title: string;
  questions: RoundQuestion[];
  answers: Answers;
  score: number;
  mode: PlayMode;
  outcome: RoundOutcome;
  /** Your level for the next picture. */
  nextLevel: number;
  /** Same picture, other questions (Practice only). */
  onPlayAgain?: () => void;
  onNextPicture: () => void;
  onHome: () => void;
}

export function ResultStage({ scene, title, questions, answers, score, mode, outcome, nextLevel, onPlayAgain, onNextPicture, onHome }: ResultStageProps) {
  // Picked once per result screen so it doesn't change on re-render.
  const [message] = useState(() => randomScoreMessage(score));
  const [enlarged, setEnlarged] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.message}>{message}</Text>
        <View style={styles.pointsBlock} accessible accessibilityLabel={`${outcome.points.total} points. ${score} out of ${questions.length} right.`}>
          {outcome.newHighScore && <Text style={styles.highScore}>New high score!</Text>}
          <Text style={styles.points}>{formatPoints(outcome.points.total)}</Text>
          <Text style={styles.pointsLabel}>
            points · {score} of {questions.length} right
          </Text>
        </View>
        <View style={styles.breakdown}>
          <Chip label={`${score} × ${outcome.points.perAnswer}`} value={outcome.points.answers} />
          {outcome.points.streak > 0 && <Chip label="In a row" value={outcome.points.streak} />}
          {outcome.points.ready > 0 && <Chip label="Ready early" value={outcome.points.ready} />}
        </View>

        {outcome.ladder ? (
          <LevelPanel before={outcome.ladder.before} after={outcome.ladder.after} score={score} total={questions.length} />
        ) : (
          <Text style={styles.practice}>Practice round · your level stays the same</Text>
        )}

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
        <Button label={mode === 'levels' ? `Next picture · Level ${nextLevel}` : 'Next picture'} onPress={onNextPicture} />
        <View style={styles.row}>
          {onPlayAgain && (
            <View style={styles.rowItem}>
              <Button label="Play again" variant="secondary" onPress={onPlayAgain} accessibilityHint="Same picture, different questions" />
            </View>
          )}
          <View style={styles.rowItem}>
            <Button label="Done" variant="secondary" onPress={onHome} />
          </View>
        </View>
      </View>
    </View>
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>+{formatPoints(value)}</Text>
    </View>
  );
}

/** How the round moved your level, in kind words. Best level is never shown going down. */
function LevelPanel({ before, after, score, total }: { before: LadderState; after: LadderState; score: number; total: number }) {
  let line: string;
  if (after.level > before.level) line = `Level ${after.level} reached!`;
  else if (after.level < before.level) line = `Back to Level ${after.level} for now. Take your time looking, you’ll climb back.`;
  else if (after.level >= MAX_LEVEL && isGoodRound(score, total)) line = 'Top level, and still on top.';
  else if (isGoodRound(score, total)) {
    const left = ROUNDS_TO_LEVEL_UP - after.progress;
    line = `Good round! ${left} more to Level ${after.level + 1}.`;
  } else if (isPoorRound(score)) line = 'A tricky one. Shake it off, the next picture is new.';
  else line = `Rounds with ${total - 1} or ${total} right move you up.`;
  return (
    <View style={styles.levelPanel}>
      <LevelRing ladder={after} size={64} />
      <Text style={styles.levelLine}>{line}</Text>
    </View>
  );
}

const THUMB_WIDTH = 130;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: 24, paddingTop: 72, paddingBottom: 24, gap: 20 },
  message: { color: colors.textMuted, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  pointsBlock: { alignItems: 'center', gap: 2 },
  highScore: { color: colors.accentText, backgroundColor: colors.accent, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, overflow: 'hidden', marginBottom: 6 },
  points: { color: colors.text, fontSize: 60, fontWeight: '900', fontVariant: ['tabular-nums'] },
  pointsLabel: { color: colors.textMuted, fontSize: 16, fontWeight: '600' },
  breakdown: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: -6 },
  chip: { flexDirection: 'row', gap: 6, alignItems: 'baseline', backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chipLabel: { color: colors.textMuted, fontSize: 13 },
  chipValue: { color: colors.accent, fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] },
  levelPanel: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14 },
  levelLine: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  practice: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
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
});
