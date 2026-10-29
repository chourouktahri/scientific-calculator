const display = document.getElementById("display");
const message = document.getElementById("message");
const resultPreview = document.getElementById("resultPreview");

const calculatorPage = document.getElementById("calculatorPage");
const basePage = document.getElementById("basePage");
const historyPage = document.getElementById("historyPage");

const calculatorButton = document.getElementById("calculatorButton");
const baseButton = document.getElementById("baseButton");
const historyButton = document.getElementById("historyButton");

let memory = 0;
let lastAnswer = 0;
let history = [];
let secondMode = false;

/* 
   حفظ البيانات
========================= */

function saveData() {
    try {
        localStorage.setItem("scientificCalculatorData", JSON.stringify({
            memory,
            lastAnswer,
            history
        }));
    } catch (error) {
    }
}

function loadData() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("scientificCalculatorData") || "{}"
        );

        if (Number.isFinite(saved.memory)) {
            memory = saved.memory;
        }

        if (Number.isFinite(saved.lastAnswer)) {
            lastAnswer = saved.lastAnswer;
        }

        if (Array.isArray(saved.history)) {
            history = saved.history.filter(item =>
                item &&
                typeof item.expression === "string" &&
                Number.isFinite(item.result)
            ).slice(0, 100);
        }
    } catch (error) {
        memory = 0;
        lastAnswer = 0;
        history = [];
    }
}

loadData();

/* 
   إدخال القيم من الأزرار
========================= */

document.querySelectorAll("[data-value]").forEach(button => {
    button.addEventListener("click", () => {
        display.value += button.dataset.value;
        message.textContent = "";
        resultPreview.textContent = "";
        display.focus();
    });
});

/*
   AC: مسح الشاشة
========================= */

document.getElementById("clearButton").addEventListener("click", () => {
    display.value = "";
    message.textContent = "";
    resultPreview.textContent = "";
    display.focus();
});

/* 
   DEL: حذف آخر حرف
========================= */

document.getElementById("deleteButton").addEventListener("click", () => {
    display.value = display.value.slice(0, -1);
    message.textContent = "";
    resultPreview.textContent = "";
    display.focus();
});

/* =========================
   Ans: استعمال آخر نتيجة
========================= */

document.getElementById("answerButton").addEventListener("click", () => {
    display.value += String(lastAnswer);
    message.textContent = "";
    display.focus();
});

/* =========================
   الحساب عبر Spring Boot
========================= */

async function calculate() {
    const expression = display.value.trim();

    if (!expression) {
        message.textContent = "أدخلي عملية حسابية أولًا.";
        return null;
    }

    message.textContent = "Calculating...";
    resultPreview.textContent = "";

    try {
        const response = await fetch(
            "/api/calculate?expression=" +
            encodeURIComponent(expression)
        );

        const data = await response.json();

        if (!response.ok || data.error !== undefined) {
            throw new Error(data.error || "Calculation failed.");
        }

        const result = Number(data.result);

        if (!Number.isFinite(result)) {
            throw new Error("النتيجة غير صالحة.");
        }

        let cleanResult;

        if (Math.abs(result - Math.round(result)) < 1e-10) {
            cleanResult = Math.round(result);
        } else {
            cleanResult = Number(result.toPrecision(12));
        }

        lastAnswer = cleanResult;

        history.unshift({
            expression: expression,
            result: cleanResult
        });

        history = history.slice(0, 100);

        display.value = String(cleanResult);
        resultPreview.textContent = expression;
        message.textContent = "";

        renderHistory();
        updateMemory();
        saveData();

        return cleanResult;

    } catch (error) {
        message.textContent =
            error.message || "تعذر إجراء العملية.";

        return null;
    }
}

document.getElementById("equalsButton")
    .addEventListener("click", calculate);

display.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        calculate();
    }
});

/* =========================
   الوضع الليلي والنهاري
========================= */

const lightButton = document.getElementById("lightButton");
const darkButton = document.getElementById("darkButton");

function setTheme(theme) {
    const light = theme === "light";

    document.body.classList.toggle("light-theme", light);
    lightButton.classList.toggle("selected", light);
    darkButton.classList.toggle("selected", !light);

    try {
        localStorage.setItem("calculatorTheme", theme);
    } catch (error) {
        // لا شيء.
    }
}

lightButton.addEventListener("click", () => setTheme("light"));
darkButton.addEventListener("click", () => setTheme("dark"));

try {
    setTheme(localStorage.getItem("calculatorTheme") || "dark");
} catch (error) {
    setTheme("dark");
}

/* =========================
   التنقل بين الصفحات
========================= */

function showPage(pageName) {
    calculatorPage.hidden = pageName !== "calculatorPage";
    basePage.hidden = pageName !== "basePage";
    historyPage.hidden = pageName !== "historyPage";

    calculatorButton.classList.toggle(
        "active", pageName === "calculatorPage"
    );

    baseButton.classList.toggle(
        "active", pageName === "basePage"
    );

    historyButton.classList.toggle(
        "active", pageName === "historyPage"
    );

    if (pageName === "historyPage") {
        renderHistory();
    }
}

calculatorButton.addEventListener("click", () => {
    showPage("calculatorPage");
});

baseButton.addEventListener("click", () => {
    showPage("basePage");
});

historyButton.addEventListener("click", () => {
    showPage("historyPage");
});

document.querySelectorAll(".back-button").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

/* =========================
   تحويل الأنظمة العددية
========================= */

document.getElementById("convertBaseButton")
    .addEventListener("click", () => {

        const input = document.getElementById("baseInput")
            .value.trim();

        const fromBase = Number(
            document.getElementById("baseFrom").value
        );

        const toBase = Number(
            document.getElementById("baseTo").value
        );

        const output = document.getElementById("baseResult");

        if (!input) {
            output.textContent = "أدخلي العدد أولًا.";
            return;
        }

        const validDigits = {
            2: /^[+-]?[01]+$/,
            8: /^[+-]?[0-7]+$/,
            10: /^[+-]?\d+$/,
            16: /^[+-]?[0-9a-fA-F]+$/
        };

        if (!validDigits[fromBase].test(input)) {
            output.textContent =
                "العدد لا يتوافق مع النظام الأصلي.";
            return;
        }

        try {
            const negative = input.startsWith("-");
            const unsignedInput = input.replace(/^[+-]/, "");

            let normalized;

            if (fromBase === 2) {
                normalized = "0b" + unsignedInput;
            } else if (fromBase === 8) {
                normalized = "0o" + unsignedInput;
            } else if (fromBase === 16) {
                normalized = "0x" + unsignedInput;
            } else {
                normalized = unsignedInput;
            }

            let decimalValue = BigInt(normalized);

            if (negative) {
                decimalValue = -decimalValue;
            }

            let converted;

            if (toBase === 10) {
                converted = decimalValue.toString(10);
            } else if (toBase === 2) {
                converted = decimalValue.toString(2);
            } else if (toBase === 8) {
                converted = decimalValue.toString(8);
            } else {
                converted = decimalValue.toString(16).toUpperCase();
            }

            output.textContent = "Result: " + converted;

        } catch (error) {
            output.textContent = "العدد غير صالح.";
        }
    });

/* =========================
   عرض سجل العمليات
========================= */

function renderHistory() {
    const historyList = document.getElementById("historyList");

    historyList.replaceChildren();

    if (history.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-history";
        empty.textContent = "لا توجد عمليات بعد.";
        historyList.appendChild(empty);
        return;
    }

    history.forEach(item => {
        const row = document.createElement("div");
        row.className = "history-item";

        const expression = document.createElement("div");
        expression.className = "history-expression";
        expression.textContent = item.expression;

        const result = document.createElement("div");
        result.className = "history-result";
        result.textContent = "= " + item.result;

        const reuseButton = document.createElement("button");
        reuseButton.type = "button";
        reuseButton.textContent = "Use again";

        reuseButton.addEventListener("click", () => {
            display.value = item.expression;
            message.textContent = "";
            resultPreview.textContent = "";

            showPage("calculatorPage");
            display.focus();
        });

        row.append(expression, result, reuseButton);
        historyList.appendChild(row);
    });
}

/* =========================
   مسح سجل العمليات
========================= */

document.getElementById("clearHistoryButton")
    .addEventListener("click", () => {
        history = [];
        renderHistory();
        saveData();
    });

/* =========================
   M+: إضافة النتيجة للذاكرة
========================= */

document.getElementById("memoryPlus")
    .addEventListener("click", async () => {

        const result = await calculate();

        if (result !== null) {
            memory += result;
            updateMemory();
            saveData();
        }
    });

/* =========================
   M-: طرح النتيجة من الذاكرة
========================= */

document.getElementById("memoryMinus")
    .addEventListener("click", async () => {

        const result = await calculate();

        if (result !== null) {
            memory -= result;
            updateMemory();
            saveData();
        }
    });

/* =========================
   MR: استرجاع الذاكرة
========================= */

document.getElementById("memoryRecall")
    .addEventListener("click", () => {
        display.value += String(memory);
        message.textContent = "";
        display.focus();
    });

/* =========================
   MC: مسح الذاكرة
========================= */

document.getElementById("memoryClear")
    .addEventListener("click", () => {
        memory = 0;
        updateMemory();
        saveData();
    });

/* =========================
   تحديث معلومات الذاكرة
========================= */

function updateMemory() {
    document.getElementById("memoryStatus").textContent =
        "M = " + memory;

    document.getElementById("memoryIndicator")
        .classList.toggle("active", memory !== 0);
}
/* =========================
   تشغيل الواجهة عند الفتح
========================= */

updateMemory();
renderHistory();
showPage("calculatorPage");
