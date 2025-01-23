
import json

teamname_convert ={ '기아 타이거즈' : 'KIA','삼성 라이온즈' : 'SAMSUNG', 'LG 트윈스' : 'LG', '두산 베어스' : 'DOOSAN','KT' : 'KT','SSG 랜더스' : 'SSG','롯데 자이언츠' : 'LOTTE', '한화 이글스' : 'HANWHA','NC 다이노스' : 'NC', '키움 히어로즈' : 'KIWOOM'}


def hitter_lh_or_rh(team_inform, hitter_order):
        #선수 정보 담은 json 파일 전역으로 선언 
    with open('./data/player_data.json', 'r', encoding='UTF8') as f:
            json_data = json.load(f)
            
    for team in json_data["teams"]:
        if team["name"] == teamname_convert[team_inform]:
            return team[hitter_order]["hand"]
    