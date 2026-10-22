import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Polygon } from 'react-native-svg';

import { Button } from '@/components/Button';
import { MemoriseStage } from '@/components/MemoriseStage';
import { feedback } from '@/feedback';
import { formatPoints } from '@/games/lookRemember/points';
import { SPEED_EXTRA_SECONDS, SPEED_PRIZES, SPEED_QUESTIONS, SPEED_SECONDS, type SpeedPrize } from '@/games/lookRemember/speed';
import type { SpeedRoundSetup } from '@/hooks/useGameSession';
import { colors, radius } from '@/theme';

/** How long a right or wrong answer shows before the next question. */
const ANSWER_SHOW_MS = 550;
const TIMEOUT_SHOW_MS = 800;

interface SpeedRoundProps {
  setup: SpeedRoundSetup;
  /** "More time to look": a little longer for each question too. */
  moreTime: boolean;
  /** Scores and saves the round when its last question is answered; returns what it won. */
  onFinish: (right: number, lookedSeconds: number) => SpeedPrize;
  /** On to the next picture. */
  onContinue: () => void;
  /** "Not now" on the intro: no round, on to the next picture (the next speed round comes a few rounds later). */
  onSkip: () => void;
}

type Step = 'intro' | 'memorise' | 'quiz' | 'result';

/**
 * A Super Speed Round (see games/lookRemember/speed): a burst of lightning and the prizes on offer, then a picture
 * of its own, then eight quick Yes / No questions against the clock, then what you won.
 */
export function SpeedRound({ setup, moreTime, onFinish, onContinue, onSkip }: SpeedRoundProps) {
  const [step, setStep] = useState<Step>('intro');
  const looked = useRef(0);
  const [prize, setPrize] = useState<SpeedPrize | null>(null);
  const finish = (right: number) => {
    setPrize(onFinish(right, looked.current));
    setStep('result');
  };

  if (step === 'intro') return <Intro onStart={() => setStep('memorise')} onSkip={onSkip} />;
  if (step === 'memorise')
    return (
      <MemoriseStage
        scene={setup.stage.scene}
        seconds={setup.viewSeconds}
        onDone={(seconds) => {
          looked.current = seconds;
          setStep('quiz');
        }}
        // Leaving the picture early goes straight to the questions: the speed round is never lost half-way.
        onQuit={() => setStep('quiz')}
      />
    );
  if (step === 'quiz') return <Quiz setup={setup} seconds={SPEED_SECONDS + (moreTime ? SPEED_EXTRA_SECONDS : 0)} onDone={finish} />;
  return prize ? <Result prize={prize} onContinue={onContinue} /> : null;
}

const RAYS = 14;

/** The lightning bolt bursting in on spinning rays, a flash, then the title and what you can win. */
function Intro({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const reduceMotion = useReducedMotion();
  const bolt = useSharedValue(reduceMotion ? 1 : 0);
  const spin = useSharedValue(0);
  const flash = useSharedValue(0);
  const rays = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    // The zap in the sound lands at 0.15 s, as the bolt springs in, and its stab as the title rises. (A timer, so a
    // remount in development doesn't play it twice.)
    const sound = setTimeout(() => feedback('speedIntro'), 0);
    if (reduceMotion) return () => clearTimeout(sound);
    bolt.value = withDelay(150, withSpring(1, { damping: 7, stiffness: 160 }));
    rays.value = withDelay(150, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
    spin.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1, false);
    flash.value = withDelay(200, withSequence(withTiming(0.7, { duration: 90 }), withTiming(0, { duration: 420 })));
    return () => clearTimeout(sound);
  }, [bolt, flash, rays, reduceMotion, spin]);
  const boltStyle = useAnimatedStyle(() => ({ transform: [{ scale: bolt.value }, { rotate: `${(1 - bolt.value) * -25}deg` }] }));
  const raysStyle = useAnimatedStyle(() => ({ opacity: rays.value, transform: [{ scale: 0.4 + 0.6 * rays.value }, { rotate: `${spin.value * 360}deg` }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  // Smaller on a short phone (iPhone SE), so the burst, the prizes and both buttons fit.
  const { height } = useWindowDimensions();
  const SIZE = height < 740 ? 160 : 210;
  const c = SIZE / 2;
  const rayPoints = Array.from({ length: RAYS }, (_, i) => {
    const a = (i / RAYS) * 2 * Math.PI;
    const w = Math.PI / RAYS / 1.6;
    const p = (r: number, t: number) => `${c + r * Math.cos(t)},${c + r * Math.sin(t)}`;
    return `${p(18, a)} ${p(c, a - w)} ${p(c, a + w)}`;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.introCenter}>
        <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[StyleSheet.absoluteFill, raysStyle]}>
            <Svg width={SIZE} height={SIZE}>
              {rayPoints.map((points, i) => (
                <Polygon key={i} points={points} fill={i % 2 ? colors.speed : '#9b85ff'} opacity={0.85} />
              ))}
            </Svg>
          </Animated.View>
          <Animated.View style={boltStyle}>
            <Svg width={SIZE * 0.46} height={SIZE * 0.62} viewBox="0 0 48 65">
              <Path d="M30 1 L4 37 H21 L15 64 L44 24 H27 Z" fill={colors.accent} stroke="#fff3c4" strokeWidth={2} strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        </View>
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(500).duration(400)} style={styles.introText}>
          <Text style={styles.kicker}>Surprise!</Text>
          <Text style={styles.title}>Super Speed Round</Text>
          <Text style={styles.instruction}>
            Look at a new picture, then answer {SPEED_QUESTIONS} quick Yes or No questions. {SPEED_SECONDS} seconds each!
          </Text>
          <View style={styles.prizes}>
            <Text style={styles.prizesTitle}>What you can win</Text>
            {SPEED_PRIZES.map((p) => (
              <View key={p.right} style={styles.prizeRow}>
                <Text style={styles.prizeScore}>
                  {p.right} of {SPEED_QUESTIONS}
                </Text>
                <Text style={styles.prizeLabel}>{p.label}</Text>
              </View>
            ))}
            <Text style={styles.prizeNote}>It never changes your level.</Text>
          </View>
        </Animated.View>
      </View>
      <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(800).duration(300)} style={styles.actions}>
        <Button
          label="Start"
          onPress={() => {
            feedback('speedGo');
            onStart();
          }}
        />
        <Button label="Not now" variant="secondary" onPress={onSkip} accessibilityHint="Skips this speed round and goes on to the next picture" />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </SafeAreaView>
  );
}

type Shown = { kind: 'answered'; right: boolean } | { kind: 'timeout' } | null;

/** The questions, one at a time against a draining bar. Running out of time counts as wrong. */
function Quiz({ setup, seconds, onDone }: { setup: SpeedRoundSetup; seconds: number; onDone: (right: number) => void }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [shown, setShown] = useState<Shown>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** The ticks on the last two seconds. */
  const ticks = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopTicks = () => ticks.current.forEach(clearTimeout);
  const drain = useSharedValue(1);
  const question = setup.questions[index];

  const record = (right: boolean, show: Shown) => {
    clearTimeout(timer.current);
    stopTicks();
    setShown(show);
    const next = [...results, right];
    setResults(next);
    timer.current = setTimeout(
      () => {
        setShown(null);
        if (next.length >= setup.questions.length) onDone(next.filter(Boolean).length);
        else setIndex(next.length);
      },
      show?.kind === 'timeout' ? TIMEOUT_SHOW_MS : ANSWER_SHOW_MS,
    );
  };

  useEffect(() => {
    drain.value = 1;
    drain.value = withTiming(0, { duration: seconds * 1000, easing: Easing.linear });
    ticks.current = [2, 1].map((left) => setTimeout(() => feedback('speedTick'), (seconds - left) * 1000));
    timer.current = setTimeout(() => {
      feedback('speedTimeout');
      record(false, { kind: 'timeout' });
    }, seconds * 1000);
    return () => {
      clearTimeout(timer.current);
      stopTicks();
    };
    // A new clock for each question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${drain.value * 100}%`,
    backgroundColor: drain.value < 0.3 ? colors.wrong : colors.accent,
  }));

  const choose = (yes: boolean) => {
    if (shown || !question) return;
    // The bar stops where it is.
    cancelAnimation(drain);
    const right = yes === question.yes;
    feedback(right ? 'correct' : 'wrong');
    record(right, { kind: 'answered', right });
  };

  if (!question) return null;
  const answerWas = question.yes ? 'Yes' : 'No';
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.quiz}>
        <View style={styles.quizHeader}>
          <Text style={styles.speedTag}>⚡ Speed Round</Text>
          <Text style={styles.progress}>
            {index + 1} of {setup.questions.length}
          </Text>
        </View>
        <View style={styles.pips}>
          {setup.questions.map((q, i) => (
            <View key={q.id} style={[styles.pip, i < results.length && (results[i] ? styles.pipRight : styles.pipWrong), i === index && !shown && styles.pipCurrent]} />
          ))}
        </View>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, barStyle]} />
        </View>
        <Animated.View key={question.id} entering={FadeIn.duration(150)} style={styles.questionBlock}>
          <Text style={[styles.prompt, !question.guess && styles.promptBig]}>{question.prompt}</Text>
          {question.guess && <Text style={styles.guess}>{question.guess}?</Text>}
        </Animated.View>
        <View style={styles.verdictSpace}>
          {shown && (
            <Animated.Text
              entering={FadeIn.duration(120)}
              style={[styles.verdict, { color: shown.kind === 'answered' && shown.right ? colors.correct : colors.wrong }]}
            >
              {shown.kind === 'timeout' ? `Too slow! It was ${answerWas}` : shown.right ? 'Right!' : `No, it was ${answerWas}`}
            </Animated.Text>
          )}
        </View>
      </View>
      <View style={styles.yesNo}>
        <YesNoButton label="Yes" onPress={() => choose(true)} disabled={!!shown} />
        <YesNoButton label="No" onPress={() => choose(false)} disabled={!!shown} />
      </View>
    </SafeAreaView>
  );
}

function YesNoButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.yesNoButton, label === 'Yes' ? styles.yes : styles.no, disabled && styles.yesNoOff, pressed && styles.yesNoPressed]}
    >
      <Text style={styles.yesNoText}>{label}</Text>
    </Pressable>
  );
}

/** The score and what it won. */
function Result({ prize, onContinue }: { prize: SpeedPrize; onContinue: () => void }) {
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(reduceMotion ? 1 : 0.5);
  useEffect(() => {
    if (!reduceMotion) pop.value = withSpring(1, { damping: 8, stiffness: 150 });
    // A fanfare for a prize, the kind "aww" for 2 or fewer, and nothing in between.
    if (prize.right >= 6) feedback('speedPrize');
    else if (prize.right <= 2) feedback('roundMiss');
  }, [pop, prize.right, reduceMotion]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const won = [
    prize.peeks ? `👀 ${prize.peeks === 1 ? 'A Peek' : `${prize.peeks} Peeks`}` : null,
    prize.fifty ? '✂️ A 50:50: takes away two wrong answers' : null,
    prize.bonus ? `⭐ ${formatPoints(prize.bonus)} bonus points` : null,
  ].filter((w): w is string => w !== null);
  const headline = prize.right === SPEED_QUESTIONS ? 'Lightning fast!' : prize.right >= 6 ? 'Speedy!' : 'Phew, that was quick!';
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.introCenter}>
        <Text style={styles.kicker}>{headline}</Text>
        <Animated.Text style={[styles.bigScore, popStyle]}>
          {prize.right} of {SPEED_QUESTIONS}
        </Animated.Text>
        <Text style={styles.points}>+{formatPoints(prize.points)} points</Text>
        <View style={styles.prizes}>
          <Text style={styles.prizesTitle}>{won.length ? 'You won' : 'No prize this time'}</Text>
          {won.length ? (
            won.map((w) => (
              <Text key={w} style={styles.wonLine}>
                {w}
              </Text>
            ))
          ) : (
            <Text style={styles.wonLine}>Get 6 or more right next time to win a prize.</Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="Keep playing" onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  introCenter: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  introText: { alignItems: 'center', gap: 12, alignSelf: 'stretch' },
  kicker: { color: colors.accent, fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  instruction: { color: colors.textMuted, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  prizes: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.speed, padding: 14, gap: 8 },
  prizesTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  prizeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prizeScore: { color: colors.text, backgroundColor: colors.speed, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, fontSize: 14, fontWeight: '800', overflow: 'hidden' },
  prizeLabel: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
  prizeNote: { color: colors.textMuted, fontSize: 13 },
  actions: { padding: 24, gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center' },
  flash: { backgroundColor: '#ffffff' },
  quiz: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 16, gap: 16 },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  speedTag: { color: colors.text, backgroundColor: colors.speed, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, fontSize: 14, fontWeight: '800', overflow: 'hidden' },
  progress: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  pips: { flexDirection: 'row', gap: 6 },
  pip: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceRaised },
  pipRight: { backgroundColor: colors.correct },
  pipWrong: { backgroundColor: colors.wrong },
  pipCurrent: { backgroundColor: colors.text },
  track: { height: 12, borderRadius: 6, backgroundColor: colors.surface, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 6 },
  questionBlock: { flex: 1, justifyContent: 'center', gap: 18 },
  prompt: { color: colors.text, fontSize: 22, fontWeight: '700', lineHeight: 29 },
  promptBig: { fontSize: 28, fontWeight: '900', lineHeight: 35 },
  guess: { color: colors.accent, fontSize: 40, fontWeight: '900' },
  verdictSpace: { minHeight: 34, justifyContent: 'center' },
  verdict: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  yesNo: { flexDirection: 'row', gap: 14, padding: 24, width: '100%', maxWidth: 520, alignSelf: 'center' },
  yesNoButton: { flex: 1, minHeight: 84, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  yes: { backgroundColor: '#1f9d63' },
  no: { backgroundColor: '#c43a3f' },
  yesNoOff: { opacity: 0.5 },
  yesNoPressed: { transform: [{ scale: 0.97 }], opacity: 0.85 },
  yesNoText: { color: '#ffffff', fontSize: 26, fontWeight: '900' },
  bigScore: { color: colors.text, fontSize: 56, fontWeight: '900' },
  points: { color: colors.accent, fontSize: 20, fontWeight: '800' },
  wonLine: { color: colors.text, fontSize: 17, lineHeight: 24, fontWeight: '600' },
});
