// プロパティ
const N = 75;
const slip_lower_range = 30;
const slip_upper_range = 48;

const number = document.getElementById("number");
const selector = document.getElementById("selector");
const clear_history = document.getElementById("clear_history");
const list_history = document.getElementById("list_history");
const histories = document.getElementById("histories");
const slip_toggle = document.getElementById("slip_toggle");
const audio_toggle = document.getElementById("audio_toggle");

// const table = document.getElementById("table");
// const tdElements = table.getElementsByTagName("td");
// console.log(table)
// console.log(tdElements)

// インスタンス
const mt = new MersenneTwister();

// ユーティリティ関数
const easeOutCirc = (x) => {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

const easeOutQuint = (x) => {
    return 1 - Math.pow(1 - x, 5);
}

const easeInExpo = (x) => {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

let playaudio = true;
const drawn = [];
const Chusen = () => {
    let rand = mt.nextInt(1, N + 1);
    while(drawn.some(e => e == rand)) {
        rand = mt.nextInt(1, N + 1);
    }
    if (playaudio) {
        const audio = new Audio("./se01.mp3");
        audio.volume = 0.4;
        audio.play();
    }
    number.textContent = rand;
};

// アニメーション
let animationId = null;

const renderLoop = () => {
    Chusen();
    animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
    return animationId === null;
};

const roll = () => {
    if (drawn.length < N) {
        selector.textContent = "ストップ！";
        mt.setSeed(Math.floor(Math.random() * (2 << 32)));
        renderLoop();
    } else {
        number.textContent = "終わり";
    }
};

const order = [];
const changeTdColor = (order) => {
    let searchNumber = order.slice(-1)[0]
    let tdElements = document.getElementById(searchNumber)
    // console.log(tdElements)
    tdElements.style.backgroundColor = "#fd7e00"
    tdElements.style.color = "#ffffff"

    // アニメーションの設定
    tdElements.style.transition = "transform 0.3s ease-out, ";

    // 初期のスタイルを取得
    const originalTransform = tdElements.style.transform;

    // 拡大アニメーションの設定
    tdElements.style.transform = "scale(2)";

    // 3秒後に元に戻る
    setTimeout(() => {
        tdElements.style.transform = originalTransform;
    }, 3000);
};

const pause = () => {
    if (playaudio) {
        const audio = new Audio("se02.mp3");
        audio.volume = 1
        audio.play();
    }
    selector.textContent = "抽選";
    cancelAnimationFrame(animationId);
    animationId = null;
    drawn.push(parseInt(number.textContent));
    order.push(parseInt(number.textContent));
    drawn.sort((a, b) => a < b ? -1 : 1);
    if (historyShowing) histories.textContent = drawn.toString();
    changeTdColor(order)
};

// スリップアニメーション
let tick = 1;
let progress = 0;
let slip = true;
let duration = 40;
const renderSlip = () => {
    let rate = easeInExpo(progress / duration);
    if (tick >= rate * duration) {
        Chusen();
        tick = 0;
        progress++;
    }
    if (progress > duration) {
        pause();
        return;
    }
    tick++;
    animationId = requestAnimationFrame(renderSlip);
}

const slip_pause = () => {
    selector.textContent = "抽選中...";
    cancelAnimationFrame(animationId);
    animationId = null;
    renderSlip();
}

// ヒストリー
let historyShowing = false;

const listHistory = () => {
    if (!historyShowing) {
        histories.textContent = drawn.toString();
        historyShowing = true;
    } else {
        histories.textContent = "";
        historyShowing = false;
    }
};

const clearHistory = () => {
    drawn.splice(0);
    if (historyShowing) histories.textContent = drawn.toString();
};


// DOMにイベント追加
selector.addEventListener("click", event => {
    if (isPaused()) {
        roll();
    } else {
        if (slip) {
            progress = 0;
            duration = mt.nextInt(slip_lower_range, slip_upper_range + 1);
            slip_pause();
        } else {
            pause();
        }
    }
});

list_history.addEventListener("click", event => {
    listHistory();
});

clear_history.addEventListener("click", event => {
    clearHistory();
    number.textContent = "Start";
});

slip_toggle.addEventListener("click", event => {
    slip = !slip;
    if (slip) slip_toggle.textContent = "滑りあり";
    else slip_toggle.textContent = "滑りなし";
})

audio_toggle.addEventListener("click", event => {
    playaudio = !playaudio;
    if (playaudio) audio_toggle.textContent = "音あり";
    else audio_toggle.textContent = "音なし";
});