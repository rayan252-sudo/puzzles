/* =========================================
   MIND TRAP
   150 LEVEL PUZZLE GAME
========================================= */


/* ---------- SHORTCUT ---------- */

const $ = selector =>
    document.querySelector(selector);


/* ---------- SCREENS ---------- */

const screens = {

    home: $("#homeScreen"),

    levels: $("#levelsScreen"),

    game: $("#gameScreen")

};


/* ---------- WORLDS ---------- */

const WORLD_NAMES = [

    "البداية",
    "الخداع",
    "الأرقام",
    "الذاكرة",
    "السرعة",
    "الكلمات",
    "الملاحظة",
    "المنطق",
    "الأوهام",
    "الفوضى",
    "المستحيل",
    "خارج الصندوق",
    "العبث",
    "الكابوس",
    "النهائي"

];


/* ---------- TYPES ---------- */

const TYPES = [

    "منطق",
    "تريكة",
    "أرقام",
    "ذاكرة",
    "سرعة",
    "كلمات",
    "ملاحظة",
    "منطق",
    "خداع بصري",
    "فوضى",
    "مستوى وحشي",
    "خارج الصندوق",
    "عبث",
    "كابوس",
    "نهائي"

];


/* ---------- DIFFICULTY ---------- */

const DIFFICULTY = [

    "سهل",
    "سهل",
    "متوسط",
    "صعب",
    "صعب جدًا",
    "مجنون",
    "مستحيل"

];


/* ---------- SAVE DATA ---------- */

let state =
    JSON.parse(
        localStorage.getItem("mindTrapState")
    ) || {

        current: 1,

        solved: {},

        stars: {},

        hints: 8,

        sound: true,

        dark: false

    };


let currentLevel = 1;

let hearts = 3;

let hintUsed = false;

let timer = null;

let memoryAnswer = null;


/* ---------- SAVE ---------- */

function save() {

    localStorage.setItem(
        "mindTrapState",
        JSON.stringify(state)
    );

}


/* ---------- SCREEN ---------- */

function showScreen(screen) {

    Object.values(screens)
        .forEach(s =>
            s.classList.remove("active")
        );

    screens[screen]
        .classList.add("active");

    window.scrollTo(0,0);

}


/* ---------- TOAST ---------- */

function toast(message) {

    const element = $("#toast");

    element.textContent = message;

    element.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer =
        setTimeout(() => {

            element.classList.remove("show");

        },1800);

}


/* ---------- SOUND ---------- */

function beep(
    frequency = 500,
    duration = 0.08
) {

    if (!state.sound)
        return;

    try {

        const audio =
            new AudioContext();

        const oscillator =
            audio.createOscillator();

        const gain =
            audio.createGain();

        oscillator.frequency.value =
            frequency;

        oscillator.type = "sine";

        gain.gain.value = 0.035;

        oscillator.connect(gain);

        gain.connect(audio.destination);

        oscillator.start();

        gain.gain.exponentialRampToValueAtTime(

            0.0001,

            audio.currentTime + duration

        );

        oscillator.stop(
            audio.currentTime + duration
        );

    }

    catch {}

}


/* ---------- CONFETTI ---------- */

function confetti() {

    const container =
        $("#confetti");

    container.innerHTML = "";

    for (
        let i = 0;
        i < 55;
        i++
    ) {

        const piece =
            document.createElement("i");

        piece.style.left =
            Math.random() * 100 + "%";

        piece.style.top = "-20px";

        piece.style.animationDelay =
            Math.random() * .25 + "s";

        piece.style.transform =
            `rotate(${Math.random()*360}deg)`;

        container.appendChild(piece);

    }

    setTimeout(() => {

        container.innerHTML = "";

    },1400);

}


/* ---------- HOME STATS ---------- */

function updateHome() {

    const solved =
        Object.keys(state.solved).length;

    const stars =
        Object.values(state.stars)
        .reduce(
            (total,value) =>
                total + value,
            0
        );

    $("#homeLevel").textContent =
        Math.min(state.current,150);

    $("#homeSolved").textContent =
        solved;

    $("#homeStars").textContent =
        stars;

}


/* ---------- LEVEL GRID ---------- */

function renderLevels() {

    const grid =
        $("#levelsGrid");

    grid.innerHTML = "";

    for (
        let i = 1;
        i <= 150;
        i++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "level-btn";

        const locked =
            i > state.current &&
            !state.solved[i];

        if (locked)
            button.classList.add("locked");

        if (state.solved[i])
            button.classList.add("done");


        button.innerHTML =
            `${i}
            ${
                state.solved[i]
                ?
                `<span class="star-mini">
                    ${"★".repeat(state.stars[i] || 1)}
                </span>`
                :
                ""
            }`;


        if (!locked) {

            button.onclick =
                () => startLevel(i);

        }


        grid.appendChild(button);

    }

}


/* ---------- WORLD ---------- */

function getWorld(level) {

    return WORLD_NAMES[
        Math.floor((level - 1) / 10)
    ];

}


/* ---------- TYPE ---------- */

function getType(level) {

    return TYPES[
        Math.min(
            14,
            Math.floor((level - 1) / 10)
        )
    ];

}


/* ---------- DIFFICULTY ---------- */

function getDifficulty(level) {

    return DIFFICULTY[
        Math.min(
            6,
            Math.floor((level - 1) / 25)
        )
    ];

}


/* =========================================
   LEVEL DATA
========================================= */


const puzzles = [

    {
        type: "answers",

        title:
            "أي رقم يأتي بعد 2؟",

        subtitle:
            "السؤال بسيط... أليس كذلك؟",

        answers:
            ["3","4","22","لا يوجد جواب"],

        correct: 0
    },


    {
        type: "answers",

        title:
            "اضغط على الزر الأحمر.",

        subtitle:
            "أمامك زر أحمر واحد فقط...",

        answers:
            [
                "🔴 أنا الأحمر",
                "🟢 أنا الأحمر"
            ],

        correct: 1,

        troll: true
    },


    {
        type: "answers",

        title:
            "إذا كان لديك 3 تفاحات وأخذت 2، كم تفاحة أصبحت تملك؟",

        answers:
            [
                "1",
                "2",
                "3",
                "5"
            ],

        correct: 1
    },


    {
        type: "answers",

        title:
            "ما الشيء الذي كلما أخذت منه كبر؟",

        answers:
            [
                "الحفرة",
                "العمر",
                "المال",
                "الظل"
            ],

        correct: 0
    },


    {
        type: "wait",

        title:
            "لا تضغط على أي شيء لمدة 3 ثوانٍ.",

        subtitle:
            "هذه المرة كن صبورًا."
    },


    {
        type: "answers",

        title:
            "5 + 5 × 2 = ؟",

        answers:
            [
                "20",
                "15",
                "12",
                "10"
            ],

        correct: 1
    },


    {
        type: "hidden",

        title:
            "أوجد الزر الذي لا تستطيع رؤيته.",

        subtitle:
            "نعم... موجود فعلًا."
    },


    {
        type: "answers",

        title:
            "أب وأم لديهما 4 بنات. لكل بنت أخ واحد. كم عدد الأطفال؟",

        answers:
            [
                "4",
                "5",
                "8",
                "9"
            ],

        correct: 1
    },


    {
        type: "answers",

        title:
            "ما أول حرف في كلمة «اللغز»؟",

        answers:
            [
                "ل",
                "ا",
                "ز",
                "ال"
            ],

        correct: 1
    },


    {
        type: "memory",

        title:
            "احفظ الرقم ثم اكتبه.",

        number:
            "7394"
    },


    {
        type: "answers",

        title:
            "شيء له أسنان ولا يعض، ما هو؟",

        answers:
            [
                "المشط",
                "المنشار",
                "التمساح",
                "المفتاح"
            ],

        correct: 0
    },


    {
        type: "fake",

        title:
            "اضغط على «التالي».",

        subtitle:
            "المفاجأة: لا يوجد زر التالي. 😈"
    },


    {
        type: "answers",

        title:
            "إذا كانت الساعة 3:00، كم درجة بين العقربين؟",

        answers:
            [
                "30°",
                "60°",
                "90°",
                "180°"
            ],

        correct: 2
    },


    {
        type: "answers",

        title:
            "ما الذي يمشي بلا أرجل ويبكي بلا عيون؟",

        answers:
            [
                "السحاب",
                "النهر",
                "الريح",
                "الوقت"
            ],

        correct: 0
    },


    {
        type: "visual",

        title:
            "اضغط على المربع المختلف.",

        subtitle:
            "واحد فقط مختلف."
    },


    {
        type: "answers",

        title:
            "كم شهرًا فيه 28 يومًا؟",

        answers:
            [
                "1",
                "2",
                "11",
                "12"
            ],

        correct: 3
    },


    {
        type: "answers",

        title:
            "ما الذي يكتب ولا يقرأ؟",

        answers:
            [
                "القلم",
                "الكتاب",
                "الطالب",
                "الكمبيوتر"
            ],

        correct: 0
    },


    {
        type: "answers",

        title:
            "اختر الإجابة الخطأ.",

        answers:
            [
                "هذه صحيحة",
                "هذه خطأ",
                "لا أعرف",
                "الزر"
            ],

        correct: 1
    },


    {
        type: "answers",

        title:
            "أنت في سباق وتجاوزت الشخص الثاني. ما مركزك؟",

        answers:
            [
                "الأول",
                "الثاني",
                "الثالث",
                "الأخير"
            ],

        correct: 1
    },


    {
        type: "input",

        title:
            "كم حرفًا في هذه الجملة؟",

        subtitle:
            "احسب حروف الجملة نفسها، وليس المسافات.",

        correctText:
            "19"
    }

];


/* =========================================
   GENERATED LEVELS
========================================= */

const generatedPuzzles = [

    {
        question:
            "ما الرقم التالي؟ 2، 4، 8، 16، ؟",

        answers:
            [
                "24",
                "30",
                "32",
                "34"
            ],

        correct: 2
    },


    {
        question:
            "إذا كان 4 أشخاص يصنعون 4 قطع في 4 دقائق، كم يحتاج شخص واحد لصنع قطعة؟",

        answers:
            [
                "1 دقيقة",
                "4 دقائق",
                "8 دقائق",
                "16 دقيقة"
            ],

        correct: 1
    },


    {
        question:
            "أي كلمة لا تنتمي للمجموعة؟",

        answers:
            [
                "تفاحة",
                "موز",
                "جزر",
                "برتقال"
            ],

        correct: 2
    },


    {
        question:
            "ما العدد الذي إذا ضربته بنفسه وأضفت إليه نفسه يساوي 6؟",

        answers:
            [
                "1",
                "2",
                "3",
                "6"
            ],

        correct: 1
    },


    {
        question:
            "أمامك 10 شموع، انطفأت 3. كم شمعة انطفأت؟",

        answers:
            [
                "7",
                "3",
                "10",
                "0"
            ],

        correct: 1
    },


    {
        question:
            "ما الشيء الذي إذا كسرته لا تستطيع استخدامه؟",

        answers:
            [
                "الوعد",
                "الزجاج",
                "القلم",
                "الباب"
            ],

        correct: 0
    },


    {
        question:
            "رتب التسلسل: 1، 11، 21، 1211، ؟",

        answers:
            [
                "111221",
                "212211",
                "122111",
                "111211"
            ],

        correct: 0
    },


    {
        question:
            "إذا كان لديك 6 بيضات وأكلت 2، كم بقي؟",

        answers:
            [
                "2",
                "4",
                "6",
                "8"
            ],

        correct: 1
    }

];


/* ---------- GET PUZZLE ---------- */

function getPuzzle(level) {

    if (level <= puzzles.length) {

        return puzzles[level - 1];

    }


    const generated =
        generatedPuzzles[
            (level - 21) %
            generatedPuzzles.length
        ];


    return {

        type: "answers",

        title: generated.question,

        answers: generated.answers,

        correct: generated.correct,

        subtitle:
            level % 7 === 0
            ?
            "فكر مرتين قبل أن تضغط 👀"
            :
            ""

    };

}


/* =========================================
   START LEVEL
========================================= */

function startLevel(level) {

    currentLevel = level;

    hearts = 3;

    hintUsed = false;

    clearInterval(timer);

    showScreen("game");

    $("#levelLabel").textContent =
        `المرحلة ${level}`;

    $("#worldLabel").textContent =
        getWorld(level);

    $("#difficulty").textContent =
        getDifficulty(level);

    $("#typeLabel").textContent =
        getType(level);

    $("#progressBar").style.width =
        `${level / 150 * 100}%`;

    $("#hintBox").textContent = "";

    updateHearts();

    renderPuzzle(level);

}


/* ---------- HEARTS ---------- */

function updateHearts() {

    $("#hearts").textContent =
        "♥ ".repeat(hearts).trim();

}


/* =========================================
   WRONG ANSWER
========================================= */

function wrong(message = "ركز أكثر 😏") {

    hearts--;

    updateHearts();

    beep(160,0.12);

    const card =
        $("#gameCard");

    card.classList.remove("shake");

    void card.offsetWidth;

    card.classList.add("shake");

    toast(message);


    if (hearts <= 0) {

        setTimeout(
            failLevel,
            350
        );

    }

}


/* ---------- FAIL ---------- */

function failLevel() {

    openModal(

        "انتهت المحاولات 💀",

        `
        المستوى ${currentLevel}
        هزمك هذه المرة.
        <br>
        لكن لا تقلق...
        حتى العباقرة ينجلدون أحيانًا 😂
        `,

        "حاول مرة أخرى",

        () =>
            startLevel(currentLevel)

    );

}


/* =========================================
   SOLVE
========================================= */

function solve(
    stars = 3,
    message = "أحسنت! 🧠"
) {

    clearInterval(timer);

    const finalStars =
        hintUsed
        ?
        Math.max(1,stars - 1)
        :
        stars;


    state.solved[currentLevel] = true;

    state.stars[currentLevel] =
        Math.max(
            state.stars[currentLevel] || 0,
            finalStars
        );


    if (
        currentLevel >= state.current
    ) {

        state.current =
            Math.min(
                150,
                currentLevel + 1
            );

    }


    save();

    updateHome();

    beep(850,0.12);

    confetti();

    openModal(

        message,

        `
        المرحلة ${currentLevel}
        انتهت.

        <div class="modal-stars">
            ${
                "★".repeat(finalStars)
            }
            ${
                "☆".repeat(3-finalStars)
            }
        </div>
        `,

        currentLevel < 150
        ?
        "المرحلة التالية"
        :
        "ابدأ من جديد",

        () => {

            if (
                currentLevel < 150
            ) {

                startLevel(
                    currentLevel + 1
                );

            }

            else {

                startLevel(1);

            }

        }

    );

}


/* =========================================
   MODAL
========================================= */

function openModal(
    title,
    content,
    buttonText,
    action
) {

    $("#modalContent").innerHTML = `

        <div class="small-title">
            MIND TRAP
        </div>

        <h3>
            ${title}
        </h3>

        <p>
            ${content}
        </p>

        <button
            class="main-btn"
            id="modalBtn"
        >
            ${buttonText}
        </button>

    `;


    $("#modal")
        .classList
        .add("show");


    $("#modalBtn").onclick = () => {

        $("#modal")
            .classList
            .remove("show");

        if (action)
            action();

    };

}


/* =========================================
   RENDER PUZZLE
========================================= */

function renderPuzzle(level) {

    const puzzle =
        getPuzzle(level);

    const area =
        $("#puzzleArea");

    area.innerHTML = "";


    const title =
        document.createElement("h2");

    title.className =
        "puzzle-title";

    title.textContent =
        puzzle.title;

    area.appendChild(title);


    if (puzzle.subtitle) {

        const subtitle =
            document.createElement("div");

        subtitle.className =
            "puzzle-sub";

        subtitle.textContent =
            puzzle.subtitle;

        area.appendChild(subtitle);

    }


    switch(puzzle.type) {

        case "answers":

            renderAnswers(
                area,
                puzzle
            );

            break;


        case "wait":

            renderWait(area);

            break;


        case "hidden":

            renderHidden(area);

            break;


        case "memory":

            renderMemory(
                area,
                puzzle
            );

            break;


        case "fake":

            renderFake(area);

            break;


        case "visual":

            renderVisual(area);

            break;


        case "input":

            renderInput(
                area,
                puzzle
            );

            break;

    }

}


/* =========================================
   ANSWERS
========================================= */

function renderAnswers(
    area,
    puzzle
) {

    const grid =
        document.createElement("div");

    grid.className =
        "answer-grid";


    puzzle.answers.forEach(
        (answer,index) => {

            const button =
                document.createElement("button");

            button.className =
                "answer";

            button.textContent =
                answer;


            button.onclick = () => {

                if (
                    index === puzzle.correct
                ) {

                    solve(
                        3,
                        puzzle.troll
                        ?
                        "ههههه! وقعت بالخدعة أول مرة 😂"
                        :
                        "إجابة صحيحة! 🧠"
                    );

                }

                else {

                    wrong(
                        puzzle.troll
                        ?
                        "قلتلك لا تثق بسرعة 😂"
                        :
                        "غلط... حاول مرة ثانية."
                    );

                }

            };


            grid.appendChild(button);

        }
    );


    area.appendChild(grid);

}


/* =========================================
   WAIT PUZZLE
========================================= */

function renderWait(area) {

    const box =
        document.createElement("div");

    box.className =
        "memory-box";

    box.innerHTML =
        `<span id="waitText">
            لا تضغط...
        </span>`;

    area.appendChild(box);


    let count = 3;


    timer =
        setInterval(() => {

            count--;


            if (count > 0) {

                $("#waitText")
                    .textContent =
                    `انتظر ${count}...`;

            }


            else {

                clearInterval(timer);

                $("#waitText")
                    .textContent =
                    "اضغط الآن!";


                $("#waitText")
                    .style.cursor =
                    "pointer";


                $("#waitText")
                    .onclick =
                    () =>
                        solve(
                            3,
                            "صبرك كسبك 😂"
                        );

            }

        },1000);

}


/* =========================================
   HIDDEN BUTTON
========================================= */

function renderHidden(area) {

    const button =
        document.createElement("button");

    button.className =
        "answer";

    button.style.opacity =
        "0.05";

    button.textContent =
        "أنا هنا";


    button.onclick =
        () =>
            solve(
                3,
                "وجدت الزر المخفي! 👀"
            );


    area.appendChild(button);


    setTimeout(() => {

        button.style.opacity =
            "0.01";

    },500);

}


/* =========================================
   MEMORY
========================================= */

function renderMemory(
    area,
    puzzle
) {

    const box =
        document.createElement("div");

    box.className =
        "memory-box";

    box.textContent =
        puzzle.number;

    area.appendChild(box);


    memoryAnswer =
        puzzle.number;


    setTimeout(() => {

        box.textContent =
            "اكتب الرقم الذي رأيته";


        const input =
            document.createElement("div");

        input.className =
            "input-wrap";

        input.innerHTML = `

            <input
                class="answer-input"
                id="memoryInput"
                inputmode="numeric"
                placeholder="الرقم"
            >

            <button
                class="submit"
                id="memorySubmit"
            >
                تحقق
            </button>

        `;


        area.appendChild(input);


        $("#memorySubmit").onclick =
            () => {

                if (
                    $("#memoryInput")
                    .value
                    .trim()
                    === memoryAnswer
                ) {

                    solve(
                        3,
                        "ذاكرتك حديد 🔥"
                    );

                }

                else {

                    wrong(
                        "ذاكرتك خانتك 😭"
                    );

                }

            };

    },1700);

}


/* =========================================
   FAKE BUTTON
========================================= */

function renderFake(area) {

    const button =
        document.createElement("button");

    button.className =
        "answer";

    button.textContent =
        "لا يوجد زر هنا 😎";


    button.onclick =
        () =>
            solve(
                3,
                "اكتشفت الخدعة! 🎭"
            );


    area.appendChild(button);

}


/* =========================================
   VISUAL PUZZLE
========================================= */

function renderVisual(area) {

    const grid =
        document.createElement("div");

    grid.className =
        "visual-grid";


    for (
        let i = 0;
        i < 16;
        i++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "visual-cell";


        const different =
            i === 10;


        button.textContent =
            different
            ?
            "◆"
            :
            "◇";


        button.onclick = () => {

            if (different) {

                solve(
                    3,
                    "عينك ممتازة 👁️"
                );

            }

            else {

                wrong(
                    "هذا ليس المختلف."
                );

            }

        };


        grid.appendChild(button);

    }


    area.appendChild(grid);

}


/* =========================================
   INPUT
========================================= */

function renderInput(
    area,
    puzzle
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "input-wrap";


    wrapper.innerHTML = `

        <input
            id="userAnswer"
            class="answer-input"
            placeholder="اكتب إجابتك"
        >

        <button
            id="submitAnswer"
            class="submit"
        >
            تحقق
        </button>

    `;


    area.appendChild(wrapper);


    $("#submitAnswer").onclick =
        () => {

            const answer =
                $("#userAnswer")
                .value
                .trim();


            if (
                answer ===
                puzzle.correctText
            ) {

                solve(
                    3,
                    "صح! 🔥"
                );

            }

            else {

                wrong(
                    "الإجابة ليست صحيحة."
                );

            }

        };


    $("#userAnswer")
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    $("#submitAnswer")
                        .click();

                }

            }
        );

}


/* =========================================
   HINT
========================================= */

$("#hintBtn").onclick = () => {

    if (hintUsed) {

        toast(
            "استخدمت التلميح بالفعل."
        );

        return;

    }


    if (state.hints <= 0) {

        toast(
            "خلصت التلميحات 😭"
        );

        return;

    }


    state.hints--;

    hintUsed = true;

    save();


    const level =
        currentLevel;


    let hint;


    if (level === 2) {

        hint =
            "لا تثق بلون الزر.";

    }

    else if (level === 7) {

        hint =
            "ابحث عن شيء شبه غير مرئي.";

    }

    else if (level === 10) {

        hint =
            "ركز بالرقم واحفظه.";

    }

    else {

        hint =
            "استبعد الإجابات الواضحة وفكر بطريقة مختلفة.";

    }


    $("#hintBox")
        .textContent =
        "💡 " + hint;


    toast(
        "تم استخدام تلميح"
    );


    beep(650,.08);

};


/* =========================================
   SKIP
========================================= */

$("#skipBtn").onclick =
    () => {

        openModal(

            "متأكد؟ 🤨",

            `
            التجاوز لن يعطيك نجومًا،
            لكنك لن تخسر قلبًا.
            `,

            "تجاوز المرحلة",

            () => {

                state.current =
                    Math.max(
                        state.current,
                        currentLevel + 1
                    );


                save();


                startLevel(
                    Math.min(
                        150,
                        currentLevel + 1
                    )
                );

            }

        );

    };


/* =========================================
   HOME BUTTONS
========================================= */

$("#startBtn").onclick =
    () =>
        startLevel(
            Math.min(
                state.current,
                150
            )
        );


$("#levelsBtn").onclick =
    () => {

        renderLevels();

        showScreen("levels");

    };


/* ---------- BACK ---------- */

document
    .querySelectorAll("[data-back]")
    .forEach(button => {

        button.onclick =
            () =>
                showScreen("home");

    });


$("#gameBack").onclick =
    () => {

        clearInterval(timer);

        updateHome();

        showScreen("home");

    };


/* =========================================
   SOUND
========================================= */

$("#soundBtn").onclick =
    () => {

        state.sound =
            !state.sound;


        $("#soundBtn")
            .textContent =
            state.sound
            ?
            "🔊"
            :
            "🔇";


        save();

    };


/* =========================================
   DARK MODE
========================================= */

$("#themeBtn").onclick =
    () => {

        state.dark =
            !state.dark;


        document.body
            .classList
            .toggle(
                "dark",
                state.dark
            );


        $("#themeBtn")
            .textContent =
            state.dark
            ?
            "☀️"
            :
            "🌙";


        save();

    };


/* =========================================
   RESET
========================================= */

$("#resetBtn").onclick =
    () => {

        openModal(

            "إعادة كل شيء؟",

            `
            سيتم حذف جميع المراحل
            والنجوم والتقدم.
            `,

            "نعم، امسح كل شيء",

            () => {

                state = {

                    current: 1,

                    solved: {},

                    stars: {},

                    hints: 8,

                    sound: true,

                    dark: false

                };


                save();

                location.reload();

            }

        );

    };


/* =========================================
   CLOSE MODAL
========================================= */

$("#modal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target.id === "modal"
            ) {

                $("#modal")
                    .classList
                    .remove("show");

            }

        }
    );


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            $("#modal")
                .classList
                .remove("show");

        }

    }
);


/* =========================================
   INITIALIZE
========================================= */

document.body
    .classList
    .toggle(
        "dark",
        state.dark
    );


$("#soundBtn")
    .textContent =
    state.sound
    ?
    "🔊"
    :
    "🔇";


$("#themeBtn")
    .textContent =
    state.dark
    ?
    "☀️"
    :
    "🌙";


updateHome();