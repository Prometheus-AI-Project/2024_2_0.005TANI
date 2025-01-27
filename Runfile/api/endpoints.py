from fastapi import APIRouter, HTTPException, Form, File, UploadFile, BackgroundTasks
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from pathlib import Path
import json
from static.html_templates import get_main_page_html, show_team_info, ingame_html
import os
from typing import Optional, List

router = APIRouter()
#선수 정보 담은 json 파일 전역으로 선언 
with open('./data/player_data.json', 'r', encoding='UTF8') as f:
        json_data = json.load(f)
        
def get_team_info(team_name):
        for team in json_data["teams"]:
            if team["name"] == team_name:
                return team
        return None

my_team_data = ''
opponent_team_data = ''

@router.get("/", response_class=HTMLResponse)
async def main_page():
    try:
        html_content = get_main_page_html()
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to handle form submission
@router.post("/submit-info")
def submit_info(my_team: str = Form(...), opponent_team: str = Form(...), pitcher_height: int = Form(...), pitcher_hand: str = Form(...)):
    
    #전역 변수 받아오기
    global my_team_data
    global opponent_team_data
    
    my_team_data = get_team_info(my_team)
    if my_team_data:
    # pitcher 데이터가 있는지 확인
        if "pitcher" in my_team_data and my_team_data["pitcher"]:
            # 첫 번째 pitcher의 세부 정보 수정
            my_team_data["pitcher"][0]["height_cm"] = pitcher_height
            my_team_data["pitcher"][0]["hand"] = pitcher_hand
        else:
            print("No pitcher data available in the team.")
    else:
        print(f"Team '{my_team}' not found in the data.")
        
        
    opponent_team_data = get_team_info(opponent_team)
    
    
    try:
        html_content = show_team_info(my_team_data, opponent_team_data)
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to handle form submission
@router.get("/startgame")
def startgame():
    try:
        html_content = ingame_html(my_team_data, opponent_team_data)
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
