import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LevelUpScreen } from '@/components/LevelUpScreen';
import { MemoriseStage } from '@/components/MemoriseStage';
import { PeekView } from '@/components/PeekView';
import { QuitButton } from '@/components/QuitButton';
import { SoundToggle } from '@/components/SoundToggle';
import { SpeedRound } from '@/components/SpeedRound';
import { feedback } from '@/feedback';
import { QuizStage } from '@/components/QuizStage';
import { ResultStage } from '@/components/ResultStage';
import { isPlayMode } from '@/game/difficulty';
import { dailyResultOn, streakOf, type Streak } from '@/games/lookRemember/daily';
import { peekSecondsFor } from '@/games/lookRemember/peeks';
import { bossAt } from '@/games/lookRemember/boss';
import { speedCounterOf, speedDue, speedGap, type SpeedCounter } from '@/games/lookRemember/speed';
import { answeredOf, clearSavedRound, loadSavedRound, slotFor, type SavedRound } from '@/games/lookRemember/savedRound';
import { loadProgress } from '@/hooks/useGameProgress';
import { profileStore, useProfile } from '@/profile';
import { statsStore } from '@/stats';
import { useGameSession, type SessionStart, type SpeedRoundSetup } from '@/hooks/useGameSession';
import { colors, radius } from '@/theme';
import type { PlayMode } from '@/types/game';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function PlayScreen() {
  // `resume=1` (the Resume card on Home) goes straight back into the saved round, whatever its mode.
  // `speed=1` (tester mode's Speed Round button) opens with a Super Speed Round.
  // `place=farm` (Explore on the journey map) makes the first picture that place.
  const params = useLocalSearchParams<{ mode?: string; resume?: string; speed?: string; place?: string }>();
  const asked: PlayMode = isPlayMode(params.mode) ? params.mode : 'levels';
  // Your level and high score come from saved rounds, so wait for them before the first picture.
  const [start, setStart] = useState<(SessionStart & { streak: Streak; speed: SpeedCounter; speedFirst?: boolean }) | null>(null);
  // A Levels or Practice round in progress when another one is started: resume it or start a new one?
  const [choice, setChoice] = useState<{ saved: SavedRound; begin: (resume?: SavedRound) => void } | null>(null);
  useEffect(() => {
    let live = true;
    // The saved profile says whether the guided first round has been played.
    Promise.all([loadProgress('look-remember'), statsStore.listResults(), loadSavedRound(slotFor(asked)), profileStore.load()]).then(([progress, all, saved, stored]) => {
      if (!live) return;
      const begin = (resume?: SavedRound) => {
        const mode = resume?.mode ?? asked;
        setChoice(null);
        setStart({
          mode,
          ladder: progress.ladder,
          highScore: progress.highScore,
          peeks: progress.peeks,
          fifty: progress.fifty,
          streak: streakOf(all),
          speed: speedCounterOf(progress.results),
          speedFirst: params.speed === '1' && !resume,
          place: resume ? undefined : params.place,
          resume,
        });
      };
      // A new player's first Levels round starts with the guided practice round (once; How to play replays it).
      if (asked === 'levels' && progress.plays === 0 && !saved && !stored?.guided && !params.place && params.speed !== '1') {
        return router.replace('/guided');
      }
      if (asked === 'daily') {
        // One Daily Challenge a day; one closed part way through carries on.
        if (dailyResultOn(all)) {
          clearSavedRound('daily');
          return goBack();
        }
        return begin(saved ?? undefined);
      }
      if (!saved) return begin();
      if (params.resume === '1') return begin(saved);
      setChoice({ saved, begin });
    });
    return () => {
      live = false;
    };
  }, [asked, params.resume, params.speed, params.place]);

  if (choice) {
    const { saved, begin } = choice;
    return (
      <SafeAreaView style={[styles.container, styles.loading, styles.choiceWrap]}>
        <View style={styles.choice}>
          <Text style={styles.choiceTitle}>You have a round in progress</Text>
          <Text style={styles.choiceText}>
            {saved.stage.title}: {answeredOf(saved)} of {saved.round.questions.length} answered. Resume it, or start a new round and lose it?
          </Text>
          <Button label="Resume round" onPress={() => begin(saved)} />
          <Button label="Start a new round" variant="secondary" onPress={() => begin()} />
        </View>
      </SafeAreaView>
    );
  }
  if (!start) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }
  return <Game key={start.mode} start={start} />;
}

function Game({ start }: { start: SessionStart & { streak: Streak; speed: SpeedCounter; speedFirst?: boolean } }) {
  const {
    stage,
    round,
    phase,
    answers,
    score,
    outcome,
    ladder,
    peeksLeft,
    peeked,
    unlimitedPeeks,
    peek,
    levelsRounds,
    fiftyLeft,
    fiftied,
    applyFifty,
    finishSpeed,
    skipSpeed,
    makeSpeedRound,
    finishMemorising,
    answer,
    playAgain,
    nextPicture,
  } = useGameSession(start);
  // The Super Speed Round: a surprise every 4 to 6 Levels rounds, before the next picture.
  // Counted from the start of the session, or from this session's last speed round (`levelsRounds` then).
  const [speedFrom, setSpeedFrom] = useState({ ...start.speed, at: 0 });
  const speedCount = { since: speedFrom.since + levelsRounds - speedFrom.at, gap: speedFrom.gap };
  const { profile } = useProfile();
  // Tester mode can bring a speed round before every picture, starting with the first.
  const testSpeed = profile?.tester === true && profile.testSpeed === true && start.mode !== 'daily';
  /** The speed round showing, and whether the picture after it is already dealt (the first one) or still to come. */
  const [speedRound, setSpeedRound] = useState<{ setup: SpeedRoundSetup; then: 'next' | 'first' } | null>(() => {
    const first = (testSpeed || (start.speedFirst && profile?.tester === true)) && !start.resume ? makeSpeedRound() : null;
    return first ? { setup: first, then: 'first' } : null;
  });
  /** The next picture, or a Super Speed Round first when one is due. */
  const next = () => {
    const due = testSpeed || (start.mode === 'levels' && speedDue(speedCount, ladder.level)) ? makeSpeedRound() : null;
    // The usual start sound, unless the speed round's lightning plays instead.
    if (due) setSpeedRound({ setup: due, then: 'next' });
    else {
      feedback('start');
      nextPicture();
    }
  };
  // A Peek shows the picture again over the question for a few seconds (a tester can change how many).
  const [peeking, setPeeking] = useState(false);
  // The level-up screen shows once per level gained, before the round's results.
  const [celebrated, setCelebrated] = useState<string | null>(null);
  const levelUpKey = outcome?.ladder && outcome.ladder.after.level > outcome.ladder.before.level ? `${round.index}` : null;
  const showLevelUp = phase === 'result' && levelUpKey !== null && celebrated !== levelUpKey;
  // The first round today extends the streak (or starts one); later rounds today keep it.
  const firstToday = !start.streak.playedToday && round.index === 0;
  const streak = { days: start.streak.playedToday ? start.streak.current : start.streak.current + 1, isNew: firstToday };
  // Leaving asks first when there's something to come back to: the questions, or today's Daily picture.
  const [leaving, setLeaving] = useState(false);
  const quit = () => (phase === 'quiz' || start.mode === 'daily' ? setLeaving(true) : goBack());

  if (speedRound) {
    return (
      <View style={styles.container}>
        <SpeedRound
          setup={speedRound.setup}
          moreTime={profile?.moreTime === true}
          onFinish={(right, looked) => {
            const prize = finishSpeed(speedRound.setup, right, looked);
            setSpeedFrom({ since: 0, gap: speedGap(prize.resultId), at: levelsRounds });
            return prize;
          }}
          onContinue={() => {
            setSpeedRound(null);
            if (speedRound.then === 'next') nextPicture();
          }}
          onSkip={() => {
            const id = skipSpeed(speedRound.setup);
            setSpeedFrom({ since: 0, gap: speedGap(id), at: levelsRounds });
            setSpeedRound(null);
            feedback('start');
            if (speedRound.then === 'next') nextPicture();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {phase === 'memorise' && (
        <MemoriseStage key={round.index} scene={stage.scene} seconds={round.viewSeconds} onDone={finishMemorising} onQuit={quit} />
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
                    left: peeksLeft,
                    used: peeked,
                    unlimited: unlimitedPeeks,
                    onPeek: (i) => {
                      peek(i);
                      setPeeking(true);
                    },
                  }
            }
            fifty={start.mode === 'daily' ? undefined : { left: fiftyLeft, used: fiftied, onFifty: applyFifty }}
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
            onNextPicture={next}
            onHome={goBack}
          />
        </SafeAreaView>
      )}

      {showLevelUp && outcome?.ladder && (
        <LevelUpScreen
          level={outcome.ladder.after.level}
          // On to the journey map, where the marker travels to the new level's stop.
          onPlay={() => {
            setCelebrated(levelUpKey);
            router.replace({ pathname: '/journey', params: { arrive: String(outcome.ladder!.after.level) } });
          }}
          onContinue={() => setCelebrated(levelUpKey)}
          onClose={goBack}
          onBoss={
            bossAt(outcome.ladder.after.level)
              ? () => {
                  feedback('start');
                  router.push({ pathname: '/boss', params: { level: String(outcome.ladder!.after.level) } });
                }
              : undefined
          }
        />
      )}

      {phase === 'quiz' && (
        <SafeAreaView style={styles.closeWrap} pointerEvents="box-none">
          <View style={styles.close}>
            <QuitButton onPress={quit} />
            <SoundToggle />
          </View>
        </SafeAreaView>
      )}

      <ConfirmDialog
        visible={leaving}
        title={phase === 'memorise' ? 'Leave today’s challenge?' : 'Leave this round?'}
        message={
          phase === 'memorise'
            ? 'You’ve seen the picture, so when you come back it goes straight to the questions.'
            : 'Your answers are saved. You can resume the round from Home.'
        }
        cancelLabel="Keep playing"
        confirmLabel="Leave"
        onCancel={() => setLeaving(false)}
        onConfirm={() => {
          setLeaving(false);
          goBack();
        }}
      />

      {phase === 'quiz' && peeking && <PeekView scene={stage.scene} seconds={peekSecondsFor(profile)} onDone={() => setPeeking(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
  choiceWrap: { padding: 16 },
  choice: { width: '100%', maxWidth: 420, padding: 20, gap: 14, backgroundColor: colors.surface, borderRadius: radius.md },
  choiceTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
  choiceText: { color: colors.textMuted, fontSize: 16, lineHeight: 22 },
  closeWrap: { position: 'absolute', top: 0, left: 0 },
  close: { margin: 16, flexDirection: 'row', gap: 10 },
});
