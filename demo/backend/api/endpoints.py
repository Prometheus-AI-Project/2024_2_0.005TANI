from fastapi import APIRouter, HTTPException, Form, File, UploadFile, BackgroundTasks
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from pathlib import Path

from static.html_templates import get_main_page_html, show_team_info, ingame_html
import os
from typing import Optional, List
from pydantic import BaseModel, Field
from core.model_runner import hitter_model, pitcher_model, pitcher_assistmodel
from core.feat import hitter_inform, pitcher_inform
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
    
    
# 플레이어 투구 시 데이터 모델
class PitchData(BaseModel):
    pitchHand: str = Field(..., example="좌투") # 우투,좌투
    pitchForm: str = Field(..., example="오버핸드")  #투구 폼
    pitchType: str = Field(..., example="직구")  # 구종
    pitcherHeight: int = Field(..., example=12, ge=1, le=200)
    zone: int = Field(..., example=12, ge=1, le=25)  # 투구 영역 (0-24)
    awayTeam: str = Field(..., example="키움")  # 어웨이 팀 이름
    hitterOrder : int = Field(..., example=1, ge=1, le=9)
    outs: int = Field(..., example=0, ge=0, le=2)  # 아웃 카운트 (0-2)
    strikes: int = Field(..., example=0, ge=0, le=2)  # 스트라이크 카운트 (0-2)
    balls: int = Field(..., example=0, ge=0, le=3)  # 볼 카운트 (0-3)
    runners : int = Field(..., example=0, ge=0, le=3) # 주자 진후 (0-3)

# 플레이어 보조 AI용 데이터 모델
class PitchAssistData(BaseModel):
    awayTeam: str = Field(..., example="키움")  # 어웨이 팀 이름
    hitterOrder : int = Field(..., example=1, ge=1, le=9)
    strikes: int = Field(..., example=0, ge=0, le=2)  # 스트라이크 카운트 (0-2)
    balls: int = Field(..., example=0, ge=0, le=3)  # 볼 카운트 (0-3)
    runners : int = Field(..., example=0, ge=0, le=3) # 주자 진후 (0-3)


# 플레이어 배팅 시 데이터 모델
class BatData(BaseModel):
    zone: int = Field(..., example=12, ge=1, le=25)  # 투구 영역 (0-24)
    awayTeam: str = Field(..., example="키움")  # 어웨이 팀 이름
    homeTeam: str = Field(..., example="삼성")  # 어웨이 팀 이름
    hitterOrder : int = Field(..., example=1, ge=1, le=9)
    outs: int = Field(..., example=0, ge=0, le=2)  # 아웃 카운트 (0-2)
    strikes: int = Field(..., example=0, ge=0, le=2)  # 스트라이크 카운트 (0-2)
    balls: int = Field(..., example=0, ge=0, le=3)  # 볼 카운트 (0-3)
    runners : int = Field(..., example=0, ge=0, le=3) # 주자 진후 (0-3)



#플레이어 투구 처리 엔드포인트
@router.post("/api/pitch")
async def process_pitch(data: PitchData):
    # 데이터 확인 (로그 출력)
    print(f"Received pitch data: {data}")
    try:
        # 예시: 요청 데이터 검증 및 처리
        if data.zone < 0 or data.zone > 24:
            raise HTTPException(status_code=400, detail="Invalid zone value. Must be between 0 and 24.")
        lh_or_rh, height = hitter_inform(data.awayTeam, data.hitterOrder)#현재 상대 팀 타자 정보(좌/우타, 키) 가져옴
        
        #이 부분에서 모델 수행하고 결과 받아옴. ( pitch_result 종류 : hit, strike, ball, foul, out )
        #pitch_result = pitcher_model(data.pitcherHeight, data.pitchHand, data.pitchForm, lh_or_rh, data.strikes, data.balls, data.runners)

        pitch_result = "out"  # 임시로 out 설정
        
        return pitch_result
        
    except Exception as e:
        # 에러 처리 및 클라이언트로 반환
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



#투수 모델 정보 (for ai 보조)
@router.post("/api/pitchAI")
async def process_pitch(data: PitchAssistData):

    # 데이터 확인 (로그 출력)
    print(f"Received pitch data: {data}")
    try:
        # 예시: 요청 데이터 검증 및 처리
       
        lh_or_rh, height = hitter_inform(data.awayTeam, data.hitterOrder)#상대 타자 좌타, 우타 정보 가져오기
        
        #zone_result = pitcher_assistmodel( lh_or_rh, height, data.strikes, data.balls, data.runners)
        
        #임시 값 할당
        zone_result = [0.1, 0.05, 0.2, 0.05, 0.0, 0.05, 0.1, 0.15, 0.1, 0.05, 
                 0.0, 0.05, 0.05, 0.05, 0.1, 0.1, 0.05, 0.05, 0.05, 0.0,
                 0.05, 0.1, 0.05, 0.0, 0.0]
        return zone_result
    except Exception as e:
        # 에러 처리 및 클라이언트로 반환
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")





@router.post("/api/bat")
async def process_bat(data: BatData):
    # 데이터 확인 (로그 출력)
    print(f"Received bat data: {data}")
    try:
        # 예시: 요청 데이터 검증 및 처리
        if data.zone < 0 or data.zone > 24:
            raise HTTPException(status_code=400, detail="Invalid zone value. Must be between 0 and 24.")
        
        lh_or_rh, height = hitter_inform(data.homeTeam, data.hitterOrder)#현재 본인 팀 타자 정보(좌/우타, 키) 가져옴
        
        pitch_form = pitcher_inform(data.awayTeam)
        
        #이 부분에서 모델 수행하고 결과 받아옴. ( pitch_result 종류 : hit, strike, ball, foul, out )
        #bat_result = hitter_model(data.zone, lh_or_rh, height,  pitch_form, data.outs, data.strikes, data.strikes, data.runners )#투구 종류도 인자로 들어가야 함.(투구 종류)

        
        bat_result = "out"  # 실제 로직으로 교체 필요
        #pitch_result 종류 : hit, strike, ball, foul, out
        return bat_result
        
    except Exception as e:
        # 에러 처리 및 클라이언트로 반환
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
