import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoriseStage } from '@/components/MemoriseStage';
import { QuitButton } from '@/components/QuitButton';
import { QuizStage } from '@/components/QuizStage';
import { ResultStage } from '@/components/ResultStage';
import { DIFFICULTY_OPTIONS, isDifficulty, levelForRound } from '@/game/difficulty';
import { useGameSession } from '@/hooks/useGameSession';
import { colors } from '@/theme';
import type { Difficulty } from '@/types/game';

function goHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function PlayScreen() {
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const difficulty = isDifficulty(params.difficulty) ? params.difficulty : 'medium';
  return <Game key={difficulty} difficulty={difficulty} />;
}

function Game({ difficulty }: { difficulty: Difficulty }) {
  const { stage, round, phase, answers, score, finishMemorising, answer, playAgain, nextPicture } =
    useGameSession(difficulty);

  const nextLevel = levelForRound(difficulty, round.index + 1);
  const nextLevelLabel =
    difficulty === 'progressive' ? DIFFICULTY_OPTIONS.find((option) => option.value === nextLevel)?.label : undefined;

  return (
    <View style={styles.container}>
      {phase === 'memorise' && (
        <MemoriseStage
          key={round.index}
          scene={stage.scene}
          seconds={round.viewSeconds}
          onDone={finishMemorising}
          onQuit={goHome}
        />
      )}

      {phase === 'quiz' && (
        <SafeAreaView style={styles.container}>
          <QuizStage key={round.index} questions={round.questions} answers={answers} onAnswer={answer} />
        </SafeAreaView>
      )}

      {phase === 'result' && (
        <SafeAreaView style={styles.container}>
          <ResultStage
            scene={stage.scene}
            title={stage.title}
            questions={round.questions}
            answers={answers}
            score={score}
            nextLevelLabel={nextLevelLabel}
            onPlayAgain={playAgain}
            onNextPicture={nextPicture}
            onHome={goHome}
          />
        </SafeAreaView>
      )}

      {phase === 'quiz' && (
        <SafeAreaView style={styles.closeWrap} pointerEvents="box-none">
          <View style={styles.close}>
            <QuitButton onPress={goHome} />
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  closeWrap: { position: 'absolute', top: 0, left: 0 },
  close: { margin: 16 },
});
