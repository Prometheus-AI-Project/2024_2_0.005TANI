from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

# Create a FastAPI instance
app = FastAPI()
#app.mount("/static", StaticFiles(directory="static"), name="static")


# Define a Pydantic model for request body validation
class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None

# Root endpoint
@app.get("/")
def get_main_page_html():
    html_content = f""""""
    return html_content


@app.get("/")
def get_main_page_html():
    html_content = f"""
    <html>
        <body>
            <br> <hr>
            <form action="/submit-info" method="post" onsubmit="return validateForm()">
                <label for="my_team">본인 팀을 선택하세요!:</label>
                <select name="my_team" id="my_team">
                    <option value="KIA">기아</option>
                    <option value="SAMSUNG">삼성</option>
                    <option value="LG">LG</option>
                    <option value="DOOSAN">두산</option>
                    <option value="KT">KT</option>
                    <option value="SSG">SSG</option>
                    <option value="LOTTE">롯데</option>
                    <option value="HANWHA">한화</option>
                    <option value="NC">NC</option>
                    <option value="KIWOOM">키움</option>
                </select>
                <br><br>
                <label for="opponent_team">상대 팀을 선택하세요!:</label>
                <select name="opponent_team" id="opponent_team">
                    <option value="KIA">기아</option>
                    <option value="SAMSUNG">삼성</option>
                    <option value="LG">LG</option>
                    <option value="DOOSAN">두산</option>
                    <option value="KT">KT</option>
                    <option value="SSG">SSG</option>
                    <option value="LOTTE">롯데</option>
                    <option value="HANWHA">한화</option>
                    <option value="NC">NC</option>
                    <option value="KIWOOM">키움</option>
                </select>
                <br><br>
                <label for="pitcher_height">투수 키 (cm):</label>
                <input type="number" id="pitcher_height" name="pitcher_height" required>
                <br><br>
                <label for="pitcher_hand">우투/좌투 선택:</label>
                <select name="pitcher_hand" id="pitcher_hand">
                    <option value="Right">우투</option>
                    <option value="Left">좌투</option>
                </select>
                <br><br>
                <button type="submit">Submit</button>
            </form>
            
            <script>
                function validateForm() {{
                    const myTeam = document.getElementById('my_team').value;
                    const opponentTeam = document.getElementById('opponent_team').value;

                    if (myTeam === opponentTeam) {{
                        alert('본인 팀과 상대 팀이 동일합니다! 서로 다른 팀을 골라주세요.');
                        return false;
                    }}
                    return true;
                }}
            </script>
        </body>
    </html>
    """
    return html_content


def show_team_info(my_team_data, opponent_team_data):
    try:
        html_content = f"""
        <html>
            <body>
                <br> <hr>
                <h1>MY Team: {my_team_data.get('name', 'Unknown Team')}</h1>

                <h2>Pitcher</h2>
                <ul>
                    {''.join([f'<li>Name: {pitcher.get("name", "Unknown")} | Position: {pitcher.get("position", "Unknown")} | Height: {pitcher.get("height_cm", "Unknown")} cm | Hand: {pitcher.get("hand", "Unknown")}</li>' for pitcher in my_team_data.get('pitcher', [])])}
                </ul>

                <h2>Hitters</h2>
                <ul>
                    {''.join([f'<li>Name: {hitter.get("name", "Unknown")} | Position: {hitter.get("position", "Unknown")} | Height: {hitter.get("height_cm", "Unknown")} cm | Hand: {hitter.get("hand", "Unknown")}</li>' for hitter in my_team_data.get('hitter', [])])}
                </ul>
                
                <br> <hr>
                <h1>Opponent Team: {opponent_team_data.get('name', 'Unknown Team')}</h1>

                <h2>Pitcher</h2>
                <ul>
                    {''.join([f'<li>Name: {pitcher.get("name", "Unknown")} | Position: {pitcher.get("position", "Unknown")} | Height: {pitcher.get("height_cm", "Unknown")} cm | Hand: {pitcher.get("hand", "Unknown")}</li>' for pitcher in opponent_team_data.get('pitcher', [])])}
                </ul>

                <h2>Hitters</h2>
                <ul>
                    {''.join([f'<li>Name: {hitter.get("name", "Unknown")} | Position: {hitter.get("position", "Unknown")} | Height: {hitter.get("height_cm", "Unknown")} cm | Hand: {hitter.get("hand", "Unknown")}</li>' for hitter in opponent_team_data.get('hitter', [])])}
                </ul>
                
                <button onclick="location.href='/startgame'">Start Game</button>
                
                
            </body>
        </html>
        """
        return html_content
    except Exception as e:
        return f"<html><body><h1>Error generating HTML</h1><p>{str(e)}</p></body></html>"



def ingame_html(my_team_data, opponent_team_data):
    
    my_team_name = my_team_data["name"]
    opponent_team_name = opponent_team_data["name"] 
    my_team_score = 0
    opponent_team_score = 0
    balls = 0
    strikes = 0
    outs = 0
    html_content = f"""
        <html>
        <head>
            <meta charset="utf-8" />
            <link rel="stylesheet" href="/static/css/ingame_styles.css" />
        </head>
        <body>
            
            <div id="scoreboard">
                <div id="inning">9회초</div>
                <div class="team" id="team1">{str(my_team_name)}</div>
                <div class="score" id="score">7 - 7</div>
                <div class="team" id="team2">{str(opponent_team_name)}</div>
                <div class="count" id="count">B: 0 S: 0 O: 0</div>
            </div>
            
            <div id="runnerIndicator">
                <!-- runnerSlot1, runnerSlot2, runnerSlot3를 각각 채울 수도 있고,
                    실제 야구 규칙에 맞춰 1루, 2루, 3루 식으로 표현할 수도 있음 -->
                <div class="runnerSlot" id="runnerSlot1"></div>
                <div class="runnerSlot" id="runnerSlot2"></div>
                <div class="runnerSlot" id="runnerSlot3"></div>
            </div>
            
            <div id="actionChoices" style="margin:20px;">
                <button id="noSwingBtn">안 치기</button>
                <button id="swingBtn">치기</button>
                <!--<button id="stealBtn">주자 도루</button>-->
            </div>
            
            
            <div id="strikeZoneContainer">
                <table class="strikeZoneTable">
                    <tbody>
                    <!-- 1행 -->
                    <tr>
                        <td data-zone="21"></td>
                        <td data-zone="22"></td>
                        <td data-zone="23"></td>
                        <td data-zone="24"></td>
                        <td data-zone="25"></td>
                    </tr>
                    <!-- 2행 -->
                    <tr>
                        <td data-zone="16"></td>
                        <td data-zone="17"  class="middleZone"></td>
                        <td data-zone="18"  class="middleZone"></td>
                        <td data-zone="19"  class="middleZone"></td>
                        <td data-zone="20"></td>
                    </tr>
                    <!-- 3행 -->
                    <tr>
                        <td data-zone="11"></td>
                        <td data-zone="12"  class="middleZone"></td>
                        <td data-zone="13"  class="middleZone"></td>
                        <td data-zone="14"  class="middleZone"></td>
                        <td data-zone="15"></td>
                    </tr>
                    <!-- 4행 -->
                    <tr>
                        <td data-zone="6"></td>
                        <td data-zone="7"  class="middleZone"></td>
                        <td data-zone="8"  class="middleZone"></td>
                        <td data-zone="9"  class="middleZone"></td>
                        <td data-zone="10"></td>
                    </tr>
                    <!-- 5행 -->
                    <tr>
                        <td data-zone="1"></td>
                        <td data-zone="2"></td>
                        <td data-zone="3"></td>
                        <td data-zone="4"></td>
                        <td data-zone="5"></td>
                    </tr>
                    </tbody>
                </table>
            </div>
            
            
            
            <script src="/static/js/ingame.js"></script>
        </body>
        
        </html>
    """
    return html_content