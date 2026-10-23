import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption, type OptionStatus } from '@/components/AnswerOption';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MemoriseStage } from '@/components/MemoriseStage';
import { PeekView } from '@/components/PeekView';
import { QuitButton } from '@/components/QuitButton';
import { feedback } from '@/feedback';
import { toRoundQuestion } from '@/game/selectQuestions';
import { knobsForLevel } from '@/games/lookRemember/ladder';
import { createStage, type Stage } from '@/scenes/createStage';
import { colors, radius } from '@/theme';
import type { Question, RoundQuestion } from '@/types/game';

/** The practice pictures: calm beaches with four kinds of thing, a new one for each try (picked to give a good count). */
const PRACTICE_SEEDS = [777, 404, 1717, 31];
/** Right answers out of 3 that say "You're ready!"; fewer suggest one more practice (never forced). */
const READY_AT = 2;
/** Twice the usual look, and fewer things, for a first go. */
const PRACTICE_SECONDS = 20;
const PRACTICE_KINDS = 4;

interface Coached {
  question: RoundQuestion;
  /** The coach's tip above the question. */
  tip: string;
  /** Offer a Peek on this one. */
  peek?: boolean;
}

/** Three questions that show the three things to remember: what was there, its colour, and how many. */
function practiceQuestions(stage: Stage): Coached[] {
  const find = (ok: (q: Question) => boolean) => stage.questions.find(ok);
  const seen = find((q) => q.template === 'seen') ?? find((q) => q.type === 'object');
  const colour = find((q) => q.family === 'colour' && q.subject !== seen?.subject) ?? find((q) => q.type === 'colour');
  // Counting something there was just one of would be a giveaway.
  const count = find((q) => q.family === 'count' && Number(q.options[q.answerIndex]) > 1) ?? find((q) => q.family === 'count');
  const coached: (Coached | null)[] = [
    seen ? { question: toRoundQuestion(seen), tip: 'First: what was there? Pick the one you saw.' } : null,
    colour ? { question: toRoundQuestion(colour), tip: 'Colours count too.' } : null,
    count ? { question: toRoundQuestion(count), tip: 'Now count from memory. Not sure? A Peek shows the picture again for a few seconds.', peek: true } : null,
  ];
  return coached.filter((c): c is Coached => c !== null);
}

/** `brief`: what to look for, on its own before the picture (a tip over the picture went unread: testers looked at the picture). */
type Step = 'intro' | 'brief' | 'look' | 'quiz' | 'ready';

interface GuidedRoundProps {
  /** Picture size: the screen below the countdown bar. */
  size: { width: number; height: number };
  /** On to Level 1 (or back, when replayed from How to play). */
  onDone: () => void;
  /** "Skip, I know how to play". */
  onSkip: () => void;
  /** ✕ during the practice, after "Leave?": back where you came from. The practice isn't done, so it's offered again. */
  onLeave: () => void;
  /** The button on the last card: "Start Level 1", or "Back to the game" when replayed. */
  doneLabel: string;
}

/**
 * The guided first round, for a new player before Level 1: how it works in three lines, a calm practice picture for
 * 20 seconds with a tip, three coached questions (what was there, a colour, how many, with a Peek to try), then what
 * real rounds are like. Nothing is saved: it never counts towards a level.
 */
export function GuidedRound({ size, onDone, onSkip, onLeave, doneLabel }: GuidedRoundProps) {
  const [step, setStep] = useState<Step>('intro');
  const makeStage = (attempt: number) =>
    createStage({ ...knobsForLevel(1), groups: PRACTICE_KINDS, viewSeconds: PRACTICE_SECONDS }, size, undefined, PRACTICE_SEEDS[attempt % PRACTICE_SEEDS.length], {
      unlocked: ['beach'],
      off: [],
    });
  const [attempt, setAttempt] = useState(0);
  const [stage, setStage] = useState(() => makeStage(0));
  const [questions, setQuestions] = useState(() => practiceQuestions(stage));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [peeking, setPeeking] = useState(false);
  const [peeked, setPeeked] = useState(false);
  // ✕ asks first: leaving mid-practice once went straight to Level 1, which confused testers.
  const [leaving, setLeaving] = useState(false);
  const leaveDialog = (
    <ConfirmDialog
      visible={leaving}
      title="Leave the practice?"
      message="You can practise next time you play, or skip it then."
      cancelLabel="Keep practising"
      confirmLabel="Leave"
      onCancel={() => setLeaving(false)}
      onConfirm={() => {
        setLeaving(false);
        onLeave();
      }}
    />
  );

  if (step === 'intro') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.center}>
          <Text style={styles.kicker}>Welcome to glance</Text>
          <Text style={styles.title}>How to play</Text>
          {[
            ['1', 'Look at a picture.', 'Take in what’s there, how many and what colour.'],
            ['2', 'It goes away.', 'Then answer questions about it from memory.'],
            ['3', 'Climb the levels.', 'Good rounds take you up, with new places on the way.'],
          ].map(([n, head, body], i) => (
            <Animated.View key={n} entering={FadeInDown.delay(150 + i * 150).duration(350)} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{n}</Text>
              <View style={styles.stepText}>
                <Text style={styles.stepHead}>{head}</Text>
                <Text style={styles.stepBody}>{body}</Text>
              </View>
            </Animated.View>
          ))}
          <Text style={styles.note}>First, a practice round. It doesn’t count, so take your time.</Text>
        </ScrollView>
        <View style={styles.actions}>
          <Button
            label="Try a practice round"
            onPress={() => {
              feedback('start');
              setStep('brief');
            }}
          />
          <Button label="Skip, I know how to play" variant="secondary" onPress={onSkip} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'brief') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.briefBar}>
          <QuitButton onPress={() => setLeaving(true)} />
        </View>
        <ScrollView contentContainerStyle={styles.center}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.brief}>
            <Text style={styles.kicker}>{attempt > 0 ? 'A new practice picture' : 'The practice picture'}</Text>
            <Text style={styles.title}>Look closely at</Text>
            <View style={styles.lookFor}>
              {['What’s there', 'How many', 'What colour'].map((t) => (
                <Text key={t} style={styles.lookForItem}>
                  {t}
                </Text>
              ))}
            </View>
            <Text style={styles.note}>
              You’ll have {PRACTICE_SECONDS} seconds. Tap I’m ready when you’ve got it, and the questions start.
            </Text>
          </Animated.View>
        </ScrollView>
        <View style={styles.actions}>
          <Button
            label="Show me the picture"
            onPress={() => {
              feedback('start');
              setStep('look');
            }}
          />
        </View>
        {leaveDialog}
      </SafeAreaView>
    );
  }

  if (step === 'look') {
    return (
      <View style={styles.screen}>
        <MemoriseStage
          key={stage.scene.id}
          scene={stage.scene}
          seconds={PRACTICE_SECONDS}
          onDone={() => setStep('quiz')}
          onQuit={() => setLeaving(true)}
          paused={leaving}
        />
        {leaveDialog}
      </View>
    );
  }

  if (step === 'quiz') {
    const c = questions[index];
    const answered = chosen !== null;
    const isRight = answered && chosen === c.question.answerIndex;
    const statusFor = (i: number): OptionStatus =>
      !answered ? 'idle' : i === c.question.answerIndex ? 'correct' : i === chosen ? 'wrong' : 'muted';
    const choose = (i: number) => {
      if (answered) return;
      setChosen(i);
      const ok = i === c.question.answerIndex;
      feedback(ok ? 'correct' : 'wrong');
      if (ok) setRight((n) => n + 1);
    };
    const next = () => {
      setChosen(null);
      if (index + 1 < questions.length) setIndex(index + 1);
      else {
        // The good-round chime only for a good practice: a low score gets no sound, as in real rounds.
        if (right >= READY_AT) feedback('roundGood');
        setStep('ready');
      }
    };
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.screen}>
          <ScrollView contentContainerStyle={styles.quiz}>
            <View style={styles.quizHeader}>
              <View style={styles.quizHeaderLeft}>
                <QuitButton onPress={() => setLeaving(true)} />
                <Text style={styles.practiceTag}>Practice</Text>
              </View>
              <Text style={styles.progress}>
                Question {index + 1} of {questions.length}
              </Text>
            </View>
            <Animated.View key={c.question.id} entering={FadeIn.duration(250)} style={styles.quizBody}>
              <View style={styles.tip}>
                <Text style={styles.tipText}>💡 {c.tip}</Text>
              </View>
              <Text style={styles.prompt}>{c.question.prompt}</Text>
              <View style={styles.options}>
                {c.question.options.map((o, i) => (
                  <AnswerOption key={o} label={o} status={statusFor(i)} disabled={answered} onPress={() => choose(i)} />
                ))}
              </View>
              {c.peek && !answered && (
                <Button
                  label={peeked ? '👀 Peek used' : '👀 Try a Peek'}
                  variant="secondary"
                  disabled={peeked}
                  onPress={() => {
                    setPeeked(true);
                    setPeeking(true);
                  }}
                />
              )}
              {answered && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.verdict}>
                  <Text style={[styles.verdictText, { color: isRight ? colors.correct : colors.wrong }]}>
                    {isRight ? 'Right!' : `Not quite: it was ${c.question.options[c.question.answerIndex]}.`}
                  </Text>
                  {!isRight && <Text style={styles.note}>That’s fine. In a real round you see the answer, then move on.</Text>}
                </Animated.View>
              )}
            </Animated.View>
          </ScrollView>
          <View style={styles.actions}>{answered && <Button label={index + 1 < questions.length ? 'Next question' : 'Finish practice'} onPress={next} />}</View>
        </SafeAreaView>
        {peeking && <PeekView scene={stage.scene} onDone={() => setPeeking(false)} />}
        {leaveDialog}
      </View>
    );
  }

  // A low score: one more practice with a new picture and a tip, never forced ("…anyway" still goes on).
  if (right < READY_AT) {
    const again = () => {
      const next = attempt + 1;
      const nextStage = makeStage(next);
      setAttempt(next);
      setStage(nextStage);
      setQuestions(practiceQuestions(nextStage));
      setIndex(0);
      setRight(0);
      setPeeked(false);
      feedback('start');
      setStep('brief');
    };
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.center}>
          <Text style={styles.kicker}>
            {right} of {questions.length} right · practice makes perfect
          </Text>
          <Text style={styles.title}>Let’s practise once more</Text>
          <Text style={styles.note}>Memory gets better with a little practice. Here’s a new picture, at the same slow pace.</Text>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              💡 As you look, say what you see in your head: “two kites, one boat, something red…”. Saying it helps counts and colours stick.
            </Text>
          </View>
        </ScrollView>
        <View style={styles.actions}>
          <Button label="Practise again" onPress={again} />
          <Button
            label={doneLabel === 'Start Level 1' ? 'Start Level 1 anyway' : doneLabel}
            variant="secondary"
            onPress={() => {
              feedback('start');
              onDone();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.kicker}>
          Practice done · {right} of {questions.length} right
        </Text>
        <Text style={styles.title}>You’re ready!</Text>
        <View style={styles.card}>
          {[
            'Real rounds have 5 questions and a shorter look, so be quick.',
            '3 good rounds (4 or 5 right) take you up a level.',
            'Points earn Peeks. Use one when you’re stuck: that answer gets half points.',
            'Surprises wait along the way: Speed Rounds, bosses and new places on your journey.',
          ].map((line) => (
            <Text key={line} style={styles.cardLine}>
              • {line}
            </Text>
          ))}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button
          label={doneLabel}
          onPress={() => {
            feedback('start');
            onDone();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  kicker: { color: colors.accent, fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 32, fontWeight: '900' },
  stepRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radius.md, padding: 14 },
  stepNumber: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, color: colors.accentText, fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 34, overflow: 'hidden' },
  stepText: { flex: 1, gap: 2 },
  stepHead: { color: colors.text, fontSize: 17, fontWeight: '800' },
  stepBody: { color: colors.textMuted, fontSize: 15, lineHeight: 21 },
  note: { color: colors.textMuted, fontSize: 15, lineHeight: 21 },
  actions: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center', minHeight: 84 },
  quiz: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', padding: 24, gap: 16 },
  briefBar: { paddingHorizontal: 16, paddingTop: 16 },
  brief: { gap: 16 },
  lookFor: { gap: 10 },
  lookForItem: { color: colors.text, fontSize: 22, fontWeight: '800', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, paddingVertical: 12, paddingHorizontal: 16, overflow: 'hidden' },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  practiceTag: { color: colors.accentText, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4, fontSize: 13, fontWeight: '900', overflow: 'hidden', textTransform: 'uppercase', letterSpacing: 1 },
  progress: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  quizBody: { flexGrow: 1, justifyContent: 'center', gap: 16 },
  tip: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, padding: 12 },
  tipText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  prompt: { color: colors.text, fontSize: 24, fontWeight: '800', lineHeight: 30 },
  options: { gap: 12 },
  verdict: { gap: 4 },
  verdictText: { fontSize: 18, fontWeight: '900' },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 10 },
  cardLine: { color: colors.text, fontSize: 16, lineHeight: 22 },
});
