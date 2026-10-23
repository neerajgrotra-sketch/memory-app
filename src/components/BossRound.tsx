import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BossBadge } from '@/components/BossBadge';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MemoriseStage } from '@/components/MemoriseStage';
import { QuitButton } from '@/components/QuitButton';
import { QuizStage } from '@/components/QuizStage';
import { SoundToggle } from '@/components/SoundToggle';
import { feedback } from '@/feedback';
import { ROUND_SIZE } from '@/game/difficulty';
import { emptyAnswers, type Answers } from '@/game/quizNavigation';
import { selectQuestions, toRoundQuestion } from '@/game/selectQuestions';
import { BOSS_MULTIPLIER, BOSS_TO_WIN, bossKnobs, type Boss } from '@/games/lookRemember/boss';
import { bandOf, knobsForLevel } from '@/games/lookRemember/ladder';
import { formatPoints, pointsFor } from '@/games/lookRemember/points';
import { createStage, type Stage } from '@/scenes/createStage';
import { statsStore } from '@/stats';
import { colors, radius } from '@/theme';
import type { RoundQuestion } from '@/types/game';
import type { RoundResult } from '@/types/stats';

interface BossRoundProps {
  boss: Boss;
  /** Picture size: the screen below the countdown bar. */
  size: { width: number; height: number };
  /** Seconds added to the look ("More time to look"). */
  extraSeconds: number;
  /** Beaten before: no Peek this time. */
  beatenBefore: boolean;
  /** Room for the Peek a first win brings. */
  peekRoom: boolean;
  onDone: () => void;
}

type Step = 'intro' | 'memorise' | 'quiz' | 'result';

interface Attempt {
  stage: Stage;
  questions: RoundQuestion[];
  viewSeconds: number;
}

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function newAttempt(boss: Boss, size: BossRoundProps['size'], extraSeconds: number): Attempt {
  const knobs = bossKnobs(boss);
  const stage = createStage(knobs, size, undefined, undefined, { unlocked: [boss.recipeId] });
  const picked = selectQuestions(stage.questions, {
    count: ROUND_SIZE,
    preferredTypes: knobs.preferredTypes,
    typeCaps: knobs.typeCaps,
    storyMin: knobs.storyMin,
    seenIds: new Set(),
    previousIds: new Set(),
  });
  return { stage, questions: picked.map(toRoundQuestion), viewSeconds: knobs.viewSeconds + extraSeconds };
}

/**
 * A boss round (see games/lookRemember/boss): the badge slams down with the rules, then a busy picture with a shorter
 * look, five harder questions with no Peeks or 50:50s, and the badge won or the boss still standing.
 */
export function BossRound({ boss, size, extraSeconds, beatenBefore, peekRoom, onDone }: BossRoundProps) {
  const [step, setStep] = useState<Step>('intro');
  const [attempt, setAttempt] = useState(() => newAttempt(boss, size, extraSeconds));
  const [answers, setAnswers] = useState<Answers>(() => emptyAnswers(ROUND_SIZE));
  const looked = useRef(0);
  const [outcome, setOutcome] = useState<{ score: number; points: number; peek: boolean; firstWin: boolean } | null>(null);
  const wonOnce = useRef(beatenBefore);
  const [leaving, setLeaving] = useState(false);

  const finish = (final: Answers) => {
    const correct = attempt.questions.map((q, i) => final[i] === q.answerIndex);
    const score = correct.filter(Boolean).length;
    const base = pointsFor({ correct, level: boss.level, viewSeconds: attempt.viewSeconds, lookedSeconds: looked.current });
    const points = base.total * BOSS_MULTIPLIER;
    const won = score >= BOSS_TO_WIN;
    const firstWin = won && !wonOnce.current;
    const peek = firstWin && peekRoom;
    if (won) wonOnce.current = true;
    const byType: RoundResult['byType'] = {};
    attempt.questions.forEach((q, i) => {
      const t = (byType[q.type] ??= { correct: 0, total: 0 });
      t.total += 1;
      if (correct[i]) t.correct += 1;
    });
    const result: RoundResult = {
      id: makeId(),
      sessionId: makeId(),
      gameId: 'look-remember',
      playedAt: new Date().toISOString(),
      mode: 'levels',
      level: bandOf(boss.level),
      boss: boss.level,
      points,
      bonus: peek ? { peeks: 1 } : undefined,
      recipeId: attempt.stage.scene.recipeId,
      sceneId: attempt.stage.scene.id,
      score,
      total: attempt.questions.length,
      viewSeconds: attempt.viewSeconds,
      lookedSeconds: looked.current,
      byType,
    };
    statsStore.addResult(result).catch(() => {});
    setOutcome({ score, points, peek, firstWin });
    setStep('result');
  };

  const again = () => {
    setAttempt(newAttempt(boss, size, extraSeconds));
    setAnswers(emptyAnswers(ROUND_SIZE));
    setOutcome(null);
    feedback('start');
    setStep('memorise');
  };

  if (step === 'intro') return <Intro boss={boss} viewSeconds={attempt.viewSeconds} extraSeconds={extraSeconds} onStart={() => setStep('memorise')} onSkip={onDone} />;
  if (step === 'memorise')
    return (
      <MemoriseStage
        key={attempt.stage.scene.id}
        scene={attempt.stage.scene}
        seconds={attempt.viewSeconds}
        onDone={(s) => {
          looked.current = s;
          setStep('quiz');
        }}
        // Nothing has counted yet, so leaving while looking needs no question.
        onQuit={onDone}
      />
    );
  if (step === 'quiz')
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.screen}>
          <QuizStage
            key={attempt.stage.scene.id}
            questions={attempt.questions}
            answers={answers}
            onAnswer={(qi, oi) => {
              const next = answers.map((a, i) => (i === qi ? oi : a));
              setAnswers(next);
              if (next.every((a) => a !== null)) finish(next);
            }}
          />
        </SafeAreaView>
        <SafeAreaView style={styles.closeWrap} pointerEvents="box-none">
          <View style={styles.close}>
            <QuitButton onPress={() => setLeaving(true)} />
            <SoundToggle />
          </View>
        </SafeAreaView>
        <LeaveDialog visible={leaving} onCancel={() => setLeaving(false)} onLeave={onDone} />
      </View>
    );
  return outcome && <Result boss={boss} attempt={attempt} answers={answers} outcome={outcome} onAgain={again} onDone={onDone} />;
}

function LeaveDialog({ visible, onCancel, onLeave }: { visible: boolean; onCancel: () => void; onLeave: () => void }) {
  return (
    <ConfirmDialog
      visible={visible}
      title="Leave the boss round?"
      message="It won’t count. You can take the boss on again any time from the game page."
      cancelLabel="Keep playing"
      confirmLabel="Leave"
      onCancel={onCancel}
      onConfirm={onLeave}
    />
  );
}

/** The badge drops and slams down (with the second drum hit), the screen shakes, then the rules. */
function Intro({ boss, viewSeconds, extraSeconds, onStart, onSkip }: { boss: Boss; viewSeconds: number; extraSeconds: number; onStart: () => void; onSkip: () => void }) {
  const reduceMotion = useReducedMotion();
  const drop = useSharedValue(reduceMotion ? 1 : 0);
  const shake = useSharedValue(0);
  const flash = useSharedValue(0);
  const { height } = useWindowDimensions();
  useEffect(() => {
    const sound = setTimeout(() => feedback('bossIntro'), 0);
    if (reduceMotion) return () => clearTimeout(sound);
    drop.value = withTiming(1, { duration: 280, easing: Easing.in(Easing.quad) });
    const step = { duration: 45 };
    shake.value = withDelay(280, withSequence(withTiming(-9, step), withTiming(8, step), withTiming(-6, step), withTiming(4, step), withTiming(0, step)));
    flash.value = withDelay(280, withSequence(withTiming(0.45, { duration: 60 }), withTiming(0, { duration: 500 })));
    return () => clearTimeout(sound);
  }, [drop, flash, reduceMotion, shake]);
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - drop.value) * -280 }, { scale: 1 + (1 - drop.value) * 0.8 }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const base = knobsForLevel(boss.level);
  const knobs = bossKnobs(boss);
  const usualSeconds = base.viewSeconds + extraSeconds;
  const rules = [
    `${knobs.groups} kinds of thing to remember (usually ${base.groups})`,
    viewSeconds < usualSeconds ? `${viewSeconds} seconds to look (usually ${usualSeconds})` : `${viewSeconds} seconds to look`,
    'Harder questions: how many, where and numbers',
    'No Peeks or 50:50s, and double points',
  ];
  return (
    <SafeAreaView style={styles.screen}>
      <Animated.View style={[styles.introWrap, shakeStyle]}>
        <ScrollView contentContainerStyle={styles.introCenter}>
          <Animated.View style={badgeStyle}>
            <BossBadge level={boss.level} state="open" size={height < 740 ? 92 : 120} />
          </Animated.View>
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(600).duration(400)} style={styles.introText}>
            <Text style={styles.kicker}>{boss.level === 30 ? 'The final boss' : `Boss round · Level ${boss.level}`}</Text>
            <Text style={styles.title}>{boss.name.replace(/^the /, 'The ')}</Text>
            <View style={styles.rules}>
              {rules.map((r) => (
                <Text key={r} style={styles.rule}>
                  • {r}
                </Text>
              ))}
              <Text style={styles.win}>
                Get {BOSS_TO_WIN} of 5 right to win the {boss.badge} badge.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </Animated.View>
      <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(900).duration(300)} style={styles.actions}>
        <Button
          label="Take it on"
          onPress={() => {
            feedback('start');
            onStart();
          }}
        />
        <Button label="Not now" variant="secondary" onPress={onSkip} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </SafeAreaView>
  );
}

function Result({
  boss,
  attempt,
  answers,
  outcome,
  onAgain,
  onDone,
}: {
  boss: Boss;
  attempt: Attempt;
  answers: Answers;
  outcome: { score: number; points: number; peek: boolean; firstWin: boolean };
  onAgain: () => void;
  onDone: () => void;
}) {
  const won = outcome.score >= BOSS_TO_WIN;
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(reduceMotion ? 1 : 0.3);
  useEffect(() => {
    if (!reduceMotion) pop.value = withSpring(1, { damping: 7, stiffness: 140 });
    feedback(won ? 'bossWin' : 'roundMiss');
  }, [pop, reduceMotion, won]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <Animated.View style={popStyle}>
          <BossBadge level={boss.level} state={won ? 'beaten' : 'locked'} size={110} />
        </Animated.View>
        <Text style={styles.kicker}>{won ? (outcome.firstWin ? 'Badge won!' : 'Beaten again!') : 'The boss wins this time'}</Text>
        <Text style={styles.title}>{won ? `You beat ${boss.name}` : `${outcome.score} of 5. So close!`}</Text>
        <Text style={styles.points}>
          {outcome.score} of 5 right · +{formatPoints(outcome.points)} points
        </Text>
        {won && outcome.firstWin && (
          <Text style={styles.prize}>
            🏅 The {boss.badge} badge{outcome.peek ? ' and 👀 a Peek' : ''}
          </Text>
        )}
        {!won && <Text style={styles.note}>{BOSS_TO_WIN} of 5 beats it. A new picture every try.</Text>}
        <View style={styles.review}>
          {attempt.questions.map((q, i) => {
            const right = answers[i] === q.answerIndex;
            return (
              <View key={q.id} style={styles.reviewRow}>
                <View style={[styles.mark, { backgroundColor: right ? colors.correct : colors.wrong }]}>
                  <Text style={styles.markText}>{right ? '✓' : '✕'}</Text>
                </View>
                <View style={styles.reviewText}>
                  <Text style={styles.reviewPrompt}>{q.prompt}</Text>
                  <Text style={styles.reviewAnswer}>{q.options[q.answerIndex]}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button label={won ? 'Done' : 'Try again'} onPress={won ? onDone : onAgain} />
        <Button label={won ? 'Play it again' : 'Not now'} variant="secondary" onPress={won ? onAgain : onDone} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  closeWrap: { position: 'absolute', top: 0, left: 0 },
  close: { margin: 16, flexDirection: 'row', gap: 10 },
  introWrap: { flex: 1 },
  introCenter: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 18 },
  introText: { alignItems: 'center', gap: 12, alignSelf: 'stretch' },
  kicker: { color: colors.bossText, fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  rules: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.boss, padding: 16, gap: 8 },
  rule: { color: colors.text, fontSize: 16, lineHeight: 22 },
  win: { color: colors.accent, fontSize: 16, fontWeight: '800', lineHeight: 22, marginTop: 4 },
  actions: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12, gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center' },
  flash: { backgroundColor: colors.boss },
  resultContent: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', padding: 24, gap: 12 },
  points: { color: colors.accent, fontSize: 18, fontWeight: '800' },
  prize: { color: colors.text, fontSize: 17, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: 15 },
  review: { alignSelf: 'stretch', gap: 10, marginTop: 8 },
  reviewRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radius.md, padding: 12 },
  mark: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  markText: { color: colors.background, fontSize: 14, fontWeight: '900' },
  reviewText: { flex: 1, gap: 2 },
  reviewPrompt: { color: colors.text, fontSize: 15, fontWeight: '600' },
  reviewAnswer: { color: colors.correct, fontSize: 14, fontWeight: '700' },
});
