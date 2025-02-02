
import json
import random

teamname_convert ={ '기아 타이거즈' : 'KIA','삼성 라이온즈' : 'SAMSUNG', 'LG 트윈스' : 'LG', '두산 베어스' : 'DOOSAN','KT' : 'KT','SSG 랜더스' : 'SSG','롯데 자이언츠' : 'LOTTE', '한화 이글스' : 'HANWHA','NC 다이노스' : 'NC', '키움 히어로즈' : 'KIWOOM'}

strike_zones = [7,8,9,12,13,14,15,17,18,19]

def hitter_inform(team_inform, hitter_order):#팀, 타자의 타순 정보 입력 받아 타자 정보 리턴
    
    with open('./data/player_data.json', 'r', encoding='UTF8') as f:
            json_data = json.load(f)
    for team in json_data["teams"]:
        if team["name"] == teamname_convert[team_inform]:
            hand = team["hitter"][hitter_order]["hand"]
            height = team["hitter"][hitter_order]["height_cm"]
            return hand, height
    
def pitcher_inform(team_inform):
    with open('./data/player_data.json', 'r', encoding='UTF8') as f:
            json_data = json.load(f)
    for team in json_data["teams"]:
        if team["name"] == teamname_convert[team_inform]:
            hand = team["pitcher"][0]["hand"]   
            return hand
        

def pitch_model_result(pitcher_model_top3, hit_percentage, player_pick):# 플레이어가 투수일 때 작동 함수
    # "pitcher_model_top3" : 투수 모델 inference 결과 최종 가장 확률 높은 세개 구역 (ex, [17, 3, 10] )(*1~25라고 가정정)
    # "hit_percentage" : 타자 출루율 정보 (ex, [0.123, 0.32, .....] )
    # "player_pick" : 플레이어가 선택한 구역
    global strike_zones
    
    
    foul_probability = 0.3
    foul_to_out_probability =  0.2
    
    hit_strikes, hit_ball =  check_hitzone(player_pick)
    
    if player_pick in strike_zones:#플레이어 픽 == 스트라이크 존 
        if player_pick in pitcher_model_top3:# homerun 처리
            result = check_probability(hit_percentage[player_pick-1]) #출루율 적용
            if result:
                return "homerun" 
            else:
                is_foul = check_probability(foul_probability)
                if is_foul:
                    is_foul_to_out = check_probability(foul_to_out_probability)
                    if is_foul_to_out:
                        return "out"
                    else:
                        return "foul"
                else:
                    return "strike"
                
        else:
            hit_strike_zones = list(set(pitcher_model_top3) & set(hit_strikes))
            hit_ball_zones = list(set(pitcher_model_top3) & set(hit_ball))
            
            if len(hit_strike_zones)>0:#안타 처리, pitcher_model_top3 == 십자가 strike zone 
                hit_strike_zones[0]
                result = check_probability(hit_percentage[hit_strike_zones[0]-1]) #출루율 적용
                if result:
                    return "hit" 
                else:
                    is_foul = check_probability(foul_probability)
                    if is_foul:
                        is_foul_to_out = check_probability(foul_to_out_probability)
                        if is_foul_to_out:
                            return "out"
                        else:
                            return "foul"
                    else:
                        return "strike"
            elif len(hit_ball_zones)>0:#안타 처리, pitcher_model_top3 == 십자가 ball zone 
                return "ball"
            
            else:#stike
                return "strike"
    else : #플레이어 픽 == ball 존
        if player_pick in pitcher_model_top3:# ball 처리
            return "ball"
        else:
            hit_strike_zones = list(set(pitcher_model_top3) & set(hit_strikes))
            hit_ball_zones = list(set(pitcher_model_top3) & set(hit_ball))
            if len(hit_strike_zones)>0:# ball 처리, pitcher_model_top3 == 십자가 strike zone 
                result = check_probability(hit_percentage[hit_strike_zones[0]-1]) #출루율 적용
                if result:
                    return "hit" 
                else:
                    is_foul = check_probability(foul_probability)
                    if is_foul:
                        is_foul_to_out = check_probability(foul_to_out_probability)
                        if is_foul_to_out:
                            return "out"
                        else:
                            return "foul"
                    else:
                        return "strike"
            else:
                return "ball"
            
            
            
def check_probability(probability):
    """
    probability: 발생 확률 (0 ~ 1 사이의 값, 예: 0.347 -> 34.7%)
    return: True(성공), False(실패)
    """
    random_value = random.random()  # 0.0 ~ 1.0 사이 난수 생성
    return random_value < probability

def check_hitzone(zone):#십자가 위치 -> 스트라이크, 볼 위치 판단
    
    global strike_zones
    
    pos_strike = []
    pos_ball = []
    
    if zone-5>0:#하단 위치 판단
        if zone-5 in strike_zones:
            pos_strike.append(zone-5)
        else:
            pos_ball.append(zone-5)
    if (zone)%5!=1:#좌측 위치 판단
        if zone-1 in strike_zones:
            pos_strike.append(zone-1)
        else:
            pos_ball.append(zone-1)
    if (zone)%5!=0:#우측 위치 판단
        if zone+1 in strike_zones:
            pos_strike.append(zone+1)
        else:
            pos_ball.append(zone+1)
    if zone+5<26:#상단 위치 판단
        if zone+5 in strike_zones:
            pos_strike.append(zone+5)
        else:
            pos_ball.append(zone+5) 
    return pos_strike, pos_ball

def bat_model_result(pitcher_model_top3, hit_percentage, player_pick):# 플레이어가 타자일 때 작동 함수
    
    global strike_zones
    
    hit_strikes, hit_ball =  check_hitzone(pitcher_model_top3[0])#모델 예측 top1 부터 내림차순이라는 가정
    
    if player_pick in strike_zones:#타자 휘두른 경우
        if player_pick in pitcher_model_top3:#정확히 일치하는 경우 -> homerun
            result = check_probability(hit_percentage[player_pick-1]) #출루율 적용
            if result:
                return "homerun" 
            else:
                return "foul"
        elif player_pick in hit_strikes:#top 1 십자가, strike -> 안타타
            result = check_probability(hit_percentage[pitcher_model_top3[0]-1]) #출루율 적용
            if result:
                return "hit" 
            else:
                return "foul"
        else:
            return "strike"
    else:#타자 안 휘두른 경우
        if pitcher_model_top3[0] in strike_zones:
            return "strike"
        else:
            return "ball"
    