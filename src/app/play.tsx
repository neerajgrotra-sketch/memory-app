import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelUpScreen } from '@/components/LevelUpScreen';
import { MemoriseStage } from '@/components/MemoriseStage';
import { QuitButton } from '@/components/QuitButton';
import { QuizStage } from '@/components/QuizStage';
import { ResultStage } from '@/components/ResultStage';
import { isPlayMode } from '@/game/difficulty';
import { progressOf } from '@/hooks/useGameProgress';
import { useGameSession, type SessionStart } from '@/hooks/useGameSession';
import { statsStore } from '@/stats';
import { colors } from '@/theme';
import type { PlayMode } from '@/types/game';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function PlayScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode: PlayMode = isPlayMode(params.mode) ? params.mode : 'levels';
  // Your level and high score come from saved rounds, so wait for them before the first picture.
  const [start, setStart] = useState<SessionStart | null>(null);
  useEffect(() => {
    let live = true;
    statsStore.listResults().then((all) => {
      const progress = progressOf(all, 'look-remember');
      if (live) setStart({ mode, ladder: progress.ladder, highScore: progress.highScore });
    });
    return () => {
      live = false;
    };
  }, [mode]);

  if (!start) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }
  return <Game key={mode} start={start} />;
}

function Game({ start }: { start: SessionStart }) {
  const { stage, round, phase, answers, score, outcome, ladder, finishMemorising, answer, playAgain, nextPicture } =
    useGameSession(start);
  // The level-up screen shows once per level gained, before the round's results.
  const [celebrated, setCelebrated] = useState<string | null>(null);
  const levelUpKey = outcome?.ladder && outcome.ladder.after.level > outcome.ladder.before.level ? `${round.index}` : null;
  const showLevelUp = phase === 'result' && levelUpKey !== null && celebrated !== levelUpKey;

  return (
    <View style={styles.container}>
      {phase === 'memorise' && (
        <MemoriseStage key={round.index} scene={stage.scene} seconds={round.viewSeconds} onDone={finishMemorising} onQuit={goBack} />
      )}

      {phase === 'quiz' && (
        <SafeAreaView style={styles.container}>
          <QuizStage key={round.index} questions={round.questions} answers={answers} onAnswer={answer} />
        </SafeAreaView>
      )}

      {phase === 'result' && outcome && !showLevelUp && (
        <SafeAreaView style={styles.container}>
          <ResultStage
            scene={stage.scene}
            title={stage.title}
            questions={round.questions}
            answers={answers}
            score={score}
            mode={start.mode}
            outcome={outcome}
            nextLevel={ladder.level}
            onPlayAgain={playAgain}
            onNextPicture={nextPicture}
            onHome={goBack}
          />
        </SafeAreaView>
      )}

      {showLevelUp && outcome?.ladder && (
        <LevelUpScreen
          level={outcome.ladder.after.level}
          onPlay={() => {
            setCelebrated(levelUpKey);
            nextPicture();
          }}
          onContinue={() => setCelebrated(levelUpKey)}
        />
      )}

      {phase === 'quiz' && (
        <SafeAreaView style={styles.closeWrap} pointerEvents="box-none">
          <View style={styles.close}>
            <QuitButton onPress={goBack} />
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
  closeWrap: { position: 'absolute', top: 0, left: 0 },
  close: { margin: 16 },
});
