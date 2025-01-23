from fastapi import FastAPI
from api import endpoints
import uvicorn
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 또는 특정 도메인 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)



app.include_router(endpoints.router)

"""if __name__ == "__main__":
    
    uvicorn.run(app, host="192.168.45.135", port=8000)""" 
    
app.mount("/static", StaticFiles(directory="static"), name="static")

# 여기서 endpoints 라우터를 include 하거나, 직접 등록
from api.endpoints import router
app.include_router(router)

if __name__ == '__main__':
    uvicorn.run('main:app', reload=True)