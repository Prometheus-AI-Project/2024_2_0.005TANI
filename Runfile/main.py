from fastapi import FastAPI
from api import endpoints
import uvicorn
from fastapi.staticfiles import StaticFiles
app = FastAPI()

app.include_router(endpoints.router)

"""if __name__ == "__main__":
    
    uvicorn.run(app, host="192.168.45.135", port=8000)""" 
    
app.mount("/static", StaticFiles(directory="static"), name="static")

# 여기서 endpoints 라우터를 include 하거나, 직접 등록
from api.endpoints import router
app.include_router(router)

if __name__ == '__main__':
    uvicorn.run('main:app', reload=True)