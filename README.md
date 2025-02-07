
![0 005](https://github.com/user-attachments/assets/3cc590ee-6697-424e-b9fc-e20959e8163c)


## 0. Dataset Overview
The dataset is crawled from statiz(https://statiz.sporki.com/player/) and KBO(https://www.koreabaseball.com/Record/Player/HitterBasic/Situation.aspx), focusing on categories like pitch mechanics and zones. 

Below are the examples of dataset

### 1. dataset 이름

```
pitch data:{"isbn": "0151686564", "text_reviews_count": "626", "series": [] }
```


## 1. Make Dataset
1. Crawling the dataset



2. After generating captions using GPT, structure the dataset





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


## 3. Training
```
python src/blip_fine_tune_2.py
```




## 4. Inference 
```sh
python src/blip_validate.py \
   --dataset {'CIRR' or 'FashionIQ'} \
   --blip-model-name {trained model name} \
   --model-path {for path} 
```



## 5. Web page 
```
*Start Both Terminal!

#Terminal 1

(cd demo/web-demo)
npm start

  
#Terminal 2

(cd demo/backend)
uvicorn main:app --reload ( or python main.py )
```

## 6. Checkpoints
Google drive:



## 7. Acknowledgement
Our implementation and development is based on [https://github.com/chunmeifeng/SPRC]


## 8. Members
김재영 Dataset preprocessing/augmentation, Model training, Model building<br>
문재원 Dataset preprocessing, Model Training, Web Setting<br>
이민석 Dataset preprocessing, Model Training, Web Setting<br>
