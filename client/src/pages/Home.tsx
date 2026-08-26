/*
 * Design reminder: Editorial Utility / دفتر التدريب التحريري.
 * Use asymmetrical notebook-like composition, charcoal ink, warm paper, Apricot Burn #E8753D,
 * brief tactile motion, and direct Arabic microcopy. Avoid generic centered dashboard patterns.
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowUpLeft,
  Check,
  ChevronLeft,
  CircleHelp,
  Download,
  Flame,
  RotateCcw,
  Sparkles,
  TimerReset,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

type Variant = { label: string; en: string };
type Exercise = { name: string; en?: string; reps: string; variants?: Variant[] };
type Section = { name: string; exercises: Exercise[] };
type WorkoutDay = { id: string; num: number; title: string; sub: string; tip: string; sections: Section[] };
type ExerciseState = { sets: boolean[]; variant: number };
type ProgressState = Record<string, ExerciseState>;

const HERO_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85";
const WORKOUT_IMAGE = "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85";
const RECOVERY_IMAGE = "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85";
const MARK_IMAGE = "/icon-192.png";
const STORE_KEY = "gymapp-progress-v2";

const DAYS: WorkoutDay[] = [
  {
    id: "d1",
    num: 1,
    title: "اليوم الأول — صدر والباي",
    sub: "Chest & Biceps",
    tip: "أول يوم لك. العب كل تمرين ٤×١٥، وركّز على الحركة بوزن مناسب لك. لا يهم أن ترفع وزنًا عاليًا؛ المهم أن تعرف جسدك وتحافظ على تركيزك.",
    sections: [
      {
        name: "تمارين الصدر",
        exercises: [
          { name: "صدر مستوي بار", en: "Barbell Bench Press", reps: "4×15" },
          { name: "صدر مستوي جهاز", reps: "4×15", variants: [{ label: "جهاز صدر", en: "Machine Chest Press" }, { label: "دامبل مستوي", en: "Dumbbell Press" }] },
          { name: "صدر سفلي جهاز", en: "Decline Chest Press Machine", reps: "4×15" },
          { name: "صدر مستوي بار", en: "Barbell Bench Press", reps: "4×15" },
          { name: "صدر عالي جهاز", en: "Incline Chest Press Machine", reps: "4×15" },
          { name: "تفتيح صدر جهاز", en: "Machine Chest Fly", reps: "4×15" },
        ],
      },
      {
        name: "تمارين الباي",
        exercises: [
          { name: "تبادل دامبل باي", en: "Biceps Curl", reps: "4×15" },
          { name: "بار واسع باي", en: "Barbell Biceps Curl", reps: "4×15" },
          { name: "هامر دامبل باي", en: "Hammer Curl", reps: "4×15" },
          { name: "تكوير باي", en: "Concentrated Curl", reps: "4×15" },
        ],
      },
    ],
  },
  {
    id: "d2",
    num: 2,
    title: "اليوم الثاني — ظهر وتراي",
    sub: "Back & Triceps",
    tip: "ثاني يوم لك. العب كل تمرين ٤×١٥ بوزن تستطيع التحكم فيه من أول عدة إلى آخرها. الجودة قبل الرقم.",
    sections: [
      {
        name: "تمارين الظهر",
        exercises: [
          { name: "سحب امامي واسع", en: "Lat Pulldown", reps: "4×15" },
          { name: "منشار جهاز / دامبل", reps: "4×15", variants: [{ label: "منشار جهاز", en: "Seated Row Machine — قبضة ضيقة" }, { label: "منشار دامبل", en: "Dumbbell Row" }] },
          { name: "سحب امامي ضيق (بالمثلث)", en: "Close Grip Lat Pulldown", reps: "4×15" },
          { name: "سحب ارضي ضيق (بالمثلث)", en: "Seated Cable Row", reps: "4×15" },
          { name: "T-Bar Row", reps: "4×15" },
          { name: "اسفل الظهر جهاز", en: "Back Extension", reps: "4×15" },
        ],
      },
      {
        name: "تمارين التراي",
        exercises: [
          { name: "مسطره عكس تراي", en: "Reverse Grip Tricep Pushdown", reps: "4×15" },
          { name: "تراي حبل", en: "Tricep Pushdown Straight Rope", reps: "4×15" },
          { name: "مسطره ضيق تراي", en: "Tricep Pushdown Straight Bar", reps: "4×15" },
          { name: "غطس / تراي فوق الراس", reps: "4×15", variants: [{ label: "جهاز غطس", en: "Seated Tricep Pushdown / Bench Dips Machine" }, { label: "فوق الراس", en: "Overhead Tricep Extension" }] },
        ],
      },
    ],
  },
  {
    id: "d3",
    num: 3,
    title: "اليوم الثالث — أكتاف",
    sub: "Shoulders",
    tip: "ثالث يوم لك. اترك للكتف مساحة للحركة، وركّز على ثبات الجذع والتحكم في الوزن خلال كل مجموعة.",
    sections: [
      {
        name: "تمارين أكتاف",
        exercises: [
          { name: "رفرفه امامي", en: "Front Raises", reps: "4×15" },
          { name: "شولدر بريس", reps: "4×15", variants: [{ label: "دامبل بريس", en: "Shoulder Press" }, { label: "جهاز اكتاف", en: "Shoulder Press Machine" }] },
          { name: "رفرفه جانبي", en: "Lateral (Side) Raises", reps: "4×15" },
          { name: "امامي بالقرص", en: "Plate Front Raise", reps: "4×15" },
          { name: "كتف خلفي جهاز", en: "Rear Delt Fly Machine", reps: "4×15" },
          { name: "ترابيس بالبار", en: "Barbell Shrugs", reps: "4×15" },
          { name: "ترابيس بالدامبل", en: "Dumbbell Shrugs", reps: "4×15" },
        ],
      },
    ],
  },
  {
    id: "d4",
    num: 4,
    title: "اليوم الرابع — أرجل",
    sub: "Legs",
    tip: "رابع يوم لك. خذ وقتك في النزول والصعود، وحافظ على نفس ثابت. التمرين القوي هو التمرين الذي تستطيع تكراره بأمان.",
    sections: [
      {
        name: "تمارين أرجل",
        exercises: [
          { name: "رفرفه امامي ارجل", en: "Leg Extension", reps: "4×15" },
          { name: "سكوات / هاك سكوات", reps: "4×15", variants: [{ label: "سكوات", en: "Squats" }, { label: "هاك سكوات", en: "Hack Squats" }] },
          { name: "دفاع (ليج بريس)", en: "Leg Press", reps: "4×15" },
          { name: "رفرفه خلفي ارجل", en: "Leg Curls", reps: "4×15" },
          { name: "طعن", en: "Lunges", reps: "4×15" },
          { name: "جهاز داخلي", en: "Hip Adductor Machine", reps: "4×15" },
          { name: "بطات جهاز", en: "Calf Raise Machine", reps: "4×15" },
        ],
      },
    ],
  },
];

function makeExerciseId(dayId: string, sectionIndex: number, exerciseIndex: number) {
  return `${dayId}-${sectionIndex}-${exerciseIndex}`;
}

function readProgress(): ProgressState {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function getExerciseState(state: ProgressState, id: string): ExerciseState {
  return state[id] ?? { sets: [false, false, false, false], variant: 0 };
}

function getDayTotals(day: WorkoutDay, state: ProgressState) {
  const total = day.sections.reduce((sum, section) => sum + section.exercises.length * 4, 0);
  const done = day.sections.reduce(
    (sum, section, si) =>
      sum + section.exercises.reduce((sectionSum, _exercise, ei) => sectionSum + getExerciseState(state, makeExerciseId(day.id, si, ei)).sets.filter(Boolean).length, 0),
    0,
  );
  return { total, done };
}

function getAllTotals(state: ProgressState) {
  return DAYS.reduce(
    (totals, day) => {
      const dayTotals = getDayTotals(day, state);
      return { total: totals.total + dayTotals.total, done: totals.done + dayTotals.done };
    },
    { total: 0, done: 0 },
  );
}

export default function Home() {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [progress, setProgress] = useState<ProgressState>(() => readProgress());
  const [deferredInstall, setDeferredInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const activeDay = DAYS[activeDayIndex];
  const activeTotals = getDayTotals(activeDay, progress);
  const weekTotals = getAllTotals(progress);
  const weekPercent = Math.round((weekTotals.done / weekTotals.total) * 100);
  const dayPercent = Math.round((activeTotals.done / activeTotals.total) * 100);

  const completedDays = useMemo(
    () => DAYS.filter((day) => {
      const totals = getDayTotals(day, progress);
      return totals.done === totals.total;
    }).length,
    [progress],
  );

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredInstall(event as BeforeInstallPromptEvent);
    };
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const updateProgress = (id: string, nextState: ExerciseState) => {
    setProgress((current) => ({ ...current, [id]: nextState }));
  };

  const toggleSet = (id: string, setIndex: number) => {
    const current = getExerciseState(progress, id);
    const sets = [...current.sets];
    sets[setIndex] = !sets[setIndex];
    updateProgress(id, { ...current, sets });
  };

  const selectVariant = (id: string, variant: number) => {
    updateProgress(id, { ...getExerciseState(progress, id), variant });
  };

  const resetCurrentDay = () => {
    const next = { ...progress };
    activeDay.sections.forEach((section, si) => {
      section.exercises.forEach((_exercise, ei) => {
        const id = makeExerciseId(activeDay.id, si, ei);
        next[id] = { sets: [false, false, false, false], variant: getExerciseState(progress, id).variant };
      });
    });
    setProgress(next);
    toast.success("تصفّر يومك. نبدأ من جديد؟");
  };

  const installApp = async () => {
    if (!deferredInstall) {
      toast("التثبيت متاح من قائمة المتصفح", { description: "افتح القائمة ثم اختر إضافة إلى الشاشة الرئيسية." });
      return;
    }
    await deferredInstall.prompt();
    setDeferredInstall(null);
  };

  return (
    <div className="app-shell">
      <aside className="side-rail" aria-label="التنقل الرئيسي">
        <a className="brand-lockup" href="#top" aria-label="Gym App، الصفحة الرئيسية">
          <span className="brand-mark-wrap"><img src={MARK_IMAGE} alt="" className="brand-mark" /></span>
          <span className="brand-name">GYM<span>APP</span></span>
        </a>
        <div className="rail-rule" />
        <div className="rail-label">هذا الأسبوع</div>
        <div className="rail-week-number">04</div>
        <div className="rail-week-copy">أيام مصممة<br />لتحركك للأمام</div>
        <div className="rail-bottom">
          <button className="rail-action" onClick={installApp} type="button"><Download size={15} /> <span>ثبّت التطبيق</span></button>
          <div className="rail-status"><span className={`status-dot ${isOnline ? "online" : "offline"}`} />{isOnline ? "متصل" : "دون اتصال"}</div>
          <div className="rail-version">GYM / 01</div>
        </div>
      </aside>

      <div className="mobile-topbar">
        <a className="brand-lockup" href="#top" aria-label="Gym App، الصفحة الرئيسية">
          <span className="brand-mark-wrap"><img src={MARK_IMAGE} alt="" className="brand-mark" /></span>
          <span className="brand-name">GYM<span>APP</span></span>
        </a>
        <button className="icon-button" onClick={installApp} aria-label="تثبيت التطبيق" type="button"><Download size={18} /></button>
      </div>

      <main className="content-column" id="top">
        <header className="masthead">
          <div className="masthead-copy">
            <div className="eyebrow"><span className="eyebrow-mark" />دفتر التدريب / أسبوعك الحالي</div>
            <h1>اليوم يبدأ<br /><em>هنا.</em></h1>
            <p className="masthead-lede">لا تحتاج أن تحفظ الخطة. فقط افتح الصفحة، سجّل المجموعة، واترك التقدم يتجمع.</p>
          </div>
          <div className="masthead-image-wrap">
            <img src={HERO_IMAGE} alt="أدوات تدريب مرتبة في استوديو هادئ" className="masthead-image" />
            <div className="image-note"><span>ملاحظة اليوم</span><strong>تقدّم<br />بهدوء</strong></div>
            <div className="image-index">01 <span>/ 04</span></div>
          </div>
        </header>

        <section className="overview-strip" aria-label="ملخص التقدم">
          <div className="overview-main">
            <div className="section-kicker">قراءة الأسبوع <span>WEEKLY READ</span></div>
            <div className="overview-number">{weekPercent}<small>%</small></div>
            <div className="overview-caption">من الخطة مسجّل حتى الآن</div>
          </div>
          <div className="overview-progress"><span style={{ width: `${weekPercent}%` }} /></div>
          <div className="overview-side"><span className="side-number">{completedDays}</span><span>من ٤ أيام<br />مكتملة</span></div>
          <div className="overview-side"><span className="side-number">{weekTotals.done}</span><span>مجموعة<br />منجزة</span></div>
        </section>

        <section className="workout-section" aria-labelledby="workout-heading">
          <div className="section-heading-row">
            <div>
              <div className="section-kicker">الفصل الأول <span>THE ROUTINE</span></div>
              <h2 id="workout-heading">اختر يومك،<br /><span>ثم تحرّك.</span></h2>
            </div>
            <div className="section-side-note">كل تمرين<br />٤ مجموعات × ١٥ عدة</div>
          </div>

          <nav className="day-tabs" aria-label="أيام التمرين">
            {DAYS.map((day, index) => {
              const totals = getDayTotals(day, progress);
              const complete = totals.done === totals.total;
              return (
                <button key={day.id} type="button" className={`day-tab ${index === activeDayIndex ? "active" : ""} ${complete ? "complete" : ""}`} onClick={() => setActiveDayIndex(index)}>
                  <span className="day-tab-number">{String(day.num).padStart(2, "0")}</span>
                  <span className="day-tab-info"><strong>{day.sub}</strong><small>{complete ? "مكتمل" : `${totals.done}/${totals.total} مجموعة`}</small></span>
                  {complete && <Check size={15} />}
                </button>
              );
            })}
          </nav>

          <div className="active-day-header">
            <div>
              <div className="active-day-label">جلسة {String(activeDay.num).padStart(2, "0")} <span>{activeDay.sub}</span></div>
              <h3>{activeDay.title.split(" — ")[1] ?? activeDay.title}</h3>
            </div>
            <div className="active-progress-lockup">
              <div className="progress-ring" style={{ "--progress": `${dayPercent * 3.6}deg` } as CSSProperties}><span>{dayPercent}<small>%</small></span></div>
              <div><span>تقدم الجلسة</span><strong>{activeTotals.done} / {activeTotals.total}</strong></div>
            </div>
          </div>

          <div className="workout-layout">
            <div className="exercise-column">
              {activeDay.sections.map((section, sectionIndex) => (
                <div className="exercise-section" key={section.name}>
                  <div className="exercise-section-heading"><span className="section-line" /><h4>{section.name}</h4><span className="exercise-count">{String(section.exercises.length).padStart(2, "0")}</span></div>
                  <div className="exercise-list">
                    {section.exercises.map((exercise, exerciseIndex) => {
                      const id = makeExerciseId(activeDay.id, sectionIndex, exerciseIndex);
                      const exerciseState = getExerciseState(progress, id);
                      const selectedVariant = exercise.variants?.[exerciseState.variant];
                      return (
                        <article className={`exercise-card ${exerciseState.sets.every(Boolean) ? "is-done" : ""}`} key={id}>
                          <div className="exercise-card-top">
                            <span className="exercise-index">{String(exerciseIndex + 1).padStart(2, "0")}</span>
                            <div className="exercise-name"><strong>{selectedVariant?.label ?? exercise.name}</strong><small>{selectedVariant?.en ?? exercise.en ?? ""}</small></div>
                            <span className="exercise-target">{exercise.reps}</span>
                          </div>
                          {exercise.variants && <div className="variant-switch" role="group" aria-label={`اختيار بديل لـ ${exercise.name}`}>{exercise.variants.map((variant, variantIndex) => <button key={variant.label} type="button" className={variantIndex === exerciseState.variant ? "selected" : ""} onClick={() => selectVariant(id, variantIndex)}>{variant.label}</button>)}</div>}
                          <div className="sets-row"><span className="sets-caption">تسجيل الجولات</span><div className="set-controls">{exerciseState.sets.map((isSetDone, setIndex) => <button type="button" key={setIndex} className={`set-control ${isSetDone ? "done" : ""}`} onClick={() => toggleSet(id, setIndex)} aria-label={`${isSetDone ? "إلغاء" : "تسجيل"} الجولة ${setIndex + 1}`}>{isSetDone ? <Check size={14} /> : setIndex + 1}</button>)}</div></div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <aside className="session-sidebar">
              <div className="session-photo"><img src={WORKOUT_IMAGE} alt="حبل مقاومة وورقة تسجيل تمرين" /><span className="photo-caption">الأداة لا تصنع التمرين.<br />الاستمرارية تفعل.</span></div>
              <div className="tip-card"><div className="tip-icon"><CircleHelp size={18} /></div><div><span className="tip-label">هام قبل البدء</span><p>{activeDay.tip}</p></div></div>
              <button className="reset-day" type="button" onClick={resetCurrentDay}><RotateCcw size={15} /> تصفير هذا اليوم</button>
            </aside>
          </div>
        </section>

        <section className="recovery-section" aria-label="ملاحظة التعافي">
          <div className="recovery-copy"><div className="section-kicker">هامش الصفحة <span>THE MARGIN</span></div><h2>الراحة جزء<br /><em>من الخطة.</em></h2><p>الجسم لا يقرأ الأرقام فقط. اشرب ماءً، نم جيدًا، واترك للعضلة وقتها حتى تعود أقوى.</p><a href="#top" className="text-link">ارجع إلى بداية الأسبوع <ArrowUpLeft size={16} /></a></div>
          <div className="recovery-image-wrap"><img src={RECOVERY_IMAGE} alt="بساط يوغا وزجاجة ماء في ضوء الصباح" /><div className="recovery-stamp"><Sparkles size={14} /><span>استمر<br />بإيقاعك</span></div></div>
        </section>

        <footer className="site-footer"><span>GYM APP / TRAINING JOURNAL</span><span><TimerReset size={14} /> يحفظ تقدمك على هذا الجهاز فقط</span><span>{isOnline ? <Wifi size={14} /> : <WifiOff size={14} />} {isOnline ? "متصل" : "وضع عدم الاتصال"}</span></footer>
      </main>
    </div>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}
