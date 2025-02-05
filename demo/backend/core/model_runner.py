import numpy as np
from .feat import pitch_model_result, bat_model_result
import os
import numpy as np
from tensorflow.python.keras.models import load_model
import tensorflow as tf
import pickle
#from tensorflow.python.keras.layers import InputLayer as OriginalInputLayer
from tensorflow.keras.layers import InputLayer as OriginalInputLayer

pitchType_to_num = {
    "투심":0,
    "포심":1,
    "커터":2,
    "커브":3,
    "슬라이더":4,
    "체인지업":5,
    "포크볼":6,
}

def load_dtype_policy(config):
    # 예: config == {'name': 'float32'}
    return tf.keras.mixed_precision.Policy(config['name'])



def pitcher_model(player_pick , pitcherHeight, pitchHand, pitchForm, pitchType, hitter_height, lh_or_rh,strikes, balls, runners):
    print("start pitcher_model")
    
    #좌투/우투 피처 세팅
    if pitchHand =="좌투": #좌투가 0인지 1인지 확실하지 않음
        lp_or_rp=0
    else:
        lp_or_rp =1
    
    #투구 폼 세팅
    if pitchForm == "오버핸드":
        pitchform = 0
    elif pitchForm == "쓰리쿼터":
        pitchform = 1
    else:
        pitchform = 2
        

    #볼카운트 모델 피처 세팅
    bc = 2
    if strikes>balls:
        bc=0
    elif strikes<balls:
        bc=1
    
    #주자 유뮤 모델 피처
    is_runner = 0
    if runners>0:
        is_runner=1
    
    #상대 타자 좌우타 모델 피처 세팅
    if lh_or_rh =="Right":
        lh_or_rh = 1
    else :
        lh_or_rh = 0
    
    pitchType_num = pitchType_to_num[pitchType]
    
    input_dict_forpitcher = {
        "height": pitcherHeight,
        "lp_or_rp": lp_or_rp,  # 1 = R, 0 = L (예시)
        "pitch_mechanic": pitchform,
        "lh_or_rh" : lh_or_rh,
        "is_runner": is_runner,
        "ballcount" : bc
    }

    
    pitcher_model_top3 = run_pitcher_model(input_dict_forpitcher, 'pitch_result')
    
    input_dict_forhitter = {
        "height": hitter_height,
        "hand": lh_or_rh,  # 1 = R, 0 = L (예시)
        "pitch_type(0-7)": pitchType_num,
        "pitch_mechanic": lp_or_rp,
        "is_runner": is_runner,
        "ballcount" : bc
    }
    
    hit_percentage = run_hitter_model(input_dict_forhitter, 'bat_result')
    
    #model inference
    
    
    #call result func
    #ex, 
    #pitcher_model_top3 = [17, 3, 23]
    
    
    
    #hit_percentage = [0.1, 0.05, 0.2, 0.05, 0.0, 0.05, 0.1, 0.15, 0.1, 0.05, 0.1, 0.15, 0.25, 0.15, 0.2, 0.2, 0.15, 0.25, 0.25, 0.1, 0.05, 0.1, 0.05, 0.1, 0.1]
    
    results = pitch_model_result(pitcher_model_top3, hit_percentage, player_pick)
    
    return results

def pitcher_assistmodel(lp_or_rp, lh_or_rh, height, strike, ball, runner):
    print("start pitcher_assistmodel")
    #볼카운트 모델 피처 세팅
    bc = 2
    if strike>ball:
        bc=0
    elif strike<ball:
        bc=1
    
    is_runner = 0
    if runner>0:
        is_runner=1

    if lp_or_rp =="Right":
        lp_or_rp=1
    else :
        lp_or_rp = 0
    
    
    
    #상대 타자 좌우타 모델 피처 세팅

    if lh_or_rh =="Right":
        lh_or_rh=1
    else :
        lh_or_rh = 0
        
    input_dict = {
        "height": height,
        "hand": lh_or_rh,
        "pitch_mechanic": lp_or_rp,#hitter 모델 pitch_mechanic 피처 확인해야됨!!
        "is_runner": is_runner,
        "ballcount" : bc
    }
    
    
    

    avg_arr = run_hitter_model(input_dict, 'batai_result')
    
    
    # 다시 파이썬 리스트로 변환하여 반환
    return avg_arr.tolist() 
    


def run_pitcher_model(input_dict, mode):
    print("start run_pitcher_model")
    custom_objects = {'mse': tf.keras.losses.MeanSquaredError(),
                          #'InputLayer': CustomInputLayer,
                          #'DTypePolicy': lambda **kwargs: Policy(kwargs['name'])
                          }
    
    
    checkpoint_hitter    = "./checkpoints/pitcher/checkpoint/hitter_lh_or_rh_checkpoint.keras"
    checkpoint_ballcount = "./checkpoints/pitcher/checkpoint/hitter_BallCount_checkpoint.keras"
    checkpoint_runner   = "./checkpoints/pitcher/checkpoint/hitter_runner_checkpoint.keras"
    model_5 = tf.keras.models.load_model(checkpoint_ballcount, custom_objects=custom_objects)
    model_6 = tf.keras.models.load_model(checkpoint_hitter,   custom_objects=custom_objects)
    model_7 = tf.keras.models.load_model(checkpoint_runner,    custom_objects=custom_objects)


    with open('./checkpoints/pitcher/scaler/scaler_X_hit_ballcount.pkl', 'rb') as f:
        scaler_X_5 = pickle.load(f)
    with open('./checkpoints/pitcher/scaler/scaler_X_hit_lh_or_rh.pkl', 'rb') as f:
        scaler_X_6 = pickle.load(f)
    with open('./checkpoints/pitcher/scaler/scaler_X_hit_runner.pkl', 'rb') as f:
        scaler_X_7 = pickle.load(f)

    input_cols_5 = ["height", "lp_or_rp", "pitch_mechanic","ballcount" ]
    input_cols_6 = ["height", "lp_or_rp", "pitch_mechanic","lh_or_rh"]
    input_cols_7 = ["height", "lp_or_rp", "pitch_mechanic","is_runner"]

    # zone 이름
    zone_cols = [f"zone{i}" for i in range(1, 26)]

    preds = []

    y_pred_5 = predict_zones_single_sample(
        model=model_5,
        scaler_X=scaler_X_5,
        input_dict=input_dict,
        input_cols=input_cols_5
    )
    preds.append(y_pred_5)

    y_pred_6 = predict_zones_single_sample(
        model=model_6,
        scaler_X=scaler_X_6,
        input_dict=input_dict,
        input_cols=input_cols_6
    )
    preds.append(y_pred_6)

    y_pred_7 = predict_zones_single_sample(
        model=model_7,
        scaler_X=scaler_X_7,
        input_dict=input_dict,
        input_cols=input_cols_7
    )
    preds.append(y_pred_7)
        
    preds = np.array(preds) 
    avg_pred = preds.mean(axis=0)
    
     
    if mode == "pitch_model":
        top_3_indices = np.argsort(avg_pred)[-3:][::-1]
        return top_3_indices
    else:
        return avg_pred



#=================About hitter model=======================
#hitter model 데이터 크롤링 방식
"""
"우투": 0, "좌투": 1,
"우타": 1, "좌타": 0,
"주자없음":0, "주자있음": 1,
"스트라이크 > 볼" : 0, "볼 > 스트라이크" : 1, "스트라이크 = 볼" : 2
"""

def hitter_model(player_pick, hitter_height, lh_or_rh, pitcher_height, lp_or_rp, strike, ball, runner):
    
    print("start hitter_model")
    
    bc = 2
    if strike>ball:
        bc=0
    elif strike<ball:
        bc=1
    
    is_runner = 0
    if runner>0:
        is_runner=1

    if lp_or_rp =="Left":
        lp_or_rp=1
    else :
        lp_or_rp = 0
    
    
    
    #상대 타자 좌우타 모델 피처 세팅

    if lh_or_rh =="Right":
        lh_or_rh=1
    else :
        lh_or_rh = 0
    
    input_dict_forpitcher = {
        "height": pitcher_height,
        "lp_or_rp": lp_or_rp,  # 1 = R, 0 = L (예시)
        "pitch_mechanic": 0,
        "lh_or_rh" : lh_or_rh,
        "is_runner": is_runner,
        "ballcount" : bc
    }

    
    pitcher_model_top3 = run_pitcher_model(input_dict_forpitcher, 'pitch_result')
    
    
    input_dict_forhitter = {
        "height": hitter_height,
        "hand": lh_or_rh,  # 1 = R, 0 = L (예시)
        "pitch_mechanic": lp_or_rp,
        "is_runner": is_runner,
        "ballcount" : bc
    }

    hit_percentage = run_hitter_model(input_dict_forhitter, 'batai_result')
    
    
    results = bat_model_result(pitcher_model_top3, hit_percentage, player_pick)
    
    
    
    return results
    



def hitter_assistmodel(lh_or_rh,  pitcher_height,  lp_or_rp, strike, ball, runner ):
    print("start hitter_assistmodel")
    
    bc = 2
    if strike>ball:
        bc=0
    elif strike<ball:
        bc=1
    
    is_runner = 0
    if runner>0:
        is_runner=1

    if lp_or_rp =="Left":
        lp_or_rp=1
    else :
        lp_or_rp = 0
    
    
    
    #상대 타자 좌우타 모델 피처 세팅

    if lh_or_rh =="Right":
        lh_or_rh=1
    else :
        lh_or_rh = 0
    
    input_dict_forpitcher = {
        "height": pitcher_height,
        "lp_or_rp": lp_or_rp,  # 1 = R, 0 = L (예시)
        "pitch_mechanic": 0,
        "lh_or_rh" : lh_or_rh,
        "is_runner": is_runner,
        "ballcount" : bc
    }

    
    ave = run_pitcher_model(input_dict_forpitcher, 'pitcai_result')
    

    if isinstance(ave, np.ndarray):
        ave = ave.tolist()
    
    return ave
    


def run_hitter_model(input_dict, mode):
    print("start run_hitter_model")
    
    if  mode == 'bat_result':
        custom_objects = {'mse': tf.keras.losses.MeanSquaredError(),
                          #'InputLayer': CustomInputLayer,
                          #'DTypePolicy': lambda **kwargs: Policy(kwargs['name'])
                          }

        # -----------------------------
        # (2) 체크포인트(모델) 파일 경로
        # -----------------------------
        checkpoint_pitchtype = "./checkpoints/hitter/checkpoint/Pitchtype_checkpoint.keras"
        checkpoint_pitcher   = "./checkpoints/hitter/checkpoint/Pitcher_checkpoint.keras"
        checkpoint_runner    = "./checkpoints/hitter/checkpoint/Runner_checkpoint.keras"
        checkpoint_ballcount = "./checkpoints/hitter/checkpoint/BallCount_checkpoint.keras"

        # -----------------------------
        # (3) 모델 로드
        # -----------------------------
        model_1 = tf.keras.models.load_model(checkpoint_pitchtype, custom_objects=custom_objects)
        model_2 = tf.keras.models.load_model(checkpoint_pitcher,   custom_objects=custom_objects)
        model_3 = tf.keras.models.load_model(checkpoint_runner,    custom_objects=custom_objects)
        model_4 = tf.keras.models.load_model(checkpoint_ballcount, custom_objects=custom_objects)

        with open('./checkpoints/hitter/scaler/scaler_X_pitchtype.pkl', 'rb') as f:
            scaler_X_1 = pickle.load(f)
        with open('./checkpoints/hitter/scaler/scaler_X_pitcher.pkl', 'rb') as f:
            scaler_X_2 = pickle.load(f)
        with open('./checkpoints/hitter/scaler/scaler_X_runner.pkl', 'rb') as f:
            scaler_X_3 = pickle.load(f)
        with open('./checkpoints/hitter/scaler/scaler_X_ballcount.pkl', 'rb') as f:
            scaler_X_4 = pickle.load(f)

        
        input_cols_1 = ["height", "hand", "pitch_type(0-7)"]
        input_cols_2 = ["height", "hand", "pitch_mechanic"]
        input_cols_3 = ["height", "hand", "is_runner"]
        input_cols_4 = ["height", "hand", "ballcount"]

        # zone 이름
        zone_cols = [f"zone{i}" for i in range(1, 26)]

        preds = []

        y_pred_1 = predict_zones_single_sample(
            model=model_1,
            scaler_X=scaler_X_1,
            input_dict=input_dict,
            input_cols=input_cols_1
        )
        preds.append(y_pred_1)

        y_pred_2 = predict_zones_single_sample(
            model=model_2,
            scaler_X=scaler_X_2,
            input_dict=input_dict,
            input_cols=input_cols_2
        )
        preds.append(y_pred_2)

        y_pred_3 = predict_zones_single_sample(
            model=model_3,
            scaler_X=scaler_X_3,
            input_dict=input_dict,
            input_cols=input_cols_3
        )
        preds.append(y_pred_3)

        y_pred_4 = predict_zones_single_sample(
            model=model_4,
            scaler_X=scaler_X_4,
            input_dict=input_dict,
            input_cols=input_cols_4
        )
        preds.append(y_pred_4)

        preds = np.array(preds) 
        avg_pred = preds.mean(axis=0) 
        
        
        return avg_pred
    
    else:#batai_result
        custom_objects = {'mse': tf.keras.losses.MeanSquaredError(),
                          #'InputLayer': CustomInputLayer,
                          #'DTypePolicy': lambda **kwargs: Policy(kwargs['name'])
                          }

        # -----------------------------
        # (2) 체크포인트(모델) 파일 경로
        # -----------------------------
        checkpoint_pitcher   = "./checkpoints/hitter/checkpoint/Pitcher_checkpoint.keras"
        checkpoint_runner    = "./checkpoints/hitter/checkpoint/Runner_checkpoint.keras"
        checkpoint_ballcount = "./checkpoints/hitter/checkpoint/BallCount_checkpoint.keras"

        # -----------------------------
        # (3) 모델 로드
        # -----------------------------
        model_2 = tf.keras.models.load_model(checkpoint_pitcher,   custom_objects=custom_objects)
        model_3 = tf.keras.models.load_model(checkpoint_runner,    custom_objects=custom_objects)
        model_4 = tf.keras.models.load_model(checkpoint_ballcount, custom_objects=custom_objects)

        with open('./checkpoints/hitter/scaler/scaler_X_pitcher.pkl', 'rb') as f:
            scaler_X_2 = pickle.load(f)
        with open('./checkpoints/hitter/scaler/scaler_X_runner.pkl', 'rb') as f:
            scaler_X_3 = pickle.load(f)
        with open('./checkpoints/hitter/scaler/scaler_X_ballcount.pkl', 'rb') as f:
            scaler_X_4 = pickle.load(f)

        
        input_cols_2 = ["height", "hand", "pitch_mechanic"]
        input_cols_3 = ["height", "hand", "is_runner"]
        input_cols_4 = ["height", "hand", "ballcount"]

        # zone 이름
        zone_cols = [f"zone{i}" for i in range(1, 26)]

        preds = []

     

        y_pred_2 = predict_zones_single_sample(
            model=model_2,
            scaler_X=scaler_X_2,
            input_dict=input_dict,
            input_cols=input_cols_2
        )
        preds.append(y_pred_2)

        y_pred_3 = predict_zones_single_sample(
            model=model_3,
            scaler_X=scaler_X_3,
            input_dict=input_dict,
            input_cols=input_cols_3
        )
        preds.append(y_pred_3)

        y_pred_4 = predict_zones_single_sample(
            model=model_4,
            scaler_X=scaler_X_4,
            input_dict=input_dict,
            input_cols=input_cols_4
        )
        preds.append(y_pred_4)

        preds = np.array(preds) 
        avg_pred = preds.mean(axis=0) 
        return avg_pred


def predict_zones_single_sample(model, scaler_X, input_dict, input_cols):
    # 입력 칼럼에 해당하는 값들을 순서대로 가져옴
    x_list = [input_dict[col] for col in input_cols]
    x_array = np.array(x_list).reshape(1, -1)

    # 스케일링
    x_scaled = scaler_X.transform(x_array)

    # 모델 예측 (출력 차원은 (1, 25)라고 가정)
    y_pred = model.predict(x_scaled)
    return y_pred.flatten()  # (25,)


