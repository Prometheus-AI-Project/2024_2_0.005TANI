(판넬 사진)


## 0. Dataset Overview
The dataset is crawled from Musinsa, focusing on categories like hoodies, coats, and jeans. Using the crawled data, we generated descriptive captions with GPT-40 Mini.

The dataset is structured in the format (snapshot, product image, descriptive caption) to align with the FashionIQ dataset, which is commonly used for model training in fashion-related tasks.

Dataset has the following structure:

```
project_base_path
└───  fashionIQ_dataset
      └─── captions
            | cap.dress.test.json
            | cap.dress.train.json
            | cap.dress.val.json
            | ...
            
      └───  images
            | B00006M009.jpg
            | B00006M00B.jpg
            | B00006M6IH.jpg
            | ...
            
      └─── image_splits
            | split.dress.test.json
            | split.dress.train.json
            | split.dress.val.json
            | ...
```


## 1. Make Dataset
1. Crawling the dataset



2. After generating captions using GPT, structure the dataset





## 2. Environment Setup
For venv users
```
python3.10 -m venv .MIXXX
source .MIXXX/bin/activate
pip3 install fastapi uvicorn   <- 이렇게 하던지, 아니면 requirements.txt를 만들던지. 
```

For conda users
```
conda create -n MIXXX python==3.10
conda create MIXXX
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
#Terminal 1
npm start

  
#Terminal 2
uvicorn main:app --reload 
```

## 6. Checkpoints
Google drive:



## 7. Acknowledgement
Our implementation and development is based on [https://github.com/chunmeifeng/SPRC]


## 8. Members
