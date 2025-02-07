
![0 005](https://github.com/user-attachments/assets/3cc590ee-6697-424e-b9fc-e20959e8163c)


## 0. Dataset Overview
The dataset is crawled from statiz(https://statiz.sporki.com/player/) and KBO(https://www.koreabaseball.com/Record/Player/HitterBasic/Situation.aspx), focusing on categories like pitch mechanics and zones. 

Below are the examples of dataset

### 1. preprocessed_hitmodel_data_ballcount_df_csv

```
preprocessed_hitmodel_data_ballcount_df:{height: 180, lp_or_rp: 'R', pitch_mechanic: 0.0, more_strike:1, more_ball: 0, same_strike_ball:0, zone1:1.8, zone2:1.5,}
```

### 2. preprocessed_df_BallCount.csv
```
{lh_or_rh:1 ,height:183.0,bc:0,1:0.000,2:0.75,3:0.200,4:0.667,5:0.250,6:0.000,7:0.300, 8:0.356, 9:0.120, 10: 1.000 ,11: 0.15,12:0.154,13:0.333,14:0.150 ,15:0.333,16:0.120, 17:0.750, 18:0.333, 19:0.500, 20:0.100, 21:0.000, 22:0.111, 23:0.150, 24:0.000, 25:0.400
}
```

## 2. Environment Setup
For venv users
```
python3.11 -m venv .ohtani
source .ohtani/bin/activate
pip3 install numpy==1.26.4 pandas==2.2.2 tensorflow==2.18.0 keras==3.8.0 scikit-learn==1.6.1
pip3 install fastapi uvicorn
```

For conda users
```
conda create -n ohtani python==3.11
conda activate ohtani
pip3 install numpy==1.26.4 pandas==2.2.2 tensorflow==2.18.0 keras==3.8.0 scikit-learn==1.6.1
pip3 install fastapi uvicorn 
```


## 3. Training & Inference 

For training and inference, simply run each of the specified files listed below.
- Training: (파일명)
- Inference: (파일명)


## 4. Web page 
```
*Start Both Terminal!

#Terminal 1

(cd demo/web-demo)
npm start

  
#Terminal 2

(cd demo/backend)
uvicorn main:app --reload ( or python main.py )
```

## 5. Checkpoints
Google drive:



## 6. Members
김재영 Dataset preprocessing/augmentation, Model training, Model building<br>
문재원 Dataset preprocessing, Model Training, Web Setting<br>
이민석 Dataset preprocessing, Model Training, Web Setting<br>
