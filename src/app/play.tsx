import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelUpScreen } from '@/components/LevelUpScreen';
import { MemoriseStage } from '@/components/MemoriseStage';
import { PeekView } from '@/components/PeekView';
import { QuitButton } from '@/components/QuitButton';
import { SoundToggle } from '@/components/SoundToggle';
import { QuizStage } from '@/components/QuizStage';
import { ResultStage } from '@/components/ResultStage';
import { isPlayMode } from '@/game/difficulty';
import { dailyResultOn, streakOf, type Streak } from '@/games/lookRemember/daily';
import { loadProgress } from '@/hooks/useGameProgress';
import { statsStore } from '@/stats';
import { useGameSession, type SessionStart } from '@/hooks/useGameSession';
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
  const [start, setStart] = useState<(SessionStart & { streak: Streak }) | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all([loadProgress('look-remember'), statsStore.listResults()]).then(([progress, all]) => {
      if (!live) return;
      // One Daily Challenge a day.
      if (mode === 'daily' && dailyResultOn(all)) return goBack();
      setStart({ mode, ladder: progress.ladder, highScore: progress.highScore, peeks: progress.peeks, streak: streakOf(all) });
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

function Game({ start }: { start: SessionStart & { streak: Streak } }) {
  const { stage, round, phase, answers, score, outcome, ladder, wallet, peeked, peek, finishMemorising, answer, playAgain, nextPicture } =
    useGameSession(start);
  // A Peek shows the picture again over the question for a few seconds.
  const [peeking, setPeeking] = useState(false);
  // The level-up screen shows once per level gained, before the round's results.
  const [celebrated, setCelebrated] = useState<string | null>(null);
  const levelUpKey = outcome?.ladder && outcome.ladder.after.level > outcome.ladder.before.level ? `${round.index}` : null;
  const showLevelUp = phase === 'result' && levelUpKey !== null && celebrated !== levelUpKey;
  // The first round today extends the streak (or starts one); later rounds today keep it.
  const firstToday = !start.streak.playedToday && round.index === 0;
  const streak = { days: start.streak.playedToday ? start.streak.current : start.streak.current + 1, isNew: firstToday };

  return (
    <View style={styles.container}>
      {phase === 'memorise' && (
        <MemoriseStage key={round.index} scene={stage.scene} seconds={round.viewSeconds} onDone={finishMemorising} onQuit={goBack} />
      )}

      {phase === 'quiz' && (
        <SafeAreaView style={styles.container}>
          <QuizStage
            key={round.index}
            questions={round.questions}
            answers={answers}
            onAnswer={answer}
            peek={
              start.mode === 'daily'
                ? undefined
                : {
                    left: wallet.peeks,
                    used: peeked,
                    onPeek: (i) => {
                      peek(i);
                      setPeeking(true);
                    },
                  }
            }
          />
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
            streak={streak}
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
          onClose={goBack}
        />
      )}

      {phase === 'quiz' && (
        <SafeAreaView style={styles.closeWrap} pointerEvents="box-none">
          <View style={styles.close}>
            <QuitButton onPress={goBack} />
            <SoundToggle />
          </View>
        </SafeAreaView>
      )}

      {phase === 'quiz' && peeking && <PeekView scene={stage.scene} onDone={() => setPeeking(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
  closeWrap: { position: 'absolute', top: 0, left: 0 },
  close: { margin: 16, flexDirection: 'row', gap: 10 },
});
