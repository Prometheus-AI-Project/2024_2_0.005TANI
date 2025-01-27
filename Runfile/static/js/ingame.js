// static/js/ingame.js

/*
// 서버에서 새 데이터 받아서 자동 갱신 예시
async function fetchUpdates() {
    try {
        const response = await fetch('/api/something');
        const data = await response.json();
        updateScoreboard(
            data.inning,
            data.team1,
            data.score,
            data.team2,
            data.count
        );
    } catch (error) {
        console.error('Error fetching scoreboard data:', error);
    }
}
// 일정 주기로 실행
setInterval(fetchUpdates, 5000);
*/

// ===============================
// 5x5 영역 클릭 시 하이라이트
// ===============================
const cells = document.querySelectorAll('[data-zone]');


// 전역 변수
// ======================
let defense = false;

let strikecount = 0;
let outcount = 0;
let runnercount = 0;
let ballcount = 0;

let opponentteam_score = 7
let myteam_score = 7
// ======================
// HTML 요소 가져오기
// ======================



const noSwingBtn = document.getElementById("noSwingBtn");
const swingBtn = document.getElementById("swingBtn");
const stealBtn = document.getElementById("stealBtn");

const count = document.getElementById('count'); 
const score =  document.getElementById('score'); 


// ============== 초기화/이벤트 바인딩 ==============
window.onload = function() {
    enableAllButtons();
    // 각 버튼 클릭 시 로직
    noSwingBtn.addEventListener('click', handleNoSwing);
    swingBtn.addEventListener('click', handleSwingChoice);
    //stealBtn.addEventListener('click', handleSteal);

    // 스트라이크 존 클릭 이벤트
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // 첫 투구 준비
    startPitch();
};


// ================== 버튼 활성화/비활성화 함수들 ==================
function enableAllButtons() {
    noSwingBtn.disabled = false;
    swingBtn.disabled = false;
    //stealBtn.disabled = false;
}
function disableAllButtons() {
    noSwingBtn.disabled = true;
    swingBtn.disabled = true;
    //stealBtn.disabled = true;
}


// ============== 1) 안 치기 ==============
function handleNoSwing() {
    disableAllButtons();


    

    // 임의 로직: 1~25 중 1~15는 스트라이크, 16~25는 볼
    const randomZone = Math.floor(Math.random() * 25) + 1;
    if (randomZone <= 15) {
        // 스트라이크
        alert(`안 치기 -> 스트라이크! (zone=${randomZone})`);
        strikecount++;
        if (strikecount >= 3) {
            outcount++;
            strikecount = 0;
            if (outcount >= 3) {
                alert("3아웃! 공수 교체");
                outcount = 0;
                runnercount = 0; 
            }
        }
    } else {
        // 볼
        alert(`안 치기 -> 볼! (zone=${randomZone})`);
        // 실제론 ballCount 변수를 따로 두면 좋음
    }
    updateCountDisplay(ballcount, strikecount, outcount);

    // 이 투구 종료
    enableAllButtons();
}

// ============== 2) 치기 선택 => 스트라이크 존 클릭 대기 ==============
function handleSwingChoice() {
    isSwingMode = true;
    alert("스트라이크 존을 클릭해 스윙할 곳을 선택하세요!");

    disableAllButtons();
}

// ======================
// 클릭 핸들러
// ======================
function handleCellClick(event) {

    if (!isSwingMode) {
        alert("치기 모드를 선택해야 스트라이크 존을 클릭할 수 있습니다!");
        return;
    }

    cells.forEach(td => td.classList.remove('highlight'));
    const userZone = Number(event.target.getAttribute('data-zone'));
    console.log("유저가 선택한 zone:", userZone);
    
    event.target.classList.add('highlight');


    
    // 1~25 사이의 랜덤 zone 생성 => 이 존을 투수 model이 예측한 존으로 바꿔야 함.
    const randomZone = Math.floor(Math.random() * 25) + 1;
    console.log("랜덤 zone:", randomZone);
    
    if (userZone === randomZone) {//모델이 에측한 3 or 5개 영역내에 사용자가 입력한 영역이 없는 경우 -> 안타 or 파울 (우선은 30%확률로 파울)
        
        //30%확률로 파울 취급, 파울 볼 중 30% 확률로 아웃 나머지 strike
        is_foul = Math.floor(Math.random() * 10);
        if (is_foul<3){
            alert("파울! ");
            if (is_foul==0){
                alert("파울타구가 잡혔습니다! 아웃카운트가 증가합니다. ");
                outcount+=1
                ballcount = 0;
                strikecount = 0;
            }
            else{
                alert("스트라이크 카운트가 증가합니다. ");
                if (strikecount!=2){
                   strikecount+=1
                }
            }
        }
        else{
            // 안타 처리
            alert("안타! 타구가 안타로 이어졌습니다.");
            runnercount +=1
            ballcount = 0;
            strikecount = 0;
        }
    } else {//모델이 에측한 3 or 5개 영역내에 사용자가 입력한 영역이 있는 경우 -> strike or ball(안타는 아님)
        
        is_ball = Math.floor(Math.random() * 9);
        if (is_ball<5){
            //볼
            alert("볼!");
            ballcount+=1
        }
        else{
            // 스트라이크
            alert("스트라이크!");
            strikecount++;
            
        }
        // 스트라이크가 3개면 아웃
        if (strikecount === 3) {
            alert("3 스트라이크! 아웃카운트가 증가합니다.");
            outcount++;
            strikecount = 0; 
            ballcount = 0;
        }
        if (ballcount ===4){
            alert("4 볼! 주자가 진루합니다.");
            runnercount +=1
            strikecount = 0; 
            ballcount = 0;
        }

    }

    if (outcount === 3) {
        alert("3아웃! 공수 교체");
        defense = true;
        outcount = 0;
        strikecount = 0; 
        ballcount = 0;
        runnercount = 0;
    }

    if (runnercount>=3){
        if(defense){
            opponentteam_score+=1
        }
        else{
            myteam_score +=1
        }
        runnercount=0
    }

    updateScoreboard(myteam_score, opponentteam_score)
    updateCountDisplay(ballcount, strikecount, outcount);
    updateRunnerDisplay(); 

    isSwingMode = false;

    // 버튼 다시 활성화 => 다음 액션 선택 가능
    enableAllButtons();

}



// ============== 3) 주자 도루 ==============
function handleSteal() {
    disableAllButtons();

    if (runnercount > 0) {
        // 간단히 50% 확률로 도루 성공/실패 예시
        const success = Math.random() < 0.5;
        if (success) {
            alert("도루 성공! 주자 한 명 진루.");
            runnercount++; 
            // 예: 3루 주자가 도루 성공해 득점? 규칙은 원하는대로
            if (runnercount > 3) {
                runnercount = 3;
            }
        } else {
            alert("도루 실패! 주자 아웃.");
            outcount++;
            if (outcount >= 3) {
                alert("3아웃! 공수 교체");
                outcount = 0;
                runnercount = 0;
            }
        }
    } else {
        alert("주자가 없습니다! 도루 불가능");
    }
    updateRunnerDisplay(); 
    updateCountDisplay(ballcount, strikecount, outcount);
    // 투구 종료
    enableAllButtons();
}



// ======================
// 화면에 B/S/O 표시 갱신
// ======================
function updateCountDisplay(balls, strikes, outs) {
    count.innerText = `B: ${balls} S: ${strikes} O: ${outs}`;
}

function updateScoreboard(myteam_score, opponentteam_score) {
    score.innerText = `${myteam_score} - ${opponentteam_score}`;
}


function updateRunnerDisplay() {
    // runnerSlot1, runnerSlot2, runnerSlot3를 가져온다
    const slot1 = document.getElementById("runnerSlot1");
    const slot2 = document.getElementById("runnerSlot2");
    const slot3 = document.getElementById("runnerSlot3");

    // 모두 초기화 (filled 제거)
    slot1.classList.remove("filled");
    slot2.classList.remove("filled");
    slot3.classList.remove("filled");

    // runnercount값에 따라 순서대로 filled 적용
    if (runnercount >= 1) slot1.classList.add("filled");
    if (runnercount >= 2) slot2.classList.add("filled");
    if (runnercount >= 3) slot3.classList.add("filled");
}


