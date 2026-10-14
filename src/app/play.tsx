import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { MemoriseStage } from '@/components/MemoriseStage';
import { QuizStage } from '@/components/QuizStage';
import { ResultStage } from '@/components/ResultStage';
import { DIFFICULTY_OPTIONS, isDifficulty, levelForRound } from '@/game/difficulty';
import { useGameSession } from '@/hooks/useGameSession';
import { colors } from '@/theme';

function goHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function PlayScreen() {
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const difficulty = isDifficulty(params.difficulty) ? params.difficulty : 'medium';
  const { image, round, phase, answers, score, error, finishMemorising, answer, playAgain } =
    useGameSession(difficulty);

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Button label="Back" variant="secondary" onPress={goHome} />
      </SafeAreaView>
    );
  }

  if (!image || !round) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const nextLevel = levelForRound(difficulty, round.index + 1);
  const nextLevelLabel =
    difficulty === 'progressive' ? DIFFICULTY_OPTIONS.find((option) => option.value === nextLevel)?.label : undefined;

  return (
    <View style={styles.container}>
      {phase === 'memorise' && <MemoriseStage key={round.index} image={image} onDone={finishMemorising} />}

      {phase === 'quiz' && (
        <SafeAreaView style={styles.container}>
          <QuizStage questions={round.questions} answeredCount={answers.length} onAnswer={answer} />
        </SafeAreaView>
      )}

      {phase === 'result' && (
        <SafeAreaView style={styles.container}>
          <ResultStage
            image={image}
            questions={round.questions}
            answers={answers}
            score={score}
            nextLevelLabel={nextLevelLabel}
            onPlayAgain={playAgain}
            onHome={goHome}
          />
        </SafeAreaView>
      )}

      {phase !== 'result' && (
        <SafeAreaView style={styles.closeWrap} pointerEvents="box-none">
          <Pressable accessibilityRole="button" accessibilityLabel="Quit" onPress={goHome} hitSlop={12} style={styles.close}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
    backgroundColor: colors.background,
  },
  error: { color: colors.text, fontSize: 17, textAlign: 'center' },
  closeWrap: { position: 'absolute', top: 0, left: 0 },
  close: {
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,17,21,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.text, fontSize: 18, fontWeight: '700' },
});
