/* ═══════════════════════════════════════════════════════════
   ورد — execution & tracking engine
   Schema 1.0. The monthly plan is imported, never generated here.
   ═══════════════════════════════════════════════════════════ */

const SCHEMA = '1.0';

const TASK_TYPES = ['NEW_MEMORISATION','SAME_DAY_REVIEW','RECENT_REVIEW','RESCUE_REVIEW',
                    'OLD_REVIEW','TEST','CORRECTION','LISTENING','CONSOLIDATION'];
const STATUSES  = ['NEW','FRAGILE','WEAK','STABLE','STRONG','PAUSED','NOT_MEMORISED'];

/* which display section each task type belongs to, and its ordering weight */
const SECTION_OF = {
  NEW_MEMORISATION:'newmem', SAME_DAY_REVIEW:'newmem',
  RESCUE_REVIEW:'rescue',
  RECENT_REVIEW:'recent', CONSOLIDATION:'recent', LISTENING:'recent', CORRECTION:'recent',
  OLD_REVIEW:'old',
  TEST:'test'
};
const SECTION_ORDER = ['rescue','newmem','recent','old','test'];

/* default status priority order (§2b) — lower number = seen first */
const STATUS_RANK = {FRAGILE:1, NEW:2, WEAK:3, STABLE:4, STRONG:5, PAUSED:9, NOT_MEMORISED:9};

const DAYS_AR=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const DAYS_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MON_AR=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const L = {
 ar:{
  app:'ورد', appsub:'الحفظ والمراجعة', today:'اليوم',
  'nav.day':'اليوم','nav.muh':'المحاسبة','nav.inv':'المحفوظ','nav.set':'الإعدادات',
  tasksN:'مهمة', minutes:'دقيقة', target:'المستهدف', expected:'المتوقع', doneN:'مكتملة',
  sec:{rescue:'مراجعة الإنقاذ', newmem:'الحفظ الجديد', recent:'المراجعة القريبة',
       old:'المراجعة القديمة', test:'الاختبار والتسميع', missed:'فائت — بتاريخه الأصلي'},
  types:{NEW_MEMORISATION:'حفظ جديد', SAME_DAY_REVIEW:'مراجعة حفظ اليوم', RECENT_REVIEW:'مراجعة حديثة',
    RESCUE_REVIEW:'إنقاذ مقطع متفلت', OLD_REVIEW:'مراجعة قديمة', TEST:'اختبار غيبًا',
    CORRECTION:'تصحيح بالمصحف', LISTENING:'استماع', CONSOLIDATION:'ربط ووصل'},
  stat:{NEW:'حفظ جديد', FRAGILE:'بدأ يتفلت', WEAK:'ضعيف', STABLE:'ثابت',
        STRONG:'راسخ', PAUSED:'متوقف', NOT_MEMORISED:'غير محفوظ'},
  why:{sched:'مجدولة اليوم', missed:'فائتة من', postponed:'أجّلتها من',
       due:'مراجعة متباعدة مستحقة', over:'تجاوزت وقت اليوم'},
  ayat:'آية', pages:'صفحة', start:'ابدأ', later:'تأجيل', done:'تم',
  noTasks:'لا مهام اليوم.\nاستورد خطة الشهر من الإعدادات.',
  restDay:'يوم راحة — لا مراجعة مجدولة.',
  missedHint:'باقية على تاريخها في الجدول ولا تُضاف إلى حمل اليوم. أكملها متأخرًا أو تجاوزها.',
  muhTitle:'المحاسبة اليومية', all:'الكل', jadwal:'جدول الشهر',
  invAll:'الكل', invSummary:'ملخص الشهر',
  fDone:'مهام مكتملة', fMissed:'مهام فائتة', fMin:'دقائق المراجعة', fMemMin:'دقائق الحفظ',
  fAvg:'متوسط الثبات', fDays:'أيام التزام', fUp:'تحسّن', fDown:'ضعف',
  imp:'الخطة الشهرية', impBtn:'استيراد ملف الشهر (xlsx)', undo:'التراجع عن آخر استيراد',
  tmpl:'تنزيل ملف قالب فارغ',
  impNone:'لم يُستورد أي ملف بعد.', impState:'خطة الشهر',
  exp:'التصدير', expMonth:'تصدير تقدم الشهر (xlsx)', expBackup:'نسخة احتياطية كاملة (JSON)',
  rest:'استعادة من نسخة احتياطية',
  expHint:'البيانات على هذا الجهاز فقط. صدّر نسخة كل شهر — مسح بيانات المتصفح يمحو كل شيء.',
  set:'الإعدادات', s1:'دقائق المراجعة يوميًا', s2:'دقائق الحفظ يوميًا', s3:'يوم الراحة',
  s4:'دقائق الصفحة الافتراضية', s5:'فواصل المراجعة بعد التقييم ١–٥ (أيام)',
  s6:'سُلّم التباعد للمقاطع الراسخة (أيام)', saveSet:'حفظ الإعدادات',
  s7:'التقويم الهجري', s8:'تعديل الهجري (يوم)',
  cals:{'islamic-umalqura':'أم القرى', 'islamic':'الفلكي المعدّل',
        'islamic-civil':'الحسابي المدني', 'islamic-tbla':'الحسابي (فلكي)'},
  setHint:'الجدول المستورد هو المرجع؛ التطبيق لا يعيد توزيع المهام. الفواصل أدناه تُحسب وتُصدَّر لبناء جدول الشهر القادم فقط. التقويم الهجري تقديري — عدّله بيوم إن خالف الرؤية عندك.',
  wipe:'حذف كل البيانات',
  ph1:'المرحلة ١ — التسميع غيبًا', ph2:'المرحلة ٢ — التصحيح بالمصحف',
  cErr:'الأخطاء', cPr:'التوقفات / المساعدة', mk:'علّم موضع خطأ (صفحة أو آية)', add:'إضافة',
  fix:'صححت المواضع بالمصحف', rep:'أعدت المواضع الضعيفة', mem:'تم من الحفظ دون نظر',
  score:'التقييم ١–٥', mins:'الدقائق الفعلية', next:'المراجعة القادمة', notes:'ملاحظات',
  complete:'إتمام المهمة', postpone:'تأجيل ليوم آخر', skip:'تجاوز هذه المهمة', close:'إغلاق',
  pvTitle:'معاينة الاستيراد', pvOk:'تأكيد الاستيراد', cancel:'إلغاء',
  saved:'حُفظ', imported:'تم الاستيراد', undone:'تم التراجع', wiped:'حُذفت كل البيانات',
  needScore:'اختر التقييم من ١ إلى ٥ أولًا.',
  confirmWipe:'سيُحذف كل السجل نهائيًا. متأكد؟',
  rows:'صف', newSeg:'مقطع جديد', updSeg:'مقطع محدَّث', repTasks:'مهام مستقبلية ستُستبدل',
  keptTasks:'مهام مكتملة ستبقى', errRows:'صفوف غير صالحة', noUndo:'لا يوجد استيراد للتراجع عنه.',
  dup:'معرّف مهمة مكرر داخل الملف', missSheet:'الورقة MonthlyPlan غير موجودة',
  badSchema:'إصدار الصيغة غير مدعوم'},
 en:{
  app:'Wird', appsub:'Memorisation & revision', today:'Today',
  'nav.day':'Today','nav.muh':'Audit','nav.inv':'Memorised','nav.set':'Settings',
  tasksN:'tasks', minutes:'min', target:'target', expected:'estimated', doneN:'done',
  sec:{rescue:'Rescue revision', newmem:'New memorisation', recent:'Recent revision',
       old:'Old revision', test:'Test & recitation', deferred:'Deferred — over time budget'},
  types:{NEW_MEMORISATION:'New memorisation', SAME_DAY_REVIEW:'Same-day review', RECENT_REVIEW:'Recent review',
    RESCUE_REVIEW:'Rescue review', OLD_REVIEW:'Old review', TEST:'Test from memory',
    CORRECTION:'Correction with mushaf', LISTENING:'Listening', CONSOLIDATION:'Consolidation'},
  stat:{NEW:'New', FRAGILE:'Slipping', WEAK:'Weak', STABLE:'Stable',
        STRONG:'Solid', PAUSED:'Paused', NOT_MEMORISED:'Not memorised'},
  why:{sched:'Scheduled today', missed:'Missed from', postponed:'You postponed from',
       due:'Spaced review due', over:'Over today\u2019s budget'},
  ayat:'ayah', pages:'page', start:'Start', later:'Postpone', done:'Done',
  noTasks:'No tasks today.\nImport the monthly plan from Settings.',
  restDay:'Rest day \u2014 no revision scheduled.',
  missedHint:'Left on their workbook date and not added to today\u2019s load. Complete late or skip.',
  muhTitle:'Daily audit', all:'All', jadwal:'Month grid',
  invAll:'All', invSummary:'Month summary',
  fDone:'Tasks completed', fMissed:'Tasks missed', fMin:'Revision minutes', fMemMin:'Memorisation minutes',
  fAvg:'Avg stability', fDays:'Days kept', fUp:'Improved', fDown:'Declined',
  imp:'Monthly plan', impBtn:'Import month file (xlsx)', undo:'Undo last import',
  tmpl:'Download blank template',
  impNone:'No file imported yet.', impState:'Plan month',
  exp:'Export', expMonth:'Export monthly progress (xlsx)', expBackup:'Full backup (JSON)',
  rest:'Restore from backup',
  expHint:'Data is on this device only. Export monthly \u2014 clearing browser data wipes everything.',
  set:'Settings', s1:'Revision minutes/day', s2:'Memorisation minutes/day', s3:'Rest day',
  s4:'Default minutes per page', s5:'Interval after score 1\u20135 (days)',
  s6:'Expanding ladder for solid segments (days)', saveSet:'Save settings',
  s7:'Hijri calendar', s8:'Hijri adjustment (days)',
  cals:{'islamic-umalqura':'Umm al-Qura', 'islamic':'Astronomical (adjusted)',
        'islamic-civil':'Tabular (civil)', 'islamic-tbla':'Tabular (astronomical)'},
  setHint:'The imported workbook is authoritative; the app never redistributes. The intervals below are computed and exported to build next month\u2019s plan only. Hijri dates are calculated \u2014 nudge by a day if local sighting differs.',
  wipe:'Erase all data',
  ph1:'Phase 1 \u2014 recite from memory', ph2:'Phase 2 \u2014 correct with the mushaf',
  cErr:'Mistakes', cPr:'Stops / prompts', mk:'Mark an error spot (page or ayah)', add:'Add',
  fix:'Corrected with the mushaf', rep:'Repeated the weak spots', mem:'Done from memory, no looking',
  score:'Rating 1\u20135', mins:'Actual minutes', next:'Next review', notes:'Notes',
  complete:'Complete task', postpone:'Postpone to another day', skip:'Skip this task', close:'Close',
  pvTitle:'Import preview', pvOk:'Confirm import', cancel:'Cancel',
  saved:'Saved', imported:'Imported', undone:'Import undone', wiped:'All data erased',
  needScore:'Choose a rating from 1 to 5 first.',
  confirmWipe:'This erases the whole log permanently. Sure?',
  rows:'rows', newSeg:'new segments', updSeg:'updated segments', repTasks:'future tasks replaced',
  keptTasks:'completed tasks kept', errRows:'invalid rows', noUndo:'No import to undo.',
  dup:'Duplicate task_id inside the file', missSheet:'Sheet MonthlyPlan not found',
  badSchema:'Unsupported schema version'}
};

/* ── muhasaba items (unchanged workbook) ── */
const GROUPS = [
 {id:'sunan', ar:'السنن اليومية', en:'Daily sunan', items:[
  ['wird','ورد القرآن اليومى','Daily Qur\u2019an portion'],
  ['fajr_t','صلاة الصبح في وقتها','Fajr on time'],['fajr_m','صلاة الصبح في المسجد','Fajr in the mosque'],
  ['fajr_s','سنة الفجر (ركعتان قبلية)','Fajr sunnah (2 before)'],['duha','صلاة الضحى','Duha prayer'],
  ['zuhr_t','صلاة الظهر في وقتها','Dhuhr on time'],['zuhr_m','صلاة الظهر في المسجد','Dhuhr in the mosque'],
  ['zuhr_s','سنة الظهر (٤ قبلية + ٢ بعدية)','Dhuhr sunnah (4+2)'],
  ['asr_t','صلاة العصر في وقتها','Asr on time'],['asr_m','صلاة العصر في المسجد','Asr in the mosque'],
  ['asr_s','سنة العصر (ركعتان قبلية)','Asr sunnah (2 before)'],
  ['mgh_t','صلاة المغرب في وقتها','Maghrib on time'],['mgh_m','صلاة المغرب في المسجد','Maghrib in the mosque'],
  ['mgh_s','سنة المغرب (ركعتان بعدية)','Maghrib sunnah (2 after)'],
  ['isha_t','صلاة العشاء في وقتها','Isha on time'],['isha_m','صلاة العشاء في المسجد','Isha in the mosque'],
  ['isha_s','سنة العشاء (ركعتان بعدية)','Isha sunnah (2 after)'],
  ['tahajjud','التهجد','Tahajjud'],['witr','صلاة الوتر','Witr']]},
 {id:'dhikr', ar:'الذكر', en:'Dhikr', items:[
  ['adh_sab','أذكار الصباح','Morning adhkar'],['adh_mas','أذكار المساء','Evening adhkar'],
  ['salawat','الصلاة على النبى ﷺ','Salawat on the Prophet'],
  ['hawqala','لا حول ولا قوة إلا بالله','La hawla wa la quwwata illa billah'],
  ['tasbih','سبحان الله وبحمده ١٠٠ مرة','SubhanAllah wa bihamdih \u00d7100'],
  ['istigh','الاستغفار ١٠٠ مرة','Istighfar \u00d7100']]},
 {id:'amal', ar:'الأعمال الهامة', en:'Key deeds', items:[
  ['sadaqa','الصدقة','Sadaqah'],['sawm_ith','صوم الاثنين','Monday fast',[1]],
  ['sawm_kham','صوم الخميس','Thursday fast',[4]],['dua','الدعاء','Du\u2019a'],
  ['salat_waqt','الصلاة على وقتها (جميعها)','All prayers on time'],
  ['dua_khatm','دعاء ختم الصلاة','Du\u2019a after prayer'],
  ['julus','الجلوس بعد الفجر للعبادة','Sitting after Fajr'],
  ['dua_iftar','دعاء الإفطار','Du\u2019a at iftar'],
  ['muhasaba','محاسبة النفس وتجديد التوبة','Self-accounting & tawbah']]},
 {id:'avoid', ar:'هل امتنعت عن', en:'Did I abstain from', avoid:true, items:[
  ['ghiba','الغيبة والنميمة','Backbiting & tale-carrying'],['ghadab','الغضب والخصومة','Anger & quarrelling'],
  ['tv','الانشغال بالتلفزيون','Time lost to screens'],['bad_trait','صفة سلبية معينة','A specific bad trait']]},
 {id:'keep', ar:'هل حرصت على', en:'Did I keep up', items:[
  ['birr','بر الوالدين','Kindness to parents'],['rahim','صلة الرحم','Keeping family ties'],
  ['ukhuwwa','الأخوة فى الله','Brotherhood for Allah\u2019s sake'],
  ['hubb','الحب والبغض فى الله','Loving & disliking for Allah\u2019s sake'],
  ['ithar','الإيثار','Preferring others'],['good_trait','صفة حسنة جديدة (خاصة)','A new good trait']]}
];

/* ═══════════ STORAGE ═══════════ */
const KEY='wird2';
function blank(){
  return {schema_version:SCHEMA,
    settings:{plan_month:'', daily_review_minutes:30, daily_memorisation_minutes:30,
      rest_day:'Friday', default_page_minutes:4, schedule_version:1, user_name:'',
      mushaf_pages:604, lang:'ar', theme:'auto',
      hijri_calendar:'islamic-umalqura', hijri_offset:0,
      intervals:[1,2,4,7,14], ladder:[14,21,30,45,60]},
    tasks:{}, inventory:{}, log:[], muh:{}, undo:null, lastImport:null};
}
let DB = (()=>{ try{ const r=localStorage.getItem(KEY);
    return r? Object.assign(blank(), JSON.parse(r)) : blank(); }catch(e){ return blank(); } })();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }
  catch(e){ toast('Storage full'); } }
const t = k => L[DB.settings.lang][k] ?? k;
const AR = () => DB.settings.lang==='ar';

const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const pIso = s => { const p=String(s).split('-').map(Number); return new Date(p[0],p[1]-1,p[2]); };
const addDays = (s,n)=>{ const d=pIso(s); d.setDate(d.getDate()+n); return iso(d); };
const TODAY = () => iso(new Date());
let cur = TODAY();

/* ═══════════ HIJRI ═══════════
   Uses the browser's own Intl calendar data — no library, works offline.
   Variants disagree by up to two days and local sighting can differ again,
   so the user can pick the variant and nudge it ±2 days.               */
const HIJRI_CALS = ['islamic-umalqura','islamic','islamic-civil','islamic-tbla'];
function hijriParts(dateStr, latinDigits){
  const d = pIso(dateStr);
  const off = Number(DB.settings.hijri_offset)||0;
  const shifted = new Date(d.getFullYear(), d.getMonth(), d.getDate()+off);
  const cal = HIJRI_CALS.includes(DB.settings.hijri_calendar)
    ? DB.settings.hijri_calendar : 'islamic-umalqura';
  const loc = (AR()?'ar':'en')+'-u-ca-'+cal+(latinDigits?'-nu-latn':'');
  try{
    const ps = new Intl.DateTimeFormat(loc,{day:'numeric',month:'long',year:'numeric'})
      .formatToParts(shifted);
    const g = k => (ps.find(x=>x.type===k)||{}).value || '';
    return {day:g('day'), month:g('month'), year:g('year')};
  }catch(e){ return {day:'',month:'',year:''}; }
}
function hijriFull(dateStr){
  const h = hijriParts(dateStr, true);   // match the Gregorian line's digits
  if(!h.day) return '';
  return `${h.day} ${h.month} ${h.year}${AR()?' هـ':' AH'}`;
}

/* ═══════════ SPACED REPETITION (§4, §5) ═══════════ */
function nextInterval(inv, score){
  const iv = DB.settings.intervals, ld = DB.settings.ladder;
  const prev = inv.current_interval || 0;
  if(score <= 3) return iv[score-1];
  if(score === 4) return Math.max(iv[3], prev);          // hold, don't expand
  // score 5 — climb the ladder
  if(prev < ld[0]) return ld[0];
  const i = ld.findIndex(x => x > prev);
  return i === -1 ? ld[ld.length-1] : ld[i];
}
function statusFromScore(inv, score){
  const s = inv.memorisation_status;
  if(s==='PAUSED' || s==='NOT_MEMORISED') return s;
  if(score<=1) return 'WEAK';
  if(score===2) return 'WEAK';
  if(score===3) return 'FRAGILE';
  if(score===4) return s==='NEW' && (inv.consecutive_good_reviews||0)<1 ? 'NEW' : 'STABLE';
  return (inv.consecutive_good_reviews||0) >= 1 ? 'STRONG' : 'STABLE';
}
function applyResult(task, res){
  const id = task.segment_id || segKeyOf(task);
  const inv = DB.inventory[id] || (DB.inventory[id] = seedSegment(task, id));
  const before = Number(inv.stability_score)||0;

  inv.stability_score = res.result_score;
  inv.total_reviews = (inv.total_reviews||0) + 1;
  inv.total_errors  = (inv.total_errors||0) + (Number(res.mistakes_count)||0);
  inv.consecutive_good_reviews = res.result_score >= 4 ? (inv.consecutive_good_reviews||0)+1 : 0;
  inv.memorisation_status = statusFromScore(inv, res.result_score);
  inv.current_interval = nextInterval(inv, res.result_score);
  inv.last_review_date = TODAY();
  inv.next_review_date = addDays(TODAY(), inv.current_interval);
  inv.trend = before ? (res.result_score > before ? 'up' : res.result_score < before ? 'down' : 'flat') : 'flat';
  return inv;
}
function segKeyOf(tk){
  return 'S'+(tk.surah_number||0)+'_'+(tk.start_ayah||tk.start_page||0)+'_'+(tk.end_ayah||tk.end_page||0);
}
function seedSegment(tk, id){
  return {segment_id:id, surah_name_ar:tk.surah_name_ar, surah_number:tk.surah_number,
    start_ayah:tk.start_ayah, end_ayah:tk.end_ayah, start_page:tk.start_page, end_page:tk.end_page,
    memorised_date:'', memorisation_status:tk.memorisation_status||'NEW',
    stability_score:tk.stability_score||3, last_review_date:'', next_review_date:'',
    total_reviews:0, total_errors:0, consecutive_good_reviews:0, current_interval:0, notes:''};
}

/* ═══════════ DAY BUILDER (§2c, §8) ═══════════ */
function isRestDay(dateStr){
  const names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return names[pIso(dateStr).getDay()] === DB.settings.rest_day;
}
function minutesOf(tk){
  if(tk.estimated_minutes) return Number(tk.estimated_minutes);
  const pages = (tk.end_page && tk.start_page) ? (tk.end_page - tk.start_page + 1) : 1;
  return pages * (Number(DB.settings.default_page_minutes)||4);
}
function isMemTrack(tk){ return tk.task_type==='NEW_MEMORISATION' || tk.task_type==='SAME_DAY_REVIEW'; }

/* The workbook is the schedule. This only labels state — it never moves,
   defers, redistributes or adds a task. A day's contents always equal the
   imported rows for that date.                                            */
function normalise(){
  const today = TODAY();
  Object.values(DB.tasks).forEach(x=>{
    delete x.over_budget; delete x.moved_from;      // retired concepts
    if(!x.scheduled_date) x.scheduled_date = x.date;
    x.missed = x.state==='pending' && x.scheduled_date < today;
    if(x.missed && !x.missed_from) x.missed_from = x.scheduled_date;
  });
  save();
}
function rank(x){
  return (STATUS_RANK[x.memorisation_status]||5)*10 + SECTION_ORDER.indexOf(SECTION_OF[x.task_type]||'recent');
}
function dayTasks(dateStr){
  return Object.values(DB.tasks)
    .filter(x => (x.scheduled_date||x.date) === dateStr)
    .sort((a,b)=> (a.priority-b.priority) || (rank(a)-rank(b)));
}
/* The ONLY code path that changes a task's date. User-initiated, one day at a
   time, from the تأجيل button. Nothing automatic ever calls this.          */
function postpone(x){
  if(!x.postponed_from) x.postponed_from = x.scheduled_date || x.date;
  x.scheduled_date = addDays(x.scheduled_date || x.date, 1);
  x.postponed_count = (x.postponed_count||0) + 1;
}

/* Missed work is surfaced on its own, never folded into another day. */
function missedTasks(){
  return Object.values(DB.tasks).filter(x=>x.missed)
    .sort((a,b)=> a.scheduled_date < b.scheduled_date ? 1 : -1);
}
function whyShown(x){
  if(x.missed) return t('why').missed + ' ' + x.missed_from;
  if(x.postponed_from) return t('why').postponed + ' ' + x.postponed_from;
  return t('why').sched;
}
function rangeText(x){
  if(x.start_page) return t('pages')+' '+x.start_page+(x.end_page&&x.end_page!==x.start_page?'\u2013'+x.end_page:'');
  if(x.start_ayah) return t('ayat')+' '+x.start_ayah+(x.end_ayah&&x.end_ayah!==x.start_ayah?'\u2013'+x.end_ayah:'');
  return '';
}

/* ═══════════ IMPORT (§10–§14) ═══════════ */
function cell(r,k){ const v=r[k]; return v===undefined||v===null||v==='' ? '' : v; }
function toIsoDate(v){
  if(v instanceof Date) return iso(v);
  if(typeof v==='number'){ const d=XLSX.SSF.parse_date_code(v); return d? `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`:''; }
  const s=String(v).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}
function parseWorkbook(buf){
  const wb = XLSX.read(buf,{type:'array',cellDates:true});
  if(!wb.Sheets['MonthlyPlan']) throw new Error(t('missSheet'));

  const settings = {};
  if(wb.Sheets['Settings'])
    XLSX.utils.sheet_to_json(wb.Sheets['Settings']).forEach(r=>{
      const k=cell(r,'key'), v=cell(r,'value'); if(k!=='') settings[k]=v; });

  const rawPlan = XLSX.utils.sheet_to_json(wb.Sheets['MonthlyPlan'],{defval:''});
  const rawInv  = wb.Sheets['MemorisationInventory']
    ? XLSX.utils.sheet_to_json(wb.Sheets['MemorisationInventory'],{defval:''}) : [];

  const errors=[], seen=new Set(), tasks=[];
  rawPlan.forEach((r,i)=>{
    const row=i+2, e=[];
    const id = String(cell(r,'task_id')).trim();
    const date = toIsoDate(cell(r,'date'));
    const type = String(cell(r,'task_type')).trim().toUpperCase();
    const pr = Number(cell(r,'priority'));
    if(!id) e.push('task_id');
    else if(seen.has(id)) e.push(t('dup'));
    if(!date) e.push('date');
    if(!TASK_TYPES.includes(type)) e.push('task_type');
    if(!(pr>=1&&pr<=5)) e.push('priority');
    const sa=Number(cell(r,'start_ayah'))||0, ea=Number(cell(r,'end_ayah'))||0;
    const sp=Number(cell(r,'start_page'))||0, ep=Number(cell(r,'end_page'))||0;
    if(!sa && !sp && type!=='TEST') e.push('ayah/page');   // TEST pages are chosen at execution
    const st = String(cell(r,'memorisation_status')).trim().toUpperCase();
    if(st && !STATUSES.includes(st)) e.push('memorisation_status');
    if(e.length){ errors.push({row, id:id||'—', msg:e.join(', ')}); return; }
    seen.add(id);
    tasks.push({task_id:id, date, scheduled_date:date,
      surah_name_ar:String(cell(r,'surah_name_ar')), surah_number:Number(cell(r,'surah_number'))||0,
      start_ayah:sa, end_ayah:ea, start_page:sp, end_page:ep,
      task_type:type, priority:pr,
      estimated_minutes:Number(cell(r,'estimated_minutes'))||0,
      memorisation_status:st||'NEW',
      stability_score:Number(cell(r,'stability_score'))||0,
      notes:String(cell(r,'notes')), source_month:String(cell(r,'source_month')),
      segment_id:String(cell(r,'segment_id')||'').trim()||'',
      state:'pending'});
  });

  const segs=[];
  rawInv.forEach((r,i)=>{
    const id=String(cell(r,'segment_id')).trim(); if(!id) return;
    segs.push({segment_id:id,
      surah_name_ar:String(cell(r,'surah_name_ar')), surah_number:Number(cell(r,'surah_number'))||0,
      start_ayah:Number(cell(r,'start_ayah'))||0, end_ayah:Number(cell(r,'end_ayah'))||0,
      start_page:Number(cell(r,'start_page'))||0, end_page:Number(cell(r,'end_page'))||0,
      memorised_date:toIsoDate(cell(r,'memorised_date')),
      memorisation_status:String(cell(r,'memorisation_status')).trim().toUpperCase()||'NEW',
      stability_score:Number(cell(r,'stability_score'))||3,
      last_review_date:toIsoDate(cell(r,'last_review_date')),
      next_review_date:toIsoDate(cell(r,'next_review_date')),
      total_reviews:Number(cell(r,'total_reviews'))||0,
      total_errors:Number(cell(r,'total_errors'))||0,
      consecutive_good_reviews:Number(cell(r,'consecutive_good_reviews'))||0,
      notes:String(cell(r,'notes'))});
  });
  return {settings, tasks, segs, errors};
}
function applyImport(P){
  DB.undo = JSON.parse(JSON.stringify({tasks:DB.tasks, inventory:DB.inventory,
                                       settings:DB.settings, lastImport:DB.lastImport}));
  const today = TODAY();
  // §14: keep completed; replace only future incomplete
  Object.keys(DB.tasks).forEach(k=>{
    const x=DB.tasks[k];
    if(x.state==='pending' && (x.scheduled_date||x.date) >= today) delete DB.tasks[k];
  });
  P.tasks.forEach(tk=>{ if(!DB.tasks[tk.task_id]) DB.tasks[tk.task_id]=tk; });

  P.segs.forEach(s=>{
    const ex = DB.inventory[s.segment_id];
    if(ex){                                  // update, never wipe accumulated history
      ex.surah_name_ar=s.surah_name_ar; ex.surah_number=s.surah_number;
      ex.start_ayah=s.start_ayah; ex.end_ayah=s.end_ayah;
      ex.start_page=s.start_page; ex.end_page=s.end_page;
      ex.memorisation_status=s.memorisation_status;
      if(!ex.total_reviews){ ex.stability_score=s.stability_score;
        ex.next_review_date=s.next_review_date; }
      ex.notes = s.notes || ex.notes;
    } else DB.inventory[s.segment_id] = Object.assign({current_interval:0}, s);
  });

  ['plan_month','daily_review_minutes','daily_memorisation_minutes','rest_day',
   'default_page_minutes','schedule_version','user_name','mushaf_pages'].forEach(k=>{
    if(P.settings[k]!==undefined && P.settings[k]!=='') DB.settings[k]=P.settings[k];
  });
  DB.lastImport = {at:new Date().toISOString(), month:DB.settings.plan_month||'',
                   tasks:P.tasks.length, segs:P.segs.length};
  save(); normalise();
}

/* ═══════════ EXPORT (§13, §15) ═══════════ */
function aoa(rows){ return XLSX.utils.aoa_to_sheet(rows); }
function exportMonthly(){
  const wb = XLSX.utils.book_new();
  const month = DB.settings.plan_month || TODAY().slice(0,7);

  const logRows=[['log_id','task_id','completed_at','actual_minutes','result_score','mistakes_count',
    'prompts_count','completed_from_memory','notes','calculated_next_review','sync_status']];
  DB.log.forEach(r=>logRows.push([r.log_id,r.task_id,r.completed_at,r.actual_minutes,r.result_score,
    r.mistakes_count,r.prompts_count,r.completed_from_memory?'YES':'NO',r.notes,
    r.calculated_next_review,r.sync_status||'LOCAL']));
  XLSX.utils.book_append_sheet(wb, aoa(logRows), 'ReviewLog');

  const invRows=[['segment_id','surah_name_ar','surah_number','start_ayah','end_ayah','start_page','end_page',
    'memorised_date','memorisation_status','stability_score','last_review_date','next_review_date',
    'total_reviews','total_errors','consecutive_good_reviews','notes']];
  Object.values(DB.inventory).forEach(s=>invRows.push([s.segment_id,s.surah_name_ar,s.surah_number,
    s.start_ayah,s.end_ayah,s.start_page,s.end_page,s.memorised_date,s.memorisation_status,
    s.stability_score,s.last_review_date,s.next_review_date,s.total_reviews,s.total_errors,
    s.consecutive_good_reviews,s.notes]));
  XLSX.utils.book_append_sheet(wb, aoa(invRows), 'MemorisationInventory');

  const missRows=[['task_id','workbook_date','surah_name_ar','task_type','priority',
    'current_date','postponed_count','current_state']];
  Object.values(DB.tasks).filter(x=>x.missed || x.state==='skipped' || x.postponed_count)
    .forEach(x=>missRows.push([x.task_id,x.date,x.surah_name_ar,x.task_type,x.priority,
      x.scheduled_date||x.date,x.postponed_count||0,x.missed?'MISSED':x.state]));
  XLSX.utils.book_append_sheet(wb, aoa(missRows), 'MissedTasks');

  const weakRows=[['segment_id','surah_name_ar','memorisation_status','stability_score',
    'total_errors','last_review_date','next_review_date']];
  Object.values(DB.inventory)
    .filter(s=>Number(s.stability_score)<=3 || ['WEAK','FRAGILE'].includes(s.memorisation_status))
    .sort((a,b)=>a.stability_score-b.stability_score)
    .forEach(s=>weakRows.push([s.segment_id,s.surah_name_ar,s.memorisation_status,s.stability_score,
      s.total_errors,s.last_review_date,s.next_review_date]));
  XLSX.utils.book_append_sheet(wb, aoa(weakRows), 'WeakSegments');

  const M = summary(month);
  const sumRows=[['metric','value'],
    ['plan_month',month],
    ['days_kept',M.days],['review_minutes',M.revMin],['memorisation_minutes',M.memMin],
    ['new_pages',M.newPages],['tasks_completed',M.done],['tasks_missed',M.missed],
    ['segments_improved',M.up],['segments_declined',M.down],
    ['average_stability',M.avg],['most_needed_surahs',M.needy.join(' / ')],
    ['exported_at',new Date().toISOString()],['schema_version',SCHEMA]];
  XLSX.utils.book_append_sheet(wb, aoa(sumRows), 'MonthlySummary');

  const buf = XLSX.write(wb,{bookType:'xlsx',type:'array'});
  dl('wird-progress-'+month+'.xlsx', new Blob([buf],
     {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
}
function summary(month){
  const inM = s => String(s||'').slice(0,7)===month;
  const logs = DB.log.filter(r=>inM(r.completed_at));
  const done = logs.length;
  const days = new Set(logs.map(r=>String(r.completed_at).slice(0,10))).size;
  let revMin=0, memMin=0, newPages=0;
  logs.forEach(r=>{
    const tk=DB.tasks[r.task_id];
    const m=Number(r.actual_minutes)||0;
    if(tk && isMemTrack(tk)){ memMin+=m;
      if(tk.task_type==='NEW_MEMORISATION' && tk.end_page && tk.start_page)
        newPages += tk.end_page-tk.start_page+1;
    } else revMin+=m;
  });
  const missed = Object.values(DB.tasks).filter(x=>inM(x.date) && (x.missed_count>0||x.state==='skipped')).length;
  const invs = Object.values(DB.inventory).filter(s=>s.total_reviews>0);
  const avg = invs.length ? (invs.reduce((a,b)=>a+Number(b.stability_score||0),0)/invs.length).toFixed(2) : '';
  const up = invs.filter(s=>s.trend==='up').length, down = invs.filter(s=>s.trend==='down').length;
  const needy = Object.values(DB.inventory)
    .filter(s=>Number(s.stability_score)<=3)
    .sort((a,b)=>a.stability_score-b.stability_score).slice(0,5).map(s=>s.surah_name_ar);
  return {done,days,revMin,memMin,newPages,missed,avg,up,down,needy};
}
function template(){
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, aoa([['task_id','date','surah_name_ar','surah_number','start_ayah',
    'end_ayah','start_page','end_page','task_type','priority','estimated_minutes',
    'memorisation_status','stability_score','notes','source_month','segment_id']]), 'MonthlyPlan');
  XLSX.utils.book_append_sheet(wb, aoa([['segment_id','surah_name_ar','surah_number','start_ayah','end_ayah',
    'start_page','end_page','memorised_date','memorisation_status','stability_score','last_review_date',
    'next_review_date','total_reviews','total_errors','consecutive_good_reviews','notes']]), 'MemorisationInventory');
  XLSX.utils.book_append_sheet(wb, aoa([['key','value'],
    ['plan_month',TODAY().slice(0,7)],['daily_review_minutes',30],['daily_memorisation_minutes',30],
    ['rest_day','Friday'],['default_page_minutes',4],['schedule_version',1],
    ['user_name',DB.settings.user_name||''],['mushaf_pages',604],['schema_version',SCHEMA]]), 'Settings');
  XLSX.utils.book_append_sheet(wb, aoa([['field','allowed values'],
    ['task_type',TASK_TYPES.join(' | ')],['memorisation_status',STATUSES.join(' | ')],
    ['priority','1 (highest) .. 5'],['stability_score','1 .. 5'],
    ['date','YYYY-MM-DD'],['rule','either ayah range or page range is required']]), 'Schema');
  const buf = XLSX.write(wb,{bookType:'xlsx',type:'array'});
  dl('wird-template-'+SCHEMA+'.xlsx', new Blob([buf],
     {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
}
function dl(name, blob){
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

/* ═══════════ RENDER ═══════════ */
const $ = s=>document.querySelector(s), $$ = s=>[...document.querySelectorAll(s)];

function applyTheme(){
  const th = DB.settings.theme;
  const dark = th==='dark' || (th==='auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark?'dark':'light');
}
function applyLang(){
  document.body.dir = AR()?'rtl':'ltr';
  document.documentElement.lang = AR()?'ar':'en';
  $('#langBtn').textContent = AR()?'EN':'ع';
  $('#hTitle').textContent=t('app'); $('#hSub').textContent=t('appsub');
  $('#todayBtn').textContent=t('today');
  $$('[data-t]').forEach(e=>e.textContent=t(e.dataset.t));
  const set = (id,k)=>{ const e=$(id); if(e) e.textContent=t(k); };
  set('#jadwalL','jadwal'); set('#impL','imp'); set('#impBtn','impBtn'); set('#undoImp','undo');
  set('#tmplBtn','tmpl'); set('#expL','exp'); set('#expMonth','expMonth'); set('#expBackup','expBackup');
  set('#restBtn','rest'); set('#expHint','expHint'); set('#setL','set');
  set('#s1L','s1'); set('#s2L','s2'); set('#s3L','s3'); set('#s4L','s4'); set('#s5L','s5'); set('#s6L','s6');
  set('#saveSet','saveSet'); set('#setHint','setHint'); set('#wipe','wipe');
  set('#ph1L','ph1'); set('#ph2L','ph2'); set('#cErrL','cErr'); set('#cPrL','cPr'); set('#mkL','mk');
  set('#mkAdd','add'); set('#fixL','fix'); set('#repL','rep'); set('#memL','mem'); set('#scL','score');
  set('#minL','mins'); set('#nxtL','next'); set('#ntL','notes'); set('#tdSave','complete');
  set('#tdLater','postpone'); set('#tdSkip','skip'); set('#tdCancel','close');
  set('#pvTitle','pvTitle'); set('#pvOk','pvOk'); set('#pvCancel','cancel');
  const rd=$('#sRest'); rd.innerHTML = (AR()?DAYS_AR:DAYS_EN)
    .map((n,i)=>`<option value="${DAYS_EN[i]}">${n}</option>`).join('');
  rd.value = DB.settings.rest_day;
  const hc=$('#sHijCal');
  hc.innerHTML = HIJRI_CALS.map(c=>`<option value="${c}">${t('cals')[c]}</option>`).join('');
  hc.value = DB.settings.hijri_calendar;
  const ho=$('#sHijOff');
  ho.innerHTML = [-2,-1,0,1,2].map(v=>
    `<option value="${v}">${v>0?'+':''}${v}</option>`).join('');
  ho.value = String(DB.settings.hijri_offset||0);
  set('#s7L','s7'); set('#s8L','s8');
  renderAll();
}
function renderDate(){
  const d=pIso(cur);
  $('#dMain').textContent = AR()?DAYS_AR[d.getDay()]:DAYS_EN[d.getDay()];
  $('#dSub').textContent = AR()? `${d.getDate()} ${MON_AR[d.getMonth()]} ${d.getFullYear()}`
    : d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  $('#dHij').textContent = hijriFull(cur);
}
function renderDay(){
  const list = dayTasks(cur);
  const rev = list.filter(x=>!isMemTrack(x)), mem = list.filter(x=>isMemTrack(x));
  const est = list.reduce((s,x)=>s+minutesOf(x),0);
  const done = list.filter(x=>x.state==='done').length;
  const pct = list.length? Math.round(done/list.length*100):0;
  $('#dayHead').innerHTML = `
    <div class="kpi">
      <div><div class="n">${list.length}</div><div class="u">${t('tasksN')}</div></div>
      <div><div class="n">${est}</div><div class="u">${t('expected')} ${t('minutes')}</div></div>
      <div><div class="n">${DB.settings.daily_review_minutes}</div>
        <div class="u">${t('target')}</div></div>
      <div style="margin-inline-start:auto;text-align:end"><div class="n">${done}/${list.length}</div>
        <div class="u">${t('doneN')}</div></div>
    </div><div class="bar"><i style="width:${pct}%"></i></div>`;

  if(!list.length){
    $('#dayTasks').innerHTML = `<div class="empty">${
      isRestDay(cur) ? t('restDay') : t('noTasks').replace(/\n/g,'<br>')}</div>`;
    return;
  }
  let html='';
  SECTION_ORDER.forEach(sec=>{
    const items = list.filter(x=>(SECTION_OF[x.task_type]||'recent')===sec);
    if(!items.length) return;
    html += `<div class="sect ${sec}"><div class="hd"><span class="dot"></span>${t('sec')[sec]}
      <span style="margin-inline-start:auto;font-weight:400">${items.reduce((s,x)=>s+minutesOf(x),0)} ${t('minutes')}</span></div>`;
    items.forEach(x=>html+=taskCard(x,sec));
    html += `</div>`;
  });
  if(cur===TODAY()){
    const miss = missedTasks();
    if(miss.length){
      html += `<div class="sect deferred"><div class="hd"><span class="dot"></span>${t('sec').missed}
        <span style="margin-inline-start:auto;font-weight:400">${miss.length}</span></div>
        <div class="hint" style="margin:0 3px 8px">${t('missedHint')}</div>`;
      miss.slice(0,12).forEach(x=>html+=taskCard(x,'deferred'));
      html += `</div>`;
    }
  }
  $('#dayTasks').innerHTML = html;
}
function taskCard(x, sec){
  const cls = sec==='deferred' ? 'deferred' : sec;
  const st = x.memorisation_status;
  const badgeCls = ['WEAK','FRAGILE'].includes(st)?'r':['NEW'].includes(st)?'w':'g';
  return `<div class="task ${cls} ${x.state!=='pending'?'done':''}" data-task="${x.task_id}">
    <div class="ttl">${x.surah_name_ar||'—'}</div>
    <div class="rng">${rangeText(x)} · ${minutesOf(x)} ${t('minutes')}</div>
    <div class="why"><span class="badge">${t('types')[x.task_type]||x.task_type}</span>
      <span class="badge ${badgeCls}">${t('stat')[st]||st}</span>
      <span>${x.state==='pending'? whyShown(x) : (x.state==='done'?t('doneN'):t('skip'))}</span></div>
    ${x.state==='pending'?`<div class="acts">
      <button class="go" data-open="${x.task_id}">${t('start')}</button>
      <button data-later="${x.task_id}">${t('later')}</button>
      <button data-quick="${x.task_id}">${t('done')}</button></div>`:''}
  </div>`;
}
function renderMuh(){
  const rec = DB.muh[cur]||{}, dow = pIso(cur).getDay();
  let total=0,done=0,html='';
  GROUPS.forEach(g=>{
    const items=g.items.filter(i=>!i[3]||i[3].includes(dow));
    const gd=items.filter(i=>rec[i[0]]).length; total+=items.length; done+=gd;
    html+=`<details class="grp ${g.avoid?'avoid':''}" ${gd<items.length?'open':''}>
      <summary>${AR()?g.ar:g.en}<span class="count">${gd}/${items.length}</span>
      <button class="allbtn" data-all="${g.id}">${t('all')}</button></summary>`;
    items.forEach(i=>html+=`<div class="item ${rec[i[0]]?'done':''}" data-i="${i[0]}">
      <span class="box"></span><span class="t">${AR()?i[1]:i[2]}</span>
      ${i[3]?`<span class="flag">${(AR()?DAYS_AR:DAYS_EN)[i[3][0]].slice(0,AR()?9:3)}</span>`:''}</div>`);
    html+=`</details>`;
  });
  $('#muhGroups').innerHTML=html;
  const pct= total?Math.round(done/total*100):0;
  $('#muhHead').innerHTML=`<div class="kpi"><div><div class="n">${pct}%</div><div class="u">${t('muhTitle')}</div></div>
    <div style="margin-inline-start:auto;text-align:end"><div class="n">${done}/${total}</div></div></div>
    <div class="bar"><i style="width:${pct}%"></i></div>`;
  renderJadwal();
}
function renderJadwal(){
  const d=pIso(cur), y=d.getFullYear(), m=d.getMonth();
  const n=new Date(y,m+1,0).getDate();
  const key=i=>`${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
  const today=TODAY();

  // caption — Gregorian month plus the Hijri month(s) it straddles
  const h1=hijriParts(key(1)), hN=hijriParts(key(n));
  const gLabel = AR()? `${MON_AR[m]} ${y}`
    : d.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  const hLabel = !h1.month ? '' : (h1.month===hN.month
      ? `${h1.month} ${h1.year}`
      : `${h1.month} \u2013 ${hN.month} ${hN.year}`) + (AR()?' هـ':' AH');
  const cap = `<div class="cap"><b>${gLabel}</b>${hLabel?` · <i>${hLabel}</i>`:''}</div>`;

  let g='<tr><th class="lab"></th>', hj='<tr><th class="lab"></th>';
  for(let i=1;i<=n;i++){
    const k=key(i), td=k===today?' tdy':'';
    g  += `<td class="dnum${td}">${i%5===0||i===1?i:''}</td>`;
    hj += `<td class="hnum${td}">${hijriParts(k,true).day||''}</td>`;
  }
  g+='</tr>'; hj+='</tr>';

  let body='';
  GROUPS.forEach((gr,gi)=>{
    if(gi) body+=`<tr class="sep"><td colspan="${n+1}"></td></tr>`;
    gr.items.forEach(it=>{
      body+=`<tr><th class="lab">${AR()?it[1]:it[2]}</th>`;
      for(let i=1;i<=n;i++){
        const k=key(i), on=DB.muh[k]&&DB.muh[k][it[0]];
        body+=`<td class="${k===today?'tc':''}"><div class="cell ${on?(gr.avoid?'a':'f'):''}"></div></td>`;
      }
      body+='</tr>';
    });
  });
  $('#jadwal').innerHTML=cap+`<table>${g}${hj}${body}</table>`;
}
let invFilter='ALL';
function renderInv(){
  const M = summary(DB.settings.plan_month || TODAY().slice(0,7));
  $('#invSummary').innerHTML = `<h3>${t('invSummary')}</h3><div class="kpi">
    <div><div class="n">${M.done}</div><div class="u">${t('fDone')}</div></div>
    <div><div class="n">${M.missed}</div><div class="u">${t('fMissed')}</div></div>
    <div><div class="n">${M.avg||'—'}</div><div class="u">${t('fAvg')}</div></div>
    <div><div class="n">${M.days}</div><div class="u">${t('fDays')}</div></div>
    <div><div class="n">${M.revMin}</div><div class="u">${t('fMin')}</div></div>
    <div><div class="n">${M.memMin}</div><div class="u">${t('fMemMin')}</div></div>
    <div><div class="n">${M.up}</div><div class="u">${t('fUp')}</div></div>
    <div><div class="n">${M.down}</div><div class="u">${t('fDown')}</div></div></div>`;

  const opts=['ALL',...STATUSES];
  $('#invFilters').innerHTML = opts.map(o=>
    `<button data-f="${o}" class="${invFilter===o?'on':''}">${o==='ALL'?t('invAll'):t('stat')[o]}</button>`).join('');

  const list = Object.values(DB.inventory)
    .filter(s=>invFilter==='ALL'||s.memorisation_status===invFilter)
    .sort((a,b)=>(STATUS_RANK[a.memorisation_status]||5)-(STATUS_RANK[b.memorisation_status]||5)
      || (a.stability_score-b.stability_score));
  $('#invList').innerHTML = list.length ? list.map(s=>{
    const rng = s.start_page? `${t('pages')} ${s.start_page}\u2013${s.end_page}`
              : s.start_ayah? `${t('ayat')} ${s.start_ayah}\u2013${s.end_ayah}` : '';
    const cls = ['WEAK','FRAGILE'].includes(s.memorisation_status)?'r':
                s.memorisation_status==='NEW'?'w':'g';
    return `<div class="seg"><div class="top"><span class="nm">${s.surah_name_ar||s.segment_id}</span>
      <span class="badge ${cls}">${t('stat')[s.memorisation_status]||s.memorisation_status}</span></div>
      <div class="meta">${rng} · <span class="stars">${[1,2,3,4,5].map(i=>
        `<i class="${i<=Number(s.stability_score)?'on':''}"></i>`).join('')}</span>
        ${s.next_review_date?` · ${t('next')}: ${s.next_review_date}`:''}
        ${s.total_reviews?` · ${s.total_reviews}\u00d7`:''}</div></div>`;
  }).join('') : `<div class="empty">${t('impNone')}</div>`;
}
function renderSet(){
  const S=DB.settings;
  $('#sRev').value=S.daily_review_minutes; $('#sMem').value=S.daily_memorisation_minutes;
  $('#sPage').value=S.default_page_minutes; $('#sRest').value=S.rest_day;
  $('#sInt').value=S.intervals.join(','); $('#sLad').value=S.ladder.join(',');
  $('#sHijCal').value=S.hijri_calendar; $('#sHijOff').value=String(S.hijri_offset||0);
  const li=DB.lastImport;
  $('#impState').textContent = li
    ? `${t('impState')}: ${li.month||'—'} · ${li.tasks} ${t('tasksN')} · ${li.segs} ${t('newSeg')} · ${li.at.slice(0,10)}`
    : t('impNone');
}
function renderAll(){ renderDate(); renderDay(); renderMuh(); renderInv(); renderSet(); }

/* ═══════════ TASK EXECUTION SHEET (§7) ═══════════ */
let activeTask=null, draft=null;
function openTask(id){
  const x=DB.tasks[id]; if(!x) return;
  activeTask=x;
  draft={mistakes:0, prompts:0, marks:[], fix:false, rep:false, mem:true, score:0,
         minutes:minutesOf(x), notes:''};
  $('#tdTitle').textContent = x.surah_name_ar||'—';
  $('#tdSub').textContent = `${t('types')[x.task_type]||x.task_type} · ${rangeText(x)}`;
  paintDraft(); $('#taskDlg').showModal();
}
function paintDraft(){
  $('#cErr').textContent=draft.mistakes; $('#cPr').textContent=draft.prompts;
  $('#mkList').innerHTML = draft.marks.map((m,i)=>`<span data-mk="${i}">${m} \u00d7</span>`).join('');
  $('#bxFix').parentElement.classList.toggle('done',draft.fix);
  $('#bxRep').parentElement.classList.toggle('done',draft.rep);
  $('#bxMem').parentElement.classList.toggle('done',draft.mem);
  $('#scSeg').innerHTML=[1,2,3,4,5].map(n=>
    `<button data-sc="${n}" class="${draft.score===n?'sel':''}">${n}</button>`).join('');
  $('#tdMin').value=draft.minutes; $('#tdNote').value=draft.notes;
  if(draft.score){
    const id = activeTask.segment_id||segKeyOf(activeTask);
    const inv = DB.inventory[id]||seedSegment(activeTask,id);
    $('#tdNext').value = addDays(TODAY(), nextInterval(inv, draft.score));
  } else $('#tdNext').value='';
}
function completeTask(){
  if(!draft.score){ toast(t('needScore')); return; }
  const x=activeTask;
  const inv = applyResult(x, {result_score:draft.score, mistakes_count:draft.mistakes});
  DB.log.push({log_id:'L'+Date.now(), task_id:x.task_id, completed_at:new Date().toISOString(),
    actual_minutes:Number(draft.minutes)||0, result_score:draft.score,
    mistakes_count:draft.mistakes, prompts_count:draft.prompts,
    completed_from_memory:draft.mem,
    notes:[draft.notes, draft.marks.length?('مواضع: '+draft.marks.join(', ')):''].filter(Boolean).join(' | '),
    calculated_next_review:inv.next_review_date, sync_status:'LOCAL'});
  x.state='done'; x.completed_at=new Date().toISOString(); x.segment_id = x.segment_id||inv.segment_id;
  save(); normalise(); $('#taskDlg').close(); renderAll(); toast(t('saved'));
}

/* ═══════════ EVENTS ═══════════ */
$('#langBtn').onclick=()=>{ DB.settings.lang=AR()?'en':'ar'; save(); applyLang(); };
$('#themeBtn').onclick=()=>{
  const o=['auto','light','dark']; DB.settings.theme=o[(o.indexOf(DB.settings.theme)+1)%3];
  save(); applyTheme(); toast(DB.settings.theme);
};
$('#prevD').onclick=()=>{ cur=addDays(cur,-1); renderAll(); };
$('#nextD').onclick=()=>{ cur=addDays(cur,1); renderAll(); };
$('#todayBtn').onclick=()=>{ cur=TODAY(); renderAll(); };

$('#dayTasks').addEventListener('click',e=>{
  const o=e.target.closest('[data-open]'), l=e.target.closest('[data-later]'), q=e.target.closest('[data-quick]');
  if(o) openTask(o.dataset.open);
  else if(l){ const x=DB.tasks[l.dataset.later];
    postpone(x); save(); normalise(); renderAll(); }
  else if(q){ openTask(q.dataset.quick); }
});
$('#taskDlg').addEventListener('click',e=>{
  const c=e.target.closest('[data-c]'), s=e.target.closest('[data-sc]'), m=e.target.closest('[data-mk]');
  if(c){ draft[c.dataset.c]=Math.max(0,draft[c.dataset.c]+Number(c.dataset.d)); paintDraft(); }
  else if(s){ draft.score=Number(s.dataset.sc); paintDraft(); }
  else if(m){ draft.marks.splice(Number(m.dataset.mk),1); paintDraft(); }
  else if(e.target.closest('#bxFix')||e.target.id==='fixL'){ draft.fix=!draft.fix; paintDraft(); }
  else if(e.target.closest('#bxRep')||e.target.id==='repL'){ draft.rep=!draft.rep; paintDraft(); }
  else if(e.target.closest('#bxMem')||e.target.id==='memL'){ draft.mem=!draft.mem; paintDraft(); }
});
$('#mkAdd').onclick=()=>{ const v=$('#mkIn').value.trim(); if(!v) return;
  draft.marks.push(v); $('#mkIn').value=''; paintDraft(); };
$('#tdMin').onchange=e=>draft.minutes=e.target.value;
$('#tdNote').onchange=e=>draft.notes=e.target.value;
$('#tdSave').onclick=completeTask;
$('#tdLater').onclick=()=>{ postpone(activeTask);
  save(); normalise(); $('#taskDlg').close(); renderAll(); };
$('#tdSkip').onclick=()=>{ activeTask.state='skipped'; save(); $('#taskDlg').close(); renderAll(); };
$('#tdCancel').onclick=()=>$('#taskDlg').close();

$('#muhGroups').addEventListener('click',e=>{
  const a=e.target.closest('[data-all]');
  if(a){ e.preventDefault(); e.stopPropagation();
    const g=GROUPS.find(x=>x.id===a.dataset.all), dow=pIso(cur).getDay();
    const items=g.items.filter(i=>!i[3]||i[3].includes(dow));
    DB.muh[cur]=DB.muh[cur]||{};
    const on=items.every(i=>DB.muh[cur][i[0]]);
    items.forEach(i=>DB.muh[cur][i[0]]=!on); save(); renderMuh(); return; }
  const it=e.target.closest('[data-i]');
  if(it){ DB.muh[cur]=DB.muh[cur]||{};
    DB.muh[cur][it.dataset.i]=!DB.muh[cur][it.dataset.i]; save(); renderMuh(); }
});
$('#invFilters').addEventListener('click',e=>{
  const b=e.target.closest('[data-f]'); if(!b) return; invFilter=b.dataset.f; renderInv();
});
$$('nav button').forEach(b=>b.onclick=()=>{
  $$('nav button').forEach(x=>x.classList.remove('on')); b.classList.add('on');
  $$('.view').forEach(v=>v.classList.remove('on'));
  $('#v-'+b.dataset.v).classList.add('on');
  $('#dateBar').style.display=(b.dataset.v==='inv'||b.dataset.v==='set')?'none':'flex';
  scrollTo(0,0);
});

/* import */
let pending=null;
$('#impBtn').onclick=()=>$('#impFile').click();
$('#impFile').onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{
      const P=parseWorkbook(new Uint8Array(r.result)); pending=P;
      const today=TODAY();
      const repl=Object.values(DB.tasks).filter(x=>x.state==='pending'&&(x.scheduled_date||x.date)>=today).length;
      const kept=Object.values(DB.tasks).filter(x=>x.state!=='pending').length;
      const newS=P.segs.filter(s=>!DB.inventory[s.segment_id]).length;
      $('#pvBody').innerHTML=`
        <table class="prev">
          <tr><th>${t('rows')}</th><td>${P.tasks.length}</td></tr>
          <tr><th>${t('newSeg')}</th><td>${newS}</td></tr>
          <tr><th>${t('updSeg')}</th><td>${P.segs.length-newS}</td></tr>
          <tr><th>${t('repTasks')}</th><td>${repl}</td></tr>
          <tr><th>${t('keptTasks')}</th><td>${kept}</td></tr>
          <tr><th>${t('errRows')}</th><td class="${P.errors.length?'err':''}">${P.errors.length}</td></tr>
        </table>
        ${P.errors.length?`<table class="prev"><tr><th>#</th><th>task_id</th><th>${t('errRows')}</th></tr>
          ${P.errors.slice(0,25).map(x=>`<tr><td>${x.row}</td><td>${x.id}</td><td class="err">${x.msg}</td></tr>`).join('')}
        </table>`:''}`;
      $('#pvOk').disabled = P.tasks.length===0;
      $('#prevDlg').showModal();
    }catch(err){ toast(err.message||'Invalid file'); } };
  r.readAsArrayBuffer(f); e.target.value='';
};
$('#pvOk').onclick=()=>{ if(!pending) return; applyImport(pending); pending=null;
  $('#prevDlg').close(); renderAll(); toast(t('imported')); };
$('#pvCancel').onclick=()=>{ pending=null; $('#prevDlg').close(); };
$('#undoImp').onclick=()=>{
  if(!DB.undo){ toast(t('noUndo')); return; }
  Object.assign(DB, DB.undo); DB.undo=null; save(); normalise(); renderAll(); toast(t('undone'));
};
$('#tmplBtn').onclick=template;
$('#expMonth').onclick=exportMonthly;
$('#expBackup').onclick=()=>dl('wird-backup-'+TODAY()+'.json',
  new Blob([JSON.stringify(DB,null,1)],{type:'application/json'}));
$('#restBtn').onclick=()=>$('#restFile').click();
$('#restFile').onchange=e=>{
  const f=e.target.files[0]; if(!f) return; const r=new FileReader();
  r.onload=()=>{ try{ const o=JSON.parse(r.result);
      if(!o.tasks&&!o.muh) throw 0;
      DB=Object.assign(blank(),o); save(); applyTheme(); applyLang(); toast(t('saved'));
    }catch(err){ toast('Invalid backup'); } };
  r.readAsText(f); e.target.value='';
};
$('#saveSet').onclick=()=>{
  const S=DB.settings;
  S.daily_review_minutes=Number($('#sRev').value)||30;
  S.daily_memorisation_minutes=Number($('#sMem').value)||30;
  S.default_page_minutes=Number($('#sPage').value)||4;
  S.rest_day=$('#sRest').value;
  S.hijri_calendar=$('#sHijCal').value;
  S.hijri_offset=Number($('#sHijOff').value)||0;
  const p=s=>s.split(',').map(x=>Number(x.trim())).filter(x=>x>0);
  const i=p($('#sInt').value), l=p($('#sLad').value);
  if(i.length===5) S.intervals=i;
  if(l.length>=2) S.ladder=l;
  save(); normalise(); renderAll(); toast(t('saved'));
};
$('#wipe').onclick=()=>{ if(!confirm(t('confirmWipe'))) return;
  localStorage.removeItem(KEY); DB=blank(); cur=TODAY(); applyTheme(); applyLang(); toast(t('wiped')); };

let tm; function toast(m){ const e=$('#toast'); e.textContent=m; e.classList.add('on');
  clearTimeout(tm); tm=setTimeout(()=>e.classList.remove('on'),1900); }

/* ═══════════ BOOT ═══════════ */
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
applyTheme(); normalise(); applyLang();
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
