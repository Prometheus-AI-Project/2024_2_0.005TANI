from fastapi import APIRouter, HTTPException, Form, File, UploadFile, BackgroundTasks
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from pathlib import Path

from static.html_templates import get_main_page_html, show_team_info, ingame_html
import os
from typing import Optional, List
from pydantic import BaseModel, Field
from core.model_runner import hitter_model, pitcher_model
from core.feat import hitter_inform
import asyncio

router = APIRouter()


my_team_data = ''
opponent_team_data = ''

@router.get("/", response_class=HTMLResponse)
async def main_page():
    try:
        html_content = get_main_page_html()
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# 요청 데이터 모델
class PitchData(BaseModel):
    pitchForm: str = Field(..., example="좌투")  # 우투,좌투
    pitchType: str = Field(..., example="직구")  # 구종
    pitcherHeight: int = Field(..., example=12, ge=1, le=200)
    zone: int = Field(..., example=12, ge=1, le=25)  # 투구 영역 (0-24)
    awayTeam: str = Field(..., example="키움")  # 어웨이 팀 이름
    hitterOrder : int = Field(..., example=1, ge=1, le=9)
    outs: int = Field(..., example=0, ge=0, le=2)  # 아웃 카운트 (0-2)
    strikes: int = Field(..., example=0, ge=0, le=2)  # 스트라이크 카운트 (0-2)
    balls: int = Field(..., example=0, ge=0, le=3)  # 볼 카운트 (0-3)
    runners : int = Field(..., example=0, ge=0, le=3) # 주자 진후 (0-3)




#플레이어 투구 처리 엔드포인트
@router.post("/api/pitch")
async def process_pitch(data: PitchData):
    global pitch_result_data
    # 데이터 확인 (로그 출력)
    print(f"Received pitch data: {data}")
    try:
        # 예시: 요청 데이터 검증 및 처리
        if data.zone < 0 or data.zone > 24:
            raise HTTPException(status_code=400, detail="Invalid zone value. Must be between 0 and 24.")
        
        lh_or_rh, height = hitter_inform(data.awayTeam, data.hitterOrder)#현재 상대 타자 정보 가져오기
        
        pitch_result = "hit"  # 실제 로직으로 교체 필요
        return pitch_result
        
    except Exception as e:
        # 에러 처리 및 클라이언트로 반환
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



#투수 모델 정보 (for ai 보조)
@router.post("/api/pitch_ai")
async def process_pitch(data: PitchData):

    # 데이터 확인 (로그 출력)
    print(f"Received pitch data: {data}")
    try:
        # 예시: 요청 데이터 검증 및 처리
        if data.zone < 0 or data.zone > 24:
            raise HTTPException(status_code=400, detail="Invalid zone value. Must be between 0 and 24.")
        
        lh_or_rh, height = hitter_inform(data.awayTeam, data.hitterOrder)#상대 타자 좌타, 우타 정보 가져오기
        
        pitch_result = pitcher_model(data.pitcherHeight, data.pitchForm, lh_or_rh, data.strikes, data.balls, data.runners)

    except Exception as e:
        # 에러 처리 및 클라이언트로 반환
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


#투수 모델 정보 (for ai 보조)
@router.get("/api/pitch_ai/result")
async def get_pitch_result():
    # 예제 데이터 반환
    
    result  = [
    0.300, 0.250, 0.275, 0.310, 0.200,
    0.400, 0.300, 0.280, 0.250, 0.320,
    0.220, 0.270, 0.260, 0.290, 0.310,
    0.230, 0.240, 0.210, 0.280, 0.350,
    0.260, 0.270, 0.200, 0.300, 0.250,
    ]
    
    return result

